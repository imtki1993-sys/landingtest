// Section « Carte & adresse » : carte Google Maps (sans clé API), adresse, infos pratiques
// et bouton itinéraire. Sans adresse, rien n'est affiché sur la boutique (un rappel s'affiche dans l'éditeur).
import React from "react";
import type { SxBlock } from "../../lib/store-templates";
import { Icon } from "./SeriesParts";

export const mapEmbedUrl = (address: string) =>
  "https://maps.google.com/maps?q=" + encodeURIComponent(address) + "&z=15&output=embed";
export const mapDirectionsUrl = (address: string) =>
  "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address);

const pin = (
  <svg className="sx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

/** Carte seule (page Contact et section). */
export function MapFrame({ address, title }: { address: string; title?: string }) {
  return (
    <div className="sx-map-frame">
      <iframe
        title={title || address}
        src={mapEmbedUrl(address)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

export function MapSection({ b, editing, lang }: { b: SxBlock; editing: boolean; lang: string }) {
  const address = String(b.address || "").trim();
  if (!address) {
    if (!editing) return null;
    return (
      <section className="sx-section sx-map">
        <div className="sx-wrap">
          <div className="sx-map-empty">
            {pin}
            <b>Carte & adresse</b>
            <small>
              Ajoutez l'adresse de votre magasin dans l'éditeur (Accueil › Carte & adresse) pour afficher la carte. Sans
              adresse, cette section n'apparaît pas sur la boutique.
            </small>
          </div>
        </div>
      </section>
    );
  }
  const items = (b.items || []).filter((x) => x.title || x.text);
  return (
    <section className="sx-section sx-map">
      <div className="sx-wrap sx-map-grid">
        <div className="sx-map-card">
          {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
          {b.title && <h2>{b.title}</h2>}
          {b.text && <p>{b.text}</p>}
          <div className="sx-map-address">
            {pin}
            <span>{address}</span>
          </div>
          {items.length > 0 && (
            <dl className="sx-map-info">
              {items.map((x, i) => (
                <div key={i}>
                  <dt>{x.title}</dt>
                  {x.text && <dd>{x.text}</dd>}
                </div>
              ))}
            </dl>
          )}
          <a className="sx-btn" href={mapDirectionsUrl(address)} target="_blank" rel="noreferrer">
            {b.button || (lang === "ar" ? "الطريق" : "Itinéraire")} <Icon name="arrow" />
          </a>
        </div>
        <MapFrame address={address} title={b.title} />
      </div>
    </section>
  );
}
