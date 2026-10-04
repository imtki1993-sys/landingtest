"use client";
import React from "react";
import type {LandingV4Data} from "./LandingTemplateV4";

const CFG:any={
 "apple-product":{no:31,name:"Apple Product",eyebrow:"PRO SERIES",cta:"Découvrir",theme:"apple"},
 "samsung-launch":{no:32,name:"Samsung Launch",eyebrow:"NEXT IS NOW",cta:"Découvrir maintenant",theme:"samsung"},
 "dyson-premium":{no:33,name:"Dyson Premium",eyebrow:"ENGINEERED DIFFERENT",cta:"Voir la technologie",theme:"dyson"},
 "nothing-tech":{no:34,name:"Nothing Tech",eyebrow:"LESS. BUT BETTER.",cta:"Explorer",theme:"nothing"},
 "gaming-neon":{no:35,name:"Gaming Neon",eyebrow:"LEVEL UP",cta:"Jouer maintenant",theme:"gaming"}
};
export default function LandingTemplates31to35({data,preview=false,onSubmit}:{data:LandingV4Data;preview?:boolean;onSubmit?:(e:React.FormEvent<HTMLFormElement>,qty:number)=>void}){
 const c=data.content||{},cfg=CFG[data.templateId]||CFG["apple-product"],imgs=data.images||[];
 const offers=Array.isArray(c.quantity_offers)&&c.quantity_offers.length?c.quantity_offers:[{qty:1,price:data.price,label:"1 pièce"},{qty:2,price:data.price*2,label:"2 pièces"},{qty:3,price:data.price*3,label:"3 pièces"}];
 const [qty,setQty]=React.useState(Number(c.quantity_default_qty||offers[0]?.qty||1));
 const selected=offers.find((x:any)=>Number(x.qty)===qty),total=Number(selected?.price??data.price*qty);
 const headline=c.headline||data.name,sub=c.subheadline||c.description||data.description||"Une nouvelle façon de vivre votre produit.";
 const benefits=(c.benefits||["Design pensé dans les moindres détails","Performance fluide au quotidien","Une expérience simple et premium"]).slice(0,3);
 const features=(c.features||["Performance nouvelle génération","Conception premium","Pensé pour votre quotidien"]).slice(0,3);
 const media=(i:number,cl="")=><div className={"v60-media "+cl}>{imgs[i]?<img src={imgs[i]} alt={data.name}/>:<div className="v60-placeholder"><span>{data.name}</span></div>}</div>;
 const price=<div className="v60-price"><b>{data.price} DH</b>{data.oldPrice&&<del>{data.oldPrice} DH</del>}</div>;
 const order=<section className="v60-order" id="order"><div className="v60-order-copy"><small>COMMANDE COD</small><h2>Commandez simplement.</h2><p>Paiement à la livraison partout au Maroc.</p></div><form onSubmit={e=>{if(preview){e.preventDefault();return}onSubmit?.(e,qty)}}><input name="name" required={!preview} placeholder="Nom complet"/><input name="phone" required={!preview} inputMode="tel" placeholder="Téléphone"/><input name="city" required={!preview} placeholder="Ville"/><input name="address" placeholder="Adresse"/><div className="v60-packs">{offers.slice(0,3).map((o:any)=><button type="button" key={o.qty} className={qty===Number(o.qty)?"active":""} onClick={()=>setQty(Number(o.qty))}><span>{o.label||o.qty+" pièce(s)"}</span><b>{o.price} DH</b></button>)}</div><button className="v60-buy" type={preview?"button":"submit"}>Confirmer la commande · {total} DH</button><small>Paiement à la livraison · Commande sécurisée</small></form></section>;
 const faq=<section className="v60-faq"><small>FAQ</small><h2>Questions fréquentes</h2>{(c.faq?.length?c.faq:[{question:"Comment commander ?",answer:"Remplissez le formulaire et confirmez votre commande."},{question:"Comment payer ?",answer:"Vous payez à la livraison."}]).slice(0,4).map((x:any,i:number)=><details key={i} open={i===0}><summary>{typeof x==="string"?x:x.question}</summary><p>{typeof x==="string"?"":x.answer}</p></details>)}</section>;
 return <main className={"v60 template-"+data.templateId} data-v4-template={data.templateId}>
  <div className="v60-top">Livraison partout au Maroc · Paiement à la livraison</div>
  <header className="v60-header"><b>{cfg.name}</b><nav>Produit　Technologie　Avis　FAQ</nav><a href="#order">Commander</a></header>
  <section className="v60-hero">
   <div className="v60-hero-copy"><small>{cfg.eyebrow}</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order" className="v60-primary">{cfg.cta}</a></div>
   {media(0,"v60-hero-media")}
   {data.templateId==="gaming-neon"&&<div className="v60-neon-stats"><span>PRO</span><span>FAST</span><span>RGB</span></div>}
  </section>
  {data.templateId==="apple-product"&&<><section className="v60-statement"><small>UNE NOUVELLE RÉFÉRENCE</small><h2>Puissant par nature.<br/>Simple par design.</h2></section><section className="v60-bento"><article className="wide">{media(1)}<h3>Une conception spectaculaire.</h3></article><article>{media(2)}<h3>Chaque détail compte.</h3></article><article className="dark"><b>PRO</b><p>Des performances pensées pour durer.</p></article></section></>}
  {data.templateId==="samsung-launch"&&<><section className="v60-launch-band"><h2>Une nouvelle ère commence.</h2><p>{sub}</p></section><section className="v60-feature-media">{media(1)}<div><small>INNOVATION</small><h2>Plus intelligent.<br/>Plus immersif.</h2><p>{features[0]}</p></div></section></>}
  {data.templateId==="dyson-premium"&&<><section className="v60-engineering"><div><small>INGÉNIERIE</small><h2>La technologie au service du quotidien.</h2><p>{sub}</p></div>{media(1)}</section><section className="v60-tech-cards">{features.map((x:any,i:number)=><article key={i}><i>0{i+1}</i><h3>{typeof x==="string"?x:x.title||x.text}</h3></article>)}</section></>}
  {data.templateId==="nothing-tech"&&<><section className="v60-nothing-grid"><article><small>01</small><h2>Transparent.<br/>Intentionnel.</h2></article>{media(1)}<article className="black"><small>02</small><p>{features[0]}</p></article>{media(2)}</section></>}
  {data.templateId==="gaming-neon"&&<><section className="v60-gaming-strip">{benefits.map((x:any,i:number)=><article key={i}><i>0{i+1}</i><b>{typeof x==="string"?x:x.title||x.text}</b></article>)}</section><section className="v60-battle">{media(1)}<div><small>PERFORMANCE</small><h2>Conçu pour prendre l'avantage.</h2><p>{sub}</p></div></section></>}
  <section className="v60-benefits">{benefits.map((x:any,i:number)=><article key={i}><i>0{i+1}</i><h3>{typeof x==="string"?x:x.title||x.text}</h3><p>Une expérience claire, utile et immédiatement perceptible.</p></article>)}</section>
  <section className="v60-proof"><div><b>4.9/5</b><span>★★★★★</span><small>Clients vérifiés</small></div><blockquote>“Un produit remarquable, une commande simple et une expérience vraiment premium.”</blockquote></section>
  {order}{faq}
  <footer className="v60-footer"><b>{cfg.name}</b><span>Produit　Livraison　Contact</span><small>© LandPro · Paiement à la livraison</small></footer>
 </main>
}