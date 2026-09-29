export type BenchmarkTemplateRuntime={
 id:string;header:"floating-glass"|"overlay"|"classic"|"minimal";hero:"luxury-fullscreen"|"cinematic"|"split"|"soft-split"|"centered";catalog:"editorial"|"technical"|"grid"|"dense";productCard:"luxury"|"technical"|"soft"|"modern";trust:"minimal"|"stats"|"cards";footer:"luxury"|"dark"|"columns"|"minimal";
};
const luxury=new Set(["ecommerce-luxury","luxury-premium","photography","wedding-event","hotel-hospitality"]);
const automotive=new Set(["automotive","ev-charging","drone-fleet","sports","fitness-gym"]);
const soft=new Set(["beauty-spa","florist","healthcare-app","medical-clinic","pharmacy","dental","mental-health","senior-care","childcare","pet-tech"]);
const tech=new Set(["saas","micro-saas","ai-chatbot","developer-tool","cybersecurity","analytics-dashboard","financial-dashboard","design-system","productivity-tool","robotics-automation","spatial-computing","vr-ar-platform","blockchain-defi","fintech-crypto","gaming","generative-art","quantum-computing","biotech"]);
export function getBenchmarkTemplateRuntime(id?:string|null):BenchmarkTemplateRuntime{
 const key=String(id||"ecommerce");
 if(luxury.has(key))return{id:key,header:"floating-glass",hero:"luxury-fullscreen",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"luxury"};
 if(automotive.has(key))return{id:key,header:"overlay",hero:"cinematic",catalog:"technical",productCard:"technical",trust:"stats",footer:"dark"};
 if(soft.has(key))return{id:key,header:"minimal",hero:"soft-split",catalog:"grid",productCard:"soft",trust:"cards",footer:"minimal"};
 if(tech.has(key))return{id:key,header:"floating-glass",hero:"centered",catalog:"dense",productCard:"modern",trust:"stats",footer:"dark"};
 return{id:key,header:"classic",hero:"split",catalog:"grid",productCard:"modern",trust:"cards",footer:"columns"};
}
