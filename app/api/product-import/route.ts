import {NextResponse} from "next/server";
import {authContext} from "../../../lib/server-auth";
const allowed=["alibaba.com","www.alibaba.com","m.alibaba.com","aliexpress.com","www.aliexpress.com","m.aliexpress.com"];
function clean(v:string){return v.replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim()}
function getMeta(html:string,key:string){for(const tag of html.match(/<meta[^>]*>/gi)||[]){if((tag.includes('property="'+key+'"')||tag.includes('name="'+key+'"')||tag.includes("property='"+key+"'")||tag.includes("name='"+key+"'"))){const m=tag.match(/content=["']([^"']*)["']/i);if(m)return clean(m[1])}}return ""}
export async function POST(req:Request){try{
 await authContext(req);const body=await req.json();const url=body.url;if(!url)return NextResponse.json({error:"URL manquante"},{status:400});
 let u:URL;try{u=new URL(url)}catch{return NextResponse.json({error:"URL invalide"},{status:400})}
 if(u.protocol!=="https:"||!allowed.includes(u.hostname.toLowerCase()))return NextResponse.json({error:"Seules les URLs Alibaba et AliExpress HTTPS sont acceptées."},{status:400});
 const r=await fetch(u.toString(),{headers:{"user-agent":"Mozilla/5.0 (compatible; LandingPageMotor/1.0)","accept-language":"fr-FR,fr;q=0.9,en;q=0.8"},redirect:"follow",signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error("Le fournisseur a refusé l’accès à la fiche produit ("+r.status+").");
 const finalUrl=new URL(r.url);if(!allowed.includes(finalUrl.hostname.toLowerCase()))throw new Error("Redirection fournisseur non autorisée.");
 const html=(await r.text()).slice(0,2500000);
 const title=getMeta(html,"og:title")||getMeta(html,"twitter:title")||clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"");
 const description=getMeta(html,"og:description")||getMeta(html,"description")||getMeta(html,"twitter:description");
 const images=[getMeta(html,"og:image"),getMeta(html,"twitter:image")].filter(Boolean).slice(0,10);
 if(!title&&!description)return NextResponse.json({error:"Impossible d’extraire cette fiche automatiquement. Colle les informations dans Import produit."},{status:422});
 const brief=[title,description].filter(Boolean).join("\n\n").slice(0,3500);
 return NextResponse.json({title,description,brief,images,source_url:u.toString()});
}catch(e:any){return NextResponse.json({error:e?.message||"Import fournisseur impossible"},{status:500})}}
