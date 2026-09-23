export type BuilderBlock={id:string;type:string;visible:boolean;props:Record<string,any>};
export type BuilderDocument={version:2;theme:string;blocks:BuilderBlock[]};

const builtins=["hero","order","benefits","problem","features","how","trust","faq"];

export function legacyToBuilder(c:any={}):BuilderDocument{
 const order=Array.isArray(c.section_order)?c.section_order:builtins;
 const hidden=new Set(Array.isArray(c.hidden_sections)?c.hidden_sections:[]);
 const custom=c.custom_sections&&typeof c.custom_sections==="object"?c.custom_sections:{};
 return {version:2,theme:c.visual_theme||"general",blocks:order.map((id:string)=>({
  id,type:id.startsWith("custom-")?"text":id,visible:!hidden.has(id),
  props:id.startsWith("custom-")?{...(custom[id]||{})}:{}
 }))};
}

export function builderToLegacy(doc:BuilderDocument,c:any={}){
 const blocks=Array.isArray(doc?.blocks)?doc.blocks:[];
 const custom:any={};
 blocks.filter(b=>b.type==="text").forEach(b=>custom[b.id]={...(b.props||{})});
 return {...c,visual_theme:doc.theme||c.visual_theme||"general",
  section_order:blocks.map(b=>b.id),
  hidden_sections:blocks.filter(b=>!b.visible).map(b=>b.id),
  custom_sections:{...(c.custom_sections||{}),...custom},
  builder_v2:doc
 };
}

export function syncBuilderFromLegacy(c:any={}):BuilderDocument{
 const existing=c?.builder_v2;
 if(existing?.version===2&&Array.isArray(existing.blocks)){
  const legacy=legacyToBuilder(c),byId=new Map<string,BuilderBlock>((existing.blocks as BuilderBlock[]).map((b:BuilderBlock)=>[b.id,b]));
  return {...existing,theme:c.visual_theme||existing.theme,blocks:legacy.blocks.map((b:BuilderBlock)=>{const previous=byId.get(b.id);return {...b,...(previous??{}),visible:b.visible,props:b.type==="text"?b.props:(previous?.props??{})};})};
 }
 return legacyToBuilder(c);
}
