"use client";
import Link from "next/link";
export default function ProductsPanel({
  settings,
  setSettings,
  products,
  productSearch,
  setProductSearch,
  toggleProduct,
  moveProduct,
  series = false,
}: any) {
  const patch = (v: any) => setSettings({ ...settings, ...v }),
    selected = settings.selectedProductIds || [];
  return (
    <div className="store-settings-card">
      <div className="store-step-head">
        <span>3</span>
        <div>
          <h2>Choisis tes produits</h2>
          <p>Sélectionne ce qui doit apparaître dans cette boutique.</p>
        </div>
      </div>
      {/* templates de série : le titre se modifie dans Accueil › Produits */}
      {!series && (
        <label>
          Titre de la collection
          <input value={settings.collectionTitle || ""} onChange={(e) => patch({ collectionTitle: e.target.value })} />
        </label>
      )}
      <input
        className="store-product-search"
        value={productSearch}
        onChange={(e) => setProductSearch(e.target.value)}
        placeholder="Rechercher un produit…"
      />
      <div className="store-selected-count">
        {selected.length ? selected.length + " produit(s) sélectionné(s)" : "Tous les produits seront affichés"}
      </div>
      {/* Catalogue et cartes : réglés par le template (Template & style) pour les templates de série */}
      {!series && (
        <>
          <div className="store-product-studio store-catalog-studio">
            <h3>Catalogue / Filtres</h3>
            <p className="store-layout-help">
              Configure la page Boutique inspirée d’un catalogue e-commerce professionnel.
            </p>
            <div className="store-font-grid">
              <label>
                Colonnes catalogue PC
                <select
                  value={String(settings.catalogColumnsDesktop || 4)}
                  onChange={(e) => patch({ catalogColumnsDesktop: Number(e.target.value) })}
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </label>
              <label>
                Colonnes mobile
                <select
                  value={String(settings.catalogColumnsMobile || 2)}
                  onChange={(e) => patch({ catalogColumnsMobile: Number(e.target.value) })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </label>
            </div>
            <div className="store-block-checks">
              <label>
                <input
                  type="checkbox"
                  checked={settings.catalogShowFilters !== false}
                  onChange={(e) => patch({ catalogShowFilters: e.target.checked })}
                />{" "}
                Sidebar filtres
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.catalogShowSort !== false}
                  onChange={(e) => patch({ catalogShowSort: e.target.checked })}
                />{" "}
                Tri produits
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.catalogShowColors !== false}
                  onChange={(e) => patch({ catalogShowColors: e.target.checked })}
                />{" "}
                Couleurs
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.catalogShowSizes !== false}
                  onChange={(e) => patch({ catalogShowSizes: e.target.checked })}
                />{" "}
                Tailles
              </label>
            </div>
          </div>
          <div className="store-product-studio">
            <h3>Product Card Studio</h3>
            <p className="store-layout-help">
              Personnalise les cartes et les étiquettes produit dans toute la boutique.
            </p>
            <div className="store-font-grid">
              <label>
                Style carte
                <select
                  value={settings.productCardStyle || "modern"}
                  onChange={(e) => patch({ productCardStyle: e.target.value })}
                >
                  <option value="minimal">Minimal</option>
                  <option value="modern">Modern</option>
                  <option value="premium">Premium</option>
                  <option value="fashion">Fashion</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="cod">COD</option>
                  <option value="image-focus">Image Focus</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
              <label>
                Ratio image
                <select
                  value={settings.productImageRatio || "square"}
                  onChange={(e) => patch({ productImageRatio: e.target.value })}
                >
                  <option value="original">Original</option>
                  <option value="square">1:1</option>
                  <option value="portrait">4:5</option>
                  <option value="landscape">16:9</option>
                </select>
              </label>
              <label>
                Colonnes PC
                <select
                  value={String(settings.productColumnsDesktop || 4)}
                  onChange={(e) => patch({ productColumnsDesktop: Number(e.target.value) })}
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </label>
              <label>
                Colonnes tablette
                <select
                  value={String(settings.productColumnsTablet || 3)}
                  onChange={(e) => patch({ productColumnsTablet: Number(e.target.value) })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </label>
              <label>
                Colonnes mobile
                <select
                  value={String(settings.productColumnsMobile || 2)}
                  onChange={(e) => patch({ productColumnsMobile: Number(e.target.value) })}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </label>
              <label>
                Badge
                <select
                  value={settings.productBadgeMode || "discount"}
                  onChange={(e) => patch({ productBadgeMode: e.target.value })}
                >
                  <option value="none">Aucun</option>
                  <option value="discount">Remise automatique</option>
                  <option value="new">Nouveau</option>
                  <option value="bestseller">Best Seller</option>
                  <option value="free-delivery">Livraison gratuite</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </label>
              <label>
                Style badge
                <select
                  value={settings.productBadgeStyle || "pill"}
                  onChange={(e) => patch({ productBadgeStyle: e.target.value })}
                >
                  <option value="pill">Pilule</option>
                  <option value="rounded">Arrondi</option>
                  <option value="square">Rectangle</option>
                  <option value="ribbon">Ruban</option>
                </select>
              </label>
              <label>
                Position
                <select
                  value={settings.productBadgePosition || "top-left"}
                  onChange={(e) => patch({ productBadgePosition: e.target.value })}
                >
                  <option value="top-left">Haut gauche</option>
                  <option value="top-right">Haut droite</option>
                  <option value="bottom-left">Bas gauche</option>
                  <option value="bottom-right">Bas droite</option>
                </select>
              </label>
              {settings.productBadgeMode === "custom" && (
                <label>
                  Texte badge
                  <input
                    value={settings.productBadgeText || ""}
                    onChange={(e) => patch({ productBadgeText: e.target.value })}
                    placeholder="Offre spéciale"
                  />
                </label>
              )}
              <label>
                Couleur badge
                <input
                  type="color"
                  value={settings.productBadgeColor || "#111827"}
                  onChange={(e) => patch({ productBadgeColor: e.target.value })}
                />
              </label>
              <label>
                Texte badge
                <input
                  type="color"
                  value={settings.productBadgeTextColor || "#ffffff"}
                  onChange={(e) => patch({ productBadgeTextColor: e.target.value })}
                />
              </label>
            </div>
            <div className="store-block-checks">
              <label>
                <input
                  type="checkbox"
                  checked={settings.productShowDescription !== false}
                  onChange={(e) => patch({ productShowDescription: e.target.checked })}
                />{" "}
                Description
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.productShowComparePrice !== false}
                  onChange={(e) => patch({ productShowComparePrice: e.target.checked })}
                />{" "}
                Ancien prix
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.productShowButton !== false}
                  onChange={(e) => patch({ productShowButton: e.target.checked })}
                />{" "}
                Bouton CTA
              </label>
            </div>
          </div>
        </>
      )}
      <div className="store-builder-products selectable">
        {products
          .filter((x: any) => x.name?.toLowerCase().includes(productSearch.toLowerCase()))
          .map((x: any) => {
            const checked = selected.includes(x.id),
              pos = selected.indexOf(x.id);
            return (
              <div key={x.id} className={"store-product-choice " + (checked ? "selected" : "")}>
                <button className="store-product-main" onClick={() => toggleProduct(x.id)}>
                  {x.image ? <img src={x.image} alt="" /> : <span>PR</span>}
                  <span>
                    <b>{x.name}</b>
                    <small>{x.price} MAD</small>
                  </span>
                  <em>{checked ? "✓" : "+"}</em>
                </button>
                {checked && (
                  <div className="store-product-order">
                    <button onClick={() => moveProduct(x.id, -1)} disabled={pos === 0}>
                      ↑
                    </button>
                    <button onClick={() => moveProduct(x.id, 1)} disabled={pos === selected.length - 1}>
                      ↓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <Link className="store-builder-link" href="/products">
        + Ajouter / modifier mes produits
      </Link>
    </div>
  );
}
