import {unstable_cache} from "next/cache";
import {adminDb} from "./server-auth";

async function loadPublicLanding(slug:string){
 const s=adminDb();
 const {data:lp,error}=await s.from("landing_pages").select("id,workspace_id,name,slug,locale,seo,product_id,status,archived_at,published_version_id").eq("slug",slug).is("archived_at",null).maybeSingle();
 if(error)throw error;
 if(!lp||lp.status!=="PUBLISHED")return null;
 let publishedConfig:any=null;
 if(lp.published_version_id){
  const vr=await s.from("landing_page_versions").select("config").eq("id",lp.published_version_id).eq("landing_page_id",lp.id).maybeSingle();
  publishedConfig=(vr.data?.config as any)||null;
 }
 const [{data:p},{data:w},{data:px}]=await Promise.all([
  s.from("products").select("name,price,compare_at_price,description,image_urls").eq("id",lp.product_id).maybeSingle(),
  s.from("workspaces").select("settings").eq("id",lp.workspace_id).maybeSingle(),
  s.from("pixels").select("pixel_id,is_enabled,landing_page_id").eq("workspace_id",lp.workspace_id).eq("provider","META").eq("is_enabled",true).or("landing_page_id.eq."+lp.id+",landing_page_id.is.null").order("landing_page_id",{ascending:false,nullsFirst:false}).limit(1).maybeSingle()
 ]);
 const activeSeo=publishedConfig?.seo||lp.seo||{},activeProduct=publishedConfig?.product||p||{};
 const whatsapp=(w?.settings as any)?.whatsapp_phone||(activeSeo as any)?.whatsapp_phone||"";
 return {id:lp.id,name:activeProduct?.name||lp.name,price:activeProduct?.price,oldPrice:activeProduct?.compare_at_price,description:activeProduct?.description,locale:lp.locale,content:(activeSeo as any)?.ai_content||{},images:(activeSeo as any)?.images||activeProduct?.image_urls||[],whatsappPhone:String(whatsapp).replace(/\D/g,""),metaPixelId:(activeSeo as any)?.meta_pixel_id||(px?.is_enabled?px.pixel_id:null)};
}

export function getPublicLanding(slug:string){
 return unstable_cache(()=>loadPublicLanding(slug),["public-landing",slug],{revalidate:3600,tags:["landing:"+slug]})();
}
