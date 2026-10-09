"use client";
// Registre des pièces combinables (headers, heroes, footers, versions de sections).
import type { Piece } from "./types";
import p_h11_prix from "./headers/h11-prix";
import p_h13_rebours from "./headers/h13-rebours";
import p_h14_onglets from "./headers/h14-onglets";
import p_h15_logo_geant from "./headers/h15-logo-geant";
import p_h17_app from "./headers/h17-app";
import p_h18_asymetrique from "./headers/h18-asymetrique";
import p_h19_whatsapp from "./headers/h19-whatsapp";
import p_h20_selecteur from "./headers/h20-selecteur";
import p_hero_3vues from "./heros/hero-3vues";
import p_hero_eclate from "./heros/hero-eclate";
import p_hero_deux_photos from "./heros/hero-deux-photos";
import p_hero_multicolore from "./heros/hero-multicolore";
import p_hero_manuscrit from "./heros/hero-manuscrit";
import p_hero_manifeste from "./heros/hero-manifeste";
import p_hero_prix_stock from "./heros/hero-prix-stock";
import p_hero_packs from "./heros/hero-packs";
import p_hero_bandes from "./heros/hero-bandes";
import p_hero_avant_apres from "./heros/hero-avant-apres";
import p_hero_degrade from "./heros/hero-degrade";
import p_hero_papier from "./heros/hero-papier";
import p_hero_catalogue from "./heros/hero-catalogue";
import p_hero_story from "./heros/hero-story";
import p_f10_faq from "./footers/f10-faq";
import p_f11_whatsapp from "./footers/f11-whatsapp";
import p_f12_rappel_prix from "./footers/f12-rappel-prix";
import p_f13_vague from "./footers/f13-vague";
import p_f14_defilant from "./footers/f14-defilant";
import p_f15_avis from "./footers/f15-avis";
import p_f16_ticket from "./footers/f16-ticket";
import p_f17_etapes from "./footers/f17-etapes";
import p_f18_degrade from "./footers/f18-degrade";
import p_f19_collant from "./footers/f19-collant";
import p_f20_carte from "./footers/f20-carte";
import p_benefits_numerote from "./sections/benefits-numerote";
import p_reviews_note_barres from "./sections/reviews-note-barres";
import p_showcase_defilante from "./sections/showcase-defilante";
import p_showcase_zoom from "./sections/showcase-zoom";
import p_how_schema from "./sections/how-schema";
import p_specs_accordeon from "./sections/specs-accordeon";
import p_faq_cartes from "./sections/faq-cartes";
import p_faq_chat from "./sections/faq-chat";
import p_offers_tableau from "./sections/offers-tableau";
import p_offers_progressive from "./sections/offers-progressive";
import p_order_etapes from "./sections/order-etapes";
import p_order_plein_ecran from "./sections/order-plein-ecran";
import p_guarantee_carte from "./sections/guarantee-carte";
import p_guarantee_sceau from "./sections/guarantee-sceau";

export const PIECE_LIST: Piece[] = [
  p_h11_prix,
  p_h13_rebours,
  p_h14_onglets,
  p_h15_logo_geant,
  p_h17_app,
  p_h18_asymetrique,
  p_h19_whatsapp,
  p_h20_selecteur,
  p_hero_3vues,
  p_hero_eclate,
  p_hero_deux_photos,
  p_hero_multicolore,
  p_hero_manuscrit,
  p_hero_manifeste,
  p_hero_prix_stock,
  p_hero_packs,
  p_hero_bandes,
  p_hero_avant_apres,
  p_hero_degrade,
  p_hero_papier,
  p_hero_catalogue,
  p_hero_story,
  p_f10_faq,
  p_f11_whatsapp,
  p_f12_rappel_prix,
  p_f13_vague,
  p_f14_defilant,
  p_f15_avis,
  p_f16_ticket,
  p_f17_etapes,
  p_f18_degrade,
  p_f19_collant,
  p_f20_carte,
  p_benefits_numerote,
  p_reviews_note_barres,
  p_showcase_defilante,
  p_showcase_zoom,
  p_how_schema,
  p_specs_accordeon,
  p_faq_cartes,
  p_faq_chat,
  p_offers_tableau,
  p_offers_progressive,
  p_order_etapes,
  p_order_plein_ecran,
  p_guarantee_carte,
  p_guarantee_sceau,
];

export const PIECES: Record<string, Piece> = Object.fromEntries(PIECE_LIST.map((p) => [p.id, p]));
