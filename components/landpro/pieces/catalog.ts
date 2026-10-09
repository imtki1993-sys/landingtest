// Fiches des 47 pièces (id, famille, section remplacée, nom) sans leur rendu :
// lisible côté serveur (registre, galerie). Doit rester aligné avec pieces/index.ts
// (vérifié par tests/pieces.test.ts).
import type { PieceKind } from "./types";
import type { SectionKey } from "../types";

export interface PieceMeta {
  id: string;
  kind: PieceKind;
  section?: SectionKey;
  name: string;
}

export const PIECE_CATALOG: PieceMeta[] = [
  { id: "h11-prix", kind: "header", name: "Minimal : logo, prix et bouton" },
  { id: "h13-rebours", kind: "header", name: "Compte à rebours intégré" },
  { id: "h14-onglets", kind: "header", name: "Onglets fiche produit" },
  { id: "h15-logo-geant", kind: "header", name: "Logo géant qui rétrécit" },
  { id: "h17-app", kind: "header", name: "Style application" },
  { id: "h18-asymetrique", kind: "header", name: "Asymétrique, logo en biais" },
  { id: "h19-whatsapp", kind: "header", name: "Bouton WhatsApp dominant" },
  { id: "h20-selecteur", kind: "header", name: "Sélecteur de couleur et de taille" },
  { id: "hero-3vues", kind: "hero", name: "Produit qui tourne (3 vues)" },
  { id: "hero-avant-apres", kind: "hero", name: "Hero avant / après" },
  { id: "hero-bandes", kind: "hero", name: "Hero en bandes horizontales" },
  { id: "hero-catalogue", kind: "hero", name: "Catalogue technique annoté" },
  { id: "hero-degrade", kind: "hero", name: "Hero dégradé animé" },
  { id: "hero-deux-photos", kind: "hero", name: "Deux photos plein écran" },
  { id: "hero-eclate", kind: "hero", name: "Produit éclaté + légendes" },
  { id: "hero-manifeste", kind: "hero", name: "Manifeste" },
  { id: "hero-manuscrit", kind: "hero", name: "Titre manuscrit + photo" },
  { id: "hero-multicolore", kind: "hero", name: "Titre géant multicolore" },
  { id: "hero-packs", kind: "hero", name: "Packs 1/2/3 dans le hero" },
  { id: "hero-papier", kind: "hero", name: "Hero papier / kraft" },
  { id: "hero-prix-stock", kind: "hero", name: "Prix barré géant + stock" },
  { id: "hero-story", kind: "hero", name: "Format story (vertical)" },
  { id: "f10-faq", kind: "footer", name: "FAQ express" },
  { id: "f11-whatsapp", kind: "footer", name: "WhatsApp / contact" },
  { id: "f12-rappel-prix", kind: "footer", name: "Rappel de prix" },
  { id: "f13-vague", kind: "footer", name: "Vague" },
  { id: "f14-defilant", kind: "footer", name: "Bandeau défilant" },
  { id: "f15-avis", kind: "footer", name: "Avis vedette" },
  { id: "f16-ticket", kind: "footer", name: "Ticket de caisse" },
  { id: "f17-etapes", kind: "footer", name: "Étapes de commande" },
  { id: "f18-degrade", kind: "footer", name: "Dégradé" },
  { id: "f19-collant", kind: "footer", name: "Barre collante" },
  { id: "f20-carte", kind: "footer", name: "Carte de visite" },
  { id: "benefits-numerote", kind: "section", section: "benefits", name: "Avantages : liste numérotée" },
  { id: "faq-cartes", kind: "section", section: "faq", name: "FAQ : cartes" },
  { id: "faq-chat", kind: "section", section: "faq", name: "FAQ : façon chat" },
  { id: "guarantee-carte", kind: "section", section: "guarantee", name: "Garantie : carte" },
  { id: "guarantee-sceau", kind: "section", section: "guarantee", name: "Garantie : sceau" },
  { id: "how-schema", kind: "section", section: "how", name: "Fonctionnement : schéma annoté" },
  { id: "offers-progressive", kind: "section", section: "offers", name: "Offres : remise progressive" },
  { id: "offers-tableau", kind: "section", section: "offers", name: "Offres : tableau comparatif" },
  { id: "order-etapes", kind: "section", section: "order", name: "Commande : en étapes" },
  { id: "order-plein-ecran", kind: "section", section: "order", name: "Commande : plein écran" },
  { id: "reviews-note-barres", kind: "section", section: "reviews", name: "Avis : note + barres" },
  { id: "showcase-defilante", kind: "section", section: "showcase", name: "Galerie : bande défilante" },
  { id: "showcase-zoom", kind: "section", section: "showcase", name: "Galerie : zoom au survol" },
  { id: "specs-accordeon", kind: "section", section: "specs", name: "Caractéristiques : accordéon" },
];

export const PIECE_META: Record<string, PieceMeta> = Object.fromEntries(PIECE_CATALOG.map((p) => [p.id, p]));
