import OpenAI from "openai";
type Locale="darija"|"ar"|"fr"|"en";
import {getStoreBenchmarkNiche} from "./store-benchmark-niches";
import {BENCHMARK_TEMPLATE_BLUEPRINTS} from "./benchmark-template-registry";

function cleanJson(v:string){return JSON.parse(v.replace(/```json|```/g,"").trim())}

const BENCHMARK_HINTS=[
 "E-commerce: Vibrant & Block-based; Feature-Rich Showcase; strong visual hierarchy and conversion.",
 "E-commerce Luxury: Liquid Glass + Glassmorphism; premium minimal accents; sophisticated editorial imagery.",
 "Automotive: Motion-Driven + 3D/Hyperrealism; dark/light metallic palette; hero-centric showcase.",
 "Beauty/Wellness: Soft UI Evolution + Neumorphism/Minimalism; soft pastel/cream/gold; calming visual hierarchy.",
 "Marketplace: Vibrant Block + Flat Design; feature-rich catalog; trust, filters, seller/buyer clarity.",
 "Fashion/Luxury: premium editorial composition, restrained palette, strong typography and photography.",
 "Electronics/Tech: modern technical interface, clear hierarchy, dark or neutral surface, precise cards.",
 "Home/Lifestyle: warm minimal design, editorial imagery, calm spacing and natural palette.",
 "Sport/Fitness: energetic, bold hierarchy, strong CTA, high contrast and motion used with restraint."
].join("\n");

export async function generateProfessionalStore(input:{client:OpenAI;name:string;locale:Locale;niche:string}){
 const language=input.locale==="fr"?"français":input.locale==="ar"?"arabe standard":"darija marocaine en alphabet arabe";
 const benchmark=getStoreBenchmarkNiche(input.niche);
 const runtimeBlueprint=BENCHMARK_TEMPLATE_BLUEPRINTS[benchmark?.id||input.niche];
 const benchmarkBlueprint=runtimeBlueprint?JSON.stringify({
  id:runtimeBlueprint.id,header:runtimeBlueprint.header,hero:runtimeBlueprint.hero,catalog:runtimeBlueprint.catalog,
  productCard:runtimeBlueprint.productCard,trust:runtimeBlueprint.trust,footer:runtimeBlueprint.footer,sections:runtimeBlueprint.sections
 }):"";
 const benchmarkReference=benchmark?`Référence benchmark sélectionnée: ${benchmark.label} (${benchmark.referencePath}). Utilise cette page comme référence de catégorie, structure, hiérarchie et direction visuelle. Adapte-la au Store LandPro et au contenu généré; ne copie pas de faux témoignages, chiffres, certifications ou garanties.`:"";
 const prompt=`Tu es un expert e-commerce senior qui applique STRICTEMENT la méthode UI/UX Pro Max du benchmark hylarucoder/benchmark-skill-ui-ux-pro-max.

Tu ne dois pas utiliser de template LandPro préconçu ni de palette LandPro historique.
Tu dois construire le design de cette boutique à partir de la méthode:
1. analyser Product Type;
2. choisir Style principal + styles secondaires;
3. choisir Typography pairing;
4. choisir Color palette complète;
5. choisir Landing/E-commerce structure;
6. appliquer UX guidelines et anti-patterns;
7. appliquer les bonnes pratiques Next.js/responsive/accessibilité.

Références benchmark pertinentes:
${BENCHMARK_HINTS}

Règles UI/UX Pro Max obligatoires:
- aucun emoji comme icône UI; préférer une iconographie SVG/Lucide côté rendu;
- contraste texte minimum WCAG AA;
- body mobile >= 16px;
- touch targets >= 44px, CTA principal >= 48px;
- focus clavier visible;
- hover sans layout shift;
- transitions 150-300ms;
- responsive vérifié conceptuellement à 320, 375, 414, 768, 1024, 1440px;
- aucune scrollbar horizontale mobile;
- images responsive, ratios réservés pour éviter CLS;
- hiérarchie H1/H2/H3 cohérente;
- lignes de texte lisibles, spacing cohérent;
- design mobile-first;
- ne pas utiliser de faux témoignages, fausses certifications, faux chiffres ou garanties inventées.

Nom boutique: ${input.name}
Niche: ${benchmark?.label||input.niche}
${benchmarkReference}
${benchmarkBlueprint?`Blueprint runtime LandPro OBLIGATOIRE (ne change pas ses variantes ni son ordre): ${benchmarkBlueprint}`:""}
Langue: ${language}
Marché: Maroc
Contexte: e-commerce, paiement à la livraison possible.

Tu dois produire le CONTENU COMPLET et le DESIGN SYSTEM COMPLET de la boutique.
Le design doit être spécifique à la niche, pas générique.\nSi un Blueprint runtime LandPro est fourni, ton design_system.architecture, tes composants et ton contenu DOIVENT suivre ce blueprint. Ne propose pas une architecture incompatible.

Retourne UNIQUEMENT ce JSON valide:
{
"benchmark_category":"",
"brand":{"tagline":"","positioning":"","tone":"","seo_title":"","seo_description":""},
"design_system":{
 "style":{"primary":"","secondary":["",""],"rationale":""},
 "colors":{"primary":"","secondary":"","accent":"","background":"","surface":"","text":"","muted":"","border":"","on_primary":"","on_accent":""},
 "typography":{"heading_font":"","body_font":"","heading_weight":700,"body_size":16,"line_height":1.6},
 "layout":{"container_width":1200,"section_spacing":72,"radius":16,"density":"balanced"},
 "components":{"hero":"split","product_card":"editorial","button":"solid","gallery":"grid","trust":"cards","faq":"accordion"},
 "motion":{"duration":220,"intensity":"subtle"},
 "responsive":{"mobile_breakpoint":768,"tablet_breakpoint":1024,"button_min_height":48,"input_min_height":44},
 "architecture":{"header":"classic","hero":"split","catalog":"grid","footer":"columns"}
},
"announcement":"",
"hero":{"eyebrow":"","title":"","text":"","cta":"","secondary_cta":""},
"categories":["","",""],
"benefits":{"title":"","items":[{"title":"","text":""},{"title":"","text":""},{"title":"","text":""}]},
"story":{"title":"","text":"","cta":""},
"featured":{"title":"","subtitle":""},
"trust":{"title":"","items":["","",""]},
"reviews":{"title":"","intro":""},
"cta":{"title":"","text":"","button":""},
"delivery":{"title":"","intro":"","points":["","",""]},
"contact":{"title":"","intro":""},
"faq":[{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""}],
"footer":{"about":"","support_title":"","legal_title":""},
"visual_plan":{"art_direction":"","hero":{"prompt":"","aspect_ratio":"16:9"},"story":{"prompt":"","aspect_ratio":"4:5"},"categories":[{"name":"","prompt":"","aspect_ratio":"1:1"},{"name":"","prompt":"","aspect_ratio":"1:1"},{"name":"","prompt":"","aspect_ratio":"1:1"}]}
}

Pour visual_plan:
- photoréaliste premium et cohérent avec le design_system;
- aucun texte, logo, prix ou badge dans l'image;
- ne jamais inventer un produit précis si aucune référence produit n'est fournie;
- Hero 16:9 avec espace négatif pour le texte UI;
- Story 4:5 éditorial;
- catégories 1:1 distinctes.

En darija, écris naturellement en alphabet arabe marocain.`;
 const ai=await input.client.responses.create({model:"muse-spark-1.3-contributor",input:prompt,reasoning:{effort:"low"},store:false});
 const c=cleanJson(ai.output_text);
 const ds=c.design_system||{};
 if(runtimeBlueprint){ds.architecture={header:runtimeBlueprint.header,hero:runtimeBlueprint.hero,catalog:runtimeBlueprint.catalog,footer:runtimeBlueprint.footer};ds.components={...(ds.components||{}),hero:runtimeBlueprint.hero,product_card:runtimeBlueprint.productCard,trust:runtimeBlueprint.trust};}
 const colors=ds.colors||{},type=ds.typography||{},layout=ds.layout||{},components=ds.components||{},responsive=ds.responsive||{},architecture=ds.architecture||{};
 const rtl=input.locale!=="fr";
 const pageSections={home:[
  {id:"ai_benefits",type:"benefits",visible:true,variant:"cards",title:c.benefits?.title||"",items:(c.benefits?.items||[]).map((x:any)=>x.title&&x.text?x.title+" — "+x.text:x.title||x.text).filter(Boolean)},
  {id:"ai_story",type:"imageText",visible:true,variant:"split",title:c.story?.title||"",text:c.story?.text||"",button:c.story?.cta||"",image:""},
  {id:"ai_reviews",type:"reviews",visible:true,variant:"cards",title:c.reviews?.title||"",text:c.reviews?.intro||"",items:[]},
  {id:"ai_cta",type:"cta",visible:true,variant:"banner",title:c.cta?.title||"",text:c.cta?.text||"",button:c.cta?.button||"",url:""}
 ],shop:[],product:[],delivery:[{id:"ai_delivery",type:"benefits",visible:true,variant:"cards",title:c.delivery?.title||"",text:c.delivery?.intro||"",items:c.delivery?.points||[]}],contact:[{id:"ai_contact_intro",type:"text",visible:true,variant:"default",title:c.contact?.title||"",text:c.contact?.intro||""}],faq:[]};
 const normalizedDesignSystem={
  version:"benchmark-ui-ux-pro-max-v1",
  source:"hylarucoder/benchmark-skill-ui-ux-pro-max",
  benchmarkCategory:c.benchmark_category||"E-commerce",
  style:ds.style?.primary||"UI/UX Pro Max",
  colors:{
   primary:colors.primary||"#111827",secondary:colors.secondary||"#e5e7eb",accent:colors.accent||"#2563eb",
   background:colors.background||"#ffffff",surface:colors.surface||"#ffffff",text:colors.text||"#0f172a",
   muted:colors.muted||"#475569",border:colors.border||"#e2e8f0",onPrimary:colors.on_primary||"#ffffff",onAccent:colors.on_accent||"#ffffff"
  },
  typography:{headingFont:type.heading_font||(rtl?"Cairo":"Inter"),bodyFont:type.body_font||(rtl?"Tajawal":"Inter"),headingScale:[30,40,52,64],bodySize:Math.max(16,Number(type.body_size)||16),lineHeight:Number(type.line_height)||1.6,direction:rtl?"rtl":"ltr",headingWeight:Number(type.heading_weight)||700},
  layout:{density:layout.density||"balanced",containerWidth:Number(layout.container_width)||1200,sectionSpacing:Number(layout.section_spacing)||72,radius:Number(layout.radius)||16},
  motion:{intensity:ds.motion?.intensity||"subtle",duration:Math.min(300,Math.max(150,Number(ds.motion?.duration)||220))},
  components:{hero:components.hero||"split",productCard:components.product_card||"editorial",button:components.button||"solid",gallery:components.gallery||"grid",testimonials:"cards",trust:components.trust||"cards",faq:components.faq||"accordion"},
  responsive:{mobileBreakpoint:Number(responsive.mobile_breakpoint)||768,tabletBreakpoint:Number(responsive.tablet_breakpoint)||1024,buttonMinHeight:Math.max(48,Number(responsive.button_min_height)||48),inputMinHeight:Math.max(44,Number(responsive.input_min_height)||44)},
  accessibility:{wcagAA:true},
  architecture:{header:architecture.header||"classic",hero:architecture.hero||components.hero||"split",catalog:architecture.catalog||"grid",footer:architecture.footer||"columns"}
 };
 return {
  templateId:"benchmark-ai",
  profile:c.benchmark_category||"E-commerce",
  content:c,
  settings:{
   aiGenerated:true,aiEngine:"benchmark-ui-ux-pro-max-v1",aiNiche:input.niche,aiDirection:normalizedDesignSystem.style,
   benchmarkSource:"hylarucoder/benchmark-skill-ui-ux-pro-max",benchmarkNicheId:benchmark?.id||input.niche,benchmarkReferencePath:benchmark?.referencePath||null,benchmarkCategory:c.benchmark_category||benchmark?.label||"E-commerce",
   designSystem:normalizedDesignSystem,storeArchitecture:normalizedDesignSystem.architecture,
   primary:normalizedDesignSystem.colors.primary,accent:normalizedDesignSystem.colors.accent,storeBackground:normalizedDesignSystem.colors.background,
   headerBackground:normalizedDesignSystem.colors.surface,headerTextColor:normalizedDesignSystem.colors.text,
   headerMenuBackground:normalizedDesignSystem.colors.surface,headerMenuTextColor:normalizedDesignSystem.colors.text,headerCartColor:normalizedDesignSystem.colors.accent,
   headingFont:normalizedDesignSystem.typography.headingFont,bodyFont:normalizedDesignSystem.typography.bodyFont,bodyLineHeight:normalizedDesignSystem.typography.lineHeight,
   textDirection:normalizedDesignSystem.typography.direction,headingWeight:normalizedDesignSystem.typography.headingWeight,
   announcement:c.announcement||"",heroEyebrow:c.hero?.eyebrow||"",heroTitle:c.hero?.title||input.name,heroText:c.hero?.text||"",
   heroButton:c.hero?.cta||(rtl?"شوف المتجر":"Découvrir la boutique"),heroSecondaryButton:c.hero?.secondary_cta||"",
   collectionTitle:c.featured?.title||(rtl?"اختياراتنا":"Notre sélection"),collectionSubtitle:c.featured?.subtitle||"",
   categories:Array.isArray(c.categories)?c.categories:[],trustContent:c.trust,visualPlan:c.visual_plan||null,visualGenerationStatus:"planned",
   showAnnouncement:true,showProducts:true,showTrust:true,showFooter:true,showFaq:true,selectedProductIds:[],
   sectionOrder:runtimeBlueprint?[...runtimeBlueprint.sections,"footer"]:["hero","ai_benefits","ai_story","products","ai_reviews","trust","ai_cta","faq","footer"],
   homeLayoutOrder:runtimeBlueprint?runtimeBlueprint.sections.map((id:string)=>"native:"+id):["native:hero","ai_benefits","ai_story","native:products","ai_reviews","native:trust","ai_cta","native:faq"],
   pageSections,faq:(c.faq||[]).map((x:any)=>({q:x.question,a:x.answer})),brandContent:c.brand,deliveryContent:c.delivery,contactContent:c.contact,footerContent:c.footer,generatedFor:input.name
  }
 }
}
