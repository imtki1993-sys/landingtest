"use client";
// Bouton WhatsApp flottant, affiché sur toutes les pages d'une boutique.
// Le message est pré-rempli : produit consulté sur une fiche produit,
// question générale ailleurs.
import React from "react";
import "./store-common.css";

export function whatsappDigits(v: unknown): string {
  return String(v || "").replace(/\D/g, "");
}

export default function WhatsAppButton({
  phone,
  storeName,
  productName,
  rtl,
}: {
  phone: string;
  storeName: string;
  productName?: string;
  rtl: boolean;
}) {
  const digits = whatsappDigits(phone);
  if (!digits) return null;
  const message = productName
    ? rtl
      ? `السلام، بغيت نسول على هاد المنتج: ${productName}`
      : `Bonjour, je suis intéressé(e) par : ${productName}`
    : rtl
      ? `السلام، عندي سؤال على المتجر ${storeName}`
      : `Bonjour, j'ai une question sur la boutique ${storeName}`;
  // Pixel Meta (s'il est installé sur la boutique)
  const onClick = () => (window as any).fbq?.("track", "Contact");
  const label = rtl ? "تواصل معنا فواتساب" : "Discuter sur WhatsApp";
  return (
    <a
      className="store-wa-fab"
      href={"https://wa.me/" + digits + "?text=" + encodeURIComponent(message)}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.5 20.5l4.2-1.1A8.5 8.5 0 1 0 12 3.5z" />
        <path d="M9.2 8.4c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.3 1.7 2.2 2.2.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .9-.7 1.7-1.6 1.8-1 .1-2.6-.3-4.3-1.9s-2.2-3.3-2.1-4.3c0-.6.2-1.2.4-1.7z" />
      </svg>
      <span>WhatsApp</span>
    </a>
  );
}
