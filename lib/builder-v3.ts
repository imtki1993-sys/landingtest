export type BuilderV3Block={id:string;type:string;visible:boolean;props:Record<string,any>};
export type BuilderV3Document={version:3;designSystem:any;blocks:BuilderV3Block[];viewport:"desktop"|"tablet"|"mobile"};
const builtins=["hero","order","benefits","problem","features","how","trust","faq"];
export function createBuilderV3(content:any={}):BuilderV3Document{const order=Array.isArray(content.section_order)?content.section_order:builtins,hidden=new Set(Array.isArray(content.hidden_sections)?content.hidden_sections:[]),custom=content.custom_sections||{};return{version:3,designSystem:content.design_system||{},viewport:"desktop",blocks:order.map((id:string)=>({id,type:id.startsWith("custom-")?(custom[id]?.type||"text"):id,visible:!hidden.has(id),props:id.startsWith("custom-")?{...custom[id]}:{}}))}}
export function isBuilderV3(content:any){return content?.builder_v3?.version===3||content?.design_system?.source==="nextlevelbuilder/ui-ux-pro-max-skill"}
