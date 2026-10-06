"use client";
// Champs réutilisables de l'éditeur des templates de boutique.
import React, { useState } from "react";
import type { SxItem } from "../../../lib/store-templates";
import "./editor.css";

/** Téléverse une image dans le stockage de la boutique et renvoie son URL publique. */
export async function uploadStoreImage(storeId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("storeId", storeId);
  form.append("file", file);
  const r = await fetch("/api/store-media", { method: "POST", body: form });
  const x = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(x.error || "Téléversement impossible");
  return String(x.url);
}

export function productImages(products: any[]): string[] {
  return Array.from(
    new Set((products || []).flatMap((p) => (Array.isArray(p?.image_urls) ? p.image_urls : p?.image ? [p.image] : []))),
  ).filter(Boolean) as string[];
}

export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="sxe-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** Image : téléverser, choisir parmi les photos produits, ou retirer (photo produit automatique). */
export function ImagePicker({
  label,
  value,
  onChange,
  storeId,
  products,
  hint = "Vide = une photo de tes produits est utilisée",
}: {
  label: string;
  value: string | undefined;
  onChange: (url: string) => void;
  storeId: string;
  products: any[];
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [browse, setBrowse] = useState(false);
  const imgs = productImages(products);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadStoreImage(storeId, file));
    } catch (err: any) {
      alert(err?.message || "Téléversement impossible");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sxe-image">
      <span className="sxe-label">{label}</span>
      <div className="sxe-image-row">
        <div className="sxe-thumb">{value ? <img src={value} alt="" /> : <small>Auto</small>}</div>
        <div className="sxe-image-actions">
          <label className="sxe-btn">
            {busy ? "Envoi…" : "Téléverser"}
            <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
          </label>
          {imgs.length > 0 && (
            <button type="button" className="sxe-btn" onClick={() => setBrowse((v) => !v)}>
              Photos produits
            </button>
          )}
          {value && (
            <button type="button" className="sxe-btn sxe-btn-danger" onClick={() => onChange("")}>
              Retirer
            </button>
          )}
        </div>
      </div>
      {!value && hint && <small className="sxe-hint">{hint}</small>}
      {browse && (
        <div className="sxe-pick-grid">
          {imgs.slice(0, 40).map((src) => (
            <button
              type="button"
              key={src}
              className={src === value ? "active" : ""}
              onClick={() => {
                onChange(src);
                setBrowse(false);
              }}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Liste d'éléments (garanties, chiffres, bannières, avis…). */
export function ItemsEditor({
  items,
  onChange,
  withValue = false,
  valueLabel = "Valeur",
  withImage = false,
  storeId,
  products,
  addLabel = "+ Ajouter un élément",
}: {
  items: SxItem[];
  onChange: (items: SxItem[]) => void;
  withValue?: boolean;
  valueLabel?: string;
  withImage?: boolean;
  storeId?: string;
  products?: any[];
  addLabel?: string;
}) {
  const set = (i: number, v: Partial<SxItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...v } : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const a = [...items];
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  return (
    <div className="sxe-items">
      {items.map((x, i) => (
        <div key={i} className="sxe-item">
          <div className="sxe-item-head">
            <b>Élément {i + 1}</b>
            <span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre">
                ↓
              </button>
              <button
                type="button"
                className="sxe-danger"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label="Supprimer"
              >
                ×
              </button>
            </span>
          </div>
          {withValue && <TextField label={valueLabel} value={x.value} onChange={(v) => set(i, { value: v })} />}
          <TextField label="Titre" value={x.title} onChange={(v) => set(i, { title: v })} />
          <TextField label="Texte" value={x.text} onChange={(v) => set(i, { text: v })} />
          {withImage && storeId && (
            <ImagePicker
              label="Image"
              value={x.image}
              onChange={(v) => set(i, { image: v })}
              storeId={storeId}
              products={products || []}
            />
          )}
        </div>
      ))}
      <button type="button" className="sxe-add" onClick={() => onChange([...items, { title: "", text: "" }])}>
        {addLabel}
      </button>
    </div>
  );
}

/** Choix parmi une liste de variantes, sous forme de boutons. */
export function ChoiceField({
  label,
  value,
  choices,
  onChange,
  defaultValue,
}: {
  label: string;
  value: string;
  choices: [string, string][];
  onChange: (v: string) => void;
  /** valeur du template d'origine, signalée par « (template) » */
  defaultValue?: string;
}) {
  return (
    <div className="sxe-choice">
      <span className="sxe-label">{label}</span>
      <div>
        {choices.map(([v, l]) => (
          <button key={v} type="button" className={v === value ? "active" : ""} onClick={() => onChange(v)}>
            {l}
            {v === defaultValue ? " ★" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
