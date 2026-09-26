import {adminDb} from "./server-auth";

export async function resolvePublishedMetaPixel(workspaceId:string,landingPageId:string){
 const s=adminDb();
 const {data:lp,error}=await s.from("landing_pages").select("published_version_id").eq("id",landingPageId).eq("workspace_id",workspaceId).maybeSingle();
 if(error||!lp)return null;
 let snapshotPixel="";
 if(lp.published_version_id){
  const {data:v}=await s.from("landing_page_versions").select("config").eq("id",lp.published_version_id).eq("landing_page_id",landingPageId).maybeSingle();
  snapshotPixel=String((v?.config as any)?.seo?.meta_pixel_id||"").replace(/\D/g,"").slice(0,30);
 }
 if(snapshotPixel)return snapshotPixel;
 const {data:px}=await s.from("pixels").select("pixel_id,landing_page_id").eq("workspace_id",workspaceId).eq("provider","META").eq("is_enabled",true).or("landing_page_id.eq."+landingPageId+",landing_page_id.is.null").order("landing_page_id",{ascending:false,nullsFirst:false}).limit(1).maybeSingle();
 return px?.pixel_id?String(px.pixel_id):null;
}
