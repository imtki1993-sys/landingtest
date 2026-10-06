"use client";
// Éditeur de l'accueil d'une boutique en template de série : liste des sections
// (ordre, visibilité, copie, suppression), réglages de chaque section et
// bibliothèque pour en ajouter (sections du template ou blocs personnalisés).
import React, { useMemo, useState } from "react";
import {
  ADDABLE_SECTIONS,
  SECTION_LABELS,
  getStoreTemplate,
  resolveSections,
  sectionContent,
  sectionType,
  type SxBlock,
  type SxSectionType,
} from "../../../lib/store-templates";
import { addCustomSection, addSection, type SxEditAction } from "../../../lib/store-templates/editing";
import { homeAction } from "./actions";
import { createStoreBlock } from "../../../lib/store-section-engine";
import { ImagePicker, ItemsEditor, TextField, uploadStoreImage } from "./fields";

const SECTION_HELP: Partial<Record<SxSectionType, string>> = {
  products: "Grille de produits. Les copies peuvent afficher une seule catégorie.",
  catalog: "Tous les produits avec filtre par catégorie et tri.",
  promos: "Deux bannières (ou une grande selon le template) avec image.",
  showcase: "Image + texte pour présenter la boutique ou une collection.",
  categories: "Une vignette par catégorie de produits.",
  trust: "Livraison, paiement, échanges, service client…",
  stats: "Chiffres clés ; {products} et {categories} sont calculés automatiquement.",
  testimonials: "À remplir avec de vrais avis clients.",
  newsletter: "Bandeau avec un bouton vers la page Contact.",
  faq: "Les questions se modifient dans Pages > FAQ.",
  wordmark: "Le nom de la boutique en très grand.",
  marquee: "Mots qui défilent en continu ; vide = noms des catégories.",
  bento: "Jusqu'à 4 cartes avec chiffre, texte et image ; {products} et {categories} sont calculés.",
  rows: "Liste en lignes (numéro, titre, texte, image) avec un lien vers la boutique.",
  spotlight: "Grande image plein écran avec un titre et un bouton.",
  features: "Cartes à encoche avec icône dessinée. Un mot entre *étoiles* est mis en couleur.",
  photostats: "Grande photo et jusqu'à 3 chiffres ; {products} et {categories} sont calculés.",
};
const CUSTOM_TYPES: [string, string][] = [
  ["text", "Texte"],
  ["imageText", "Image + texte"],
  ["image", "Image"],
  ["gallery", "Galerie"],
  ["video", "Vidéo (lien)"],
  ["cta", "Bouton d'action"],
];

export default function HomeSectionsPanel({
  store,
  settings,
  setSettings,
  products,
  selected,
  select,
  uploadHeroImage,
}: {
  store: any;
  settings: any;
  setSettings: (s: any) => void;
  products: any[];
  selected: string;
  /** ouvre une section (et la montre dans l'aperçu) */
  select: (key: string) => void;
  uploadHeroImage: (e: any) => void;
}) {
  const t = getStoreTemplate(store.template_id)!;
  const [library, setLibrary] = useState(false);
  const sx = settings.sx || {};
  const customBlocks: any[] = Array.isArray(settings.pageSections?.home) ? settings.pageSections.home : [];
  const customIds = customBlocks.map((b) => b.id);
  const { order, hidden } = resolveSections(t, sx, customIds);
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => String(p?.specifications?.category || "").trim()).filter(Boolean))),
    [products],
  );
  const own = { ...settings, storeTemplateId: t.id };

  const setSx = (next: any) => setSettings({ ...own, sx: next });
  function act(key: string, action: SxEditAction) {
    if (action === "delete" && !window.confirm("Supprimer cette section de l'accueil ?")) return;
    setSettings(homeAction(settings, t.id, key, action));
  }
  function add(type: SxSectionType) {
    const r = addSection(t, sx, customIds, type, selected || undefined);
    setSx(r.sx);
    setLibrary(false);
    select(r.key);
  }
  function addCustom(type: string) {
    const block: any = createStoreBlock(type, store.name);
    const nextIds = [...customIds, block.id];
    setSettings({
      ...own,
      sx: addCustomSection(t, sx, nextIds, block.id, selected || undefined),
      pageSections: { ...(settings.pageSections || {}), home: [...customBlocks, block] },
    });
    setLibrary(false);
    select("custom:" + block.id);
  }
  function setBlock(key: string, patch: Partial<SxBlock>) {
    const content = { ...(sx.content || {}) };
    content[key] = { ...(sx.content?.[key] || {}), ...patch };
    setSx({ ...sx, order, hidden: Array.from(hidden), content });
  }
  function setCustom(id: string, patch: any) {
    setSettings({
      ...own,
      pageSections: {
        ...(settings.pageSections || {}),
        home: customBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      },
    });
  }
  const label = (k: string) => {
    const type = sectionType(k);
    if (type === "custom") {
      const b = customBlocks.find((x) => x.id === k.slice(7));
      return (CUSTOM_TYPES.find((x) => x[0] === b?.type)?.[1] || "Bloc") + (b?.title ? " · " + b.title : "");
    }
    return (type ? SECTION_LABELS[type] : k) + (k.includes("~") ? " (copie)" : "");
  };

  return (
    <div className="store-settings-card sxe-panel">
      <div className="sxe-panel-head">
        <h2>Sections de l'accueil</h2>
        <p>Clique sur une section ici ou directement dans l'aperçu pour la modifier.</p>
      </div>
      <div className="sxe-sections">
        {order.map((k, i) => {
          const isOpen = selected === k;
          const isHidden = hidden.has(k);
          const type = sectionType(k);
          return (
            <div key={k} className={"sxe-section" + (isOpen ? " open" : "") + (isHidden ? " is-hidden" : "")}>
              <div className="sxe-section-row">
                <button type="button" className="sxe-section-name" onClick={() => select(isOpen ? "" : k)}>
                  <span>{isOpen ? "▾" : "▸"}</span>
                  {label(k)}
                  {isHidden && <em>masquée</em>}
                </button>
                <span className="sxe-section-actions">
                  {k !== "hero" && (
                    <>
                      <button type="button" title="Monter" onClick={() => act(k, "up")} disabled={i <= 1}>
                        ↑
                      </button>
                      <button
                        type="button"
                        title="Descendre"
                        onClick={() => act(k, "down")}
                        disabled={i === order.length - 1}
                      >
                        ↓
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    title={isHidden ? "Afficher" : "Masquer"}
                    onClick={() => act(k, isHidden ? "show" : "hide")}
                  >
                    {isHidden ? "◉" : "◌"}
                  </button>
                  {k !== "hero" && (
                    <>
                      <button type="button" title="Dupliquer" onClick={() => act(k, "duplicate")}>
                        ⧉
                      </button>
                      <button type="button" title="Supprimer" className="sxe-danger" onClick={() => act(k, "delete")}>
                        ×
                      </button>
                    </>
                  )}
                </span>
              </div>
              {isOpen && (
                <div className="sxe-section-body">
                  {type === "custom" ? (
                    <CustomBlockEditor
                      block={customBlocks.find((b) => b.id === k.slice(7))}
                      onChange={(patch) => setCustom(k.slice(7), patch)}
                      storeId={store.id}
                      products={products}
                    />
                  ) : type === "hero" ? (
                    <>
                      <HeroEditor settings={own} setSettings={setSettings} uploadHeroImage={uploadHeroImage} />
                      {/* cartes sous le hero (templates qui en ont) */}
                      {(t.copy.fr.sections.hero?.items?.length || 0) > 0 && (
                        <div className="sxe-hero-cards">
                          <span className="sxe-label">Cartes sous la bannière</span>
                          <small className="sxe-hint">
                            Un mot entre *étoiles* est mis en couleur. Le chiffre peut être {"{products}"} ou{" "}
                            {"{categories}"}.
                          </small>
                          <ItemsEditor
                            items={sectionContent(t, store.locale, "hero", sx).items || []}
                            onChange={(items) => setBlock("hero", { items })}
                            withValue
                            valueLabel="Chiffre (carte 1)"
                            withImage
                            storeId={store.id}
                            products={products}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    type && (
                      <SectionFields
                        k={k}
                        type={type}
                        block={sectionContent(t, store.locale, k, sx)}
                        onChange={(patch) => setBlock(k, patch)}
                        settings={own}
                        setSettings={setSettings}
                        storeId={store.id}
                        products={products}
                        categories={categories}
                        promosLayout={t.promos}
                        ctaPhoto={!!t.ctaPhoto}
                        sx={sx}
                        setSx={setSx}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" className="sxe-add sxe-add-big" onClick={() => setLibrary((v) => !v)}>
        {library ? "Fermer la bibliothèque" : "+ Ajouter une section"}
      </button>
      {library && (
        <div className="sxe-library">
          <small>
            {selected ? "Ajoutée après la section ouverte." : "Ajoutée à la fin de l'accueil."} Sections du template :
          </small>
          <div className="sxe-library-grid">
            {ADDABLE_SECTIONS.map((type) => (
              <button key={type} type="button" onClick={() => add(type)}>
                <b>{SECTION_LABELS[type]}</b>
                <small>{SECTION_HELP[type]}</small>
              </button>
            ))}
          </div>
          <small>Blocs libres :</small>
          <div className="sxe-library-grid">
            {CUSTOM_TYPES.map(([type, l]) => (
              <button key={type} type="button" onClick={() => addCustom(type)}>
                <b>{l}</b>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── hero ───────── */
function HeroEditor({ settings, setSettings, uploadHeroImage }: any) {
  const set = (k: string) => (v: string) => setSettings({ ...settings, [k]: v });
  const images: string[] = Array.isArray(settings.heroImages) ? settings.heroImages.filter(Boolean) : [];
  return (
    <>
      <TextField label="Petit titre" value={settings.heroEyebrow} onChange={set("heroEyebrow")} />
      <TextField label="Titre" value={settings.heroTitle} onChange={set("heroTitle")} />
      <TextField
        label="Mots mis en valeur (repris du titre, vide = aucun)"
        value={settings.heroHighlight}
        onChange={set("heroHighlight")}
      />
      <TextField label="Texte" value={settings.heroText} onChange={set("heroText")} multiline />
      <TextField label="Bouton principal" value={settings.heroButton} onChange={set("heroButton")} />
      <TextField
        label="Bouton secondaire (vide = masqué)"
        value={settings.heroSecondaryButton}
        onChange={set("heroSecondaryButton")}
      />
      <div className="sxe-image">
        <span className="sxe-label">Images du hero</span>
        <div className="sxe-pick-grid sxe-hero-imgs">
          {images.map((src, i) => (
            <div key={src + i} className="sxe-hero-img">
              <img src={src} alt="" />
              <button
                type="button"
                className="sxe-danger"
                aria-label="Retirer"
                onClick={() => {
                  const next = images.filter((_, j) => j !== i);
                  setSettings({ ...settings, heroImages: next, heroImage: next[0] || "" });
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="sxe-btn">
          Téléverser des images
          <input type="file" accept="image/*" multiple hidden onChange={uploadHeroImage} />
        </label>
        <small className="sxe-hint">Sans image, la première photo de tes produits est utilisée.</small>
      </div>
      <TextField
        label="Bandeau d'annonce (tout en haut)"
        value={settings.announcement}
        onChange={set("announcement")}
      />
      <label className="sxe-check">
        <input
          type="checkbox"
          checked={settings.showAnnouncement !== false}
          onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
        />
        Afficher le bandeau d'annonce
      </label>
    </>
  );
}

/* ───────── sections du template ───────── */
function SectionFields({
  k,
  type,
  block,
  onChange,
  settings,
  setSettings,
  storeId,
  products,
  categories,
  promosLayout,
  ctaPhoto = false,
  sx,
  setSx,
}: {
  k: string;
  type: SxSectionType;
  block: SxBlock;
  onChange: (patch: Partial<SxBlock>) => void;
  settings: any;
  setSettings: (s: any) => void;
  storeId: string;
  products: any[];
  categories: string[];
  promosLayout: string;
  ctaPhoto?: boolean;
  sx: any;
  setSx: (sx: any) => void;
}) {
  const f = (key: keyof SxBlock, label: string, multiline = false) => (
    <TextField
      label={label}
      value={(block as any)[key]}
      onChange={(v) => onChange({ [key]: v } as Partial<SxBlock>)}
      multiline={multiline}
    />
  );
  const img = (key: "image" | "image2", label: string) => (
    <ImagePicker
      label={label}
      value={block[key]}
      onChange={(v) => onChange({ [key]: v })}
      storeId={storeId}
      products={products}
    />
  );
  const help = SECTION_HELP[type];
  return (
    <>
      {help && <small className="sxe-hint sxe-help">{help}</small>}
      {type === "products" &&
        (k === "products" ? (
          <>
            <TextField
              label="Titre"
              value={settings.collectionTitle}
              onChange={(v) => setSettings({ ...settings, collectionTitle: v })}
            />
            <TextField
              label="Sous-titre"
              value={settings.collectionSubtitle}
              onChange={(v) => setSettings({ ...settings, collectionSubtitle: v })}
            />
          </>
        ) : (
          <>
            {f("title", "Titre")}
            {f("text", "Sous-titre")}
          </>
        ))}
      {type === "products" && (
        <label className="sxe-field">
          <span>Produits affichés</span>
          <select value={block.category || ""} onChange={(e) => onChange({ category: e.target.value })}>
            <option value="">Tous les produits</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                Catégorie : {c}
              </option>
            ))}
          </select>
        </label>
      )}
      {type === "catalog" && f("title", "Titre")}
      {["promos", "showcase", "categories", "trust", "stats", "testimonials", "newsletter", "faq"].includes(type) && (
        <>
          {type !== "trust" && type !== "stats" && (type !== "newsletter" || ctaPhoto) && f("eyebrow", "Petit titre")}
          {f("title", "Titre")}
          {["promos", "showcase", "categories", "newsletter"].includes(type) && f("text", "Texte", true)}
          {["promos", "showcase", "newsletter"].includes(type) && f("button", "Bouton")}
        </>
      )}
      {type === "wordmark" && f("eyebrow", "Petit texte manuscrit")}
      {["features", "photostats"].includes(type) && (
        <>
          {f("eyebrow", "Petit titre")}
          {f("title", "Titre (mot entre *étoiles* = souligné)")}
          {f("text", "Texte", true)}
          {type === "photostats" && img("image", "Photo")}
          <ItemsEditor
            items={block.items || []}
            onChange={(items) => onChange({ items })}
            withValue={type === "photostats"}
            valueLabel="Chiffre ({products}, {categories} ou texte)"
            storeId={storeId}
            products={products}
          />
        </>
      )}
      {type === "newsletter" && ctaPhoto && img("image", "Photo")}
      {["bento", "rows", "spotlight"].includes(type) && (
        <>
          {f("eyebrow", "Petit titre")}
          {f("title", "Titre")}
          {f("text", "Texte", true)}
          {type !== "bento" && f("button", "Bouton")}
        </>
      )}
      {type === "spotlight" && img("image", "Grande image")}
      {["marquee", "bento", "rows"].includes(type) && (
        <ItemsEditor
          items={block.items || []}
          onChange={(items) => onChange({ items })}
          withValue={type !== "marquee"}
          valueLabel={type === "bento" ? "Chiffre ({products}, {categories} ou texte)" : "Numéro ou étiquette"}
          withImage={type !== "marquee"}
          storeId={storeId}
          products={products}
          addLabel={type === "marquee" ? "+ Ajouter un mot" : "+ Ajouter un élément"}
        />
      )}
      {type === "showcase" && (
        <>
          {img("image", "Image principale")}
          {img("image2", "Petite image")}
        </>
      )}
      {type === "promos" && promosLayout === "banner" && (
        <>
          {img("image", "Grande image")}
          {img("image2", "Image 2")}
        </>
      )}
      {((type === "promos" && promosLayout !== "banner") ||
        type === "showcase" ||
        type === "trust" ||
        type === "stats" ||
        type === "testimonials") && (
        <ItemsEditor
          items={block.items || []}
          onChange={(items) => onChange({ items })}
          withValue={type === "stats" || type === "promos"}
          valueLabel={
            type === "stats" ? "Chiffre ({products}, {categories} ou texte)" : "Étiquette (ou couleur #rrggbb)"
          }
          withImage={type === "promos" && promosLayout !== "banner"}
          storeId={storeId}
          products={products}
          addLabel={type === "testimonials" ? "+ Ajouter un avis" : "+ Ajouter un élément"}
        />
      )}
      {type === "categories" && (
        <div className="sxe-cat-images">
          <span className="sxe-label">Image de chaque catégorie</span>
          {categories.length === 0 && (
            <small className="sxe-hint">Aucune catégorie : renseigne-la dans tes produits.</small>
          )}
          {categories.map((c) => (
            <ImagePicker
              key={c}
              label={c}
              value={sx.categoryImages?.[c]}
              onChange={(v) => setSx({ ...sx, categoryImages: { ...(sx.categoryImages || {}), [c]: v } })}
              storeId={storeId}
              products={products}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ───────── blocs personnalisés ───────── */
function CustomBlockEditor({
  block,
  onChange,
  storeId,
  products,
}: {
  block: any;
  onChange: (patch: any) => void;
  storeId: string;
  products: any[];
}) {
  if (!block) return null;
  const field = (key: string, label: string, multiline = false) => (
    <TextField label={label} value={block[key]} onChange={(v) => onChange({ [key]: v })} multiline={multiline} />
  );
  async function addGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    try {
      const urls = await Promise.all(files.slice(0, 8).map((f) => uploadStoreImage(storeId, f)));
      onChange({ images: [...(block.images || []), ...urls].slice(0, 12) });
    } catch (err: any) {
      alert(err?.message || "Téléversement impossible");
    }
  }
  return (
    <>
      {["text", "imageText", "cta", "video", "image", "gallery"].includes(block.type) && field("title", "Titre")}
      {["text", "imageText"].includes(block.type) && field("text", "Texte", true)}
      {block.type === "cta" && (
        <>
          {field("button", "Bouton")}
          {field("url", "Lien du bouton (vide = Boutique)")}
        </>
      )}
      {block.type === "video" && field("url", "Lien de la vidéo (YouTube, TikTok…)")}
      {["imageText", "image"].includes(block.type) && (
        <ImagePicker
          label="Image"
          value={block.image}
          onChange={(v) => onChange({ image: v })}
          storeId={storeId}
          products={products}
          hint=""
        />
      )}
      {block.type === "gallery" && (
        <div className="sxe-image">
          <span className="sxe-label">Images de la galerie</span>
          <div className="sxe-pick-grid sxe-hero-imgs">
            {(block.images || []).map((src: string, i: number) => (
              <div key={src + i} className="sxe-hero-img">
                <img src={src} alt="" />
                <button
                  type="button"
                  className="sxe-danger"
                  aria-label="Retirer"
                  onClick={() => onChange({ images: block.images.filter((_: string, j: number) => j !== i) })}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="sxe-btn">
            Téléverser des images
            <input type="file" accept="image/*" multiple hidden onChange={addGallery} />
          </label>
        </div>
      )}
    </>
  );
}
