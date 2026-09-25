import {NextResponse} from "next/server";import {authContext} from "../../../lib/server-auth";
export async function GET(req:Request){try{
 const {s,workspaceId}=await authContext(req),url=new URL(req.url),days=Math.min(90,Math.max(1,Number(url.searchParams.get("days")||30))),from=new Date(Date.now()-(days-1)*86400000).toISOString();
 const {data,error}=await s.rpc("analytics_dashboard_aggregate",{p_workspace_id:workspaceId,p_from:from});
 if(error)throw error;
 const result:any=data||{},t:any=result.totals||{};
 const views=Number(t.views||0),orders=Number(t.orders||0),confirmed=Number(t.confirmed||0),shipped=Number(t.shipped||0),delivered=Number(t.delivered||0),returned=Number(t.returned||0);
 return NextResponse.json({days,totals:{...t,views,visitors:Number(t.visitors||0),formStarts:Number(t.formStarts||0),orders,confirmed,shipped,delivered,returned,revenue:Number(t.revenue||0),deliveredRevenue:Number(t.deliveredRevenue||0),conversion:views?orders/views*100:0,confirmationRate:orders?confirmed/orders*100:0,deliveryRate:shipped?delivered/shipped*100:0,returnRate:shipped?returned/shipped*100:0},landings:Array.isArray(result.landings)?result.landings:[]});
}catch(e:any){return NextResponse.json({error:e.message,landings:[]},{status:e.message==="Non autorisé"?401:500})}}
