"use client";
import {useMemo,useState} from "react";
import {LANDING_TEMPLATE_PRESETS,landingTemplate} from "../../lib/landing-template-presets";

const demo:any={
 "cod-direct":["استرجع راحتك","حل عملي لحياتك اليومية"],
 "premium-product":["L’élégance au quotidien","Une présentation premium et raffinée"],
 "ugc-social":["Vu sur TikTok","Le produit dont tout le monde parle"],
 "problem-solver":["Découvrez la solution","Passez du problème au résultat"],
 "marketplace-cod":["Produit best-seller","Prix, variantes et commande rapide"],
 "flash-sale":["OFFRE FLASH","Profitez de l’offre aujourd’hui"],
 "minimal-clean":["Design Minimal","Performance Max"],
 "luxury-black":["Luxe & Raffinement","Une expérience haut de gamme"],
 "beauty-glow":["Révélez votre beauté naturelle","Une routine simple et élégante"],
 "health-trust":["Soulagez votre quotidien","Confort, confiance et simplicité"],
 "auto-gear":["Gardez votre téléphone en sécurité","Pensé pour la route"],
 "tech-gadget":["Technologie nouvelle génération","Simple, rapide, efficace"],
 "before-after":["Des résultats visibles","Avant / Après"],
 "story-selling":["J’avais toujours ce problème…","Puis j’ai découvert cette solution"],
 "video-first":["Découvrez-le en action","Une démonstration vaut mille mots"],
 "image-first":["L’élégance en image","Le produit au centre de l’expérience"],
 "benefit-cards":["Un produit, plusieurs avantages","Tout ce qu’il vous faut"],
 "feature-showcase":["Des fonctionnalités avancées","Chaque détail compte"],
 "social-proof":["+10 000 clients satisfaits","Ils l’ont essayé"],
 "influencer-pick":["Recommandé par les créateurs","Le choix des réseaux sociaux"],
 "one-screen-cod":["Performance au quotidien","Commandez en quelques secondes"],
 "long-sales":["Le choix intelligent","Tout savoir avant de commander"],
 "comparison-pro":["Pourquoi choisir notre produit ?","Comparez et décidez"],
 "bundle-offer":["Plus vous achetez, plus vous économisez","Choisissez votre pack"],
 "fashion-editorial":["Élégance modeste","Une silhouette contemporaine"],
 "home-solution":["Simplifiez votre maison","Pratique au quotidien"],
 "arabic-cod":["الحل اللي كتقلب عليه","اطلب الآن والدفع عند الاستلام"],
 "darija-morocco":["الحل المثالي ليك","التوصيل لجميع المدن فالمغرب"],
 "whatsapp-commerce":["اطلب عبر واتساب","طلب سريع ومباشر"],
 "conversion-max":["Performance Sans Limites","Une landing pensée conversion"]
};
function DemoImage({id}:{id:string}){return <div className={"v4-product v4-product-"+id}><div className="v4-product-shape"/><span>{id.replaceAll("-"," ").toUpperCase()}</span></div>}
function Order({accent,whatsapp=false}:{accent:string;whatsapp?:boolean}){return <div className="v4-order"><h3>Commandez maintenant</h3><input readOnly placeholder="Nom complet"/><input readOnly placeholder="Téléphone"/><input readOnly placeholder="Ville"/><div className="v4-packs"><button>1 pièce<br/><b>199 DH</b></button><button>2 pièces<br/><b>329 DH</b></button><button>3 pièces<br/><b>419 DH</b></button></div><button className="v4-buy" style={{background:accent}}>{whatsapp?"Commander sur WhatsApp":"Confirmer la commande"}</button><small>Paiement à la livraison · Livraison partout au Maroc</small></div>}
function Preview({id}:{id:string}){const t=landingTemplate(id),copy=demo[id]||[t.name,t.description],dark=!!t.dark||["auto","tech"].includes(t.visualFamily||"");return <main className={"v4-demo family-"+t.visualFamily+(dark?" is-dark":"")} style={{"--a":t.accent} as any}><div className="v4-top">Livraison partout au Maroc · Paiement à la livraison</div><header><b>{t.name}</b><nav>Accueil　Avantages　Avis　FAQ</nav><a href="#order">Commander</a></header><section className="v4-hero"><div className="v4-copy"><span>{t.category}</span><h1>{copy[0]}</h1><p>{copy[1]}. {t.description}</p><div className="v4-price"><b>199 DH</b><del>299 DH</del></div><a href="#order" className="v4-cta">Commander maintenant</a></div><DemoImage id={id}/></section>{id==="before-after"||id==="comparison-pro"?<section className="v4-compare"><article>AVANT<div className="v4-placeholder"/></article><article>APRÈS<div className="v4-placeholder good"/></article></section>:null}{id==="ugc-social"||id==="social-proof"||id==="influencer-pick"?<section className="v4-social"><h2>Ils parlent du produit</h2><div><article>★★★★★<p>“Simple, pratique et exactement ce que je cherchais.”</p></article><article>★★★★★<p>“Commande rapide et produit très utile.”</p></article><article>★★★★★<p>“Je recommande.”</p></article></div></section>:null}<section className="v4-benefits"><article><i>01</i><b>Simple à utiliser</b><p>Une expérience claire et immédiate.</p></article><article><i>02</i><b>Conçu pour le quotidien</b><p>Des bénéfices visibles et faciles à comprendre.</p></article><article><i>03</i><b>Commande sécurisée</b><p>COD et confirmation rapide.</p></article></section><section className="v4-story"><DemoImage id={id}/><div><small>POURQUOI CE PRODUIT ?</small><h2>{id==="problem-solver"?"Du problème à la solution":"Pensé pour vous simplifier la vie"}</h2><p>Cette zone change d’architecture selon le template. Elle accueille démonstration, caractéristiques, histoire produit ou contenu éditorial.</p><ul><li>✓ Bénéfice principal clairement présenté</li><li>✓ Mise en avant des caractéristiques importantes</li><li>✓ Réassurance avant la commande</li></ul></div></section>{id==="bundle-offer"?<section className="v4-bundles"><h2>Choisissez votre offre</h2><div><article>1 pièce<b>199 DH</b></article><article className="hot">2 pièces<b>329 DH</b></article><article>3 pièces<b>419 DH</b></article></div></section>:null}<section className="v4-order-section" id="order"><div><small>COMMANDE COD</small><h2>Recevez votre produit chez vous</h2><p>Remplissez le formulaire. Vous payez uniquement à la livraison.</p></div><Order accent={t.accent} whatsapp={id==="whatsapp-commerce"}/></section><section className="v4-faq"><h2>Questions fréquentes</h2><details open><summary>Comment commander ?</summary><p>Complétez le formulaire et confirmez votre commande.</p></details><details><summary>Comment payer ?</summary><p>Le paiement se fait à la livraison.</p></details></section><footer><b>{t.name}</b><span>Landing Template V4 · LandPro</span></footer></main>}
export default function TemplateShowcase(){const [id,setId]=useState("cod-direct"),[mobile,setMobile]=useState(false),t=useMemo(()=>landingTemplate(id),[id]);return <div className="v4-showcase"><aside><h1>30 Templates V4</h1><p>Vraies previews HTML/React</p><div>{LANDING_TEMPLATE_PRESETS.map((x,i)=><button key={x.id} className={id===x.id?"active":""} onClick={()=>setId(x.id)}><span>{String(i+1).padStart(2,"0")}</span><b>{x.name}</b><small>{x.category}</small></button>)}</div></aside><section className="v4-stage"><div className="v4-toolbar"><div><b>{t.name}</b><span>{t.description}</span></div><div><button className={!mobile?"active":""} onClick={()=>setMobile(false)}>Desktop</button><button className={mobile?"active":""} onClick={()=>setMobile(true)}>Mobile</button></div></div><div className={"v4-frame "+(mobile?"mobile":"desktop")}><Preview id={id}/></div></section></div>}
