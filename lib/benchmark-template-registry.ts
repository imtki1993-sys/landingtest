export type BenchmarkSection="hero"|"products"|"benefits"|"trust"|"about"|"faq";
export type BenchmarkTemplateRuntime={
 id:string;header:"floating-glass"|"overlay"|"classic"|"minimal"|"fitness";hero:"luxury-fullscreen"|"cinematic"|"split"|"soft-split"|"centered"|"fitness";catalog:"editorial"|"technical"|"grid"|"dense"|"fitness";productCard:"luxury"|"technical"|"soft"|"modern"|"fitness";trust:"minimal"|"stats"|"cards"|"fitness";footer:"luxury"|"dark"|"columns"|"minimal"|"fitness";sections:BenchmarkSection[];referencePath?:string;
};
const exact:Record<string,BenchmarkTemplateRuntime>={
 ecommerce:{id:"ecommerce",header:"floating-glass",hero:"split",catalog:"grid",productCard:"modern",trust:"cards",footer:"dark",sections:["hero","products","benefits","trust","faq"],referencePath:"pages/ecommerce/index.html"},
 "ecommerce-luxury":{id:"ecommerce-luxury",header:"floating-glass",hero:"luxury-fullscreen",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"luxury",sections:["hero","products","trust","about","faq"],referencePath:"pages/ecommerce-luxury/index.html"},
 automotive:{id:"automotive",header:"classic",hero:"cinematic",catalog:"technical",productCard:"technical",trust:"stats",footer:"dark",sections:["hero","products","benefits","about","trust"],referencePath:"pages/automotive/index.html"},
 "beauty-spa":{id:"beauty-spa",header:"floating-glass",hero:"soft-split",catalog:"grid",productCard:"soft",trust:"cards",footer:"minimal",sections:["hero","benefits","about","products","trust","faq"],referencePath:"pages/beauty-spa/index.html"},
 "fitness-gym":{id:"fitness-gym",header:"fitness",hero:"fitness",catalog:"fitness",productCard:"fitness",trust:"fitness",footer:"fitness",sections:["hero","benefits","products","trust","faq"],referencePath:"pages/fitness-gym/index.html"}
};
const luxury=new Set(["luxury-premium","photography","wedding-event","hotel-hospitality"]);
const automotive=new Set(["ev-charging","drone-fleet","sports"]);
const soft=new Set(["florist","healthcare-app","medical-clinic","pharmacy","dental","mental-health","senior-care","childcare","pet-tech"]);
const tech=new Set(["saas","micro-saas","ai-chatbot","developer-tool","cybersecurity","analytics-dashboard","financial-dashboard","design-system","productivity-tool","robotics-automation","spatial-computing","vr-ar-platform","blockchain-defi","fintech-crypto","gaming","generative-art","quantum-computing","biotech"]);
export function getBenchmarkTemplateRuntime(id?:string|null):BenchmarkTemplateRuntime{
 const key=String(id||"ecommerce");if(exact[key])return exact[key];
 if(luxury.has(key))return{id:key,header:"floating-glass",hero:"luxury-fullscreen",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"luxury",sections:["hero","products","trust","about","faq"]};
 if(automotive.has(key))return{id:key,header:"classic",hero:"cinematic",catalog:"technical",productCard:"technical",trust:"stats",footer:"dark",sections:["hero","products","benefits","about","trust"]};
 if(soft.has(key))return{id:key,header:"minimal",hero:"soft-split",catalog:"grid",productCard:"soft",trust:"cards",footer:"minimal",sections:["hero","benefits","products","trust","faq"]};
 if(tech.has(key))return{id:key,header:"floating-glass",hero:"centered",catalog:"dense",productCard:"modern",trust:"stats",footer:"dark",sections:["hero","benefits","products","trust","faq"]};
 return{id:key,header:"classic",hero:"split",catalog:"grid",productCard:"modern",trust:"cards",footer:"columns",sections:["hero","products","trust","faq"]};
}
