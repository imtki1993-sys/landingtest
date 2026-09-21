import {NextResponse} from "next/server"; import {createClient} from "@supabase/supabase-js"; import OpenAI from "openai";
function db(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SECRET_KEY;if(!u||!k)throw new Error("Supabase env missing");return createClient(u,k,{auth:{persistSession:false}})}
function slugify(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)}
function parseJson(s:string){return JSON.parse(s.replace(/```json|```/g,"").trim())}
export async function POST(req:Request){try{const p=await req.json();if(!p.name||!p.price)return NextResponse.json({error:"Nom et prix requis"},{status:400});if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY manquante dans Vercel"},{status:500});
const language=p.language||"Darija Maroc",client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
}