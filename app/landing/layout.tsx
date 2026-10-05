// Pages publiques : CSS allégé (sans le tableau de bord) et polices non bloquantes.
import "../landing-public.css";
import PublicFonts from "../../components/public/PublicFonts";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicFonts />
      {children}
    </>
  );
}
