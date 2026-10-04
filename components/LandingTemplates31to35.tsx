"use client";
import React from "react";
import type {LandingV4Data} from "./LandingTemplateV4";

type Props={data:LandingV4Data;preview?:boolean;onSubmit?:(e:React.FormEvent<HTMLFormElement>,qty:number)=>void};
const txt=(x:any)=>typeof x==="string"?x:x?.title||x?.text||"";

function Shared({data,preview,onSubmit}:{data:LandingV4Data;preview:boolean;onSubmit?:Props["onSubmit"]}){
 const c=data.content||{},offers=Array.isArray(c.quantity_offers)&&c.quantity_offers.length?c.quantity_offers:[{qty:1,price:data.price,label:"1 pièce"},{qty:2,price:data.price*2,label:"2 pièces"},{qty:3,price:data.price*3,label:"3 pièces"}];
 const [qty,setQty]=React.useState(Number(c.quantity_default_qty||offers[0]?.qty||1));const selected=offers.find((o:any)=>Number(o.qty)===qty),total=Number(selected?.price??data.price*qty);
 return <><section className="b60-proof"><div><b>4.9/5</b><span>★★★★★</span><small>Clients vérifiés</small></div><blockquote>“Une expérience produit premium, simple et convaincante.”</blockquote></section><section className="b60-order" id="order"><div><small>COMMANDE COD</small><h2>Commandez maintenant.</h2><p>Paiement à la livraison partout au Maroc.</p></div><form onSubmit={e=>{if(preview){e.preventDefault();return}onSubmit?.(e,qty)}}><input name="name" required={!preview} placeholder="Nom complet"/><input name="phone" required={!preview} inputMode="tel" placeholder="Téléphone"/><input name="city" required={!preview} placeholder="Ville"/><input name="address" placeholder="Adresse"/><div className="b60-packs">{offers.slice(0,3).map((o:any)=><button type="button" key={o.qty} className={qty===Number(o.qty)?"active":""} onClick={()=>setQty(Number(o.qty))}>{o.label||o.qty+" pièce(s)"}<b>{o.price} DH</b></button>)}</div><button className="b60-buy" type={preview?"button":"submit"}>Confirmer · {total} DH</button></form></section><section className="b60-faq"><h2>Questions fréquentes</h2>{(c.faq?.length?c.faq:[{question:"Comment commander ?",answer:"Complétez le formulaire puis confirmez."},{question:"Comment payer ?",answer:"Le paiement se fait à la livraison."}]).slice(0,4).map((f:any,i:number)=><details key={i} open={i===0}><summary>{typeof f==="string"?f:f.question}</summary><p>{typeof f==="string"?"":f.answer}</p></details>)}</section></>
}

export default function LandingTemplates31to35({data,preview=false,onSubmit}:Props){
 const c=data.content||{},imgs=data.images||[],headline=c.headline||data.name,sub=c.subheadline||c.description||data.description||"Conçu pour transformer votre expérience au quotidien.";
 const benefits=(c.benefits||["Design remarquable","Performance au quotidien","Expérience intuitive"]).slice(0,3),features=(c.features||["Une technologie pensée dans les moindres détails","Une conception premium","Simple, rapide et efficace"]).slice(0,3);
 const media=(i:number,cl="")=><div className={"b60-media "+cl}>{imgs[i]?<img src={imgs[i]} alt={data.name}/>:<div className="b60-placeholder">{data.name}</div>}</div>;
 const price=<div className="b60-price"><b>{data.price} DH</b>{data.oldPrice&&<del>{data.oldPrice} DH</del>}</div>;
 const common=<Shared data={data} preview={preview} onSubmit={onSubmit}/>;
 if(data.templateId==="apple-product")return <main className="b60 b60-apple">
  <header><b>Apple Product</b><nav>Aperçu　Design　Performance</nav><a href="#order">Commander</a></header>
  <section className="apple-hero"><small>PRO SERIES</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order">Découvrir</a>{media(0,"apple-product-shot")}</section>
  <section className="apple-intro"><small>UNE NOUVELLE RÉFÉRENCE</small><h2>Puissant par nature.<br/>Simple par design.</h2></section>
  <section className="apple-bento"><article className="apple-wide">{media(1)}<div><small>DESIGN</small><h3>Une conception spectaculaire.</h3></div></article><article className="apple-chip"><small>PERFORMANCE</small><b>PRO</b><p>{txt(features[0])}</p></article><article className="apple-detail">{media(2)}<h3>Chaque détail compte.</h3></article></section>
  <section className="b60-benefits">{benefits.map((x:any,i:number)=><article key={i}><i>0{i+1}</i><h3>{txt(x)}</h3></article>)}</section>{common}<footer><b>Apple Product</b><span>Produit　Livraison　Contact</span></footer>
 </main>;
 if(data.templateId==="samsung-launch")return <main className="b60 b60-samsung">
  <header><b>SAMSUNG</b><nav>Galaxy　Innovation　Caractéristiques</nav><a href="#order">Acheter</a></header>
  <section className="samsung-hero"><div><small>NEXT IS NOW</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order">Découvrir maintenant</a></div>{media(0,"samsung-phone")}</section>
  <section className="samsung-statement"><small>GALAXY EXPERIENCE</small><h2>Une nouvelle ère<br/>commence.</h2></section>
  <section className="samsung-feature">{media(1)}<div><small>INNOVATION</small><h2>Plus intelligent.<br/>Plus immersif.</h2><p>{txt(features[0])}</p></div></section>
  <section className="samsung-cards">{features.map((x:any,i:number)=><article key={i}><i>0{i+1}</i><h3>{txt(x)}</h3></article>)}</section>{common}<footer><b>SAMSUNG</b><span>Galaxy　Support　Livraison</span></footer>
 </main>;
 if(data.templateId==="dyson-premium")return <main className="b60 b60-dyson">
  <header><b>dyson</b><nav>Technologie　Design　Résultats</nav><a href="#order">Commander</a></header>
  <section className="dyson-hero"><div><small>ENGINEERED DIFFERENT</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order">Voir la technologie</a></div>{media(0,"dyson-product")}</section>
  <section className="dyson-engineering"><div><small>INGÉNIERIE</small><h2>La technologie au service du quotidien.</h2><p>{sub}</p></div>{media(1)}</section>
  <section className="dyson-features">{features.map((x:any,i:number)=><article key={i}><span>0{i+1}</span><h3>{txt(x)}</h3><p>Précision, contrôle et performance.</p></article>)}</section>{common}<footer><b>dyson</b><span>Technologie　Aide　Contact</span></footer>
 </main>;
 if(data.templateId==="nothing-tech")return <main className="b60 b60-nothing">
  <header><b>NOTHING</b><nav>Phone　Design　Specs</nav><a href="#order">BUY</a></header>
  <section className="nothing-hero"><div><small>LESS. BUT BETTER.</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order">Explorer</a></div>{media(0,"nothing-phone")}</section>
  <section className="nothing-grid"><article><span>01</span><h2>Transparent.<br/>Intentionnel.</h2></article>{media(1,"nothing-grid-media")}<article className="nothing-black"><span>02</span><h3>{txt(features[0])}</h3></article>{media(2,"nothing-grid-media")}</section>
  <section className="nothing-specs">{features.map((x:any,i:number)=><article key={i}><b>0{i+1}</b><span>{txt(x)}</span></article>)}</section>{common}<footer><b>NOTHING</b><span>Products　Support　Community</span></footer>
 </main>;
 return <main className="b60 b60-gaming">
  <header><b>LEVEL//UP</b><nav>GEAR　PERFORMANCE　SETUP</nav><a href="#order">SHOP</a></header>
  <section className="gaming-hero"><div><small>LEVEL UP</small><h1>{headline}</h1><p>{sub}</p>{price}<a href="#order">Jouer maintenant</a></div>{media(0,"gaming-controller")}<div className="gaming-glow"/></section>
  <section className="gaming-stats">{benefits.map((x:any,i:number)=><article key={i}><span>0{i+1}</span><b>{txt(x)}</b></article>)}</section>
  <section className="gaming-battle">{media(1)}<div><small>PERFORMANCE</small><h2>Conçu pour prendre l'avantage.</h2><p>{sub}</p></div></section>
  <section className="gaming-features">{features.map((x:any,i:number)=><article key={i}><i>0{i+1}</i><h3>{txt(x)}</h3></article>)}</section>{common}<footer><b>LEVEL//UP</b><span>Gear　Support　Community</span></footer>
 </main>
}