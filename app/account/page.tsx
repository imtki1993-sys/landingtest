"use client";
// Mon abonnement : état de l'abonnement, activation d'une clé 3 / 6 / 12 mois, offres et historique.
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { FormEvent, useEffect, useState } from "react";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" }) : "—";
const mad = (n: number) => n.toLocaleString("fr-MA").replace(/ /g, " ") + " MAD";

export default function Account() {
  const [data, setData] = useState<any>(null),
    [lic, setLic] = useState<any>(null),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function loadLicense() {
    const r = await fetch("/api/license", { cache: "no-store" });
    setLic(r.ok ? await r.json() : null);
  }
  useEffect(() => {
    Promise.all([
      fetch("/api/settings")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/api/pages")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/api/stores")
        .then((r) => r.json())
        .catch(() => ({})),
    ]).then(([s, p, st]) => setData({ workspace: s.workspace, pages: p.pages || [], stores: st.stores || [] }));
    loadLicense().catch(() => setLic(null));
  }, []);

  async function activate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/license", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code }),
        }),
        x = await r.json();
      if (!r.ok) throw new Error(x.error || "Activation impossible");
      setMsg({
        ok: true,
        text: `Clé activée : ${x.months} mois ajoutés. Abonnement valable jusqu’au ${fmtDate(x.periodEnd)}.`,
      });
      setCode("");
      await loadLicense();
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const name = data?.workspace?.name || "Workspace";
  const pages = data?.pages?.length || 0,
    stores = data?.stores?.length || 0;
  const sub = lic?.subscription,
    end = sub?.current_period_end,
    left: number | null = lic?.days_left ?? null,
    active = !!lic?.active;
  const statusText = !lic ? "…" : active ? "Actif" : sub ? "Expiré" : "Inactif";
  const statusLine = !lic
    ? ""
    : active
      ? end
        ? `Valable jusqu’au ${fmtDate(end)} · ${left} jour${left === 1 ? "" : "s"} restant${left === 1 ? "" : "s"}`
        : "Abonnement sans date de fin"
      : "Active une clé pour réactiver les commandes et la création de pages.";
  const soon = active && left !== null && left <= 14;
  const buyLink = (months: number, price: number) =>
    lic?.sales_whatsapp
      ? `https://wa.me/${lic.sales_whatsapp}?text=${encodeURIComponent(
          `Bonjour, je veux l’abonnement LandPro ${months} mois (${mad(price)}) pour le compte « ${name} ».`,
        )}`
      : "";

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content account-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">COMPTE CLIENT</span>
            <h1>Mon abonnement</h1>
            <p>État de ton abonnement LandPro, activation d’une clé et renouvellement.</p>
          </div>
        </header>

        <div className={"account-plan-card" + (soon || (lic && !active) ? " is-warning" : "")}>
          <div>
            <small>ABONNEMENT LANDPRO · TOUT INCLUS</small>
            <h2>{statusText}</h2>
            <p>{statusLine}</p>
          </div>
          <span className={"account-plan-badge" + (active ? "" : " is-off")}>{active ? "ACTIF" : "À ACTIVER"}</span>
        </div>

        <section className="account-card account-key-card">
          <h3>{active ? "Prolonger avec une nouvelle clé" : "Activer mon abonnement"}</h3>
          <p>
            Après ton paiement, tu reçois une clé <b>LP-XXXX-XXXX-XXXX</b>. Elle ajoute 3, 6 ou 12 mois
            {active ? " à la suite de ta date de fin actuelle" : " à partir d’aujourd’hui"}.
          </p>
          <form className="account-key-form" onSubmit={activate}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LP-XXXX-XXXX-XXXX"
              autoComplete="off"
              required
            />
            <button disabled={busy}>{busy ? "Activation…" : "Activer la clé"}</button>
          </form>
          {msg && <div className={"account-key-msg " + (msg.ok ? "ok" : "err")}>{msg.text}</div>}
        </section>

        <div className="account-offers">
          {(lic?.offers || []).map((o: any) => {
            const link = buyLink(o.months, o.price);
            return (
              <article key={o.months} className={o.months === 12 ? "best" : ""}>
                {o.months === 12 && <em>Meilleur prix</em>}
                <small>{o.label}</small>
                <b>{mad(o.price)}</b>
                <span>soit {mad(Math.round(o.price / o.months))} / mois</span>
                {link ? (
                  <a href={link} target="_blank" rel="noreferrer">
                    Commander sur WhatsApp
                  </a>
                ) : (
                  <span className="account-offer-note">Contacte l’administrateur pour payer</span>
                )}
              </article>
            );
          })}
        </div>

        <div className="account-usage-grid">
          <article>
            <small>LANDING PAGES</small>
            <b>{pages}</b>
            <span>
              Pages créées{sub?.landing_limit ? ` · limite ${Number(sub.landing_limit).toLocaleString("fr-MA")}` : ""}
            </span>
          </article>
          <article>
            <small>STORES</small>
            <b>{stores}</b>
            <span>Boutiques créées</span>
          </article>
          <article>
            <small>FIN DE PÉRIODE</small>
            <b>{end ? new Date(end).toLocaleDateString("fr-MA") : "—"}</b>
            <span>{left !== null ? `${left} jours restants` : "Sans date de fin"}</span>
          </article>
        </div>

        <div className="account-grid">
          <section className="account-card">
            <h3>Clés activées</h3>
            {(lic?.history || []).length ? (
              lic.history.map((h: any, i: number) => (
                <div className="account-plan-line" key={i}>
                  <div>
                    <b>
                      {h.duration_months} mois · {mad(h.price_mad)}
                    </b>
                    <span>
                      Clé {h.code_hint} · activée le {fmtDate(h.used_at)}
                    </span>
                  </div>
                  <em>Activée</em>
                </div>
              ))
            ) : (
              <p>Aucune clé activée pour le moment.</p>
            )}
          </section>
          <section className="account-card">
            <h3>Informations du workspace</h3>
            <div className="account-detail">
              <span>Nom</span>
              <b>{name}</b>
            </div>
            <div className="account-detail">
              <span>Langue</span>
              <b>{data?.workspace?.default_locale || "—"}</b>
            </div>
            <div className="account-detail">
              <span>Fuseau horaire</span>
              <b>{data?.workspace?.timezone || "—"}</b>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
