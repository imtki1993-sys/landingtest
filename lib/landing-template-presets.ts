export type LandingTemplatePreset={id:string;name:string;category:string;description:string;pattern:string;formStyle:"classic"|"compact"|"cards"|"premium";sectionOrder:string[];accent:string;dark?:boolean;visualFamily?:string};
const p=(id:string,name:string,category:string,description:string,pattern:string,formStyle:LandingTemplatePreset["formStyle"],sectionOrder:string[],accent:string,dark=false,visualFamily="conversion"):LandingTemplatePreset=>({id,name,category,description,pattern,formStyle,sectionOrder,accent,dark,visualFamily});
export const LANDING_TEMPLATE_PRESETS:LandingTemplatePreset[]=[
p("cod-direct","COD Direct / S11 Style","Conversion","Inspiré de votre S11 : offre claire, réassurance et formulaire COD visible.","Direct COD","compact",["hero","order","benefits","features","trust","faq"],"#16a34a",false,"s11"),
p("premium-product","Premium Product","Premium","Hero éditorial, galerie et preuves avant le formulaire.","Premium","premium",["hero","benefits","features","trust","order","faq"],"#111827",false,"premium"),
p("ugc-social","UGC Social Ads","Social / UGC","Pensé pour Facebook, Instagram et TikTok.","UGC","cards",["hero","trust","benefits","features","order","faq"],"#7c3aed",false,"ugc"),
p("problem-solver","Problem → Solution","Conversion","Problème, solution, démonstration puis offre.","Problem Solution","classic",["hero","problem","benefits","features","order","trust","faq"],"#ea580c",false,"problem"),
p("marketplace-cod","Marketplace COD","E-commerce","Fiche produit riche façon marketplace.","Marketplace","cards",["hero","features","benefits","order","trust","faq"],"#2563eb",false,"marketplace"),
p("flash-sale","Flash Sale","Conversion","Promotion forte et prix immédiatement visible.","Flash","compact",["hero","order","benefits","trust","features","faq"],"#dc2626",false,"flash"),
p("minimal-clean","Minimal Clean","Premium","Landing courte, claire et très aérée.","Minimal","classic",["hero","benefits","features","order","faq"],"#0f172a",false,"minimal"),
p("luxury-black","Luxury Black","Premium","Univers sombre haut de gamme.","Luxury","premium",["hero","benefits","features","trust","order","faq"],"#d4af37",true,"luxury"),
p("beauty-glow","Beauty Glow","Beauty / Health","Composition douce pour beauté et skincare.","Beauty","premium",["hero","benefits","features","trust","order","faq"],"#db2777",false,"beauty"),
p("health-trust","Health Trust","Beauty / Health","Réassurance, explication et FAQ renforcée.","Trust","classic",["hero","benefits","features","trust","faq","order"],"#0891b2",false,"health"),
p("auto-gear","Auto Gear","Auto / Tech","Style technique pour accessoires automobile.","Tech","cards",["hero","features","benefits","order","trust","faq"],"#f97316",true,"auto"),
p("tech-gadget","Tech Gadget","Auto / Tech","Specs et démonstration pour gadgets.","Tech","cards",["hero","features","benefits","trust","order","faq"],"#3b82f6",true,"tech"),
p("before-after","Before / After","Conversion","Comparaison visuelle orientée résultat.","Comparison","classic",["hero","problem","benefits","features","trust","order","faq"],"#16a34a",false,"comparison"),
p("story-selling","Story Selling","Story","Argumentaire progressif et narratif.","Story","classic",["hero","problem","benefits","features","how","trust","order","faq"],"#7c2d12",false,"story"),
p("video-first","Video First","Social / UGC","Hero média dominant et conversion rapide.","Video","compact",["hero","benefits","order","features","trust","faq"],"#ef4444",false,"media"),
p("image-first","Image First","Premium","Grande image produit et contenu minimal.","Image","premium",["hero","benefits","order","features","faq"],"#18181b",false,"media"),
p("benefit-cards","Benefit Cards","Conversion","Bénéfices en cartes très lisibles.","Cards","cards",["hero","benefits","order","features","trust","faq"],"#4f46e5",false,"cards"),
p("feature-showcase","Feature Showcase","Auto / Tech","Chaque fonctionnalité devient une preuve produit.","Features","cards",["hero","features","benefits","how","order","faq"],"#0284c7",false,"tech"),
p("social-proof","Social Proof","Social / UGC","Confiance et preuves sociales prioritaires.","Proof","cards",["hero","trust","benefits","features","order","faq"],"#9333ea",false,"social"),
p("influencer-pick","Influencer Pick","Social / UGC","Présentation recommandation/UGC.","Influencer","compact",["hero","trust","benefits","order","features","faq"],"#e11d48",false,"ugc"),
p("one-screen-cod","One Screen COD","Conversion","Hero compact et formulaire presque immédiat.","Fast COD","compact",["hero","order","benefits","trust","faq"],"#059669",false,"s11"),
p("long-sales","Long Sales Page","Story","Page longue pour produit qui demande plus d'explication.","Longform","classic",["hero","problem","benefits","features","how","trust","order","faq"],"#334155",false,"story"),
p("comparison-pro","Comparison Pro","Conversion","Ancienne solution contre nouvelle solution.","Comparison","cards",["hero","problem","features","benefits","trust","order","faq"],"#0f766e",false,"comparison"),
p("bundle-offer","Bundle Offer","Conversion","Optimisé pour offres 1/2/3 unités.","Bundle","cards",["hero","order","benefits","features","trust","faq"],"#c2410c",false,"bundle"),
p("fashion-editorial","Fashion Editorial","Fashion","Lookbook et grandes images éditoriales.","Editorial","premium",["hero","benefits","features","trust","order","faq"],"#171717",false,"fashion"),
p("home-solution","Home Solution","Home","Usage maison, démonstration et résultat.","Home","classic",["hero","problem","benefits","features","order","trust","faq"],"#a16207",false,"home"),
p("arabic-cod","Arabic COD","Morocco COD","Architecture RTL native et conversion COD.","RTL COD","compact",["hero","order","benefits","features","trust","faq"],"#15803d",false,"rtl"),
p("darija-morocco","Darija Morocco","Morocco COD","Structure COD pensée pour le marché marocain.","Morocco","cards",["hero","benefits","order","features","trust","faq"],"#b45309",false,"morocco"),
p("whatsapp-commerce","WhatsApp Commerce","Morocco COD","COD et WhatsApp au centre du parcours.","WhatsApp","compact",["hero","order","trust","benefits","features","faq"],"#16a34a",false,"whatsapp"),
p("conversion-max","Conversion Max","Conversion","Hero compact, preuves, offre et CTA répétés.","Performance","cards",["hero","trust","order","benefits","features","faq"],"#dc2626",false,"conversion")
];
export const LANDING_TEMPLATE_CATEGORIES=["Tous",...Array.from(new Set(LANDING_TEMPLATE_PRESETS.map(x=>x.category)))];
export const landingTemplate=(id:string)=>LANDING_TEMPLATE_PRESETS.find(x=>x.id===id)||LANDING_TEMPLATE_PRESETS[0];
