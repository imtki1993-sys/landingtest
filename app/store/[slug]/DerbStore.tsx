"use client";
// Boutique Derb Omar publique : tout le catalogue du Sourcing, présenté comme la page Sourcing de LandPro
// (nouveautés par jour, catégories, recherche). Commande directe sur chaque produit, paiement à la livraison.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DerbItem } from "../../../lib/derb-store";
import "./derb-store.css";

const CATS = [
  "Maison & cuisine",
  "Beauté & soins",
  "Mode & accessoires",
  "Électronique & gadgets",
  "Enfants & jouets",
  "Sport & loisirs",
  "Auto & moto",
  "Santé & bien-être",
  "Animaux",
  "Autre",
];
const CAT_AR: Record<string, string> = {
  "Maison & cuisine": "الدار و الكوزينة",
  "Beauté & soins": "الجمال و العناية",
  "Mode & accessoires": "الموضة و الإكسسوارات",
  "Électronique & gadgets": "الإلكترونيك و الأدوات",
  "Enfants & jouets": "الدراري و اللعب",
  "Sport & loisirs": "الرياضة و الترفيه",
  "Auto & moto": "الطوموبيل و الموطور",
  "Santé & bien-être": "الصحة",
  Animaux: "الحيوانات",
  Autre: "منتوجات أخرى",
};
const T = {
  ar: {
    search: "قلب على منتوج…",
    all: "الكل",
    today: "اليوم",
    yesterday: "البارح",
    onRequest: "الثمن عند الطلب",
    order: "اطلب دابا",
    name: "الاسم الكامل",
    phone: "رقم الهاتف",
    city: "المدينة",
    address: "العنوان (اختياري)",
    qty: "الكمية",
    send: "تأكيد الطلب",
    sending: "كنصيفطو الطلب…",
    cod: "الدفع عند الاستلام · التوصيل لجميع المدن",
    done: "توصلنا بالطلب ديالك ✓",
    doneText: "غادي نتاصلو بيك فالتيليفون باش نأكدو الطلب.",
    donePrice: "غادي نعطيوك الثمن فالتيليفون قبل ما نصيفطو.",
    more: "شوف المزيد",
    loading: "كنحمّلو…",
    empty: "ما لقينا حتى منتوج.",
    close: "سد",
    video: "فيديو",
    count: (n: number) => `${n} منتوج`,
    error: "وقع مشكل، عاود جرب.",
    whatsapp: "سولنا فواتساب",
  },
  fr: {
    search: "Rechercher un produit…",
    all: "Tout",
    today: "Aujourd'hui",
    yesterday: "Hier",
    onRequest: "Prix sur demande",
    order: "Commander",
    name: "Nom complet",
    phone: "Téléphone",
    city: "Ville",
    address: "Adresse (facultatif)",
    qty: "Quantité",
    send: "Confirmer la commande",
    sending: "Envoi…",
    cod: "Paiement à la livraison · Livraison partout au Maroc",
    done: "Commande reçue ✓",
    doneText: "Nous vous appelons pour confirmer la commande.",
    donePrice: "Nous vous donnons le prix au téléphone avant l'envoi.",
    more: "Voir plus",
    loading: "Chargement…",
    empty: "Aucun produit trouvé.",
    close: "Fermer",
    video: "vidéo",
    count: (n: number) => `${n} produits`,
    error: "Erreur, réessayez.",
    whatsapp: "Nous écrire sur WhatsApp",
  },
};

const dh = (n: number) => n.toLocaleString("fr-MA", { maximumFractionDigits: 2 }) + " DH";
/** Jour au Maroc (UTC+1), AAAA-MM-JJ */
const day = (iso: string | null) =>
  iso ? new Date(new Date(iso).getTime() + 3600_000).toISOString().slice(0, 10) : "";

export interface DerbStoreProps {
  store: { name: string; slug: string; locale: string; primary?: string; logo?: string; whatsapp?: string };
  initial: { items: DerbItem[]; next: string | null };
  preview?: boolean;
}

export default function DerbStore({ store, initial, preview }: DerbStoreProps) {
  const ar = store.locale !== "fr";
  const t = ar ? T.ar : T.fr;
  const cat = (c: string) => (ar ? CAT_AR[c] || c : c);
  const [items, setItems] = useState(initial.items);
  const [next, setNext] = useState(initial.next);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<DerbItem | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const first = useRef(true);

  useEffect(() => {
    const id = setTimeout(() => setQuery(q.trim()), 350);
    return () => clearTimeout(id);
  }, [q]);

  const load = useCallback(
    async (cursor?: string | null) => {
      const p = new URLSearchParams({ slug: store.slug });
      if (category) p.set("category", category);
      if (query) p.set("q", query);
      if (cursor) p.set("cursor", cursor);
      setLoading(true);
      try {
        const r = await fetch("/api/derb-store?" + p.toString());
        const x = await r.json();
        if (!r.ok) throw new Error(x.error);
        setItems((v) => (cursor ? [...v, ...x.items] : x.items));
        setNext(x.next);
      } catch {
        // on garde ce qui est affiché
      } finally {
        setLoading(false);
      }
    },
    [store.slug, category, query],
  );
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    load();
  }, [load]);

  const today = day(new Date().toISOString());
  const yesterday = day(new Date(Date.now() - 86400_000).toISOString());
  const label = (iso: string | null) => {
    const d = day(iso);
    if (!d) return "";
    if (d === today) return t.today;
    if (d === yesterday) return t.yesterday;
    return new Date(d + "T12:00:00Z").toLocaleDateString(ar ? "ar-MA" : "fr-MA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };
  const visible = useMemo(() => items.filter((it) => !broken.has(it.id)), [items, broken]);
  const style = store.primary ? ({ "--ds-accent": store.primary } as React.CSSProperties) : undefined;

  return (
    <div className="ds" dir={ar ? "rtl" : "ltr"} style={style}>
      {preview ? <div className="ds-preview">Aperçu · boutique non publiée</div> : null}
      <p className="ds-cod">{t.cod}</p>
      <header className="ds-head">
        <div className="ds-wrap ds-head-row">
          <a className="ds-brand" href={"/store/" + store.slug}>
            {store.logo ? <img src={store.logo} alt="" /> : null}
            <span>{store.name}</span>
          </a>
          <input
            type="search"
            className="ds-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
          />
        </div>
        <nav className="ds-wrap ds-cats" aria-label={ar ? "الأصناف" : "Catégories"}>
          {["", ...CATS].map((c) => (
            <button
              key={c || "all"}
              type="button"
              className={category === c ? "on" : ""}
              onClick={() => setCategory(c)}
            >
              {c ? cat(c) : t.all}
            </button>
          ))}
        </nav>
      </header>

      <main className="ds-wrap ds-main">
        {!visible.length && !loading ? <p className="ds-empty">{t.empty}</p> : null}
        <div className={"ds-grid" + (loading && !next ? " is-loading" : "")}>
          {visible.map((it, k) => (
            <React.Fragment key={it.id}>
              {k === 0 || day(visible[k - 1].posted_at) !== day(it.posted_at) ? (
                <h2 className="ds-day">{label(it.posted_at)}</h2>
              ) : null}
              <button type="button" className="ds-card" onClick={() => setOpen(it)}>
                <span className="ds-thumb">
                  <img
                    src={it.photos[0]}
                    alt=""
                    loading="lazy"
                    onError={() => setBroken((b) => new Set(b).add(it.id))}
                  />
                  {it.has_video ? <em>▶ {t.video}</em> : null}
                  {it.compare ? <i>-{Math.round((1 - (it.price || 0) / it.compare) * 100)}%</i> : null}
                </span>
                <span className="ds-card-body">
                  <b dir="auto">{it.name}</b>
                  {it.price ? (
                    <span className="ds-price">
                      {dh(it.price)}
                      {it.compare ? <s>{dh(it.compare)}</s> : null}
                    </span>
                  ) : (
                    <span className="ds-price is-request">{t.onRequest}</span>
                  )}
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>
        {next ? (
          <div className="ds-more">
            <button type="button" onClick={() => load(next)} disabled={loading}>
              {loading ? t.loading : t.more}
            </button>
          </div>
        ) : null}
      </main>

      {store.whatsapp ? (
        <a
          className="ds-wa"
          href={`https://wa.me/${store.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          aria-label={t.whatsapp}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z" />
          </svg>
        </a>
      ) : null}

      {open ? <Sheet item={open} store={store} t={t} cat={cat} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}

function Sheet({
  item,
  store,
  t,
  cat,
  onClose,
}: {
  item: DerbItem;
  store: DerbStoreProps["store"];
  t: (typeof T)["ar"];
  cat: (c: string) => string;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", qty: 1 });
  const [state, setState] = useState<"" | "busy" | "done">("");
  const [err, setErr] = useState("");
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setErr("");
    const r = await fetch("/api/derb-store/order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: store.slug, id: item.id, ...form }),
    }).catch(() => null);
    const x = await r?.json().catch(() => ({}));
    if (r?.ok) setState("done");
    else {
      setState("");
      setErr(x?.error || t.error);
    }
  }
  return (
    <div className="ds-modal" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      <div className="ds-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ds-close" onClick={onClose} aria-label={t.close}>
          ×
        </button>
        <div className="ds-gallery">
          <img src={item.photos[i]} alt={item.name} />
          {item.photos.length > 1 ? (
            <div className="ds-thumbs">
              {item.photos.map((p, k) => (
                <button key={k} type="button" className={k === i ? "on" : ""} onClick={() => setI(k)}>
                  <img src={p} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="ds-info">
          {item.category ? <span className="ds-chip">{cat(item.category)}</span> : null}
          <h1 dir="auto">{item.name}</h1>
          {item.price ? (
            <p className="ds-price ds-price-lg">
              {dh(item.price)}
              {item.compare ? <s>{dh(item.compare)}</s> : null}
            </p>
          ) : (
            <p className="ds-price ds-price-lg is-request">{t.onRequest}</p>
          )}
          {item.body ? (
            <p className="ds-body" dir="auto">
              {item.body}
            </p>
          ) : null}
          {state === "done" ? (
            <div className="ds-done">
              <b>{t.done}</b>
              <p>
                {t.doneText} {item.price ? "" : t.donePrice}
              </p>
            </div>
          ) : (
            <form className="ds-form" onSubmit={submit}>
              <b>{t.order}</b>
              <input
                required
                maxLength={160}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={t.name}
                autoComplete="name"
              />
              <input
                required
                inputMode="tel"
                maxLength={40}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder={t.phone}
                autoComplete="tel"
                dir="ltr"
              />
              <div className="ds-form-row">
                <input
                  required
                  maxLength={120}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder={t.city}
                  autoComplete="address-level2"
                />
                <label className="ds-qty">
                  <span>{t.qty}</span>
                  <button type="button" onClick={() => set("qty", Math.max(1, form.qty - 1))} aria-label="-">
                    −
                  </button>
                  <output>{form.qty}</output>
                  <button type="button" onClick={() => set("qty", Math.min(10, form.qty + 1))} aria-label="+">
                    +
                  </button>
                </label>
              </div>
              <input
                maxLength={500}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder={t.address}
                autoComplete="street-address"
              />
              {err ? <p className="ds-err">{err}</p> : null}
              <button type="submit" className="ds-btn" disabled={state === "busy"}>
                {state === "busy" ? t.sending : t.send}
                {item.price && state !== "busy" ? <span>{dh(item.price * form.qty)}</span> : null}
              </button>
              <small>{t.cod}</small>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
