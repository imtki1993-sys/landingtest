"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const items = [
  ["/", "⌂", "Dashboard"],
  ["/pages", "▣", "Landing Pages"],
  ["/stores", "▦", "Stores"],
  ["/orders", "◎", "Commandes"],
  ["/team", "☺", "Équipe"],
  ["/delivery", "🚚", "Livraison"],
  ["/products", "◇", "Mes produits"],
  ["/domains", "⌁", "Domaines"],
  ["/analytics", "↗", "Analytics"],
  ["/messages", "✉", "Messages"],
  ["/admin/clients", "♙", "Clients SaaS"],
  ["/admin/licenses", "⚿", "Clés d’abonnement"],
  ["/account", "♙", "Mon abonnement"],
  ["/settings", "⚙", "Paramètres"],
];
export default function SaaSSidebar() {
  const pathname = usePathname(),
    [isAdmin, setIsAdmin] = useState(false),
    [isAgent, setIsAgent] = useState(false),
    [plan, setPlan] = useState<{ active: boolean; days: number | null } | null>(null);
  useEffect(() => {
    fetch("/api/auth/context", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((x) => {
        setIsAdmin(!!x?.is_platform_admin);
        // Agent de confirmation : uniquement ses commandes
        if (x?.role === "agent") {
          setIsAgent(true);
          if (!location.pathname.startsWith("/orders")) location.replace("/orders");
        }
      })
      .catch(() => setIsAdmin(false));
    fetch("/api/license", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((x) => x && setPlan({ active: !!x.active, days: x.days_left ?? null }))
      .catch(() => setPlan(null));
  }, []);
  return (
    <aside className="dash-side">
      <div className="dash-brand">
        <div className="brand-mark">M</div>
        <div>
          <b>Landing Motor</b>
          <small>AI COD BUILDER</small>
        </div>
      </div>
      <div className="workspace-switcher">
        <span>Workspace</span>
        <b>LandPro</b>
        <i>⌄</i>
      </div>
      <nav className="dash-nav">
        {items
          .filter(([href]) => (isAgent ? href === "/orders" : !href.startsWith("/admin/") || isAdmin))
          .map(([href, icon, label]) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} className={active ? "active" : ""} href={href}>
                <span className="dash-icon">{icon}</span>
                {label}
              </Link>
            );
          })}
      </nav>
      <Link href="/account" hidden={isAgent} className={"sidebar-plan" + (plan && !plan.active ? " is-off" : "")}>
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
    </aside>
  );
}
