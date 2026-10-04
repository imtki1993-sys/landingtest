"use client";
// Point d'entrée historique des templates : délègue au moteur LandPro (60 templates).
import React from "react";
import LandproTemplate from "./landpro/LandproTemplate";
import type { LandingV4Data } from "./landpro/types";

export type { LandingV4Data };

export default function LandingTemplateV4({ data, preview = false, demo = false, builderMode = false, onSectionSelect, onSubmit }: {
  data: LandingV4Data;
  preview?: boolean;
  demo?: boolean;
  builderMode?: boolean;
  onSectionSelect?: (id: string) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, qty: number) => void;
}) {
  return (
    <LandproTemplate
      key={data.templateId}
      data={data}
      preview={preview}
      demo={demo}
      builderMode={builderMode}
      onSectionSelect={onSectionSelect}
      onSubmit={onSubmit}
    />
  );
}
