"use client";
// Admin : générer les clés d'abonnement 3 / 6 / 12 mois, suivre leur utilisation, révoquer.
import SaaSSidebar from "../../components/SaaSSidebar";
import SaaSTopbar from "../../components/SaaSTopbar";
import { FormEvent, useEffect, useMemo, useState } from "react";

const OFFERS = [
  { months: 3, price: 599 },
  { months: 6, price: 999 },
  { months: 12, price: 1699 },
];
const STATUS: Record<string, string> = { available: "Disponible", used: "Utilisée", revoked: "Révoquée" };
const day = (v?: string | null) => (v ? new Date(v).toLocaleDateString("fr-MA") : "—");

export default function AdminLicenses() {
  const [keys, setKeys] = useState<any[] | null>(null),
    [error, setError] = useState(""),
    [months, setMonths] = useState(3),
    [count, setCount] = useState(1),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(""),
    [created, setCreated] = useState<{ codes: string[]; months: number; price: number } | null>(null),
    [filter, setFilter] = useState("all"),
    [copied, setCopied] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/licenses", { cache: "no-store" }),
      x = await r.json();
    if (!r.ok) throw new Error(x.error || "Accès refusé");
    setKeys(x.keys || []);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function generate(e: FormEvent) {
    e.preventDefault();
    setBusy("generate");
    setCopied(false);
    const r = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ months, count, note }),
      }),
      x = await r.json();
    setBusy("");
    if (!r.ok) return alert(x.error || "Génération impossible");
    setCreated({ codes: x.codes, months: x.months, price: x.price });
    setNote("");
    await load();
  }
  async function revoke(id: string) {
    if (!confirm("Révoquer cette clé ? Elle ne pourra plus être activée.")) return;
    setBusy(id);
    const r = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "revoke", id }),
      }),
      x = await r.json();
    setBusy("");
    if (!r.ok) return alert(x.error || "Révocation impossible");
    await load();
  }
  const message = created
    ? `Merci pour ton paiement ! Voici ta clé LandPro ${created.months} mois :\n${created.codes.join("\n")}\n\nNouveau compte : saisis-la à l'inscription. Compte existant : Mon abonnement > Activer la clé.`
    : "";
  async function copy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  }

  const stats = useMemo(() => {
    const k = keys || [];
    const used = k.filter((x) => x.status === "used");
    return {
      available: k.filter((x) => x.status === "available").length,
      used: used.length,
      revenue: used.reduce((n, x) => n + Number(x.price_mad || 0), 0),
      month: used
        .filter((x) => x.used_at && new Date(x.used_at).getMonth() === new Date().getMonth())
        .reduce((n, x) => n + Number(x.price_mad || 0), 0),
    };
  }, [keys]);
  const rows = (keys || []).filter((k) => filter === "all" || k.status === filter);

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content admin-clients-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">ADMIN</span>
            <h1>Clés d’abonnement</h1>
            <p>Génère une clé après chaque paiement et envoie-la au client. Chaque clé ne s’active qu’une fois.</p>
          </div>
        </header>
        {error && <div className="account-key-msg err">{error}</div>}

        <div className="admin-client-kpis">
          <button onClick={() => setFilter("available")}>
            <small>Clés disponibles</small>
            <b>{stats.available}</b>
          </button>
          <button onClick={() => setFilter("used")}>
            <small>Clés activées</small>
            <b>{stats.used}</b>
          </button>
          <button onClick={() => setFilter("used")}>
            <small>Encaissé (clés activées)</small>
            <b>{stats.revenue.toLocaleString("fr-MA")} MAD</b>
          </button>
          <button onClick={() => setFilter("all")}>
            <small>Activé ce mois-ci</small>
            <b>{stats.month.toLocaleString("fr-MA")} MAD</b>
          </button>
        </div>

        <section className="account-card account-key-card">
          <h3>Nouvelle clé</h3>
          <form className="account-key-form admin-license-form" onSubmit={generate}>
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {OFFERS.map((o) => (
                <option key={o.months} value={o.months}>
                  {o.months} mois · {o.price.toLocaleString("fr-MA")} MAD
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              title="Nombre de clés"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note : client, référence du virement…"
            />
            <button disabled={busy === "generate"}>{busy === "generate" ? "Génération…" : "Générer"}</button>
          </form>
          {created && (
            <div className="admin-license-result">
              <p>
                <b>Copie ces clés maintenant :</b> elles ne seront plus affichées (seule leur empreinte est
                enregistrée).
              </p>
              <pre>{created.codes.join("\n")}</pre>
              <button type="button" onClick={copy}>
                {copied ? "Message copié ✓" : "Copier le message pour le client"}
              </button>
            </div>
          )}
        </section>

        <div className="admin-clients-panel">
          <div className="admin-clients-toolbar">
            <div>
              <b>Toutes les clés</b>
              <span>{rows.length} clé(s)</span>
            </div>
            <div className="orders-filters">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Toutes</option>
                <option value="available">Disponibles</option>
                <option value="used">Utilisées</option>
                <option value="revoked">Révoquées</option>
              </select>
            </div>
          </div>
          <div className="admin-clients-table-wrap">
            <table className="admin-clients-table">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th>Durée</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Client</th>
                  <th>Note</th>
                  <th>Créée</th>
                  <th>Activée</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <b>LP-…{String(k.code_hint).replace("…", "")}</b>
                    </td>
                    <td>{k.duration_months} mois</td>
                    <td>{Number(k.price_mad).toLocaleString("fr-MA")} MAD</td>
                    <td>{STATUS[k.status] || k.status}</td>
                    <td>{k.workspace_name || "—"}</td>
                    <td>{k.note || "—"}</td>
                    <td>{day(k.created_at)}</td>
                    <td>{day(k.used_at)}</td>
                    <td>
                      {k.status === "available" && (
                        <button disabled={busy === k.id} onClick={() => revoke(k.id)}>
                          Révoquer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {keys && !rows.length && (
                  <tr>
                    <td colSpan={9}>Aucune clé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
