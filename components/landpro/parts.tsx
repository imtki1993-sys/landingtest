"use client";
// Briques communes + éléments interactifs (formulaire COD, offres, variantes,
// compte à rebours, galerie à vignettes, vidéo).
import React, { useEffect, useState } from "react";
import type { VM } from "./model";
import { formatPrice } from "./i18n";

/** Préfixe chaque classe avec « lpx- » : cx("btn lg") → "lpx-btn lpx-lg" */
export const cx = (...names: (string | false | null | undefined)[]) =>
  names
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => `lpx-${n}`)
    .join(" ");

export const isPhoto = (src: string) => !!src && !/\.svg(\?|#|$)/i.test(src);

export function Stage({
  src,
  alt,
  extra = "",
  children,
}: {
  src: string;
  alt: string;
  extra?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cx("stage", extra, isPhoto(src) && "photo")}>
      {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : null}
      {children}
    </div>
  );
}

export const starText = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

export function PriceRow({ vm, center }: { vm: VM; center?: boolean }) {
  if (!vm.show.price || !vm.price) return null;
  return (
    <div className={cx("price-row")} style={center ? { justifyContent: "center" } : undefined}>
      <span className={cx("price")}>{formatPrice(vm.price, vm.currency)}</span>
      {vm.oldPrice ? <span className={cx("old-price")}>{formatPrice(vm.oldPrice, vm.currency)}</span> : null}
      {vm.oldPrice ? <span className={cx("save-tag")}>-{Math.round((1 - vm.price / vm.oldPrice) * 100)}%</span> : null}
    </div>
  );
}

export const scrollToOrder = () =>
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });

export function waHref(vm: VM, extra = "") {
  if (!vm.whatsapp) return "#order";
  const msg =
    vm.lang === "ar"
      ? `السلام عليكم، بغيت نطلب: ${vm.name} ${extra}`
      : `Bonjour, je souhaite commander : ${vm.name} ${extra}`;
  return `https://wa.me/${vm.whatsapp}?text=${encodeURIComponent(msg.trim())}`;
}

// ─── Compte à rebours ───
export function Countdown({ vm, small }: { vm: VM; small?: boolean }) {
  const minutes = vm.countdownMinutes;
  const [left, setLeft] = useState<number>(minutes * 60_000);
  useEffect(() => {
    const key = `lpx-cd-${vm.t.id}-${minutes}`;
    let end = 0;
    try {
      end = Number(sessionStorage.getItem(key) || 0);
    } catch {}
    if (!end || end < Date.now()) {
      end = Date.now() + minutes * 60_000;
      try {
        sessionStorage.setItem(key, String(end));
      } catch {}
    }
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [minutes, vm.t.id]);
  const s = Math.floor(left / 1000);
  const cells: [number, string][] = [
    [Math.floor(s / 3600), vm.u.hours],
    [Math.floor((s % 3600) / 60), vm.u.minutes],
    [s % 60, vm.u.seconds],
  ];
  return (
    <div className={cx("countdown", small && "small")} dir="ltr">
      {cells.map(([v, l], i) => (
        <div className={cx("cell")} key={i}>
          <b suppressHydrationWarning>{String(v).padStart(2, "0")}</b>
          <small>{l}</small>
        </div>
      ))}
    </div>
  );
}

// ─── Galerie à vignettes ───
export function ThumbGallery({ vm }: { vm: VM }) {
  const [i, setI] = useState(0);
  const imgs = vm.images.slice(0, 6);
  return (
    <div>
      <Stage src={imgs[i] || imgs[0]} alt={vm.name} />
      {imgs.length > 1 && (
        <div className={cx("thumbs")}>
          {imgs.map((src, k) => (
            <button
              type="button"
              key={k}
              className={k === i ? cx("on") : ""}
              onClick={() => setI(k)}
              aria-label={`Image ${k + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vidéo (YouTube, Vimeo ou fichier vidéo) ───
function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return "";
}
export function VideoFrame({ vm }: { vm: VM }) {
  const [playing, setPlaying] = useState(false);
  const url = vm.videoUrl;
  const embed = url ? embedUrl(url) : "";
  if (playing && url) {
    return (
      <div className={cx("video-frame")}>
        {embed ? (
          <iframe
            src={embed}
            title={vm.name}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
    );
  }
  return (
    <div className={cx("video-frame")}>
      <img src={vm.images[0]} alt={vm.name} />
      <button type="button" className={cx("play")} aria-label="Lire la vidéo" onClick={() => url && setPlaying(true)} />
    </div>
  );
}

// ─── Offres groupées ───
export function OfferPicker({ vm, qty, setQty }: { vm: VM; qty: number; setQty: (q: number) => void }) {
  const unit = vm.offers.find((o) => o.qty === 1)?.price || vm.price;
  return (
    <div className={cx("bundles")} style={{ ["--n" as string]: Math.min(vm.offers.length, 4) }}>
      {vm.offers.map((o) => (
        <button
          type="button"
          key={o.qty + o.label}
          className={cx("bundle", o.qty === qty && "on")}
          onClick={() => {
            setQty(o.qty);
            scrollToOrder();
          }}
        >
          {o.badge ? <span className={cx("ribbon")}>{o.badge}</span> : null}
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>{o.label}</h3>
          <div className={cx("bp")}>{formatPrice(o.price, vm.currency)}</div>
          {o.qty > 1 && unit * o.qty > o.price ? (
            <div className={cx("unit")}>
              {formatPrice(Math.round(o.price / o.qty), vm.currency)} / u ·{" "}
              <span style={{ color: "#16a34a", fontWeight: 700 }}>
                {vm.u.save} {formatPrice(unit * o.qty - o.price, vm.currency)}
              </span>
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}

// ─── Variantes ───
export function VariantPicker({
  vm,
  variant,
  setVariant,
}: {
  vm: VM;
  variant: number;
  setVariant: (i: number) => void;
}) {
  return (
    <div className={cx("variant-picker")}>
      {vm.variants.map((v, i) => (
        <button type="button" key={v.name + i} className={i === variant ? cx("on") : ""} onClick={() => setVariant(i)}>
          {v.color ? <span className={cx("dot")} style={{ background: v.color }} /> : null}
          <span style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</span>
        </button>
      ))}
    </div>
  );
}

const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Témara",
  "Safi",
  "Mohammedia",
  "El Jadida",
  "Béni Mellal",
  "Nador",
  "Khouribga",
  "Settat",
  "Laâyoune",
];

// ─── Formulaire COD ───
export function OrderForm({
  vm,
  qty,
  setQty,
  variant,
  setVariant,
  preview,
  onSubmit,
}: {
  vm: VM;
  qty: number;
  setQty: (q: number) => void;
  variant: number;
  setVariant: (i: number) => void;
  preview: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, qty: number) => void;
}) {
  const u = vm.u;
  const sel = vm.offers.find((o) => o.qty === qty) || vm.offers[0];
  const total = (sel?.price ?? vm.price * qty) + vm.shipping;
  const variantName = vm.variants[variant]?.name;
  const extra = `– ${sel?.label || qty}${variantName ? ` – ${variantName}` : ""} – ${formatPrice(total, vm.currency)}`;
  const waOnly = vm.orderMode === "whatsapp";
  return (
    <form
      className={cx("order")}
      onSubmit={(e) => {
        if (preview || waOnly) {
          e.preventDefault();
          return;
        }
        onSubmit?.(e, qty);
      }}
    >
      <div className={cx("head")}>
        <Stage src={vm.images[0]} alt={vm.name} />
        <div>
          <strong style={{ display: "block", fontSize: 17 }}>{vm.name}</strong>
          <span className={cx("accent")} style={{ fontWeight: 800, fontSize: 20 }}>
            {formatPrice(total, vm.currency)}
          </span>
        </div>
      </div>

      {vm.offers.length > 1 && (
        <div className={cx("order-opts")}>
          {vm.offers.map((o) => (
            <label key={o.qty + o.label} className={cx("order-opt", o.qty === qty && "on")}>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="radio" name="offer" checked={o.qty === qty} onChange={() => setQty(o.qty)} />
                <span>
                  <b>{o.label}</b>{" "}
                  {o.badge ? (
                    <span className={cx("badge")} style={{ padding: "2px 8px", fontSize: 11 }}>
                      {o.badge}
                    </span>
                  ) : null}
                </span>
              </span>
              <b>{formatPrice(o.price, vm.currency)}</b>
            </label>
          ))}
        </div>
      )}

      {vm.variants.length > 0 && (
        <label className={cx("field")}>
          <span>{u.variants}</span>
          <select name="variant" value={variant} onChange={(e) => setVariant(Number(e.target.value))}>
            {vm.variants.map((v, i) => (
              <option key={v.name + i} value={i}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {!waOnly && (
        <>
          <label className={cx("field")}>
            <span>{u.form.name}</span>
            <input name="name" required={!preview} minLength={2} autoComplete="name" />
          </label>
          <label className={cx("field")}>
            <span>{u.form.phone}</span>
            <input
              name="phone"
              required={!preview}
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="06 XX XX XX XX"
              autoComplete="tel"
            />
          </label>
          <label className={cx("field")}>
            <span>{u.form.city}</span>
            <input name="city" required={!preview} list="lpx-cities" autoComplete="address-level2" />
          </label>
          <datalist id="lpx-cities">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {vm.show.address && (
            <label className={cx("field")}>
              <span>{u.form.address}</span>
              <input name="address" autoComplete="street-address" />
            </label>
          )}
        </>
      )}

      {vm.shipping > 0 && (
        <div className={cx("muted")} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span>{vm.lang === "ar" ? "التوصيل" : "Livraison"}</span>
          <span>{formatPrice(vm.shipping, vm.currency)}</span>
        </div>
      )}
      <div className={cx("total")}>
        <span>{u.form.total}</span>
        <span className={cx("accent")}>{formatPrice(total, vm.currency)}</span>
      </div>

      {!waOnly && (
        <button className={cx("btn block lg pulse")} type={preview ? "button" : "submit"}>
          {vm.cta || u.form.submit}
        </button>
      )}
      {vm.orderMode !== "form" && (
        <a
          className={cx("btn wa block lg")}
          style={{ marginTop: 10 }}
          href={preview ? undefined : waHref(vm, extra)}
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 {u.orderWhatsapp}
        </a>
      )}
      <p className={cx("muted center")} style={{ fontSize: 13, margin: "12px 0 0" }}>
        🔒 {vm.delivery}
      </p>
    </form>
  );
}
