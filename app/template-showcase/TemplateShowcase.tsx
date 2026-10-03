"use client";
import {useState} from "react";
import {LANDING_TEMPLATE_PRESETS,landingTemplate} from "../../lib/landing-template-presets";
import LandingTemplateV4 from "../../components/LandingTemplateV4";
type Device="desktop"|"tablet"|"mobile";
const rtl=["arabic-cod","darija-morocco","whatsapp-commerce"];
function demo(id:string){const t=landingTemplate(id);return {templateId:id,name:id==="cod-direct"?"Support S11":"Votre produit",description:t.description,price:199,oldPrice:299,locale:rtl.includes(id)?"ar-MA":"fr"}}
export default function TemplateShowcase(){
 const [selected,setSelected]=useState<string|null>(null),[device,setDevice]=useState<Device>("desktop");
 const t=selected?landingTemplate(selected):null;
 return <main className="v4-gallery-page">
  <header className="v4-gallery-head"><div><span>LANDPRO V4 LIBRARY</span><h1>30 Templates Landing Page</h1><p>30 architectures e-commerce. Cliquez sur un modèle pour l’ouvrir en grand et tester Desktop, Tablette et Mobile.</p></div><b>30 modèles</b></header>
  <section className="v4-gallery-grid">{LANDING_TEMPLATE_PRESETS.map((x,i)=><button type="button" className="v4-gallery-card" key={x.id} onClick={()=>{setSelected(x.id);setDevice("desktop")}}>
   <div className="v4-gallery-card-head"><strong>{String(i+1).padStart(2,"0")}</strong><span><b>{x.name}</b><small>{x.category}</small></span><i>Voir</i></div>
   <div className="v4-gallery-shot"><div className="v4-gallery-scale"><LandingTemplateV4 data={demo(x.id)} preview/></div></div>
  </button>)}</section>
  {selected&&t&&<div className="v4-gallery-modal" role="dialog" aria-modal="true"><div className="v4-gallery-modalbar"><div><b>{t.name}</b><span>{t.description}</span></div><div className="v4-gallery-devices"><button className={device==="desktop"?"active":""} onClick={()=>setDevice("desktop")}>Desktop</button><button className={device==="tablet"?"active":""} onClick={()=>setDevice("tablet")}>Tablette</button><button className={device==="mobile"?"active":""} onClick={()=>setDevice("mobile")}>Mobile</button><button className="close" onClick={()=>setSelected(null)}>✕</button></div></div><div className="v4-gallery-modalbody"><div className={"v4-frame "+device}><LandingTemplateV4 data={demo(selected)} preview/></div></div></div>}
 </main>
}