import LandingClient from "./LandingClient";
import {getPublicLanding} from "../../../lib/public-landing";

export const revalidate=300;

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
