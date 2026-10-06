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
          placeholder={
            store.workspace_whatsapp
              ? "Vide = numéro des Paramètres (" + store.workspace_whatsapp + ")"
              : "Ex. 212600000000 — aucun numéro dans les Paramètres"
          }
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
        Bandeau d'annonce (en haut de toutes les pages)
        <input
          value={settings.announcement || ""}
          onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
          placeholder="Ex. Livraison gratuite partout au Maroc"
        />
      </label>
      <label className="store-check">
        <input
          type="checkbox"
          checked={settings.showAnnouncement !== false}
          onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
        />{" "}
        Afficher le bandeau d'annonce
      </label>
    </div>
  );
}
