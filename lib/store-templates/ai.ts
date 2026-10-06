// Génération d'une boutique avec l'IA (Meta Model API) à partir des templates de séries.
// L'IA ne crée pas de design : elle choisit le template le plus adapté (si le marchand
// ne l'a pas choisi) puis rédige tous les textes en gardant la structure exacte du template
// (mêmes sections, même nombre d'éléments). Le résultat est appliqué dans settings.sx,
// donc tout reste modifiable dans l'éditeur.
import { getStoreTemplate, seedStoreSettings, STORE_TEMPLATES, templateCopy } from "./index";
import type { StoreTemplate, SxBlock, SxItem, SxSectionType } from "./types";

/** Modèle Meta utilisé pour toute la génération de texte du projet. */
export const META_TEXT_MODEL = "muse-spark-1.3-contributor";

/** Envoie un prompt et renvoie le texte brut de la réponse. */
export type AskModel = (prompt: string) => Promise<string>;

export interface TemplateAiInput {
  name: string;
  locale: string;
  /** description libre de la boutique : produits, clientèle, ton… */
  brief?: string;
  /** noms et catégories des produits du marchand (pour coller à son catalogue) */
  products?: { name: string; category?: string }[];
}

// Sections dont le texte vient d'ailleurs (réglages, produits, FAQ) ou qui doivent rester vides
const SKIP: SxSectionType[] = ["hero", "products", "catalog", "faq", "testimonials", "wordmark"];

function languageOf(locale: string) {
  return locale === "fr"
    ? "français"
    : locale === "ar"
      ? "arabe standard moderne"
      : "darija marocaine écrite en alphabet arabe (naturelle, comme on parle au Maroc)";
}

/** Extrait le premier objet JSON d'une réponse (avec ou sans bloc ```json). */
export function parseJsonReply(raw: string): any {
  const text = String(raw || "")
    .replace(/```json|```/g, "")
    .trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Réponse IA sans JSON");
  return JSON.parse(text.slice(start, end + 1));
}

function productLines(products: TemplateAiInput["products"]) {
  const list = (products || []).filter((p) => p?.name).slice(0, 25);
  if (!list.length) return "Aucun produit encore ajouté : reste général sur la niche, sans inventer de produit précis.";
  return list.map((p) => "- " + p.name + (p.category ? " (" + p.category + ")" : "")).join("\n");
}

/* ───────── 1. choix du template ───────── */

export function templateChoicePrompt(input: TemplateAiInput): string {
  const catalog = STORE_TEMPLATES.map((t) => `${t.id} | ${t.name} | ${t.niche} | ${t.description}`).join("\n");
  return `Tu es directeur artistique e-commerce. Choisis LE template de boutique le plus adapté.

Boutique : ${input.name}
Description du marchand : ${input.brief || "(aucune)"}
Produits :
${productLines(input.products)}

Templates disponibles (id | nom | niche | style) :
${catalog}

Règles : choisis selon la niche et les produits, puis selon l'ambiance décrite. Réponds UNIQUEMENT avec ce JSON :
{"template_id":"","reason":""}`;
}

/** Id de template renvoyé par l'IA, ou null s'il n'existe pas. */
export function readTemplateChoice(raw: string): string | null {
  try {
    const id = String(parseJsonReply(raw)?.template_id || "").trim();
    return getStoreTemplate(id) ? id : null;
  } catch {
    return null;
  }
}

/* ───────── 2. rédaction des textes ───────── */

/** Sections du template à rédiger, avec leur contenu d'origine comme modèle de structure. */
export function writableSections(t: StoreTemplate, locale: string): Record<string, SxBlock> {
  const sections = templateCopy(t, locale).sections;
  const out: Record<string, SxBlock> = {};
  for (const type of t.sections) {
    if (SKIP.includes(type) || out[type]) continue;
    const b = sections[type];
    if (!b) continue;
    out[type] = {
      ...(b.eyebrow ? { eyebrow: b.eyebrow } : {}),
      ...(b.title ? { title: b.title } : {}),
      ...(b.text ? { text: b.text } : {}),
      ...(b.button ? { button: b.button } : {}),
      ...(b.items?.length
        ? {
            items: b.items.map((x) => ({
              title: x.title,
              ...(x.text ? { text: x.text } : {}),
              ...(x.value ? { value: x.value } : {}),
            })),
          }
        : {}),
    };
  }
  return out;
}

export function templateContentPrompt(t: StoreTemplate, input: TemplateAiInput): string {
  const c = templateCopy(t, input.locale);
  const model = {
    announcement: c.announcement,
    hero: {
      eyebrow: c.eyebrow,
      title: c.title,
      highlight: c.highlight || "",
      text: c.text,
      button: c.button,
      secondary: c.secondary || "",
    },
    collection: { title: c.collectionTitle, subtitle: c.collectionSubtitle || "" },
    sections: writableSections(t, input.locale),
    faq: [{ q: "", a: "" }],
    delivery: { title: "", intro: "", points: [{ title: "", text: "" }] },
    contact: { title: "", intro: "" },
    seo: { title: "", description: "" },
  };
  return `Tu es un copywriter e-commerce senior pour le marché marocain.
Tu rédiges TOUS les textes d'une boutique en ligne construite avec le template « ${t.name} » (${t.niche}).

Boutique : ${input.name}
Description du marchand : ${input.brief || "(aucune : déduis la niche du nom et des produits)"}
Produits :
${productLines(input.products)}
Langue de TOUS les textes : ${languageOf(input.locale)}
Contexte : livraison partout au Maroc, paiement à la livraison, commande confirmée par téléphone ou WhatsApp.

Voici le JSON du template avec ses textes d'exemple. Réécris chaque texte pour CETTE boutique et renvoie EXACTEMENT la même structure :
${JSON.stringify(model, null, 1)}

Règles obligatoires :
- même clés, même nombre d'éléments dans chaque liste "items" ; ne retire et n'ajoute aucune section ;
- textes courts et percutants, de la même longueur que l'exemple (titres de 2 à 8 mots) ;
- "hero.highlight" : 1 à 3 mots repris tels quels du hero.title, à mettre en valeur ;
- un champ "value" qui contient {products}, {categories} ou une couleur #rrggbb se recopie tel quel ;
- n'invente aucun chiffre, avis client, certification, prix ni garantie ;
- "faq" : 5 questions/réponses utiles (commande, livraison, paiement, échange, contact) adaptées à la boutique ;
- "delivery.points" : 3 ou 4 points (délais, zones, paiement à la livraison, échange) ;
- aucun emoji, aucun texte en dehors du JSON.

Réponds UNIQUEMENT avec le JSON.`;
}

const str = (v: unknown, max = 400) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "");

/** Fusionne un bloc rédigé par l'IA avec le bloc d'origine : même champs, même nombre d'éléments. */
function mergeBlock(def: SxBlock, ai: any): SxBlock {
  if (!ai || typeof ai !== "object") return {};
  const out: SxBlock = {};
  for (const k of ["eyebrow", "title", "text", "button"] as const) {
    if (def[k] && str(ai[k])) out[k] = str(ai[k]);
  }
  if (def.items?.length) {
    const aiItems: any[] = Array.isArray(ai.items) ? ai.items : [];
    out.items = def.items.map((d, i): SxItem => {
      const x = aiItems[i] || {};
      // les valeurs calculées ({products}…) et les couleurs restent celles du template
      const keepValue = !d.value || /[{#]/.test(d.value);
      return {
        ...d,
        title: str(x.title, 120) || d.title,
        ...(d.text ? { text: str(x.text) || d.text } : {}),
        ...(d.value ? { value: keepValue ? d.value : str(x.value, 40) || d.value } : {}),
      };
    });
  }
  return out;
}

/** Réglages de boutique : template + textes rédigés par l'IA (les champs invalides gardent le texte du template). */
export function applyTemplateAiContent(
  t: StoreTemplate,
  locale: string,
  raw: any,
  current: Record<string, any> = {},
): Record<string, any> {
  const base = seedStoreSettings(t, locale, current);
  const c = raw && typeof raw === "object" ? raw : {};
  const hero = c.hero || {};
  const title = str(hero.title, 140);
  const highlight = str(hero.highlight, 60);
  const sections = templateCopy(t, locale).sections;
  const content: Record<string, SxBlock> = {};
  for (const type of Object.keys(writableSections(t, locale)) as SxSectionType[]) {
    const merged = mergeBlock(sections[type] || {}, c.sections?.[type]);
    if (Object.keys(merged).length) content[type] = merged;
  }
  const faq = (Array.isArray(c.faq) ? c.faq : [])
    .map((x: any) => ({ q: str(x?.q ?? x?.question, 200), a: str(x?.a ?? x?.answer, 600) }))
    .filter((x: any) => x.q && x.a)
    .slice(0, 8);
  const points = (Array.isArray(c.delivery?.points) ? c.delivery.points : [])
    .map((x: any) =>
      typeof x === "string" ? { title: str(x, 120) } : { title: str(x?.title, 120), text: str(x?.text) },
    )
    .filter((x: any) => x.title)
    .slice(0, 6);
  const out: Record<string, any> = {
    ...base,
    aiGenerated: true,
    aiEngine: "store-templates-v1",
    heroEyebrow: str(hero.eyebrow, 80) || base.heroEyebrow,
    heroTitle: title || base.heroTitle,
    // mot mis en valeur : seulement s'il est bien dans le titre rédigé
    heroHighlight: title && highlight && title.toLowerCase().includes(highlight.toLowerCase()) ? highlight : "",
    heroText: str(hero.text) || base.heroText,
    heroButton: str(hero.button, 40) || base.heroButton,
    heroSecondaryButton: base.heroSecondaryButton ? str(hero.secondary, 40) || base.heroSecondaryButton : "",
    announcement: str(c.announcement, 120) || base.announcement,
    collectionTitle: str(c.collection?.title, 80) || base.collectionTitle,
    collectionSubtitle: str(c.collection?.subtitle, 200) || base.collectionSubtitle,
    faq: faq.length >= 3 ? faq : base.faq,
    sx: { ...base.sx, content },
  };
  if (!title) out.heroHighlight = base.heroHighlight;
  if (str(c.delivery?.title) || points.length)
    out.deliveryContent = {
      ...(current.deliveryContent || {}),
      title: str(c.delivery?.title, 80),
      intro: str(c.delivery?.intro),
      points,
    };
  if (str(c.contact?.title) || str(c.contact?.intro))
    out.contactContent = {
      ...(current.contactContent || {}),
      title: str(c.contact?.title, 80),
      intro: str(c.contact?.intro),
    };
  // titre et description de la page (lus par la page publique de la boutique)
  if (str(c.seo?.title) || str(c.seo?.description))
    out.brand = {
      ...(current.brand || {}),
      seo_title: str(c.seo?.title, 70),
      seo_description: str(c.seo?.description, 170),
    };
  return out;
}

/**
 * Génère les réglages d'une boutique à partir d'un template (choisi, ou choisi par l'IA si `templateId` est vide).
 * Lève une erreur si l'IA ne répond pas un JSON exploitable.
 */
export async function generateTemplateStore(
  ask: AskModel,
  input: TemplateAiInput & { templateId?: string; current?: Record<string, any> },
): Promise<{ templateId: string; settings: Record<string, any> }> {
  let t = getStoreTemplate(input.templateId);
  if (!t) {
    const chosen = readTemplateChoice(await ask(templateChoicePrompt(input)));
    t = getStoreTemplate(chosen) || pickTemplateLocally(input);
  }
  const raw = parseJsonReply(await ask(templateContentPrompt(t, input)));
  const settings = applyTemplateAiContent(t, input.locale, raw, input.current);
  if (input.brief) settings.aiBrief = input.brief.slice(0, 1000);
  return { templateId: t.id, settings };
}

/** Repli sans IA : template dont la niche partage le plus de mots avec la description. */
export function pickTemplateLocally(input: TemplateAiInput): StoreTemplate {
  const words = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3);
  const want = new Set(
    words(
      [input.name, input.brief || "", ...(input.products || []).map((p) => p.name + " " + (p.category || ""))].join(
        " ",
      ),
    ),
  );
  let best = STORE_TEMPLATES[0];
  let score = -1;
  for (const t of STORE_TEMPLATES) {
    const s = words(t.niche + " " + t.description + " " + t.name).filter((w) => want.has(w)).length;
    if (s > score) [best, score] = [t, s];
  }
  return best;
}

/** Champs remplacés quand l'IA réécrit les textes d'une boutique existante. */
const AI_TEXT_FIELDS = [
  "heroEyebrow",
  "heroTitle",
  "heroHighlight",
  "heroText",
  "heroButton",
  "heroSecondaryButton",
  "announcement",
  "collectionTitle",
  "collectionSubtitle",
  "faq",
  "deliveryContent",
  "contactContent",
  "brand",
];

/**
 * Réécriture des textes d'une boutique existante : seuls les textes changent ;
 * couleurs, polices, ordre des sections, sections masquées, images et blocs personnalisés sont gardés.
 */
export function rewriteStoreTexts(
  t: StoreTemplate,
  locale: string,
  raw: any,
  settings: Record<string, any>,
): Record<string, any> {
  const fresh = applyTemplateAiContent(t, locale, raw, settings);
  const out: Record<string, any> = { ...settings, storeTemplateId: t.id, aiGenerated: true, aiEngine: fresh.aiEngine };
  for (const k of AI_TEXT_FIELDS) if (fresh[k] !== undefined) out[k] = fresh[k];
  const isOwn = settings.storeTemplateId === t.id && !!settings.sx;
  const sx = isOwn ? settings.sx : fresh.sx;
  const content: Record<string, SxBlock> = { ...(isOwn ? sx.content || {} : {}) };
  // le texte rédigé remplace le texte, les images choisies par le marchand restent
  for (const [k, b] of Object.entries(fresh.sx.content as Record<string, SxBlock>)) {
    const prev = content[k] || {};
    content[k] = {
      ...prev,
      ...b,
      ...(b.items
        ? { items: b.items.map((x, i) => (prev.items?.[i]?.image ? { ...x, image: prev.items[i].image } : x)) }
        : {}),
    };
  }
  out.sx = { ...sx, content };
  return out;
}
