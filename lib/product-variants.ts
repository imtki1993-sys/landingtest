export type ProductOption={name:string;values:string[]};
export type ProductVariant={id:string;options:Record<string,string>;sku:string;price:number|null;compare_at_price:number|null;stock:number|null;image:string;active:boolean};

export function cleanOptionValues(v:any){return (Array.isArray(v)?v:String(v||"").split(",")).map((x:any)=>String(x).trim()).filter(Boolean).slice(0,50)}
export function normalizeProductOptions(v:any):ProductOption[]{return (Array.isArray(v)?v:[]).map((o:any)=>({name:String(o?.name||"").trim().slice(0,40),values:cleanOptionValues(o?.values)})).filter((o:any)=>o.name&&o.values.length).slice(0,3)}
export function generateProductVariants(options:ProductOption[],existing:ProductVariant[]=[]):ProductVariant[]{
 const opts=normalizeProductOptions(options);if(!opts.length)return [];
 let combos:Record<string,string>[]=[{}];for(const o of opts)combos=combos.flatMap(c=>o.values.map(v=>({...c,[o.name]:v})));
 return combos.slice(0,200).map(values=>{const key=JSON.stringify(values),old=existing.find(x=>JSON.stringify(x.options)===key);return old||{id:"v_"+Math.random().toString(36).slice(2,10),options:values,sku:"",price:null,compare_at_price:null,stock:null,image:"",active:true}})
}
export function normalizeProductVariants(v:any,options:ProductOption[]):ProductVariant[]{const allowed=generateProductVariants(options,[]);return (Array.isArray(v)?v:[]).map((x:any)=>({id:String(x?.id||"v_"+Math.random().toString(36).slice(2,10)),options:x?.options&&typeof x.options==="object"?x.options:{},sku:String(x?.sku||"").slice(0,80),price:x?.price===""||x?.price==null?null:Number(x.price),compare_at_price:x?.compare_at_price===""||x?.compare_at_price==null?null:Number(x.compare_at_price),stock:x?.stock===""||x?.stock==null?null:Number(x.stock),image:String(x?.image||""),active:x?.active!==false})).filter((x:any)=>allowed.some(a=>JSON.stringify(a.options)===JSON.stringify(x.options))).slice(0,200)}
