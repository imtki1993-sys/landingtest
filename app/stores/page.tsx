"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";

const TEMPLATES=[
["Atlas COD","COD Maroc","🛍️"],["Casa Market","Général","🏪"],["Marrakech Shop","Général","🌴"],["Rabat Minimal","Minimal","◻️"],["Sahara Dark","Dark","🌙"],
["Noor Abaya","Mode","🧕"],["Medina Fashion","Mode","👗"],["Luxe Maroc","Luxe","✦"],["Bijoux Gold","Bijoux","💎"],["Time Store","Montres","⌚"],
["Vision Optic","Lunettes","🕶️"],["Bag House","Sacs","👜"],["Beauty Glow","Beauté","✨"],["Parfum Privé","Parfums","🌸"],["Baby Care","Bébé","🧸"],
["Sneaker Hub","Chaussures","👟"],["Fit Market","Fitness","🏋️"],["Sport Pro","Sport","⚽"],["Wellness Care","Bien-être","🌿"],["Home Living","Maison","🏠"],
["Kitchen Plus","Cuisine","🍳"],["Tech Zone","Électronique","💻"],["Gadget Lab","Gadgets","⚡"],["Auto Gear","Automobile","🚗"],["Moto Ride","Moto","🏍️"],
["One Product","One product","🎯"],["Flash Deals","Promotions","🔥"],["Social Shop","Social","♥"],["Premium Black","Premium","◆"],["Marketplace","Multi-produit","▦"]
].map((x,i)=>({id:"free-"+String(i+1).padStart(2,"0"),name:x[0],category:x[1],icon:x[2]}));

type Store={id:string;name:string;templateId:string;language:string;createdAt:string};
export default function Stores(){
 const [stores,setStores]=useState<Store[]>([]),[selected,setSelected]=useState(TEMPLATES[0].id),[name,setName]=useState(""),[language,setLanguage]=useState("darija"),[filter,setFilter]=useState("Tous");
 useEffect(()=>{try{setStores(JSON.parse(localStorage.getItem("landpro_stores")||"[]"))}catch{}},[]);
 const cats=["Tous",...Array.from(new Set(TEMPLATES.map(t=>t.category)))];
 const visible=useMemo(()=>filter==="Tous"?TEMPLATES:TEMPLATES.filter(t=>t.category===filter),[filter]);
 function createStore(){const n=name.trim();if(!n)return alert("Entre le nom de la boutique.");const store={id:"store-"+Date.now(),name:n,templateId:selected,language,createdAt:new Date().toISOString()};const next=[store,...stores];setStores(next);localStorage.setItem("landpro_stores",JSON.stringify(next));setName("");alert("Boutique créée en brouillon. Tu peux maintenant continuer sa configuration.");}
 const current=TEMPLATES.find(t=>t.id===selected)!;
 return <main className="dash-shell"><aside className="dash-side"><div className="dash-brand"><div className="brand-mark">M</div><div><b>Landing Motor</b><small>AI COD BUILDER</small></div></div><nav className="dash-nav"><Link href="/">⌂ Dashboard</Link><Link href="/pages">▣ Landing Pages</Link><Link className="active" href="/stores">▦ Stores</Link><Link href="/orders">◎ Commandes</Link><Link href="/delivery">🚚 Livraison</Link><Link href="/products">◇ Mes produits</Link><Link href="/domains">⌁ Domaines</Link><Link href="/analytics">↗ Analytics</Link><Link href="/settings">⚙ Paramètres</Link></nav></aside>
 <section className="dash-content stores-dashboard"><header className="dash-header"><div><span className="eyebrow">STORE BUILDER</span><h1>Générateur de boutiques</h1><p>Crée une boutique COD Maroc à partir de 30 templates gratuits.</p></div><span className="stores-free-badge">30 TEMPLATES GRATUITS</span></header>
 {stores.length>0&&<section className="stores-existing"><div className="stores-section-head"><div><small>MES STORES</small><h2>Boutiques en brouillon</h2></div><b>{stores.length}</b></div><div className="stores-drafts">{stores.slice(0,4).map(s=>{const t=TEMPLATES.find(x=>x.id===s.templateId);return <article key={s.id}><span>{t?.icon}</span><div><b>{s.name}</b><small>{t?.name} · {s.language}</small></div><em>BROUILLON</em></article>})}</div></section>}
 <section className="store-create-panel"><div className="store-create-copy"><small>ÉTAPE 1</small><h2>Configure ta boutique</h2><p>Choisis un template puis renseigne les informations de base.</p><label>Nom de la boutique<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Motorix Store"/></label><label>Langue<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="darija">Darija Maroc</option><option value="ar">العربية</option><option value="fr">Français</option></select></label><div className="store-selected"><span>{current.icon}</span><div><small>TEMPLATE SÉLECTIONNÉ</small><b>{current.name}</b></div></div><button type="button" className="new-page-btn" onClick={createStore}>Créer la boutique →</button></div>
 <div className="store-preview"><div className="store-browser"><i/><i/><i/><span>{name||"Ma boutique"}</span></div><div className={"store-mock store-mock-"+((TEMPLATES.findIndex(t=>t.id===selected)%6)+1)}><header><b>{name||"STORE"}</b><nav>Accueil&nbsp;&nbsp; Produits&nbsp;&nbsp; Contact</nav></header><div className="store-mock-hero"><small>{current.category.toUpperCase()}</small><h3>{current.name}</h3><p>Une boutique moderne pensée pour la vente COD au Maroc.</p><button>Commander</button></div><div className="store-mock-products"><i/><i/><i/></div></div></div></section>
 <div className="stores-section-head"><div><small>BIBLIOTHÈQUE</small><h2>30 templates gratuits</h2></div><span>Sélectionne un design pour voir l’aperçu.</span></div><div className="store-filters">{cats.map(c=><button key={c} className={filter===c?"active":""} onClick={()=>setFilter(c)}>{c}</button>)}</div>
 <div className="store-template-grid">{visible.map((t,i)=><button type="button" key={t.id} className={"store-template-card "+(selected===t.id?"selected":"")} onClick={()=>setSelected(t.id)}><div className={"store-template-thumb store-theme-"+((TEMPLATES.indexOf(t)%6)+1)}><span>{t.icon}</span><div><i/><i/><i/></div></div><div className="store-template-meta"><span><b>{t.name}</b><small>{t.category}</small></span><em>GRATUIT</em></div></button>)}</div>
 </section></main>
}