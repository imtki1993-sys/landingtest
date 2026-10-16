// Inscription, dans le style du site de présentation (Majorelle).
import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Créer ton compte | LandPro",
  description: "Crée ton compte LandPro et active-le avec ta clé reçue sur WhatsApp.",
};

export default function Page() {
  return <SignupForm salesPhone={String(process.env.LANDPRO_SALES_WHATSAPP || "").replace(/\D/g, "")} />;
}
