"use client";
// Analyse des pubs : du clic sur la pub jusqu'à la commande livrée, par campagne et par pub.
import React, { useEffect, useState } from "react";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { metrics, type Campaign } from "../../lib/ads-report";

const URL_PARAMS =
  "utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}";

const mad = (n: number | null) =>
  n == null ? "—" : Math.round(n).toLocaleString("fr-MA", { maximumFractionDigits: 0 }) + " DH";
const pct = (n: number | null) => (n == null ? "—" : (n * 100).toFixed(n < 0.1 ? 1 : 0) + " %");
const roasText = (n: number | null) => (n == null ? "—" : "×" + n.toFixed(2));

function CopyParams() {
  const [done, setDone] = useState(false);
  return (
    <div className="ads-params">
      <code>{URL_PARAMS}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(URL_PARAMS).then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          });
        }}
      >
        {done ? "Copié ✓" : "Copier"}
      </button>
    </div>
  );
}

/** Dépense totale de la campagne, enregistrée en quittant le champ. */
function SpendInput({ campaign, value, onSaved }: { campaign: string; value: number; onSaved: (n: number) => void }) {
  const [v, setV] = useState(value ? String(value) : "");
  const [state, setState] = useState<"" | "saving" | "ok" | "err">("");
  useEffect(() => setV(value ? String(value) : ""), [value]);
  async function save() {
    const n = Number(String(v).replace(",", ".")) || 0;
    if (n === value) return;
    setState("saving");
    const r = await fetch("/api/ads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ campaign, amount: n }),
    }).catch(() => null);
    if (r?.ok) {
      setState("ok");
      onSaved(n);
      setTimeout(() => setState(""), 1500);
    } else setState("err");
  }
  return (
    <label className={"ads-spend is-" + (state || "idle")} onClick={(e) => e.stopPropagation()}>
      <input
        inputMode="decimal"
        placeholder="0"
        value={v}
        aria-label={`Dépense pub de ${campaign}`}
        onChange={(e) => setV(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
      <span>{state === "ok" ? "✓" : state === "err" ? "!" : "DH"}</span>
    </label>
  );
}

export default function AdsPage() {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const load = () =>
    fetch("/api/ads", { cache: "no-store" })
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Analyse indisponible");
        setD(x);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const campaigns: Campaign[] = d?.campaigns || [];
  const total = d?.total;
  const tm = total ? metrics(total, total.spend) : null;
  const setSpend = (name: string, n: number) =>
    setD((x: any) => {
      const cs = x.campaigns.map((c: Campaign) => (c.campaign === name ? { ...c, spend: n } : c));
      return {
        ...x,
        campaigns: cs,
        total: { ...x.total, spend: cs.reduce((s: number, c: Campaign) => s + c.spend, 0) },
      };
    });

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content pages-dashboard analytics-dashboard ads-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">PUBLICITÉ</span>
            <h1>Analyse des pubs</h1>
            <p>Du clic sur la pub jusqu’à la commande livrée, campagne par campagne.</p>
          </div>
        </header>

        {error ? <div className="dash-error">{error}</div> : null}
        {!d && !error ? <div className="orders-empty">Chargement…</div> : null}

        {d && d.installed === false ? (
          <section className="ads-card ads-setup">
            <b>Activation nécessaire</b>
            <p>
              L’analyse des pubs a besoin d’une mise à jour de la base de données. Lance une fois le script SQL «
              ads_analytics » dans Supabase (SQL Editor → New query → coller → Run), puis recharge cette page.
            </p>
          </section>
        ) : null}

        {d?.installed ? (
          <>
            <div className="analytics-kpis ads-kpis">
              <article className="kpi-revenue">
                <i>◎</i>
                <div>
                  <small>Dépense pub</small>
                  <b>{mad(total.spend)}</b>
                  <span>saisie par campagne</span>
                </div>
              </article>
              <article className="kpi-orders">
                <i>▣</i>
                <div>
                  <small>Commandes des pubs</small>
                  <b>{total.orders}</b>
                  <span>{pct(tm!.conversion)} des visites</span>
                </div>
              </article>
              <article className="kpi-delivered">
                <i>◆</i>
                <div>
                  <small>Livrées</small>
                  <b>{total.delivered}</b>
                  <span>{mad(total.delivered_revenue)} encaissés</span>
                </div>
              </article>
              <article className="kpi-confirmed">
                <i>✓</i>
                <div>
                  <small>Coût par livrée</small>
                  <b>{mad(tm!.costPerDelivered)}</b>
                  <span>par commande : {mad(tm!.costPerOrder)}</span>
                </div>
              </article>
              <article className={"kpi-shipped " + (tm!.roas == null ? "" : tm!.roas >= 1 ? "is-good" : "is-bad")}>
                <i>↗</i>
                <div>
                  <small>ROAS réel</small>
                  <b>{roasText(tm!.roas)}</b>
                  <span>CA livré ÷ dépense</span>
                </div>
              </article>
              <article className={"kpi-returns " + (tm!.profit == null ? "" : tm!.profit >= 0 ? "is-good" : "is-bad")}>
                <i>=</i>
                <div>
                  <small>CA livré − pub</small>
                  <b>{mad(tm!.profit)}</b>
                  <span>avant coût produit et livraison</span>
                </div>
              </article>
            </div>

            {!campaigns.length ? (
              <section className="ads-card ads-setup">
                <b>Aucune visite venant d’une pub pour l’instant</b>
                <p>
                  Dans Facebook Ads Manager, ouvre chaque pub → <i>Suivi</i> → <i>Paramètres de l’URL</i> et colle cette
                  ligne. Les visites et commandes apparaîtront ici dès le premier clic.
                </p>
                <CopyParams />
              </section>
            ) : (
              <div className="pages-panel">
                <div className="pages-toolbar">
                  <div>
                    <b>Par campagne</b>
                    <span>
                      Saisis le « Montant dépensé » de chaque campagne (Ads Manager) pour voir sa rentabilité.
                    </span>
                  </div>
                </div>
                <div className="orders-table-wrap analytics-table-wrap ads-table-wrap">
                  <table className="orders-table analytics-table ads-table">
                    <thead>
                      <tr>
                        <th>Campagne / pub</th>
                        <th>Visites</th>
                        <th>Commandes</th>
                        <th>Confirmées</th>
                        <th>Livrées</th>
                        <th>Retours</th>
                        <th>CA livré</th>
                        <th>Dépense</th>
                        <th>Coût / livrée</th>
                        <th>ROAS réel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => {
                        const m = metrics(c, c.spend);
                        const isOpen = !!open[c.campaign];
                        const many = c.ads.length > 0;
                        return (
                          <React.Fragment key={c.campaign}>
                            <tr
                              className={"ads-campaign" + (isOpen ? " is-open" : "")}
                              onClick={() => many && setOpen((o) => ({ ...o, [c.campaign]: !o[c.campaign] }))}
                            >
                              <td>
                                <span className="ads-name">
                                  {many ? <i aria-hidden="true">{isOpen ? "▾" : "▸"}</i> : null}
                                  <b>{c.campaign}</b>
                                </span>
                                <small>{c.ads.length ? `${c.ads.length} pub${c.ads.length > 1 ? "s" : ""}` : ""}</small>
                              </td>
                              <td>{c.visits}</td>
                              <td>
                                {c.orders} <small>{pct(m.conversion)}</small>
                              </td>
                              <td>
                                {c.confirmed} <small>{pct(m.confirmationRate)}</small>
                              </td>
                              <td>
                                <b>{c.delivered}</b> <small>{pct(m.deliveryRate)}</small>
                              </td>
                              <td>{c.returned}</td>
                              <td>{mad(c.delivered_revenue)}</td>
                              <td>
                                <SpendInput
                                  campaign={c.campaign}
                                  value={c.spend}
                                  onSaved={(n) => setSpend(c.campaign, n)}
                                />
                              </td>
                              <td>{mad(m.costPerDelivered)}</td>
                              <td>
                                <span className={m.roas == null ? "" : m.roas >= 1 ? "ads-good" : "ads-bad"}>
                                  {roasText(m.roas)}
                                </span>
                              </td>
                            </tr>
                            {isOpen
                              ? c.ads.map((a, i) => {
                                  const am = metrics(a, 0);
                                  return (
                                    <tr className="ads-ad" key={i}>
                                      <td>
                                        <span className="ads-name">
                                          <b>{a.ad || "Pub sans nom"}</b>
                                        </span>
                                        <small>{a.adset ? "Ensemble : " + a.adset : ""}</small>
                                      </td>
                                      <td>{a.visits}</td>
                                      <td>
                                        {a.orders} <small>{pct(am.conversion)}</small>
                                      </td>
                                      <td>
                                        {a.confirmed} <small>{pct(am.confirmationRate)}</small>
                                      </td>
                                      <td>
                                        <b>{a.delivered}</b> <small>{pct(am.deliveryRate)}</small>
                                      </td>
                                      <td>{a.returned}</td>
                                      <td>{mad(a.delivered_revenue)}</td>
                                      <td
                                        colSpan={3}
                                        className="ads-muted"
                                        title="La dépense se saisit au niveau de la campagne"
                                      >
                                        —
                                      </td>
                                    </tr>
                                  );
                                })
                              : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <section className="ads-card ads-help">
              <p>
                {d.untracked.orders ? (
                  <>
                    <b>{d.untracked.orders}</b> commande{d.untracked.orders > 1 ? "s" : ""} sans pub identifiée (avant
                    la mise en place, trafic direct ou pub sans paramètres d’URL).{" "}
                  </>
                ) : null}
                Pour suivre une nouvelle pub, colle dans <i>Suivi → Paramètres de l’URL</i> :
              </p>
              <CopyParams />
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
