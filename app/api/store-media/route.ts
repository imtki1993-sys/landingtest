import {NextResponse} from "next/server";
import {authContext} from "../../../lib/server-auth";

const BUCKET="media";
const allowed=new Set(["image/jpeg","image/png","image/webp","image/avif","image/gif"]);

export async function POST(req:Request){
 try{
  const {s,workspaceId}=await authContext(req);
  const form=await req.formData();
  const storeId=String(form.get("storeId")||"");
  const file=form.get("file");
  if(!storeId||!(file instanceof File))return NextResponse.json({error:"Fichier ou Store manquant"},{status:400});
  if(!allowed.has(file.type))return NextResponse.json({error:"Format image non supporté"},{status:400});
  if(file.size>10*1024*1024)return NextResponse.json({error:"Image trop volumineuse (10 Mo max)"},{status:400});
  const {data:store}=await s.from("stores").select("id").eq("id",storeId).eq("workspace_id",workspaceId).maybeSingle();
  if(!store)return NextResponse.json({error:"Store introuvable"},{status:404});
  const ext=(file.name.split(".").pop()||file.type.split("/")[1]||"jpg").replace(/[^a-z0-9]/gi,"").toLowerCase();
  const path=`stores/${workspaceId}/${storeId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bytes=new Uint8Array(await file.arrayBuffer());
  const {error}=await s.storage.from(BUCKET).upload(path,bytes,{contentType:file.type,cacheControl:"31536000",upsert:false});
  if(error)throw error;
  const {data}=s.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({url:data.publicUrl,path});
 }catch(e:any){return NextResponse.json({error:e.message||"Upload impossible"},{status:500})}
}
