import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import OpenAI from "openai";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}
function parseJson(s: string) {
  return JSON.parse(s.replace(/```json|```/g, "").trim());
}

const supplierHosts=new Set(["alibaba.com","www.alibaba.com","m.alibaba.com","aliexpress.com","www.aliexpress.com","m.aliexpress.com"]);
function cleanHtml(v:string){return v.replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim()}
function meta(html:string,key:string){for(const tag of html.match(/<meta[^>]*>/gi)||[]){if(tag.includes('property="'+key+'"')||tag.includes('name="'+key+'"')||tag.includes("property='"+key+"'")||tag.includes("name='"+key+"'")){const m=tag.match(/content=["']([^"']*)["']/i);if(m)return cleanHtml(m[1])}}return ""}
async function supplierData(raw:any){if(!raw)return {brief:"",images:[] as string[]};try{const u=new URL(String(raw));if(u.protocol!=="https:"||!supplierHosts.has(u.hostname.toLowerCase()))return {brief:"",images:[] as string[]};const r=await fetch(u.toString(),{headers:{"user-agent":"Mozilla/5.0 (compatible; LandingPageMotor/1.0)","accept-language":"fr-FR,fr;q=0.9,en;q=0.8"},redirect:"follow",signal:AbortSignal.timeout(10000)});if(!r.ok)return {brief:"",images:[] as string[]};const finalUrl=new URL(r.url);if(!supplierHosts.has(finalUrl.hostname.toLowerCase()))return {brief:"",images:[] as string[]};const html=(await r.text()).slice(0,2500000),title=meta(html,"og:title")||meta(html,"twitter:title")||cleanHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||""),description=meta(html,"og:description")||meta(html,"description")||meta(html,"twitter:description"),images=[meta(html,"og:image"),meta(html,"twitter:image")].filter(Boolean);return {brief:[title,description].filter(Boolean).join("\n\n").slice(0,3500),images:[...new Set(images)].slice(0,10)}}catch{return {brief:"",images:[] as string[]}}}

export async function POST(req: Request) {
  try {
    const p = await req.json();
    if (!p.name || !p.price) return NextResponse.json({ error: "Nom et prix requis" }, { status: 400 });
    

    const language = p.language || "Darija Maroc";
    const supplier=await supplierData(p.sourceUrl);const sourceDescription=[String(p.description||"").trim(),supplier.brief].filter(Boolean).join("\n\n").slice(0,5000);
    const requestedTheme = p.theme || "auto";
    const {s:supabase,workspaceId}=await authContext(req);
    const {data:integration}=await supabase.rpc("get_workspace_integration_secrets",{p_workspace_id:workspaceId});
    const metaKey=integration?.[0]?.openai_api_key||process.env.MODEL_API_KEY;
    if(!metaKey)return NextResponse.json({error:"Ajoute ta MODEL_API_KEY Meta dans Paramètres > Intégrations"},{status:503});
    const client = new OpenAI({ baseURL: "https://api.meta.ai/v1", apiKey: metaKey });
    const prompt = `Tu es directeur artistique et expert landing pages COD Maroc.
Produit: ${p.name}
Prix: ${p.price} MAD. Ancien prix: ${p.oldPrice || "non fourni"}.
Description: ${sourceDescription || "non fournie"}. Langue: ${language}.\nThème visuel demandé: ${requestedTheme}. Si auto, choisis design_profile selon le produit.
Choisis design_profile parmi automotive-tech, beauty, fashion-luxury, health-wellness, sport-fitness, home-lifestyle, electronics-tech, kids-family, general.
Adapte le contenu au type de produit. N'invente aucune caractéristique, certification, statistique, avis client ni résultat. Pour santé/sport, aucune promesse médicale non prouvée. En Darija, utilise un alphabet arabe naturel.
Retourne UNIQUEMENT un JSON valide avec exactement ces clés:
{"design_profile":"","product_category":"","headline":"","subheadline":"","description":"","benefits":["","","",""],"cta":"","delivery":"","problem_title":"","problem_text":"","features_title":"","features":[{"title":"","text":""},{"title":"","text":""},{"title":"","text":""}],"how_title":"","how_steps":["","",""],"trust_title":"","trust_points":["","",""],"guarantee":"","faq":[{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""}]}`;

    const ai = await client.responses.create({ model: "muse-spark-1.3-contributor", input: prompt, reasoning: { effort: "low" }, store: false });
    const content = parseJson(ai.output_text);
    const allowed = ["automotive-tech","beauty","fashion-luxury","health-wellness","sport-fitness","home-lifestyle","electronics-tech","kids-family","general"];
    if (!allowed.includes(content.design_profile)) content.design_profile = "general";
    const theme = requestedTheme === "auto" ? content.design_profile : requestedTheme;
    content.visual_theme = theme;

    const slug = slugify(p.name) + "-" + Date.now().toString().slice(-5);
    const lang = language === "Français" ? "fr-MA" : language === "English" ? "en" : "ar-MA";
    const { data, error } = await supabase.rpc("create_landing_product_for_workspace", {
      p_workspace_id: workspaceId,
      p_name: p.name, p_slug: slug, p_price: Number(p.price),
      p_old_price: p.oldPrice ? Number(p.oldPrice) : null,
      p_description: content.description || p.description || null, p_language: lang
    });
    if (error) throw error;

    const images = [...new Set([...(Array.isArray(p.imageUrls)?p.imageUrls:[]),...supplier.images])].slice(0,10);
    const customHost = `${data.slug}.landpro.online`;
    if (workspaceId) { const {error:domainError}=await supabase.from("domains").upsert({workspace_id:workspaceId,landing_page_id:data.landing_page_id,hostname:customHost,type:"SUBDOMAIN",verification_status:"VERIFIED",ssl_status:"ISSUED",last_checked_at:new Date().toISOString(),last_error:null},{onConflict:"hostname"}); if(domainError) console.error("Domain mapping failed:",domainError.message); }
    const { error: saveError } = await supabase.from("landing_pages").update({
      seo: { ai_content: content, source_url: p.sourceUrl || null, images, visual_theme: theme }
    }).eq("id", data.landing_page_id);
    if (saveError) throw saveError;

    return NextResponse.json({
      page: { ...content, visual_theme: theme, price: p.price, oldPrice: p.oldPrice || "", slug: data.slug, url: "https://" + customHost, fallbackUrl: "/landing/" + data.slug, hostname: customHost, images },
      record: data
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur génération IA" }, { status: 500 });
  }
}
