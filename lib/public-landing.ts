import {adminDb} from "./server-auth";
import {resolvePublishedMetaPixel} from "./meta-pixel";
import {getUiuxLibrary} from "./uiux-library-data";

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
 const [{data:p},{data:w},publishedPixel]=await Promise.all([
  s.from("products").select("name,price,compare_at_price,description,image_urls").eq("id",lp.product_id).maybeSingle(),
  s.from("workspaces").select("settings").eq("id",lp.workspace_id).maybeSingle(),
  resolvePublishedMetaPixel(lp.workspace_id,lp.id)
 ]);
 const activeSeo=publishedConfig?.seo||lp.seo||{},activeProduct=publishedConfig?.product||p||{};
 const whatsapp=(activeSeo as any)?.whatsapp_phone||(lp.seo as any)?.whatsapp_phone||(w?.settings as any)?.whatsapp_phone||"";
 const savedContent=(activeSeo as any)?.ai_content||{};
 const content={...savedContent,uiux_library:getUiuxLibrary()};
 return {id:lp.id,name:activeProduct?.name||lp.name,price:activeProduct?.price,oldPrice:activeProduct?.compare_at_price,description:activeProduct?.description,locale:lp.locale,content,images:(activeSeo as any)?.images||activeProduct?.image_urls||[],whatsappPhone:String(whatsapp).replace(/\D/g,""),metaPixelId:publishedPixel};
}

export function getPublicLanding(slug:string){
 return loadPublicLanding(slug);
}
