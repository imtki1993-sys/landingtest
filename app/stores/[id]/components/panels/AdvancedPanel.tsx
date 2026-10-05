"use client";
export default function AdvancedPanel({ settings, setSettings }: any) {
  const patch = (v: any) => setSettings({ ...settings, ...v });
  return (
    <div className="store-settings-card">
      <h2>Réglages avancés</h2>
      <p>Ces options sont facultatives. Le template fonctionne sans les modifier.</p>
      <label>
        Annonce
        <input value={settings.announcement} onChange={(e) => patch({ announcement: e.target.value })} />
      </label>
      <label>
        Logo URL
        <input value={settings.logo} onChange={(e) => patch({ logo: e.target.value })} placeholder="https://..." />
      </label>
      <div className="store-color-grid">
        <label>
          Couleur principale
          <input type="color" value={settings.primary} onChange={(e) => patch({ primary: e.target.value })} />
        </label>
        <label>
          Couleur CTA
          <input type="color" value={settings.accent} onChange={(e) => patch({ accent: e.target.value })} />
        </label>
      </div>
    </div>
  );
}
