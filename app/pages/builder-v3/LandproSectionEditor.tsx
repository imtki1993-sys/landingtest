"use client";
// Panneaux de l'éditeur pour les sections LandPro (avis, offres, comparatif…)
// et le choix du template / des couleurs. Branché dans BuilderV3.
import React, { useState } from "react";
import { uploadImages } from "../../../lib/builder-images";
import { TEMPLATES, defaultSectionOrder, getTemplate } from "../../../components/landpro/registry";
import { adaptLegacyContent, resolvePageTemplate } from "../../../components/landpro/legacy";

type Patch = (k: string, v: any) => void;
type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "color" | "textarea" | "select";
  options?: string[];
  width?: number;
};

const list = (draft: any, key: string): any[] => (Array.isArray(draft[key]) ? draft[key] : []);

function Rows({
  draft,
  patch,
  field,
  fields,
  addLabel,
  empty,
}: {
  draft: any;
  patch: Patch;
  field: string;
  fields: Field[];
  addLabel: string;
  empty: any;
}) {
  const rows = list(draft, field);
  const update = (i: number, k: string, v: any) =>
    patch(
      field,
      rows.map((r, j) => (j === i ? { ...(typeof r === "object" ? r : { [fields[0].key]: r }), [k]: v } : r)),
    );
  const move = (i: number, d: number) => {
    const next = [...rows];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    patch(field, next);
  };
  return (
    <div className="bv3-faq-editor">
      {rows.map((r: any, i: number) => {
        const obj = typeof r === "object" && r ? r : { [fields[0].key]: r };
        return (
          <div className="bv3-faq-item" key={i}>
            <div>
              <b>#{i + 1}</b>
              <span style={{ display: "flex", gap: 4 }}>
                <button type="button" title="Monter" onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" title="Descendre" onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  onClick={() =>
                    patch(
                      field,
                      rows.filter((_, j) => j !== i),
                    )
                  }
                >
                  ×
                </button>
              </span>
            </div>
            {fields.map((f) => (
              <label key={f.key}>
                {f.label}
                {f.type === "textarea" ? (
                  <textarea value={obj[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} />
                ) : f.type === "select" ? (
                  <select value={String(obj[f.key] ?? "")} onChange={(e) => update(i, f.key, e.target.value)}>
                    {(f.options || []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "color" ? "color" : "text"}
                    value={obj[f.key] ?? (f.type === "color" ? "#000000" : "")}
                    onChange={(e) => update(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        );
      })}
      <button type="button" className="bv3-add-faq" onClick={() => patch(field, [...rows, empty])}>
        + {addLabel}
      </button>
    </div>
  );
}

const Text = ({
  draft,
  patch,
  k,
  label,
  area,
  placeholder,
}: {
  draft: any;
  patch: Patch;
  k: string;
  label: string;
  area?: boolean;
  placeholder?: string;
}) => (
  <label>
    {label}
    {area ? (
      <textarea value={draft[k] || ""} placeholder={placeholder} onChange={(e) => patch(k, e.target.value)} />
    ) : (
      <input value={draft[k] || ""} placeholder={placeholder} onChange={(e) => patch(k, e.target.value)} />
    )}
  </label>
);

function ImageInput({ draft, patch, k, label }: { draft: any; patch: Patch; k: string; label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Text draft={draft} patch={patch} k={k} label={`${label} (URL)`} placeholder="Laisser vide = photo produit" />
      <label className="bv3-upload">
        Charger une image
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            setBusy(true);
            try {
              const urls = await uploadImages(files, 1);
              if (urls[0]) patch(k, urls[0]);
            } catch (err: any) {
              alert(err?.message || "Upload impossible");
            } finally {
              setBusy(false);
            }
          }}
        />
        <span>{busy ? "Chargement…" : "Choisir une image"}</span>
      </label>
      {draft[k] ? <img className="bv3-media-preview" src={draft[k]} alt="" /> : null}
    </>
  );
}

/** Champs d'une section LandPro sélectionnée dans l'éditeur. */
export default function LandproSectionEditor({
  draft,
  selected,
  patch,
}: {
  draft: any;
  selected: string;
  patch: Patch;
}) {
  const title = <Text draft={draft} patch={patch} k={`${selected}_title`} label="Titre de la section" />;
  switch (selected) {
    case "announcement":
      return (
        <Text
          draft={draft}
          patch={patch}
          k="announcement_text"
          label="Texte de la barre d'annonce"
          placeholder="🚚 Livraison gratuite · 💵 Paiement à la livraison"
        />
      );
    case "showcase":
      return (
        <>
          {title}
          <small>Les photos affichées sont celles du produit (onglet Médias / Hero).</small>
          <Text
            draft={draft}
            patch={patch}
            k="showcase_labels"
            label="Légendes des photos (une par ligne, facultatif)"
            area
            placeholder={"Face\nProfil\nArrière"}
          />
        </>
      );
    case "story":
      return (
        <>
          {<Text draft={draft} patch={patch} k="story_title" label="Titre" />}
          <Text
            draft={draft}
            patch={patch}
            k="story_text"
            label="Texte"
            area
            placeholder="Laisser vide = description du produit"
          />
        </>
      );
    case "before_after":
      return (
        <>
          {title}
          <ImageInput draft={draft} patch={patch} k="before_image" label="Image avant" />
          <ImageInput draft={draft} patch={patch} k="after_image" label="Image après" />
        </>
      );
    case "stats":
      return (
        <>
          {title}
          <Rows
            draft={draft}
            patch={patch}
            field="stats"
            addLabel="Ajouter un chiffre"
            empty={{ value: "", label: "" }}
            fields={[
              { key: "value", label: "Chiffre (ex. 12 000)" },
              { key: "label", label: "Libellé (ex. clients livrés)" },
            ]}
          />
        </>
      );
    case "ugc":
      return (
        <>
          {title}
          <Rows
            draft={draft}
            patch={patch}
            field="ugc_items"
            addLabel="Ajouter un créateur"
            empty={{ handle: "@", text: "" }}
            fields={[
              { key: "handle", label: "Compte (ex. @salma.beauty)" },
              { key: "text", label: "Citation", type: "textarea" },
            ]}
          />
        </>
      );
    case "reviews":
      return (
        <>
          {title}
          <small>
            N'ajoutez que de vrais avis de clients. La section reste masquée en ligne tant qu'elle est vide.
          </small>
          <Rows
            draft={draft}
            patch={patch}
            field="reviews"
            addLabel="Ajouter un avis"
            empty={{ name: "", city: "", rating: 5, text: "" }}
            fields={[
              { key: "name", label: "Nom" },
              { key: "city", label: "Ville" },
              { key: "rating", label: "Note (1 à 5)", type: "number" },
              { key: "text", label: "Avis", type: "textarea" },
            ]}
          />
        </>
      );
    case "comparison":
      return (
        <>
          {title}
          <Rows
            draft={draft}
            patch={patch}
            field="comparison_rows"
            addLabel="Ajouter une ligne"
            empty={{ label: "", us: "oui", them: "non" }}
            fields={[
              { key: "label", label: "Critère" },
              { key: "us", label: "Nous (oui / non / texte)" },
              { key: "them", label: "Autres (oui / non / texte)" },
            ]}
          />
        </>
      );
    case "specs":
      return (
        <>
          {title}
          <Rows
            draft={draft}
            patch={patch}
            field="specs"
            addLabel="Ajouter une caractéristique"
            empty={{ label: "", value: "" }}
            fields={[
              { key: "label", label: "Nom (ex. Poids)" },
              { key: "value", label: "Valeur (ex. 280 g)" },
            ]}
          />
        </>
      );
    case "variants":
      return (
        <>
          {title}
          <Rows
            draft={draft}
            patch={patch}
            field="variants"
            addLabel="Ajouter une variante"
            empty={{ name: "", color: "#111111" }}
            fields={[
              { key: "name", label: "Nom (ex. Noir)" },
              { key: "color", label: "Couleur", type: "color" },
            ]}
          />
        </>
      );
    case "offers":
      return (
        <>
          {title}
          <small>Ces offres alimentent aussi le formulaire de commande.</small>
          <Rows
            draft={draft}
            patch={patch}
            field="quantity_offers"
            addLabel="Ajouter une offre"
            empty={{ qty: 1, price: Number(draft.price || 0), label: "1 pièce", badge: "" }}
            fields={[
              { key: "label", label: "Libellé" },
              { key: "qty", label: "Quantité", type: "number" },
              { key: "price", label: "Prix total (DH)", type: "number" },
              { key: "badge", label: "Badge (optionnel)" },
            ]}
          />
          <label>
            Quantité sélectionnée par défaut
            <input
              type="number"
              min={1}
              value={draft.quantity_default_qty || 1}
              onChange={(e) => patch("quantity_default_qty", Number(e.target.value))}
            />
          </label>
        </>
      );
    case "countdown":
      return (
        <>
          {title}
          <label>
            Durée (minutes)
            <input
              type="number"
              min={5}
              value={draft.countdown_minutes || 360}
              onChange={(e) => patch("countdown_minutes", Number(e.target.value))}
            />
          </label>
        </>
      );
    case "video":
      return (
        <>
          {title}
          <Text
            draft={draft}
            patch={patch}
            k="video_url"
            label="URL de la vidéo"
            placeholder="https://youtube.com/watch?v=… ou https://…/video.mp4"
          />
        </>
      );
    case "whatsapp":
      return (
        <>
          {title}
          <small>Le bouton utilise le numéro WhatsApp de la boutique (paramètres de la page ou de l'espace).</small>
        </>
      );
    case "guarantee":
      return (
        <>
          <Text draft={draft} patch={patch} k="guarantee_title" label="Titre" />
          <Text draft={draft} patch={patch} k="guarantee_text" label="Texte" area />
        </>
      );
    case "final_cta":
      return (
        <>
          <Text draft={draft} patch={patch} k="final_cta_title" label="Titre" />
          <Text draft={draft} patch={patch} k="final_cta_text" label="Texte" area />
        </>
      );
    default:
      return null;
  }
}

/** Onglet Template : choix parmi les 60 templates, couleurs et mode de commande. */
export function LandproTemplatePanel({
  draft,
  commit,
  patch,
}: {
  draft: any;
  commit: (next: any) => void;
  patch: Patch;
}) {
  // Template réellement affiché (les anciennes pages sont converties automatiquement)
  const resolved = resolvePageTemplate(draft);
  const current = getTemplate(resolved.templateId);
  const apply = (id: string, resetSections: boolean) => {
    const t = getTemplate(id);
    // Ancienne page : la conversion faite à l'affichage est enregistrée avec le choix du template
    const base = resolved.legacy ? adaptLegacyContent(draft, { hasWhatsapp: true }) : draft;
    const customs = (Array.isArray(base.section_order) ? base.section_order : []).filter((k: string) =>
      k.startsWith("custom-"),
    );
    commit({
      ...base,
      landing_template_id: t.id,
      landing_template_accent: t.theme.primary,
      landing_template_dark: t.theme.dark,
      ...(resetSections ? { section_order: [...defaultSectionOrder(t), ...customs], hidden_sections: [] } : {}),
    });
  };
  return (
    <div className="bv3-landpro-template">
      <label>
        Template LandPro ({TEMPLATES.length})
        <select value={current.id} onChange={(e) => apply(e.target.value, true)}>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {String(t.number).padStart(2, "0")} · {t.name} — {t.category}
            </option>
          ))}
        </select>
      </label>
      <small>
        {current.description} Changer de template applique ses sections par défaut (vos blocs personnalisés sont
        conservés).
      </small>
      {resolved.legacy && (
        <small>
          Page créée avec l'ancien éditeur : elle s'affiche automatiquement avec ce template, contenu conservé.
          Choisissez un template pour l'enregistrer définitivement.
        </small>
      )}
      <button type="button" onClick={() => apply(current.id, true)}>
        ↺ Remettre les sections par défaut du template
      </button>
      <label>
        Couleur principale
        <input
          type="color"
          value={draft.theme_primary || current.theme.primary}
          onChange={(e) => patch("theme_primary", e.target.value)}
        />
      </label>
      <label>
        Couleur d'accent (prix, badges)
        <input
          type="color"
          value={draft.theme_accent || current.theme.accent}
          onChange={(e) => patch("theme_accent", e.target.value)}
        />
      </label>
      {(draft.theme_primary || draft.theme_accent) && (
        <button type="button" onClick={() => commit({ ...draft, theme_primary: "", theme_accent: "" })}>
          Revenir aux couleurs du template
        </button>
      )}
      <label>
        Mode de commande
        <select
          value={draft.order_mode || current.options?.orderMode || "form"}
          onChange={(e) => patch("order_mode", e.target.value)}
        >
          <option value="form">Formulaire COD</option>
          <option value="both">Formulaire + WhatsApp</option>
          <option value="whatsapp">WhatsApp uniquement</option>
        </select>
      </label>
      <hr />
    </div>
  );
}
