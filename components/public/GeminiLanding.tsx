"use client";
// Landing dessinée de A à Z par Gemini : affichée dans un cadre isolé (sandbox sans allow-same-origin, donc une
// autre origine que LandPro). Le script de liaison du cadre envoie la hauteur, le début du formulaire et la commande ;
// la commande est enregistrée par la page LandPro (mêmes commandes, Pixel et API Conversions que les autres landings).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { frameDocument } from "../../lib/gemini-design";

export interface GeminiOrder {
  fields: { name: string; phone: string; city: string; address: string };
  qty: number;
}

export default function GeminiLanding({
  html,
  onOrder,
  onCheckout,
  onWhatsapp,
  title,
}: {
  html: string;
  onOrder?: (o: GeminiOrder) => Promise<{ ok: boolean; message: string }>;
  onCheckout?: () => void;
  onWhatsapp?: () => void;
  title?: string;
}) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(900);
  const doc = useMemo(() => frameDocument(html), [html]);

  useEffect(() => {
    async function onMessage(e: MessageEvent) {
      const win = ref.current?.contentWindow;
      if (!win || e.source !== win) return;
      const d: any = e.data || {};
      if (!d.lp) return;
      if (d.type === "height" && Number(d.h) > 100) setHeight(Math.min(40_000, Number(d.h)));
      else if (d.type === "checkout") onCheckout?.();
      else if (d.type === "whatsapp") onWhatsapp?.();
      else if (d.type === "scroll" && ref.current)
        window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY + Number(d.y || 0), behavior: "smooth" });
      else if (d.type === "order") {
        const r = onOrder
          ? await onOrder({ fields: d.fields || {}, qty: Number(d.qty) || 1 }).catch(() => ({
              ok: false,
              message: "تعذر تسجيل الطلب. حاول مرة أخرى.",
            }))
          : { ok: true, message: "✅ (aperçu) La commande serait envoyée ici." };
        win.postMessage({ lp: 1, type: "result", ...r }, "*");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onOrder, onCheckout, onWhatsapp]);

  return (
    <iframe
      ref={ref}
      title={title || "Landing page"}
      srcDoc={doc}
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      scrolling="no"
      style={{ width: "100%", height, border: 0, display: "block", background: "transparent" }}
    />
  );
}
