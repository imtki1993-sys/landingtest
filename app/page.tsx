"use client";
import "./globals.css";
import Link from "next/link";
import SaaSSidebar from "./components/SaaSSidebar";
import SaaSTopbar from "./components/SaaSTopbar";
import { useEffect, useState } from "react";
const Icon = ({ children }: { children: string }) => <span className="dash-icon">{children}</span>;
const money = (n: any) => Number(n || 0).toLocaleString("fr-MA", { maximumFractionDigits: 0 }) + " DH";
const pct = (n: any) => Number(n || 0).toLocaleString("fr-MA", { maximumFractionDigits: 1 }) + "%";
export default function Home() {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Dashboard indisponible");
        setData(x);
        fetch("/api/dashboard/analytics", { cache: "no-store" })
          .then(async (ar) => {
            const ax = await ar.json();
            if (ar.ok)
              setData((d: any) => ({
                ...d,
                totals: { ...(d?.totals || {}), ...(ax.totals || {}) },
                topLandings: ax.topLandings || [],
              }));
          })
          .catch(() => {});
      })
      .catch((e) => setError(e.message));
  }, []);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    try {
      sessionStorage.removeItem("lp_role");
    } catch {}
    window.location.href = "/login";
  }
  const t = data?.totals || {},
    recent = data?.recentOrders || [],
    top = data?.topLandings || [];
  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content home-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">LANDPRO · COD COMMERCE</span>
            <h1>Dashboard</h1>
            <p>Vue d’ensemble de votre activité COD.</p>
          </div>
          <div className="dash-header-actions">
            <Link href="/pages" className="primary dashboard-new">
              + Nouvelle landing
            </Link>
            <button type="button" className="ghost-btn" onClick={logout}>
              Déconnexion
            </button>
            <span className="avatar">M</span>
          </div>
        </header>
        {error && <div className="dash-error dashboard-error">{error}</div>}
        {!data ? (
          <div className="dashboard-loading">Chargement du dashboard…</div>
        ) : (
          <>
            <div className="dashboard-kpis">
              <article>
                <small>CHIFFRE D'AFFAIRES</small>
                <b>{money(t.revenue)}</b>
                <span>Toutes les commandes</span>
              </article>
              <article>
                <small>COMMANDES</small>
                <b>{t.orders}</b>
                <span>{t.newLeads} nouvelles commandes</span>
              </article>
              <article>
                <small>CONFIRMATION</small>
                <b>{pct(t.confirmationRate)}</b>
                <span>{t.confirmed} confirmées</span>
              </article>
              <article>
                <small>CA LIVRÉ</small>
                <b>{money(t.deliveredRevenue)}</b>
                <span>{t.deliveryRate ? pct(t.deliveryRate) + " de livraison" : "Commandes livrées"}</span>
              </article>
              <article>
                <small>CONVERSION</small>
                <b>{pct(t.conversion)}</b>
                <span>{Number(t.views || 0).toLocaleString("fr-MA")} vues</span>
              </article>
            </div>
            <div className="dashboard-visual-grid">
              <section className="dashboard-card dashboard-sales-card">
                <div className="dashboard-card-head">
                  <div>
                    <small>PERFORMANCE</small>
                    <h2>Ventes & Commandes</h2>
                  </div>
                  <Link href="/analytics">Voir analytics →</Link>
                </div>
                <div className="dashboard-chart">
                  <div className="chart-y">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0</span>
                  </div>
                  <div className="chart-area">
                    <div className="chart-line line-a"></div>
                    <div className="chart-line line-b"></div>
                    <div className="chart-points">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                    <div className="chart-days">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mer</span>
                      <span>Jeu</span>
                      <span>Ven</span>
                      <span>Sam</span>
                      <span>Dim</span>
                    </div>
                  </div>
                </div>
                <div className="chart-legend">
                  <span>
                    <i></i> Chiffre d’affaires
                  </span>
                  <span>
                    <i></i> Commandes
                  </span>
                </div>
              </section>
              <section className="dashboard-card dashboard-status-card">
                <div className="dashboard-card-head">
                  <div>
                    <small>COMMANDES</small>
                    <h2>Statut des commandes</h2>
                  </div>
                </div>
                <div className="dashboard-donut-wrap">
                  <div
                    className="dashboard-donut"
                    style={{ "--confirm": Math.max(5, Number(t.confirmationRate || 0)) + "%" } as any}
                  >
                    <div>
                      <b>{t.orders || 0}</b>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="dashboard-status-list">
                    <span>
                      <i></i>Confirmées <b>{t.confirmed || 0}</b>
                    </span>
                    <span>
                      <i></i>Nouvelles <b>{t.newLeads || 0}</b>
                    </span>
                    <span>
                      <i></i>Livrées <b>{t.delivered || 0}</b>
                    </span>
                  </div>
                </div>
              </section>
            </div>
            <div className="dashboard-main-grid">
              <section className="dashboard-card dashboard-recent">
                <div className="dashboard-card-head">
                  <div>
                    <small>ACTIVITÉ</small>
                    <h2>Commandes récentes</h2>
                  </div>
                  <Link href="/orders">Voir toutes →</Link>
                </div>
                {recent.length ? (
                  <div className="dashboard-order-list">
                    {recent.map((o: any) => (
                      <Link href="/orders" className="dashboard-order" key={o.id}>
                        <div>
                          <b>{o.lead?.full_name || "Client"}</b>
                          <small>
                            {o.product?.name || "Produit"} · {o.lead?.city_name || "Ville non renseignée"}
                          </small>
                        </div>
                        <div>
                          <b>{money(o.total)}</b>
                          <small>
                            {o.lead?.status === "CONFIRMED"
                              ? "Confirmée"
                              : o.lead?.status === "NEW"
                                ? "Nouvelle"
                                : o.lead?.status || "—"}{" "}
                            · {new Date(o.created_at).toLocaleDateString("fr-MA")}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty">Aucune commande récente.</p>
                )}
              </section>
              <section className="dashboard-card">
                <div className="dashboard-card-head">
                  <div>
                    <small>LANDINGS</small>
                    <h2>Performance</h2>
                  </div>
                  <Link href="/analytics">Analytics →</Link>
                </div>
                <div className="dashboard-mini-stats">
                  <div>
                    <b>{t.landings}</b>
                    <span>Landings</span>
                  </div>
                  <div>
                    <b>{t.published}</b>
                    <span>Publiées</span>
                  </div>
                  <div>
                    <b>{t.products}</b>
                    <span>Produits</span>
                  </div>
                </div>
                {top.length ? (
                  <div className="dashboard-top-list">
                    {top.map((x: any, i: number) => (
                      <div key={x.id || x.landing_page_id || i}>
                        <span>{x.name || x.landing_name || "Landing"}</span>
                        <b>{Number(x.orders || 0)} cmd.</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty">Les performances apparaîtront ici avec les données Analytics.</p>
                )}
              </section>
            </div>
            <div className="dashboard-bottom-grid">
              <section className="dashboard-card dashboard-quick-card">
                <div className="dashboard-card-head">
                  <div>
                    <small>LIENS RAPIDES</small>
                    <h2>Actions rapides</h2>
                  </div>
                </div>
                <div className="dashboard-actions">
                  <Link href="/pages">+ Créer une landing</Link>
                  <Link href="/products">+ Ajouter un produit</Link>
                  <Link href="/orders">Gérer les commandes</Link>
                  <Link href="/analytics">Voir les analytics</Link>
                </div>
              </section>
              <section className="dashboard-card dashboard-attention">
                <div className="dashboard-card-head">
                  <div>
                    <small>À TRAITER</small>
                    <h2>Priorités</h2>
                  </div>
                </div>
                <Link href="/orders">
                  <b>{t.newLeads}</b>
                  <span> nouvelles commandes / leads à traiter</span>
                </Link>
                <Link href="/pages">
                  <b>{Math.max(0, Number(t.landings || 0) - Number(t.published || 0))}</b>
                  <span> landing(s) en brouillon</span>
                </Link>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
