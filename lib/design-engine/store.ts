import{generateDesignSystem}from"./engine";import type{Locale,ProductProfile}from"./types";
const TEMPLATE_PROFILES:ProductProfile[]=["general","general","general","general","electronics-tech","fashion-luxury","fashion-luxury","fashion-luxury","fashion-luxury","fashion-luxury","fashion-luxury","fashion-luxury","beauty","beauty","kids-family","fashion-luxury","sport-fitness","sport-fitness","health-wellness","home-lifestyle","home-lifestyle","electronics-tech","electronics-tech","automotive-tech","automotive-tech","general","general","fashion-luxury","fashion-luxury","general"];
const DARK_TEMPLATES=new Set([5,29]);
type Architecture={header:"classic"|"centered"|"minimal"|"bold";hero:"split"|"editorial"|"centered"|"product-focus"|"full-bleed";catalog:"grid"|"editorial"|"dense"|"marketplace";card:"commerce"|"minimal"|"soft"|"technical"|"bold";footer:"columns"|"minimal"|"brand";columns:number;imageRatio:"square"|"portrait"|"landscape";sectionOrder:string[]};
const A:Architecture[]=[
{header:"classic",hero:"split",catalog:"grid",card:"commerce",footer:"columns",columns:3,imageRatio:"square",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"bold",hero:"full-bleed",catalog:"grid",card:"commerce",footer:"columns",columns:4,imageRatio:"square",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"classic",hero:"centered",catalog:"grid",card:"soft",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"minimal",hero:"editorial",catalog:"editorial",card:"minimal",footer:"minimal",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","faq","trust","footer"]},
{header:"minimal",hero:"full-bleed",catalog:"dense",card:"technical",footer:"minimal",columns:4,imageRatio:"landscape",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"centered",hero:"editorial",catalog:"editorial",card:"soft",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"classic",hero:"editorial",catalog:"editorial",card:"minimal",footer:"columns",columns:4,imageRatio:"portrait",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"minimal",hero:"editorial",catalog:"editorial",card:"minimal",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","faq","trust","footer"]},
{header:"centered",hero:"centered",catalog:"editorial",card:"soft",footer:"brand",columns:3,imageRatio:"square",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"minimal",hero:"product-focus",catalog:"grid",card:"technical",footer:"minimal",columns:4,imageRatio:"square",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"centered",hero:"full-bleed",catalog:"editorial",card:"soft",footer:"minimal",columns:3,imageRatio:"landscape",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"classic",hero:"editorial",catalog:"grid",card:"soft",footer:"columns",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"centered",hero:"editorial",catalog:"editorial",card:"soft",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"minimal",hero:"full-bleed",catalog:"editorial",card:"minimal",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","faq","trust","footer"]},
{header:"centered",hero:"centered",catalog:"grid",card:"soft",footer:"columns",columns:3,imageRatio:"square",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"bold",hero:"full-bleed",catalog:"grid",card:"bold",footer:"minimal",columns:4,imageRatio:"portrait",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"bold",hero:"product-focus",catalog:"dense",card:"bold",footer:"columns",columns:4,imageRatio:"square",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"bold",hero:"full-bleed",catalog:"dense",card:"bold",footer:"columns",columns:4,imageRatio:"landscape",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"classic",hero:"split",catalog:"grid",card:"soft",footer:"columns",columns:3,imageRatio:"square",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"minimal",hero:"editorial",catalog:"editorial",card:"minimal",footer:"brand",columns:3,imageRatio:"landscape",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"classic",hero:"split",catalog:"grid",card:"soft",footer:"columns",columns:4,imageRatio:"square",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"minimal",hero:"product-focus",catalog:"dense",card:"technical",footer:"minimal",columns:4,imageRatio:"landscape",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"bold",hero:"product-focus",catalog:"dense",card:"technical",footer:"columns",columns:4,imageRatio:"square",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"bold",hero:"product-focus",catalog:"grid",card:"technical",footer:"minimal",columns:4,imageRatio:"landscape",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"bold",hero:"full-bleed",catalog:"dense",card:"technical",footer:"minimal",columns:4,imageRatio:"landscape",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"minimal",hero:"product-focus",catalog:"grid",card:"commerce",footer:"minimal",columns:3,imageRatio:"square",sectionOrder:["hero","trust","products","faq","footer"]},
{header:"bold",hero:"centered",catalog:"dense",card:"bold",footer:"columns",columns:4,imageRatio:"square",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"centered",hero:"editorial",catalog:"editorial",card:"soft",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","trust","faq","footer"]},
{header:"minimal",hero:"full-bleed",catalog:"editorial",card:"minimal",footer:"brand",columns:3,imageRatio:"portrait",sectionOrder:["hero","products","faq","trust","footer"]},
{header:"bold",hero:"split",catalog:"marketplace",card:"commerce",footer:"columns",columns:5,imageRatio:"square",sectionOrder:["hero","trust","products","faq","footer"]}];
export function getStoreTemplateDesign(templateId:string,locale:Locale="fr"){const n=Math.max(1,Math.min(30,Number(templateId.replace("free-",""))||1)),arch=A[n-1],ds=generateDesignSystem({page:"store",profile:TEMPLATE_PROFILES[n-1],locale,goal:"commerce",mode:DARK_TEMPLATES.has(n)?"dark":undefined,variance:n===4||n===29?3:n===27||n===28?8:6,motion:4,density:n===30?7:4});return{...ds,components:{...ds.components,hero:arch.hero,productCard:arch.card},architecture:arch}}
export function designSystemToStoreSettings(ds:ReturnType<typeof getStoreTemplateDesign>){const a=ds.architecture;return{primary:ds.colors.primary,accent:ds.colors.accent,storeBackground:ds.colors.background,headerBackground:ds.colors.primary,headerTextColor:ds.colors.onPrimary,headerMenuBackground:ds.colors.surface,headerMenuTextColor:ds.colors.text,headerCartColor:ds.colors.accent,headingFont:ds.typography.headingFont,bodyFont:ds.typography.bodyFont,bodyLineHeight:ds.typography.lineHeight,textDirection:ds.typography.direction,productCardStyle:a.card,productImageRatio:a.imageRatio,catalogColumnsDesktop:a.columns,productColumnsDesktop:a.columns,sectionOrder:a.sectionOrder,storeArchitecture:a,designSystem:ds}}
