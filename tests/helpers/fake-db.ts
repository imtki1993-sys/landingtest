// Faux client Supabase en mémoire : enregistre les filtres de chaque requête.
type Row = Record<string, any>;

export function fakeDb(tables: Record<string, Row[]>) {
  const log: { table: string; op: string; filters: Record<string, any> }[] = [];
  const from = (table: string) => {
    const q = { table, op: "select", filters: {} as Record<string, any>, patch: null as Row | null };
    const rows = () =>
      (tables[table] || []).filter((r) =>
        Object.entries(q.filters).every(([k, v]) => (v === null ? r[k] == null : String(r[k]) === String(v))),
      );
    const run = () => {
      log.push({ table, op: q.op, filters: { ...q.filters } });
      const found = rows();
      if (q.op === "update") found.forEach((r) => Object.assign(r, q.patch));
      return found;
    };
    const chain: any = {
      select: () => chain,
      update: (patch: Row) => ((q.op = "update"), (q.patch = patch), chain),
      eq: (k: string, v: any) => ((q.filters[k] = v), chain),
      is: (k: string, v: any) => ((q.filters[k] = v), chain),
      maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
      single: async () => {
        const r = run();
        return r.length === 1 ? { data: r[0], error: null } : { data: null, error: { message: "not single" } };
      },
      then: (resolve: any, reject: any) => Promise.resolve({ data: run(), error: null }).then(resolve, reject),
    };
    return chain;
  };
  return { db: { from }, log };
}
