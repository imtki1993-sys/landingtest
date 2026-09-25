import {NextResponse} from "next/server";import {serviceDb,syncOzonOrder} from "../../../../lib/ozon";
export const maxDuration=60;
export async function GET(req:Request){try{
 const secret=process.env.CRON_SECRET;if(!secret)return NextResponse.json({error:"CRON_SECRET manquant"},{status:503});if(req.headers.get("authorization")!=="Bearer "+secret)return NextResponse.json({error:"Non autorisé"},{status:401});
 const s=serviceDb(),now=new Date().toISOString();
 const {data:carriers,error:ce}=await s.from("delivery_companies").select("id,workspace_id,settings").eq("code","OZON_EXPRESS").eq("is_active",true);if(ce)throw ce;
 let queued=0,checked=0,updated=0,failed=0;
 for(const carrier of carriers||[]){const cfg:any=carrier.settings||{};if(!cfg.client_id||!cfg.api_key)continue;
  const {data:orders}=await s.from("orders").select("id,workspace_id,tracking_number,delivery_company_id,shipment_status,shipped_at,delivered_at,returned_at").eq("workspace_id",carrier.workspace_id).eq("delivery_company_id",carrier.id).not("tracking_number","is",null).not("shipment_status","in",'("DELIVERED","RETURNED","CANCELLED")').limit(100);
  for(const o of orders||[]){await s.from("delivery_sync_jobs").upsert({workspace_id:o.workspace_id,order_id:o.id,delivery_company_id:carrier.id,status:"PENDING",available_at:now,updated_at:now},{onConflict:"order_id",ignoreDuplicates:true});queued++}
 }
 const {data:jobs,error:je}=await s.from("delivery_sync_jobs").select("id,workspace_id,order_id,delivery_company_id,attempts").in("status",["PENDING","FAILED"]).lte("available_at",now).order("created_at").limit(50);if(je)throw je;
 for(const job of jobs||[]){checked++;await s.from("delivery_sync_jobs").update({status:"PROCESSING",locked_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",job.id);
  try{const [{data:o},{data:c}]=await Promise.all([s.from("orders").select("id,workspace_id,tracking_number,delivery_company_id,shipment_status,shipped_at,delivered_at,returned_at").eq("id",job.order_id).maybeSingle(),s.from("delivery_companies").select("settings").eq("id",job.delivery_company_id).maybeSingle()]);if(!o||!c)throw new Error("Order or carrier missing");const before=o.shipment_status,x=await syncOzonOrder(s,o,c.settings||{});if(x.shipment!==before)updated++;await s.from("delivery_sync_jobs").update({status:"DONE",attempts:Number(job.attempts||0)+1,last_error:null,updated_at:new Date().toISOString()}).eq("id",job.id)}
  catch(e:any){failed++;const attempts=Number(job.attempts||0)+1,delay=Math.min(3600,Math.pow(2,Math.min(attempts,10))*60);await s.from("delivery_sync_jobs").update({status:"FAILED",attempts,last_error:String(e?.message||e).slice(0,500),available_at:new Date(Date.now()+delay*1000).toISOString(),updated_at:new Date().toISOString()}).eq("id",job.id)}
 }
 return NextResponse.json({ok:true,queued,checked,updated,failed,at:new Date().toISOString()});
}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}
