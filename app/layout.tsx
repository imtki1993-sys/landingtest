// Layout racine : aucun CSS global ici. Le tableau de bord charge globals.css via
// ses propres layouts ; les landing pages chargent les styles des templates LandPro
// et les boutiques store-public.css (généré, beaucoup plus léger).
export const metadata = { title: "Landing Page Motor", description: "Générateur de landing pages COD" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
