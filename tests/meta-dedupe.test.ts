// Renvoi du formulaire par la même personne : pas de second achat envoyé à Meta.
import { describe, expect, it } from "vitest";
import { hasRecentOrderFromPhone } from "../lib/meta-dedupe";

function fakeDb(tables: Record<string, any[]>) {
  const calls: any[] = [];
  const db: any = {
    from(table: string) {
      const f: any[] = [];
      const q: any = {
        select: () => q,
        eq: (c: string, v: any) => (f.push((r: any) => r[c] === v), q),
        in: (c: string, v: any[]) => (f.push((r: any) => v.includes(r[c])), q),
        gte: (c: string, v: any) => (f.push((r: any) => r[c] >= v), q),
        limit: async () => {
          calls.push(table);
          return { data: (tables[table] || []).filter((r) => f.every((fn) => fn(r))), error: null };
        },
      };
      return q;
    },
  };
  return { db, calls };
}
const now = Date.parse("2026-10-17T12:00:00Z");
const iso = (minAgo: number) => new Date(now - minAgo * 60000).toISOString();

describe("achat Meta en double", () => {
  it("détecte une commande du même numéro sur la même landing il y a 5 min", async () => {
    const { db } = fakeDb({
      leads: [{ id: "l1", workspace_id: "w", phone_e164: "+212612345678", created_at: iso(5) }],
      orders: [{ id: "o1", lead_id: "l1", landing_page_id: "p", created_at: iso(5) }],
    });
    expect(
      await hasRecentOrderFromPhone(db, { workspaceId: "w", landingPageId: "p", phone: "06 12 34 56 78", now }),
    ).toBe(true);
  });
  it("ignore une commande trop ancienne, d'une autre landing ou d'un autre numéro", async () => {
    const base = { workspaceId: "w", landingPageId: "p", phone: "0612345678", now };
    const old = fakeDb({
      leads: [{ id: "l1", workspace_id: "w", phone_e164: "+212612345678", created_at: iso(45) }],
      orders: [{ id: "o1", lead_id: "l1", landing_page_id: "p", created_at: iso(45) }],
    });
    expect(await hasRecentOrderFromPhone(old.db, base)).toBe(false);
    const other = fakeDb({
      leads: [{ id: "l1", workspace_id: "w", phone_e164: "+212612345678", created_at: iso(5) }],
      orders: [{ id: "o1", lead_id: "l1", landing_page_id: "autre", created_at: iso(5) }],
    });
    expect(await hasRecentOrderFromPhone(other.db, base)).toBe(false);
    const phone = fakeDb({ leads: [{ id: "l1", workspace_id: "w", phone_e164: "+212699999999", created_at: iso(5) }] });
    expect(await hasRecentOrderFromPhone(phone.db, base)).toBe(false);
  });
});
