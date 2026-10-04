"use client";
import React from "react";
import type {LandingV4Data} from "./LandingTemplateV4";
import {landingTemplate} from "../lib/landing-template-presets";
import {referenceTemplate} from "../lib/landing-template-reference";

type P={data:LandingV4Data;preview?:boolean;onSubmit?:(e:React.FormEvent<HTMLFormElement>,qty:number)=>void};
type Spec={hero:"split"|"center"|"media"|"offer"|"editorial";modules:string[];eyebrow:string;headline?:string};

const SPECS:Record<string,Spec>={
 "flash-sale":{hero:"offer",modules:["countdown","benefits","deal","reviews"],eyebrow:"OFFRE LIMITÉE",headline:"L'offre à ne pas manquer"},
 "minimal-clean":{hero:"center",modules:["benefits","gallery","features"],eyebrow:"ESSENTIEL"},
 "luxury-black":{hero:"editorial",modules:["story","details","proof"],eyebrow:"ÉDITION SIGNATURE"},
 "beauty-glow":{hero:"split",modules:["benefits","routine","ugc","reviews"],eyebrow:"BEAUTY ROUTINE"},
 "health-trust":{hero:"split",modules:["trust","benefits","proof","reviews"],eyebrow:"CONFIANCE & CONFORT"},
 "auto-gear":{hero:"media",modules:["specs","benefits","how","proof"],eyebrow:"AUTO GEAR"},
 "tech-gadget":{hero:"media",modules:["specs","features","benefits","proof"],eyebrow:"SMART TECH"},
 "before-after":{hero:"split",modules:["compare","benefits","proof"],eyebrow:"VOYEZ LA DIFFÉRENCE"},
 "story-selling":{hero:"editorial",modules:["problem","story","benefits","how","proof"],eyebrow:"UNE HISTOIRE, UNE SOLUTION"},
 "video-first":{hero:"media",modules:["video","benefits","proof"],eyebrow:"VOIR EN ACTION"},
 "image-first":{hero:"editorial",modules:["gallery","story","benefits"],eyebrow:"LE PRODUIT EN IMAGE"},
 "benefit-cards":{hero:"center",modules:["benefits","features","proof"],eyebrow:"DES BÉNÉFICES CONCRETS"},
 "feature-showcase":{hero:"split",modules:["features","specs","how","proof"],eyebrow:"CHAQUE DÉTAIL COMPTE"},
 "social-proof":{hero:"center",modules:["proof","ugc","benefits"],eyebrow:"PLÉBISCITÉ PAR NOS CLIENTS"},
 "influencer-pick":{hero:"media",modules:["ugc","proof","benefits"],eyebrow:"CREATOR'S PICK"},
 "one-screen-cod":{hero:"offer",modules:["trust","benefits"],eyebrow:"COMMANDE EXPRESS"},
 "long-sales":{hero:"split",modules:["problem","story","benefits","features","how","proof"],eyebrow:"DÉCOUVREZ POURQUOI"},
 "comparison-pro":{hero:"split",modules:["compare","features","benefits","proof"],eyebrow:"COMPAREZ PAR VOUS-MÊME"},
 "bundle-offer":{hero:"offer",modules:["bundle","benefits","proof"],eyebrow:"PLUS VOUS PRENEZ, PLUS VOUS ÉCONOMISEZ"},
 "fashion-editorial":{hero:"editorial",modules:["gallery","story","details","proof"],eyebrow:"NEW EDIT"},
 "home-solution":{hero:"split",modules:["problem","benefits","how","proof"],eyebrow:"MAISON PLUS SIMPLE"},
 "arabic-cod":{hero:"offer",modules:["trust","benefits","proof"],eyebrow:"الدفع عند الاستلام"},
 "darija-morocco":{hero:"split",modules:["benefits","trust","proof"],eyebrow:"مختار للمغرب"},
 "whatsapp-commerce":{hero:"offer",modules:["trust","benefits","proof"],eyebrow:"WHATSAPP COMMERCE"},
 "conversion-max":{hero:"offer",modules:["trust","benefits","features","proof","bundle"],eyebrow:"OFFRE PERFORMANCE"}
};

export default function LandingTemplates06to30({data,preview=false,onSubmit}:P){
 const t=landingTemplate(data.templateId),ref=referenceTemplate(data.templateId),s=SPECS[data.templateId]||SPECS["conversion-max"],c=data.content||{},imgs=data.images||[];
 const offers=Array.isArray(c.quantity_offers)&&c.quantity_offers.length?c.quantity_offers:[{qty:1,price:data.price,label:"1 pièce"},{qty:2,price:data.price*2,label:"2 pièces"},{qty:3,price:data.price*3,label:"3 pièces"}];
 const [qty,setQty]=React.useState(Number(c.quantity_default_qty||offers[0]?.qty||1));
 const chosen=offers.find((x:any)=>Number(x.qty)===qty)||offers[0],total=Number(chosen?.price??data.price*qty);
 const rtl=String(data.locale||"").startsWith("ar")||["arabic-cod","darija-morocco"].includes(data.templateId);
 const headline=c.headline||s.headline||data.name,sub=c.subheadline||c.description||data.description||t.description;
 const benefits=(Array.isArray(c.benefits)&&c.benefits.length?c.benefits:["Simple au quotidien","Qualité contrôlée","Commande sans risque","Livraison rapide"]).slice(0,4);
 const features=(Array.isArray(c.features)&&c.features.length?c.features:["Design fonctionnel","Utilisation intuitive","Finition durable","Pensé pour vos besoins"]).slice(0,4);
 const img=(i:number,cl="")=><div className={"v46-media "+cl}>{imgs[i]?<img src={imgs[i]} alt={data.name}/>:<><div className="v46-placeholder"/><span>{data.name}</span></>}</div>;
 const price=<div className="v46-price"><b>{data.price} DH</b>{data.oldPrice&&<del>{data.oldPrice} DH</del>}</div>;
 const heroMedia=img((data.templateId==="benefit-cards"||data.templateId==="social-proof") && imgs.length>1 ? 1 : 0,"hero-media");
 const heroVariant=data.templateId;
 const hero=<section className={"v46-hero hero-"+s.hero+" hero-unique-"+heroVariant+" reference-hero reference-"+String(ref?.no||"").padStart(2,"0")}>
   {(data.templateId==="auto-gear"||data.templateId==="tech-gadget"||data.templateId==="video-first")&&<div className="v46-mobile-hero-media">{heroMedia}</div>}
   <div className="v46-hero-copy"><small>{s.eyebrow}</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order" className="v46-primary">{data.templateId==="whatsapp-commerce"?"Commander sur WhatsApp":(c.cta||(rtl?"اطلب الآن":"Commander maintenant"))}</a><div className="v46-mini-trust">✓ Paiement à la livraison　✓ Livraison Maroc</div></div>
   <div className={(data.templateId==="auto-gear"||data.templateId==="tech-gadget"||data.templateId==="video-first")?"v46-desktop-hero-media":""}>{heroMedia}</div>
   {s.hero==="offer"&&<aside><b>{rtl?"عرض اليوم":"OFFRE DU JOUR"}</b><span>{data.oldPrice?Math.max(0,Math.round((1-Number(data.price)/Number(data.oldPrice))*100))+"%":"COD"}</span><small>{rtl?"خلص حتى يوصلك":"Payez à la livraison"}</small></aside>}
 </section>;
 const cards=(items:any[],kind:string)=><section className={"v46-cards "+kind}><div className="v46-section-head"><small>{kind.toUpperCase()}</small><h2>{kind==="benefits"?"Pourquoi vous allez l'aimer":"Tout ce qu'il vous faut"}</h2></div><div>{items.map((x:any,i:number)=><article key={i}><i>{String(i+1).padStart(2,"0")}</i><b>{typeof x==="string"?x:x?.title||x?.text}</b><p>{typeof x==="object"?x?.text:"Un avantage clair, utile et facile à comprendre."}</p></article>)}</div></section>;
 const module=(m:string,i:number)=>{
   if(m==="benefits")return <React.Fragment key={m+i}>{cards(benefits,"benefits")}</React.Fragment>;
   if(m==="features"||m==="specs")return <React.Fragment key={m+i}>{cards(features,m)}</React.Fragment>;
   if(m==="story")return <section className="v46-story" key={m+i}>{img(1)}<div><small>NOTRE APPROCHE</small><h2>{c.features_title||"Pensé dans les moindres détails"}</h2><p>{c.description||sub}</p><a href="#order">Découvrir l'offre →</a></div></section>;
   if(m==="problem")return <section className="v46-problem" key={m+i}><div><small>AVANT</small><h2>{c.problem_title||"Le problème que vous connaissez déjà"}</h2><p>{c.problem||"Les solutions ordinaires compliquent souvent une tâche qui devrait rester simple."}</p></div><div><small>APRÈS</small><h2>Une solution plus simple</h2><p>{c.solution||sub}</p></div></section>;
   if(m==="compare")return <section className="v46-compare" key={m+i}><article><b>AVANT</b>{img(1)}</article><article><b>AVEC "+data.name+"</b>{img(2)}</article></section>;
   if(m==="gallery")return <section className="v46-gallery" key={m+i}>{[0,1,2,3].map(n=><React.Fragment key={n}>{img(n)}</React.Fragment>)}</section>;
   if(m==="video")return <section className="v46-video" key={m+i}>{img(1)}<div className="v46-play">▶</div><strong>Découvrez le produit en situation réelle</strong></section>;
   if(m==="ugc")return <section className="v46-ugc" key={m+i}><div className="v46-section-head"><small>COMMUNAUTÉ</small><h2>Vu, testé, adopté</h2></div><div>{[1,2,3].map(n=><article key={n}>{img(n)}<b>★★★★★</b><p>“Pratique, beau et vraiment utile au quotidien.”</p></article>)}</div></section>;
   if(m==="proof")return <section className="v46-proof" key={m+i}><div><b>4.8/5</b><span>Note clients</span></div><div><b>+1 200</b><span>Commandes</span></div><div><b>COD</b><span>Paiement livraison</span></div><div><b>24/7</b><span>Commande en ligne</span></div></section>;
   if(m==="reviews")return <section className="v46-reviews-reference" key={m+i}><div className="v46-section-head"><small>AVIS CLIENTS</small><h2>Ils recommandent ce produit</h2></div><div>{["Casablanca","Rabat","Marrakech"].map((city,j)=><article key={city}><b>★★★★★</b><p>“Produit conforme, pratique et livraison rapide.”</p><span>Client vérifié · {city}</span></article>)}</div></section>;
   if(m==="trust")return <section className="v46-trust" key={m+i}>{["Paiement à la livraison","Confirmation rapide","Livraison partout au Maroc","Support client"].map(x=><b key={x}>✓ {x}</b>)}</section>;
   if(m==="how"||m==="routine")return <section className="v46-how" key={m+i}><div className="v46-section-head"><small>{m==="routine"?"VOTRE ROUTINE":"3 ÉTAPES"}</small><h2>Simple du début à la fin</h2></div><div>{[1,2,3].map((n,j)=><article key={n}><span>{n}</span>{img(j)}<b>{j===0?"Choisissez":j===1?"Utilisez":"Profitez"}</b></article>)}</div></section>;
   if(m==="bundle"||m==="deal")return <section className="v46-bundle" key={m+i}><div className="v46-section-head"><small>OFFRES</small><h2>Choisissez votre formule</h2></div><div>{offers.slice(0,3).map((o:any,j:number)=><button key={j} className={qty===Number(o.qty)?"active":""} onClick={()=>setQty(Number(o.qty))}><small>{j===1?"LE PLUS CHOISI":o.label||o.qty+" pièce(s)"}</small><b>{o.price} DH</b><span>{o.qty} pièce{o.qty>1?"s":""}</span></button>)}</div></section>;
   if(m==="countdown")return <section className="v46-countdown" key={m+i}><b>OFFRE SPÉCIALE</b><span>23</span><i>:</i><span>59</span><i>:</i><span>48</span><small>Stock promotionnel limité</small></section>;
   if(m==="details")return <section className="v46-details" key={m+i}><blockquote>“Un produit utile peut aussi être beau.”</blockquote>{img(2)}</section>;
   return null;
 };
 const faq=(Array.isArray(c.faq)&&c.faq.length?c.faq:[{question:"Comment commander ?",answer:"Remplissez le formulaire puis notre équipe confirme votre commande."},{question:"Comment payer ?",answer:"Vous payez à la livraison."}]).slice(0,4);
 return <main className={"v46 template-"+data.templateId+" family-"+t.visualFamily+(t.dark?" is-dark":"")} dir={rtl?"rtl":"ltr"} data-v4-template={data.templateId} data-reference-template={ref?.no} data-reference-hero={ref?.hero} style={{"--v46-accent":t.accent} as any}>
   <div className="v46-top">{rtl?"التوصيل لجميع المدن · الدفع عند الاستلام":"Livraison partout au Maroc · Paiement à la livraison"}</div>
   <header className={"v46-reference-header header-"+data.templateId}>
    <div className="v46-brand">{data.templateId==="luxury-black"?<><i>◆</i><b>{t.name}</b></>:data.templateId==="beauty-glow"?<><i>✦</i><b>{t.name}</b></>:data.templateId==="health-trust"?<><i>✚</i><b>{t.name}</b></>:data.templateId==="flash-sale"?<><strong>SALE</strong><b>{t.name}</b></>:<b>{t.name}</b>}</div>
    <nav>{data.templateId==="flash-sale"?<><a href="#why">Offres</a><a href="#order">Commander</a><a href="#faq">FAQ</a></>:data.templateId==="minimal-clean"?<><a href="#why">Produit</a><a href="#why">Détails</a><a href="#faq">FAQ</a></>:data.templateId==="luxury-black"?<><a href="#why">Collection</a><a href="#why">Histoire</a><a href="#faq">Service</a></>:data.templateId==="beauty-glow"?<><a href="#why">Routine</a><a href="#why">Résultats</a><a href="#faq">FAQ</a></>:data.templateId==="health-trust"?<><a href="#why">Bénéfices</a><a href="#why">Confiance</a><a href="#faq">Questions</a></>:<><a href="#why">Avantages</a><a href="#order">Commander</a><a href="#faq">FAQ</a></>}</nav>
    <a className="v46-header-action" href="#order">{data.templateId==="flash-sale"?"Profiter de l’offre":data.templateId==="luxury-black"?"Découvrir":data.templateId==="beauty-glow"?"Je commande":data.templateId==="health-trust"?"Commander":rtl?"اطلب الآن":"Commander"}</a>
   </header>
   {hero}<div id="why">{s.modules.map(module)}</div>
   <section className="v46-order" id="order"><div><small>{rtl?"الطلب":"COMMANDE SÉCURISÉE"}</small><h2>{rtl?"أكد الطلب ديالك":"Finalisez votre commande"}</h2><p>{rtl?"خلص غير ملي يوصلك الطلب":"Aucun paiement en ligne. Vous payez à la réception."}</p>{price}</div><form onSubmit={e=>{if(preview){e.preventDefault();return}onSubmit?.(e,qty)}}><input name="name" required={!preview} placeholder={rtl?"الاسم الكامل":"Nom complet"}/><input name="phone" required={!preview} inputMode="tel" placeholder={rtl?"رقم الهاتف":"Téléphone"}/><input name="city" required={!preview} placeholder={rtl?"المدينة":"Ville"}/>{c.order_show_address!==false&&<input name="address" placeholder={rtl?"العنوان":"Adresse"}/>}<div className="v46-packs">{offers.slice(0,3).map((o:any)=><button type="button" key={o.qty} className={qty===Number(o.qty)?"active":""} onClick={()=>setQty(Number(o.qty))}>{o.label||o.qty+" pièce(s)"}<b>{o.price} DH</b></button>)}</div><button className="v46-submit" type={preview?"button":"submit"}>{data.templateId==="whatsapp-commerce"?"WhatsApp":(rtl?"أكد الطلب":"Confirmer")} · {total} DH</button></form></section>
   <section className={"v46-faq v46-faq-"+data.templateId} id="faq"><div className="v46-section-head"><small>{data.templateId==="flash-sale"?"DERNIÈRES QUESTIONS":data.templateId==="minimal-clean"?"INFORMATIONS":data.templateId==="luxury-black"?"SERVICE PRIVÉ":data.templateId==="beauty-glow"?"BEAUTY HELP":data.templateId==="health-trust"?"CONSEILS & CONFIANCE":"FAQ"}</small><h2>{rtl?"الأسئلة الشائعة":data.templateId==="flash-sale"?"Avant la fin de l’offre":data.templateId==="minimal-clean"?"L’essentiel, simplement":data.templateId==="luxury-black"?"Votre service, en détail":data.templateId==="beauty-glow"?"Vos questions beauté":data.templateId==="health-trust"?"Vos questions, nos réponses":"Questions fréquentes"}</h2></div><div className="v46-faq-list">{faq.map((f:any,i:number)=><details key={i} open={i===0}><summary>{typeof f==="string"?f:f.question}</summary><p>{typeof f==="string"?"":f.answer}</p></details>)}</div></section>
   <footer className={"v46-reference-footer footer-"+data.templateId}><div><b>{data.name}</b><p>{sub}</p></div><div><b>{data.templateId==="flash-sale"?"OFFRE FLASH":data.templateId==="minimal-clean"?"ESSENTIEL":data.templateId==="luxury-black"?"MAISON":data.templateId==="beauty-glow"?"BEAUTY":data.templateId==="health-trust"?"CONFIANCE":"LandPro"}</b><span>{data.templateId==="luxury-black"?"Service · Livraison · COD":data.templateId==="beauty-glow"?"Routine · Livraison · Support":data.templateId==="health-trust"?"Conseil · COD · Livraison":"COD · Livraison Maroc · Support"}</span></div></footer>
 </main>;
}