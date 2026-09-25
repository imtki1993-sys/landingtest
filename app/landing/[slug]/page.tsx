import {headers} from "next/headers";
import LandingClient from "./LandingClient";

export const revalidate=300;

export default async function LandingPage({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{preview?:string}>}){
 const {slug}=await params,{preview}=await searchParams;
 if(preview==="1")return <LandingClient initialSlug={slug}/>;
 const h=await headers(),host=h.get("host")||"localhost",proto=h.get("x-forwarded-proto")||"https";
 try{
  const r=await fetch(proto+"://"+host+"/api/landing/"+encodeURIComponent(slug),{next:{revalidate:300,tags:["landing:"+slug]}});
  if(!r.ok)return <div className="lp-loading">Page introuvable</div>;
  const data=await r.json();
  return <LandingClient initialSlug={slug} initialData={data}/>;
 }catch{
  return <LandingClient initialSlug={slug}/>;
 }
}
