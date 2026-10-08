// Route de test locale (non commitée) : rend un template LandPro en mode démo.
import LandingTemplateV4 from "../../../../components/LandingTemplateV4";

export default async function Demo({ params, searchParams }: any) {
  const { id } = await params;
  const sp = await searchParams;
  const locale = sp?.l === "ar" ? "ar" : "fr";
  if (sp?.real)
    return (
      <div style={{ minHeight: "100vh" }}>
        <LandingTemplateV4
          data={{
            templateId: id,
            name: "Produit test",
            price: 199,
            images: ["/template-assets/landpro/holder.svg"],
            locale,
          }}
          preview
        />
      </div>
    );
  return (
    <div style={{ minHeight: "100vh" }}>
      <LandingTemplateV4 data={{ templateId: id, name: "", price: 0, locale }} preview demo />
    </div>
  );
}
