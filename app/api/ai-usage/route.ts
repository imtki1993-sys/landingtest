import {NextResponse} from "next/server";
import {authContext} from "../../../lib/server-auth";

export async function GET(req:Request){
 try{
  const {s,workspaceId}=await authContext(req);
  const {data,error}=await s.from("ai_generations").select("input_tokens,output_tokens,status,created_at").eq("workspace_id",workspaceId).eq("provider","META");
  if(error)throw error;
  const rows=data||[];
  const successful=rows.filter((x:any)=>x.status==="SUCCEEDED");
  const inputTokens=successful.reduce((n:number,x:any)=>n+(Number(x.input_tokens)||0),0);
  const outputTokens=successful.reduce((n:number,x:any)=>n+(Number(x.output_tokens)||0),0);
  const monthStart=new Date();monthStart.setUTCDate(1);monthStart.setUTCHours(0,0,0,0);
  const month=successful.filter((x:any)=>new Date(x.created_at)>=monthStart);
  return NextResponse.json({calls:successful.length,input_tokens:inputTokens,output_tokens:outputTokens,total_tokens:inputTokens+outputTokens,month_calls:month.length,month_tokens:month.reduce((n:number,x:any)=>n+(Number(x.input_tokens)||0+(Number(x.output_tokens)||0)),0)});
 }catch(e:any){return NextResponse.json({error:e?.message||"Erreur statistiques IA"},{status:401})}
}
