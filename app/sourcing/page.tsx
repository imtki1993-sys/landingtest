"use client";
// Sourcing Derb Omar : produits publiés par les grossistes dans des canaux Telegram publics.
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { formatPhone, SOURCING_CATEGORIES } from "../../lib/sourcing-extract";

interface Item {
  id: string;
  url: string;
  posted_at: string | null;
  text: string | null;
  photos: string[];
  has_video: boolean;
  name: string | null;
  category: string | null;
  price: number | null;
  min_qty: number | null;
  phone: string | null;
  channel_id: string;
  /** texte sans la signature répétée du canal */
  body?: string;
  /** numéros WhatsApp cités dans le message (212XXXXXXXXX) */
  phones?: string[];
}
interface Channel {
  id: string;
  username: string;
  title: string | null;
  photo_url: string | null;
  active?: boolean;
  last_synced_at?: string | null;
  last_error?: string | null;
}

const dh = (n: number | null | undefined) =>
  n == null ? null : Number(n).toLocaleString("fr-MA", { maximumFractionDigits: 2 }) + " DH";
function ago(iso: string | null | undefined) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l’instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return d < 30 ? `il y a ${d} j` : new Date(iso).toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
}
/** Prix de vente proposé : environ 2,5 × le prix de gros, arrondi à …9 DH. */
const suggestPrice = (w: number | null) => (w ? Math.max(49, Math.round((w * 2.5) / 10) * 10 - 1) : "");
/** Lien WhatsApp avec un message prêt à envoyer (lien du produit inclus). */
const waLink = (phone: string, item: Item) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(
    `السلام عليكم، بغيت نسول على هاد المنتج${item.name ? " : " + item.name : ""}\n${item.url}`,
  )}`;

const WaIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z" />
  </svg>
);

function ChannelBadge({ c }: { c?: Channel }) {
  if (!c) return null;
  return (
    <span className="src-chan">
      {c.photo_url ? <img src={c.photo_url} alt="" /> : <i>{(c.title || c.username)[0]?.toUpperCase()}</i>}
      <span>{c.title || "@" + c.username}</span>
    </span>
  );
}

function ImportForm({ item, onDone }: { item: Item; onDone: (id: string) => void }) {
  const [name, setName] = useState(item.name || "");
  const [price, setPrice] = useState<string>(String(suggestPrice(item.price)));
  const [old, setOld] = useState("");
  const [state, setState] = useState<"" | "busy" | "err">("");
  const [msg, setMsg] = useState("");
  const margin = item.price && Number(price) > 0 ? Number(price) - Number(item.price) : null;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setMsg("");
    const r = await fetch("/api/sourcing/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, name, price: Number(price), compare_at_price: Number(old) || null }),
    }).catch(() => null);
    const x = await r?.json().catch(() => ({}));
    if (r?.ok) onDone(x.product?.id);
    else {
      setState("err");
      setMsg(x?.error || "Import impossible, réessaie.");
    }
  }
  return (
    <form className="src-import" onSubmit={submit}>
      <label>
        Nom du produit
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
      </label>
      <div className="src-import-row">
        <label>
          Prix de vente
          <span className="src-money">
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
            DH
          </span>
        </label>
        <label>
          Prix barré (facultatif)
          <span className="src-money">
            <input inputMode="decimal" value={old} onChange={(e) => setOld(e.target.value)} />
            DH
          </span>
        </label>
      </div>
      <p className="src-margin">
        {item.price ? (
          <>
            Prix de gros {dh(item.price)}
            {margin != null ? (
              <>
                {" "}
                · marge <b className={margin > 0 ? "is-good" : "is-bad"}>{dh(margin)}</b> par pièce, avant pub et
                livraison
              </>
            ) : null}
          </>
        ) : (
          "Prix de gros non indiqué : demande-le au fournisseur."
        )}
      </p>
      {msg ? <p className="src-error">{msg}</p> : null}
      <button type="submit" className="src-primary" disabled={state === "busy"}>
        {state === "busy" ? "Import en cours…" : "Importer dans mes produits"}
      </button>
    </form>
  );
}

function Detail({ item, channel, onClose }: { item: Item; channel?: Channel; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const body = (item.body ?? item.text ?? "").trim();
  const shown = full || !body ? item.text || "" : body;
  const phones = item.phones || [];
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="src-modal" role="dialog" aria-modal="true" aria-label={item.name || "Produit"} onClick={onClose}>
      <div className="src-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="src-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <div className="src-gallery">
          {item.photos[i] ? (
            <img src={item.photos[i]} alt={item.name || ""} />
          ) : (
            <div className="src-noimg">Pas de photo</div>
          )}
          {item.photos.length > 1 ? (
            <div className="src-thumbs">
              {item.photos.map((p, k) => (
                <button
                  key={k}
                  type="button"
                  className={k === i ? "on" : ""}
                  onClick={() => setI(k)}
                  aria-label={`Photo ${k + 1}`}
                >
                  <img src={p} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="src-info">
          <ChannelBadge c={channel} />
          <h2>{item.name || "Produit sans nom"}</h2>
          <div className="src-price-line">
            <b>{dh(item.price) || "Prix sur demande"}</b>
            <span>
              prix de gros{item.min_qty ? ` · minimum ${item.min_qty} pièces` : ""} · {ago(item.posted_at)}
            </span>
          </div>
          {shown ? (
            <p className="src-text" dir="auto">
              {shown}
            </p>
          ) : null}
          {body && body !== (item.text || "").trim() ? (
            <button type="button" className="src-toggle" onClick={() => setFull((f) => !f)}>
              {full ? "Masquer la signature du fournisseur" : "Voir le message complet"}
            </button>
          ) : null}
          <div className="src-contact">
            {phones.length ? (
              <>
                <span>Contacter le fournisseur</span>
                <div className="src-wa-list">
                  {phones.map((n) => (
                    <a key={n} className="src-wa" href={waLink(n, item)} target="_blank" rel="noreferrer">
                      <WaIcon /> {formatPhone(n)}
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <span>Pas de numéro dans ce message : contacte le fournisseur sur Telegram.</span>
            )}
            <a className="src-tg" href={item.url} target="_blank" rel="noreferrer">
              Ouvrir le message sur Telegram ↗
            </a>
          </div>
          {done !== null ? (
            <div className="src-success">
              <b>Produit ajouté à tes produits ✓</b>
              <p>Tu peux maintenant créer sa landing page.</p>
              <Link href="/products" className="src-primary">
                Voir mes produits
              </Link>
            </div>
          ) : (
            <ImportForm item={item} onDone={(id) => setDone(id || "")} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelsAdmin({ channels, reload }: { channels: Channel[]; reload: () => void }) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  async function call(method: string, body?: unknown, query = "") {
    const r = await fetch("/api/sourcing/channels" + query, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const x = await r?.json().catch(() => ({}));
    return { ok: !!r?.ok, x };
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy("add");
    setMsg("");
    const { ok, x } = await call("POST", { link });
    setBusy("");
    if (ok) {
      setLink("");
      setMsg(`Canal ajouté : ${x.added} produit${x.added > 1 ? "s" : ""} lus.`);
      reload();
    } else setMsg(x?.error || "Ajout impossible.");
  }
  return (
    <details className="src-admin" open={!channels.length}>
      <summary>
        Canaux suivis <span>{channels.length}</span>
        <small>visible seulement par l’administrateur</small>
      </summary>
      <form onSubmit={add} className="src-admin-add">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Lien public du canal, ex. https://t.me/nom_du_canal"
          required
        />
        <button type="submit" disabled={busy === "add"}>
          {busy === "add" ? "Lecture du canal…" : "Ajouter"}
        </button>
      </form>
      {msg ? <p className="src-admin-msg">{msg}</p> : null}
      <ul>
        {channels.map((c) => (
          <li key={c.id} className={c.active === false ? "is-paused" : ""}>
            <ChannelBadge c={c} />
            <a href={`https://t.me/${c.username}`} target="_blank" rel="noreferrer">
              @{c.username}
            </a>
            <small className={c.last_error ? "src-error" : ""}>
              {c.last_error ? c.last_error : c.last_synced_at ? "lu " + ago(c.last_synced_at) : "jamais lu"}
            </small>
            <span className="src-admin-actions">
              <button
                type="button"
                disabled={busy === c.id}
                onClick={async () => {
                  setBusy(c.id);
                  await call("POST", { id: c.id, sync: true });
                  setBusy("");
                  reload();
                }}
              >
                {busy === c.id ? "…" : "Relire"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await call("PATCH", { id: c.id, active: c.active === false });
                  reload();
                }}
              >
                {c.active === false ? "Reprendre" : "Pause"}
              </button>
              <button
                type="button"
                className="danger"
                onClick={async () => {
                  if (!confirm(`Retirer @${c.username} et ses produits du catalogue ?`)) return;
                  await call("DELETE", undefined, "?id=" + c.id);
                  reload();
                }}
              >
                Retirer
              </button>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function SourcingPage() {
  const [d, setD] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [channel, setChannel] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recent");
  const [open, setOpen] = useState<Item | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (cursor?: string | null) => {
      const p = new URLSearchParams({ sort });
      if (query) p.set("q", query);
      if (category) p.set("category", category);
      if (channel) p.set("channel", channel);
      if (maxPrice) p.set("max_price", maxPrice);
      if (cursor) p.set("cursor", cursor);
      setLoading(true);
      try {
        const r = await fetch("/api/sourcing?" + p.toString(), { cache: "no-store" });
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Catalogue indisponible");
        setD(x);
        setItems((v) => (cursor ? [...v, ...(x.items || [])] : x.items || []));
        setNext(x.next || null);
        setError("");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [query, category, channel, maxPrice, sort],
  );
  useEffect(() => {
    load();
  }, [load]);

  const channels: Channel[] = d?.channels || [];
  const chanById = new Map(channels.map((c) => [c.id, c]));
  const filtered = !!(query || category || channel || maxPrice);

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content src-page">
        <header className="dash-header">
          <div>
            <span className="eyebrow">SOURCING</span>
            <h1>Sourcing Derb Omar</h1>
            <p>Les nouveautés des grossistes publiées sur Telegram, mises à jour toutes les 30 minutes.</p>
          </div>
        </header>

        {error ? <div className="dash-error">{error}</div> : null}

        {d && d.installed === false ? (
          <section className="src-card">
            <b>Activation nécessaire</b>
            <p>
              {d.isPlatformAdmin
                ? "Lance le script SQL « sourcing » dans Supabase (SQL Editor → New query → coller → Run), puis recharge cette page."
                : "Le catalogue Derb Omar arrive bientôt."}
            </p>
          </section>
        ) : null}

        {d?.installed ? (
          <>
            {d.isPlatformAdmin ? <ChannelsAdmin channels={channels} reload={() => load()} /> : null}

            <div className="src-filters">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Chercher : sac, سماعة, montre…"
                aria-label="Chercher un produit"
              />
              <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Fournisseur">
                <option value="">Tous les fournisseurs</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title || "@" + c.username}
                  </option>
                ))}
              </select>
              <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Prix de gros maximum">
                <option value="">Tous les prix</option>
                {[20, 50, 100, 200, 500].map((n) => (
                  <option key={n} value={n}>
                    Jusqu’à {n} DH
                  </option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier">
                <option value="recent">Plus récents</option>
                <option value="price">Prix croissant</option>
              </select>
            </div>
            <div className="src-cats" role="tablist" aria-label="Catégories">
              {["", ...SOURCING_CATEGORIES].map((c) => (
                <button
                  key={c || "all"}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  className={category === c ? "on" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c || "Tout"}
                </button>
              ))}
            </div>

            {!items.length && !loading ? (
              <section className="src-card src-empty">
                <b>
                  {filtered
                    ? "Aucun produit ne correspond"
                    : channels.length
                      ? "Les produits arrivent"
                      : "Aucun fournisseur pour l’instant"}
                </b>
                <p>
                  {filtered
                    ? "Essaie un autre mot ou une autre catégorie."
                    : channels.length
                      ? "Les canaux sont lus toutes les 30 minutes."
                      : d.isPlatformAdmin
                        ? "Ajoute le lien public d’un canal Telegram de grossiste ci-dessus."
                        : "Le catalogue Derb Omar arrive bientôt."}
                </p>
              </section>
            ) : (
              <div className={"src-grid" + (loading && !next ? " is-loading" : "")}>
                {items.map((it) => (
                  <article key={it.id} className="src-item">
                    <button
                      type="button"
                      className="src-thumb"
                      onClick={() => setOpen(it)}
                      aria-label={it.name || "Voir le produit"}
                    >
                      {it.photos[0] ? <img src={it.photos[0]} alt="" loading="lazy" /> : <span>Pas de photo</span>}
                      {it.photos.length > 1 ? <em>+{it.photos.length - 1}</em> : null}
                      {it.has_video ? <em className="src-vid">▶ vidéo</em> : null}
                    </button>
                    <div className="src-body">
                      <div className="src-price">
                        <b>{dh(it.price) || "Prix sur demande"}</b>
                        {it.min_qty ? <span>min. {it.min_qty}</span> : null}
                      </div>
                      <h3 dir="auto" title={it.name || ""}>
                        {it.name || "Produit sans nom"}
                      </h3>
                      <div className="src-meta">
                        <ChannelBadge c={chanById.get(it.channel_id)} />
                        <time>{ago(it.posted_at)}</time>
                      </div>
                      <div className="src-actions">
                        <button type="button" className="src-primary" onClick={() => setOpen(it)}>
                          Voir
                        </button>
                        {it.phones?.length ? (
                          <a
                            className="src-wa src-wa-icon"
                            href={waLink(it.phones[0], it)}
                            target="_blank"
                            rel="noreferrer"
                            title={"WhatsApp " + formatPhone(it.phones[0])}
                            aria-label={"Contacter le fournisseur sur WhatsApp " + formatPhone(it.phones[0])}
                          >
                            <WaIcon />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {next ? (
              <div className="src-more">
                <button type="button" onClick={() => load(next)} disabled={loading}>
                  {loading ? "Chargement…" : "Voir plus de produits"}
                </button>
              </div>
            ) : null}
          </>
        ) : !error ? (
          <div className="orders-empty">Chargement…</div>
        ) : null}

        {open ? <Detail item={open} channel={chanById.get(open.channel_id)} onClose={() => setOpen(null)} /> : null}
      </section>
    </main>
  );
}
