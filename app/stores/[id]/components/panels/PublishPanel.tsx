"use client";
export default function PublishPanel({
  store,
  products,
  settings,
  saving,
  copied,
  setPreviewMode,
  onPublish,
  onCopy,
  onShare,
}: any) {
  return (
    <div className="store-settings-card store-publish-card">
      <div className="store-step-head">
        <span>5</span>
        <div>
          <h2>Publier ma boutique</h2>
          <p>Dernière vérification avant de commencer à vendre.</p>
        </div>
      </div>
      <div className="store-checklist">
        <span className={store.name ? "ok" : ""}>✓ Nom de boutique</span>
        <span className={products.length ? "ok" : ""}>✓ Produits disponibles</span>
        <span className={store.template_id ? "ok" : ""}>✓ Design choisi</span>
        <span className={settings.heroTitle ? "ok" : ""}>✓ Page d’accueil configurée</span>
      </div>
      <div className="store-publish-preview-buttons">
        <button onClick={() => setPreviewMode("desktop")}>▰ Voir PC</button>
        <button onClick={() => setPreviewMode("mobile")}>▯ Voir Mobile</button>
      </div>
      <button className="store-publish-main" onClick={onPublish} disabled={saving}>
        {saving ? "Publication…" : store.status === "PUBLISHED" ? "Republier la boutique" : "Publier ma boutique"}
      </button>
      {store.status === "PUBLISHED" && (
        <div className="store-published-final">
          <small>URL PUBLIQUE</small>
          <code>
            {typeof window !== "undefined" ? window.location.origin : ""}/store/{store.slug}
          </code>
          <button className="store-copy-main" onClick={onCopy}>
            {copied ? "✓ URL copiée" : "Copier l’URL"}
          </button>
          <button className="store-share-main" onClick={onShare}>
            Partager la boutique
          </button>
          <a className="store-view-main" href={"/store/" + store.slug} target="_blank" rel="noreferrer">
            Ouvrir ma boutique ↗
          </a>
        </div>
      )}
    </div>
  );
}
