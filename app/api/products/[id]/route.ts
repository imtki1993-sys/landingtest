import {reportError} from "../../../../lib/monitoring";
import {withLandingInvalidation} from "../../../../lib/landing-cache";
import {NextResponse} from "next/server";
import {authContext} from "../../../../lib/server-auth";
import {normalizeProductOptions,normalizeProductVariants} from "../../../../lib/product-variants";

// Toutes les opérations sont limitées au workspace du compte connecté et approuvé
// (authContext). Sans ce filtre, un compte pouvait lire, modifier ou supprimer
// le produit d'un autre client à partir de son identifiant.

const unauthorized=(e:any)=>/Non autorisé|approbation|Workspace introuvable|Profil introuvable/.test(String(e?.message||""));
const fail=(e:any)=>unauthorized(e)
 ?NextResponse.json({error:"Non autorisé"},{status:401})
 :(reportError(e,"api/products/[id]"),NextResponse.json({error:"Erreur serveur"},{status:500}));

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params,{s,workspaceId}=await authContext(req);
 const {data,error}=await s.from("products").select("id,name,price,compare_at_price,cost_price,description,specifications,image_urls,is_active").eq("id",id).eq("workspace_id",workspaceId).is("archived_at",null).maybeSingle();
 if(error)throw error;
 if(!data)return NextResponse.json({error:"Produit introuvable"},{status:404});
 return NextResponse.json({product:{...data,stock:(data.specifications as any)?.stock??null}});
}catch(e:any){reportError(e,"api/products/[id]");return fail(e)}}

async function PATCHHandler(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params,{s,workspaceId}=await authContext(req),b=await req.json();
 const {data:old,error:oldError}=await s.from("products").select("specifications").eq("id",id).eq("workspace_id",workspaceId).maybeSingle();
 if(oldError)throw oldError;
 if(!old)return NextResponse.json({error:"Produit introuvable"},{status:404});
 const patch:any={};
 for(const k of ["name","description","is_active","image_urls"])if(b[k]!==undefined)patch[k]=b[k];
 for(const k of ["price","compare_at_price","cost_price"])if(b[k]!==undefined)patch[k]=b[k]===""||b[k]===null?null:Number(b[k]);
 const spec:any={...(old.specifications||{})};let specChanged=false;
 if(b.stock!==undefined){spec.stock=b.stock===""||b.stock===null?null:Number(b.stock);specChanged=true}
 if(b.category!==undefined){spec.category=String(b.category||"").trim().slice(0,80);specChanged=true}
 for(const k of ["colors","sizes"]){if(b[k]!==undefined){spec[k]=(Array.isArray(b[k])?b[k]:String(b[k]||"").split(",")).map((x:any)=>String(x).trim()).filter(Boolean).slice(0,50);specChanged=true}}
 if(b.options!==undefined){spec.options=normalizeProductOptions(b.options);specChanged=true}
 if(b.variants!==undefined){spec.variants=normalizeProductVariants(b.variants,spec.options||normalizeProductOptions((old.specifications as any)?.options));specChanged=true}
 if(specChanged)patch.specifications=spec;
 const {data,error}=await s.from("products").update(patch).eq("id",id).eq("workspace_id",workspaceId).select().single();
 if(error)throw error;
 return NextResponse.json({product:data});
}catch(e:any){reportError(e,"api/products/[id]");return fail(e)}}

async function DELETEHandler(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params,{s,workspaceId}=await authContext(req);
 const {data:product,error:findError}=await s.from("products").select("id").eq("id",id).eq("workspace_id",workspaceId).maybeSingle();
 if(findError)throw findError;
 if(!product)return NextResponse.json({error:"Produit introuvable"},{status:404});
 const now=new Date().toISOString();
 const {error:pageError}=await s.from("landing_pages").update({archived_at:now,status:"DRAFT",published_at:null}).eq("product_id",id).eq("workspace_id",workspaceId);
 if(pageError)throw pageError;
 const {error}=await s.from("products").update({is_active:false,archived_at:now}).eq("id",id).eq("workspace_id",workspaceId);
 if(error)throw error;
 return NextResponse.json({ok:true,landing_pages_deleted:true});
}catch(e:any){reportError(e,"api/products/[id]");return fail(e)}}

export const PATCH=withLandingInvalidation(PATCHHandler);
export const DELETE=withLandingInvalidation(DELETEHandler);
