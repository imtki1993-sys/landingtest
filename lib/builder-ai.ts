export async function generateBuilderContent(input:{name:string;price:any;oldPrice:any;description:string;theme?:string;niche?:string;language:string;section:string;images:string[]}){
 const r=await fetch("/api/ai-content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});
 const x=await r.json();
 if(!r.ok)throw new Error(x.error||"Generation impossible");
 return x;
}

export function applyAiDesignSystem(draft:any,result:any){
 const ds=result?.designSystem;if(!ds)return draft;
 const bp=ds?.blueprint;
 if(bp)return {...draft,benchmark_niche:ds?.niche?.id||bp.id,design_profile:bp.id,design_system:ds,section_order:Array.isArray(bp.sections)&&bp.sections.length?bp.sections:draft.section_order};
 const styleId=ds?.style?.["Style ID"]||ds?.style?.["Style Category"]||draft.design_profile;
 return {...draft,design_profile:styleId,design_system:ds,section_order:Array.isArray(ds?.section_order)&&ds.section_order.length?ds.section_order:draft.section_order};
}

export function normalizeAiContent(content:any){
 const a={...(content||{})};
 if(Array.isArray(a.features))a.features=a.features.map((v:any)=>typeof v==="string"?v:[v?.title,v?.text].filter(Boolean).join(" — "));
 return a;
}
