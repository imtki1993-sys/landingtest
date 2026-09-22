import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}
function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}
function parseJson(s: string) {
  return JSON.parse(s.replace(/```json|```/g, "").trim());
}

export async function POST(req: Request) {
  try {
    const p = await req.json();
    if (!p.name || !p.price) return NextResponse.json({ error: "Nom et prix requis" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY manquante dans Vercel" }, { status: 500 });

    const language = p.language || "Darija Maroc";
    const requestedTheme = p.theme || "auto";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Tu es directeur artistique et expert landing pages COD Maroc.
Produit: ${p.name}
Prix: ${p.price} MAD. Ancien prix: ${p.oldPrice || "non fourni"}.
Description: ${p.description || "non fournie"}. Langue: ${language}.\nThème visuel demandé: ${requestedTheme}. Si auto, choisis design_profile selon le produit.
Choisis design_profile parmi automotive-tech, beauty, fashion-luxury, health-wellness, sport-fitness, home-lifestyle, electronics-tech, kids-family, general.
Adapte le contenu au type de produit. N'invente aucune caractéristique, certification, statistique, avis client ni résultat. Pour santé/sport, aucune promesse médicale non prouvée. En Darija, utilise un alphabet arabe naturel.
Retourne UNIQUEMENT un JSON valide avec exactement ces clés:
{"design_profile":"","product_category":"","headline":"","subheadline":"","description":"","benefits":["","","",""],"cta":"","delivery":"","problem_title":"","problem_text":"","features_title":"","features":[{"title":"","text":""},{"title":"","text":""},{"title":"","text":""}],"how_title":"","how_steps":["","",""],"trust_title":"","trust_points":["","",""],"guarantee":"","faq":[{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""}]}`;

    const ai = await client.responses.create({ model: "gpt-5.6-luna", input: prompt, reasoning: { effort: "low" }, store: false });
    const content = parseJson(ai.output_text);
    const allowed = ["automotive-tech","beauty","fashion-luxury","health-wellness","sport-fitness","home-lifestyle","electronics-tech","kids-family","general"];
    if (!allowed.includes(content.design_profile)) content.design_profile = "general";
    const theme = requestedTheme === "auto" ? content.design_profile : requestedTheme;
    content.visual_theme = theme;

    const slug = slugify(p.name) + "-" + Date.now().toString().slice(-5);
    const lang = language === "Français" ? "fr-MA" : language === "English" ? "en" : "ar-MA";
    const supabase = db();
    const { data, error } = await supabase.rpc("create_landing_product", {
      p_name: p.name, p_slug: slug, p_price: Number(p.price),
      p_old_price: p.oldPrice ? Number(p.oldPrice) : null,
      p_description: content.description || p.description || null, p_language: lang
    });
    if (error) throw error;

    const images = Array.isArray(p.imageUrls) ? p.imageUrls : [];
    const { error: saveError } = await supabase.from("landing_pages").update({
      seo: { ai_content: content, source_url: p.sourceUrl || null, images, visual_theme: theme }
    }).eq("id", data.landing_page_id);
    if (saveError) throw saveError;

    return NextResponse.json({
      page: { ...content, visual_theme: theme, price: p.price, oldPrice: p.oldPrice || "", slug: data.slug, url: "/landing/" + data.slug, images },
      record: data
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur génération IA" }, { status: 500 });
  }
}
