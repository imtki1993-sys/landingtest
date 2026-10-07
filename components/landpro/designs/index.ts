"use client";
// Rendus des designs sur mesure, par identifiant de template.
import type { Design } from "./types";
import d_nr_electric from "./nr-electric";
import d_parfum_bordeaux from "./parfum-bordeaux";
import d_velo_electrique from "./velo-electrique";
import d_street_orange from "./street-orange";
import d_botanique_nuit from "./botanique-nuit";
import d_lime_sneaker from "./lime-sneaker";
import d_beton_fitness from "./beton-fitness";
import d_yoga_neon from "./yoga-neon";
import d_fleur_printemps from "./fleur-printemps";
import d_fitness_x from "./fitness-x";
import d_orbite_retro from "./orbite-retro";
import d_glow_rose from "./glow-rose";
import d_vortex_rouge from "./vortex-rouge";
import d_arctic_puffer from "./arctic-puffer";
import d_gander_orange from "./gander-orange";
import d_glowcare_rose from "./glowcare-rose";
import d_skincare_emeraude from "./skincare-emeraude";
import d_ironcore_lime from "./ironcore-lime";
import d_lavande_naturelle from "./lavande-naturelle";

export const DESIGNS: Record<string, Design> = {
  "nr-electric": d_nr_electric,
  "parfum-bordeaux": d_parfum_bordeaux,
  "velo-electrique": d_velo_electrique,
  "street-orange": d_street_orange,
  "botanique-nuit": d_botanique_nuit,
  "lime-sneaker": d_lime_sneaker,
  "beton-fitness": d_beton_fitness,
  "yoga-neon": d_yoga_neon,
  "fleur-printemps": d_fleur_printemps,
  "fitness-x": d_fitness_x,
  "orbite-retro": d_orbite_retro,
  "glow-rose": d_glow_rose,
  "vortex-rouge": d_vortex_rouge,
  "arctic-puffer": d_arctic_puffer,
  "gander-orange": d_gander_orange,
  "glowcare-rose": d_glowcare_rose,
  "skincare-emeraude": d_skincare_emeraude,
  "ironcore-lime": d_ironcore_lime,
  "lavande-naturelle": d_lavande_naturelle,
};
