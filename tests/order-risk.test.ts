// Fiabilité client (doublons, retours, liste noire) et annulation des numéros bloqués.
import { describe, expect, it } from "vitest";
import { customerRisk, isPlausibleMaPhone, toE164 } from "../lib/order-risk";
import { cancelIfBlacklisted } from "../lib/blacklist";

const at = (h: number) => new Date(Date.UTC(2026, 9, 9, 12) + h * 3600_000).toISOString();
const base = { leadId: "l0", createdAt: at(0), phoneE164: "+212612345678" };

describe("numéros", () => {
  it("normalise au format +212", () => {
    expect(toE164("06 12 34 56 78")).toBe("+212612345678");
    expect(toE164("+212 6 12 34 56 78")).toBe("+212612345678");
    expect(toE164("00212612345678")).toBe("+212612345678");
    expect(toE164("612345678")).toBe("+212612345678");
  });
  it("reconnaît un numéro marocain plausible", () => {
    expect(isPlausibleMaPhone("+212612345678")).toBe(true);
    expect(isPlausibleMaPhone("+212712345678")).toBe(true);
    expect(isPlausibleMaPhone("+21261234")).toBe(false);
    expect(isPlausibleMaPhone("+33612345678")).toBe(false);
  });
});

describe("fiabilité client", () => {
  it("première commande : nouveau client", () => {
    const r = customerRisk({ ...base, history: [{ id: "l0", status: "NEW", created_at: at(0) }] });
    expect(r).toMatchObject({ level: "new", label: "Nouveau client", orders: 1 });
  });

  it("même numéro en moins de 48 h : doublon", () => {
    const r = customerRisk({
      ...base,
      history: [
        { id: "l0", status: "NEW", created_at: at(0) },
        { id: "l1", status: "NEW", created_at: at(-5) },
        { id: "l2", status: "DELIVERED", created_at: at(-24 * 30) },
      ],
    });
    expect(r).toMatchObject({ level: "duplicate", duplicates: 1 });
  });

  it("colis livrés sans retour : fiable", () => {
    const r = customerRisk({
      ...base,
      history: [
        { id: "l0", status: "NEW", created_at: at(0) },
        { id: "l1", status: "DELIVERED", created_at: at(-24 * 20) },
        { id: "l2", status: "DELIVERED", created_at: at(-24 * 60) },
      ],
    });
    expect(r).toMatchObject({ level: "trusted", delivered: 2 });
  });

  it("autant de retours que de livraisons : risqué", () => {
    const r = customerRisk({
      ...base,
      history: [
        { id: "l0", status: "NEW", created_at: at(0) },
        { id: "l1", status: "RETURNED", created_at: at(-24 * 10) },
        { id: "l2", status: "DELIVERED", created_at: at(-24 * 40) },
      ],
    });
    expect(r).toMatchObject({ level: "risky", returned: 1 });
  });

  it("numéro non marocain : douteux", () => {
    const r = customerRisk({ ...base, phoneE164: "+2126123", history: [] });
    expect(r).toMatchObject({ level: "risky", label: "Numéro douteux" });
  });

  it("liste noire : passe avant tout", () => {
    const r = customerRisk({
      ...base,
      history: [
        { id: "l0", status: "NEW", created_at: at(0) },
        { id: "l1", status: "NEW", created_at: at(-1) },
      ],
      blacklisted: { reason: "Refuse les colis" },
    });
    expect(r).toMatchObject({ level: "blocked", detail: "Numéro bloqué : Refuse les colis" });
  });
});

describe("annulation automatique d'un numéro bloqué", () => {
  function db(blocked: boolean, tableMissing = false) {
    const updates: any[] = [];
    const q = (table: string) => {
      const st: any = { op: "select", values: null };
      const chain: any = {
        select: () => chain,
        update: (v: any) => ((st.op = "update"), (st.values = v), chain),
        eq: () => chain,
        in: async () =>
          tableMissing
            ? { data: null, error: { code: "PGRST205" } }
            : { data: blocked ? [{ phone_e164: "+212612345678", reason: "Faux numéro" }] : [], error: null },
        maybeSingle: async () =>
          table === "orders"
            ? { data: { workspace_id: "w", lead_id: "l1" } }
            : { data: { id: "l1", phone_e164: "+212612345678", notes: null } },
        then: (res: any) => {
          if (st.op === "update") updates.push({ table, values: st.values });
          return Promise.resolve({ error: null }).then(res);
        },
      };
      return chain;
    };
    return { updates, s: { from: q } };
  }

  it("annule la commande d'un numéro en liste noire", async () => {
    const { s, updates } = db(true);
    expect(await cancelIfBlacklisted(s, "o1")).toBe(true);
    expect(updates[0].table).toBe("leads");
    expect(updates[0].values.status).toBe("CANCELLED");
    expect(updates[0].values.notes).toContain("Faux numéro");
  });

  it("ne touche pas une commande normale, ni sans table de liste noire", async () => {
    for (const [blocked, missing] of [
      [false, false],
      [true, true],
    ]) {
      const { s, updates } = db(blocked, missing);
      expect(await cancelIfBlacklisted(s, "o1")).toBe(false);
      expect(updates).toHaveLength(0);
    }
  });
});
