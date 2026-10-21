// Texte de voix off darija → texte que la synthèse vocale lit correctement.
// Les modèles de voix darija lisent mal les chiffres, l'alphabet latin, les emojis et les sigles :
// tout est réécrit en lettres arabes, comme on le dit à l'oral au Maroc.

const UNITS = ["صفر", "واحد", "جوج", "تلاتة", "ربعة", "خمسة", "ستة", "سبعة", "تمنية", "تسعة", "عشرة"];
const TEENS: Record<number, string> = {
  11: "حداش",
  12: "طناش",
  13: "تلطاش",
  14: "ربعطاش",
  15: "خمسطاش",
  16: "سطاش",
  17: "سبعطاش",
  18: "تمنطاش",
  19: "تسعطاش",
};
const TENS = ["", "", "عشرين", "تلاتين", "ربعين", "خمسين", "ستين", "سبعين", "تمانين", "تسعين"];
const HUNDREDS = ["", "مية", "ميتين", "تلت مية", "ربع مية", "خمس مية", "ست مية", "سبع مية", "تمن مية", "تسع مية"];
/** 3 à 10 milliers : « تلت آلاف »… */
const THOUSANDS_SMALL: Record<number, string> = {
  3: "تلت آلاف",
  4: "ربع آلاف",
  5: "خمس آلاف",
  6: "ست آلاف",
  7: "سبع آلاف",
  8: "تمن آلاف",
  9: "تسع آلاف",
  10: "عشر آلاف",
};

function below100(n: number): string {
  if (n <= 10) return UNITS[n];
  if (n < 20) return TEENS[n];
  const t = Math.floor(n / 10),
    u = n % 10;
  return u ? `${UNITS[u]} و ${TENS[t]}` : TENS[t];
}

function below1000(n: number): string {
  if (n < 100) return below100(n);
  const h = Math.floor(n / 100),
    r = n % 100;
  return r ? `${HUNDREDS[h]} و ${below100(r)}` : HUNDREDS[h];
}

/** Nombre entier en darija : 199 → « مية و تسعة و تسعين ». */
export function numberToDarija(n: number): string {
  if (!Number.isFinite(n)) return "";
  n = Math.floor(Math.abs(n));
  if (n < 1000) return below1000(n);
  if (n < 1_000_000) {
    const k = Math.floor(n / 1000),
      r = n % 1000;
    const head = k === 1 ? "ألف" : k === 2 ? "ألفين" : THOUSANDS_SMALL[k] || `${below1000(k)} ألف`;
    return r ? `${head} و ${below1000(r)}` : head;
  }
  const m = Math.floor(n / 1_000_000),
    r = n % 1_000_000;
  const head = m === 1 ? "مليون" : m === 2 ? "جوج مليون" : `${numberToDarija(m)} مليون`;
  return r ? `${head} و ${numberToDarija(r)}` : head;
}

/** 99.5 → « تسعة و تسعين و نص » ; 12.75 → « طناش فاصلة خمسة و سبعين ». */
function decimalToDarija(intPart: string, dec: string): string {
  const base = numberToDarija(Number(intPart));
  if (/^50?$/.test(dec)) return `${base} و نص`;
  if (/^0+$/.test(dec)) return base;
  return `${base} فاصلة ${numberToDarija(Number(dec))}`;
}

// Mots en lettres latines fréquents dans les pubs COD → darija écrite en arabe
const LATIN_WORDS: Record<string, string> = {
  "livraison gratuite": "التوصيل فابور",
  "paiement à la livraison": "الخلاص عند الاستلام",
  "cash on delivery": "الخلاص عند الاستلام",
  cod: "الخلاص عند الاستلام",
  livraison: "ليفريزون",
  gratuit: "فابور",
  gratuite: "فابور",
  free: "فابور",
  promo: "بروموسيون",
  promotion: "بروموسيون",
  offre: "العرض",
  stock: "سطوك",
  cash: "كاش",
  pack: "باك",
  original: "أوريجينال",
  originale: "أوريجينال",
  garantie: "ضمانة",
  qualité: "كاليتي",
  top: "طوب",
  ok: "أوكي",
  whatsapp: "واتساب",
  facebook: "فيسبوك",
  instagram: "انستغرام",
  tiktok: "تيك توك",
  youtube: "يوتيوب",
  maroc: "المغرب",
  casablanca: "كازا",
  casa: "كازا",
  rabat: "الرباط",
  marrakech: "مراكش",
  tanger: "طنجة",
  fes: "فاس",
  fès: "فاس",
  agadir: "أكادير",
  dh: "درهم",
  dhs: "درهم",
  mad: "درهم",
  led: "ليد",
  usb: "يو إس بي",
  bluetooth: "بلوتوث",
  wifi: "ويفي",
  iphone: "أيفون",
  samsung: "سامسونغ",
  android: "أندرويد",
  pro: "برو",
  max: "ماكس",
  mini: "ميني",
  plus: "بلوس",
  new: "جديد",
  sale: "تخفيضات",
  landpro: "لاندبرو",
};

// Lettres latines → arabe (dernier recours pour un mot inconnu ; à vérifier par le vendeur)
const DIGRAPHS: [RegExp, string][] = [
  [/ch/g, "ش"],
  [/sh/g, "ش"],
  [/ou/g, "و"],
  [/kh/g, "خ"],
  [/gh/g, "غ"],
  [/th/g, "ت"],
  [/ph/g, "ف"],
  [/qu/g, "ك"],
  [/ai|ei/g, "ي"],
  [/an|en/g, "ان"],
];
const LETTERS: Record<string, string> = {
  a: "ا",
  b: "ب",
  c: "ك",
  d: "د",
  e: "ي",
  f: "ف",
  g: "ك",
  h: "ه",
  i: "ي",
  j: "ج",
  k: "ك",
  l: "ل",
  m: "م",
  n: "ن",
  o: "و",
  p: "ب",
  q: "ك",
  r: "ر",
  s: "س",
  t: "ت",
  u: "و",
  v: "ف",
  w: "و",
  x: "كس",
  y: "ي",
  z: "ز",
};
function transliterate(word: string): string {
  let w = word.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [re, ar] of DIGRAPHS) w = w.replace(re, ar);
  return w.replace(/[a-z]/g, (c) => LETTERS[c] || "").replace(/(.)\1+/g, "$1");
}

export interface NormalizeResult {
  /** texte prêt pour la voix */
  text: string;
  /** phrases, lues une par une (moins de répétitions, pauses naturelles) */
  sentences: string[];
  /** mots latins inconnus transcrits approximativement : à relire */
  guessed: string[];
  /** durée estimée en secondes */
  seconds: number;
}

const WORDS_PER_SECOND = 2.4;

/** Durée estimée d'un texte darija lu à un rythme de pub. */
export function estimateSeconds(text: string, speed = 1): number {
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.round(words / WORDS_PER_SECOND / (speed || 1)));
}

export function normalizeDarija(input: string): NormalizeResult {
  const guessed = new Set<string>();
  let t = String(input || "")
    .normalize("NFC")
    // emojis, pictogrammes, sélecteurs de variante
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, " ")
    // liens et mentions : illisibles à l'oral
    .replace(/https?:\/\/\S+|www\.\S+/gi, " ")
    .replace(/[#@]([\p{L}\p{N}_]+)/gu, "$1")
    // chiffres arabes orientaux → latins (pour la conversion qui suit)
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  // expressions latines de plusieurs mots d'abord
  for (const [k, v] of Object.entries(LATIN_WORDS))
    if (k.includes(" ")) t = t.replace(new RegExp(k.replace(/\s+/g, "\\s+"), "gi"), v);

  t = t
    // 1 000 / 1.000 = mille (avant les prix et pourcentages)
    .replace(/(\d{1,3})(?:[ .](\d{3}))+(?![\d.,])/g, (m) => m.replace(/[ .]/g, ""))
    // pourcentages, prix, durées
    .replace(/(\d+)(?:[.,](\d+))?\s*%/g, (_, a, b) => `${b ? decimalToDarija(a, b) : numberToDarija(+a)} فالمية`)
    .replace(/(\d+)\s*h\b/gi, (_, a) => `${numberToDarija(+a)} ساعة`)
    .replace(/(\d+)\s*(?:min|mn)\b/gi, (_, a) => `${numberToDarija(+a)} دقيقة`)
    .replace(
      /(\d+)(?:[.,](\d{1,2}))?\s*(?:dhs?|mad|درهم|دراهم|د\.?\s?م)(?![\p{L}])/giu,
      (_, a, b) => `${b ? decimalToDarija(a, b) : numberToDarija(+a)} درهم`,
    )
    .replace(/(\d+)\s*[xX×]\s*(\d+)/g, (_, a, b) => `${numberToDarija(+a)} ضرب ${numberToDarija(+b)}`)
    .replace(/(\d+)\s*\+\s*(\d+)/g, (_, a, b) => `${numberToDarija(+a)} زايد ${numberToDarija(+b)}`)
    // téléphone : chiffre par chiffre
    .replace(/\b0[5-7](?:[\s.-]?\d){8}\b/g, (m) =>
      m
        .replace(/\D/g, "")
        .split("")
        .map((d) => UNITS[+d])
        .join(" "),
    )
    // nombres décimaux puis entiers
    .replace(/(\d+)[.,](\d{1,2})(?!\d)/g, (_, a, b) => decimalToDarija(a, b))
    .replace(/\d+/g, (m) => numberToDarija(+m));

  // mots latins restants
  t = t.replace(/[A-Za-zÀ-ÿ]+(?:'[A-Za-zÀ-ÿ]+)?/g, (w) => {
    const known = LATIN_WORDS[w.toLowerCase()];
    if (known) return known;
    const ar = transliterate(w);
    if (ar) guessed.add(`${w} → ${ar}`);
    return ar;
  });

  t = t
    .replace(/[“”«»"(){}\[\]*_~|<>]/g, " ")
    .replace(/[:;]/g, "،")
    .replace(/,/g, "،")
    .replace(/\?/g, "؟")
    .replace(/\.{2,}|…/g, "، ")
    .replace(/[-–—/\\+=]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?([،.!؟])/g, "$1")
    .replace(/([،.!؟])(?=\S)/g, "$1 ");

  const sentences: string[] = [];
  for (const line of t.split(/\n+/)) {
    for (const raw of line.split(/(?<=[.!؟])\s+/)) {
      const s = raw.trim().replace(/^[،.\s]+/, "");
      if (!s || !/\p{L}/u.test(s)) continue;
      // phrase trop longue : coupée aux virgules (≈ 120 caractères)
      if (s.length <= 140) sentences.push(endWithStop(s));
      else {
        let cur = "";
        for (const part of s.split(/(?<=،)\s*/)) {
          if ((cur + " " + part).trim().length > 120 && cur) {
            sentences.push(endWithStop(cur.trim().replace(/،$/, "")));
            cur = part;
          } else cur = (cur + " " + part).trim();
        }
        if (cur) sentences.push(endWithStop(cur.trim()));
      }
    }
  }
  const text = sentences.join(" ");
  return { text, sentences, guessed: [...guessed], seconds: estimateSeconds(text) };
}

const endWithStop = (s: string) => (/[.!؟]$/.test(s) ? s : s.replace(/،$/, "") + ".");
