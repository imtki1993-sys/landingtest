import {NextResponse} from "next/server";
import {authContext} from "../../../lib/server-auth";

const allowed=["alibaba.com","www.alibaba.com","m.alibaba.com","aliexpress.com","www.aliexpress.com","m.aliexpress.com"];

function clean(v:string){
 return v.replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\u002F/g,"/").replace(/\\u0026/g,"&").replace(/\s+/g," ").trim();
}
function getMeta(html:string,key:string){
 for(const tag of html.match(/<meta[^>]*>/gi)||[]){
  if(tag.includes('property="'+key+'"')||tag.includes('name="'+key+'"')||tag.includes("property='"+key+"'")||tag.includes("name='"+key+"'")){
   const m=tag.match(/content=["']([^"']*)["']/i);
   if(m)return clean(m[1]);
  }
 }
 return "";
}
function absoluteImage(v:string,base:URL){
 try{const u=new URL(v,base);if(u.protocol==="https:"||u.protocol==="http:")return u.toString()}catch{}
 return "";
}
function imageCandidates(html:string,base:URL){
 const out:string[]=[];
 const add=(raw:string)=>{
  const v=raw.replace(/\\u002F/g,"/").replace(/\\u0026/g,"&");
  const u=absoluteImage(v,base);
  if(!u||/logo|sprite|avatar|icon|flag/i.test(u))return;
  if(/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(u)&&!out.includes(u))out.push(u);
 };
 [getMeta(html,"og:image"),getMeta(html,"twitter:image")].filter(Boolean).forEach(add);
 const imgTag=/<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
 for(const m of html.matchAll(imgTag)){add(m[1]);if(out.length>=20)break}
 return out.slice(0,10);
}
function priceFrom(html:string){
 const meta=getMeta(html,"product:price:amount")||getMeta(html,"og:price:amount");
 if(meta){const n=Number(meta.replace(/[^0-9.]/g,""));if(n)return n}
 const patterns=[/"(?:salePrice|minPrice|price)"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,/US\s*\$\s*([0-9]+(?:\.[0-9]+)?)/i];
 for(const re of patterns){const m=html.match(re);if(m)return Number(m[1])}
 return null;
}
function normalizeInput(raw:string){
 let value=raw.trim();
 const markdown=value.match(/\[(https?:\/\/[^\]]+)\]\(/i);
 if(markdown)value=markdown[1];
 value=value.replace(/^["'\[]+|["'\]]+$/g,"");
 return value.replace(/\\&/g,"&");
}

export async function POST(req:Request){
 try{
  await authContext(req);
  const body=await req.json();
  const url=normalizeInput(String(body.url||""));
  if(!url)return NextResponse.json({error:"URL manquante"},{status:400});
  let u:URL;
  try{u=new URL(url)}catch{return NextResponse.json({error:"URL invalide"},{status:400})}
  if(u.protocol!=="https:"||!allowed.includes(u.hostname.toLowerCase()))return NextResponse.json({error:"Seules les URLs Alibaba et AliExpress HTTPS sont acceptées."},{status:400});

  u.search="";
  const canonical=u.toString();
  const candidates=[canonical,url];let r:Response|null=null;for(const target of candidates){try{const attempt=await fetch(target,{headers:{"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8","accept-language":"en-US,en;q=0.9,fr;q=0.8","cache-control":"no-cache","pragma":"no-cache"},redirect:"follow",signal:AbortSignal.timeout(15000)});if(attempt.ok){r=attempt;break}}catch{}}if(!r)throw new Error("Alibaba/AliExpress bloque actuellement l’import automatique depuis le serveur. Réessaie plus tard ou ajoute les informations et images du produit manuellement.");
  

  const finalUrl=new URL(r.url);
  if(!allowed.includes(finalUrl.hostname.toLowerCase()))throw new Error("Redirection fournisseur non autorisée.");
  const html=(await r.text()).slice(0,3500000);

  const parts=u.pathname.split("/").filter(Boolean);
  const slugPart=parts.find(x=>x.includes("-")&&!/^160\d+/.test(x))||"";
  const slugTitle=decodeURIComponent(slugPart).replace(/[-_]+/g," ").replace(/\s+/g," ").trim();
  const pageTitle=getMeta(html,"og:title")||getMeta(html,"twitter:title")||clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"");
  const blocked=/captcha|verify you are human|security verification|punish|robot check/i.test(html)||html.length<5000;
  const title=pageTitle&&!/alibaba\.com|access denied|captcha/i.test(pageTitle)?pageTitle:slugTitle;
  const description=getMeta(html,"og:description")||getMeta(html,"description")||getMeta(html,"twitter:description");
  const images=imageCandidates(html,finalUrl);
  const supplier_price=priceFrom(html);

  if(!title&&!description)return NextResponse.json({error:"Alibaba/AliExpress n’a fourni aucune donnée exploitable. L’import automatique ne peut pas contourner la protection du fournisseur. Ajoute les informations et images du produit manuellement.",blocked:true,source_url:canonical},{status:422});
  const brief=[title,description,supplier_price?"Prix fournisseur détecté : "+supplier_price:""].filter(Boolean).join("\n\n").slice(0,3500);
  return NextResponse.json({title,description,brief,images,supplier_price,source_url:canonical,image_count:images.length,partial:blocked||(!description&&images.length===0),warning:blocked?"Alibaba a protégé la fiche : import partiel depuis l’URL produit.":undefined});
 }catch(e:any){
  return NextResponse.json({error:e?.message||"Import fournisseur impossible"},{status:500});
 }
}
