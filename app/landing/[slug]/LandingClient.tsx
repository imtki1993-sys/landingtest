"use client";
// Rendu d'une landing page (publique, aperçu ?preview=1 et aperçu de l'éditeur).
// Toutes les pages sont affichées par un template LandPro ; les anciennes pages
// sont converties à l'affichage (components/landpro/legacy.ts).
// Ce composant gère aussi : chargement des données, suivi des visites,
// Pixel Meta, envoi des commandes.
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import LandingTemplateV4 from "../../../components/LandingTemplateV4";
import { toTemplateData } from "../../../components/landpro/legacy";

export default function LandingClient({
  initialData,
  initialSlug,
  builderMode = false,
  onSectionSelect,
  viewportMode,
}: {
  initialData?: any;
  initialSlug?: string;
  builderMode?: boolean;
  onSectionSelect?: (id: string) => void;
  viewportMode?: "desktop" | "tablet" | "mobile";
}) {
  const params = useParams<{ slug: string }>(),
    slug = initialSlug || (typeof params?.slug === "string" ? params.slug : "");
  const [data, setData] = useState<any>(initialData || null),
    [sent, setSent] = useState(false),
    [error, setError] = useState("");
  const trackedForm = useRef(false);

  // Éditeur : les données viennent du brouillon en cours de modification
  useEffect(() => {
    if (builderMode && initialData) setData(initialData);
  }, [builderMode, initialData]);

  // Aperçu ?preview=1 (ou rendu sans données serveur) : chargement côté navigateur
  useEffect(() => {
    if (initialData || !slug) return;
    const preview = new URLSearchParams(location.search).get("preview") === "1";
    fetch("/api/landing/" + slug + (preview ? "?preview=1" : ""))
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Page introuvable");
        return x;
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [slug, initialData]);

  // Suivi des visites (statistiques LandPro) et Pixel Meta
  useEffect(() => {
    if (builderMode || !data?.id) return;
    const q = new URLSearchParams(location.search),
      sid = sessionStorage.getItem("lm_sid") || crypto.randomUUID(),
      vid = localStorage.getItem("lm_vid") || crypto.randomUUID();
    sessionStorage.setItem("lm_sid", sid);
    localStorage.setItem("lm_vid", vid);
    const track = (event: string) =>
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          event,
          session_id: sid,
          visitor_id: vid,
          path: location.pathname,
          referrer: document.referrer,
          utm_source: q.get("utm_source"),
          utm_medium: q.get("utm_medium"),
          utm_campaign: q.get("utm_campaign"),
          utm_content: q.get("utm_content"),
          utm_term: q.get("utm_term"),
          fbclid: q.get("fbclid"),
        }),
        keepalive: true,
      }).catch(() => {});
    (window as any).lmTrack = track;
    track("PAGE_VIEW");
    if (data.metaPixelId) {
      const w: any = window;
      if (!w.fbq) {
        const f: any = function () {
          f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments);
        };
        f.queue = [];
        f.loaded = true;
        f.version = "2.0";
        w.fbq = f;
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(s);
      }
      w.fbq("init", data.metaPixelId);
      w.fbq("track", "PageView");
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight,
        p = max > 0 ? scrollY / max : 0;
      if (p >= 0.5 && !sessionStorage.getItem("lm_s50")) {
        sessionStorage.setItem("lm_s50", "1");
        track("SCROLL_50");
      }
      if (p >= 0.98 && !sessionStorage.getItem("lm_s100")) {
        sessionStorage.setItem("lm_s100", "1");
        track("SCROLL_100");
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [data?.id]);

  // Début de remplissage du formulaire (statistiques + InitiateCheckout Meta), une fois
  function onFocusCapture(e: React.FocusEvent) {
    if (builderMode || trackedForm.current) return;
    if (!(e.target as HTMLElement).closest?.("form")) return;
    trackedForm.current = true;
    (window as any).lmTrack?.("FORM_START");
    (window as any).fbq?.("track", "InitiateCheckout");
  }

  // Clic sur un bouton WhatsApp
  function onClickCapture(e: React.MouseEvent) {
    if (builderMode) return;
    const a = (e.target as HTMLElement).closest?.("a");
    if (a && /^https:\/\/wa\.me\//.test(a.getAttribute("href") || "")) (window as any).lmTrack?.("WHATSAPP_CLICK");
  }

  async function submit(e: React.FormEvent<HTMLFormElement>, qty: number) {
    e.preventDefault();
    setError("");
    (window as any).lmTrack?.("FORM_SUBMIT");
    const f = new FormData(e.currentTarget),
      r = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          name: f.get("name"),
          phone: f.get("phone"),
          city: f.get("city"),
          address: f.get("address"),
          quantity: qty,
        }),
      });
    if (!r.ok) {
      const x = await r.json().catch(() => ({}));
      setError(x?.error || "تعذر تسجيل الطلب. حاول مرة أخرى.");
      return;
    }
    const result = await r.json().catch(() => ({}));
    setSent(true);
    (window as any).fbq?.("track", "Lead");
    if (result?.order_id)
      (window as any).fbq?.(
        "track",
        "Purchase",
        { value: Number(result?.total || 0), currency: String(result?.currency || "MAD") },
        { eventID: "order_" + result.order_id },
      );
    if (data?.whatsappPhone) {
      const msg = encodeURIComponent(
        "سلام، بغيت نأكد الطلب ديالي:\nالمنتج: " +
          (data?.name || slug) +
          "\nالاسم: " +
          f.get("name") +
          "\nالهاتف: " +
          f.get("phone") +
          "\nالمدينة: " +
          f.get("city") +
          "\nالكمية: " +
          qty +
          "\nالمجموع: " +
          Number(result?.total || 0) +
          " DH",
      );
      window.open("https://wa.me/" + data.whatsappPhone + "?text=" + msg, "_blank");
    }
  }

  if (!data) return <div className="lp-loading">{error ? "Page introuvable" : "Chargement..."}</div>;
  if (data.error) return <div className="lp-loading">Page introuvable</div>;

  const { data: templateData } = toTemplateData(data);
  return (
    <div
      data-preview-viewport={builderMode ? viewportMode : undefined}
      className={"landing-v4-runtime" + (builderMode ? " lpx-builder-runtime" : "")}
      dir={String(data.locale || "").startsWith("ar") ? "rtl" : "ltr"}
      onFocusCapture={onFocusCapture}
      onClickCapture={onClickCapture}
    >
      {sent && !builderMode && <div className="v4-runtime-success">✅ تم تسجيل طلبك بنجاح</div>}
      {error && !builderMode && <div className="v4-runtime-error">{error}</div>}
      <LandingTemplateV4
        data={templateData}
        preview={builderMode}
        builderMode={builderMode}
        onSectionSelect={onSectionSelect}
        onSubmit={submit}
      />
    </div>
  );
}
