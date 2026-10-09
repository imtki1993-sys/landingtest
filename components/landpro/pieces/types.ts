// ─────────────────────────────────────────────────────────────
// Pièces combinables des landing pages : un header, un hero, un footer
// ou une version de section, réutilisable par n'importe quel template.
// Une pièce = un dossier pieces/<famille>/<id>/ avec index.tsx + style.css.
// Elle lit tout le contenu dans la page (VM) et prend ses couleurs dans
// le thème du template (variables CSS --primary, --bg, --text…).
// ─────────────────────────────────────────────────────────────
import type React from "react";
import type { SectionProps } from "../Sections";
import type { SectionKey } from "../types";

export type PieceKind = "header" | "hero" | "footer" | "section";

export interface Piece {
  id: string;
  kind: PieceKind;
  /** pour une version de section : la section qu'elle remplace */
  section?: SectionKey;
  /** nom affiché (français) */
  name: string;
  render: (p: SectionProps) => React.ReactNode;
}

/** Pièces choisies par un template (ou par le marchand dans l'éditeur). */
export interface PieceChoice {
  header?: string;
  hero?: string;
  footer?: string;
  sections?: Partial<Record<SectionKey, string>>;
}
