import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {authContext} from "../../../../lib/server-auth";

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params,{s,workspaceId}=await authContext(req);
  const {data,error}=await s.from("landing_pages").select("id,name,slug,status,locale,created_at,published_at,seo,product_id,products(price,compare_at_price,description)").eq("id",id).eq("workspace_id",workspaceId).is("archived_at",null).maybeSingle();
  if(error)throw error;if(!data)return NextResponse.json({error:"Page introuvable"},{status:404});
  return NextResponse.json({page:data});
 }catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="Non autorisé"?401:500})}
}

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params,b=await req.json(),{s,workspaceId}=await authContext(req);
  const {data:current,error:ce}=await s.from("landing_pages").select("id,slug,seo,product_id").eq("id",id).eq("workspace_id",workspaceId).is("archived_at",null).maybeSingle();
  if(ce)throw ce;if(!current)return NextResponse.json({error:"Page introuvable"},{status:404});

  if(b.status==="PUBLISHED"){
   // Publication is always built atomically from the exact builder payload sent by the editor.
   // Never publish a previously saved snapshot/version by reference.
   if(!b.content||typeof b.content!=="object")return NextResponse.json({error:"Contenu du builder requis pour publier"},{status:400});
   const changes:any={};
   for(const key of ["name","content","price","oldPrice","metaPixelId","images"])if(Object.prototype.hasOwnProperty.call(b,key))changes[key]=b[key];
   if(Array.isArray(changes.images))changes.images=changes.images.filter((x:any)=>typeof x==="string"&&/^https?:\/\//.test(x)).slice(0,10);
   const {data,error}=await s.rpc("publish_landing_page_update",{p_workspace_id:workspaceId,p_landing_page_id:id,p_changes:changes});
   if(error)throw error;
   revalidateTag("landing:"+current.slug);
   return NextResponse.json(data);
  }

  const patch:any={};
  if(b.status!==undefined){patch.status="DRAFT";patch.published_at=null}
  if(typeof b.name==="string"&&b.name.trim())patch.name=b.name.trim().slice(0,200);
  if(b.content&&typeof b.content==="object")patch.seo={...((current.seo as any)||{}),ai_content:{...(((current.seo as any)||{}).ai_content||{}),...b.content}};
  if(b.price!==undefined||b.oldPrice!==undefined){
   const pp:any={};
   if(b.price!==undefined)pp.price=Math.max(0,Number(b.price||0));
   if(b.oldPrice!==undefined)pp.compare_at_price=b.oldPrice===""||b.oldPrice===null?null:Math.max(0,Number(b.oldPrice));
   const {error}=await s.from("products").update(pp).eq("id",current.product_id).eq("workspace_id",workspaceId);if(error)throw error;
  }
  if(b.metaPixelId!==undefined){const pixel=String(b.metaPixelId||"").replace(/\D/g,"").slice(0,30);patch.seo={...(patch.seo||((current.seo as any)||{})),meta_pixel_id:pixel||null}}
  if(Array.isArray(b.images)){const imgs=b.images.filter((x:any)=>typeof x==="string"&&/^https?:\/\//.test(x)).slice(0,10);patch.seo={...(patch.seo||((current.seo as any)||{})),images:imgs}}
  const {data,error}=await s.from("landing_pages").update(patch).eq("id",id).eq("workspace_id",workspaceId).select("id,name,slug,status,published_at,seo").single();
  if(error)throw error;
  if(data?.slug&&(b.status!==undefined||b.content!==undefined||b.price!==undefined||b.oldPrice!==undefined||b.metaPixelId!==undefined||b.images!==undefined))revalidateTag("landing:"+data.slug);
  return NextResponse.json(data);
 }catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="Non autorisé"?401:500})}
}

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params,{s,workspaceId}=await authContext(req);
  const {data,error}=await s.from("landing_pages").update({archived_at:new Date().toISOString(),status:"DRAFT",published_at:null}).eq("id",id).eq("workspace_id",workspaceId).select("id,slug").maybeSingle();
  if(error)throw error;if(!data)return NextResponse.json({error:"Page introuvable"},{status:404});
  revalidateTag("landing:"+data.slug);
  return NextResponse.json({ok:true,archived:true});
 }catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="Non autorisé"?401:500})}
}
