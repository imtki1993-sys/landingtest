import {NextResponse} from "next/server"; import {createClient} from "@supabase/supabase-js";
function db(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SECRET_KEY;if(!u||!k)throw new Error("Supabase env missing");return createClient(u,k,{auth:{persistSession:false}})}
export async function GET(){try{
 const supabase=db();
 const {data:orders,error}=await supabase.from("orders").select("id,order_number,lead_id,product_id,quantity,total,currency,shipment_status,created_at").order("created_at",{ascending:false}).limit(100);
 if(error)throw error;
 const rows=await Promise.all((orders||[]).map(async(o:any)=>{
  const [{data:lead},{data:product}]=await Promise.all([
   supabase.from("leads").select("full_name,phone_raw,city_name").eq("id",o.lead_id).maybeSingle(),
   o.product_id?supabase.from("products").select("name").eq("id",o.product_id).maybeSingle():Promise.resolve({data:null})
  ]);
  return {...o,lead,product};
 }));
 return NextResponse.json({orders:rows});
}catch(e:any){return NextResponse.json({error:e.message,orders:[]},{status:500})}}
export async function POST(req:Request){try{const b=await req.json();if(!b.slug||!b.name||!b.phone)return NextResponse.json({error:"Champs requis manquants"},{status:400});const {data,error}=await db().rpc("capture_public_order",{p_slug:b.slug,p_full_name:b.name,p_phone:b.phone,p_city:b.city||null,p_quantity:Number(b.quantity||1)});if(error)throw error;return NextResponse.json(data,{status:201})}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}