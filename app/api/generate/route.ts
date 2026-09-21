import {NextResponse} from "next/server"; import {createClient} from "@supabase/supabase-js"; import OpenAI from "openai";
function db(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SECRET_KEY;if(!u||!k)throw new Error("Supabase env missing");return createClient(u,k,{auth:{persistSession:false}})}
function slugify(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)}
function parseJson(s:string){const clean=s.replace(/```json|\`\`\`/g,"").trim();return JSON.parse(clean)}
export async function POST(req:Request){try{
 const p=await req.json(); if(!p.name||!p.price)return NextResponse.json({error:"Nom et prix requis"},{status:400});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY manquante dans Vercel"},{status:500});
 const language=p.language||"Darija Maroc";
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
 const prompt=`Tu es un expert e-commerce COD au Maroc. Crée le copywriting d'une landing page de conversion pour ce produit.
Nom: ${p.name}
Prix: ${p.price} MAD
Ancien prix: ${p.oldPrice||"non fourni"}
Description: ${p.description||"non fournie"}
Lien source (contexte seulement, n'invente pas son contenu): ${p.sourceUrl||"non fourni"}
Langue demandée: ${language}
Si Darija Maroc, écris naturellement en darija marocaine en alphabet arabe. N'invente aucune caractéristique technique absente. Retourne UNIQUEMENT du JSON valide avec ces clés: headline,subheadline,description,benefits (tableau de 4 chaînes),cta,delivery,guarantee,faq (tableau de 3 objets question/answer).`;
 const ai=await client.responses.create({model:"gpt-5.6-luna",input:prompt,reasoning:{effort:"low"},store:false});
 const content=parseJson(ai.output_text);
 const slug=slugify(p.name)+"-"+Date.now().toString().slice(-5); const lang=language==="Français"?"fr-MA":language==="English"?"en":"ar-MA";
 const {data,error}=await db().rpc("create_landing_product",{p_name:p.name,p_slug:slug,p_price:Number(p.price),p_old_price:p.oldPrice?Number(p.oldPrice):null,p_description:content.description||p.description||null,p_language:lang}); if(error)throw error;
 return NextResponse.json({page:{...content,price:p.price,oldPrice:p.oldPrice||"",slug:data.slug,url:"/landing/"+data.slug},record:data});
}catch(e:any){return NextResponse.json({error:e?.message||"Erreur génération IA"},{status:500})}}