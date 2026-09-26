import {NextResponse} from "next/server";import {authContext} from "../../../lib/server-auth";
export async function GET(req:Request){try{
 const {s,workspaceId}=await authContext(req);
 const [landingsQ,productsQ,ordersQ,leadsQ,analyticsQ]=await Promise.all([
  s.from("landing_pages").select("id,status").eq("workspace_id",workspaceId).is("archived_at",null),
  s.from("products").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
  s.from("orders").select("id,order_number,total,currency,shipment_status,tracking_number,created_at,lead_id,product_id,landing_page_id").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(6),
  s.from("leads").select("id,status").eq("workspace_id",workspaceId),
  s.rpc("analytics_dashboard_aggregate",{p_workspace_id:workspaceId,p_from:new Date(Date.now()-29*86400000).toISOString()})
 ]);
 if(landingsQ.error)throw landingsQ.error;if(productsQ.error)throw productsQ.error;if(ordersQ.error)throw ordersQ.error;if(leadsQ.error)throw leadsQ.error;
 const orders:any[]=ordersQ.data||[],leadIds=[...new Set(orders.map(o=>o.lead_id).filter(Boolean))],productIds=[...new Set(orders.map(o=>o.product_id).filter(Boolean))],landingIds=[...new Set(orders.map(o=>o.landing_page_id).filter(Boolean))];
 const [lq,pq,pgq]=await Promise.all([
  leadIds.length?s.from("leads").select("id,full_name,phone_raw,city_name,status").eq("workspace_id",workspaceId).in("id",leadIds):Promise.resolve({data:[]}),
  productIds.length?s.from("products").select("id,name").eq("workspace_id",workspaceId).in("id",productIds):Promise.resolve({data:[]}),
  landingIds.length?s.from("landing_pages").select("id,name,slug").eq("workspace_id",workspaceId).in("id",landingIds):Promise.resolve({data:[]})
 ]);
 const by=(rows:any[]=[])=>new Map(rows.map(x=>[x.id,x])),lm=by(lq.data||[]),pm=by(pq.data||[]),pgm=by(pgq.data||[]);
 const leads:any[]=leadsQ.data||[],landings:any[]=landingsQ.data||[],a:any=analyticsQ.data||{},t:any=a.totals||{},totalOrders=Number(t.orders||0),confirmed=Number(t.confirmed||0),shipped=Number(t.shipped||0),delivered=Number(t.delivered||0),views=Number(t.views||0);
 return NextResponse.json({totals:{landings:landings.length,published:landings.filter(x=>x.status==="PUBLISHED").length,products:productsQ.count||0,orders:totalOrders,revenue:Number(t.revenue||0),deliveredRevenue:Number(t.deliveredRevenue||0),views,conversion:views?totalOrders/views*100:0,confirmationRate:totalOrders?confirmed/totalOrders*100:0,deliveryRate:shipped?delivered/shipped*100:0,newLeads:leads.filter(x=>x.status==="NEW").length,confirmed},recentOrders:orders.map(o=>({...o,lead:lm.get(o.lead_id)||null,product:pm.get(o.product_id)||null,landing:pgm.get(o.landing_page_id)||null})),topLandings:(Array.isArray(a.landings)?a.landings:[]).slice(0,5)});
}catch(e:any){return NextResponse.json({error:e.message},{status:e.message==="Non autorisé"?401:500})}}