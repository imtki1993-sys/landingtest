// ─────────────────────────────────────────────────────────────
// Designs sur mesure : un template = un dossier designs/<id>/ avec
//  - def.ts    : fiche du template (registre) + produit de démonstration
//  - index.tsx : en-tête, hero, sections et pied de page propres
//  - style.css : styles du template (préfixe de classes propre)
// Les sections réutilisent les données de la page (VM) : tout reste
// modifiable dans l'éditeur, et le formulaire COD est toujours présent.
// ─────────────────────────────────────────────────────────────
import type React from "react";
import type { SectionProps } from "../Sections";
import type { TemplateDef } from "../types";
import type { DemoProduct } from "../demo-types";

export type DesignNode = (p: SectionProps) => React.ReactNode;

export interface Design {
  /** polices Google Fonts propres au template (paramètres css2 : "family=Jost:wght@300;400;600&family=Marcellus") */
  fonts?: string;
  /** familles CSS du texte et des titres (remplacent celles du thème, sauf en arabe) */
  font?: string;
  heading?: string;
  /** en-tête (sinon : en-tête générique) */
  header?: DesignNode;
  hero: DesignNode;
  /** pied de page (sinon : pied de page générique) */
  footer?: DesignNode;
  /** rendu propre d'une section (clé de section → rendu) ; sinon rendu générique */
  sections?: Partial<Record<string, DesignNode>>;
}

export interface DesignDef {
  def: Omit<TemplateDef, "description" | "number">;
  /** produit de démonstration (galerie, aperçu avant création) */
  demo: DemoProduct;
}
