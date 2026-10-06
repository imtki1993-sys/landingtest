"use client";
// Contenu des pages internes d'une boutique en template de série :
// Livraison & paiement, Contact, FAQ et pages légales.
import React from "react";
import { ItemsEditor, TextField } from "./fields";

export const SERIES_PAGES: [string, string][] = [
  ["delivery", "Livraison & paiement"],
  ["contact", "Contact"],
  ["faq", "FAQ"],
  ["privacy", "Confidentialité"],
  ["terms", "Conditions"],
  ["returns", "Retours"],
];

const LEGAL_HINT: Record<string, string> = {
  privacy:
    "Quelles données tu collectes (nom, téléphone, adresse), pourquoi (livraison, suivi de commande), combien de temps tu les gardes et comment te contacter pour les supprimer.",
  terms:
    "Identité de la boutique, prix et paiement à la livraison, délais de livraison, conditions d'annulation, responsabilités.",
  returns: "Délai pour demander un échange ou un retour, état du produit, qui paie le retour, comment procéder.",
};

export default function PagesPanel({
  settings,
  setSettings,
  page,
  setPage,
}: {
  settings: any;
  setSettings: (s: any) => void;
  /** page affichée dans l'aperçu et ouverte dans le panneau */
  page: string;
  setPage: (p: string) => void;
}) {
  const current = SERIES_PAGES.some(([k]) => k === page) ? page : "delivery";
  const dc = settings.deliveryContent || {};
  const cc = settings.contactContent || {};
  const legal = settings.legalContent || {};
  const faq: { q: string; a: string }[] = Array.isArray(settings.faq) ? settings.faq : [];
  const setDc = (patch: any) => setSettings({ ...settings, deliveryContent: { ...dc, ...patch } });
  const setCc = (patch: any) => setSettings({ ...settings, contactContent: { ...cc, ...patch } });
  const points = (Array.isArray(dc.points) ? dc.points : []).map((x: any) =>
    typeof x === "string" ? { title: x } : { title: String(x?.title || ""), text: x?.text || "" },
  );
  const setFaq = (next: { q: string; a: string }[]) => setSettings({ ...settings, faq: next });

  return (
    <div className="store-settings-card sxe-panel">
      <div className="sxe-panel-head">
        <h2>Pages</h2>
        <p>Le style de ces pages suit le template ; leur contenu se modifie ici.</p>
      </div>
      <div className="sxe-tabs" role="tablist">
        {SERIES_PAGES.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={current === k}
            className={current === k ? "active" : ""}
            onClick={() => setPage(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {current === "delivery" && (
        <>
          <TextField
            label="Titre de la page"
            value={dc.title}
            onChange={(v) => setDc({ title: v })}
            placeholder="Livraison & paiement"
          />
          <TextField label="Introduction" value={dc.intro} onChange={(v) => setDc({ intro: v })} multiline />
          <h3>Garanties</h3>
          <small className="sxe-hint">Vide = les garanties de l'accueil sont reprises.</small>
          <ItemsEditor
            items={points}
            onChange={(items) => setDc({ points: items })}
            addLabel="+ Ajouter une garantie"
          />
          <h3>Étapes de commande</h3>
          <TextField
            label="Titre"
            value={dc.stepsTitle}
            onChange={(v) => setDc({ stepsTitle: v })}
            placeholder="Paiement à la livraison, en 3 étapes"
          />
          <TextField
            label="Texte"
            value={dc.stepsText}
            onChange={(v) => setDc({ stepsText: v })}
            placeholder="Aucune carte bancaire n'est demandée."
          />
          <small className="sxe-hint">Vide = étapes par défaut (commande, confirmation, livraison et paiement).</small>
          <ItemsEditor
            items={Array.isArray(dc.steps) ? dc.steps : []}
            onChange={(items) => setDc({ steps: items })}
            addLabel="+ Ajouter une étape"
          />
        </>
      )}

      {current === "contact" && (
        <>
          <TextField
            label="Titre de la page"
            value={cc.title}
            onChange={(v) => setCc({ title: v })}
            placeholder="Contact"
          />
          <TextField label="Introduction" value={cc.intro} onChange={(v) => setCc({ intro: v })} multiline />
          <TextField
            label="Numéro WhatsApp affiché"
            value={settings.whatsapp}
            onChange={(v) => setSettings({ ...settings, whatsapp: v.replace(/[^0-9+ ]/g, "") })}
            placeholder="Vide = numéro des Paramètres"
          />
          <small className="sxe-hint">
            L'email affiché est celui des Paramètres du compte. Les messages du formulaire arrivent dans ton tableau de
            bord.
          </small>
        </>
      )}

      {current === "faq" && (
        <>
          <small className="sxe-hint">
            Ces questions s'affichent sur la page FAQ et dans la section FAQ de l'accueil.
          </small>
          <div className="sxe-items">
            {faq.map((x, i) => (
              <div key={i} className="sxe-item">
                <div className="sxe-item-head">
                  <b>Question {i + 1}</b>
                  <span>
                    <button
                      type="button"
                      disabled={i === 0}
                      aria-label="Monter"
                      onClick={() => {
                        const a = [...faq];
                        [a[i - 1], a[i]] = [a[i], a[i - 1]];
                        setFaq(a);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === faq.length - 1}
                      aria-label="Descendre"
                      onClick={() => {
                        const a = [...faq];
                        [a[i + 1], a[i]] = [a[i], a[i + 1]];
                        setFaq(a);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="sxe-danger"
                      aria-label="Supprimer"
                      onClick={() => setFaq(faq.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  </span>
                </div>
                <TextField
                  label="Question"
                  value={x.q}
                  onChange={(v) => setFaq(faq.map((y, j) => (j === i ? { ...y, q: v } : y)))}
                />
                <TextField
                  label="Réponse"
                  value={x.a}
                  multiline
                  onChange={(v) => setFaq(faq.map((y, j) => (j === i ? { ...y, a: v } : y)))}
                />
              </div>
            ))}
            <button type="button" className="sxe-add" onClick={() => setFaq([...faq, { q: "", a: "" }])}>
              + Ajouter une question
            </button>
          </div>
        </>
      )}

      {(current === "privacy" || current === "terms" || current === "returns") && (
        <>
          <small className="sxe-hint sxe-help">{LEGAL_HINT[current]}</small>
          <label className="sxe-field">
            <span>Texte de la page (une ligne vide entre deux paragraphes)</span>
            <textarea
              className="sxe-legal"
              value={legal[current] || ""}
              onChange={(e) => setSettings({ ...settings, legalContent: { ...legal, [current]: e.target.value } })}
              placeholder="Écris ici le texte de la page…"
            />
          </label>
          {!legal[current] && (
            <small className="sxe-warn">
              Page encore vide : un texte provisoire demande au marchand de la compléter. Pense à la remplir avant de
              publier.
            </small>
          )}
        </>
      )}
    </div>
  );
}
