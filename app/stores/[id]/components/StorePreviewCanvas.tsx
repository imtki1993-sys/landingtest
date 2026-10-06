"use client";
import type { RefObject } from "react";
export default function StorePreviewCanvas({
  store,
  settings,
  editPage,
  pageList,
  previewMode,
  setPreviewMode,
  previewKey,
  setPreviewKey,
  previewRef,
  products = [],
  trial = "",
}: any) {
  const pageLabel = editPage === "home" ? "Accueil" : pageList.find((x: any) => x[0] === editPage)?.[1] || "Accueil",
    // page Produit : premier produit de la boutique
    productSlug = products[0]?.slug || products[0]?.id || "",
    path =
      "/store/" +
      store.slug +
      (editPage === "home"
        ? ""
        : editPage === "product"
          ? productSlug
            ? "/product/" + encodeURIComponent(productSlug)
            : "/shop"
          : "/" + editPage);
  return (
    <section className="store-builder-preview">
      <div className="store-preview-stage">
        <div className="store-preview-label">
          <div>
            <b>Aperçu réel du Store</b>
            <small>
              {pageLabel} · aperçu en temps réel{trial ? " · essai d'un template" : ""}
            </small>
          </div>
          <div className="store-preview-actions">
            <button className={previewMode === "desktop" ? "active" : ""} onClick={() => setPreviewMode("desktop")}>
              ▰ PC
            </button>
            <button className={previewMode === "mobile" ? "active" : ""} onClick={() => setPreviewMode("mobile")}>
              ▯ Mobile
            </button>
            <button onClick={() => setPreviewKey((k: number) => k + 1)}>↻ Actualiser</button>
            <a href={path} target="_blank" rel="noreferrer">
              Plein écran ↗
            </a>
          </div>
        </div>
        <div className={"store-real-preview store-real-preview-" + previewMode}>
          <iframe
            ref={previewRef as RefObject<HTMLIFrameElement>}
            key={previewKey + "-" + editPage}
            title="Aperçu réel boutique"
            src={path + "?preview=1&v=" + previewKey}
            onLoad={() => {
              // l'aperçu signale qu'il est prêt (LANDPRO_PREVIEW_READY) : l'éditeur lui envoie alors la boutique
              if (!trial)
                previewRef.current?.contentWindow?.postMessage(
                  { type: "LANDPRO_STORE_PREVIEW", store: { ...store, settings } },
                  "*",
                );
            }}
          />
        </div>
      </div>
    </section>
  );
}
