// Site de présentation en français. Servi sur « / » aux visiteurs non connectés (voir proxy.ts).
import type { Metadata } from "next";
import SiteHome from "../../components/site/SiteHome";
import { SITE } from "../../components/site/content";

export const metadata: Metadata = {
  title: SITE.fr.meta.title,
  description: SITE.fr.meta.description,
  alternates: { canonical: "/", languages: { fr: "/", ar: "/ar" } },
};

export default function Page() {
  return <SiteHome lang="fr" salesPhone={String(process.env.LANDPRO_SALES_WHATSAPP || "").replace(/\D/g, "")} />;
}
