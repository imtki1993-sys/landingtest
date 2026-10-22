// Landing « Gemini de A à Z » : Gemini dessine toute la page (mise en page, couleurs, typo, sections) en HTML/CSS.
// La page est affichée dans un cadre isolé (iframe sandbox, autre origine) : aucun script de Gemini n'y tourne,
// seul notre petit script de liaison envoie la commande à la page LandPro (Pixel, API Conversions, commandes).

export interface DesignInput {
  name: string;
  price: number;
  oldPrice: number | null;
  language: string;
  copy: Record<string, any>;
  features: string[];
  images: { url: string; role: string }[];
  whatsapp?: boolean;
}

const LANG_RULE: Record<string, string> = {
  "ar-MA":
    'Moroccan Darija in Arabic script (Casablanca style, no Modern Standard Arabic). <html dir="rtl" lang="ar">.',
  "fr-MA": 'Simple direct French for Moroccan customers. <html dir="ltr" lang="fr">.',
};

export function designPrompt(d: DesignInput): string {
  return `You are a world-class landing page designer and conversion copywriter for Cash-On-Delivery e-commerce in Morocco.
Design and write the COMPLETE landing page for this product, from A to Z: layout, sections, colors, typography, spacing,
visual hierarchy and final copy. Make it look like a premium, original, high-converting mobile page — not a template.

PRODUCT: ${d.name}
PRICE: ${d.price} DH${d.oldPrice ? ` (instead of ${d.oldPrice} DH)` : ""} — cash on delivery, delivery everywhere in Morocco.
REAL FEATURES (do not invent others): ${d.features.join(" | ")}
LANGUAGE: ${LANG_RULE[d.language] || LANG_RULE["ar-MA"]}
COPY DRAFT (improve freely, keep facts): ${JSON.stringify(d.copy).slice(0, 6000)}
IMAGES (use ONLY these exact URLs, every product image should appear at least once):
${d.images.map((i) => `- ${i.role}: ${i.url}`).join("\n")}

HARD RULES
1. Output ONE HTML document: <html><head><style>…</style></head><body>…</body></html>. No <script>, no inline event
   handlers (onclick…), no external JS, no iframes. Google Fonts via @import in <style> is allowed.
2. Mobile-first (designed for 390px wide), content column max-width 560px centered on desktop. Fast: no heavy effects.
3. ORDER FORM CONTRACT — at least one <form data-lp-order id="order"> containing exactly:
   <input name="name" required>, <input name="phone" type="tel" inputmode="tel" required>,
   <input name="city" required>, optional <input name="address">,
   optional quantity choice: <select name="quantity"> with values 1,2,3 (show the total price for each),
   and a big submit <button type="submit">. Labels/placeholders in the page language. No action attribute.
   Put the form high on the page (right after the hero) and add a sticky bottom button <a href="#order">.
4. Section ideas: hero (strong hook + main image + price + CTA), problem → solution, benefits with simple inline-SVG
   icons, how it works, product gallery, offer box (old price struck, cash on delivery, delivery everywhere),
   FAQ (delivery, payment on delivery, use), final CTA. Choose the best order for THIS product.
5. NEVER invent customer reviews, testimonials, ratings, sales numbers, stock counters, countdown timers,
   certifications, warranties or medical claims.
6. Images: <img src="EXACT_URL" alt="…" loading="lazy">, object-fit: cover, rounded corners as fits the design.
7. Return ONLY the HTML document, nothing before or after.`;
}

/** Retire tout ce qui pourrait s'exécuter ou sortir du cadre (le cadre est isolé de toute façon). */
export function sanitizeDesign(raw: string): string {
  let h = String(raw || "")
    .replace(/```html|```/gi, "")
    .trim();
  const start = h.search(/<!doctype html|<html|<head|<style|<body|<main|<section|<div/i);
  if (start > 0) h = h.slice(start);
  return h
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*>/gi, "")
    .replace(/<(iframe|object|embed|frame|frameset|applet|base|portal)\b[\s\S]*?(<\/\1\s*>|\/?>)/gi, "")
    .replace(/<meta\b[^>]*http-equiv[^>]*>/gi, "")
    .replace(/<link\b(?![^>]*fonts\.(googleapis|gstatic)\.com)[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(
      /(href|src|action|formaction|xlink:href)\s*=\s*(["']?)\s*(javascript|vbscript|data:text\/html)[^"'\s>]*\2/gi,
      "",
    )
    .replace(/<form\b([^>]*?)\saction\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "<form$1")
    .slice(0, 400_000);
}

/** Formulaire de secours si Gemini n'a pas respecté le contrat (la page doit toujours pouvoir prendre une commande). */
export function ensureOrderForm(html: string, language: string, price: number): string {
  const hasForm = /<form\b[^>]*data-lp-order/i.test(html) && /name=["']?phone/i.test(html);
  if (hasForm) return html;
  const ar = language.startsWith("ar");
  const t = ar
    ? {
        name: "الاسم الكامل",
        phone: "رقم الهاتف",
        city: "المدينة",
        address: "العنوان",
        go: "اطلب الآن · الدفع عند الاستلام",
      }
    : {
        name: "Nom complet",
        phone: "Téléphone",
        city: "Ville",
        address: "Adresse",
        go: "Commander · paiement à la livraison",
      };
  const form = `<section style="max-width:560px;margin:24px auto;padding:16px"><form data-lp-order id="order" style="display:grid;gap:10px">
<input name="name" required placeholder="${t.name}" style="padding:14px;border:1px solid #ccc;border-radius:10px;font-size:16px">
<input name="phone" type="tel" inputmode="tel" required placeholder="${t.phone}" style="padding:14px;border:1px solid #ccc;border-radius:10px;font-size:16px">
<input name="city" required placeholder="${t.city}" style="padding:14px;border:1px solid #ccc;border-radius:10px;font-size:16px">
<input name="address" placeholder="${t.address}" style="padding:14px;border:1px solid #ccc;border-radius:10px;font-size:16px">
<button type="submit" style="padding:16px;border:0;border-radius:12px;background:#111;color:#fff;font-size:18px;font-weight:700">${t.go} — ${price} DH</button>
</form></section>`;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, form + "</body>") : html + form;
}

/** Script de liaison injecté dans le cadre : hauteur, début de formulaire, envoi de la commande, résultat. */
export const BRIDGE = `(function(){
var P=function(m){parent.postMessage(Object.assign({lp:1},m),"*")};
var send=function(){P({type:"height",h:Math.ceil(document.documentElement.scrollHeight)})};
new ResizeObserver(send).observe(document.documentElement);addEventListener("load",send);setTimeout(send,300);
var started=false;document.addEventListener("focusin",function(e){if(!started&&e.target.closest&&e.target.closest("form")){started=true;P({type:"checkout"})}});
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a");if(!a)return;var h=a.getAttribute("href")||"";
if(h.charAt(0)==="#"){e.preventDefault();var t=document.querySelector(h)||document.querySelector("form");if(t){P({type:"scroll",y:t.getBoundingClientRect().top+scrollY})}}
else if(/^https:\\/\\/wa\\.me\\//.test(h)){P({type:"whatsapp"});a.target="_blank"}});
var current=null;
document.addEventListener("submit",function(e){var f=e.target;e.preventDefault();if(current)return;current=f;
var q=f.querySelector("[name=quantity]:checked")||f.querySelector("select[name=quantity]")||f.querySelector("input[name=quantity]");
var g=function(n){var x=f.querySelector("[name="+n+"]");return x?String(x.value||"").trim():""};
f.querySelectorAll("button,[type=submit]").forEach(function(b){b.disabled=true});
P({type:"order",fields:{name:g("name"),phone:g("phone"),city:g("city"),address:g("address")},qty:Math.max(1,parseInt(q&&q.value,10)||1)})});
addEventListener("message",function(e){var d=e.data||{};if(!d.lp||d.type!=="result"||!current)return;var f=current;current=null;
f.querySelectorAll("button,[type=submit]").forEach(function(b){b.disabled=false});
var m=f.querySelector(".lp-msg")||document.createElement("p");m.className="lp-msg";m.setAttribute("role","status");
m.style.cssText="margin:8px 0 0;padding:12px;border-radius:10px;font-weight:700;text-align:center;"+(d.ok?"background:#dcfce7;color:#166534":"background:#fee2e2;color:#991b1b");
m.textContent=d.message||"";f.appendChild(m);if(d.ok){f.reset()}send()});
})();`;

/** Document complet du cadre : la page de Gemini + notre script de liaison. */
export function frameDocument(html: string): string {
  const doc = /<html[\s>]/i.test(html)
    ? html
    : `<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  const head = '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  const withHead = /<head[^>]*>/i.test(doc) ? doc.replace(/<head[^>]*>/i, (m) => m + head) : doc;
  const script = `<script>${BRIDGE}</script>`;
  return /<\/body>/i.test(withHead)
    ? withHead.replace(/<\/body>(?![\s\S]*<\/body>)/i, script + "</body>")
    : withHead + script;
}
