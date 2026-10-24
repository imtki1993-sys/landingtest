"use client";
// Sourcing Derb Omar : produits publiés par les grossistes dans des canaux Telegram publics.
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { formatPhone, SOURCING_CATEGORIES } from "../../lib/sourcing-extract";

interface Item {
  id: string;
  /** lien du message Telegram : administrateur seulement (les clients ne voient pas le canal) */
  url?: string;
  posted_at: string | null;
  /** message complet avec la signature du canal : administrateur seulement */
  text?: string | null;
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
  /** numéro pris dans la description du canal (le message n'en contient pas) */
  phones_from_channel?: boolean;
  /** ce produit dans les produits du compte (boutique Derb Omar) : prix de vente choisi */
  mine?: Mine | null;
}
interface Mine {
  id: string;
  price: number;
  active: boolean;
}
interface ShopStore {
  id: string;
  name: string;
  slug: string;
  status: string;
}
interface Channel {
  id: string;
  username: string;
  title: string | null;
  photo_url: string | null;
  active?: boolean;
  last_synced_at?: string | null;
  last_error?: string | null;
  /** administrateur : nom affiché aux clients (vide = « Fournisseur N », voir alias) */
  display_name?: string | null;
  alias?: string;
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
    `السلام عليكم، بغيت نسول على هاد المنتج${item.name ? " : " + item.name : ""}${item.url ? "\n" + item.url : ""}`,
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
      {c.photo_url ? (
        <img src={c.photo_url} alt="" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
      ) : (
        <i>
          {c.username
            ? (c.title || c.username)[0]?.toUpperCase()
            : c.title?.match(/^Fournisseur (\d+)$/)?.[1] || c.title?.[0]?.toUpperCase() || "F"}
        </i>
      )}
      <span>{c.title || "@" + c.username}</span>
    </span>
  );
}

function ImportForm({ item, shop, onDone }: { item: Item; shop: boolean; onDone: (mine: Mine) => void }) {
  const [name, setName] = useState(item.name || "");
  // prix choisi par le vendeur (le prix proposé n'est qu'un exemple)
  const [price, setPrice] = useState<string>(item.mine ? String(item.mine.price) : "");
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
    if (r?.ok) onDone({ id: x.product?.id, price: Number(price), active: true });
    else {
      setState("err");
      setMsg(x?.error || "Import impossible, réessaie.");
    }
  }
  return (
    <form className="src-import" onSubmit={submit}>
      <label>
        Nom du produit
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          placeholder="Écris le nom du produit (ex. Égouttoir de cuisine pliable)"
        />
      </label>
      <div className="src-import-row">
        <label>
          Prix de vente
          <span className="src-money">
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={item.price ? "ex. " + suggestPrice(item.price) : ""}
              required
            />
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
        {state === "busy"
          ? "Enregistrement…"
          : item.mine?.active
            ? "Changer le prix"
            : shop
              ? "Afficher ce prix sur mon site"
              : "Importer dans mes produits"}
      </button>
    </form>
  );
}

function Detail({
  item,
  channel,
  shop,
  onClose,
  onBroken,
  onMine,
}: {
  item: Item;
  channel?: Channel;
  shop: ShopStore | null;
  onClose: () => void;
  onBroken: (id: string) => void;
  onMine: (id: string, mine: Mine | null) => void;
}) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
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
            <img src={item.photos[i]} alt={item.name || ""} onError={() => onBroken(item.id)} />
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
                  <img src={p} alt="" onError={() => onBroken(item.id)} />
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
          {item.text && body && body !== item.text.trim() ? (
            <button type="button" className="src-toggle" onClick={() => setFull((f) => !f)}>
              {full ? "Masquer la signature du fournisseur" : "Voir le message complet"}
            </button>
          ) : null}
          <div className="src-contact">
            {phones.length ? (
              <>
                <span>
                  Contacter le fournisseur
                  {item.phones_from_channel ? <small> · numéro général du canal</small> : null}
                </span>
                <div className="src-wa-list">
                  {phones.map((n) => (
                    <a key={n} className="src-wa" href={waLink(n, item)} target="_blank" rel="noreferrer">
                      <WaIcon /> {formatPhone(n)}
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <span>
                {item.url
                  ? "Pas de numéro dans ce message : contacte le fournisseur sur Telegram."
                  : "Pas de numéro dans ce message."}
              </span>
            )}
            {item.url ? (
              <a className="src-tg" href={item.url} target="_blank" rel="noreferrer">
                Ouvrir le message sur Telegram ↗
              </a>
            ) : null}
          </div>
          {done !== null ? (
            <div className="src-success">
              <b>{shop ? "Prix affiché sur ton site ✓" : "Produit ajouté à tes produits ✓"}</b>
              <p>
                {shop
                  ? "Ton site Derb Omar montre ce prix ; le produit est aussi dans tes produits."
                  : "Tu peux maintenant créer sa landing page."}
              </p>
              <Link href="/products" className="src-primary">
                Voir mes produits
              </Link>
            </div>
          ) : (
            <>
              {item.mine?.active ? (
                <div className="src-onsale">
                  <span>
                    Sur ton site à <b>{dh(item.mine.price)}</b>
                  </span>
                  <button
                    type="button"
                    disabled={removing}
                    onClick={async () => {
                      setRemoving(true);
                      const r = await fetch("/api/sourcing/store", {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ productId: item.mine!.id, active: false }),
                      }).catch(() => null);
                      setRemoving(false);
                      if (r?.ok) onMine(item.id, { ...item.mine!, active: false });
                    }}
                  >
                    {removing ? "…" : "Retirer de mon site"}
                  </button>
                </div>
              ) : null}
              <ImportForm
                key={item.mine?.active ? "on" : "off"}
                item={item}
                shop={!!shop}
                onDone={(m) => {
                  onMine(item.id, m);
                  if (!item.mine?.active) setDone(m.id || "");
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Boutique Derb Omar du compte : création, liens, et filtre « à mettre en prix / en vente ». */
function ShopPanel({
  store,
  others,
  shop,
  setShop,
  onCreated,
}: {
  store: ShopStore | null;
  others: ShopStore[];
  shop: string;
  setShop: (v: string) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!store)
    return (
      <section className="src-shop">
        <div>
          <b>Crée ta boutique Derb Omar</b>
          <p>
            Un site avec tous les produits Derb Omar, mis à jour toutes les 30 minutes et présentés comme ici. Écris ton
            prix sur un produit pour l’afficher ; sans prix, le site montre « prix sur demande » et la commande arrive
            dans tes Commandes. Tes clients ne voient ni le fournisseur, ni le prix de gros.
          </p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            const r = await fetch("/api/sourcing/store", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name }),
            }).catch(() => null);
            const x = await r?.json().catch(() => ({}));
            setBusy(false);
            if (r?.ok) onCreated();
            else setErr(x?.error || "Création impossible, réessaie.");
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            placeholder="Nom de ta boutique, ex. Dar Lmaqadi"
            aria-label="Nom de ta boutique"
          />
          <button type="submit" className="src-primary" disabled={busy}>
            {busy ? "Création…" : "Créer ma boutique"}
          </button>
          {err ? <em className="src-error">{err}</em> : null}
        </form>
        {others.length ? (
          <form
            className="src-shop-convert"
            onSubmit={async (e) => {
              e.preventDefault();
              const id = new FormData(e.currentTarget).get("storeId");
              if (!id) return;
              setBusy(true);
              setErr("");
              const r = await fetch("/api/sourcing/store", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ storeId: id }),
              }).catch(() => null);
              const x = await r?.json().catch(() => ({}));
              setBusy(false);
              if (r?.ok) onCreated();
              else setErr(x?.error || "Transformation impossible, réessaie.");
            }}
          >
            <span>ou transforme une boutique que tu as déjà :</span>
            <select name="storeId" aria-label="Boutique à transformer" defaultValue="">
              <option value="" disabled>
                Choisis une boutique
              </option>
              {others.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={busy}>
              Utiliser pour Derb Omar
            </button>
          </form>
        ) : null}
      </section>
    );
  const live = store.status === "PUBLISHED";
  return (
    <section className="src-shop is-ready">
      <div>
        <b>
          {store.name} <small className={live ? "is-live" : ""}>{live ? "En ligne" : "Brouillon"}</small>
        </b>
        <p>
          {live
            ? "Tous les produits sont sur ton site. Écris ton prix pour l’afficher, sinon « prix sur demande »."
            : "Tous les produits sont déjà sur ton site. Publie-le dans « Personnaliser et publier »."}
        </p>
      </div>
      <div className="src-shop-tabs" role="tablist" aria-label="Produits de ma boutique">
        {[
          ["", "Tous"],
          ["todo", "Sans mon prix"],
          ["in", "Avec mon prix"],
        ].map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={shop === k}
            className={shop === k ? "on" : ""}
            onClick={() => setShop(k)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="src-shop-links">
        <a href={`/store/${store.slug}${live ? "" : "?preview=1"}`} target="_blank" rel="noreferrer">
          Voir la boutique ↗
        </a>
        <Link href={`/stores/${store.id}`}>Personnaliser et publier</Link>
      </div>
    </section>
  );
}

/** Prix de vente rapide sur une carte du catalogue (boutique Derb Omar). */
function QuickPrice({ item, onMine }: { item: Item; onMine: (id: string, mine: Mine | null) => void }) {
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (item.mine?.active)
    return (
      <p className="src-onsale-chip" title="Prix de vente dans ta boutique">
        Sur ton site · {dh(item.mine.price)}
      </p>
    );
  return (
    <form
      className="src-quick"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!(Number(price) > 0)) return;
        setBusy(true);
        setErr("");
        const r = await fetch("/api/sourcing/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: item.id, name: item.name || undefined, price: Number(price) }),
        }).catch(() => null);
        const x = await r?.json().catch(() => ({}));
        setBusy(false);
        if (r?.ok) onMine(item.id, { id: x.product?.id, price: Number(price), active: true });
        else setErr(x?.error || "Erreur");
      }}
    >
      <span className="src-money">
        <input
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))}
          placeholder="Ton prix"
          aria-label={"Ton prix de vente pour " + (item.name || "ce produit")}
          required
        />
        DH
      </span>
      <button type="submit" disabled={busy || !(Number(price) > 0)} title="Afficher ce prix sur mon site">
        {busy ? "…" : "OK"}
      </button>
      {err ? <em className="src-error">{err}</em> : null}
    </form>
  );
}

/** Nom du fournisseur vu par les clients (à la place du nom du canal Telegram). */
function SupplierName({
  c,
  save,
  onSaved,
}: {
  c: Channel;
  save: (v: string) => Promise<{ ok: boolean; x: any }>;
  onSaved: () => void;
}) {
  const [v, setV] = useState(c.display_name || "");
  const [state, setState] = useState("");
  const dirty = v.trim() !== (c.display_name || "").trim();
  return (
    <form
      className="src-admin-name"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        const { ok, x } = await save(v);
        setState(ok ? "saved" : x?.error || "Enregistrement impossible.");
        if (ok) onSaved();
      }}
    >
      <input
        value={v}
        maxLength={60}
        aria-label="Nom vu par les clients"
        title="Nom vu par les clients"
        placeholder={"Nom pour les clients : " + (c.alias || "Fournisseur")}
        onChange={(e) => {
          setV(e.target.value);
          setState("");
        }}
      />
      <button type="submit" disabled={!dirty || state === "saving"}>
        {state === "saving" ? "…" : "OK"}
      </button>
      {state === "saved" && !dirty ? <em>Enregistré</em> : null}
      {state && !["saving", "saved"].includes(state) ? <em className="src-error">{state}</em> : null}
    </form>
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
  async function syncAll() {
    setBusy("all");
    setMsg("Lecture de tous les canaux…");
    const { ok, x } = await call("POST", { syncAll: true });
    setBusy("");
    if (ok) {
      setMsg(
        `${x.synced}/${x.channels} canaux lus : ${x.added} nouveau${x.added > 1 ? "x" : ""} produit${x.added > 1 ? "s" : ""}` +
          (x.failed ? `, ${x.failed} en erreur` : "") +
          (x.synced < x.channels ? " (relance pour lire les autres)" : "") +
          ".",
      );
      reload();
    } else setMsg(x?.error || "Lecture impossible.");
  }
  return (
    <details className="src-admin" open={!channels.length}>
      <summary>
        Canaux suivis <span>{channels.length}</span>
        <small>visible seulement par l’administrateur</small>
      </summary>
      <div className="src-admin-sync">
        <button type="button" disabled={!!busy || !channels.length} onClick={syncAll}>
          {busy === "all" ? "Lecture en cours…" : "Actualiser tous les canaux maintenant"}
        </button>
      </div>
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
            <SupplierName c={c} onSaved={reload} save={(v) => call("PATCH", { id: c.id, display_name: v })} />
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

/** Date du jour au Maroc (AAAA-MM-JJ), décalée de `days` jours. */
function dayStr(days = 0) {
  const d = new Date(Date.now() + 3600_000 - days * 86400_000); // UTC+1
  return d.toISOString().slice(0, 10);
}
const PERIODS: [string, string][] = [
  ["", "Toutes les dates"],
  ["today", "Aujourd’hui"],
  ["yesterday", "Hier"],
  ["7", "7 derniers jours"],
  ["30", "30 derniers jours"],
  ["90", "3 derniers mois"],
  ["custom", "Choisir les dates…"],
];
function periodRange(period: string, from: string, to: string): [string, string] {
  if (period === "today") return [dayStr(0), dayStr(0)];
  if (period === "yesterday") return [dayStr(1), dayStr(1)];
  if (/^\d+$/.test(period)) return [dayStr(Number(period) - 1), ""];
  if (period === "custom") return [from, to];
  return ["", ""];
}
/** « Aujourd’hui », « Hier », « lundi 19 octobre » : en-têtes de jour dans la grille. */
function dayLabel(iso: string | null) {
  if (!iso) return "Date inconnue";
  const d = new Date(new Date(iso).getTime() + 3600_000).toISOString().slice(0, 10);
  if (d === dayStr(0)) return "Aujourd’hui";
  if (d === dayStr(1)) return "Hier";
  return new Date(d + "T12:00:00Z").toLocaleDateString("fr-MA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
const fmtDay = (d: string) =>
  new Date(d.slice(0, 10) + "T12:00:00Z").toLocaleDateString("fr-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

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
  const [period, setPeriod] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");
  const [range0, range1] = periodRange(period, fromDay, toDay);
  const [importing, setImporting] = useState("");
  const [shop, setShop] = useState("");
  const [open, setOpen] = useState<Item | null>(null);
  // photos dont le lien Telegram a expiré : réparées à la volée par le serveur, sinon « Photo indisponible »
  const [dead, setDead] = useState<Set<string>>(new Set());
  const tried = useRef(new Set<string>());
  const queue = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = useCallback(async () => {
    const ids = [...queue.current];
    queue.current.clear();
    if (!ids.length) return;
    let fixed: Record<string, string[]> = {};
    try {
      const r = await fetch("/api/sourcing/photos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      fixed = (await r.json()).photos || {};
    } catch {}
    const ok = (id: string) => fixed[id]?.length;
    setItems((v) => v.map((it) => (fixed[it.id] ? { ...it, photos: fixed[it.id] } : it)));
    setOpen((o) => (o && fixed[o.id] ? { ...o, photos: fixed[o.id] } : o));
    setDead((d) => {
      const n = new Set(d);
      for (const id of ids) if (!ok(id)) n.add(id);
      return n;
    });
  }, []);
  const onBroken = useCallback(
    (id: string) => {
      if (tried.current.has(id)) {
        setDead((d) => (d.has(id) ? d : new Set(d).add(id)));
        return;
      }
      tried.current.add(id);
      queue.current.add(id);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 300);
    },
    [flush],
  );

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
      if (range0) p.set("from", range0);
      if (range1) p.set("to", range1);
      if (shop) p.set("shop", shop);
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
    [query, category, channel, maxPrice, sort, range0, range1, shop],
  );
  useEffect(() => {
    load();
  }, [load]);

  const channels: Channel[] = d?.channels || [];
  const chanById = new Map(channels.map((c) => [c.id, c]));
  const filtered = !!(query || category || channel || maxPrice || range0 || range1 || shop);
  const store: ShopStore | null = d?.store || null;
  const onMine = useCallback((id: string, mine: Mine | null) => {
    setItems((v) => v.map((it) => (it.id === id ? { ...it, mine } : it)));
    setOpen((o) => (o && o.id === id ? { ...o, mine } : o));
  }, []);
  // période plus ancienne que les produits importés : import possible (administrateur)
  const notImported = !!(range0 && d?.oldest && range0 < String(d.oldest).slice(0, 10));

  async function importPeriod() {
    if (!range0) return;
    let total = 0;
    setImporting("Lecture des canaux Telegram…");
    try {
      for (let round = 0; round < 30; round++) {
        const r = await fetch("/api/sourcing/channels", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ backfill: true, since: range0, id: channel || undefined }),
        });
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || "Import impossible");
        total += x.added || 0;
        setImporting(`${total} produit${total > 1 ? "s" : ""} importé${total > 1 ? "s" : ""}…`);
        if (x.done) break;
      }
      setImporting(`Import terminé : ${total} produit${total > 1 ? "s" : ""} ajouté${total > 1 ? "s" : ""}.`);
      load();
    } catch (e: any) {
      setImporting("");
      setError(e.message);
    }
  }

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
            <ShopPanel
              store={store}
              others={d.otherStores || []}
              shop={shop}
              setShop={setShop}
              onCreated={() => load()}
            />

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
              <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Date de publication">
                {PERIODS.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier">
                <option value="recent">Plus récents</option>
                <option value="price">Prix croissant</option>
              </select>
            </div>
            {d.lastSync ? <p className="src-sync">Canaux lus {ago(d.lastSync)}.</p> : null}
            {period === "custom" ? (
              <div className="src-dates">
                <label>
                  Du
                  <input
                    type="date"
                    value={fromDay}
                    max={toDay || dayStr(0)}
                    onChange={(e) => setFromDay(e.target.value)}
                  />
                </label>
                <label>
                  au
                  <input
                    type="date"
                    value={toDay}
                    min={fromDay || undefined}
                    max={dayStr(0)}
                    onChange={(e) => setToDay(e.target.value)}
                  />
                </label>
              </div>
            ) : null}
            {notImported || importing ? (
              <div className="src-import">
                {importing ? (
                  <span>{importing}</span>
                ) : (
                  <span>
                    Les produits importés commencent le {fmtDay(String(d.oldest))}. Ceux d’avant ne sont pas encore dans
                    le catalogue.
                  </span>
                )}
                {d.isPlatformAdmin && notImported && !/…$/.test(importing) ? (
                  <button type="button" onClick={importPeriod}>
                    Importer depuis le {fmtDay(range0)}
                  </button>
                ) : null}
              </div>
            ) : null}
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
                  {shop === "in" && !query && !category
                    ? "Aucun produit en vente pour l’instant"
                    : filtered
                      ? "Aucun produit ne correspond"
                      : channels.length
                        ? "Les produits arrivent"
                        : "Aucun fournisseur pour l’instant"}
                </b>
                <p>
                  {shop === "in" && !query && !category
                    ? "Écris ton prix sur un produit et clique « Vendre » pour le mettre dans ta boutique."
                    : filtered
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
                {items.map((it, k) => (
                  <React.Fragment key={it.id}>
                    {sort === "recent" && (k === 0 || dayLabel(items[k - 1].posted_at) !== dayLabel(it.posted_at)) ? (
                      <h2 className="src-day">{dayLabel(it.posted_at)}</h2>
                    ) : null}
                    <article className="src-item">
                      <button
                        type="button"
                        className="src-thumb"
                        onClick={() => setOpen(it)}
                        aria-label={it.name || "Voir le produit"}
                      >
                        {it.photos[0] && !dead.has(it.id) ? (
                          <img src={it.photos[0]} alt="" loading="lazy" onError={() => onBroken(it.id)} />
                        ) : (
                          <span>{it.photos[0] ? "Photo indisponible" : "Pas de photo"}</span>
                        )}
                        {it.photos.length > 1 ? <em>+{it.photos.length - 1}</em> : null}
                        {it.has_video ? <em className="src-vid">▶ vidéo</em> : null}
                      </button>
                      <div className="src-body">
                        <div className="src-price">
                          <b className={it.price == null ? "is-empty" : ""}>{dh(it.price) || "Prix sur demande"}</b>
                          {it.min_qty ? <span>min. {it.min_qty}</span> : null}
                        </div>
                        <h3 dir="auto" title={it.name || ""} className={it.name ? "" : "is-empty"}>
                          {it.name || "Voir la photo"}
                        </h3>
                        <div className="src-meta">
                          <ChannelBadge c={chanById.get(it.channel_id)} />
                          <time>{ago(it.posted_at)}</time>
                        </div>
                        {store ? <QuickPrice item={it} onMine={onMine} /> : null}
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
                  </React.Fragment>
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

        {open ? (
          <Detail
            item={open}
            channel={chanById.get(open.channel_id)}
            shop={store}
            onClose={() => setOpen(null)}
            onBroken={onBroken}
            onMine={onMine}
          />
        ) : null}
      </section>
    </main>
  );
}
