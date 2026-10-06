// Landing pages publiques : CSS minimal (le style vient des templates LandPro) et polices non bloquantes.
import "./landing.css";
import PublicFonts from "../../components/public/PublicFonts";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicFonts />
      {children}
    </>
  );
}
