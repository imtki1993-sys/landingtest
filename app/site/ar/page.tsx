// Site de présentation en darija. Servi sur « /ar » (voir proxy.ts).
import type { Metadata } from "next";
import SiteHome from "../../../components/site/SiteHome";
import { SITE } from "../../../components/site/content";

export const metadata: Metadata = {
  title: SITE.ar.meta.title,
  description: SITE.ar.meta.description,
  alternates: { canonical: "/ar", languages: { fr: "/", ar: "/ar" } },
};

export default function Page() {
  return <SiteHome lang="ar" salesPhone={String(process.env.LANDPRO_SALES_WHATSAPP || "").replace(/\D/g, "")} />;
}
