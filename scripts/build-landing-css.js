// Génère app/landing-public.css : sous-ensemble exact de app/globals.css (même ordre)
// limité aux règles dont toutes les classes peuvent apparaître sur une page publique
// (landing pages et boutiques). Les pages publiques ne chargent plus le CSS du
// tableau de bord. Lancé automatiquement avant chaque build (npm run prebuild).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC_FILES = [
  "app/landing/[slug]/LandingClient.tsx",
  "app/landing/[slug]/HeroRenderer.tsx",
  "app/landing/[slug]/page.tsx",
  "app/store/[slug]/Storefront.tsx",
  "app/store/[slug]/[[...page]]/page.tsx",
  "components/LandingTemplateV4.tsx",
];
const OUT = path.join(ROOT, "app/landing-public.css");

let postcss;
try { postcss = require("postcss"); } catch {
  console.warn("[landing-css] postcss introuvable : app/landing-public.css conservé tel quel.");
  process.exit(0);
}

// Classes possibles : tous les mots des fichiers publics (volontairement large)
// + préfixes dynamiques du type "lp-form-"+style ou `hero-${x}`.
const tokens = new Set();
const prefixes = new Set();
for (const rel of PUBLIC_FILES) {
  const s = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const t of s.match(/[A-Za-z][\w-]*/g) || []) tokens.add(t);
  for (const m of s.matchAll(/([A-Za-z][\w-]*-)(?=["'`]\s*\+|\$\{)/g)) if (m[1].length >= 4) prefixes.add(m[1]);
  for (const m of s.matchAll(/\b([A-Za-z][\w-]*-)["'`]/g)) if (m[1].length >= 4) prefixes.add(m[1]);
}
const pre = [...prefixes];
const allowed = (c) => tokens.has(c) || pre.some((p) => c.startsWith(p));

const root = postcss.parse(fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8"));
let kept = 0, dropped = 0;
root.walkAtRules("import", (a) => a.remove()); // polices chargées sans bloquer par app/landing/layout.tsx
root.walkRules((r) => {
  if (r.parent && r.parent.type === "atrule" && /keyframes/i.test(r.parent.name)) return;
  const sels = r.selectors.filter((sel) => (sel.match(/\.([A-Za-z_][\w-]*)/g) || []).every((c) => allowed(c.slice(1))));
  if (!sels.length) { r.remove(); dropped++; } else { r.selectors = sels; kept++; }
});
root.walkAtRules((a) => { if (a.nodes && !a.nodes.length) a.remove(); });

const header = "/* FICHIER GÉNÉRÉ par scripts/build-landing-css.js depuis globals.css — ne pas modifier à la main.\n   Contient uniquement les règles utilisables par les pages publiques (landing pages, boutiques). */\n";
fs.writeFileSync(OUT, header + root.toString());
console.log(`[landing-css] ${kept} règles gardées, ${dropped} retirées → app/landing-public.css`);
