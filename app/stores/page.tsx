"use client";
import Link from "next/link";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { useEffect, useMemo, useState } from "react";
import { STORE_BENCHMARK_CATEGORIES, STORE_BENCHMARK_NICHES } from "../../lib/store-benchmark-niches";
import TemplateGallery from "../../components/store-templates/TemplateGallery";
import { getStoreTemplate } from "../../lib/store-templates";

const DEMOS = [
  ["Running Pro", "Sneakers", "Performance"],
  ["Casa Essentials", "Maison", "Nouveautés"],
  ["Marrakech Style", "Mode", "Collection"],
  ["Pure Minimal", "Lifestyle", "Essentiels"],
  ["Night Gear", "Tech", "Premium"],
  ["Noor Collection", "Abaya", "Modeste"],
  ["Medina Edit", "Fashion", "Tendance"],
  ["Maison Luxe", "Premium", "Signature"],
  ["Golden Shine", "Bijoux", "Best sellers"],
  ["Chrono", "Montres", "Collection"],
  ["Vision", "Lunettes", "Nouveaux"],
  ["Urban Bags", "Sacs", "Collection"],
  ["Glow", "Beauté", "Routine"],
  ["Privé", "Parfum", "Signature"],
  ["Petit Monde", "Bébé", "Douceur"],
  ["Street Run", "Sneakers", "Performance"],
  ["Fit Lab", "Fitness", "Énergie"],
  ["Sport Club", "Sport", "Performance"],
  ["Natural Care", "Bien-être", "Naturel"],
  ["Casa Living", "Maison", "Inspiration"],
  ["Chef Store", "Cuisine", "Essentiels"],
  ["Next Tech", "Tech", "Innovation"],
  ["Smart Life", "Gadgets", "Top ventes"],
  ["Drive Pro", "Auto", "Équipement"],
  ["Ride X", "Moto", "Road"],
  ["Hero Product", "Best seller", "Offre"],
  ["Hot Deals", "Promos", "Flash"],
  ["Trend Shop", "Social", "Viral"],
  ["Noir Edition", "Premium", "Exclusive"],
  ["Mega Store", "Multi-catégories", "Top ventes"],
];
const TEMPLATES = [
  ["Atlas COD", "COD Maroc", "🛍️"],
  ["Casa Market", "Général", "🏪"],
  ["Marrakech Shop", "Général", "🌴"],
  ["Rabat Minimal", "Minimal", "◻️"],
  ["Sahara Dark", "Dark", "🌙"],
  ["Noor Abaya", "Mode", "🧕"],
  ["Medina Fashion", "Mode", "👗"],
  ["Luxe Maroc", "Luxe", "✦"],
  ["Bijoux Gold", "Bijoux", "💎"],
  ["Time Store", "Montres", "⌚"],
  ["Vision Optic", "Lunettes", "🕶️"],
  ["Bag House", "Sacs", "👜"],
  ["Beauty Glow", "Beauté", "✨"],
  ["Parfum Privé", "Parfums", "🌸"],
  ["Baby Care", "Bébé", "🧸"],
  ["Sneaker Hub", "Chaussures", "👟"],
  ["Fit Market", "Fitness", "🏋️"],
  ["Sport Pro", "Sport", "⚽"],
  ["Wellness Care", "Bien-être", "🌿"],
  ["Home Living", "Maison", "🏠"],
  ["Kitchen Plus", "Cuisine", "🍳"],
  ["Tech Zone", "Électronique", "💻"],
  ["Gadget Lab", "Gadgets", "⚡"],
  ["Auto Gear", "Automobile", "🚗"],
  ["Moto Ride", "Moto", "🏍️"],
  ["One Product", "One product", "🎯"],
  ["Flash Deals", "Promotions", "🔥"],
  ["Social Shop", "Social", "♥"],
  ["Premium Black", "Premium", "◆"],
  ["Marketplace", "Multi-produit", "▦"],
].map((x, i) => ({
  id: "free-" + String(i + 1).padStart(2, "0"),
  name: x[0],
  category: x[1],
  icon: x[2],
  demo: DEMOS[i],
}));

type Store = {
  id: string;
  name: string;
  templateId: string;
  language: string;
  createdAt: string;
  slug?: string;
  status?: string;
  image?: string;
  selectedProductIds?: string[];
};
export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]),
    [productImages, setProductImages] = useState<Record<string, string>>({}),
    [selected, setSelected] = useState("benchmark-ai"),
    [name, setName] = useState(""),
    [language, setLanguage] = useState("darija"),
    [filter, setFilter] = useState("Tous"),
    [copiedId, setCopiedId] = useState(""),
    [createOpen, setCreateOpen] = useState(false),
    [createStep, setCreateStep] = useState(1),
    [creating, setCreating] = useState(false),
    [aiNiche, setAiNiche] = useState(""),
    [nicheSearch, setNicheSearch] = useState(""),
    [nicheCategory, setNicheCategory] = useState("Tous"),
    [nichePreview, setNichePreview] = useState(""),
    [storeTab, setStoreTab] = useState<"all" | "published" | "draft">("all"),
    [storeSearch, setStoreSearch] = useState(""),
    [storeSort, setStoreSort] = useState("newest"),
    [generatorMode, setGeneratorMode] = useState<"templates" | "classic" | "pro-v2">("templates"),
    [storeTemplate, setStoreTemplate] = useState(""),
    [productList, setProductList] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/stores", { cache: "no-store" }).then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Stores indisponibles");
        return x;
      }),
      fetch("/api/products?limit=100&summary=1", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([x, p]) => {
        const map: Record<string, string> = {};
        for (const v of p.products || []) map[v.id] = v.image || v.images?.[0] || "";
        setProductImages(map);
        setProductList(p.products || []);
        setStores(
          (x.stores || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            templateId: v.template_id,
            language: v.locale,
            createdAt: v.created_at,
            slug: v.slug,
            status: v.status,
            image: v.card_image || "",
            selectedProductIds: Array.isArray(v.selected_product_ids) ? v.selected_product_ids : [],
          })),
        );
      })
      .catch((e) => console.error(e));
  }, []);
  const cats = ["Tous", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];
  const visible = useMemo(
    () => (filter === "Tous" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter)),
    [filter],
  );
  async function createStore() {
    const n = name.trim();
    if (!n) return alert("Entre le nom de la boutique.");
    if (generatorMode === "templates" && !storeTemplate) return alert("Choisis un template.");
    setCreating(true);
    const r = await fetch("/api/stores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          generatorMode === "templates"
            ? { name: n, templateId: storeTemplate, locale: language }
            : {
                name: n,
                templateId: "benchmark-ai",
                locale: language,
                generateWithAI: true,
                niche: aiNiche,
                benchmarkNiche: aiNiche,
                seed: n,
                generatorVersion: generatorMode,
                proPreset: generatorMode === "pro-v2" ? "modern-glow" : undefined,
              },
        ),
      }),
      x = await r.json();
    setCreating(false);
    if (!r.ok) {
      if (
        x.code === "META_AI_UNAUTHORIZED" ||
        x.code === "META_AI_KEY_MISSING" ||
        x.code === "META_AI_KEY_DECRYPT_FAILED"
      )
        return alert(
          x.error +
            "\n\nOuvre Paramètres → Intégrations → MODEL_API_KEY (Meta Model API), enregistre une clé valide, puis relance la génération.",
        );
      return alert(x.error || "Erreur lors de la création");
    }
    const v = x.store;
    setStores((cur) => [
      {
        id: v.id,
        name: v.name,
        templateId: v.template_id,
        language: v.locale,
        createdAt: v.created_at,
        slug: v.slug,
        status: v.status,
        image: v.settings?.heroImage || v.settings?.products?.[0]?.image || v.settings?.productImage || "",
      },
      ...cur,
    ]);
    if (x.aiWarning) sessionStorage.setItem("landpro_store_ai_warning", x.aiWarning);
    window.location.href = "/stores/" + v.id;
  }
  async function copyStoreUrl(s: Store) {
    if (!s.slug) return alert("Publie d’abord la boutique.");
    const url = window.location.origin + "/store/" + s.slug;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      prompt("Copie l’URL :", url);
    }
  }
  async function duplicateStore(s: Store) {
    const source = await fetch("/api/stores/" + s.id, { cache: "no-store" }).then((r) => r.json());
    const r = await fetch("/api/stores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: s.name + " - Copie", templateId: s.templateId, locale: s.language }),
      }),
      x = await r.json();
    if (!r.ok) return alert(x.error || "Duplication impossible");
    if (source.store?.settings)
      await fetch("/api/stores/" + x.store.id, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId: s.templateId, locale: s.language, settings: source.store.settings }),
      });
    const v = x.store;
    setStores((cur) => [
      {
        id: v.id,
        name: v.name,
        templateId: v.template_id,
        language: v.locale,
        createdAt: v.created_at,
        slug: v.slug,
        status: v.status,
        image: v.settings?.heroImage || v.settings?.products?.[0]?.image || v.settings?.productImage || "",
      },
      ...cur,
    ]);
  }
  async function deleteStore(s: Store) {
    if (!confirm(`Supprimer définitivement "${s.name}" ?`)) return;
    const r = await fetch("/api/stores/" + s.id, { method: "DELETE" }),
      x = await r.json().catch(() => ({}));
    if (!r.ok) return alert(x.error || "Suppression impossible");
    setStores((cur) => cur.filter((v) => v.id !== s.id));
  }
  async function publishStore(s: Store) {
    const r = await fetch("/api/stores/" + s.id, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      }),
      x = await r.json();
    if (!r.ok) return alert(x.error || "Publication impossible");
    setStores((cur) => cur.map((v) => (v.id === s.id ? { ...v, status: "PUBLISHED", slug: x.store.slug } : v)));
  }
  const benchmarkVisible = useMemo(
    () =>
      STORE_BENCHMARK_NICHES.filter(
        (n) =>
          (nicheCategory === "Tous" || n.category === nicheCategory) &&
          (!nicheSearch.trim() ||
            n.label.toLowerCase().includes(nicheSearch.toLowerCase()) ||
            n.id.includes(nicheSearch.toLowerCase())),
      ),
    [nicheCategory, nicheSearch],
  );
  const visibleStores = useMemo(
    () =>
      stores
        .filter(
          (s) =>
            (storeTab === "all" || (storeTab === "published" ? s.status === "PUBLISHED" : s.status !== "PUBLISHED")) &&
            (!storeSearch.trim() ||
              s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
              String(s.slug || "")
                .toLowerCase()
                .includes(storeSearch.toLowerCase())),
        )
        .sort((a, b) =>
          storeSort === "name"
            ? a.name.localeCompare(b.name)
            : storeSort === "oldest"
              ? +new Date(a.createdAt) - +new Date(b.createdAt)
              : +new Date(b.createdAt) - +new Date(a.createdAt),
        ),
    [stores, storeTab, storeSearch, storeSort],
  );
  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content stores-dashboard store-library-page">
        <header className="dash-header">
          <div>
            <h1>Mes Stores</h1>
            <p>Crée, gère et publie tes boutiques e-commerce.</p>
          </div>
          <button
            type="button"
            className="new-page-btn"
            onClick={() => {
              setCreateStep(1);
              setCreateOpen(true);
            }}
          >
            + Nouveau store
          </button>
        </header>
        <div className="landing-tabs store-library-tabs">
          <button className={storeTab === "all" ? "active" : ""} onClick={() => setStoreTab("all")}>
            Toutes <b>{stores.length}</b>
          </button>
          <button className={storeTab === "published" ? "active" : ""} onClick={() => setStoreTab("published")}>
            Publiées <b>{stores.filter((s) => s.status === "PUBLISHED").length}</b>
          </button>
          <button className={storeTab === "draft" ? "active" : ""} onClick={() => setStoreTab("draft")}>
            Brouillons <b>{stores.filter((s) => s.status !== "PUBLISHED").length}</b>
          </button>
        </div>
        <div className="landing-library-tools store-library-tools">
          <label className="landing-search">
            ⌕
            <input
              aria-label="Rechercher une boutique"
              placeholder="Rechercher par nom, URL..."
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Statut"
            value={storeTab}
            onChange={(e) => setStoreTab(e.target.value as "all" | "published" | "draft")}
          >
            <option value="all">Statut</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </select>
          <select aria-label="Trier les boutiques" value={storeSort} onChange={(e) => setStoreSort(e.target.value)}>
            <option value="newest">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="name">Nom A–Z</option>
          </select>
        </div>
        <section className="store-card-library">
          <div className="store-card-grid">
            {visibleStores.map((s, i) => {
              const t = TEMPLATES.find((x) => x.id === s.templateId);
              const st = getStoreTemplate(s.templateId);
              return (
                <article className="store-library-card" key={s.id}>
                  <div className={"store-card-media store-card-media-" + (i % 6)}>
                    {(() => {
                      const image =
                        s.selectedProductIds?.map((id) => productImages[id]).find(Boolean) ||
                        s.image ||
                        Object.values(productImages).find(Boolean) ||
                        "";
                      return image ? (
                        <img className="store-card-main-image" src={image} alt={s.name} loading="lazy" />
                      ) : (
                        <span className="store-card-icon">{t?.icon || "🏪"}</span>
                      );
                    })()}
                    <em className={s.status === "PUBLISHED" ? "published" : "draft"}>
                      {s.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                    </em>
                    <details>
                      <summary>•••</summary>
                      <div>
                        <button onClick={() => duplicateStore(s)}>Dupliquer</button>
                        <button onClick={() => publishStore(s)}>
                          {s.status === "PUBLISHED" ? "Republier" : "Publier"}
                        </button>
                        <button className="danger-action" onClick={() => deleteStore(s)}>
                          Supprimer
                        </button>
                      </div>
                    </details>
                  </div>
                  <div className="store-card-body">
                    <div className="store-card-title">
                      <b>{s.name}</b>
                      <small>{s.status === "PUBLISHED" && s.slug ? "/store/" + s.slug : "Boutique non publiée"}</small>
                    </div>
                    <div className="store-card-meta">
                      <span>
                        <b>{st?.name || t?.name || "AI Store"}</b>
                        <small>Design</small>
                      </span>
                      <span>
                        <b>{s.language}</b>
                        <small>Langue</small>
                      </span>
                      <span>
                        <b>{new Date(s.createdAt).toLocaleDateString("fr-FR")}</b>
                        <small>Créée</small>
                      </span>
                    </div>
                    <div className="store-card-actions">
                      <Link className="edit" href={"/stores/" + s.id}>
                        ✎ Éditer
                      </Link>
                      <a
                        className="preview"
                        href={s.status === "PUBLISHED" && s.slug ? "/store/" + s.slug : "/stores/" + s.id}
                        target={s.status === "PUBLISHED" ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        ◉ Aperçu
                      </a>
                      <button title="Copier URL" onClick={() => copyStoreUrl(s)} disabled={s.status !== "PUBLISHED"}>
                        {copiedId === s.id ? "✓" : "⋮"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!visibleStores.length && (
            <div className="store-library-empty">
              <b>Aucune boutique</b>
              <span>Crée ton premier store ou modifie les filtres.</span>
            </div>
          )}
        </section>
        {createOpen && (
          <div className="store-create-modal" onClick={() => setCreateOpen(false)}>
            <div className="store-create-wizard" onClick={(e) => e.stopPropagation()}>
              <button className="store-wizard-close" onClick={() => setCreateOpen(false)}>
                ×
              </button>
              <div className="store-wizard-progress">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={createStep >= n ? "active" : ""}>
                    <i>{createStep > n ? "✓" : n}</i>
                    <b>
                      {n === 1
                        ? "Nom du Store"
                        : n === 2
                          ? "Template"
                          : generatorMode === "templates"
                            ? "Création"
                            : "Génération IA"}
                    </b>
                  </span>
                ))}
              </div>
              {createStep === 1 && (
                <section className="store-wizard-step">
                  <small>ÉTAPE 1 SUR 3</small>
                  <h2>Comment s’appelle ton store ?</h2>
                  <p>Entre simplement le nom de ta boutique et choisis la langue.</p>
                  <label>
                    Nom du Store
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex. Motorix Store"
                    />
                  </label>
                  <label>
                    Langue
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="darija">Darija Maroc</option>
                      <option value="ar">العربية</option>
                      <option value="fr">Français</option>
                    </select>
                  </label>
                  <button
                    className="store-wizard-next"
                    onClick={() => (name.trim() ? setCreateStep(2) : alert("Entre le nom de la boutique."))}
                  >
                    Continuer →
                  </button>
                </section>
              )}
              {createStep === 2 && (
                <section className="store-wizard-step store-niche-step">
                  <small>ÉTAPE 2 SUR 3 · GÉNÉRATEUR</small>
                  <h2>Choisis ton moteur de Store</h2>
                  <p>
                    Le Générateur Pro V2 compose une boutique premium modulaire. Le moteur classique reste disponible
                    pour tes anciens workflows.
                  </p>
                  <div className="store-generator-modes">
                    <button
                      type="button"
                      className={generatorMode === "templates" ? "active" : ""}
                      onClick={() => setGeneratorMode("templates")}
                    >
                      <b>▦ Templates de boutique</b>
                      <span>Séries de templates prêts à l’emploi</span>
                      <small>Boutique prête tout de suite, avec tes produits · sans clé IA</small>
                    </button>
                    <button
                      type="button"
                      className={generatorMode === "pro-v2" ? "active" : ""}
                      onClick={() => setGeneratorMode("pro-v2")}
                    >
                      <b>✦ Générateur Pro IA</b>
                      <span>Modern Glow Commerce</span>
                      <small>Hero Glow · Produits · Promo · Offers · UGC · FAQ · Footer Pro</small>
                    </button>
                    <button
                      type="button"
                      className={generatorMode === "classic" ? "active" : ""}
                      onClick={() => setGeneratorMode("classic")}
                    >
                      <b>Générateur classique</b>
                      <span>UI/UX Pro Max</span>
                      <small>Conserve le moteur Store actuel.</small>
                    </button>
                  </div>
                  {generatorMode === "templates" ? (
                    <>
                      <h3 className="store-niche-heading">Choisis ton template</h3>
                      <TemplateGallery
                        value={storeTemplate}
                        onChange={setStoreTemplate}
                        products={productList}
                        locale={language}
                        storeName={name.trim() || undefined}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="store-niche-heading">Choisis ensuite la niche de référence</h3>
                      <input
                        className="store-niche-search"
                        value={nicheSearch}
                        onChange={(e) => setNicheSearch(e.target.value)}
                        placeholder="Rechercher : automobile, luxe, beauté, restaurant..."
                      />
                      <div className="store-niche-cats">
                        {STORE_BENCHMARK_CATEGORIES.map((x) => (
                          <button
                            type="button"
                            key={x}
                            className={nicheCategory === x ? "active" : ""}
                            onClick={() => setNicheCategory(x)}
                          >
                            {x}
                          </button>
                        ))}
                      </div>
                      <div className="store-niche-grid">
                        {benchmarkVisible.map((n) => (
                          <article key={n.id} className={"store-niche-card " + (aiNiche === n.id ? "selected" : "")}>
                            <div className="store-niche-thumb">
                              <iframe
                                title={"Aperçu " + n.label}
                                loading="lazy"
                                src={
                                  "https://hylarucoder.github.io/benchmark-skill-ui-ux-pro-max/pages/" +
                                  n.id +
                                  "/index.html"
                                }
                                tabIndex={-1}
                              />
                              <button type="button" onClick={() => setNichePreview(n.id)}>
                                Aperçu réel
                              </button>
                            </div>
                            <button type="button" className="store-niche-select" onClick={() => setAiNiche(n.id)}>
                              <span>{n.label}</span>
                              <small>{n.category}</small>
                              <em>{n.referencePath}</em>
                              {aiNiche === n.id && <b>✓ Sélectionné</b>}
                            </button>
                          </article>
                        ))}
                      </div>
                      {nichePreview && (
                        <div className="store-niche-preview-modal" onClick={() => setNichePreview("")}>
                          <div onClick={(e) => e.stopPropagation()}>
                            <header>
                              <div>
                                <b>{STORE_BENCHMARK_NICHES.find((n) => n.id === nichePreview)?.label}</b>
                                <small>UI/UX Pro Max · aperçu de référence</small>
                              </div>
                              <button type="button" onClick={() => setNichePreview("")}>
                                ×
                              </button>
                            </header>
                            <iframe
                              title="Aperçu réel du template"
                              src={
                                "https://hylarucoder.github.io/benchmark-skill-ui-ux-pro-max/pages/" +
                                nichePreview +
                                "/index.html"
                              }
                            />
                            <footer>
                              <button type="button" onClick={() => setNichePreview("")}>
                                Fermer
                              </button>
                              <button
                                type="button"
                                className="store-wizard-next"
                                onClick={() => {
                                  setAiNiche(nichePreview);
                                  setNichePreview("");
                                }}
                              >
                                Utiliser ce design
                              </button>
                            </footer>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="store-wizard-nav">
                    <button onClick={() => setCreateStep(1)}>← Retour</button>
                    <button
                      className="store-wizard-next"
                      onClick={() =>
                        generatorMode === "templates"
                          ? storeTemplate
                            ? setCreateStep(3)
                            : alert("Choisis un template.")
                          : aiNiche
                            ? setCreateStep(3)
                            : alert("Sélectionne une niche.")
                      }
                    >
                      Continuer →
                    </button>
                  </div>
                </section>
              )}
              {createStep === 3 && generatorMode === "templates" && (
                <section className="store-wizard-step store-ai-step">
                  <small>ÉTAPE 3 SUR 3</small>
                  <div className="store-ai-icon">▦</div>
                  <h2>Crée ma boutique</h2>
                  <p>
                    <b>{name || "Ta boutique"}</b> sera créée avec le template{" "}
                    <b>{getStoreTemplate(storeTemplate)?.name}</b> et tes produits. Tous les textes, couleurs et
                    sections restent modifiables dans l’éditeur.
                  </p>
                  <div className="store-ai-summary">
                    <span>
                      <i>✓</i>
                      <b>{name}</b>
                      <small>Nom du Store</small>
                    </span>
                    <span>
                      <i>✓</i>
                      <b>{getStoreTemplate(storeTemplate)?.name}</b>
                      <small>
                        {getStoreTemplate(storeTemplate)?.niche} · {getStoreTemplate(storeTemplate)?.folder}
                      </small>
                    </span>
                    <span>
                      <i>✓</i>
                      <b>{language === "darija" ? "Darija Maroc" : language === "ar" ? "العربية" : "Français"}</b>
                      <small>Langue</small>
                    </span>
                  </div>
                  <div className="store-wizard-nav">
                    <button onClick={() => setCreateStep(2)}>← Retour</button>
                    <button className="store-wizard-generate" disabled={creating} onClick={createStore}>
                      {creating ? "Création en cours…" : "Créer ma boutique"}
                    </button>
                  </div>
                </section>
              )}
              {createStep === 3 && generatorMode !== "templates" && (
                <section className="store-wizard-step store-ai-step">
                  <small>ÉTAPE 3 SUR 3</small>
                  <div className="store-ai-icon">✦</div>
                  <h2>Génère mon Store avec IA</h2>
                  <p>
                    LandPro va envoyer un prompt professionnel à Meta AI pour générer tout le contenu de{" "}
                    <b>{name || "ton Store"}</b>, puis le moteur UX choisira automatiquement le design le plus adapté à
                    la niche <b>{aiNiche}</b>.
                  </p>
                  <div className="store-ai-summary">
                    <span>
                      <i>✓</i>
                      <b>{name}</b>
                      <small>Nom du Store</small>
                    </span>
                    <span>
                      <i>✓</i>
                      <b>{generatorMode === "pro-v2" ? "Modern Glow Commerce" : "Référence UI/UX Pro Max"}</b>
                      <small>
                        {generatorMode === "pro-v2" ? "Store Generator Pro V2 · " : ""}
                        {STORE_BENCHMARK_NICHES.find((n) => n.id === aiNiche)?.label || aiNiche}
                      </small>
                    </span>
                    <span>
                      <i>✓</i>
                      <b>{language === "darija" ? "Darija Maroc" : language === "ar" ? "العربية" : "Français"}</b>
                      <small>Langue</small>
                    </span>
                  </div>
                  <div className="store-wizard-nav">
                    <button onClick={() => setCreateStep(2)}>← Retour</button>
                    <button className="store-wizard-generate" disabled={creating} onClick={createStore}>
                      {creating ? "✦ Génération en cours…" : "✦ Générer mon Store avec IA"}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
