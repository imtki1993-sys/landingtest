import {NextResponse} from "next/server";
import {authContext} from "../../../lib/server-auth";
import OpenAI from "openai";

function parseJson(s:string){return JSON.parse(s.replace(/```json|```/g,"").trim())}
const themeRules:Record<string,string>={
"cod-s11":"conversion produit gagnant, direct, démonstration et offre COD",
"cod-auto-moto":"auto/moto, robuste, pratique, sécurité et usage quotidien",
"cod-electronics":"technologique, moderne, bénéfices clairs sans inventer de spécifications",
"cod-beauty":"élégant, rassurant, routine beauté sans promesses non prouvées",
"cod-health":"rassurant et confort, aucune promesse médicale",
"cod-home":"pratique, maison, gain de temps et simplicité",
"cod-fashion":"éditorial, tendance, style et usage",
"cod-sport":"énergique, performance d'usage sans promesses médicales",
"cod-kids":"familial, rassurant, simple, sans allégation de sécurité non fournie",
"cod-luxury":"premium, sobre, élégant, valeur perçue",
"cod-decor":"chaleureux, décoration, ambiance et artisanat sans inventer l'origine"
};

export async function POST(req:Request){
 try{
  const p=await req.json(),section=p.section||"all",theme=p.theme||"cod-s11",language=p.language||"Darija Maroc";
  if(!p.name)return NextResponse.json({error:"Nom du produit requis"},{status:400});
  const {s,workspaceId}=await authContext(req);
  const {data:integration}=await s.rpc("get_workspace_integration_secrets",{p_workspace_id:workspaceId});
  const key=integration?.[0]?.openai_api_key||process.env.MODEL_API_KEY;
  if(!key)return NextResponse.json({error:"MODEL_API_KEY Meta manquante"},{status:503});
  const client=new OpenAI({baseURL:"https://api.meta.ai/v1",apiKey:key});
  const brief=String(p.description||"aucun").trim().slice(0,3500);\n  const facts=`Produit: ${p.name}. Prix: ${p.price??"non fourni"} MAD. Ancien prix: ${p.oldPrice||"non fourni"}. Faits produit: ${brief}. Thème: ${theme} (${themeRules[theme]||"COD ecommerce"}). Langue: ${language}.`;
  const schemas:Record<string,string>={
   hero:'{"headline":"","subheadline":"","cta":"","delivery":""}',
   benefits:'{"description":"","benefits":["","","",""]}',
   problem:'{"problem":"","solution":"","problem_title":"","problem_text":""}',
   features:'{"features_title":"","features":["","",""]}',
   how:'{"how_title":"","how_steps":["","",""]}',
   trust:'{"trust_title":"","trust_points":["","",""]}',
   faq:'{"faq":[{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""}]}',
   all:'{"headline":"","subheadline":"","description":"","benefits":["","","",""],"cta":"","delivery":"","problem":"","solution":"","problem_title":"","problem_text":"","features_title":"","features":["","",""],"how_title":"","how_steps":["","",""],"trust_title":"","trust_points":["","",""],"faq":[{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""}]}'
  };
  const prompt=`Landing COD Maroc. Écris uniquement le contenu demandé, sans HTML/CSS. Utilise seulement les faits fournis; n’invente aucune caractéristique, certification, statistique, témoignage, garantie, résultat ou urgence. Santé/sport: aucune promesse médicale. Darija: alphabet arabe naturel. Ton adapté au thème. ${facts} Section: "${section}". Réponds UNIQUEMENT avec ce JSON valide: ${schemas[section]||schemas.all}`;
  const ai=await client.responses.create({model:"muse-spark-1.3-contributor",input:prompt,reasoning:{effort:"low"},store:false});
  const content=parseJson(ai.output_text);
  const usage=(ai as any).usage||null;\n  return NextResponse.json({content,section,usage});
 }catch(e:any){return NextResponse.json({error:e?.message||"Erreur génération contenu"},{status:500})}
}
