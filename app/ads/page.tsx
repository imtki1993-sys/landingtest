"use client";
// Analyse des pubs : du clic sur la pub jusqu'à la commande livrée, par campagne et par pub.
import React, { useEffect, useMemo, useState } from "react";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { looksLikeId, metrics, type AdLine, type Campaign } from "../../lib/ads-report";

const URL_PARAMS =
  "utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}";

const mad = (n: number | null) =>
  n == null ? "—" : Math.round(n).toLocaleString("fr-MA", { maximumFractionDigits: 0 }) + " DH";
const pct = (n: number | null) => (n == null ? "—" : (n * 100).toFixed(n < 0.1 ? 1 : 0) + " %");
const roasText = (n: number | null) => (n == null ? "—" : "×" + n.toFixed(2));

// ─── Période ───
type Preset = "all" | "today" | "yesterday" | "7" | "30" | "month" | "custom";
const PRESETS: [Preset, string][] = [
  ["all", "Toute la période"],
  ["today", "Aujourd’hui"],
  ["yesterday", "Hier"],
  ["7", "7 derniers jours"],
  ["30", "30 derniers jours"],
  ["month", "Ce mois-ci"],
  ["custom", "Dates personnalisées"],
];
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function rangeOf(p: Preset, from: string, to: string): { from: string; to: string } | null {
  const now = new Date();
  const back = (n: number) => ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - n));
  switch (p) {
    case "today":
      return { from: back(0), to: back(0) };
    case "yesterday":
      return { from: back(1), to: back(1) };
    case "7":
      return { from: back(6), to: back(0) };
    case "30":
      return { from: back(29), to: back(0) };
    case "month":
      return { from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: back(0) };
    case "custom":
      return from && to && from <= to ? { from, to } : null;
    default:
      return null;
  }
}

type Sort = "orders" | "delivered" | "visits" | "spend" | "roas" | "cpd";
const SORTS: [Sort, string][] = [
  ["orders", "Commandes"],
  ["delivered", "Livrées"],
  ["visits", "Visites"],
  ["spend", "Dépense"],
  ["roas", "ROAS réel"],
  ["cpd", "Coût par livrée"],
];

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

async function post(body: unknown) {
  const r = await fetch("/api/ads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  return !!r?.ok;
}

/** Dépense de la campagne (pour la période affichée), enregistrée en quittant le champ. */
function SpendInput({
  campaign,
  value,
  range,
  onSaved,
}: {
  campaign: string;
  value: number;
  range: { from: string; to: string } | null;
  onSaved: (n: number) => void;
}) {
  const [v, setV] = useState(value ? String(value) : "");
  const [state, setState] = useState<"" | "saving" | "ok" | "err">("");
  useEffect(() => setV(value ? String(value) : ""), [value]);
  async function save() {
    const n = Number(String(v).replace(",", ".")) || 0;
    if (n === value) return;
    setState("saving");
    if (await post({ campaign, amount: n, ...(range || {}) })) {
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

/** Nom affiché d'une campagne / pub, modifiable (✎) : utile quand la pub envoie un numéro. */
function Name({
  raw,
  label,
  canRename,
  onRenamed,
  strong = true,
}: {
  raw: string;
  label?: string;
  canRename: boolean;
  onRenamed: (l: string) => void;
  strong?: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(label || "");
  async function save() {
    setEdit(false);
    const l = v.trim();
    if (l === (label || "")) return;
    if (await post({ type: "label", key: raw, label: l })) onRenamed(l);
  }
  if (edit)
    return (
      <input
        className="ads-rename"
        autoFocus
        value={v}
        placeholder={raw}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setV(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setEdit(false);
        }}
      />
    );
  const Tag = strong ? "b" : "span";
  return (
    <span className="ads-label">
      <Tag title={label ? raw : undefined}>{label || raw}</Tag>
      {canRename ? (
        <button
          type="button"
          title="Renommer"
          aria-label="Renommer"
          onClick={(e) => {
            e.stopPropagation();
            setV(label || "");
            setEdit(true);
          }}
        >
          ✎
        </button>
      ) : null}
    </span>
  );
}

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AdsPage() {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [preset, setPreset] = useState<Preset>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [landing, setLanding] = useState("");
  const [landings, setLandings] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("orders");
  const range = rangeOf(preset, from, to);
  const rangeKey = range ? range.from + "_" + range.to : "all";

  useEffect(() => {
    fetch("/api/pages?limit=100", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { pages: [] }))
      .then((x) => setLandings((x.pages || []).map((p: any) => ({ id: p.id, name: p.name }))))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (preset === "custom" && !range) return;
    const q = new URLSearchParams();
    if (range) {
      q.set("from", range.from);
      q.set("to", range.to);
    }
    if (landing) q.set("landing", landing);
    setLoading(true);
    fetch("/api/ads?" + q.toString(), { cache: "no-store" })
      .then(async (r) => {
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Analyse indisponible");
        setD(x);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [rangeKey, landing]);

  const v2 = !!d?.v2;
  const filtered = !!range || !!landing;
  const campaigns: Campaign[] = useMemo(() => {
    const all: Campaign[] = d?.campaigns || [];
    const s = search.trim().toLowerCase();
    const hit = (c: Campaign) =>
      !s ||
      [c.campaign, c.label, ...c.ads.flatMap((a) => [a.ad, a.adLabel, a.adset])]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(s));
    const val = (c: Campaign) => {
      const m = metrics(c, c.spend);
      if (sort === "roas") return m.roas ?? -1;
      if (sort === "cpd") return m.costPerDelivered == null ? -Infinity : -m.costPerDelivered;
      if (sort === "spend") return c.spend;
      return c[sort];
    };
    return all.filter(hit).sort((a, b) => val(b) - val(a));
  }, [d, search, sort]);
  const total = d?.total;
  const tm = total ? metrics(total, total.spend) : null;
  const idsOnly = (d?.campaigns || []).some((c: Campaign) => looksLikeId(c.campaign) && !c.label);

  const patchCampaign = (name: string, fn: (c: Campaign) => Campaign) =>
    setD((x: any) => {
      const cs = x.campaigns.map((c: Campaign) => (c.campaign === name ? fn(c) : c));
      return {
        ...x,
        campaigns: cs,
        total: { ...x.total, spend: cs.reduce((s: number, c: Campaign) => s + c.spend, 0) },
      };
    });
  const relabelAd = (name: string, ad: AdLine, l: string) =>
    patchCampaign(name, (c) => ({ ...c, ads: c.ads.map((a) => (a === ad ? { ...a, adLabel: l || undefined } : a)) }));

  function exportCsv() {
    const head = [
      "Campagne",
      "Pub",
      "Ensemble",
      "Visites",
      "Commandes",
      "Confirmées",
      "Livrées",
      "Retours",
      "CA livré",
      "Dépense",
      "Coût par livrée",
      "ROAS réel",
    ];
    const lines = [head.join(";")];
    for (const c of campaigns) {
      const m = metrics(c, c.spend);
      lines.push(
        [
          c.label || c.campaign,
          "",
          "",
          c.visits,
          c.orders,
          c.confirmed,
          c.delivered,
          c.returned,
          c.delivered_revenue,
          c.spend,
          m.costPerDelivered?.toFixed(0) ?? "",
          m.roas?.toFixed(2) ?? "",
        ]
          .map(csvCell)
          .join(";"),
      );
      for (const a of c.ads)
        lines.push(
          [
            c.label || c.campaign,
            a.adLabel || a.ad || "",
            a.adset || "",
            a.visits,
            a.orders,
            a.confirmed,
            a.delivered,
            a.returned,
            a.delivered_revenue,
            "",
            "",
            "",
          ]
            .map(csvCell)
            .join(";"),
        );
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `analyse-pubs-${range ? range.from + "_" + range.to : "tout"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const periodText = range
    ? range.from === range.to
      ? new Date(range.from + "T12:00:00").toLocaleDateString("fr-MA", { day: "numeric", month: "long" })
      : `du ${new Date(range.from + "T12:00:00").toLocaleDateString("fr-MA", { day: "numeric", month: "short" })} au ${new Date(range.to + "T12:00:00").toLocaleDateString("fr-MA", { day: "numeric", month: "short" })}`
    : "depuis le début";

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
          {d?.installed ? (
            <div className="analytics-filters ads-filters">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as Preset)}
                disabled={!v2}
                aria-label="Période"
              >
                {PRESETS.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              {preset === "custom" ? (
                <>
                  <input aria-label="Date début" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                  <span>→</span>
                  <input aria-label="Date fin" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </>
              ) : null}
              <select
                value={landing}
                onChange={(e) => setLanding(e.target.value)}
                disabled={!v2}
                aria-label="Landing page"
              >
                <option value="">Toutes les landings</option>
                {landings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {filtered ? (
                <button
                  type="button"
                  onClick={() => {
                    setPreset("all");
                    setLanding("");
                    setFrom("");
                    setTo("");
                  }}
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
          ) : null}
        </header>

        {error ? <div className="dash-error">{error}</div> : null}
        {!d && !error ? <div className="orders-empty">Chargement…</div> : null}

        {d && d.installed === false ? (
          <section className="ads-card ads-setup">
            <b>Activation nécessaire</b>
            <p>
              L’analyse des pubs a besoin d’une mise à jour de la base de données. Lance une fois les scripts SQL «
              ads_analytics » puis « ads_filters » dans Supabase (SQL Editor → New query → coller → Run), puis recharge
              cette page.
            </p>
          </section>
        ) : null}

        {d?.installed && !v2 ? (
          <section className="ads-card ads-note">
            <b>Une dernière mise à jour à lancer</b>
            <p>
              Lance le script SQL « ads_filters » dans Supabase pour activer les filtres (période, landing), la dépense
              par période, le renommage des campagnes et retrouver la pub de tes anciennes commandes.
            </p>
          </section>
        ) : null}

        {d?.installed ? (
          <div className={loading ? "ads-body is-loading" : "ads-body"}>
            <div className="analytics-kpis ads-kpis">
              <article className="kpi-revenue">
                <i>◎</i>
                <div>
                  <small>Dépense pub</small>
                  <b>{mad(total.spend)}</b>
                  <span>{periodText}</span>
                </div>
              </article>
              <article className="kpi-orders">
                <i>▣</i>
                <div>
                  <small>Commandes des pubs</small>
                  <b>{total.orders}</b>
                  <span>
                    {pct(tm!.conversion)} des {total.visits} visites
                  </span>
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

            {idsOnly ? (
              <section className="ads-card ads-note">
                <b>Tes pubs envoient des numéros au lieu des noms</b>
                <p>
                  Les numéros (ex. 120252337602500501) sont les identifiants Facebook de tes campagnes. Clique sur ✎
                  pour leur donner un nom, ou remplace les paramètres d’URL de tes pubs par la ligne ci-dessous : les
                  prochaines visites arriveront avec les noms.
                </p>
                <CopyParams />
              </section>
            ) : null}

            {!d.campaigns.length && !d.untracked.orders ? (
              <section className="ads-card ads-setup">
                <b>Aucune visite venant d’une pub {range ? "sur cette période" : "pour l’instant"}</b>
                <p>
                  Dans Facebook Ads Manager, ouvre chaque pub → <i>Suivi</i> → <i>Paramètres de l’URL</i> et colle cette
                  ligne. Les visites et commandes apparaîtront ici dès le premier clic.
                </p>
                <CopyParams />
              </section>
            ) : (
              <div className="pages-panel">
                <div className="pages-toolbar ads-toolbar">
                  <div>
                    <b>Par campagne</b>
                    <span>
                      {range
                        ? "Saisis le « Montant dépensé » d’Ads Manager pour cette même période."
                        : "Saisis le « Montant dépensé » total de chaque campagne (Ads Manager)."}
                    </span>
                  </div>
                  <div className="ads-tools">
                    <input
                      type="search"
                      placeholder="Chercher une campagne ou une pub…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Trier par">
                      {SORTS.map(([k, l]) => (
                        <option key={k} value={k}>
                          Trier : {l}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={exportCsv} disabled={!campaigns.length}>
                      ↓ CSV
                    </button>
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
                        <th>
                          Dépense <small>{range ? "période" : "totale"}</small>
                        </th>
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
                                  <Name
                                    raw={c.campaign}
                                    label={c.label}
                                    canRename={v2}
                                    onRenamed={(l) =>
                                      patchCampaign(c.campaign, (x) => ({ ...x, label: l || undefined }))
                                    }
                                  />
                                </span>
                                <small>
                                  {c.ads.length ? `${c.ads.length} pub${c.ads.length > 1 ? "s" : ""}` : ""}
                                  {c.label ? ` · ${c.campaign}` : ""}
                                </small>
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
                                  key={rangeKey}
                                  campaign={c.campaign}
                                  value={c.spend}
                                  range={range}
                                  onSaved={(n) => patchCampaign(c.campaign, (x) => ({ ...x, spend: n }))}
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
                                          {a.ad ? (
                                            <Name
                                              raw={a.ad}
                                              label={a.adLabel}
                                              canRename={v2}
                                              onRenamed={(l) => relabelAd(c.campaign, a, l)}
                                            />
                                          ) : (
                                            <b>Pub sans nom</b>
                                          )}
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
                      {d.untracked.orders && !search ? (
                        <tr className="ads-untracked">
                          <td>
                            <span className="ads-name">
                              <b>Sans pub identifiée</b>
                            </span>
                            <small>trafic direct, ancienne commande ou pub sans paramètres</small>
                          </td>
                          <td>—</td>
                          <td>{d.untracked.orders}</td>
                          <td>{d.untracked.confirmed}</td>
                          <td>
                            <b>{d.untracked.delivered}</b>
                          </td>
                          <td>{d.untracked.returned}</td>
                          <td>{mad(d.untracked.delivered_revenue)}</td>
                          <td colSpan={3} className="ads-muted">
                            —
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!idsOnly ? (
              <section className="ads-card ads-help">
                <p>
                  Pour suivre une nouvelle pub, colle dans Facebook → <i>Suivi → Paramètres de l’URL</i> :
                </p>
                <CopyParams />
              </section>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
