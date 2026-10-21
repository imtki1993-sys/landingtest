// Fiche produit lue dans le message d'un fournisseur (darija, arabe ou français) :
// d'abord par règles simples, puis par l'IA quand une clé est configurée.

export const SOURCING_CATEGORIES = [
  "Maison & cuisine",
  "Beauté & soins",
  "Mode & accessoires",
  "Électronique & gadgets",
  "Enfants & jouets",
  "Sport & loisirs",
  "Auto & moto",
  "Santé & bien-être",
  "Animaux",
  "Autre",
] as const;
export type SourcingCategory = (typeof SOURCING_CATEGORIES)[number];

export interface Extracted {
  is_product: boolean;
  name: string | null;
  category: SourcingCategory;
  price: number | null;
  min_qty: number | null;
  phone: string | null;
}

// chiffres arabes orientaux → latins
const latin = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const CUR = "(?:dh|dhs|mad|درهم|دراهم|د\\.?\\s?م)";
const PRICE_WORDS = "(?:prix|price|الثمن|التمن|ثمن|تمن|السعر|سعر|بثمن|ب)";

export function extractPrice(text: string): number | null {
  const t = latin(text);
  const nums: number[] = [];
  let m: RegExpExecArray | null;
  const after = new RegExp(`(\\d{1,5}(?:[.,]\\d{1,2})?)\\s*${CUR}(?![a-z])`, "gi");
  while ((m = after.exec(t))) nums.push(Number(m[1].replace(",", ".")));
  if (!nums.length) {
    const before = new RegExp(`${PRICE_WORDS}\\s*[:：=-]?\\s*(\\d{1,5}(?:[.,]\\d{1,2})?)`, "gi");
    while ((m = before.exec(t))) nums.push(Number(m[1].replace(",", ".")));
  }
  const ok = nums.filter((n) => n >= 1 && n <= 100000);
  // prix de gros : le plus bas cité (souvent « détail 80 / gros 45 »)
  return ok.length ? Math.min(...ok) : null;
}

export function extractMinQty(text: string): number | null {
  const t = latin(text);
  const m =
    t.match(/(?:minimum|min|qte|quantité|الحد الأدنى|أقل كمية|اقل كمية|ابتداء من|من)\s*[:：]?\s*(\d{1,5})/i) ||
    t.match(/(\d{1,5})\s*(?:pcs|pièces|pieces|pc|قطع|قطعة|حبة|حبات|وحدة|ديزين|douzaine)/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : null;
}

export function extractPhone(text: string): string | null {
  const t = latin(text).replace(/[\s.-]/g, "");
  const m = t.match(/(?:\+212|00212|0)([5-7]\d{8})/);
  return m ? "0" + m[1] : null;
}

const KEYWORDS: [SourcingCategory, RegExp][] = [
  [
    "Maison & cuisine",
    /cuisine|maison|casserole|tapis|rideau|vaisselle|rangement|lampe|مطبخ|كوزينة|دار|طنجرة|زربية|ستارة|تخزين|كاس|طباسل/i,
  ],
  ["Beauté & soins", /crème|creme|sérum|serum|maquillage|parfum|cheveux|beauté|كريم|سيروم|ماكياج|عطر|شعر|بشرة|تجميل/i],
  [
    "Mode & accessoires",
    /robe|abaya|jellaba|sac|chaussure|montre|bijou|vêtement|عباية|جلابة|صاك|حذاء|سباط|ساعة|ملابس|كسوة|بلوزة/i,
  ],
  [
    "Électronique & gadgets",
    /écouteur|ecouteur|chargeur|câble|cable|bluetooth|led|caméra|camera|smart|سماعة|شاحن|كابل|كاميرا|ضوء/i,
  ],
  ["Enfants & jouets", /enfant|bébé|bebe|jouet|poussette|أطفال|اطفال|طفل|بيبي|لعبة|لعب/i],
  ["Sport & loisirs", /sport|fitness|yoga|vélo|velo|camping|رياضة|دراجة|تخييم/i],
  ["Auto & moto", /voiture|auto|moto|tomobil|طوموبيل|سيارة|موطور/i],
  ["Santé & bien-être", /santé|sante|massage|posture|douleur|صحة|مساج|ألم|الم/i],
  ["Animaux", /chat|chien|animal|قط|كلب|حيوان/i],
];
export function guessCategory(text: string): SourcingCategory {
  for (const [c, re] of KEYWORDS) if (re.test(text)) return c;
  return "Autre";
}

/** Nom : première ligne utile, sans emojis, prix ni numéro. */
export function guessName(text: string): string | null {
  for (const raw of text.split("\n")) {
    const line = raw
      .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}*#•▪️✅✔️➖➡️⬅️]/gu, " ")
      .replace(new RegExp(`\\d{1,5}(?:[.,]\\d{1,2})?\\s*${CUR}`, "gi"), " ")
      .replace(/(?:\+212|0)[5-7][\d\s.-]{8,}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (line.length >= 3 && /\p{L}/u.test(line)) return line.slice(0, 80);
  }
  return null;
}

export function regexExtract(text: string, hasPhoto: boolean): Extracted {
  const price = extractPrice(text);
  return {
    // annonce sans photo ni prix (« bonjour », « stock épuisé ») : pas un produit
    is_product: hasPhoto || price != null,
    name: guessName(text),
    category: guessCategory(text),
    price,
    min_qty: extractMinQty(text),
    phone: extractPhone(text),
  };
}

/** Prompt IA pour un lot de messages ; réponse attendue : tableau JSON. */
export function aiPrompt(posts: { id: string; text: string }[]): string {
  return `Tu lis des messages de grossistes de Derb Omar (Casablanca) publiés sur Telegram, en darija, arabe ou français.
Pour chaque message, renvoie une fiche produit. Catégories possibles : ${SOURCING_CATEGORIES.join(", ")}.
- is_product : false si le message n'est pas une offre de produit (annonce, salutation, stock épuisé…)
- name : nom court du produit en français (3 à 8 mots), sans prix ni emoji
- category : une des catégories ci-dessus
- price : prix de gros unitaire en dirhams (nombre) ; s'il y a plusieurs prix, le prix de gros ; null si absent
- min_qty : quantité minimum de commande (nombre) ou null
N'invente rien qui n'est pas dans le message.
Réponds UNIQUEMENT avec un tableau JSON : [{"id":"…","is_product":true,"name":"…","category":"…","price":45,"min_qty":10}]
Messages :
${JSON.stringify(posts.map((p) => ({ id: p.id, text: p.text.slice(0, 1200) })))}`;
}

export function parseAiAnswer(raw: string): Map<string, Partial<Extracted>> {
  const out = new Map<string, Partial<Extracted>>();
  const json = raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);
  let arr: any[] = [];
  try {
    arr = JSON.parse(json);
  } catch {
    return out;
  }
  for (const x of Array.isArray(arr) ? arr : []) {
    if (!x || typeof x.id !== "string") continue;
    const cat = SOURCING_CATEGORIES.find((c) => c === x.category);
    const price = Number(x.price);
    const qty = Number(x.min_qty);
    out.set(x.id, {
      is_product: x.is_product !== false,
      name: typeof x.name === "string" && x.name.trim() ? x.name.trim().slice(0, 80) : undefined,
      category: cat,
      price: Number.isFinite(price) && price > 0 && price < 100000 ? price : undefined,
      min_qty: Number.isFinite(qty) && qty > 0 && qty < 100000 ? Math.round(qty) : undefined,
    });
  }
  return out;
}
