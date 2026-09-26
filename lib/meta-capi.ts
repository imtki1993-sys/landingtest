import {createHash} from "crypto";
import {adminDb} from "./server-auth";
import {resolvePublishedMetaPixel} from "./meta-pixel";

const hash=(v:string)=>createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
export async function sendMetaPurchase(input:{workspaceId:string;landingPageId:string;orderId:string;value:number;currency:string;phone:string;name:string;eventSourceUrl?:string;clientIp?:string;userAgent?:string}){
 try{
  const s=adminDb();
  const [{data:secret,error:secretError},pixelId]=await Promise.all([
   s.rpc("get_workspace_integration_secrets",{p_workspace_id:input.workspaceId}),
   resolvePublishedMetaPixel(input.workspaceId,input.landingPageId)
  ]);
  if(secretError)return;
  const sec=Array.isArray(secret)?secret[0]:secret,token=sec?.meta_capi_token;
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
