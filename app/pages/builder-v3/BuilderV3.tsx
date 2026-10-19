"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BUILDER_BREAKPOINTS, createBuilderV3 } from "../../../lib/builder-v3";
import { uploadImages } from "../../../lib/builder-images";
import LandingClient from "../../landing/[slug]/LandingClient";
import { LANDPRO_SECTIONS } from "../../../components/landpro/types";
import { SECTION_LABELS } from "../../../components/landpro/registry";
import LandproSectionEditor, { LandproTemplatePanel } from "./LandproSectionEditor";
import { SectionStylePanel, ThemePanel } from "./StylePanels";
const BUILTIN_ADDABLE: string[] = ["benefits", "problem", "features", "how", "trust", "faq", ...LANDPRO_SECTIONS];
const library = ["text", "imageText", "gallery", "ctaBlock", "vertical916", ...BUILTIN_ADDABLE];
const labels: any = {
  ...SECTION_LABELS,
  hero: "Hero",
  order: "Formulaire COD",
  benefits: "Bénéfices",
  problem: "Problème / Solution",
  features: "Caractéristiques",
  how: "Comment ça marche",
  trust: "Confiance",
  faq: "FAQ",
  text: "Texte",
  imageText: "Image + Texte",
  gallery: "Galerie",
  ctaBlock: "CTA",
  vertical916: "Média / Vidéo",
};
export default function BuilderV3({
  draft,
  editing,
  onChange,
  onSave,
  onClose,
  saveNotice,
}: {
  draft: any;
  editing: any;
  onChange: (v: any) => void;
  onSave: (publish: boolean) => void;
  onClose: () => void;
  saveNotice?: string;
}) {
  const [selected, setSelected] = useState("hero"),
    [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop"),
    [showLibrary, setShowLibrary] = useState(false),
    [history, setHistory] = useState<any[]>([]),
    [future, setFuture] = useState<any[]>([]),
    [uploading, setUploading] = useState(false),
    [settingsTab, setSettingsTab] = useState<"content" | "style" | "theme" | "template">("content"),
    [uiLibrary, setUiLibrary] = useState<any>({ styles: [], patterns: [], colors: [], typography: [] });
  useEffect(() => {
    fetch("/api/uiux-library")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((lib) => {
        setUiLibrary(lib);
        const hasLibrary =
          (draft.uiux_library?.styles || []).length ||
          (draft.uiux_library?.patterns || []).length ||
          (draft.uiux_library?.colors || []).length ||
          (draft.uiux_library?.typography || []).length;
        if (!hasLibrary) onChange({ ...draft, uiux_library: lib });
      })
      .catch(() => {});
  }, []);
  const drag = useRef<string | null>(null);
  const doc = useMemo(() => createBuilderV3(draft), [draft]);
  const ds = draft.design_system || {},
    colors = ds.tokens?.colors || {},
    fonts = ds.tokens?.fonts || {};
  const commit = (next: any) => {
    setHistory((h) => [...h.slice(-29), draft]);
    setFuture([]);
    onChange(next);
  };
  const patch = (k: string, v: any) => commit({ ...draft, [k]: v, builder_v3: { ...doc, viewport } });
  const setOrder = (order: string[]) =>
    commit({
      ...draft,
      section_order: order,
      builder_v3: {
        ...doc,
        blocks: order.map((id) => doc.blocks.find((b) => b.id === id) || { id, type: id, visible: true, props: {} }),
        viewport,
      },
    });
  const move = (from: string, to: string) => {
    if (from === to) return;
    const a = [...(draft.section_order || doc.blocks.map((b) => b.id))],
      i = a.indexOf(from),
      j = a.indexOf(to);
    if (i < 0 || j < 0) return;
    a.splice(j, 0, a.splice(i, 1)[0]);
    setOrder(a);
  };
  const add = (type: string) => {
    const a = [...(draft.section_order || doc.blocks.map((b) => b.id))];
    if (BUILTIN_ADDABLE.includes(type)) {
      if (!a.includes(type)) a.push(type);
      commit({
        ...draft,
        section_order: a,
        hidden_sections: (draft.hidden_sections || []).filter((x: string) => x !== type),
      });
      setSelected(type);
    } else {
      const id = "custom-" + Date.now(),
        defaults: any = {
          text: { type: "text", title: "Nouvelle section", text: "Ajoutez votre contenu ici." },
          imageText: { type: "imageText", title: "Image + Texte", text: "Ajoutez votre contenu ici.", image: "" },
          gallery: { type: "gallery", title: "Galerie", images: [] },
          ctaBlock: {
            type: "ctaBlock",
            title: "Passez votre commande",
            text: "",
            button: draft.cta || "Commander maintenant",
          },
          vertical916: {
            type: "vertical916",
            title: "Média",
            text: "",
            media: "",
            mediaType: "image",
            device: "phone",
          },
        };
      a.push(id);
      commit({
        ...draft,
        section_order: a,
        custom_sections: { ...(draft.custom_sections || {}), [id]: defaults[type] || defaults.text },
      });
      setSelected(id);
    }
    setShowLibrary(false);
  };
  const toggleHidden = (id: string) => {
    const h = new Set<string>(draft.hidden_sections || []);
    if (h.has(id)) h.delete(id);
    else h.add(id);
    commit({ ...draft, hidden_sections: Array.from(h) });
  };
  const remove = (id: string) => {
    if (id === "hero" || id === "order") return;
    commit({ ...draft, section_order: (draft.section_order || []).filter((x: string) => x !== id) });
    setSelected("hero");
  };
  const duplicate = (id: string) => {
    const src = doc.blocks.find((b) => b.id === id);
    if (!src || !id.startsWith("custom-")) return;
    const nid = "custom-" + Date.now();
    commit({
      ...draft,
      section_order: [...(draft.section_order || []), nid],
      custom_sections: {
        ...(draft.custom_sections || {}),
        [nid]: {
          ...(draft.custom_sections?.[id] || {}),
          title: (draft.custom_sections?.[id]?.title || "Section") + " copie",
        },
      },
    });
    setSelected(nid);
  };
  const undo = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [draft, ...f]);
    onChange(prev);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, draft]);
    onChange(next);
  };
  const uploadHeroSpecial = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files, 12);
      if (urls.length) {
        const current = [...(draft.hero_images || [])].filter(Boolean);
        patch("hero_images", Array.from(new Set([...current, ...urls])));
      }
    } catch (e: any) {
      alert(e.message || "Upload Hero impossible");
    } finally {
      setUploading(false);
    }
  };
  const removeHeroSpecial = (i: number) => {
    const imgs = [...(draft.hero_images || [])];
    imgs.splice(i, 1);
    patch("hero_images", imgs);
  };
  const setHeroSpecialMain = (i: number) => {
    const imgs = [...(draft.hero_images || [])];
    if (!imgs[i]) return;
    const [x] = imgs.splice(i, 1);
    imgs.unshift(x);
    patch("hero_images", imgs);
  };
  const uploadHero = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files, 12);
      if (urls.length) {
        const current = [...(draft.images || draft.product_images || [])].filter(Boolean);
        patch("images", Array.from(new Set([...current, ...urls])));
      }
    } catch (e: any) {
      alert(e.message || "Upload impossible");
    } finally {
      setUploading(false);
    }
  };
  const uploadCustom = async (id: string, files: File[], mode: "single" | "gallery" | "media") => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files, mode === "gallery" ? 12 : 1);
      if (!urls.length) return;
      const b = draft.custom_sections?.[id] || {};
      const update =
        mode === "gallery"
          ? { images: [...(b.images || []), ...urls] }
          : mode === "media"
            ? { media: urls[0], mediaType: files[0]?.type.startsWith("video/") ? "video" : "image" }
            : { image: urls[0] };
      commit({ ...draft, custom_sections: { ...(draft.custom_sections || {}), [id]: { ...b, ...update } } });
    } catch (e: any) {
      alert(e.message || "Upload impossible");
    } finally {
      setUploading(false);
    }
  };
  const removeGalleryImage = (id: string, i: number) => {
    const b = draft.custom_sections?.[id] || {},
      images = [...(b.images || [])];
    images.splice(i, 1);
    commit({ ...draft, custom_sections: { ...(draft.custom_sections || {}), [id]: { ...b, images } } });
  };
  const setMainImage = (i: number) => {
    const imgs = [...(draft.images || draft.product_images || [])];
    if (!imgs[i]) return;
    const [x] = imgs.splice(i, 1);
    imgs.unshift(x);
    patch("images", imgs);
  };
  const removeImage = (i: number) => {
    const imgs = [...(draft.images || draft.product_images || [])];
    imgs.splice(i, 1);
    patch("images", imgs);
  };
  const blocks = doc.blocks;
  const list = (key: string) => (Array.isArray(draft[key]) ? draft[key] : []);
  const cards = (key: string) => (
    <div className="bv3-cards">
      {list(key).map((x: any, i: number) => (
        <article key={i}>
          <b>{typeof x === "string" ? x : x?.title || x?.question || ""}</b>
          {typeof x !== "string" && x?.text && <p>{x.text}</p>}
        </article>
      ))}
    </div>
  );
  const render = (id: string) => {
    if (id === "hero")
      return (
        <section className="bv3-hero">
          <div className="bv3-hero-copy">
            <span className="bv3-kicker">COD MAROC</span>
            <h1>{draft.headline || editing?.name}</h1>
            <p>{draft.subheadline}</p>
            <div className="bv3-price">
              <strong>{draft.price || 0} DH</strong>
              {draft.oldPrice && <s>{draft.oldPrice} DH</s>}
            </div>
            <button>{draft.cta || "Commander maintenant"}</button>
          </div>
          <div className="bv3-hero-media">
            {(draft.images || draft.product_images || [])[0] ? (
              <img src={(draft.images || draft.product_images)[0]} alt="" />
            ) : (
              <span>Image produit</span>
            )}
          </div>
        </section>
      );
    if (id === "order")
      return (
        <section className="bv3-order">
          <div>
            <span className="bv3-kicker">COMMANDE</span>
            <h2>{draft.order_title || "Commandez maintenant"}</h2>
            <p>{draft.delivery || "Paiement à la livraison"}</p>
          </div>
          <div className="bv3-order-card">
            <input placeholder="Nom complet" />
            <input placeholder="Téléphone" />
            <input placeholder="Ville" />
            {draft.order_show_address !== false && <input placeholder="Adresse" />}
            <div className="bv3-total">
              <span>Total</span>
              <b>{Number(draft.price || 0) + Number(draft.delivery_price || 0)} DH</b>
            </div>
            <button>{draft.cta || "Commander maintenant"}</button>
          </div>
        </section>
      );
    if (id === "problem")
      return (
        <section className="bv3-split">
          <div>
            <span className="bv3-kicker">PROBLÈME</span>
            <h2>{draft.problem_title || ""}</h2>
            <p>{draft.problem}</p>
          </div>
          <div className="bv3-solution">
            <span className="bv3-kicker">SOLUTION</span>
            <p>{draft.solution}</p>
          </div>
        </section>
      );
    if (id === "benefits")
      return (
        <section>
          <span className="bv3-kicker">BÉNÉFICES</span>
          <h2>{draft.benefits_title || ""}</h2>
          <p>{draft.description}</p>
          {cards("benefits")}
        </section>
      );
    if (id === "features")
      return (
        <section>
          <span className="bv3-kicker">CARACTÉRISTIQUES</span>
          <h2>{draft.features_title || ""}</h2>
          {cards("features")}
        </section>
      );
    if (id === "how")
      return (
        <section>
          <span className="bv3-kicker">ÉTAPES</span>
          <h2>{draft.how_title || ""}</h2>
          <div className="bv3-steps">
            {list("how_steps").map((x: string, i: number) => (
              <article key={i}>
                <strong>{String(i + 1).padStart(2, "0")}</strong>
                <p>{x}</p>
              </article>
            ))}
          </div>
        </section>
      );
    if (id === "trust")
      return (
        <section>
          <span className="bv3-kicker">CONFIANCE</span>
          <h2>{draft.trust_title || ""}</h2>
          {cards("trust_points")}
        </section>
      );
    if (id === "faq")
      return (
        <section>
          <span className="bv3-kicker">FAQ</span>
          <h2>{draft.faq_title || ""}</h2>
          <div className="bv3-faq">
            {list("faq").map((x: any, i: number) => (
              <details key={i}>
                <summary>{typeof x === "string" ? x : x.question}</summary>
                {typeof x !== "string" && <p>{x.answer}</p>}
              </details>
            ))}
          </div>
        </section>
      );
    if (id.startsWith("custom-")) {
      const b = draft.custom_sections?.[id] || {};
      if (b.type === "imageText")
        return (
          <section className="bv3-split">
            <div>
              {b.image ? (
                <img className="bv3-custom-img" src={b.image} alt="" />
              ) : (
                <div className="bv3-media-empty">Image</div>
              )}
            </div>
            <div>
              <h2>{b.title}</h2>
              <p>{b.text}</p>
            </div>
          </section>
        );
      if (b.type === "gallery")
        return (
          <section>
            <h2>{b.title}</h2>
            <div className="bv3-gallery">
              {(b.images || []).map((x: string, i: number) => (
                <img src={x} key={i} alt="" />
              ))}
            </div>
          </section>
        );
      if (b.type === "ctaBlock")
        return (
          <section className="bv3-cta">
            <h2>{b.title}</h2>
            <p>{b.text}</p>
            <button>{b.button}</button>
          </section>
        );
      if (b.type === "vertical916")
        return (
          <section>
            <h2>{b.title}</h2>
            <div className="bv3-device">
              {b.media ? (
                b.mediaType === "video" ? (
                  <video src={b.media} controls playsInline />
                ) : (
                  <img src={b.media} alt="" />
                )
              ) : (
                <span>Média</span>
              )}
            </div>
            <p>{b.text}</p>
          </section>
        );
      return (
        <section>
          <h2>{b.title}</h2>
          <p>{b.text}</p>
        </section>
      );
    }
    return (
      <section>
        <h2>{labels[id] || id}</h2>
      </section>
    );
  };
  return (
    <div className="bv3">
      <header className="bv3-top">
        <div>
          <b>LandPro Builder V3</b>
          <small>UI/UX Pro Max · WYSIWYG</small>
        </div>
        <div className="bv3-view">
          <button disabled={!history.length} onClick={undo}>
            ↶
          </button>
          <button disabled={!future.length} onClick={redo}>
            ↷
          </button>
          <button onClick={() => setViewport("desktop")}>Desktop</button>
          <button onClick={() => setViewport("tablet")}>Tablet</button>
          <button onClick={() => setViewport("mobile")}>Mobile</button>
        </div>
        <div>
          {saveNotice && <span className="bv3-save-notice">{saveNotice}</span>}
          <button onClick={onClose}>Fermer</button>
          <button onClick={() => onSave(false)}>Enregistrer</button>
          <button className="primary" onClick={() => onSave(true)}>
            Publier
          </button>
        </div>
      </header>
      <div className="bv3-body">
        <aside className="bv3-left">
          <h3>Structure</h3>
          {blocks.map((b) => (
            <div
              className={"bv3-structure-row" + (b.visible ? "" : " is-hidden")}
              style={b.visible ? undefined : { opacity: 0.55 }}
              draggable
              onDragStart={() => (drag.current = b.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (drag.current) move(drag.current, b.id);
                drag.current = null;
              }}
              key={b.id}
            >
              <span>⋮⋮</span>
              <button className={selected === b.id ? "active" : ""} onClick={() => setSelected(b.id)}>
                {labels[b.id] || labels[b.type] || b.type}
              </button>
              {b.id !== "hero" && (
                <button
                  title={b.visible ? "Masquer la section" : "Afficher la section"}
                  onClick={() => toggleHidden(b.id)}
                >
                  {b.visible ? "👁" : "⊘"}
                </button>
              )}
              {b.id.startsWith("custom-") && (
                <button title="Dupliquer" onClick={() => duplicate(b.id)}>
                  ⧉
                </button>
              )}
              {b.id !== "hero" && b.id !== "order" && (
                <button title="Supprimer" onClick={() => remove(b.id)}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button className="bv3-add" onClick={() => setShowLibrary((v) => !v)}>
            + Ajouter une section
          </button>
          {showLibrary && (
            <div className="bv3-library">
              {library
                .filter((id) => !BUILTIN_ADDABLE.includes(id) || !(draft.section_order || []).includes(id))
                .map((id) => (
                  <button key={id} onClick={() => add(id)}>
                    + {labels[id]}
                  </button>
                ))}
            </div>
          )}
        </aside>
        <main className={"bv3-stage " + viewport}>
          <div className="bv3-device-label">
            {viewport === "desktop" ? "PC · 1440 px" : viewport === "tablet" ? "Tablette · 768 px" : "Mobile · 390 px"}
          </div>
          <div className="bv3-device-scroll">
            <div
              className="bv3-device-frame"
              data-device-width={viewport}
              style={{ width: `${BUILDER_BREAKPOINTS[viewport]}px` }}
            >
              <div className="bv3-runtime-preview">
                <LandingClient
                  builderMode
                  viewportMode={viewport}
                  onSectionSelect={setSelected}
                  initialSlug={editing?.slug || "builder-preview"}
                  initialData={{
                    id: editing?.id || "builder-v3-preview",
                    name: editing?.name || draft.headline || "Produit",
                    slug: editing?.slug || "builder-preview",
                    locale: editing?.locale || "ar-MA",
                    price: Number(draft.price || 0),
                    oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
                    images: draft.images || draft.product_images || [],
                    content: { ...draft, uiux_library: uiLibrary, design_system: { ...(draft.design_system || {}) } },
                    whatsappPhone: editing?.whatsappPhone || editing?.whatsapp_phone || null,
                    metaPixelId: null,
                  }}
                />
              </div>
            </div>
          </div>
        </main>
        <aside className="bv3-right">
          <h3>Propriétés · {labels[selected] || selected}</h3>
          <div className="bv3-settings-tabs" role="tablist">
            {(
              [
                ["content", "Contenu"],
                ["style", "Style"],
                ["theme", "Thème"],
                ["template", "Template"],
              ] as const
            ).map(([id, name]) => (
              <button
                key={id}
                role="tab"
                aria-selected={settingsTab === id}
                className={settingsTab === id ? "active" : ""}
                onClick={() => setSettingsTab(id)}
              >
                {name}
              </button>
            ))}
          </div>
          {settingsTab === "template" && (
            <div className="bv3-template-panel">
              <LandproTemplatePanel draft={draft} commit={commit} patch={patch} />
            </div>
          )}
          {settingsTab === "theme" && <ThemePanel draft={draft} patch={patch} commit={commit} viewport={viewport} />}
          {settingsTab === "style" && (
            <SectionStylePanel
              draft={draft}
              selected={selected}
              sectionLabel={labels[selected] || (selected.startsWith("custom-") ? "Bloc personnalisé" : selected)}
              patch={patch}
              viewport={viewport}
            />
          )}
          <div style={{ display: settingsTab === "content" ? "contents" : "none" }}>
            {selected === "hero" && (
              <>
                <label>
                  Titre
                  <input value={draft.headline || ""} onChange={(e) => patch("headline", e.target.value)} />
                </label>
                <label>
                  Sous-titre
                  <textarea value={draft.subheadline || ""} onChange={(e) => patch("subheadline", e.target.value)} />
                </label>
                <label>
                  Prix
                  <input type="number" value={draft.price || ""} onChange={(e) => patch("price", e.target.value)} />
                </label>
                <label>
                  Ancien prix
                  <input
                    type="number"
                    value={draft.oldPrice || ""}
                    onChange={(e) => patch("oldPrice", e.target.value)}
                  />
                </label>
                <label>
                  CTA <small>boutons qui mènent au formulaire</small>
                  <input value={draft.cta || ""} onChange={(e) => patch("cta", e.target.value)} />
                </label>
                <label>
                  Bouton du formulaire <small>celui qui envoie la commande</small>
                  <input
                    value={draft.form_cta || ""}
                    placeholder={draft.cta || "Même texte que le CTA"}
                    onChange={(e) => patch("form_cta", e.target.value)}
                  />
                </label>
                <label>
                  Image principale
                  <input
                    value={(draft.images || draft.product_images || [])[0] || ""}
                    placeholder="URL image"
                    onChange={(e) => {
                      const imgs = [...(draft.images || draft.product_images || [])];
                      imgs[0] = e.target.value;
                      patch("images", imgs);
                    }}
                  />
                </label>
                <label className="bv3-upload">
                  Charger depuis ordinateur
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => uploadHero(Array.from(e.target.files || []))}
                  />
                  <span>{uploading ? "Chargement…" : "Choisir plusieurs images"}</span>
                </label>
                <div className="bv3-media-grid">
                  {(draft.images || draft.product_images || []).map((x: string, i: number) => (
                    <div key={x + i} className={i === 0 ? "main" : ""}>
                      <img src={x} alt="" />
                      <div>
                        <button type="button" onClick={() => setMainImage(i)}>
                          {i === 0 ? "Principale" : "Mettre principale"}
                        </button>
                        <button type="button" onClick={() => removeImage(i)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selected === "hero" && (
              <>
                <label>
                  Texte badge
                  <input
                    value={draft.hero_badge_text || ""}
                    placeholder="الدفع عند الاستلام"
                    onChange={(e) => patch("hero_badge_text", e.target.value)}
                  />
                </label>
                <b className="bv3-sx-sub">Éléments affichés</b>
                <label className="bv3-check">
                  <input
                    type="checkbox"
                    checked={draft.hero_show_subtitle !== false}
                    onChange={(e) => patch("hero_show_subtitle", e.target.checked)}
                  />{" "}
                  Afficher sous-titre
                </label>
                <label className="bv3-check">
                  <input
                    type="checkbox"
                    checked={draft.hero_show_price !== false}
                    onChange={(e) => patch("hero_show_price", e.target.checked)}
                  />{" "}
                  Afficher prix
                </label>
                <label className="bv3-check">
                  <input
                    type="checkbox"
                    checked={draft.hero_show_cta !== false}
                    onChange={(e) => patch("hero_show_cta", e.target.checked)}
                  />{" "}
                  Afficher CTA
                </label>
                <label className="bv3-check">
                  <input
                    type="checkbox"
                    checked={draft.hero_show_badge !== false}
                    onChange={(e) => patch("hero_show_badge", e.target.checked)}
                  />{" "}
                  Afficher badge COD
                </label>
              </>
            )}
            {selected === "order" && (
              <>
                <label>
                  Mode de commande
                  <select value={draft.order_mode || ""} onChange={(e) => patch("order_mode", e.target.value)}>
                    <option value="">Celui du template</option>
                    <option value="form">Formulaire COD</option>
                    <option value="both">Formulaire + WhatsApp</option>
                    <option value="whatsapp">WhatsApp uniquement</option>
                  </select>
                </label>
                <label className="bv3-check">
                  <input
                    type="checkbox"
                    checked={draft.order_show_address !== false}
                    onChange={(e) => patch("order_show_address", e.target.checked)}
                  />{" "}
                  Afficher adresse
                </label>
                <div className="bv3-help">
                  <b>Prix par quantité</b>
                  <br />
                  Ajoutez librement vos offres. Le prix saisi est le prix total de l’offre et sera recalculé côté
                  serveur lors de la commande.
                </div>
                {(() => {
                  const offers = (
                    Array.isArray(draft.quantity_offers) && draft.quantity_offers.length
                      ? draft.quantity_offers
                      : [{ qty: 1, label: "1 pièce", price: Number(draft.price || 0) }]
                  ).map((x: any) => ({ ...x, qty: Number(x.qty) || 1 }));
                  const updateOffer = (i: number, key: string, value: any) => {
                    const next = offers.map((x: any, j: number) => (j === i ? { ...x, [key]: value } : x));
                    patch("quantity_offers", next);
                  };
                  const removeOffer = (i: number) => {
                    const next = offers.filter((_: any, j: number) => j !== i);
                    patch("quantity_offers", next);
                    if (Number(draft.quantity_default_qty || 1) === Number(offers[i]?.qty))
                      patch("quantity_default_qty", Number(next[0]?.qty || 1));
                  };
                  const moveOffer = (i: number, d: number) => {
                    const j = i + d;
                    if (j < 0 || j >= offers.length) return;
                    const next = [...offers],
                      [x] = next.splice(i, 1);
                    next.splice(j, 0, x);
                    patch("quantity_offers", next);
                  };
                  return (
                    <div className="bv3-offers-editor">
                      {offers.map((o: any, i: number) => (
                        <div className="bv3-quantity-price" key={i}>
                          <div className="bv3-offer-head">
                            <b>Offre {i + 1}</b>
                            <div>
                              <button type="button" disabled={i === 0} onClick={() => moveOffer(i, -1)}>
                                ↑
                              </button>
                              <button type="button" disabled={i === offers.length - 1} onClick={() => moveOffer(i, 1)}>
                                ↓
                              </button>
                              <button type="button" disabled={offers.length === 1} onClick={() => removeOffer(i)}>
                                ×
                              </button>
                            </div>
                          </div>
                          <label>
                            Quantité
                            <input
                              type="number"
                              min="1"
                              max="10"
                              step="1"
                              value={o.qty}
                              onChange={(e) =>
                                updateOffer(i, "qty", Math.min(10, Math.max(1, Number(e.target.value) || 1)))
                              }
                            />
                          </label>
                          <label>
                            Libellé
                            <input
                              value={o.label || ""}
                              placeholder={o.qty + " pièces"}
                              onChange={(e) => updateOffer(i, "label", e.target.value)}
                            />
                          </label>
                          <label>
                            Prix total
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={o.price ?? ""}
                              onChange={(e) =>
                                updateOffer(i, "price", e.target.value === "" ? "" : Number(e.target.value))
                              }
                            />
                          </label>
                          <label className="bv3-check">
                            <input
                              type="radio"
                              name="default-quantity-offer"
                              checked={Number(draft.quantity_default_qty || offers[0]?.qty || 1) === Number(o.qty)}
                              onChange={() => patch("quantity_default_qty", Number(o.qty))}
                            />{" "}
                            Offre sélectionnée par défaut
                          </label>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const used = new Set(offers.map((x: any) => Number(x.qty)));
                          let qty = 1;
                          while (used.has(qty) && qty < 10) qty++;
                          patch("quantity_offers", [
                            ...offers,
                            {
                              qty,
                              label: qty === 1 ? "1 pièce" : qty + " pièces",
                              price: Number(draft.price || 0) * qty,
                            },
                          ]);
                        }}
                      >
                        + Ajouter une offre
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          patch("quantity_offers", []);
                          patch("quantity_default_qty", 1);
                        }}
                      >
                        Réinitialiser · Prix × quantité
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
            {selected === "benefits" && (
              <>
                <label>
                  Titre
                  <input value={draft.benefits_title || ""} onChange={(e) => patch("benefits_title", e.target.value)} />
                </label>
                <label>
                  Description
                  <textarea value={draft.description || ""} onChange={(e) => patch("description", e.target.value)} />
                </label>
                <label>
                  Bénéfices · 1 par ligne
                  <textarea
                    value={list("benefits").join("\n")}
                    onChange={(e) => patch("benefits", e.target.value.split("\n").filter(Boolean))}
                  />
                </label>
              </>
            )}
            {selected === "features" && (
              <>
                <label>
                  Titre
                  <input value={draft.features_title || ""} onChange={(e) => patch("features_title", e.target.value)} />
                </label>
                <label>
                  Caractéristiques · 1 par ligne
                  <textarea
                    value={list("features").join("\n")}
                    onChange={(e) => patch("features", e.target.value.split("\n").filter(Boolean))}
                  />
                </label>
              </>
            )}
            {selected === "how" && (
              <>
                <label>
                  Titre
                  <input value={draft.how_title || ""} onChange={(e) => patch("how_title", e.target.value)} />
                </label>
                <label>
                  Étapes · 1 par ligne
                  <textarea
                    value={list("how_steps").join("\n")}
                    onChange={(e) => patch("how_steps", e.target.value.split("\n").filter(Boolean))}
                  />
                </label>
              </>
            )}
            {selected === "problem" && (
              <>
                <label>
                  Titre
                  <input value={draft.problem_title || ""} onChange={(e) => patch("problem_title", e.target.value)} />
                </label>
                <label>
                  Problème
                  <textarea value={draft.problem || ""} onChange={(e) => patch("problem", e.target.value)} />
                </label>
                <label>
                  Solution
                  <textarea value={draft.solution || ""} onChange={(e) => patch("solution", e.target.value)} />
                </label>
              </>
            )}
            {selected === "order" && (
              <>
                <label>
                  Titre
                  <input value={draft.order_title || ""} onChange={(e) => patch("order_title", e.target.value)} />
                </label>
                <label>
                  Texte livraison
                  <input value={draft.delivery || ""} onChange={(e) => patch("delivery", e.target.value)} />
                </label>
                <label>
                  CTA <small>boutons qui mènent au formulaire</small>
                  <input value={draft.cta || ""} onChange={(e) => patch("cta", e.target.value)} />
                </label>
                <label>
                  Bouton du formulaire <small>celui qui envoie la commande</small>
                  <input
                    value={draft.form_cta || ""}
                    placeholder={draft.cta || "Même texte que le CTA"}
                    onChange={(e) => patch("form_cta", e.target.value)}
                  />
                </label>
                <label className="bv3-check">
                  <input
                    type="checkbox"
                    checked={draft.order_show_address !== false}
                    onChange={(e) => patch("order_show_address", e.target.checked)}
                  />{" "}
                  Afficher adresse
                </label>
              </>
            )}
            {selected === "trust" && (
              <>
                <label>
                  Titre
                  <input value={draft.trust_title || ""} onChange={(e) => patch("trust_title", e.target.value)} />
                </label>
                <label>
                  Points confiance · 1 par ligne
                  <textarea
                    value={list("trust_points").join("\n")}
                    onChange={(e) => patch("trust_points", e.target.value.split("\n").filter(Boolean))}
                  />
                </label>
              </>
            )}
            {selected.startsWith("custom-") &&
              (() => {
                const b = draft.custom_sections?.[selected] || {};
                const cp = (k: string, v: any) =>
                  commit({
                    ...draft,
                    custom_sections: { ...(draft.custom_sections || {}), [selected]: { ...b, [k]: v } },
                  });
                return (
                  <>
                    <label>
                      Titre
                      <input value={b.title || ""} onChange={(e) => cp("title", e.target.value)} />
                    </label>
                    <label>
                      Texte
                      <textarea value={b.text || ""} onChange={(e) => cp("text", e.target.value)} />
                    </label>
                    {b.type === "imageText" && (
                      <>
                        <label>
                          Image
                          <input value={b.image || ""} onChange={(e) => cp("image", e.target.value)} />
                        </label>
                        <label className="bv3-upload">
                          Charger image locale
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(e) => uploadCustom(selected, Array.from(e.target.files || []), "single")}
                          />
                          <span>{uploading ? "Chargement…" : "Choisir une image"}</span>
                        </label>
                        {b.image && <img className="bv3-media-preview" src={b.image} alt="" />}
                      </>
                    )}
                    {b.type === "gallery" && (
                      <>
                        <label className="bv3-upload">
                          Ajouter des images
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={uploading}
                            onChange={(e) => uploadCustom(selected, Array.from(e.target.files || []), "gallery")}
                          />
                          <span>{uploading ? "Chargement…" : "Choisir plusieurs images"}</span>
                        </label>
                        <div className="bv3-media-grid">
                          {(b.images || []).map((x: string, i: number) => (
                            <div key={x + i}>
                              <img src={x} alt="" />
                              <div>
                                <button type="button" onClick={() => removeGalleryImage(selected, i)}>
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {b.type === "vertical916" && (
                      <>
                        <label>
                          Média
                          <input value={b.media || ""} onChange={(e) => cp("media", e.target.value)} />
                        </label>
                        <label className="bv3-upload">
                          Charger image ou vidéo
                          <input
                            type="file"
                            accept="image/*,video/*"
                            disabled={uploading}
                            onChange={(e) => uploadCustom(selected, Array.from(e.target.files || []), "media")}
                          />
                          <span>{uploading ? "Chargement…" : "Choisir image / vidéo"}</span>
                        </label>
                        <label>
                          Largeur maximale
                          <input
                            type="number"
                            min="160"
                            max="1600"
                            value={b.mediaWidth || ""}
                            placeholder="430"
                            onChange={(e) => cp("mediaWidth", e.target.value ? Number(e.target.value) : null)}
                          />
                        </label>
                        <label>
                          Hauteur
                          <input
                            type="number"
                            min="120"
                            max="1600"
                            value={b.mediaHeight || ""}
                            placeholder="Auto selon ratio"
                            onChange={(e) => cp("mediaHeight", e.target.value ? Number(e.target.value) : null)}
                          />
                        </label>
                        <label>
                          Ratio
                          <select value={b.mediaRatio || "device"} onChange={(e) => cp("mediaRatio", e.target.value)}>
                            <option value="device">Selon appareil</option>
                            <option value="auto">Auto</option>
                            <option value="1 / 1">1:1</option>
                            <option value="4 / 3">4:3</option>
                            <option value="16 / 9">16:9</option>
                            <option value="9 / 16">9:16</option>
                          </select>
                        </label>
                        <label>
                          Affichage
                          <select value={b.mediaFit || "cover"} onChange={(e) => cp("mediaFit", e.target.value)}>
                            <option value="cover">Cover · remplir</option>
                            <option value="contain">Contain · média entier</option>
                            <option value="fill">Fill · étirer</option>
                          </select>
                        </label>
                        <label>
                          Alignement
                          <select value={b.mediaAlign || "center"} onChange={(e) => cp("mediaAlign", e.target.value)}>
                            <option value="left">Gauche</option>
                            <option value="center">Centre</option>
                            <option value="right">Droite</option>
                          </select>
                        </label>
                        <div className="bv3-help">
                          <b>Responsive par appareil</b>
                          <br />
                          Laissez vide pour reprendre les dimensions générales ci-dessus.
                        </div>
                        <label>
                          Largeur tablette
                          <input
                            type="number"
                            min="160"
                            max="1200"
                            value={b.mediaWidthTablet || ""}
                            placeholder="Hérite de la largeur générale"
                            onChange={(e) => cp("mediaWidthTablet", e.target.value ? Number(e.target.value) : null)}
                          />
                        </label>
                        <label>
                          Hauteur tablette
                          <input
                            type="number"
                            min="120"
                            max="1600"
                            value={b.mediaHeightTablet || ""}
                            placeholder="Auto"
                            onChange={(e) => cp("mediaHeightTablet", e.target.value ? Number(e.target.value) : null)}
                          />
                        </label>
                        <label>
                          Largeur mobile
                          <input
                            type="number"
                            min="120"
                            max="800"
                            value={b.mediaWidthMobile || ""}
                            placeholder="100% si vide"
                            onChange={(e) => cp("mediaWidthMobile", e.target.value ? Number(e.target.value) : null)}
                          />
                        </label>
                        <label>
                          Hauteur mobile
                          <input
                            type="number"
                            min="120"
                            max="1400"
                            value={b.mediaHeightMobile || ""}
                            placeholder="Auto"
                            onChange={(e) => cp("mediaHeightMobile", e.target.value ? Number(e.target.value) : null)}
                          />
                        </label>
                        {b.mediaType === "video" && (
                          <>
                            <label className="bv3-check">
                              <input
                                type="checkbox"
                                checked={b.videoAutoplay === true}
                                onChange={(e) => cp("videoAutoplay", e.target.checked)}
                              />{" "}
                              Autoplay
                            </label>
                            <label className="bv3-check">
                              <input
                                type="checkbox"
                                checked={b.videoMuted !== false}
                                onChange={(e) => cp("videoMuted", e.target.checked)}
                              />{" "}
                              Muet
                            </label>
                            <label className="bv3-check">
                              <input
                                type="checkbox"
                                checked={b.videoLoop === true}
                                onChange={(e) => cp("videoLoop", e.target.checked)}
                              />{" "}
                              Boucle
                            </label>
                            <label className="bv3-check">
                              <input
                                type="checkbox"
                                checked={b.videoControls !== false}
                                onChange={(e) => cp("videoControls", e.target.checked)}
                              />{" "}
                              Contrôles vidéo
                            </label>
                          </>
                        )}
                        {b.media &&
                          (b.mediaType === "video" ? (
                            <video className="bv3-media-preview" src={b.media} controls />
                          ) : (
                            <img className="bv3-media-preview" src={b.media} alt="" />
                          ))}
                      </>
                    )}
                    {b.type === "ctaBlock" && (
                      <label>
                        Bouton
                        <input value={b.button || ""} onChange={(e) => cp("button", e.target.value)} />
                      </label>
                    )}
                  </>
                );
              })()}
            {(LANDPRO_SECTIONS as readonly string[]).includes(selected) && (
              <LandproSectionEditor draft={draft} selected={selected} patch={patch} />
            )}
            {selected === "faq" && (
              <>
                <label>
                  Titre
                  <input value={draft.faq_title || ""} onChange={(e) => patch("faq_title", e.target.value)} />
                </label>
                <div className="bv3-faq-editor">
                  {list("faq").map((item: any, i: number) => {
                    const obj = typeof item === "string" ? { question: item, answer: "" } : item || {};
                    const update = (k: string, v: string) => {
                      const next = list("faq").map((x: any, j: number) =>
                        j === i ? { ...(typeof x === "string" ? { question: x, answer: "" } : x), [k]: v } : x,
                      );
                      patch("faq", next);
                    };
                    return (
                      <div className="bv3-faq-item" key={i}>
                        <div>
                          <b>Question {i + 1}</b>
                          <button
                            type="button"
                            onClick={() =>
                              patch(
                                "faq",
                                list("faq").filter((_: any, j: number) => j !== i),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                        <label>
                          Question
                          <input value={obj.question || ""} onChange={(e) => update("question", e.target.value)} />
                        </label>
                        <label>
                          Réponse
                          <textarea value={obj.answer || ""} onChange={(e) => update("answer", e.target.value)} />
                        </label>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="bv3-add-faq"
                    onClick={() =>
                      patch("faq", [...list("faq"), { question: "Nouvelle question", answer: "Nouvelle réponse" }])
                    }
                  >
                    + Ajouter une question
                  </button>
                </div>
              </>
            )}
            <hr />
            <b>Design System</b>
            <small>{ds.productType || "UI/UX Pro Max"}</small>
            <small>{ds.style?.["Style Category"] || ""}</small>
            <small>{ds.landing?.["Pattern Name"] || ""}</small>
          </div>
        </aside>
      </div>
    </div>
  );
}
