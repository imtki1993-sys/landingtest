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
export default function StoreBuilderSidebar({ store, tab, setTab, advanced, setAdvanced }: any) {
  return (
    <aside className="store-builder-side">
      <div className="store-builder-brand">
        <Link href="/stores">← Stores</Link>
        <b>LandPro Store Builder</b>
        <small>{store.status === "PUBLISHED" ? "PUBLIÉ" : "BROUILLON"}</small>
        {store.status === "PUBLISHED" && (
          <a className="store-public-url" href={"/store/" + store.slug} target="_blank" rel="noreferrer">
            ↗ Voir la boutique
          </a>
        )}
      </div>
      <div className="store-builder-tabs">
        {tabs.map((x) => (
          <button key={x[0]} className={tab === x[0] ? "active" : ""} onClick={() => setTab(x[0])}>
            <span>{x[1]}</span>
            {x[2]}
          </button>
        ))}
        <button
          className={advanced ? "active store-advanced-tab" : "store-advanced-tab"}
          onClick={() => {
            setAdvanced(!advanced);
            setTab("advanced");
          }}
        >
          <span>⚙</span>Avancé
        </button>
      </div>
    </aside>
  );
}
