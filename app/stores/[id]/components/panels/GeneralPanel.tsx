"use client";
export default function GeneralPanel({ store, setStore, settings, setSettings }: any) {
  return (
    <div className="store-settings-card">
      <h2>Informations boutique</h2>
      <label>
        Nom
        <input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} />
      </label>
      <label>
        Langue
        <select value={store.locale} onChange={(e) => setStore({ ...store, locale: e.target.value })}>
          <option value="darija">Darija Maroc</option>
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
        </select>
      </label>
      <label>
        Numéro WhatsApp de la boutique
        <input
          inputMode="tel"
          value={settings.whatsapp || ""}
          onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value.replace(/[^0-9+ ]/g, "") })}
          placeholder="Ex. 212600000000 — vide = numéro des Paramètres"
        />
      </label>
      <label className="store-check">
        <input
          type="checkbox"
          checked={settings.showWhatsapp !== false}
          onChange={(e) => setSettings({ ...settings, showWhatsapp: e.target.checked })}
        />{" "}
        Afficher le bouton WhatsApp sur toutes les pages
      </label>
      <label>
        Annonce
        <input
          value={settings.announcement}
          onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
        />
      </label>
    </div>
  );
}
