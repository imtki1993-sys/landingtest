import {NextResponse} from "next/server";import {authContext} from "../../../../../lib/server-auth";

const pick=(v:any):any[]=>{if(Array.isArray(v))return v;if(!v||typeof v!=="object")return[];for(const k of ["cities","CITIES","data","DATA","city","CITY","result","RESULT"]){const a=pick(v[k]);if(a.length)return a}for(const v2 of Object.values(v)){const a=pick(v2);if(a.length)return a}return[]};

async function fetchCities(clientId:string,apiKey:string){
 const urls=[
  "https://api.ozonexpress.ma/customers/"+encodeURIComponent(clientId)+"/"+encodeURIComponent(apiKey)+"/cities",
  "https://api.ozonexpress.ma/cities"
 ];
 let last:any=null;
 for(const url of urls){
  try{
   const r=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(12000)});
   const raw=await r.text();let data:any;try{data=JSON.parse(raw)}catch{data=raw}
   if(r.ok){const cities=pick(data);if(cities.length)return {ok:true,cities,data,url}}
   last={status:r.status,data,url};
  }catch(e:any){last={error:e?.message||String(e),url}}
 }
 return {ok:false,last};
}

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params,{s,workspaceId}=await authContext(req);const {data:c}=await s.from("delivery_companies").select("code,settings").eq("id",id).eq("workspace_id",workspaceId).maybeSingle();if(!c||c.code!=="OZON_EXPRESS")return NextResponse.json({error:"Intégration Ozon introuvable"},{status:404});const cfg:any=c.settings||{};if(!cfg.client_id||!cfg.api_key)return NextResponse.json({error:"Client ID et API Key Ozon requis"},{status:400});const out=await fetchCities(cfg.client_id,cfg.api_key);if(!out.ok)return NextResponse.json({error:"Impossible de charger les villes Ozon avec la configuration actuelle.",details:out.last},{status:502});return NextResponse.json({ok:true,message:"Connexion Ozon réussie. API des villes accessible.",cities:out.cities,source_url:out.url})}catch(e:any){return NextResponse.json({error:e?.name==="TimeoutError"?"Ozon API timeout":e.message},{status:500})}}