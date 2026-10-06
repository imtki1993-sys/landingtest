// Nettoyage des produits envoyés par le navigateur pour le prompt IA (noms et catégories seulement).
export function aiProductList(v: unknown): { name: string; category?: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 40)
    .map((p: any) => ({
      name: typeof p?.name === "string" ? p.name.trim().slice(0, 100) : "",
      category: typeof p?.category === "string" ? p.category.trim().slice(0, 60) : undefined,
    }))
    .filter((p) => p.name);
}
