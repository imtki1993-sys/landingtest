"use client";
// Onglet Design d'une boutique générée par l'IA : passage à un template de série.
// Une fois la boutique en template de série, l'éditeur affiche ses propres onglets
// (Template & style, Accueil, Pages).
import React, { useState } from "react";
import TemplateGallery from "./TemplateGallery";
import { getStoreTemplate } from "../../lib/store-templates";
import { switchTemplateSettings } from "./editor/StylePanel";

export default function SeriesTemplatePanel({ store, setStore, settings, setSettings, products }: any) {
  const [choosing, setChoosing] = useState(false);
  if (getStoreTemplate(store?.template_id)) return null;
  function applyTemplate(id: string) {
    const next = getStoreTemplate(id);
    if (!next) return;
    const replaceTexts = window.confirm(
      "Appliquer aussi les textes du template « " +
        next.name +
        " » ?\n\nOK : textes du template · Annuler : garder tes textes actuels (seuls le design et les sections changent).",
    );
    setSettings(switchTemplateSettings(settings, id, store.locale, replaceTexts));
    setStore({ ...store, template_id: id });
  }
  return (
    <div className="store-settings-card sx-panel">
      <div className="store-step-head">
        <span>▦</span>
        <div>
          <h2>Templates de boutique</h2>
          <p>Cette boutique utilise le design généré par l'IA. Tu peux passer à un template de série.</p>
        </div>
      </div>
      <button type="button" className="sx-panel-toggle" onClick={() => setChoosing((v) => !v)}>
        {choosing ? "Masquer les templates" : "Choisir un template"}
      </button>
      {choosing && (
        <TemplateGallery
          onChange={applyTemplate}
          products={products}
          locale={store?.locale}
          storeName={store?.name}
          selectLabel="Utiliser"
        />
      )}
    </div>
  );
}
