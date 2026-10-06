// Boutiques publiques : CSS allégé (généré, sans le tableau de bord) et polices non bloquantes.
import "../store-public.css";
import PublicFonts from "../../components/public/PublicFonts";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicFonts />
      {children}
    </>
  );
}
