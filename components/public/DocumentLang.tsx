"use client";
// Aligne <html lang> et <html dir> sur la langue de la page publique
// (le layout racine est commun à tout le site et reste en « fr »).
import { useEffect } from "react";

export default function DocumentLang({ locale }: { locale?: string | null }) {
  useEffect(() => {
    const lang = String(locale || "fr").split(/[-_]/)[0].toLowerCase() || "fr";
    const html = document.documentElement;
    const prev = { lang: html.lang, dir: html.dir };
    html.lang = String(locale || "fr").replace("_", "-");
    html.dir = ["ar", "he", "fa", "ur"].includes(lang) ? "rtl" : "ltr";
    return () => {
      html.lang = prev.lang;
      html.dir = prev.dir;
    };
  }, [locale]);
  return null;
}
