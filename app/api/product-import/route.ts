import {NextResponse} from "next/server";
import {authContext} from "../../../lib/server-auth";
const allowed=["alibaba.com","www.alibaba.com","m.alibaba.com","aliexpress.com","www.aliexpress.com","m.aliexpress.com"];
function clean(v:string){return v.replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\u002F/g,"/").replace(/\\u0026/g,"&").replace(/\\/g,"").replace(/\s+/g," ").trim()}
function getMeta(html:string,key:string){for(const tag of html.match(/<meta[^>]*>/gi)||[]){if(tag.includes('property="'+key+'"')||tag.includes('name="'+key+'"')||tag.includes("property='"+key+"'")||tag.includes("name='"+key+"'")){const m=tag.match(/content=["']([^"']*)["']/i);if(m)return clean(m[1])}}return ""}
function absoluteImage(v:string,base:URL){try{const u=new URL(v,base);if(u.protocol==="https:"||u.protocol==="http:")return u.toString()}catch{}return ""}
function imageCandidates(html:string,base:URL){const out:string[]=[];const add=(v:string)=>{const u=absoluteImage(clean(v),base);if(!u||/logo|sprite|avatar|icon|flag/i.test(u))return;if(!out.includes(u))out.push(u)};
 [getMeta(html,"og:image"),getMeta(html,"twitter:image")].filter(Boolean).forEach(add);
 for(const m of html.matchAll(/(?:https?:)?\\?\\?\/\\?\\/[^"'<>\\s]+?\\.(?:jpg|jpeg|png|webp)(?:\\?[^"'<>\\s]*)?/gi)){let v=m[0].replace(/\\u002F/g,"/").replace(/\\/g,"");if(v.startsWith("//"))v="https:"+v;add(v);if(out.length>=20)break}
 for(const m of html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/gi)){add(m[1]);if(out.length>=20)break}
 return out.slice(0,10)
}
function priceFrom(html:string){const meta=getMeta(html,"product:price:amount")||getMeta(html,"og:price:amount");if(meta&&Number(meta.replace(/[^0-9.]/g,"")))return Number(meta.replace(/[^0-9.]/g,""));for(const re of [/"(?:salePrice|minPrice|price)"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,/US\s*\$\s*([0-9]+(?:\.[0-9]+)?)/i]){const m=html.match(re);if(m)return Number(m[1])}return null}
export async function POST(req:Request){try{
 await authContext(req);const body=await req.json();const url=body.url;if(!url)return NextResponse.json({error:"URL manquante"},{status:400});
 let u:URL;try{u=new URL(url)}catch{return NextResponse.json({error:"URL invalide"},{status:400})}
 if(u.protocol!=="https:"||!allowed.includes(u.hostname.toLowerCase()))return NextResponse.json({error:"Seules les URLs Alibaba et AliExpress HTTPS sont acceptées."},{status:400});
 const r=await fetch(u.toString(),{headers:{"user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36","accept-language":"fr-FR,fr;q=0.9,en;q=0.8"},redirect:"follow",signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error("Le fournisseur a refusé l’accès à la fiche produit ("+r.status+").");
 const finalUrl=new URL(r.url);if(!allowed.includes(finalUrl.hostname.toLowerCase()))throw new Error("Redirection fournisseur non autorisée.");
 const html=(await r.text()).slice(0,3500000);
 const title=getMeta(html,"og:title")||getMeta(html,"twitter:title")||clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"");
 const description=getMeta(html,"og:description")||getMeta(html,"description")||getMeta(html,"twitter:description");
 const images=imageCandidates(html,finalUrl),supplier_price=priceFrom(html);
 if(!title&&!description)return NextResponse.json({error:"Impossible d’extraire cette fiche automatiquement. Colle les informations dans Import produit."},{status:422});
 const brief=[title,description,supplier_price?"Prix fournisseur détecté : "+supplier_price:""].filter(Boolean).join("\n\n").slice(0,3500);
 return NextResponse.json({title,description,brief,images,supplier_price,source_url:finalUrl.toString(),image_count:images.length});
}catch(e:any){return NextResponse.json({error:e?.message||"Import fournisseur impossible"},{status:500})}}
