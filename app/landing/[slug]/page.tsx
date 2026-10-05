import LandingClient from "./LandingClient";
import type {Metadata} from "next";
import {getPublicLanding} from "../../../lib/public-landing";

const clean=(v:any,max:number)=>String(v||"").replace(/\s+/g," ").trim().slice(0,max);

// Titre, description et image d'aperçu propres à chaque landing page
// (onglet du navigateur, Google, partages WhatsApp / Facebook).
export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{preview?:string}>}):Promise<Metadata>{
 const {slug}=await params,{preview}=await searchParams;
 if(preview==="1")return {title:"Aperçu",robots:{index:false,follow:false}};
 try{
  const d:any=await getPublicLanding(slug);
  if(!d)return {title:"Page introuvable",robots:{index:false}};
  const c=d.content||{};
  const title=clean(c.seo_title||c.headline||d.name,70)||"Commander";
  const description=clean(c.seo_description||c.subheadline||c.description||d.description,160);
  const image=(Array.isArray(d.images)?d.images:[]).find((x:any)=>typeof x==="string"&&/^https?:\/\//.test(x));
  const locale=String(d.locale||"fr").replace("-","_");
  return {title,description,openGraph:{title,description,type:"website",locale,images:image?[{url:image}]:undefined},twitter:{card:image?"summary_large_image":"summary",title,description,images:image?[image]:undefined}};
 }catch{return {title:"Commander"}}
}

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function LandingPage({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{preview?:string}>}){
 const {slug}=await params,{preview}=await searchParams;
 if(preview==="1")return <LandingClient initialSlug={slug}/>;
 try{
  const data=await getPublicLanding(slug);
  if(!data)return <div className="lp-loading">Page introuvable</div>;
  return <LandingClient initialSlug={slug} initialData={data}/>;
 }catch{
  return <div className="lp-loading">Page indisponible</div>;
 }
}
