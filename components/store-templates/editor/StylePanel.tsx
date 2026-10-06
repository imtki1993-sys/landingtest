"use client";
// Template & style d'une boutique en template de série : changer ou essayer un
// template, logo, couleurs, arrondis, polices, hero et mise en page pièce par pièce.
import React, { useState } from "react";
import TemplateGallery from "../TemplateGallery";
import {
  HERO_CHOICES,
  LAYOUT_CHOICES,
  effectiveTemplate,
  getStoreTemplate,
  seedStoreSettings,
  type SxLayout,
} from "../../../lib/store-templates";
import { resetStyle } from "../../../lib/store-templates/editing";
import { ChoiceField, ImagePicker, TextField } from "./fields";

const FONTS = [
  "Inter",
  "Poppins",
  "Manrope",
  "Space Grotesk",
  "Montserrat",
  "DM Sans",
  "Oswald",
  "Playfair Display",
  "DM Serif Display",
  "Lato",
  "Nunito",
  "Cairo",
  "Tajawal",
  "Almarai",
];
/** Champs de texte remplacés quand on applique aussi les textes du nouveau template. */
const TEXT_FIELDS = [
  "heroEyebrow",
  "heroTitle",
  "heroHighlight",
  "heroText",
  "heroButton",
  "heroSecondaryButton",
  "announcement",
  "collectionTitle",
  "collectionSubtitle",
];
const LAYOUT_LABELS: Record<keyof SxLayout, string> = {
  header: "Header",
  card: "Carte produit",
  faq: "FAQ",
  footer: "Pied de page",
  shop: "Page Boutique",
  product: "Fiche produit",
  page: "En-tête des pages (Livraison, Contact…)",
};

/** Réglages d'une boutique basculée sur un autre template (textes gardés ou non). */
export function switchTemplateSettings(settings: any, nextId: string, locale: string, replaceTexts: boolean) {
  const next = getStoreTemplate(nextId);
  if (!next) return settings;
  const seeded = seedStoreSettings(next, locale, settings);
  const kept = replaceTexts ? {} : Object.fromEntries(TEXT_FIELDS.map((k) => [k, settings[k] ?? ""]));
  // les blocs personnalisés de l'accueil sont conservés à la suite des sections du nouveau template
  const customKeys = (Array.isArray(settings.sx?.order) ? settings.sx.order : []).filter((k: string) =>
    k.startsWith("custom:"),
  );
  return {
    ...seeded,
    ...kept,
    sx: { ...seeded.sx, order: [...seeded.sx.order, ...customKeys], categoryImages: settings.sx?.categoryImages },
  };
}

export default function StylePanel({
  store,
  setStore,
  settings,
  setSettings,
  products,
  trial,
  setTrial,
  focus,
}: {
  store: any;
  setStore: (s: any) => void;
  settings: any;
  setSettings: (s: any) => void;
  products: any[];
  /** template en essai dans l'aperçu (non enregistré) */
  trial: string;
  setTrial: (id: string) => void;
  /** zone à mettre en avant (clic sur le header ou le pied de page dans l'aperçu) */
  focus?: string;
}) {
  const base = getStoreTemplate(store.template_id)!;
  const [choosing, setChoosing] = useState(false);
  const [brief, setBrief] = useState<string>(settings.aiBrief || "");
  const [writing, setWriting] = useState(false);
  // Meta AI réécrit tous les textes pour ce template ; le design et les images ne changent pas
  async function writeWithAi() {
    if (
      !window.confirm(
        "Meta AI va réécrire tous les textes de la boutique (accueil, sections, FAQ, livraison, contact).\n\nLe design, les images et l'ordre des sections ne changent pas. Tu pourras annuler avec ↶.",
      )
    )
      return;
    setWriting(true);
    try {
      const r = await fetch("/api/stores/ai-texts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateId: base.id,
          locale: store.locale,
          name: store.name,
          brief,
          products: products.map((p: any) => ({ name: p.name, category: p.specifications?.category || p.category })),
          settings: own,
        }),
      });
      const x = await r.json().catch(() => ({}));
      if (!r.ok || !x.settings) throw new Error(x.error || "Génération impossible");
      setSettings(x.settings);
    } catch (e: any) {
      alert(e?.message || "Génération impossible");
    } finally {
      setWriting(false);
    }
  }
  const own = { ...settings, storeTemplateId: base.id };
  const sx = own.sx || {};
  const eff = effectiveTemplate(base, sx);
  const setSx = (patch: any) => setSettings({ ...own, sx: { ...sx, ...patch } });
  const setLayout = (k: keyof SxLayout, v: string) => setSx({ layout: { ...(sx.layout || {}), [k]: v } });
  const setTheme = (k: string, v: string | number) => setSx({ theme: { ...(sx.theme || {}), [k]: v } });
  const color = (label: string, value: string, onChange: (v: string) => void) => (
    <label className="sxe-color">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>{label}</span>
    </label>
  );
  function apply(id: string) {
    if (id === base.id) {
      setTrial("");
      setChoosing(false);
      return;
    }
    const replace = window.confirm(
      "Appliquer aussi les textes du template « " +
        getStoreTemplate(id)?.name +
        " » ?\n\nOK : textes du template · Annuler : garder tes textes (seuls le design et les sections changent).",
    );
    setSettings(switchTemplateSettings(settings, id, store.locale, replace));
    setStore({ ...store, template_id: id });
    setTrial("");
    setChoosing(false);
  }
  const customized = !!(sx.layout || sx.hero || sx.theme);

  return (
    <div className="store-settings-card sxe-panel">
      <div className="sxe-panel-head">
        <h2>Template & style</h2>
        <p>
          Template : <b>{base.name}</b> · {base.niche} · <code>{base.folder}</code>
        </p>
      </div>

      {trial && (
        <div className="sxe-trial">
          <b>Essai en cours : {getStoreTemplate(trial)?.name}</b>
          <small>
            L'aperçu montre ta boutique avec ce template. Rien n'est enregistré tant que tu n'appliques pas.
          </small>
          <div>
            <button type="button" className="sxe-btn sxe-btn-primary" onClick={() => apply(trial)}>
              Appliquer ce template
            </button>
            <button type="button" className="sxe-btn" onClick={() => setTrial("")}>
              Annuler l'essai
            </button>
          </div>
        </div>
      )}
      <button type="button" className="sxe-btn sxe-btn-wide" onClick={() => setChoosing((v) => !v)}>
        {choosing ? "Masquer les templates" : "Changer de template"}
      </button>
      {choosing && (
        <>
          <small className="sxe-hint">
            « Essayer » montre le template dans l'aperçu, avec tes textes et tes produits.
          </small>
          <TemplateGallery
            value={trial || base.id}
            onChange={(id) => setTrial(id === base.id ? "" : id)}
            products={products}
            locale={store.locale}
            storeName={store.name}
            selectLabel="Essayer"
          />
        </>
      )}

      <h3>Textes avec l'IA</h3>
      <small className="sxe-hint">
        Meta AI rédige tous les textes de ce template pour ta boutique, dans sa langue. Résultat visible dans l'aperçu
        avant d'enregistrer.
      </small>
      <TextField
        label="Décris ta boutique (produits, clientèle, ton…)"
        value={brief}
        onChange={setBrief}
        multiline
        placeholder="Ex. : cosmétiques naturels à l'argan, pour femmes 25-45 ans, ton doux et rassurant."
      />
      <button type="button" className="sxe-btn sxe-btn-primary sxe-btn-wide" disabled={writing} onClick={writeWithAi}>
        {writing ? "✦ Meta AI rédige…" : "✦ Rédiger les textes avec l'IA"}
      </button>

      <h3>Logo</h3>
      <ImagePicker
        label="Logo (vide = nom de la boutique)"
        value={own.logo}
        onChange={(v) => setSettings({ ...own, logo: v })}
        storeId={store.id}
        products={[]}
        hint=""
      />

      <h3>Couleurs</h3>
      <div className="sxe-colors">
        {color("Principale", own.primary || eff.theme.primary, (v) => setSettings({ ...own, primary: v }))}
        {color("Boutons", own.accent || eff.theme.accent, (v) => setSettings({ ...own, accent: v }))}
        {color("Fond", eff.theme.bg, (v) => setTheme("bg", v))}
        {color("Cartes", eff.theme.surface, (v) => setTheme("surface", v))}
        {color("Texte", eff.theme.text, (v) => setTheme("text", v))}
        {color("Sections sombres", eff.theme.dark, (v) => setTheme("dark", v))}
      </div>
      <label className="sxe-field">
        <span>Arrondis : {eff.theme.radius}px</span>
        <input
          type="range"
          min={0}
          max={32}
          value={eff.theme.radius}
          onChange={(e) => setTheme("radius", Number(e.target.value))}
        />
      </label>

      <h3>Polices</h3>
      <div className="sxe-two">
        <label className="sxe-field">
          <span>Titres</span>
          <select
            value={own.headingFont || eff.theme.headingFont}
            onChange={(e) => setSettings({ ...own, headingFont: e.target.value })}
          >
            {Array.from(new Set([eff.theme.headingFont, ...FONTS])).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="sxe-field">
          <span>Textes</span>
          <select
            value={own.bodyFont || eff.theme.bodyFont}
            onChange={(e) => setSettings({ ...own, bodyFont: e.target.value })}
          >
            {Array.from(new Set([eff.theme.bodyFont, ...FONTS])).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
      </div>
      <small className="sxe-hint">En arabe et en darija, la police Cairo est utilisée pour la lisibilité.</small>

      <h3>Mise en page</h3>
      <small className="sxe-hint">★ = choix d'origine du template.</small>
      <label className="sxe-field">
        <span>Bannière principale (hero)</span>
        <select value={eff.hero} onChange={(e) => setSx({ hero: e.target.value })}>
          {HERO_CHOICES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
              {v === base.hero ? " ★" : ""}
            </option>
          ))}
        </select>
      </label>
      {(Object.keys(LAYOUT_CHOICES) as (keyof SxLayout)[]).map((k) => (
        <div
          key={k}
          className={
            "sxe-layout-row" +
            ((focus === "@header" && k === "header") || (focus === "@footer" && k === "footer") ? " is-focus" : "")
          }
        >
          <ChoiceField
            label={LAYOUT_LABELS[k]}
            value={eff.layout[k]}
            defaultValue={base.layout[k]}
            choices={LAYOUT_CHOICES[k]}
            onChange={(v) => setLayout(k, v)}
          />
        </div>
      ))}
      <label className="sxe-check">
        <input
          type="checkbox"
          checked={own.showFooter !== false}
          onChange={(e) => setSettings({ ...own, showFooter: e.target.checked })}
        />
        Afficher le pied de page
      </label>
      {customized && (
        <button
          type="button"
          className="sxe-btn sxe-btn-wide"
          onClick={() => {
            if (!window.confirm("Revenir aux couleurs, au hero et à la mise en page d'origine du template ?")) return;
            setSettings({
              ...own,
              primary: base.theme.primary,
              accent: base.theme.accent,
              headingFont: base.theme.headingFont,
              bodyFont: base.theme.bodyFont,
              sx: resetStyle(sx),
            });
          }}
        >
          ↺ Revenir au style du template
        </button>
      )}
    </div>
  );
}
