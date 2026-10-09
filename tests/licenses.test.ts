// Abonnements par clé d'activation : format des clés, calcul des périodes, activation unique.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateLicense,
  addMonths,
  daysLeft,
  generateLicenseCode,
  hashLicenseCode,
  LICENSE_OFFERS,
  nextPeriod,
  normalizeLicenseCode,
} from "../lib/licenses";

beforeEach(() => vi.stubEnv("LICENSE_KEY_SECRET", "secret-de-test"));
afterEach(() => vi.unstubAllEnvs());

describe("offres", () => {
  it("3, 6 et 12 mois à 599, 999 et 1 699 MAD", () => {
    expect(LICENSE_OFFERS.map((o) => [o.months, o.price])).toEqual([
      [3, 599],
      [6, 999],
      [12, 1699],
    ]);
  });
});

describe("format des clés", () => {
  it("génère LP-XXXX-XXXX-XXXX sans caractères ambigus", () => {
    for (let i = 0; i < 200; i++) {
      const c = generateLicenseCode();
      expect(c).toMatch(/^LP-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/);
      expect(normalizeLicenseCode(c)).toBe(c);
    }
  });

  it("accepte une saisie approximative (minuscules, espaces, sans tirets ni préfixe)", () => {
    expect(normalizeLicenseCode(" lp-ab2c 3d4e-f5g6 ")).toBe("LP-AB2C-3D4E-F5G6");
    expect(normalizeLicenseCode("AB2C3D4EF5G6")).toBe("LP-AB2C-3D4E-F5G6");
    expect(normalizeLicenseCode("LPAB2C3D4EF5G6")).toBe("LP-AB2C-3D4E-F5G6");
  });

  it("refuse un format faux", () => {
    for (const x of ["", "LP-1234", "LP-ABCD-EFGH-IJKL", "LP-AB2C-3D4E-F5G60", null])
      expect(normalizeLicenseCode(x)).toBeNull();
  });

  it("ne stocke qu'une empreinte, stable et secrète", () => {
    const h = hashLicenseCode("LP-AB2C-3D4E-F5G6");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("AB2C");
    expect(hashLicenseCode("LP-AB2C-3D4E-F5G6")).toBe(h);
    vi.stubEnv("LICENSE_KEY_SECRET", "autre");
    expect(hashLicenseCode("LP-AB2C-3D4E-F5G6")).not.toBe(h);
  });
});

describe("périodes", () => {
  const now = new Date("2026-10-09T12:00:00Z");

  it("ajoute des mois calendaires sans déborder", () => {
    expect(addMonths(new Date("2026-01-31T00:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(addMonths(new Date("2026-10-09T00:00:00Z"), 12).toISOString().slice(0, 10)).toBe("2027-10-09");
  });

  it("démarre aujourd'hui sans abonnement ou après expiration", () => {
    expect(nextPeriod(null, 3, now).end.toISOString().slice(0, 10)).toBe("2027-01-09");
    const expired = { status: "past_due", current_period_end: "2026-09-01T00:00:00Z" };
    expect(nextPeriod(expired, 6, now).start).toEqual(now);
    expect(nextPeriod(expired, 6, now).end.toISOString().slice(0, 10)).toBe("2027-04-09");
  });

  it("prolonge depuis la date de fin quand l'abonnement court encore", () => {
    const running = {
      status: "active",
      current_period_start: "2026-08-01T00:00:00Z",
      current_period_end: "2026-11-01T00:00:00Z",
    };
    const p = nextPeriod(running, 3, now);
    expect(p.start.toISOString().slice(0, 10)).toBe("2026-08-01");
    expect(p.end.toISOString().slice(0, 10)).toBe("2027-02-01");
  });

  it("compte les jours restants", () => {
    expect(daysLeft("2026-10-19T12:00:00Z", now)).toBe(10);
    expect(daysLeft("2026-10-01T00:00:00Z", now)).toBe(0);
    expect(daysLeft(null, now)).toBeNull();
  });
});

/** Base Supabase simulée : enregistre les écritures, une clé disponible au plus. */
function fakeDb(opts: { keyAvailable: boolean; rateOk?: boolean; sub?: any; failUpsert?: boolean }) {
  const writes: any[] = [];
  let keyUsed = !opts.keyAvailable;
  const chain = (table: string) => {
    const state: any = { table, filters: {} as Record<string, any>, op: "select", values: null };
    const q: any = {
      select: () => q,
      update: (v: any) => ((state.op = "update"), (state.values = v), q),
      upsert: async (v: any) => {
        writes.push({ table, op: "upsert", values: v });
        return { error: opts.failUpsert ? new Error("upsert échoué") : null };
      },
      eq: (k: string, v: any) => ((state.filters[k] = v), q),
      maybeSingle: async () => {
        if (table === "license_keys" && state.op === "update") {
          writes.push({ table, op: "update", values: state.values, filters: { ...state.filters } });
          if (state.filters.status === "available" && !keyUsed) {
            keyUsed = true;
            return { data: { id: "k1", duration_months: 6, price_mad: 999 }, error: null };
          }
          return { data: null, error: null };
        }
        if (table === "workspace_subscriptions") return { data: opts.sub ?? null, error: null };
        return { data: null, error: null };
      },
      then: (res: any) => {
        writes.push({ table, op: state.op, values: state.values, filters: { ...state.filters } });
        if (table === "license_keys" && state.values?.status === "available") keyUsed = false;
        return Promise.resolve({ error: null }).then(res);
      },
    };
    return q;
  };
  return {
    writes,
    db: { from: chain, rpc: vi.fn(async () => ({ data: opts.rateOk ?? true, error: null })) },
  };
}

describe("activation d'une clé", () => {
  const now = new Date("2026-10-09T12:00:00Z");
  const input = { workspaceId: "w1", userId: "u1", code: "LP-AB2C-3D4E-F5G6", ip: "1.2.3.4" };

  it("prolonge l'abonnement, approuve un compte en attente et consomme la clé", async () => {
    const { db, writes } = fakeDb({ keyAvailable: true });
    const out = await activateLicense(db, input, now);
    expect(out).toEqual({ months: 6, periodEnd: "2027-04-09T12:00:00.000Z" });
    const keyWrite = writes.find((w) => w.table === "license_keys");
    expect(keyWrite.filters).toMatchObject({ status: "available", code_hash: hashLicenseCode(input.code) });
    const sub = writes.find((w) => w.table === "workspace_subscriptions").values;
    expect(sub).toMatchObject({ workspace_id: "w1", plan_code: "pro", status: "active" });
    const approval = writes.find((w) => w.table === "users");
    expect(approval.values).toEqual({ approval_status: "approved" });
    expect(approval.filters).toEqual({ id: "u1", approval_status: "pending" });
  });

  it("une clé ne s'active qu'une fois", async () => {
    const { db } = fakeDb({ keyAvailable: false });
    await expect(activateLicense(db, input, now)).rejects.toMatchObject({ code: "LICENSE_INVALID" });
  });

  it("limite les essais", async () => {
    const { db } = fakeDb({ keyAvailable: true, rateOk: false });
    await expect(activateLicense(db, input, now)).rejects.toMatchObject({ code: "LICENSE_RATE", status: 429 });
  });

  it("refuse un format faux sans toucher la base", async () => {
    const { db, writes } = fakeDb({ keyAvailable: true });
    await expect(activateLicense(db, { ...input, code: "abc" }, now)).rejects.toMatchObject({ code: "LICENSE_FORMAT" });
    expect(writes).toHaveLength(0);
  });

  it("rend la clé si l'abonnement n'a pas pu être prolongé", async () => {
    const { db, writes } = fakeDb({ keyAvailable: true, failUpsert: true });
    await expect(activateLicense(db, input, now)).rejects.toThrow("upsert échoué");
    const restore = writes.filter((w) => w.table === "license_keys").at(-1);
    expect(restore.values).toMatchObject({ status: "available", used_by_workspace: null });
  });
});

describe("messages de mise en place", () => {
  it("explique une table manquante, une variable manquante, une colonne manquante", async () => {
    const { licenseSetupMessage } = await import("../lib/licenses");
    expect(
      licenseSetupMessage({
        code: "PGRST205",
        message: "Could not find the table 'public.license_keys' in the schema cache",
      }),
    ).toContain("supabase/migrations");
    expect(licenseSetupMessage({ code: "42P01", message: 'relation "public.license_keys" does not exist' })).toContain(
      "SQL Editor",
    );
    expect(licenseSetupMessage(new Error("license_secret_not_configured"))).toContain("LICENSE_KEY_SECRET");
    expect(
      licenseSetupMessage({
        code: "PGRST204",
        message: "Could not find the 'current_period_end' column in the schema cache",
      }),
    ).toContain("workspace_subscriptions");
    expect(licenseSetupMessage(new Error("autre chose"))).toBeNull();
  });
});
