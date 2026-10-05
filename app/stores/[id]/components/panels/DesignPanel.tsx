"use client";
const headingFonts = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Manrope",
  "DM Sans",
  "Roboto",
  "Open Sans",
  "Lato",
  "Nunito",
  "Playfair Display",
  "Cairo",
  "Tajawal",
  "Almarai",
  "Noto Sans Arabic",
  "Noto Kufi Arabic",
  "IBM Plex Sans Arabic",
  "Readex Pro",
  "Changa",
];
const bodyFonts = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Manrope",
  "DM Sans",
  "Roboto",
  "Open Sans",
  "Lato",
  "Nunito",
  "Cairo",
  "Tajawal",
  "Almarai",
  "Noto Sans Arabic",
  "Noto Kufi Arabic",
  "IBM Plex Sans Arabic",
  "Readex Pro",
  "Changa",
];
export default function DesignPanel({ settings, setSettings }: any) {
  const patch = (v: any) => setSettings({ ...settings, ...v });
  const ds = settings.designSystem || {};
  return (
    <div className="store-settings-card">
      <div className="store-step-head">
        <span>2</span>
        <div>
          <h2>Design UI/UX Pro Max</h2>
          <p>
            Le design de cette boutique est généré automatiquement à partir du benchmark UI/UX Pro Max. Les anciens
            templates LandPro ont été retirés.
          </p>
        </div>
      </div>
      <div className="store-design-custom">
        <h3>Système actif</h3>
        <p className="store-layout-help">
          <b>{settings.benchmarkCategory || "E-commerce"}</b> · {ds.style || settings.aiDirection || "UI/UX Pro Max"} ·
          source : hylarucoder/benchmark-skill-ui-ux-pro-max
        </p>
        <label>
          Logo URL
          <input
            value={settings.logo || ""}
            onChange={(e) => patch({ logo: e.target.value })}
            placeholder="https://..."
          />
        </label>
        <div className="store-color-grid">
          <label>
            Couleur principale
            <input
              type="color"
              value={settings.primary || "#111827"}
              onChange={(e) => patch({ primary: e.target.value })}
            />
          </label>
          <label>
            Couleur CTA
            <input
              type="color"
              value={settings.accent || "#2563eb"}
              onChange={(e) => patch({ accent: e.target.value })}
            />
          </label>
        </div>
        <h3>Header / Menu</h3>
        <div className="store-color-grid">
          <label>
            Fond header
            <input
              type="color"
              value={settings.headerBackground || "#ffffff"}
              onChange={(e) => patch({ headerBackground: e.target.value })}
            />
          </label>
          <label>
            Texte header
            <input
              type="color"
              value={settings.headerTextColor || "#111827"}
              onChange={(e) => patch({ headerTextColor: e.target.value })}
            />
          </label>
          <label>
            Fond menu mobile
            <input
              type="color"
              value={settings.headerMenuBackground || "#ffffff"}
              onChange={(e) => patch({ headerMenuBackground: e.target.value })}
            />
          </label>
          <label>
            Texte menu
            <input
              type="color"
              value={settings.headerMenuTextColor || "#111827"}
              onChange={(e) => patch({ headerMenuTextColor: e.target.value })}
            />
          </label>
          <label>
            Panier / compteur
            <input
              type="color"
              value={settings.headerCartColor || settings.accent || "#2563eb"}
              onChange={(e) => patch({ headerCartColor: e.target.value })}
            />
          </label>
        </div>
        <h3>Typographie</h3>
        <div className="store-font-grid">
          <label>
            Police des titres
            <select value={settings.headingFont || "Cairo"} onChange={(e) => patch({ headingFont: e.target.value })}>
              {headingFonts.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Police du texte
            <select value={settings.bodyFont || "Tajawal"} onChange={(e) => patch({ bodyFont: e.target.value })}>
              {bodyFonts.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Taille titres
            <input
              type="range"
              min="24"
              max="72"
              value={settings.headingSize || 44}
              onChange={(e) => patch({ headingSize: Number(e.target.value) })}
            />
            <small>{settings.headingSize || 44}px</small>
          </label>
          <label>
            Taille titres tablette
            <input
              type="range"
              min="22"
              max="64"
              value={settings.headingSizeTablet || 36}
              onChange={(e) => patch({ headingSizeTablet: Number(e.target.value) })}
            />
            <small>{settings.headingSizeTablet || 36}px</small>
          </label>
          <label>
            Taille titres mobile
            <input
              type="range"
              min="20"
              max="52"
              value={settings.headingSizeMobile || 30}
              onChange={(e) => patch({ headingSizeMobile: Number(e.target.value) })}
            />
            <small>{settings.headingSizeMobile || 30}px</small>
          </label>
          <label>
            Graisse titres
            <select
              value={String(settings.headingWeight || 700)}
              onChange={(e) => patch({ headingWeight: Number(e.target.value) })}
            >
              <option>400</option>
              <option>500</option>
              <option>600</option>
              <option>700</option>
              <option>800</option>
              <option>900</option>
            </select>
          </label>
          <label>
            Interligne texte
            <input
              type="range"
              min="1.4"
              max="2"
              step=".1"
              value={settings.bodyLineHeight || 1.6}
              onChange={(e) => patch({ bodyLineHeight: Number(e.target.value) })}
            />
            <small>{settings.bodyLineHeight || 1.6}</small>
          </label>
          <label>
            Direction
            <select value={settings.textDirection || "auto"} onChange={(e) => patch({ textDirection: e.target.value })}>
              <option value="auto">Auto</option>
              <option value="ltr">LTR</option>
              <option value="rtl">RTL</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
