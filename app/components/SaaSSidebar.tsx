"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./dashboard-mobile.css";
import { clearPages } from "../../lib/page-cache";
const items = [
  ["/", "⌂", "Dashboard"],
  ["/pages", "▣", "Landing Pages"],
  ["/stores", "▦", "Stores"],
  ["/orders", "◎", "Commandes"],
  ["/team", "☺", "Équipe"],
  ["/delivery", "🚚", "Livraison"],
  ["/products", "◇", "Mes produits"],
  ["/sourcing", "⬡", "Sourcing Derb Omar"],
  ["/domains", "⌁", "Domaines"],
  ["/analytics", "↗", "Analytics"],
  ["/ads", "◎", "Analyse des pubs"],
  ["/messages", "✉", "Messages"],
  ["/admin/clients", "♙", "Clients SaaS"],
  ["/admin/licenses", "⚿", "Clés d’abonnement"],
  ["/account", "♙", "Mon abonnement"],
  ["/settings", "⚙", "Paramètres"],
];
const TAB_ICONS: Record<string, React.ReactNode> = {
  home: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />,
  orders: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  pages: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10 18h4" />
    </>
  ),
  products: (
    <>
      <path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
      <path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};
const TABS: [string, string, string][] = [
  ["/", "home", "Accueil"],
  ["/orders", "orders", "Commandes"],
  ["/pages", "pages", "Landings"],
  ["/products", "products", "Produits"],
];
function TabIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TAB_ICONS[name]}
    </svg>
  );
}
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

export default function SaaSSidebar() {
  const pathname = usePathname(),
    [isAdmin, setIsAdmin] = useState(false),
    [isAgent, setIsAgent] = useState(false),
    // Le menu attend de connaître le rôle : pas d'éclair du menu complet chez un agent
    [ready, setReady] = useState(false),
    [plan, setPlan] = useState<{ active: boolean; days: number | null } | null>(null),
    // Téléphone : le menu s'ouvre en tiroir par-dessus la page
    [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("m-nav-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("m-nav-open");
    };
  }, [open]);
  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      sessionStorage.removeItem("lp_role");
      clearPages();
    } catch {}
    location.href = "/login";
  }
  useEffect(() => {
    // Rôle déjà connu dans cet onglet : menu affiché tout de suite
    try {
      const cached = sessionStorage.getItem("lp_role");
      if (cached) {
        setIsAgent(cached === "agent");
        setIsAdmin(cached === "admin");
        setReady(true);
      }
    } catch {}
    fetch("/api/auth/context", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((x) => {
        setIsAdmin(!!x?.is_platform_admin);
        setReady(true);
        try {
          if (x)
            sessionStorage.setItem("lp_role", x.role === "agent" ? "agent" : x.is_platform_admin ? "admin" : "owner");
        } catch {}
        // Agent de confirmation : uniquement ses commandes
        if (x?.role === "agent") {
          setIsAgent(true);
          if (!location.pathname.startsWith("/orders")) location.replace("/orders");
        }
      })
      .catch(() => {
        setIsAdmin(false);
        setReady(true);
      });
    // Abonnement : redemandé au plus toutes les 5 min dans cet onglet (inutile à chaque page)
    let fresh = false;
    try {
      const c = JSON.parse(sessionStorage.getItem("lp_plan") || "null");
      if (c && Date.now() - c.at < 300_000) {
        setPlan(c.plan);
        fresh = true;
      }
    } catch {}
    if (!fresh)
      fetch("/api/license", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((x) => {
          if (!x) return;
          const p = { active: !!x.active, days: x.days_left ?? null };
          setPlan(p);
          try {
            sessionStorage.setItem("lp_plan", JSON.stringify({ at: Date.now(), plan: p }));
          } catch {}
        })
        .catch(() => setPlan(null));
  }, []);
  const visible = (ready ? items : []).filter(([href]) =>
    isAgent ? href === "/orders" : !href.startsWith("/admin/") || isAdmin,
  );
  const current = items.find(([href]) => isActive(pathname, href));
  const title = isAgent ? "Mes commandes" : current ? current[2] : "LandPro";
  return (
    <>
      <header className="m-topbar">
        <button
          type="button"
          className="m-burger"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="dash-menu"
          onClick={() => setOpen(true)}
        >
          <TabIcon name="menu" />
        </button>
        <b>{title}</b>
        <div className="brand-mark" aria-hidden="true">
          L
        </div>
      </header>
      {open && <div className="m-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={"dash-side" + (open ? " is-open" : "")} id="dash-menu">
        <button type="button" className="m-close" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
          ×
        </button>
        <div className="dash-brand">
          <div className="brand-mark">L</div>
          <div>
            <b>LandPro</b>
            <small>AI COD BUILDER</small>
          </div>
        </div>
        <div className="workspace-switcher">
          <span>Workspace</span>
          <b>LandPro</b>
          <i>⌄</i>
        </div>
        <nav className="dash-nav">
          {visible.map(([href, icon, label]) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} className={active ? "active" : ""} href={href}>
                <span className="dash-icon">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        {ready && !isAgent && (
          <Link href="/account" className={"sidebar-plan" + (plan && !plan.active ? " is-off" : "")}>
            <small>ABONNEMENT</small>
            <b>{!plan ? "LandPro" : plan.active ? "Actif" : "Expiré"}</b>
            <span>
              {!plan
                ? "Mon abonnement"
                : plan.active
                  ? plan.days !== null
                    ? `${plan.days} jour${plan.days === 1 ? "" : "s"} restant${plan.days === 1 ? "" : "s"}`
                    : "Sans date de fin"
                  : "Activer une clé"}
            </span>
          </Link>
        )}
        {ready && (
          <button type="button" className="sidebar-logout" onClick={logout}>
            Se déconnecter
          </button>
        )}
      </aside>
      {ready && !isAgent && (
        <nav className="m-tabbar" aria-label="Navigation rapide">
          {TABS.map(([href, icon, label]) => (
            <Link key={href} href={href} className={isActive(pathname, href) ? "active" : ""}>
              <TabIcon name={icon} />
              <span>{label}</span>
            </Link>
          ))}
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="dash-menu">
            <TabIcon name="menu" />
            <span>Menu</span>
          </button>
        </nav>
      )}
    </>
  );
}
