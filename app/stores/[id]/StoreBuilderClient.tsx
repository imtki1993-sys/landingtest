"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PAGE_LIST, storeBuilderDefaults as defaults } from "../../../lib/store-builder-config";
import StoreBuilderTopbar from "./components/StoreBuilderTopbar";
import StorePreviewCanvas from "./components/StorePreviewCanvas";
import StoreBuilderSidebar from "./components/StoreBuilderSidebar";
import GeneralPanel from "./components/panels/GeneralPanel";
import PublishPanel from "./components/panels/PublishPanel";
import DesignPanel from "./components/panels/DesignPanel";
import ProductsPanel from "./components/panels/ProductsPanel";
import HomePanel from "./components/panels/HomePanel";
import PagesSectionsPanel from "./components/panels/PagesSectionsPanel";
import { normalizeStoreSettings } from "../../../lib/store-settings";
import { getStoreTemplate, isSeriesTemplate, withTemplateTexts } from "../../../lib/store-templates";
import "../../../components/store-templates/editor/editor.css";
import StylePanel, { switchTemplateSettings } from "../../../components/store-templates/editor/StylePanel";
import HomeSectionsPanel from "../../../components/store-templates/editor/HomeSectionsPanel";
import PagesPanel, { SERIES_PAGES } from "../../../components/store-templates/editor/PagesPanel";
import { homeAction } from "../../../components/store-templates/editor/actions";

/** Onglets de l'éditeur pour une boutique en template de série. */
const SERIES_TABS = [
  ["general", "1", "Ma boutique"],
  ["style", "2", "Template & style"],
  ["home", "3", "Accueil"],
  ["pages", "4", "Pages"],
  ["catalog", "5", "Produits"],
  ["publish", "6", "Publier"],
];
const SERIES_PAGE_LIST = [["home", "Accueil"], ["shop", "Boutique"], ["product", "Produit"], ...SERIES_PAGES];
/** Ce qui est enregistré : sert à l'historique (annuler / rétablir) et à détecter les modifications. */
const snapshot = (store: any, settings: any) =>
  JSON.stringify({ n: store?.name, l: store?.locale, t: store?.template_id, s: settings });
import {
  createStoreBlock,
  duplicateStoreBlock,
  getHomeItems,
  hideHomeNativeSection,
  moveItem,
  moveItemBy,
  removeCustomSection,
} from "../../../lib/store-section-engine";
export default function StoreBuilderClient({ storeId }: { storeId: string }) {
  const [store, setStore] = useState<any>(null),
    [settings, setSettings] = useState<any>(defaults),
    [products, setProducts] = useState<any[]>([]),
    [saving, setSaving] = useState(false),
    [copied, setCopied] = useState(false),
    [previewMode, setPreviewMode] = useState("desktop"),
    [productSearch, setProductSearch] = useState(""),
    [tab, setTab] = useState("general"),
    [editPage, setEditPage] = useState("home"),
    [previewKey, setPreviewKey] = useState(0),
    previewRef = useRef<HTMLIFrameElement>(null),
    // templates de série : essai d'un template, section ouverte, zone mise en avant
    [trial, setTrial] = useState(""),
    [sxSelected, setSxSelected] = useState(""),
    [styleFocus, setStyleFocus] = useState(""),
    // historique des modifications et dernier état enregistré
    history = useRef<{ stack: string[]; index: number; skip: boolean }>({ stack: [], index: -1, skip: false }),
    [historyTick, setHistoryTick] = useState(0),
    savedSnap = useRef("");
  const series = isSeriesTemplate(store?.template_id);
  // les onglets changent avec le moteur de la boutique (template de série ou IA)
  useEffect(() => {
    if (series && (tab === "design" || tab === "visual")) setTab("style");
    if (!series && (tab === "style" || tab === "pages")) setTab("design");
  }, [series, tab]);
  useEffect(() => {
    Promise.all([
      fetch("/api/stores/" + storeId, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/products?limit=100", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([a, b]) => {
      if (a.store) {
        const tpl = getStoreTemplate(a.store.template_id);
        const normalized = normalizeStoreSettings(a.store.settings);
        const st = tpl ? withTemplateTexts(normalized, tpl, a.store.locale) : normalized;
        setStore(a.store);
        setSettings(st);
        savedSnap.current = snapshot(a.store, st);
      }
      setProducts(b.products || []);
    });
  }, [storeId]);
  // Boutique envoyée à l'aperçu : avec le template en essai s'il y en a un (rien n'est enregistré)
  function previewStore() {
    if (!store) return null;
    if (trial)
      return {
        ...store,
        template_id: trial,
        settings: switchTemplateSettings(settings, trial, store.locale, false),
      };
    return { ...store, settings };
  }
  function postPreview() {
    const st = previewStore();
    if (!st) return;
    const win = previewRef.current?.contentWindow;
    win?.postMessage({ type: "LANDPRO_STORE_PREVIEW", store: st }, "*");
    win?.postMessage({ type: "LANDPRO_SX_SELECTED", key: sxSelected }, "*");
  }
  useEffect(() => {
    if (!store) return;
    const t = setTimeout(postPreview, 40);
    return () => clearTimeout(t);
  }, [store, settings, editPage, previewKey, trial]);
  // Section ouverte dans le panneau : mise en évidence et affichée dans l'aperçu
  function selectSection(key: string, scroll = true) {
    setSxSelected(key);
    if (key && editPage !== "home") setEditPage("home");
    previewRef.current?.contentWindow?.postMessage({ type: "LANDPRO_SX_SELECTED", key, scroll }, "*");
  }
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== previewRef.current?.contentWindow) return;
      if (e.data?.type === "LANDPRO_PREVIEW_READY" && store) postPreview();
      // clic ou bouton de la barre d'actions dans l'aperçu (templates de série)
      if (e.data?.type === "LANDPRO_SX_ACTION" && store && !trial) {
        const key = String(e.data.key || ""),
          action = String(e.data.action || "");
        if (action === "select") {
          if (key === "@header" || key === "@footer") {
            setTab("style");
            setStyleFocus(key);
          } else if (key.startsWith("@page:")) {
            const p = key.slice(6);
            if (SERIES_PAGES.some(([k]) => k === p)) {
              setTab("pages");
              setEditPage(p);
            } else setTab(p === "shop" || p === "product" ? "catalog" : "style");
          } else {
            setTab("home");
            selectSection(key, false);
          }
          return;
        }
        if (action === "delete" && !window.confirm("Supprimer cette section de l'accueil ?")) return;
        if (["up", "down", "hide", "show", "duplicate", "delete"].includes(action))
          setSettings((v: any) => homeAction(v, store.template_id, key, action as any));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [store, settings, trial, sxSelected, editPage]);

  // Historique : un instantané par pause de saisie (annuler / rétablir)
  useEffect(() => {
    if (!store) return;
    const h = history.current;
    if (h.skip) {
      h.skip = false;
      return;
    }
    const t = setTimeout(() => {
      const snap = snapshot(store, settings);
      if (h.stack[h.index] === snap) return;
      h.stack = h.stack
        .slice(0, h.index + 1)
        .concat(snap)
        .slice(-80);
      h.index = h.stack.length - 1;
      setHistoryTick((x) => x + 1);
    }, 450);
    return () => clearTimeout(t);
  }, [store, settings]);
  function restore(dir: -1 | 1) {
    const h = history.current,
      i = h.index + dir;
    if (i < 0 || i >= h.stack.length) return;
    const snap = JSON.parse(h.stack[i]);
    h.index = i;
    h.skip = true;
    setStore((v: any) => ({ ...v, name: snap.n, locale: snap.l, template_id: snap.t }));
    setSettings(snap.s);
    setHistoryTick((x) => x + 1);
  }
  const canUndo = history.current.index > 0,
    canRedo = history.current.index < history.current.stack.length - 1;
  void historyTick;
  const dirty = !!store && savedSnap.current !== "" && snapshot(store, settings) !== savedSnap.current;
  // Ctrl/Cmd+Z, Ctrl/Cmd+Maj+Z ou Ctrl+Y (hors champs de saisie, qui gardent leur propre annulation)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        restore(-1);
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        restore(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  // Modifications non enregistrées : avertissement avant de quitter la page
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);
  async function uploadHeroImage(e: any) {
    if (!store) return;
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    try {
      const urls = await Promise.all(
        files.slice(0, 6).map(async (file) => {
          const form = new FormData();
          form.append("storeId", store.id);
          form.append("file", file);
          const r = await fetch("/api/store-media", { method: "POST", body: form }),
            x = await r.json();
          if (!r.ok) throw new Error(x.error || "Upload impossible");
          return String(x.url);
        }),
      );
      setSettings((v: any) => {
        const current = Array.isArray(v.heroImages) ? v.heroImages.filter(Boolean) : v.heroImage ? [v.heroImage] : [];
        const heroImages = [...current, ...urls]
          .filter((x: string, i: number, a: string[]) => a.indexOf(x) === i)
          .slice(0, 6);
        return { ...v, heroImage: heroImages[0] || "", heroImages };
      });
    } catch (err: any) {
      alert(err.message || "Upload impossible");
    } finally {
      e.target.value = "";
    }
  }
  function pageBlocks() {
    return Array.isArray(settings.pageSections?.[editPage]) ? settings.pageSections[editPage] : [];
  }
  function setPageBlocks(blocks: any[]) {
    setSettings({ ...settings, pageSections: { ...(settings.pageSections || {}), [editPage]: blocks } });
  }
  function homeItems() {
    return getHomeItems(settings);
  }
  function moveHomeItem(from: string, to: string) {
    const a = moveItem(homeItems(), from, to);
    setSettings({ ...settings, homeLayoutOrder: a.map((v: any) => v.id) });
  }
  function addBlock(type: string) {
    const base: any = createStoreBlock(type, store?.name || "Ma boutique");
    if (editPage === "home") {
      const blocks = [...pageBlocks(), base];
      const current = Array.isArray(settings.homeLayoutOrder)
        ? settings.homeLayoutOrder
        : homeItems().map((x: any) => x.id);
      setSettings({
        ...settings,
        pageSections: { ...(settings.pageSections || {}), home: blocks },
        homeLayoutOrder: [...current, base.id],
      });
    } else setPageBlocks([...pageBlocks(), base]);
  }
  function patchBlock(id: string, patch: any) {
    setPageBlocks(pageBlocks().map((b: any) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function removeBlock(id: string) {
    if (!window.confirm("Supprimer définitivement cette section ?")) return;
    setSettings(removeCustomSection(settings, editPage, id));
  }
  function hideNativeSection(type: string) {
    if (
      !window.confirm(
        "Retirer cette section de la page d’accueil ? Tu pourras la réactiver depuis les réglages Accueil.",
      )
    )
      return;
    setSettings(hideHomeNativeSection(settings, type));
  }
  function duplicateBlock(b: any) {
    const copy = duplicateStoreBlock(b);
    if (editPage === "home") {
      const blocks = [...pageBlocks(), copy];
      const current = Array.isArray(settings.homeLayoutOrder)
        ? settings.homeLayoutOrder
        : homeItems().map((x: any) => x.id);
      setSettings({
        ...settings,
        pageSections: { ...(settings.pageSections || {}), home: blocks },
        homeLayoutOrder: [...current, copy.id],
      });
    } else setPageBlocks([...pageBlocks(), copy]);
  }
  function moveBlock(id: string, dir: number) {
    const blocks = pageBlocks(),
      i = blocks.findIndex((b: any) => b.id === id);
    setPageBlocks(moveItemBy(blocks, i, dir));
  }
  function dragBlock(from: string, to: string) {
    setPageBlocks(moveItem(pageBlocks(), from, to));
  }
  async function imageFiles(e: any, b: any, gallery = false) {
    if (!store) return;
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    try {
      const urls = await Promise.all(
        files.slice(0, gallery ? 8 : 1).map(async (file) => {
          const form = new FormData();
          form.append("storeId", store.id);
          form.append("file", file);
          const r = await fetch("/api/store-media", { method: "POST", body: form }),
            x = await r.json();
          if (!r.ok) throw new Error(x.error || "Upload impossible");
          return String(x.url);
        }),
      );
      gallery
        ? patchBlock(b.id, { images: [...(b.images || []), ...urls].slice(0, 12) })
        : patchBlock(b.id, { image: urls[0] || "" });
    } catch (err: any) {
      alert(err.message || "Upload impossible");
    } finally {
      e.target.value = "";
    }
  }
  async function copyUrl() {
    if (!store) return;
    const url = window.location.origin + "/store/" + store.slug;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      prompt("Copie l’URL de ta boutique :", url);
    }
  }
  function toggleProduct(id: string) {
    const ids = [...(settings.selectedProductIds || [])];
    setSettings({
      ...settings,
      selectedProductIds: ids.includes(id) ? ids.filter((x: string) => x !== id) : [...ids, id],
    });
  }
  function moveProduct(id: string, dir: number) {
    const ids = [...(settings.selectedProductIds || [])],
      i = ids.indexOf(id),
      j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setSettings({ ...settings, selectedProductIds: ids });
  }
  function sectionPos(id: string) {
    const order = settings.sectionOrder || ["hero", "products", "trust", "faq", "footer"];
    const i = order.indexOf(id);
    return i < 0 ? 50 : i;
  }
  function moveSection(id: string, dir: number) {
    const order = [...(settings.sectionOrder || ["hero", "products", "trust", "faq", "footer"])],
      i = order.indexOf(id),
      j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setSettings({ ...settings, sectionOrder: order });
  }
  async function shareStore() {
    if (!store) return;
    const url = window.location.origin + "/store/" + store.slug;
    if (navigator.share) {
      try {
        await navigator.share({ title: store.name, url });
        return;
      } catch {}
    }
    window.open("https://wa.me/?text=" + encodeURIComponent(store.name + " " + url), "_blank");
  }
  async function save(status?: string) {
    if (!store) return;
    if (trial && !window.confirm("Un template est en essai et ne sera pas enregistré. Enregistrer quand même ?"))
      return;
    setSaving(true);
    const r = await fetch("/api/stores/" + store.id, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: store.name,
          locale: store.locale,
          templateId: store.template_id,
          settings,
          status,
        }),
      }),
      x = await r.json();
    setSaving(false);
    if (!r.ok) return alert(x.error || "Erreur");
    setStore((v: any) => ({ ...x.store, workspace_whatsapp: v?.workspace_whatsapp }));
    savedSnap.current = snapshot(x.store, settings);
    setPreviewKey((k) => k + 1);
    if (status === "PUBLISHED") alert("Boutique publiée. URL : " + window.location.origin + "/store/" + x.store.slug);
  }
  if (!store) return <main className="store-builder-loading">Chargement du Store Builder…</main>;
  return (
    <main className="store-builder-shell">
      <StoreBuilderSidebar
        store={store}
        tab={tab}
        setTab={(t: string) => {
          setTab(t);
          setStyleFocus("");
          // l'aperçu suit l'onglet : accueil pour « Accueil », page ouverte pour « Pages »
          if (t === "home") setEditPage("home");
          // réglages du catalogue : l'aperçu montre la page Boutique
          if (t === "catalog") setEditPage("shop");
          if (series && t === "pages" && !SERIES_PAGES.some(([k]) => k === editPage)) setEditPage("delivery");
        }}
        tabs={series ? SERIES_TABS : undefined}
        dirty={dirty}
      />
      <section className="store-builder-controls">
        <StoreBuilderTopbar
          store={store}
          saving={saving}
          copied={copied}
          onSave={() => save()}
          onPublish={() => save("PUBLISHED")}
          onCopy={copyUrl}
          dirty={dirty}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => restore(-1)}
          onRedo={() => restore(1)}
        />
        {series && tab === "style" && (
          <StylePanel
            store={store}
            setStore={setStore}
            settings={settings}
            setSettings={setSettings}
            products={products}
            trial={trial}
            setTrial={setTrial}
            focus={styleFocus}
          />
        )}
        {series && tab === "home" && (
          <HomeSectionsPanel
            store={store}
            settings={settings}
            setSettings={setSettings}
            products={products}
            selected={sxSelected}
            select={(k) => selectSection(k)}
            uploadHeroImage={uploadHeroImage}
          />
        )}
        {series && tab === "pages" && (
          <PagesPanel settings={settings} setSettings={setSettings} page={editPage} setPage={setEditPage} />
        )}
        {tab === "general" && (
          <GeneralPanel store={store} setStore={setStore} settings={settings} setSettings={setSettings} />
        )}
        {!series && tab === "design" && (
          <DesignPanel
            store={store}
            setStore={setStore}
            settings={settings}
            setSettings={setSettings}
            products={products}
          />
        )}
        {!series && tab === "home" && (
          <HomePanel
            settings={settings}
            setSettings={setSettings}
            uploadHeroImage={uploadHeroImage}
            moveSection={moveSection}
          />
        )}
        {tab === "catalog" && (
          <ProductsPanel
            settings={settings}
            setSettings={setSettings}
            products={products}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            toggleProduct={toggleProduct}
            moveProduct={moveProduct}
            series={series}
          />
        )}
        {!series && tab === "visual" && (
          <PagesSectionsPanel
            editPage={editPage}
            setEditPage={setEditPage}
            homeItems={homeItems}
            moveHomeItem={moveHomeItem}
            hideNativeSection={hideNativeSection}
            removeBlock={removeBlock}
            pageBlocks={pageBlocks}
            addBlock={addBlock}
            patchBlock={patchBlock}
            moveBlock={moveBlock}
            duplicateBlock={duplicateBlock}
            dragBlock={dragBlock}
            imageFiles={imageFiles}
          />
        )}
        {tab === "publish" && (
          <PublishPanel
            store={store}
            products={products}
            settings={settings}
            saving={saving}
            copied={copied}
            setPreviewMode={setPreviewMode}
            onPublish={() => save("PUBLISHED")}
            onCopy={copyUrl}
            onShare={shareStore}
          />
        )}
      </section>
      <StorePreviewCanvas
        store={store}
        settings={settings}
        editPage={editPage}
        pageList={series ? SERIES_PAGE_LIST : PAGE_LIST}
        products={products}
        trial={trial}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        previewKey={previewKey}
        setPreviewKey={setPreviewKey}
        previewRef={previewRef}
      />
    </main>
  );
}
