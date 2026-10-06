"use client";
export default function StoreBuilderTopbar({
  store,
  saving,
  copied,
  onSave,
  onPublish,
  onCopy,
  dirty,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: any) {
  return (
    <>
      <header>
        <div>
          <small>
            ÉDITEUR
            {dirty ? (
              <em className="store-dirty"> · modifications non enregistrées</em>
            ) : (
              <em className="store-saved"> · enregistré</em>
            )}
          </small>
          <h1>{store.name}</h1>
        </div>
        <div>
          {store.status === "PUBLISHED" && (
            <a className="ghost-btn store-open-btn" href={"/store/" + store.slug} target="_blank" rel="noreferrer">
              Voir Store ↗
            </a>
          )}
          {onUndo && (
            <span className="store-history">
              <button type="button" className="ghost-btn" onClick={onUndo} disabled={!canUndo} title="Annuler (Ctrl+Z)">
                ↶
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={onRedo}
                disabled={!canRedo}
                title="Rétablir (Ctrl+Maj+Z)"
              >
                ↷
              </button>
            </span>
          )}
          <button className="ghost-btn" onClick={onSave} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button className="new-page-btn" onClick={onPublish} disabled={saving}>
            Publier
          </button>
        </div>
      </header>
      {store.status === "PUBLISHED" && (
        <div className="store-published-url">
          <span>
            <small>URL PUBLIQUE</small>
            <a href={"/store/" + store.slug} target="_blank" rel="noreferrer">
              {typeof window !== "undefined" ? window.location.origin : ""}/store/{store.slug}
            </a>
          </span>
          <button type="button" onClick={onCopy}>
            {copied ? "✓ Copié" : "Copier"}
          </button>
          <a href={"/store/" + store.slug} target="_blank" rel="noreferrer">
            Ouvrir ↗
          </a>
        </div>
      )}
    </>
  );
}
