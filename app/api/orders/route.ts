import {NextResponse} from "next/server"; import {createClient} from "@supabase/supabase-js";import {authContext} from "../../../lib/server-auth";
function db(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SECRET_KEY;if(!u||!k)throw new Error("Supabase env missing");return createClient(u,k,{auth:{persistSession:false}})}
export async function GET(req:Request){try{
 const {s:supabase,workspaceId}=await authContext(req);
 const {data:orders,error}=await supabase.from("orders").select("id,order_number,lead_id,landing_page_id,product_id,quantity,unit_price,subtotal,shipping_price,discount,total,currency,shipment_status,tracking_number,delivery_company_id,shipped_at,delivered_at,returned_at,created_at").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(100);
 if(error)throw error;
 const base=orders||[],leadIds=[...new Set(base.map((o:any)=>o.lead_id).filter(Boolean))],productIds=[...new Set(base.map((o:any)=>o.product_id).filter(Boolean))],landingIds=[...new Set(base.map((o:any)=>o.landing_page_id).filter(Boolean))],carrierIds=[...new Set(base.map((o:any)=>o.delivery_company_id).filter(Boolean))];
 const [leadsQ,productsQ,landingsQ,carriersQ]=await Promise.all([
  leadIds.length?supabase.from("leads").select("id,full_name,phone_raw,phone_e164,city_name,address,status,notes").eq("workspace_id",workspaceId).in("id",leadIds):Promise.resolve({data:[]}),
  productIds.length?supabase.from("products").select("id,name").eq("workspace_id",workspaceId).in("id",productIds):Promise.resolve({data:[]}),
  landingIds.length?supabase.from("landing_pages").select("id,name,slug").eq("workspace_id",workspaceId).in("id",landingIds):Promise.resolve({data:[]}),
  carrierIds.length?supabase.from("delivery_companies").select("id,name,code").eq("workspace_id",workspaceId).in("id",carrierIds):Promise.resolve({data:[]})
 ]);
 const by=(rows:any[]=[])=>new Map(rows.map((x:any)=>[x.id,x])),leads=by(leadsQ.data||[]),products=by(productsQ.data||[]),landings=by(landingsQ.data||[]),carriers=by(carriersQ.data||[]);
 const rows=base.map((o:any)=>({...o,lead:leads.get(o.lead_id)||null,product:products.get(o.product_id)||null,landing:landings.get(o.landing_page_id)||null,delivery_company:carriers.get(o.delivery_company_id)||null}));
 return NextResponse.json({orders:rows});
}catch(e:any){return NextResponse.json({error:e.message,orders:[]},{status:500})}}
export async function POST(req:Request){try{const b=await req.json();if(!b.slug||!b.name||!b.phone)return NextResponse.json({error:"Champs requis manquants"},{status:400});const {data,error}=await db().rpc("capture_public_order",{p_slug:b.slug,p_full_name:b.name,p_phone:b.phone,p_city:b.city||null,p_quantity:Number(b.quantity||1),p_address:b.address||null});if(error)throw error;return NextResponse.json(data,{status:201})}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}