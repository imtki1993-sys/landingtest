export async function generateBuilderContent(input:{name:string;price:any;oldPrice:any;description:string;theme:string;language:string;section:string;images:string[]}){
 const r=await fetch("/api/ai-content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});
 const x=await r.json();
 if(!r.ok)throw new Error(x.error||"Generation impossible");
 return x;
}

export function normalizeAiContent(content:any){
 const a={...(content||{})};
 if(Array.isArray(a.features))a.features=a.features.map((v:any)=>typeof v==="string"?v:[v?.title,v?.text].filter(Boolean).join(" — "));
 return a;
}
