import {createHash} from "crypto";
import {adminDb} from "./server-auth";

const hash=(v:string)=>createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
export async function sendMetaPurchase(input:{workspaceId:string;landingPageId:string;orderId:string;value:number;currency:string;phone:string;name:string;eventSourceUrl?:string;clientIp?:string;userAgent?:string}){
 try{
  const s=adminDb();
  const [{data:px},{data:lp},{data:secret,error:secretError}]=await Promise.all([
   s.from("pixels").select("pixel_id,is_enabled").eq("workspace_id",input.workspaceId).eq("landing_page_id",input.landingPageId).eq("provider","META").maybeSingle(),
   s.from("landing_pages").select("seo").eq("id",input.landingPageId).eq("workspace_id",input.workspaceId).single(),
   s.rpc("get_workspace_integration_secrets",{p_workspace_id:input.workspaceId})
  ]);
  if(secretError)return;
  const sec=Array.isArray(secret)?secret[0]:secret,token=sec?.meta_capi_token;
  const pixelId=(lp?.seo as any)?.meta_pixel_id||(px?.is_enabled?px.pixel_id:null);
  if(!token||!pixelId)return;
  const digits=input.phone.replace(/\D/g,""),normalized=digits.startsWith("212")?digits:digits.startsWith("0")?"212"+digits.slice(1):digits;
  const names=input.name.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const user:any={ph:[hash(normalized)]};
  if(names[0])user.fn=[hash(names[0])];if(names.length>1)user.ln=[hash(names.slice(1).join(" "))];
  if(input.clientIp)user.client_ip_address=input.clientIp;if(input.userAgent)user.client_user_agent=input.userAgent;
  const version=process.env.META_GRAPH_VERSION||"v24.0";
  const res=await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(pixelId)}/events`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({access_token:token,data:[{event_name:"Purchase",event_time:Math.floor(Date.now()/1000),event_id:"order_"+input.orderId,action_source:"website",event_source_url:input.eventSourceUrl,user_data:user,custom_data:{currency:input.currency||"MAD",value:Number(input.value||0),order_id:input.orderId}}]})});
  if(!res.ok)console.error("Meta CAPI Purchase failed",res.status,(await res.text()).slice(0,500));
 }catch(e){console.error("Meta CAPI Purchase error",e)}
}
