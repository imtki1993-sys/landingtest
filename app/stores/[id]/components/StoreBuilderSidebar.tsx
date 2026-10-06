"use client";
import Link from "next/link";
const tabs = [
  ["general", "1", "Ma boutique"],
  ["design", "2", "Design"],
  ["catalog", "3", "Produits"],
  ["home", "4", "Accueil"],
  ["visual", "✦", "Pages & Sections"],
  ["publish", "5", "Publier"],
];
export default function StoreBuilderSidebar({ store, tab, setTab, tabs: customTabs, dirty }: any) {
  const list = customTabs || tabs;
  return (
    <aside className="store-builder-side">
      <div className="store-builder-brand">
        <Link
          href="/stores"
          onClick={(e) => {
            if (dirty && !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?"))
              e.preventDefault();
          }}
        >
          ← Stores
        </Link>
        <b>LandPro Store Builder</b>
        <small>{store.status === "PUBLISHED" ? "PUBLIÉ" : "BROUILLON"}</small>
        {store.status === "PUBLISHED" && (
          <a className="store-public-url" href={"/store/" + store.slug} target="_blank" rel="noreferrer">
            ↗ Voir la boutique
          </a>
        )}
      </div>
      <div className="store-builder-tabs">
        {list.map((x: string[]) => (
          <button key={x[0]} className={tab === x[0] ? "active" : ""} onClick={() => setTab(x[0])}>
            <span>{x[1]}</span>
            {x[2]}
          </button>
        ))}
      </div>
    </aside>
  );
}
