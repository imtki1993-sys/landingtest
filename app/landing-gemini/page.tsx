"use client";
// Landing Gemini : 1) photos + infos du produit, 2) analyse par Gemini (à valider), 3) textes + photos de mise en
// scène générés, landing créée et ouverte dans l'éditeur habituel. Le générateur d'origine (/pages) reste inchangé.
import React, { useState } from "react";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { uploadImages } from "../../lib/builder-images";
import { LANDING_TEMPLATE_PRESETS } from "../../lib/landing-template-presets";
import type { ProductAnalysis } from "../../lib/gemini-landing";
import GeminiLanding from "../../components/public/GeminiLanding";

const LANGS: [string, string][] = [
  ["ar-MA", "Darija"],
  ["fr-MA", "Français"],
];
const SHOTS = [0, 2, 4];
const ANALYSIS_LISTS: [keyof ProductAnalysis, string, string][] = [
  ["features", "Caractéristiques réelles", "Une par ligne. Supprime ce qui est faux : la landing ne promettra que ça."],
  ["use_cases", "Utilisations", "Une par ligne."],
  ["objections", "Hésitations des clients", "La landing y répond (FAQ, garanties fournies, livraison)."],
  ["avoid", "À ne jamais promettre", "Une par ligne."],
];

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  const x = await r?.json().catch(() => ({}));
  if (!r?.ok) throw new Error(x?.error || "Erreur, réessaie.");
  return x;
}

export default function LandingGeminiPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("149");
  const [oldPrice, setOldPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [language, setLanguage] = useState("ar-MA");
  const [templateId, setTemplateId] = useState("cod-direct");
  const [shots, setShots] = useState(2);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  // design complet par Gemini (HTML/CSS) : aperçu, publication
  const [design, setDesign] = useState<any>(null);
  const [view, setView] = useState<"mobile" | "desktop">("mobile");
  const [published, setPublished] = useState("");

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy("upload");
    setError("");
    try {
      const urls = await uploadImages(Array.from(files), 10 - images.length);
      setImages((a) => [...a, ...urls].slice(0, 10));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  async function analyze(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy("analyze");
    setError("");
    try {
      const x = await post("/api/landing-gemini/analyze", { name, description, images, language });
      setAnalysis(x.analysis);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function generate() {
    if (!analysis) return;
    setBusy("generate");
    setError("");
    try {
      const x = await post("/api/landing-gemini/generate", {
        name,
        price: Number(price) || 0,
        oldPrice: Number(oldPrice) || null,
        description,
        images,
        language,
        templateId,
        imageCount: shots,
        analysis,
      });
      setResult(x);
      setStep(3);
      await makeDesign(x.page.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  /** Gemini dessine toute la page (mise en page, couleurs, typo, sections). */
  async function makeDesign(pageId: string) {
    setBusy("design");
    setError("");
    setPublished("");
    try {
      setDesign(await post("/api/landing-gemini/design", { pageId }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function publish() {
    if (!design || !result) return;
    setBusy("publish");
    setError("");
    try {
      const r = await fetch("/api/pages/" + result.page.id, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "PUBLISHED",
          name,
          content: design.content,
          images: design.images,
          price: design.price,
          oldPrice: design.oldPrice,
        }),
      });
      const x = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(x.error || "Publication impossible");
      setPublished("/landing/" + (x.slug || design.slug));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const setList = (k: keyof ProductAnalysis, v: string) =>
    setAnalysis((a) => (a ? { ...a, [k]: v.split("\n").map((x) => x.trimStart()) } : a));
  const setField = (k: keyof ProductAnalysis, v: string) => setAnalysis((a) => (a ? { ...a, [k]: v } : a));
  const cleanForSend = () =>
    setAnalysis((a) =>
      a
        ? (Object.fromEntries(
            Object.entries(a).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => x.trim()).filter(Boolean) : v]),
          ) as unknown as ProductAnalysis)
        : a,
    );

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content lg-page">
        <header className="dash-header">
          <div>
            <span className="eyebrow">LANDING GEMINI</span>
            <h1>Landing page avec Gemini</h1>
            <p>
              Gemini analyse tes photos, écrit la page en darija, crée les photos de mise en scène et dessine toute la
              page, de A à Z.
            </p>
          </div>
        </header>

        <ol className="lg-steps" aria-label="Étapes">
          {["Le produit", "L’analyse", "La landing"].map((l, i) => (
            <li key={l} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}>
              <i>{i + 1}</i> {l}
            </li>
          ))}
        </ol>

        {error ? <div className="dash-error lg-error">{error}</div> : null}

        {step === 1 ? (
          <form className="lg-card" onSubmit={analyze}>
            <div className="lg-photos">
              <span>Photos du produit (1 à 10) : le produit, ses détails, l’emballage</span>
              <div>
                {images.map((u, i) => (
                  <figure key={u}>
                    <img src={u} alt={`Photo ${i + 1}`} />
                    <button
                      type="button"
                      aria-label={`Retirer la photo ${i + 1}`}
                      onClick={() => setImages((a) => a.filter((x) => x !== u))}
                    >
                      ×
                    </button>
                  </figure>
                ))}
                {images.length < 10 ? (
                  <label className="lg-add">
                    {busy === "upload" ? "Envoi…" : "+ Ajouter"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => addPhotos(e.target.files)}
                    />
                  </label>
                ) : null}
              </div>
            </div>
            <label>
              Nom du produit
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex. Support S11" />
            </label>
            <div className="lg-row">
              <label>
                Prix (DH)
                <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </label>
              <label>
                Prix barré (DH)
                <input inputMode="decimal" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
              </label>
            </div>
            <label>
              Ce que tu sais du produit <small>(facultatif mais conseillé)</small>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Caractéristiques réelles, ce qu’il y a dans la boîte, garanties que tu offres…"
              />
            </label>
            <div className="lg-row">
              <fieldset>
                <legend>Langue de la page</legend>
                <div className="lg-seg">
                  {LANGS.map(([k, l]) => (
                    <button type="button" key={k} className={language === k ? "on" : ""} onClick={() => setLanguage(k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Photos de mise en scène par Gemini</legend>
                <div className="lg-seg">
                  {SHOTS.map((n) => (
                    <button type="button" key={n} className={shots === n ? "on" : ""} onClick={() => setShots(n)}>
                      {n ? n : "Aucune"}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <label>
              Modèle de page
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {LANDING_TEMPLATE_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.category}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="lg-primary" disabled={!!busy || !name.trim() || !images.length}>
              {busy === "analyze" ? "Gemini analyse tes photos…" : "Analyser le produit"}
            </button>
          </form>
        ) : null}

        {step === 2 && analysis ? (
          <section className="lg-card">
            <h2>Vérifie la fiche avant de générer</h2>
            <p className="lg-hint">
              Gemini a regardé tes photos. Corrige ce qui est faux : la page ne dira que ce qui est écrit ici.
            </p>
            <div className="lg-row">
              <label>
                Type de produit
                <input value={analysis.product_type} onChange={(e) => setField("product_type", e.target.value)} />
              </label>
              <label>
                Niche
                <input value={analysis.niche} onChange={(e) => setField("niche", e.target.value)} />
              </label>
            </div>
            <label>
              Clients visés
              <input value={analysis.audience} onChange={(e) => setField("audience", e.target.value)} />
            </label>
            <label>
              Angle de vente
              <input value={analysis.angle} onChange={(e) => setField("angle", e.target.value)} />
            </label>
            {ANALYSIS_LISTS.map(([k, label, help]) => (
              <label key={k}>
                {label} <small>{help}</small>
                <textarea
                  rows={Math.min(6, Math.max(2, (analysis[k] as string[]).length))}
                  value={(analysis[k] as string[]).join("\n")}
                  onChange={(e) => setList(k, e.target.value)}
                  onBlur={cleanForSend}
                />
              </label>
            ))}
            <div className="lg-actions">
              <button type="button" className="lg-ghost" disabled={!!busy} onClick={() => setStep(1)}>
                Retour
              </button>
              <button type="button" className="lg-primary" disabled={!!busy} onClick={generate}>
                {busy === "generate"
                  ? `Gemini écrit la page${shots ? ` et crée ${shots} photos` : ""}… (1 à 2 min)`
                  : "Générer la landing page"}
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 && result ? (
          <section className="lg-card">
            <h2>{design ? "Ta landing dessinée par Gemini" : "Gemini dessine ta page…"}</h2>
            {busy === "design" ? (
              <p className="lg-hint">
                Gemini crée la mise en page, les couleurs, la typo et toutes les sections (1 à 3 min). Ne ferme pas la
                page.
              </p>
            ) : null}
            {result.imageErrors?.length || result.imagesSkipped ? (
              <p className="lg-warn">
                {result.imagesSkipped
                  ? "Limite de photos Gemini du jour atteinte : la page utilise tes photos. "
                  : `${result.imageErrors.length} photo(s) n’ont pas pu être créées : ${result.imageErrors[0]}`}
              </p>
            ) : null}
            {design ? (
              <>
                <div className="lg-seg lg-view" role="tablist" aria-label="Aperçu">
                  {(["mobile", "desktop"] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      role="tab"
                      aria-selected={view === v}
                      className={view === v ? "on" : ""}
                      onClick={() => setView(v)}
                    >
                      {v === "mobile" ? "Téléphone" : "Ordinateur"}
                    </button>
                  ))}
                </div>
                <div className={"lg-preview lg-preview-" + view}>
                  <GeminiLanding html={design.html} title="Aperçu" />
                </div>
                <p className="lg-hint">
                  Le formulaire de l’aperçu n’envoie rien. Une fois publiée, chaque commande arrive dans Commandes
                  (Pixel et API Conversions compris). Vérifie les photos : le produit doit être identique au vrai.
                </p>
                {published ? (
                  <p className="lg-ok">
                    Page publiée :{" "}
                    <a href={published} target="_blank" rel="noreferrer">
                      {typeof window !== "undefined" ? window.location.origin : ""}
                      {published}
                    </a>
                  </p>
                ) : null}
              </>
            ) : null}
            <div className="lg-actions">
              <button
                type="button"
                className="lg-ghost"
                disabled={!!busy}
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setDesign(null);
                  setPublished("");
                  setAnalysis(null);
                  setName("");
                  setImages([]);
                  setDescription("");
                  setOldPrice("");
                }}
              >
                Créer une autre landing
              </button>
              <div className="lg-actions-right">
                <button type="button" className="lg-ghost" disabled={!!busy} onClick={() => makeDesign(result.page.id)}>
                  {busy === "design" ? "Dessin en cours…" : design ? "Redessiner" : "Relancer le dessin"}
                </button>
                <a className="lg-ghost" href={`/pages?edit=${result.page.id}`} title="Version modèle LandPro">
                  Éditeur classique
                </a>
                <button type="button" className="lg-primary" disabled={!!busy || !design} onClick={publish}>
                  {busy === "publish" ? "Publication…" : published ? "Republier" : "Publier la page"}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
