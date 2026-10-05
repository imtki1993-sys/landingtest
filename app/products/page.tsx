"use client";
import Link from "next/link";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { useEffect, useMemo, useState } from "react";
import { generateProductVariants } from "../../lib/product-variants";
const empty = {
  name: "",
  price: "",
  compare_at_price: "",
  cost_price: "",
  stock: "",
  category: "",
  colors: "",
  sizes: "",
  description: "",
  image_urls: [] as string[],
  options: [] as any[],
  variants: [] as any[],
};
export default function Products() {
  const [products, setProducts] = useState<any[]>([]),
    [form, setForm] = useState<any>(empty),
    [editing, setEditing] = useState<any>(null),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [photos, setPhotos] = useState<File[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [hasMore, setHasMore] = useState(false),
    [q, setQ] = useState(""),
    [statusFilter, setStatusFilter] = useState("all"),
    [categoryFilter, setCategoryFilter] = useState("all"),
    [sort, setSort] = useState("newest");
  async function load() {
    const r = await fetch("/api/products"),
      x = await r.json();
    setProducts(x.products || []);
    setCursor(x.pagination?.nextCursor || null);
    setHasMore(!!x.pagination?.hasMore);
  }
  async function loadMore() {
    if (!cursor) return;
    const r = await fetch("/api/products?cursor=" + encodeURIComponent(cursor)),
      x = await r.json();
    setProducts((v) => [...v, ...(x.products || [])]);
    setCursor(x.pagination?.nextCursor || null);
    setHasMore(!!x.pagination?.hasMore);
  }
  useEffect(() => {
    load();
  }, []);
  function open(p?: any) {
    setEditing(p || null);
    setForm(
      p
        ? {
            name: p.name,
            price: p.price,
            compare_at_price: p.compare_at_price || "",
            cost_price: p.cost_price || "",
            stock: p.stock ?? "",
            category: p.specifications?.category || "",
            colors: (p.specifications?.colors || []).join(", "),
            sizes: (p.specifications?.sizes || []).join(", "),
            description: p.description || "",
            image_urls: p.images || [],
            options: p.specifications?.options || [],
            variants: p.specifications?.variants || [],
          }
        : empty,
    );
    setPhotos([]);
    setShow(true);
  }
  async function save(e: any) {
    e.preventDefault();
    setBusy(true);
    let payload = { ...form };
    if (photos.length) {
      const fd = new FormData();
      photos.forEach((f) => fd.append("images", f));
      const ur = await fetch("/api/upload", { method: "POST", body: fd }),
        ux = await ur.json();
      if (!ur.ok) {
        setBusy(false);
        return alert(ux.error || "Erreur upload");
      }
      payload.image_urls = [...(form.image_urls || []), ...(ux.urls || [])].slice(0, 10);
    }
    const url = editing ? "/api/products/" + editing.id : "/api/products";
    const r = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!r.ok) {
      const x = await r.json();
      return alert(x.error || "Erreur");
    }
    setShow(false);
    await load();
  }
  function removeImage(i: number) {
    setForm({ ...form, image_urls: (form.image_urls || []).filter((_: string, n: number) => n !== i) });
  }
  function moveImage(i: number, d: number) {
    const a = [...(form.image_urls || [])],
      j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setForm({ ...form, image_urls: a });
  }
  async function archive(p: any) {
    if (!confirm('Archiver "' + p.name + '" ?')) return;
    await fetch("/api/products/" + p.id, { method: "DELETE" });
    load();
  }
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.specifications?.category).filter(Boolean))),
    [products],
  );
  const visibleProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (statusFilter === "all" || (statusFilter === "active" ? p.is_active : !p.is_active)) &&
            (categoryFilter === "all" || p.specifications?.category === categoryFilter) &&
            (!q.trim() || p.name.toLowerCase().includes(q.toLowerCase())),
        )
        .sort((a, b) =>
          sort === "name" ? a.name.localeCompare(b.name) : sort === "price" ? Number(b.price) - Number(a.price) : 0,
        ),
    [products, q, statusFilter, categoryFilter, sort],
  );
  async function duplicate(p: any) {
    const body = {
      name: p.name + " - Copie",
      price: p.price,
      compare_at_price: p.compare_at_price,
      cost_price: p.cost_price,
      stock: p.stock,
      description: p.description,
      image_urls: p.images || [],
      category: p.specifications?.category || "",
      colors: p.specifications?.colors || [],
      sizes: p.specifications?.sizes || [],
    };
    await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }
  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content products-catalog-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">CATALOGUE</span>
            <h1>Mes produits</h1>
            <p>Gère ton catalogue et crée rapidement de nouvelles landing pages COD.</p>
          </div>
          <button className="new-page-btn" onClick={() => open()}>
            + Nouveau produit
          </button>
        </header>
        <div className="product-kpis">
          <article>
            <span>▣</span>
            <div>
              <small>Produits</small>
              <b>{products.length}</b>
              <em>Catalogue actif</em>
            </div>
          </article>
          <article>
            <span>✓</span>
            <div>
              <small>Actifs</small>
              <b>{products.filter((p) => p.is_active).length}</b>
              <em>
                {products.length ? Math.round((products.filter((p) => p.is_active).length / products.length) * 100) : 0}
                % du total
              </em>
            </div>
          </article>
          <article>
            <span>▤</span>
            <div>
              <small>Landing Pages</small>
              <b>{products.reduce((n, p) => n + (p.pages || 0), 0)}</b>
              <em>Pages associées</em>
            </div>
          </article>
          <article>
            <span>▣</span>
            <div>
              <small>Commandes</small>
              <b>{products.reduce((n, p) => n + (p.orders || 0), 0)}</b>
              <em>Total catalogue</em>
            </div>
          </article>
        </div>
        <div className="product-catalog-tools">
          <label>
            ⌕<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit..." />
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            {categories.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Plus récents</option>
            <option value="name">Nom A–Z</option>
            <option value="price">Prix décroissant</option>
          </select>
        </div>
        <div className="product-catalog-table-wrap">
          <table className="product-catalog-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Landing Pages</th>
                <th>Commandes</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      {p.image ? <img src={p.image} alt={p.name} /> : <span>PR</span>}
                      <div>
                        <b>{p.name}</b>
                        <small>{p.specifications?.category || "Produit catalogue"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <b>{p.price} MAD</b>
                    {p.compare_at_price && <small className="old-price">{p.compare_at_price} MAD</small>}
                  </td>
                  <td>
                    {p.stock != null ? (
                      <>
                        <b className={Number(p.stock) > 0 ? "stock-ok" : "stock-low"}>
                          {Number(p.stock) > 0 ? "En stock" : "Rupture"}
                        </b>
                        <small>{p.stock}</small>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{p.pages || 0}</td>
                  <td>{p.orders || 0}</td>
                  <td>
                    <span className={"product-status " + (p.is_active ? "active" : "inactive")}>
                      ● {p.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>
                    <div className="product-row-actions">
                      <button title="Modifier" onClick={() => open(p)}>
                        ✎
                      </button>
                      <Link title="Créer landing" href={"/?product=" + p.id}>
                        ▣
                      </Link>
                      <details>
                        <summary>•••</summary>
                        <div>
                          <button onClick={() => duplicate(p)}>Dupliquer</button>
                          <button className="danger-action" onClick={() => archive(p)}>
                            Archiver
                          </button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleProducts.length && <div className="product-table-empty">Aucun produit trouvé.</div>}
        </div>
        <div className="product-catalog-footer">
          <span>
            {visibleProducts.length} sur {products.length} produits
          </span>
          {hasMore && (
            <button type="button" onClick={loadMore}>
              Charger plus
            </button>
          )}
        </div>
        {show && (
          <div className="product-modal-backdrop" onClick={() => setShow(false)}>
            <form className="product-modal" onSubmit={save} onClick={(e) => e.stopPropagation()}>
              <div className="product-modal-head">
                <div>
                  <small>CATALOGUE</small>
                  <h2>{editing ? "Modifier le produit" : "Nouveau produit"}</h2>
                </div>
                <button type="button" onClick={() => setShow(false)}>
                  ×
                </button>
              </div>
              <label>
                Nom du produit
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <div className="product-form-grid">
                <label>
                  Prix (MAD)
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </label>
                <label>
                  Ancien prix
                  <input
                    type="number"
                    step="0.01"
                    value={form.compare_at_price}
                    onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  />
                </label>
                <label>
                  Coût d'achat
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </label>
              </div>
              <div className="product-form-grid product-option-grid">
                <label>
                  Catégorie
                  <input
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Ex: Jeans, Sacs, Chaussures"
                  />
                </label>
                <label>
                  Couleurs
                  <input
                    value={form.colors || ""}
                    onChange={(e) => setForm({ ...form, colors: e.target.value })}
                    placeholder="Noir, Blanc, Rouge"
                  />
                </label>
                <label>
                  Tailles
                  <input
                    value={form.sizes || ""}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="XS, S, M, L, XL"
                  />
                </label>
              </div>
              <small className="product-options-help">
                Sépare les valeurs par des virgules. Elles seront utilisées comme variantes et filtres dans la boutique.
              </small>
              <div className="product-variants-editor">
                <div className="product-variants-head">
                  <div>
                    <h3>Options + Variantes</h3>
                    <p>Chaque combinaison peut avoir son propre SKU, prix, stock et image.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const options = [
                        {
                          name: "Couleur",
                          values: String(form.colors || "")
                            .split(",")
                            .map((x: string) => x.trim())
                            .filter(Boolean),
                        },
                        {
                          name: "Taille",
                          values: String(form.sizes || "")
                            .split(",")
                            .map((x: string) => x.trim())
                            .filter(Boolean),
                        },
                      ].filter((x) => x.values.length);
                      setForm({ ...form, options, variants: generateProductVariants(options, form.variants || []) });
                    }}
                  >
                    Générer les variantes
                  </button>
                </div>
                {(form.variants || []).length > 0 && (
                  <div className="product-variants-table">
                    <div className="variant-row variant-head">
                      <b>Variante</b>
                      <b>SKU</b>
                      <b>Prix</b>
                      <b>Stock</b>
                      <b>Image URL</b>
                      <b>Actif</b>
                    </div>
                    {form.variants.map((v: any, i: number) => (
                      <div className="variant-row" key={v.id || i}>
                        <span>{Object.values(v.options || {}).join(" / ")}</span>
                        <input
                          value={v.sku || ""}
                          onChange={(e) => {
                            const a = [...form.variants];
                            a[i] = { ...v, sku: e.target.value };
                            setForm({ ...form, variants: a });
                          }}
                          placeholder="SKU"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={v.price ?? ""}
                          onChange={(e) => {
                            const a = [...form.variants];
                            a[i] = { ...v, price: e.target.value };
                            setForm({ ...form, variants: a });
                          }}
                          placeholder={String(form.price || "Prix")}
                        />
                        <input
                          type="number"
                          value={v.stock ?? ""}
                          onChange={(e) => {
                            const a = [...form.variants];
                            a[i] = { ...v, stock: e.target.value };
                            setForm({ ...form, variants: a });
                          }}
                          placeholder="Stock"
                        />
                        <input
                          value={v.image || ""}
                          onChange={(e) => {
                            const a = [...form.variants];
                            a[i] = { ...v, image: e.target.value };
                            setForm({ ...form, variants: a });
                          }}
                          placeholder="https://..."
                        />
                        <input
                          type="checkbox"
                          checked={v.active !== false}
                          onChange={(e) => {
                            const a = [...form.variants];
                            a[i] = { ...v, active: e.target.checked };
                            setForm({ ...form, variants: a });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label>
                Photos produit
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) =>
                    setPhotos(
                      Array.from(e.target.files || []).slice(0, Math.max(0, 10 - (form.image_urls?.length || 0))),
                    )
                  }
                />
                <small>
                  {photos.length
                    ? photos.length + " nouvelle(s) photo(s)"
                    : (form.image_urls?.length || 0) + " photo(s) enregistrée(s)"}{" "}
                  · La première photo sera l'image principale.
                </small>
              </label>
              {form.image_urls?.length > 0 && (
                <div className="product-image-manager">
                  {form.image_urls.map((url: string, i: number) => (
                    <div className="product-image-card" key={url + i}>
                      <img src={url} alt={"Photo " + (i + 1)} />
                      <span>{i === 0 ? "PRINCIPALE" : "#" + (i + 1)}</span>
                      <div>
                        <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)}>
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={i === form.image_urls.length - 1}
                          onClick={() => moveImage(i, 1)}
                        >
                          →
                        </button>
                        <button type="button" className="remove-image" onClick={() => removeImage(i)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <label>
                Description
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <button className="product-save" disabled={busy}>
                {busy ? "Enregistrement..." : editing ? "Enregistrer les modifications" : "Ajouter le produit"}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
