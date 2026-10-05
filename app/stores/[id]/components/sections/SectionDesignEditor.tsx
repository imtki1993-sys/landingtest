"use client";
export default function SectionDesignEditor({ block, patchBlock }: any) {
  const b = block,
    layout = b.layout || {},
    patchLayout = (v: any) => patchBlock(b.id, { layout: { ...layout, ...v } });
  return (
    <details className="store-section-settings" open>
      <summary>✦ Design avancé</summary>
      <div className="store-inspector-tabs">
        <span>Layout</span>
        <span>Style</span>
        <span>Responsive</span>
        <span>Effets</span>
      </div>
      <div className="store-section-settings-grid">
        <label>
          Largeur
          <select value={layout.width || "contained"} onChange={(e) => patchLayout({ width: e.target.value })}>
            <option value="contained">Contenu</option>
            <option value="wide">Large</option>
            <option value="full">Pleine largeur</option>
          </select>
        </label>
        <label>
          Alignement
          <select value={layout.align || "center"} onChange={(e) => patchLayout({ align: e.target.value })}>
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </label>
        <label>
          Padding vertical
          <input
            type="range"
            min="0"
            max="120"
            step="4"
            value={layout.paddingY ?? 40}
            onChange={(e) => patchLayout({ paddingY: Number(e.target.value) })}
          />
          <small>{layout.paddingY ?? 40}px</small>
        </label>
        <label>
          Rayon
          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={layout.radius ?? 12}
            onChange={(e) => patchLayout({ radius: Number(e.target.value) })}
          />
          <small>{layout.radius ?? 12}px</small>
        </label>
        <label>
          Fond
          <input
            type="color"
            value={layout.background || "#ffffff"}
            onChange={(e) => patchLayout({ background: e.target.value })}
          />
        </label>
        <label>
          Bordure
          <input
            type="color"
            value={layout.borderColor || "#e5e7eb"}
            onChange={(e) => patchLayout({ borderColor: e.target.value })}
          />
        </label>
        <label>
          Épaisseur bordure
          <input
            type="range"
            min="0"
            max="8"
            value={layout.borderWidth ?? 0}
            onChange={(e) => patchLayout({ borderWidth: Number(e.target.value) })}
          />
          <small>{layout.borderWidth ?? 0}px</small>
        </label>
        <label>
          Ombre
          <select value={layout.shadow || "none"} onChange={(e) => patchLayout({ shadow: e.target.value })}>
            <option value="none">Aucune</option>
            <option value="soft">Soft</option>
            <option value="card">Card</option>
            <option value="floating">Floating</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <label>
          Opacité
          <input
            type="range"
            min="20"
            max="100"
            value={layout.opacity ?? 100}
            onChange={(e) => patchLayout({ opacity: Number(e.target.value) })}
          />
          <small>{layout.opacity ?? 100}%</small>
        </label>
        <label>
          Gap
          <input
            type="range"
            min="0"
            max="64"
            step="2"
            value={layout.gap ?? 18}
            onChange={(e) => patchLayout({ gap: Number(e.target.value) })}
          />
          <small>{layout.gap ?? 18}px</small>
        </label>
        {["gallery", "products", "benefits", "reviews"].includes(b.type) && (
          <>
            <label>
              Colonnes PC
              <select
                value={String(layout.columns || 0)}
                onChange={(e) => patchLayout({ columns: Number(e.target.value) })}
              >
                <option value="0">Auto</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
            <label>
              Colonnes Mobile
              <select
                value={String(layout.mobileColumns || 0)}
                onChange={(e) => patchLayout({ mobileColumns: Number(e.target.value) })}
              >
                <option value="0">Auto</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>
          </>
        )}
        {["gallery", "image", "imageText", "hero"].includes(b.type) && (
          <>
            <label>
              Ratio image
              <select
                value={layout.imageRatio || "square"}
                onChange={(e) => patchLayout({ imageRatio: e.target.value })}
              >
                <option value="original">Original</option>
                <option value="square">Carré 1:1</option>
                <option value="portrait">Portrait 4:5</option>
                <option value="landscape">Paysage 16:9</option>
              </select>
            </label>
            <label>
              Ajustement
              <select value={layout.imageFit || "contain"} onChange={(e) => patchLayout({ imageFit: e.target.value })}>
                <option value="contain">Contenir</option>
                <option value="cover">Remplir</option>
              </select>
            </label>
          </>
        )}
        <label>
          Padding Mobile
          <input
            type="range"
            min="0"
            max="80"
            step="4"
            value={layout.mobilePaddingY ?? 24}
            onChange={(e) => patchLayout({ mobilePaddingY: Number(e.target.value) })}
          />
          <small>{layout.mobilePaddingY ?? 24}px</small>
        </label>
        <label className="store-section-device">
          <input
            type="checkbox"
            checked={layout.hideDesktop !== true}
            onChange={(e) => patchLayout({ hideDesktop: !e.target.checked })}
          />{" "}
          Afficher PC
        </label>
        <label className="store-section-device">
          <input
            type="checkbox"
            checked={layout.hideMobile !== true}
            onChange={(e) => patchLayout({ hideMobile: !e.target.checked })}
          />{" "}
          Afficher Mobile
        </label>
      </div>
    </details>
  );
}
