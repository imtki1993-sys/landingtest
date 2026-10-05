export function reorderImage(images: string[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= images.length || to >= images.length || from === to) return images;
  const a = [...images];
  const x = a.splice(from, 1)[0];
  a.splice(to, 0, x);
  return a;
}
export function mainImage(images: string[], index: number) {
  return reorderImage(images, index, 0);
}

export async function uploadImages(files: File[], limit: number) {
  const selected = files.slice(0, Math.max(0, limit));
  if (!selected.length) return [];
  const urls: string[] = [];
  for (const file of selected) {
    if (file.size > 3.8 * 1024 * 1024)
      throw new Error(
        `Image trop volumineuse: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 3,8 Mo par image.`,
      );
    const fd = new FormData();
    fd.append("images", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd }),
      raw = await r.text();
    let x: any = {};
    try {
      x = raw ? JSON.parse(raw) : {};
    } catch {
      x = { error: raw || `Erreur upload HTTP ${r.status}` };
    }
    if (!r.ok) throw new Error(x.error || "Upload impossible");
    if (!Array.isArray(x.urls)) throw new Error("Réponse upload invalide");
    urls.push(...x.urls);
  }
  return urls;
}
export function replaceImageAt(images: string[], index: number, url: string) {
  return images.map((value, i) => (i === index ? url : value));
}
