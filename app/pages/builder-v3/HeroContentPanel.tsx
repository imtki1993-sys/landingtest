"use client";
// Contenu du hero : tous les textes, boutons, avantages et éléments affichés.
// Un champ vide garde le texte du template (affiché en gris dans le champ).
import React, { useMemo } from "react";
import { buildVM } from "../../../components/landpro/model";
import { getTemplate, SECTION_LABELS } from "../../../components/landpro/registry";
import { resolvePageTemplate } from "../../../components/landpro/legacy";
import { DESIGNS } from "../../../components/landpro/designs";

type Patch = (k: string, v: any) => void;

function Field({
  label,
  hint,
  value,
  placeholder,
  onChange,
  area,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: any;
  placeholder?: string;
  onChange: (v: string) => void;
  area?: boolean;
  type?: string;
}) {
  return (
    <label>
      {label}
      {area ? (
        <textarea value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Toggle({ draft, patch, k, label }: { draft: any; patch: Patch; k: string; label: string }) {
  return (
    <label className="bv3-check">
      <input type="checkbox" checked={draft[k] !== false} onChange={(e) => patch(k, e.target.checked)} /> {label}
    </label>
  );
}

const SHAPES: [string, string][] = [
  ["", "Template"],
  ["square", "Carrée"],
  ["rounded", "Arrondie"],
  ["soft", "Très arrondie"],
  ["arch", "Arche"],
  ["circle", "Cercle"],
];
const RATIOS: [string, string][] = [
  ["", "Celles du template"],
  ["1/1", "Carré (1:1)"],
  ["4/5", "Portrait (4:5)"],
  ["3/4", "Portrait haut (3:4)"],
  ["9/16", "Story (9:16)"],
  ["4/3", "Paysage (4:3)"],
  ["16/9", "Large (16:9)"],
];
const HERO_IMG_KEYS = [
  "hero_img_shape",
  "hero_img_ratio",
  "hero_img_fit",
  "hero_img_pos",
  "hero_img_size",
  "hero_img_shadow",
];

function Seg({
  value,
  options,
  onChange,
}: {
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div className="bv3-sx-seg bv3-hx-seg">
      {options.map(([v, l]) => (
        <button key={v || "tpl"} type="button" className={value === v ? "active" : ""} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

/** Pourquoi la forme de l'image n'a pas d'effet sur ce template (vide = elle en a). */
function shapeUnsupported(draft: any): string {
  const id = resolvePageTemplate(draft).templateId;
  if (DESIGNS[id])
    return "Ce design sur mesure compose son hero autour d'une image de scène : sa forme reste celle du design.";
  const t = getTemplate(id);
  if (t.pieces?.hero === "hero-avant-apres")
    return "Ce hero compare deux photos avant / après : leur forme reste celle du template.";
  if (t.hero.variant === "fullbleed")
    return "Ce template affiche la photo en fond plein écran : elle n'a pas de forme à régler.";
  if (t.hero.variant === "video") return "Ce template affiche une vidéo à la place de la photo.";
  if (t.hero.variant === "whatsapp") return "Ce template montre la photo dans une conversation WhatsApp.";
  return "";
}

/** Forme de l'image principale du hero : forme, proportions, remplissage, cadrage, taille, ombre. */
function HeroImageShape({ draft, patch }: { draft: any; patch: Patch }) {
  const why = shapeUnsupported(draft);
  if (why) return <p className="bv3-sx-note">{why}</p>;
  const v = (k: string) => String(draft[k] ?? "");
  const fit = v("hero_img_fit");
  const size = Number(draft.hero_img_size) || 100;
  const touched = HERO_IMG_KEYS.some((k) => v(k) !== "");
  return (
    <div className="bv3-hx">
      <span className="bv3-sx-label">Forme</span>
      <div className="bv3-hx-shapes">
        {SHAPES.map(([k, l]) => (
          <button
            key={k || "tpl"}
            type="button"
            className={v("hero_img_shape") === k ? "active" : ""}
            onClick={() => patch("hero_img_shape", k)}
            title={l}
          >
            <i className={"bv3-hx-ico is-" + (k || "tpl")} />
            {l}
          </button>
        ))}
      </div>
      <label className="bv3-sx-row">
        <span>Proportions</span>
        <select
          value={v("hero_img_shape") === "circle" ? "1/1" : v("hero_img_ratio")}
          disabled={v("hero_img_shape") === "circle"}
          onChange={(e) => patch("hero_img_ratio", e.target.value)}
        >
          {RATIOS.map(([k, l]) => (
            <option key={k || "tpl"} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <span className="bv3-sx-label">Remplissage</span>
      <Seg
        value={v("hero_img_fit")}
        options={[
          ["", "Template"],
          ["cover", "Remplir le cadre"],
          ["contain", "Image entière"],
        ]}
        onChange={(x) => patch("hero_img_fit", x)}
      />
      {fit === "cover" || (fit !== "contain" && (v("hero_img_ratio") || v("hero_img_shape"))) ? (
        <>
          <span className="bv3-sx-label">Partie visible</span>
          <Seg
            value={v("hero_img_pos")}
            options={[
              ["top", "Haut"],
              ["", "Centre"],
              ["bottom", "Bas"],
            ]}
            onChange={(x) => patch("hero_img_pos", x)}
          />
        </>
      ) : null}
      <label className="bv3-sx-row bv3-hx-size">
        <span>Taille</span>
        <input
          type="range"
          min={40}
          max={100}
          step={5}
          value={size}
          onChange={(e) => patch("hero_img_size", Number(e.target.value) >= 100 ? "" : Number(e.target.value))}
        />
        <b>{size} %</b>
      </label>
      <span className="bv3-sx-label">Ombre</span>
      <Seg
        value={v("hero_img_shadow")}
        options={[
          ["", "Template"],
          ["none", "Aucune"],
          ["soft", "Légère"],
          ["strong", "Forte"],
        ]}
        onChange={(x) => patch("hero_img_shadow", x)}
      />
      {touched ? (
        <button type="button" className="bv3-sx-reset" onClick={() => HERO_IMG_KEYS.forEach((k) => patch(k, ""))}>
          Revenir à l&apos;image du template
        </button>
      ) : null}
    </div>
  );
}

/** Champs du hero. `editing` = page en cours (nom, langue) pour afficher les textes réellement utilisés. */
export default function HeroContentPanel({ draft, patch, editing }: { draft: any; patch: Patch; editing?: any }) {
  // Valeurs actuellement affichées par le template, montrées en exemple dans les champs vides
  const vm = useMemo(
    () =>
      buildVM({
        name: editing?.name || "",
        locale: editing?.locale || "ar-MA",
        price: Number(draft.price || 0),
        oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
        images: draft.images || [],
        content: { ...draft, hero_trust: "", hero_points: "", hero_kicker: "", hero_cta2_text: "" },
      } as any),
    [draft, editing?.name, editing?.locale],
  );
  const headline = String(draft.headline || "");
  const highlight = String(draft.hero_highlight || "").trim();
  const highlightMissing = !!highlight && !headline.toLowerCase().includes(highlight.toLowerCase());
  const targets = (Array.isArray(draft.section_order) ? draft.section_order : [])
    .filter((k: string) => k !== "hero" && !k.startsWith("custom-"))
    .map((k: string) => [k, (SECTION_LABELS as Record<string, string>)[k] || k]);

  return (
    <div className="bv3-hero-content">
      <b className="bv3-sx-sub">Textes</b>
      <Field
        label="Nom du produit"
        value={draft.product_name}
        placeholder={editing?.name || ""}
        hint="Utilisé par certains templates (signature, message WhatsApp, texte des images)."
        onChange={(v) => patch("product_name", v)}
      />
      <Field
        label="Accroche promo"
        value={draft.hero_kicker}
        placeholder="Ex. Offre de lancement, Vente flash…"
        hint="Ligne au-dessus du titre ou sur la pastille promo, selon le template. Vide = texte du template."
        onChange={(v) => patch("hero_kicker", v)}
      />
      <Field
        label="Badge"
        value={draft.hero_badge_text}
        placeholder={vm.eyebrow || "الدفع عند الاستلام"}
        onChange={(v) => patch("hero_badge_text", v)}
      />
      <Field label="Titre" value={draft.headline} onChange={(v) => patch("headline", v)} />
      <Field
        label="Mot mis en valeur"
        value={draft.hero_highlight}
        placeholder="Un mot ou une partie du titre"
        hint={
          highlightMissing
            ? "⚠ Ce texte n'est pas dans le titre : il ne sera pas mis en valeur."
            : "Affiché dans la couleur d'accent, à l'intérieur du titre."
        }
        onChange={(v) => patch("hero_highlight", v)}
      />
      <Field label="Sous-titre" value={draft.subheadline} area onChange={(v) => patch("subheadline", v)} />

      <b className="bv3-sx-sub">Prix</b>
      <Field label="Prix" type="number" value={draft.price} onChange={(v) => patch("price", v)} />
      <Field label="Ancien prix (barré)" type="number" value={draft.oldPrice} onChange={(v) => patch("oldPrice", v)} />
      <Field label="Devise" value={draft.currency} placeholder="DH" onChange={(v) => patch("currency", v)} />

      <b className="bv3-sx-sub">Boutons</b>
      <Field
        label="Bouton principal"
        value={draft.cta}
        placeholder={vm.cta}
        hint="Boutons qui mènent au formulaire, sur toute la page."
        onChange={(v) => patch("cta", v)}
      />
      <Field
        label="Bouton du formulaire"
        value={draft.form_cta}
        placeholder={draft.cta || "Même texte que le bouton principal"}
        hint="Celui qui envoie la commande."
        onChange={(v) => patch("form_cta", v)}
      />
      <Field
        label="Bouton secondaire"
        value={draft.hero_cta2_text}
        placeholder="Ex. Voir la vidéo, Découvrir…"
        hint="Vide = texte du template (ou pas de bouton si le template n'en a pas)."
        onChange={(v) => patch("hero_cta2_text", v)}
      />
      <label>
        Le bouton secondaire mène à
        <select value={draft.hero_cta2_target || ""} onChange={(e) => patch("hero_cta2_target", e.target.value)}>
          <option value="">La section prévue par le template</option>
          <option value="order">Formulaire de commande</option>
          {targets.map(([k, l]: [string, string]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <b className="bv3-sx-sub">Avantages sous les boutons</b>
      <Field
        label="Un avantage par ligne"
        area
        value={Array.isArray(draft.hero_trust) ? draft.hero_trust.join("\n") : draft.hero_trust}
        placeholder={vm.trust.slice(0, 3).join("\n")}
        hint="Vide = ceux de la section Confiance."
        onChange={(v) => patch("hero_trust", v)}
      />

      <b className="bv3-sx-sub">Liste à cocher</b>
      <Field
        label="Un point par ligne"
        area
        value={Array.isArray(draft.hero_points) ? draft.hero_points.join("\n") : draft.hero_points}
        placeholder={vm.hero.points.slice(0, 5).join("\n")}
        hint="Liste avec coches à côté de l'image (selon le template). Vide = titres de la section Bénéfices."
        onChange={(v) => patch("hero_points", v)}
      />

      <b className="bv3-sx-sub">Éléments affichés</b>
      <Toggle draft={draft} patch={patch} k="hero_show_kicker" label="Accroche promo" />
      <Toggle draft={draft} patch={patch} k="hero_show_badge" label="Badge" />
      <Toggle draft={draft} patch={patch} k="hero_show_subtitle" label="Sous-titre" />
      <Toggle draft={draft} patch={patch} k="hero_show_price" label="Prix" />
      <Toggle draft={draft} patch={patch} k="hero_show_cta" label="Bouton principal" />
      <Toggle draft={draft} patch={patch} k="hero_show_cta2" label="Bouton secondaire" />
      <Toggle draft={draft} patch={patch} k="hero_show_trust" label="Avantages" />
      <Toggle draft={draft} patch={patch} k="hero_show_points" label="Liste à cocher" />
      <Toggle draft={draft} patch={patch} k="hero_show_rating" label="Note des avis clients" />
      <b className="bv3-sx-sub">Image principale : forme</b>
      <HeroImageShape draft={draft} patch={patch} />
      <b className="bv3-sx-sub">Images</b>
    </div>
  );
}
