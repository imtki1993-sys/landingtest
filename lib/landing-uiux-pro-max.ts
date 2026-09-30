export type LandingUiUxProfile={
 id:string;pattern:string;style:string;palette:string;typography:string;
 effects:string[];avoid:string[];sectionOrder:string[];
};

const profiles:Record<string,LandingUiUxProfile>={
 "cod-auto-moto":{id:"automotive",pattern:"Hero-Centric + Product Demo",style:"Motion + Technical",palette:"dark-neutral + high-contrast CTA",typography:"bold display + clean sans",effects:["directional-light","subtle-motion","product-focus"],avoid:["decorative clutter","low contrast","fake specs"],sectionOrder:["hero","order","benefits","features","problem","how","trust","faq"]},
 "cod-electronics":{id:"ecommerce-electronics",pattern:"Feature-Rich Showcase",style:"Modern + Technical",palette:"clean neutral + electric accent",typography:"modern sans + readable sans",effects:["product-glow","feature-focus","subtle-depth"],avoid:["fake specs","excessive neon","tiny text"],sectionOrder:["hero","features","order","benefits","how","trust","faq"]},
 "cod-beauty":{id:"beauty-spa",pattern:"Hero-Centric + Social Proof",style:"Soft UI Evolution",palette:"warm soft + premium accent",typography:"elegant serif + clean sans",effects:["soft-shadow","organic-depth","gentle-hover"],avoid:["harsh animation","medical claims","neon palette"],sectionOrder:["hero","benefits","problem","features","order","trust","faq"]},
 "cod-health":{id:"healthcare",pattern:"Problem-Solution + Trust",style:"Accessible + Calm",palette:"calm light + trustworthy accent",typography:"high-legibility sans",effects:["soft-depth","clear-focus"],avoid:["medical promises","fear tactics","low contrast"],sectionOrder:["hero","problem","benefits","how","order","trust","faq"]},
 "cod-fashion":{id:"ecommerce-fashion",pattern:"Editorial Product Story",style:"Editorial + Premium",palette:"neutral editorial + accent",typography:"editorial display + sans",effects:["editorial-spacing","image-focus","gentle-hover"],avoid:["busy gradients","small CTA","visual clutter"],sectionOrder:["hero","features","benefits","trust","order","faq"]},
 "cod-luxury":{id:"ecommerce-luxury",pattern:"Premium Hero + Value Proof",style:"Luxury Minimal",palette:"premium neutral + restrained accent",typography:"luxury serif + refined sans",effects:["controlled-depth","premium-reflection","gentle-motion"],avoid:["cheap badges","emoji icons","over-animation"],sectionOrder:["hero","features","benefits","trust","order","faq"]},
 "cod-sport":{id:"fitness",pattern:"Benefit-Led Conversion",style:"Bold + Energetic",palette:"high contrast + energetic accent",typography:"bold display + sans",effects:["directional-motion","strong-hierarchy"],avoid:["medical claims","excessive animation","weak CTA"],sectionOrder:["hero","benefits","features","how","order","trust","faq"]},
 "cod-home":{id:"home-services",pattern:"Practical Benefits + Demo",style:"Warm Modern",palette:"warm neutral + practical accent",typography:"friendly sans",effects:["soft-shadow","product-focus"],avoid:["visual clutter","fake guarantees"],sectionOrder:["hero","benefits","how","features","order","trust","faq"]},
 "cod-kids":{id:"family",pattern:"Trust-First Product",style:"Friendly + Accessible",palette:"soft friendly + strong CTA",typography:"rounded readable sans",effects:["soft-depth","gentle-hover"],avoid:["unsafe claims","overstimulation","tiny text"],sectionOrder:["hero","trust","benefits","features","order","faq"]},
 "cod-decor":{id:"decor",pattern:"Visual Story + Benefits",style:"Editorial Warm",palette:"earthy neutral + artisan accent",typography:"editorial serif + sans",effects:["image-focus","soft-depth"],avoid:["fake origin claims","busy layout"],sectionOrder:["hero","benefits","features","how","trust","order","faq"]},
 "cod-s11":{id:"ecommerce",pattern:"Hero-Centric + Social Proof",style:"Conversion Modern",palette:"clean neutral + high-contrast CTA",typography:"bold sans + readable sans",effects:["product-focus","subtle-depth","gentle-hover"],avoid:["fake urgency","emoji icons","low contrast"],sectionOrder:["hero","order","benefits","features","problem","how","trust","faq"]}
};

export function getLandingUiUxProfile(theme:string):LandingUiUxProfile{
 return profiles[theme]||profiles["cod-s11"];
}
export function landingUiUxPrompt(theme:string){
 const p=getLandingUiUxProfile(theme);
 return `UI/UX Pro Max v2 guidance (adapted for LandPro COD): category=${p.id}; pattern=${p.pattern}; style=${p.style}; palette=${p.palette}; typography=${p.typography}; effects=${p.effects.join(", ")}; avoid=${p.avoid.join(", ")}; recommended section order=${p.sectionOrder.join(" > ")}. Apply accessible contrast, visible focus, responsive 375/768/1024/1440, reduced-motion support, resilient text wrapping, SVG icons instead of emoji, and preserve the COD form as a first-class conversion component.`;
}
