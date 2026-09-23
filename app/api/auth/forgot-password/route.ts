import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export async function POST(req:Request){
 try{
  const {email}=await req.json();
  if(!email)return NextResponse.json({error:"Email requis"},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_SECRET_KEY;
  if(!url||!key)throw new Error("Supabase env missing");
  const s=createClient(url,key,{auth:{persistSession:false}});
  const origin=new URL(req.url).origin;
  const {error}=await s.auth.resetPasswordForEmail(String(email).trim(),{redirectTo:origin+"/reset-password"});
  if(error)throw error;
  return NextResponse.json({ok:true,message:"Si ce compte existe, un email de réinitialisation a été envoyé."});
 }catch(e:any){return NextResponse.json({error:e.message||"Erreur"},{status:500})}
}