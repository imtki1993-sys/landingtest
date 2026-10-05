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
}: any) {
  const pageLabel = editPage === "home" ? "Accueil" : pageList.find((x: any) => x[0] === editPage)?.[1] || "Accueil",
    path = "/store/" + store.slug + (editPage === "home" ? "" : "/" + editPage);
  return (
    <section className="store-builder-preview">
      <div className="store-preview-stage">
        <div className="store-preview-label">
          <div>
            <b>Aperçu réel du Store</b>
            <small>{pageLabel} · aperçu en temps réel</small>
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
