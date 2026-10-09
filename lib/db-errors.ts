// Erreurs Supabase reconnaissables (pour fonctionner avant qu'une migration soit exécutée).
export const isMissingColumn = (e: any) =>
  /42703|PGRST204/.test(String(e?.code || "")) ||
  /column .* does not exist|schema cache/i.test(String(e?.message || ""));
export const isMissingTable = (e: any) =>
  /42P01|PGRST205/.test(String(e?.code || "")) ||
  /relation .* does not exist|find the table/i.test(String(e?.message || ""));
