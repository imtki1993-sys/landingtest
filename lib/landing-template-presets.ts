export type LandingTemplatePreset={id:string;name:string;category:string;description:string;pattern:string;formStyle:"classic"|"compact"|"cards"|"premium";sectionOrder:string[];accent:string;dark?:boolean};
const p=(id:string,name:string,category:string,description:string,pattern:string,formStyle:LandingTemplatePreset["formStyle"],sectionOrder:string[],accent:string,dark=false):LandingTemplatePreset=>({id,name,category,description,pattern,formStyle,sectionOrder,accent,dark});
export const LANDING_TEMPLATE_PRESETS:LandingTemplatePreset[]=[
p("cod-direct","COD Direct / S11 Style","Conversion","Inspiré de votre S11 : offre claire, réassurance et formulaire COD visible.","Direct COD","compact",["hero","order","benefits","features","trust","faq"],"#16a34a"),
p("premium-product","Premium Product","Premium","Hero éditorial, galerie et preuves avant le formulaire.","Premium","premium",["hero","benefits","features","trust","order","faq"],"#111827"),
p("ugc-social","UGC Social Ads","Social / UGC","Pensé pour Facebook, Instagram et TikTok.","UGC","cards",["hero","trust","benefits","features","order","faq"],"#7c3aed"),
p("problem-solver","Problem → Solution","Conversion","Problème, solution, démonstration puis offre.","Problem Solution","classic",["hero","problem","benefits","features","order","trust","faq"],"#ea580c"),
p("marketplace-cod","Marketplace COD","E-commerce","Fiche produit riche façon marketplace.","Marketplace","cards",["hero","features","benefits","order","trust","faq"],"#2563eb"),
p("flash-sale","Flash Sale","Conversion","Promotion forte et prix immédiatement visible.","Flash","compact",["hero","order","benefits","trust","features","faq"],"#dc2626"),
p("minimal-clean","Minimal Clean","Premium","Landing courte, claire et très aérée.","Minimal","classic",["hero","benefits","features","order","faq"],"#0f172a"),
p("luxury-black","Luxury Black","Premium","Univers sombre haut de gamme.","Luxury","premium",["hero","benefits","features","trust","order","faq"],"#d4af37",true),
p("beauty-glow","Beauty Glow","Beauty / Health","Composition douce pour beauté et skincare.","Beauty","premium",["hero","benefits","features","trust","order","faq"],"#db2777"),
p("health-trust","Health Trust","Beauty / Health","Réassurance, explication et FAQ renforcée.","Trust","classic",["hero","benefits","features","trust","faq","order"],"#0891b2"),
p("auto-gear","Auto Gear","Auto / Tech","Style technique pour accessoires automobile.","Tech","cards",["hero","features","benefits","order","trust","faq"],"#f97316",true),
p("tech-gadget","Tech Gadget","Auto / Tech","Specs et démonstration pour gadgets.","Tech","cards",["hero","features","benefits","trust","order","faq"],"#3b82f6",true),
p("before-after","Before / After","Conversion","Comparaison visuelle orientée résultat.","Comparison","classic",["hero","problem","benefits","features","trust","order","faq"],"#16a34a"),
p("story-selling","Story Selling","Story","Argumentaire progressif et narratif.","Story","classic",["hero","problem","benefits","features","how","trust","order","faq"],"#7c2d12"),
p("video-first","Video First","Social / UGC","Hero média dominant et conversion rapide.","Video","compact",["hero","benefits","order","features","trust","faq"],"#ef4444"),
p("image-first","Image First","Premium","Grande image produit et contenu minimal.","Image","premium",["hero","benefits","order","features","faq"],"#18181b"),
p("benefit-cards","Benefit Cards","Conversion","Bénéfices en cartes très lisibles.","Cards","cards",["hero","benefits","order","features","trust","faq"],"#4f46e5"),
p("feature-showcase","Feature Showcase","Auto / Tech","Chaque fonctionnalité devient une preuve produit.","Features","cards",["hero","features","benefits","how","order","faq"],"#0284c7"),
p("social-proof","Social Proof","Social / UGC","Confiance et preuves sociales prioritaires.","Proof","cards",["hero","trust","benefits","features","order","faq"],"#9333ea"),
p("influencer-pick","Influencer Pick","Social / UGC","Présentation recommandation/UGC.","Influencer","compact",["hero","trust","benefits","order","features","faq"],"#e11d48"),
p("one-screen-cod","One Screen COD","Conversion","Hero compact et formulaire presque immédiat.","Fast COD","compact",["hero","order","benefits","trust","faq"],"#059669"),
p("long-sales","Long Sales Page","Story","Page longue pour produit qui demande plus d'explication.","Longform","classic",["hero","problem","benefits","features","how","trust","order","faq"],"#334155"),
p("comparison-pro","Comparison Pro","Conversion","Ancienne solution contre nouvelle solution.","Comparison","cards",["hero","problem","features","benefits","trust","order","faq"],"#0f766e"),
p("bundle-offer","Bundle Offer","Conversion","Optimisé pour offres 1/2/3 unités.","Bundle","cards",["hero","order","benefits","features","trust","faq"],"#c2410c"),
p("fashion-editorial","Fashion Editorial","Fashion","Lookbook et grandes images éditoriales.","Editorial","premium",["hero","benefits","features","trust","order","faq"],"#171717"),
p("home-solution","Home Solution","Home","Usage maison, démonstration et résultat.","Home","classic",["hero","problem","benefits","features","order","trust","faq"],"#a16207"),
p("arabic-cod","Arabic COD","Morocco COD","Architecture RTL native et conversion COD.","RTL COD","compact",["hero","order","benefits","features","trust","faq"],"#15803d"),
p("darija-morocco","Darija Morocco","Morocco COD","Structure COD pensée pour le marché marocain.","Morocco","cards",["hero","benefits","order","features","trust","faq"],"#b45309"),
p("whatsapp-commerce","WhatsApp Commerce","Morocco COD","COD et WhatsApp au centre du parcours.","WhatsApp","compact",["hero","order","trust","benefits","features","faq"],"#16a34a"),
p("conversion-max","Conversion Max","Conversion","Hero compact, preuves, offre et CTA répétés.","Performance","cards",["hero","trust","order","benefits","features","faq"],"#dc2626")
];
export const LANDING_TEMPLATE_CATEGORIES=["Tous",...Array.from(new Set(LANDING_TEMPLATE_PRESETS.map(x=>x.category)))];
export const landingTemplate=(id:string)=>LANDING_TEMPLATE_PRESETS.find(x=>x.id===id)||LANDING_TEMPLATE_PRESETS[0];
