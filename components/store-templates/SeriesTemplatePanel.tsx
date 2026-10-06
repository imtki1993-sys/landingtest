"use client";
// Éditeur des templates de boutique par séries (onglet Design de l'éditeur de boutique) :
// choix / changement de template, textes principaux, sections (ordre, visibilité, contenu).
import React, { useState } from "react";
import TemplateGallery from "./TemplateGallery";
import {
  SECTION_LABELS,
  getStoreTemplate,
  resolveSections,
  sectionContent,
  seedStoreSettings,
  type SxBlock,
  type SxItem,
  type SxSectionType,
} from "../../lib/store-templates";

/** Champs de texte remplacés quand on choisit d'appliquer aussi les textes du nouveau template. */
const TEXT_FIELDS = [
  "heroEyebrow",
  "heroTitle",
  "heroText",
  "heroButton",
  "heroSecondaryButton",
  "announcement",
  "collectionTitle",
  "collectionSubtitle",
];

/** Sections dont le contenu se règle ailleurs (produits, FAQ, catégories, logotype). */
const EDIT_FIELDS: Partial<Record<SxSectionType, (keyof SxBlock | "items")[]>> = {
  trust: ["title", "items"],
  categories: ["eyebrow", "title", "text"],
  promos: ["eyebrow", "title", "text", "button", "items"],
  showcase: ["eyebrow", "title", "text", "button", "items"],
  stats: ["title", "items"],
  wordmark: ["eyebrow"],
  testimonials: ["eyebrow", "title", "items"],
  newsletter: ["title", "text", "button"],
  faq: ["eyebrow", "title"],
  catalog: ["title"],
};
const FIELD_LABELS: Record<string, string> = {
  eyebrow: "Petit titre",
  title: "Titre",
  text: "Texte",
  button: "Bouton",
};

export default function SeriesTemplatePanel({ store, setStore, settings, setSettings, products }: any) {
  const t = getStoreTemplate(store?.template_id);
  const [choosing, setChoosing] = useState(!t);
  const [open, setOpen] = useState<string>("");
  const patch = (v: any) => setSettings({ ...settings, ...v });

  function applyTemplate(id: string) {
    const next = getStoreTemplate(id);
    if (!next) return;
    const replaceTexts =
      !t && !settings.heroTitle
        ? true
        : window.confirm(
            "Appliquer aussi les textes du template « " +
              next.name +
              " » ?\n\nOK : textes du template · Annuler : garder tes textes actuels (seuls le design et les sections changent).",
          );
    const seeded = seedStoreSettings(next, store.locale, settings);
    const kept = replaceTexts ? {} : Object.fromEntries(TEXT_FIELDS.map((k) => [k, settings[k] ?? ""]));
    setSettings({ ...seeded, ...kept });
    setStore({ ...store, template_id: id });
    setChoosing(false);
  }

  const own = t && settings.storeTemplateId === t.id;
  const sx = own ? settings.sx || {} : undefined;
  const sections = t ? resolveSections(t, sx) : null;
  const setSx = (v: any) => patch({ storeTemplateId: t!.id, sx: { ...(settings.sx || {}), ...v } });
  const move = (k: string, d: -1 | 1) => {
    const order = [...sections!.order];
    const i = order.indexOf(k as SxSectionType),
      j = i + d;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setSx({ order, hidden: Array.from(sections!.hidden) });
  };
  const toggle = (k: string) => {
    const hidden = new Set(sections!.hidden);
    hidden.has(k) ? hidden.delete(k) : hidden.add(k);
    setSx({ order: sections!.order, hidden: Array.from(hidden) });
  };
  const setBlock = (k: SxSectionType, v: Partial<SxBlock>) => {
    const content = { ...(settings.sx?.content || {}) };
    content[k] = { ...sectionContent(t!, store.locale, k, sx), ...v };
    setSx({ order: sections!.order, hidden: Array.from(sections!.hidden), content });
  };

  return (
    <div className="store-settings-card sx-panel">
      <div className="store-step-head">
        <span>▦</span>
        <div>
          <h2>Template de boutique</h2>
          <p>
            {t ? (
              <>
                Template actif : <b>{t.name}</b> · {t.niche} · <code>{t.folder}</code>
              </>
            ) : (
              "Cette boutique utilise le design généré par l’IA. Tu peux passer à un template de série."
            )}
          </p>
        </div>
      </div>
      <button type="button" className="sx-panel-toggle" onClick={() => setChoosing((v) => !v)}>
        {choosing ? "Masquer les templates" : t ? "Changer de template" : "Choisir un template"}
      </button>
      {choosing && (
        <TemplateGallery
          value={t?.id}
          onChange={applyTemplate}
          products={products}
          locale={store?.locale}
          storeName={store?.name}
        />
      )}

      {t && (
        <>
          <h3>Textes principaux</h3>
          <div className="sx-panel-fields">
            {[
              ["heroEyebrow", "Petit titre du hero"],
              ["heroTitle", "Titre du hero"],
              ["heroText", "Texte du hero"],
              ["heroButton", "Bouton principal"],
              ["heroSecondaryButton", "Bouton secondaire (vide = masqué)"],
              ["announcement", "Bandeau d’annonce"],
              ["collectionTitle", "Titre de la sélection de produits"],
              ["collectionSubtitle", "Sous-titre de la sélection"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                {k === "heroText" ? (
                  <textarea
                    value={settings[k] || ""}
                    onChange={(e) => patch({ [k]: e.target.value, storeTemplateId: t.id })}
                  />
                ) : (
                  <input
                    value={settings[k] || ""}
                    onChange={(e) => patch({ [k]: e.target.value, storeTemplateId: t.id })}
                  />
                )}
              </label>
            ))}
          </div>

          <h3>Sections de l’accueil</h3>
          <p className="store-layout-help">
            Réordonne, masque ou modifie chaque section. Les produits viennent de ton catalogue.
          </p>
          <div className="sx-panel-sections">
            {sections!.order.map((k, i) => {
              const hidden = sections!.hidden.has(k);
              const fields = EDIT_FIELDS[k];
              const b = sectionContent(t, store.locale, k, sx);
              return (
                <div key={k} className={"sx-panel-section" + (hidden ? " is-hidden" : "")}>
                  <div className="sx-panel-row">
                    <b>{SECTION_LABELS[k]}</b>
                    <span>
                      <button type="button" onClick={() => move(k, -1)} disabled={i === 0} aria-label="Monter">
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(k, 1)}
                        disabled={i === sections!.order.length - 1}
                        aria-label="Descendre"
                      >
                        ↓
                      </button>
                      <button type="button" onClick={() => toggle(k)}>
                        {hidden ? "Afficher" : "Masquer"}
                      </button>
                      {fields && (
                        <button type="button" onClick={() => setOpen(open === k ? "" : k)}>
                          {open === k ? "Fermer" : "Modifier"}
                        </button>
                      )}
                    </span>
                  </div>
                  {k === "testimonials" && hidden && (
                    <small className="sx-panel-hint">
                      Ajoute de vrais avis clients avant d’afficher cette section.
                    </small>
                  )}
                  {open === k && fields && (
                    <div className="sx-panel-fields">
                      {fields
                        .filter((f) => f !== "items")
                        .map((f) => (
                          <label key={f}>
                            {FIELD_LABELS[f]}
                            <input value={(b as any)[f] || ""} onChange={(e) => setBlock(k, { [f]: e.target.value })} />
                          </label>
                        ))}
                      {fields.includes("items") && (
                        <ItemsEditor
                          items={b.items || []}
                          withValue={k === "stats" || k === "promos"}
                          onChange={(items) => setBlock(k, { items })}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ItemsEditor({
  items,
  withValue,
  onChange,
}: {
  items: SxItem[];
  withValue: boolean;
  onChange: (items: SxItem[]) => void;
}) {
  const set = (i: number, v: Partial<SxItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...v } : x)));
  return (
    <div className="sx-panel-items">
      {items.map((x, i) => (
        <div key={i} className="sx-panel-item">
          {withValue && (
            <input
              value={x.value || ""}
              placeholder="Valeur ({products} = nombre de produits)"
              onChange={(e) => set(i, { value: e.target.value })}
            />
          )}
          <input value={x.title || ""} placeholder="Titre" onChange={(e) => set(i, { title: e.target.value })} />
          <input value={x.text || ""} placeholder="Texte" onChange={(e) => set(i, { text: e.target.value })} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Supprimer">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="sx-panel-add" onClick={() => onChange([...items, { title: "", text: "" }])}>
        + Ajouter un élément
      </button>
    </div>
  );
}
