// Layout racine : aucun CSS global ici. Le tableau de bord charge globals.css via
// ses propres layouts ; les pages publiques (landing, boutique) chargent seulement
// landing-public.css, beaucoup plus léger.
export const metadata = { title: "Landing Page Motor", description: "Générateur de landing pages COD" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
