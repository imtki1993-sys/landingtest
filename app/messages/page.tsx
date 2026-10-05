"use client";
import Link from "next/link";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { useEffect, useState } from "react";
export default function Messages() {
  const [items, setItems] = useState<any[]>([]),
    [loading, setLoading] = useState(true);
  const load = () =>
    fetch("/api/messages", { cache: "no-store" })
      .then((r) => r.json())
      .then((x) => {
        setItems(x.messages || []);
        setLoading(false);
      });
  useEffect(() => {
    load();
  }, []);
  async function status(id: string, v: string) {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: v }),
    });
    load();
  }
  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content pages-dashboard">
        <header className="dash-header">
          <div>
            <span className="eyebrow">STORES</span>
            <h1>Messages</h1>
            <p>Messages reçus depuis les formulaires Contact de tes boutiques.</p>
          </div>
        </header>
        {loading ? (
          <p>Chargement…</p>
        ) : !items.length ? (
          <div className="dashboard-card">
            <p className="dashboard-empty">Aucun message reçu.</p>
          </div>
        ) : (
          <div className="store-message-list">
            {items.map((m) => (
              <article className={"store-message " + (m.status === "NEW" ? "is-new" : "")} key={m.id}>
                <div className="store-message-head">
                  <div>
                    <b>{m.subject}</b>
                    <small>
                      {m.store?.name || "Store"} · {new Date(m.created_at).toLocaleString("fr-MA")}
                    </small>
                  </div>
                  <span>{m.status === "NEW" ? "Nouveau" : m.status === "READ" ? "Lu" : "Archivé"}</span>
                </div>
                <p>{m.message}</p>
                <div className="store-message-contact">
                  <b>{m.name}</b>
                  {m.email && <a href={"mailto:" + m.email}>{m.email}</a>}
                  {m.phone && <a href={"tel:" + m.phone}>{m.phone}</a>}
                </div>
                <div className="store-message-actions">
                  {m.status === "NEW" && <button onClick={() => status(m.id, "READ")}>Marquer comme lu</button>}
                  <button onClick={() => status(m.id, "ARCHIVED")}>Archiver</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
