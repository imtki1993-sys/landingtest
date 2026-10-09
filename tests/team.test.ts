// Équipe de confirmation : droits de l'agent et répartition automatique des commandes.
import { describe, expect, it } from "vitest";
import { agentCanAccess, autoAssign, pickAgent } from "../lib/team";

describe("droits d'un agent", () => {
  it("peut voir ses commandes et changer leur statut d'appel", () => {
    expect(agentCanAccess("GET", "/api/orders")).toBe(true);
    expect(agentCanAccess("GET", "/api/orders/abc/history")).toBe(true);
    expect(agentCanAccess("PATCH", "/api/leads/abc")).toBe(true);
    expect(agentCanAccess("GET", "/api/auth/context")).toBe(true);
    expect(agentCanAccess("GET", "/api/team/me")).toBe(true);
  });

  it("ne peut rien faire d'autre", () => {
    for (const [m, p] of [
      ["DELETE", "/api/orders/abc"],
      ["POST", "/api/orders/bulk"],
      ["POST", "/api/orders/assign"],
      ["PATCH", "/api/orders/abc"],
      ["POST", "/api/orders/abc/ozon"],
      ["GET", "/api/settings"],
      ["POST", "/api/integrations"],
      ["GET", "/api/team"],
      ["POST", "/api/team"],
      ["POST", "/api/blacklist"],
      ["GET", "/api/products"],
      ["POST", "/api/pages"],
      ["POST", "/api/license"],
      ["GET", "/api/admin/licenses"],
      ["DELETE", "/api/leads/abc"],
    ])
      expect(agentCanAccess(m, p), `${m} ${p}`).toBe(false);
  });
});

describe("répartition automatique", () => {
  it("choisit l'agent le moins chargé", () => {
    const agents = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(
      pickAgent(
        agents,
        new Map([
          ["a", 3],
          ["b", 1],
          ["c", 2],
        ]),
      ),
    ).toBe("b");
    expect(pickAgent(agents, new Map([["a", 1]]))).toBe("b");
    expect(pickAgent([], new Map())).toBeNull();
  });

  /** Base simulée : une commande, réglage auto_assign, deux agents dont un suspendu. */
  function db(opts: { auto: boolean; assigned?: string | null }) {
    const updates: any[] = [];
    const from = (table: string) => {
      const st: any = { op: "select", values: null };
      const q: any = {
        select: () => q,
        update: (v: any) => ((st.op = "update"), (st.values = v), q),
        eq: () => q,
        gte: () => q,
        is: () => q,
        in: () => q,
        maybeSingle: async () => {
          if (table === "orders") return { data: { id: "o1", workspace_id: "w", assigned_to: opts.assigned ?? null } };
          if (table === "workspaces") return { data: { settings: { auto_assign: opts.auto } } };
          return { data: null };
        },
        then: (res: any) => {
          let data: any = [];
          if (st.op === "update") updates.push({ table, values: st.values });
          else if (table === "workspace_members")
            data = [
              { user_id: "a1", role: "agent" },
              { user_id: "a2", role: "agent" },
            ];
          else if (table === "users")
            data = [
              { id: "a1", approval_status: "approved" },
              { id: "a2", approval_status: "suspended" },
            ];
          else if (table === "orders") data = [];
          return Promise.resolve({ data, error: null }).then(res);
        },
      };
      return q;
    };
    return { updates, s: { from } };
  }

  it("attribue à un agent actif quand la répartition est activée", async () => {
    const { s, updates } = db({ auto: true });
    expect(await autoAssign(s, "o1")).toBe("a1");
    expect(updates[0].values.assigned_to).toBe("a1");
  });

  it("ne fait rien si la répartition est désactivée ou la commande déjà attribuée", async () => {
    for (const opts of [{ auto: false }, { auto: true, assigned: "x" }]) {
      const { s, updates } = db(opts);
      expect(await autoAssign(s, "o1")).toBeNull();
      expect(updates).toHaveLength(0);
    }
  });
});
