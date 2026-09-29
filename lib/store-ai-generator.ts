import OpenAI from "openai";
import {generateDesignSystem} from "./design-engine";
import type {Locale,ProductProfile} from "./design-engine/types";

const PROFILES:ProductProfile[]=["automotive-tech","beauty","fashion-luxury","health-wellness","sport-fitness","home-lifestyle","electronics-tech","kids-family","general"];
const NICHE_RULES:{test:RegExp;profile:ProductProfile;template:string}[]=[
 {test:/auto|voiture|car|automobile/i,profile:"automotive-tech",template:"free-24"},
 {test:/moto|scooter|motor/i,profile:"automotive-tech",template:"free-25"},
 {test:/abaya|khimar|mode|fashion|bijou|montre|lunette|sac|luxe|premium/i,profile:"fashion-luxury",template:"free-08"},
 {test:/beaut|cosm|parfum|skincare|makeup/i,profile:"beauty",template:"free-13"},
 {test:/sant|wellness|bien.?etre|orthop|care/i,profile:"health-wellness",template:"free-19"},
 {test:/sport|fitness|gym|running|sneaker/i,profile:"sport-fitness",template:"free-18"},
 {test:/maison|home|cuisine|kitchen|deco/i,profile:"home-lifestyle",template:"free-20"},
 {test:/tech|electron|gadget|smart|phone|computer/i,profile:"electronics-tech",template:"free-22"},
 {test:/bebe|baby|kids|enfant/i,profile:"kids-family",template:"free-15"}
];

function cleanJson(v:string){return JSON.parse(v.replace(/```json|```/g,"").trim())}
function chooseProfile(niche:string,aiProfile?:string){if(PROFILES.includes(aiProfile as ProductProfile))return aiProfile as ProductProfile;return NICHE_RULES.find(x=>x.test.test(niche))?.profile||"general"}
function chooseTemplate(niche:string,profile:ProductProfile){return NICHE_RULES.find(x=>x.test.test(niche))?.template||({general:"free-02","fashion-luxury":"free-08",beauty:"free-13","health-wellness":"free-19","sport-fitness":"free-18","home-lifestyle":"free-20","electronics-tech":"free-22","automotive-tech":"free-24","kids-family":"free-15"} as any)[profile]||"free-02"}

export async function generateProfessionalStore(input:{client:OpenAI;name:string;locale:Locale;niche:string}){
 const language=input.locale==="fr"?"français":input.locale==="ar"?"arabe standard":"darija marocaine en alphabet arabe";
 const prompt=`Tu es directeur e-commerce senior, copywriter conversion, brand strategist et UX content designer.
Tu dois créer le CONTENU COMPLET d'une boutique e-commerce professionnelle pour LandPro.

Nom de la boutique: ${input.name}
Niche: ${input.niche}
Langue obligatoire: ${language}
Marché principal: Maroc
Contexte: boutique e-commerce avec paiement à la livraison possible.

Objectif: produire un site crédible, premium, cohérent, moderne, orienté conversion, sans inventer de certifications, statistiques, avis clients, garanties légales, résultats médicaux ou caractéristiques produit non fournies.

Tu dois:
- définir le positionnement et le ton de marque;
- écrire un Hero professionnel;
- proposer catégories et navigation;
- produire bénéfices, storytelling, proposition de valeur et éléments de confiance;
- créer les sections Accueil de A à Z;
- créer le contenu Boutique, Livraison, Contact et FAQ;
- fournir titres SEO;
- recommander un profil visuel adapté à la niche;
- utiliser une hiérarchie courte, claire et mobile-first;
- éviter le contenu générique répétitif;
- en darija, écrire naturellement en alphabet arabe marocain;\n- créer visual_plan comme directeur artistique e-commerce: prompts photoréalistes premium cohérents avec la niche, lumière crédible, composition publicitaire, sans texte intégré, sans logo inventé, sans prix, sans badge et sans caractéristiques produit non fournies;\n- Hero: cadrage large 16:9 avec espace négatif pour le contenu UI; Story: image éditoriale 4:5; Catégories: images 1:1 distinctes et cohérentes;\n- ne jamais inventer un produit précis: si aucun produit/référence visuelle n’est fourni, générer uniquement un univers de marque/lifestyle/catégorie générique.

Choisis design_profile uniquement parmi:
automotive-tech, beauty, fashion-luxury, health-wellness, sport-fitness, home-lifestyle, electronics-tech, kids-family, general.

Retourne UNIQUEMENT un JSON valide:
{
"design_profile":"",
"brand":{"tagline":"","positioning":"","tone":"","seo_title":"","seo_description":""},
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
}`;
 const ai=await input.client.responses.create({model:"muse-spark-1.3-contributor",input:prompt,reasoning:{effort:"low"},store:false});
 const c=cleanJson(ai.output_text);
 const profile=chooseProfile(input.niche,c.design_profile);
 const templateId=chooseTemplate(input.niche,profile);
 const ds=generateDesignSystem({page:"store",profile,locale:input.locale,goal:"commerce",variance:profile==="fashion-luxury"?4:profile==="sport-fitness"||profile==="automotive-tech"?7:6,motion:4,density:4});
 const rtl=input.locale!=="fr";
 const pageSections={home:[
  {id:"ai_benefits",type:"benefits",visible:true,variant:"cards",title:c.benefits?.title||"",items:(c.benefits?.items||[]).map((x:any)=>x.title&&x.text?x.title+" — "+x.text:x.title||x.text).filter(Boolean)},
  {id:"ai_story",type:"imageText",visible:true,variant:"split",title:c.story?.title||"",text:c.story?.text||"",button:c.story?.cta||"",image:""},
  {id:"ai_products",type:"products",visible:true,variant:"grid",title:c.featured?.title||""},
  {id:"ai_reviews",type:"reviews",visible:true,variant:"cards",title:c.reviews?.title||"",text:c.reviews?.intro||"",items:[]},
  {id:"ai_cta",type:"cta",visible:true,variant:"banner",title:c.cta?.title||"",text:c.cta?.text||"",button:c.cta?.button||"",url:""}
 ],shop:[],product:[],delivery:[{id:"ai_delivery",type:"benefits",visible:true,variant:"cards",title:c.delivery?.title||"",text:c.delivery?.intro||"",items:c.delivery?.points||[]}],contact:[{id:"ai_contact_intro",type:"text",visible:true,variant:"default",title:c.contact?.title||"",text:c.contact?.intro||""}],faq:[]};
 return {
  templateId,profile,content:c,
  settings:{aiGenerated:true,aiEngine:"meta-store-v1",aiNiche:input.niche,aiDirection:ds.style,designSystem:ds,primary:ds.colors.primary,accent:ds.colors.accent,storeBackground:ds.colors.background,headerBackground:ds.colors.primary,headerTextColor:ds.colors.onPrimary,headerMenuBackground:ds.colors.surface,headerMenuTextColor:ds.colors.text,headerCartColor:ds.colors.accent,headingFont:ds.typography.headingFont,bodyFont:ds.typography.bodyFont,bodyLineHeight:ds.typography.lineHeight,textDirection:ds.typography.direction,announcement:c.announcement||"",heroEyebrow:c.hero?.eyebrow||"",heroTitle:c.hero?.title||input.name,heroText:c.hero?.text||"",heroButton:c.hero?.cta||(rtl?"شوف المتجر":"Découvrir la boutique"),heroSecondaryButton:c.hero?.secondary_cta||"",collectionTitle:c.featured?.title||(rtl?"اختياراتنا":"Notre sélection"),collectionSubtitle:c.featured?.subtitle||"",categories:Array.isArray(c.categories)?c.categories:[],trustContent:c.trust,visualPlan:c.visual_plan||null,visualGenerationStatus:"planned",showAnnouncement:true,showProducts:true,showTrust:true,showFooter:true,showFaq:true,selectedProductIds:[],sectionOrder:["hero","ai_benefits","ai_story","products","ai_reviews","trust","ai_cta","faq","footer"],homeLayoutOrder:["native:hero","ai_benefits","ai_story","native:products","ai_reviews","native:trust","ai_cta","native:faq"],pageSections,faq:(c.faq||[]).map((x:any)=>({q:x.question,a:x.answer})),brandContent:c.brand,deliveryContent:c.delivery,contactContent:c.contact,footerContent:c.footer,generatedFor:input.name}
 }
}