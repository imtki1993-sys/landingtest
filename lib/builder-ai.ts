export async function generateBuilderContent(input:{name:string;price:any;oldPrice:any;description:string;theme:string;language:string;section:string;images:string[]}){
 const r=await fetch("/api/ai-content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});
 const x=await r.json();
 if(!r.ok)throw new Error(x.error||"Generation impossible");
 return x;
}

export function applyAiDesignSystem(draft:any,result:any){
 const profile=result?.designSystem?.profile;if(!profile)return draft;
 return {...draft,design_profile:profile.id,design_system:result.designSystem,section_order:Array.isArray(profile.sectionOrder)&&profile.sectionOrder.length?profile.sectionOrder:draft.section_order};
}

export function normalizeAiContent(content:any){
 const a={...(content||{})};
 if(Array.isArray(a.features))a.features=a.features.map((v:any)=>typeof v==="string"?v:[v?.title,v?.text].filter(Boolean).join(" — "));
 return a;
}
