import {reportError} from "../../../lib/monitoring";
import {NextResponse} from "next/server";import {authContext} from "../../../lib/server-auth";
export async function GET(req:Request){const started=Date.now();try{
 const {s,workspaceId,isPlatformAdmin}=await authContext(req);const authMs=Date.now()-started;
 const [landingsCountQ,publishedCountQ,productsQ,recentOrdersQ,planQ]=await Promise.all([
  s.from("landing_pages").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).is("archived_at",null),
  s.from("landing_pages").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId).is("archived_at",null).eq("status","PUBLISHED"),
  s.from("products").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
  s.from("orders").select("id,order_number,total,currency,shipment_status,tracking_number,created_at,lead_id,product_id,landing_page_id").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(6),
  s.rpc("workspace_plan_usage",{p_workspace_id:workspaceId})
 ]);
 for(const q of [landingsCountQ,publishedCountQ,productsQ,recentOrdersQ])if(q.error)throw q.error;
 const orders:any[]=recentOrdersQ.data||[],leadIds=[...new Set(orders.map(o=>o.lead_id).filter(Boolean))],productIds=[...new Set(orders.map(o=>o.product_id).filter(Boolean))],landingIds=[...new Set(orders.map(o=>o.landing_page_id).filter(Boolean))];
 const [lq,pq,pgq]=await Promise.all([
  leadIds.length?s.from("leads").select("id,full_name,phone_raw,city_name,status").eq("workspace_id",workspaceId).in("id",leadIds):Promise.resolve({data:[]}),
  productIds.length?s.from("products").select("id,name").eq("workspace_id",workspaceId).in("id",productIds):Promise.resolve({data:[]}),
  landingIds.length?s.from("landing_pages").select("id,name,slug").eq("workspace_id",workspaceId).in("id",landingIds):Promise.resolve({data:[]})
 ]);
 const by=(rows:any[]=[])=>new Map(rows.map((x:any)=>[x.id,x])),lm=by(lq.data||[]),pm=by(pq.data||[]),pgm=by(pgq.data||[]),plan=Array.isArray(planQ.data)?planQ.data[0]:planQ.data;
 return NextResponse.json({isPlatformAdmin,plan:plan||null,totals:{landings:landingsCountQ.count||0,published:publishedCountQ.count||0,products:productsQ.count||0},recentOrders:orders.map(o=>({...o,lead:lm.get(o.lead_id)||null,product:pm.get(o.product_id)||null,landing:pgm.get(o.landing_page_id)||null})),performance:{authMs,totalMs:Date.now()-started}});
}catch(e:any){reportError(e,"api/dashboard");return NextResponse.json({error:e.message},{status:e.message==="Non autorisé"?401:500})}}