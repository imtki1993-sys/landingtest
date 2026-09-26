import {NextResponse} from "next/server";
import {adminDb,authContext} from "../../../../lib/server-auth";
import {resolvePublishedMetaPixel} from "../../../../lib/meta-pixel";

export async function GET(req:Request,{params}:{params:Promise<{slug:string}>}){
 try{
  const {slug}=await params,url=new URL(req.url),preview=url.searchParams.get("preview")==="1",s=adminDb();
  const {data:lp,error}=await s.from("landing_pages").select("id,workspace_id,name,slug,locale,seo,product_id,status,archived_at,published_version_id").eq("slug",slug).is("archived_at",null).maybeSingle();
  if(error||!lp)return NextResponse.json({error:"Not found"},{status:404});

  if(preview){
   try{const a=await authContext(req);if(a.workspaceId!==lp.workspace_id&&!a.isPlatformAdmin)return NextResponse.json({error:"Not found"},{status:404})}
   catch{return NextResponse.json({error:"Non autorisé"},{status:401})}
  }else if(lp.status!=="PUBLISHED")return NextResponse.json({error:"Not found"},{status:404});

  let publishedConfig:any=null;
  if(!preview&&lp.published_version_id){
   const vr=await s.from("landing_page_versions").select("config").eq("id",lp.published_version_id).eq("landing_page_id",lp.id).maybeSingle();
   publishedConfig=(vr.data?.config as any)||null;
  }
  const [{data:p},{data:w},publishedPixel]=await Promise.all([
   s.from("products").select("name,price,compare_at_price,description,image_urls").eq("id",lp.product_id).maybeSingle(),
   s.from("workspaces").select("settings").eq("id",lp.workspace_id).maybeSingle(),
   preview?Promise.resolve(null):resolvePublishedMetaPixel(lp.workspace_id,lp.id)
  ]);
  const activeSeo=preview?(lp.seo||{}):(publishedConfig?.seo||lp.seo||{});
  const activeProduct=preview?(p||{}):(publishedConfig?.product||p||{});
  const whatsapp=(w?.settings as any)?.whatsapp_phone||(activeSeo as any)?.whatsapp_phone||"";
  const payload={id:lp.id,name:activeProduct?.name||lp.name,price:activeProduct?.price,oldPrice:activeProduct?.compare_at_price,description:activeProduct?.description,locale:lp.locale,content:(activeSeo as any)?.ai_content||{},images:(activeSeo as any)?.images||activeProduct?.image_urls||[],whatsappPhone:String(whatsapp).replace(/\D/g,""),metaPixelId:preview?((activeSeo as any)?.meta_pixel_id||null):publishedPixel};
  return NextResponse.json(payload,{headers:preview?{"Cache-Control":"private, no-store"}:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=3600"}});
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
