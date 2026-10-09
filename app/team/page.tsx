"use client";
// Équipe de confirmation : agents, répartition automatique des commandes, performance sur 30 jours.
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { FormEvent, useEffect, useState } from "react";

export default function Team() {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [form, setForm] = useState({ full_name: "", email: "", password: "" }),
    [busy, setBusy] = useState(""),
    [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function load() {
    const r = await fetch("/api/team", { cache: "no-store" }),
      x = await r.json();
    if (!r.ok) throw new Error(x.error || "Chargement impossible");
    setData(x);
    setError("");
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function call(method: string, body?: any, query = "") {
    const r = await fetch("/api/team" + query, {
        method,
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      }),
      x = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(x.error || "Action impossible");
    return x;
  }
  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy("create");
    try {
      await call("POST", form);
      setCreated({ email: form.email, password: form.password });
      setForm({ full_name: "", email: "", password: "" });
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy("");
    }
  }
  async function act(id: string, fn: () => Promise<any>) {
    setBusy(id);
    try {
      await fn();
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy("");
    }
  }
  const randomPassword = () =>
    setForm((f) => ({
      ...f,
      password: Array.from(crypto.getRandomValues(new Uint8Array(10)))
        .map((n) => "abcdefghjkmnpqrstuvwxyz23456789"[n % 31])
        .join(""),
    }));

  const agents: any[] = data?.agents || [];
  const total = agents.reduce(
    (t, a) => ({
      assigned: t.assigned + a.stats.assigned,
      confirmed: t.confirmed + a.stats.confirmed,
      cancelled: t.cancelled + a.stats.cancelled,
      pending: t.pending + a.stats.pending,
    }),
    { assigned: 0, confirmed: 0, cancelled: 0, pending: 0 },
  );
  const rate =
    total.confirmed + total.cancelled
      ? Math.round((total.confirmed / (total.confirmed + total.cancelled)) * 100)
      : null;

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content admin-clients-dashboard team-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">CONFIRMATION</span>
            <h1>Équipe</h1>
            <p>
              Crée des comptes pour tes agents de confirmation. Chaque agent ne voit que les commandes qui lui sont
              attribuées et ne peut que changer leur statut d’appel.
            </p>
          </div>
        </header>
        {error && <div className="account-key-msg err">{error}</div>}

        <div className="admin-client-kpis">
          <button>
            <small>Agents actifs</small>
            <b>{agents.filter((a) => a.active).length}</b>
          </button>
          <button>
            <small>Commandes attribuées (30 j)</small>
            <b>{total.assigned}</b>
          </button>
          <button>
            <small>En attente d’appel</small>
            <b>{total.pending}</b>
          </button>
          <button>
            <small>Taux de confirmation</small>
            <b>{rate === null ? "—" : rate + " %"}</b>
          </button>
        </div>

        <section className="account-card account-key-card">
          <div className="team-auto">
            <div>
              <h3>Répartition automatique</h3>
              <p>
                Chaque nouvelle commande est attribuée à l’agent actif le moins chargé des dernières 24 h.
                {data ? ` ${data.unassigned_30d} commande(s) non attribuée(s) sur 30 jours.` : ""}
              </p>
            </div>
            <label className="team-switch">
              <input
                type="checkbox"
                checked={!!data?.auto_assign}
                disabled={!data || busy === "auto"}
                onChange={(e) => act("auto", () => call("PATCH", { auto_assign: e.target.checked }))}
              />
              <span>{data?.auto_assign ? "Activée" : "Désactivée"}</span>
            </label>
          </div>
        </section>

        <section className="account-card account-key-card">
          <h3>Ajouter un agent</h3>
          <form className="account-key-form" onSubmit={create}>
            <input
              placeholder="Nom de l’agent"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email de connexion"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              placeholder="Mot de passe (8 caractères min.)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
            <button type="button" className="team-secondary" onClick={randomPassword}>
              Générer
            </button>
            <button disabled={busy === "create"}>{busy === "create" ? "Création…" : "Créer le compte"}</button>
          </form>
          {created && (
            <div className="admin-license-result">
              <p>
                <b>Compte créé.</b> Envoie ces accès à l’agent : il se connecte sur la page de connexion habituelle.
              </p>
              <pre>{`Email : ${created.email}\nMot de passe : ${created.password}`}</pre>
            </div>
          )}
        </section>

        <div className="admin-clients-panel">
          <div className="admin-clients-toolbar">
            <div>
              <b>Agents</b>
              <span>Performance sur les 30 derniers jours</span>
            </div>
          </div>
          <div className="admin-clients-table-wrap">
            <table className="admin-clients-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Statut</th>
                  <th>Attribuées</th>
                  <th>En attente</th>
                  <th>Confirmées</th>
                  <th>Annulées</th>
                  <th>Livrées</th>
                  <th>Appels</th>
                  <th>Taux de confirmation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <b>{a.full_name || a.email}</b>
                      <br />
                      <small>{a.email}</small>
                    </td>
                    <td>{a.active ? "Actif" : "Désactivé"}</td>
                    <td>{a.stats.assigned}</td>
                    <td>{a.stats.pending}</td>
                    <td>{a.stats.confirmed}</td>
                    <td>{a.stats.cancelled}</td>
                    <td>{a.stats.delivered}</td>
                    <td>{a.stats.calls}</td>
                    <td>
                      <b>{a.stats.confirmation_rate === null ? "—" : a.stats.confirmation_rate + " %"}</b>
                    </td>
                    <td className="team-actions">
                      <button
                        disabled={busy === a.id}
                        onClick={() => act(a.id, () => call("PATCH", { user_id: a.id, active: !a.active }))}
                      >
                        {a.active ? "Désactiver" : "Réactiver"}
                      </button>
                      <button
                        disabled={busy === a.id}
                        onClick={() =>
                          confirm(
                            `Supprimer le compte de ${a.full_name || a.email} ? Ses commandes redeviennent non attribuées.`,
                          ) && act(a.id, () => call("DELETE", undefined, "?user_id=" + encodeURIComponent(a.id)))
                        }
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {data && !agents.length && (
                  <tr>
                    <td colSpan={10}>Aucun agent pour le moment. Ajoute ton premier agent ci-dessus.</td>
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
