// Fiches des designs sur mesure (n° 61 → 79), dans l'ordre de la galerie.
import type { TemplateDef } from "../types";
import type { DemoProduct } from "../demo-types";
import type { DesignDef } from "./types";
import d_nr_electric from "./nr-electric/def";
import d_parfum_bordeaux from "./parfum-bordeaux/def";
import d_velo_electrique from "./velo-electrique/def";
import d_street_orange from "./street-orange/def";
import d_botanique_nuit from "./botanique-nuit/def";
import d_lime_sneaker from "./lime-sneaker/def";
import d_beton_fitness from "./beton-fitness/def";
import d_yoga_neon from "./yoga-neon/def";
import d_fleur_printemps from "./fleur-printemps/def";
import d_fitness_x from "./fitness-x/def";
import d_orbite_retro from "./orbite-retro/def";
import d_glow_rose from "./glow-rose/def";
import d_vortex_rouge from "./vortex-rouge/def";
import d_arctic_puffer from "./arctic-puffer/def";
import d_gander_orange from "./gander-orange/def";
import d_glowcare_rose from "./glowcare-rose/def";
import d_skincare_emeraude from "./skincare-emeraude/def";
import d_ironcore_lime from "./ironcore-lime/def";
import d_lavande_naturelle from "./lavande-naturelle/def";

export const DESIGN_LIST: DesignDef[] = [
  d_nr_electric,
  d_parfum_bordeaux,
  d_velo_electrique,
  d_street_orange,
  d_botanique_nuit,
  d_lime_sneaker,
  d_beton_fitness,
  d_yoga_neon,
  d_fleur_printemps,
  d_fitness_x,
  d_orbite_retro,
  d_glow_rose,
  d_vortex_rouge,
  d_arctic_puffer,
  d_gander_orange,
  d_glowcare_rose,
  d_skincare_emeraude,
  d_ironcore_lime,
  d_lavande_naturelle,
];

/** Premier numéro des designs dans le registre (après les 60 templates historiques). */
export const DESIGN_FIRST_NUMBER = 61;

export const DESIGN_DEFS: Omit<TemplateDef, "description">[] = DESIGN_LIST.map((d, i) => ({
  ...d.def,
  number: DESIGN_FIRST_NUMBER + i,
}));

export const DESIGN_DEMOS: Record<string, DemoProduct> = Object.fromEntries(
  DESIGN_LIST.map((d) => [d.def.demoProduct, { ...d.demo, id: d.def.demoProduct }]),
);
