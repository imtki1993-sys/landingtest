// Connexion, dans le style du site de présentation (Majorelle).
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Se connecter | LandPro",
  description: "Connecte-toi à ton espace LandPro : landings, commandes, équipe et livraison.",
};

export default function Page() {
  return <LoginForm />;
}
