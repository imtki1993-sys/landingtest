// Layout racine : aucun CSS global ici. Le tableau de bord charge globals.css via
// ses propres layouts ; les landing pages chargent les styles des templates LandPro
// et les boutiques store-public.css (généré, beaucoup plus léger).
export const metadata = { title: "Landing Page Motor", description: "Générateur de landing pages COD" };

// Mode sombre du tableau de bord appliqué avant l'affichage, sur toutes les pages du
// tableau de bord (éditeurs compris), jamais sur les boutiques et landing pages publiques.
const THEME_SCRIPT =
  "try{if(!/^\\/(store|landing)(\\/|$)/.test(location.pathname)&&localStorage.getItem('landpro-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
