export type BenchmarkSection="hero"|"products"|"benefits"|"trust"|"about"|"faq";
export type BenchmarkTemplateRuntime={
 id:string;header:"floating-glass"|"overlay"|"classic"|"minimal"|"fitness";hero:"luxury-fullscreen"|"cinematic"|"split"|"soft-split"|"centered"|"fitness";catalog:"editorial"|"technical"|"grid"|"dense"|"fitness";productCard:"luxury"|"technical"|"soft"|"modern"|"fitness";trust:"minimal"|"stats"|"cards"|"fitness";footer:"luxury"|"dark"|"columns"|"minimal"|"fitness";sections:BenchmarkSection[];referencePath?:string;
};
const exact:Record<string,BenchmarkTemplateRuntime>={
 ecommerce:{id:"ecommerce",header:"floating-glass",hero:"split",catalog:"grid",productCard:"modern",trust:"cards",footer:"dark",sections:["hero","products","benefits","trust","faq"],referencePath:"pages/ecommerce/index.html"},
 "ecommerce-luxury":{id:"ecommerce-luxury",header:"floating-glass",hero:"luxury-fullscreen",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"luxury",sections:["hero","products","trust","about","faq"],referencePath:"pages/ecommerce-luxury/index.html"},
 automotive:{id:"automotive",header:"classic",hero:"cinematic",catalog:"technical",productCard:"technical",trust:"stats",footer:"dark",sections:["hero","products","benefits","about","trust"],referencePath:"pages/automotive/index.html"},
 "beauty-spa":{id:"beauty-spa",header:"floating-glass",hero:"soft-split",catalog:"grid",productCard:"soft",trust:"cards",footer:"minimal",sections:["hero","benefits","about","products","trust","faq"],referencePath:"pages/beauty-spa/index.html"},
 "fitness-gym":{id:"fitness-gym",header:"fitness",hero:"fitness",catalog:"fitness",productCard:"fitness",trust:"fitness",footer:"fitness",sections:["hero","benefits","products","trust","faq"],referencePath:"pages/fitness-gym/index.html"},
 "restaurant-food":{id:"restaurant-food",header:"floating-glass",hero:"soft-split",catalog:"editorial",productCard:"soft",trust:"cards",footer:"dark",sections:["hero","products","about","trust","faq"],referencePath:"pages/restaurant-food/index.html"},
 "coffee-shop":{id:"coffee-shop",header:"floating-glass",hero:"cinematic",catalog:"editorial",productCard:"soft",trust:"cards",footer:"dark",sections:["hero","products","benefits","about","trust"],referencePath:"pages/coffee-shop/index.html"},
 "real-estate":{id:"real-estate",header:"floating-glass",hero:"cinematic",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"dark",sections:["hero","products","about","trust"],referencePath:"pages/real-estate/index.html"},
 saas:{id:"saas",header:"floating-glass",hero:"centered",catalog:"dense",productCard:"modern",trust:"stats",footer:"dark",sections:["hero","benefits","products","trust","faq"],referencePath:"pages/saas/index.html"},
 "travel-tourism":{id:"travel-tourism",header:"floating-glass",hero:"cinematic",catalog:"editorial",productCard:"modern",trust:"stats",footer:"dark",sections:["hero","products","benefits","about","trust"],referencePath:"pages/travel-tourism/index.html"},
 marketplace:{id:"marketplace",header:"floating-glass",hero:"centered",catalog:"dense",productCard:"modern",trust:"cards",footer:"dark",sections:["hero","products","benefits","trust","faq"],referencePath:"pages/marketplace/index.html"},
 "creative-agency":{id:"creative-agency",header:"overlay",hero:"centered",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"minimal",sections:["hero","products","benefits","about","trust"],referencePath:"pages/creative-agency/index.html"},
 "medical-clinic":{id:"medical-clinic",header:"floating-glass",hero:"soft-split",catalog:"grid",productCard:"soft",trust:"cards",footer:"dark",sections:["hero","benefits","about","products","trust"],referencePath:"pages/medical-clinic/index.html"},
 "hotel-hospitality":{id:"hotel-hospitality",header:"floating-glass",hero:"luxury-fullscreen",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"luxury",sections:["hero","products","benefits","about","trust"],referencePath:"pages/hotel-hospitality/index.html"},
 gaming:{id:"gaming",header:"floating-glass",hero:"cinematic",catalog:"dense",productCard:"technical",trust:"stats",footer:"dark",sections:["hero","products","benefits","trust"],referencePath:"pages/gaming/index.html"}
};
const luxury=new Set(["luxury-premium","photography","wedding-event","hotel-hospitality"]);
const automotive=new Set(["ev-charging","drone-fleet","sports"]);
const soft=new Set(["florist","healthcare-app","medical-clinic","pharmacy","dental","mental-health","senior-care","childcare","pet-tech","biohacking","veterinary"]);
const tech=new Set(["saas","micro-saas","ai-chatbot","developer-tool","cybersecurity","analytics-dashboard","financial-dashboard","design-system","productivity-tool","robotics-automation","spatial-computing","vr-ar-platform","blockchain-defi","fintech-crypto","gaming","generative-art","quantum-computing","biotech","smart-home","space-tech","social-media-app","video-streaming","music-streaming","creator-economy"]);
const food=new Set(["bakery-cafe","coffee-shop","restaurant-food","brewery-winery"]);
const travel=new Set(["airline","conference","event-management","museum","theater","travel-tourism"]);
const property=new Set(["architecture-interior","construction","home-services","real-estate","cleaning"]);
const editorial=new Set(["magazine-blog","news-media","newsletter","podcast","knowledge-base","portfolio-personal","freelancer","creative-agency","marketing-agency"]);
const commerce=new Set(["digital-products","marketplace","subscription-box","nft-web3","membership","hyperlocal"]);
const institutional=new Set(["agriculture","b2b-service","banking-traditional","church","coding-bootcamp","consulting","coworking","dating-app","educational-app","edutainment","government-public-service","insurance","job-board","language-learning","legal-services","logistics-delivery","micro-credentials","non-profit","online-course","remote-work","service-landing","sustainability-esg","sustainable-energy"]);
export function getBenchmarkTemplateRuntime(id?:string|null):BenchmarkTemplateRuntime{
 const key=String(id||"ecommerce");if(exact[key])return exact[key];
 if(luxury.has(key))return{id:key,header:"floating-glass",hero:"luxury-fullscreen",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"luxury",sections:["hero","products","trust","about","faq"]};
 if(automotive.has(key))return{id:key,header:"classic",hero:"cinematic",catalog:"technical",productCard:"technical",trust:"stats",footer:"dark",sections:["hero","products","benefits","about","trust"]};
 if(soft.has(key))return{id:key,header:"minimal",hero:"soft-split",catalog:"grid",productCard:"soft",trust:"cards",footer:"minimal",sections:["hero","benefits","products","trust","faq"]};
 if(tech.has(key))return{id:key,header:"floating-glass",hero:"centered",catalog:"dense",productCard:"modern",trust:"stats",footer:"dark",sections:["hero","benefits","products","trust","faq"]};
 if(food.has(key))return{id:key,header:"floating-glass",hero:"soft-split",catalog:"editorial",productCard:"soft",trust:"cards",footer:"dark",sections:["hero","products","benefits","about","trust","faq"]};
 if(travel.has(key))return{id:key,header:"overlay",hero:"cinematic",catalog:"editorial",productCard:"modern",trust:"stats",footer:"dark",sections:["hero","benefits","products","about","trust","faq"]};
 if(property.has(key))return{id:key,header:"minimal",hero:"split",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"columns",sections:["hero","products","about","benefits","trust","faq"]};
 if(editorial.has(key))return{id:key,header:"minimal",hero:"centered",catalog:"editorial",productCard:"luxury",trust:"minimal",footer:"minimal",sections:["hero","products","about","trust","faq"]};
 if(commerce.has(key))return{id:key,header:"floating-glass",hero:"split",catalog:"dense",productCard:"modern",trust:"cards",footer:"columns",sections:["hero","products","benefits","trust","faq"]};
 if(institutional.has(key))return{id:key,header:"classic",hero:"split",catalog:"grid",productCard:"modern",trust:"cards",footer:"columns",sections:["hero","benefits","about","products","trust","faq"]};
 return{id:key,header:"classic",hero:"split",catalog:"grid",productCard:"modern",trust:"cards",footer:"columns",sections:["hero","products","trust","faq"]};
}
