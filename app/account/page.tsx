"use client";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import {useEffect,useState} from "react";
export default function Account(){
 const [data,setData]=useState<any>(null);
 useEffect(()=>{Promise.all([fetch("/api/settings").then(r=>r.json()).catch(()=>({})),fetch("/api/pages").then(r=>r.json()).catch(()=>({})),fetch("/api/stores").then(r=>r.json()).catch(()=>({}))]).then(([s,p,st])=>setData({workspace:s.workspace,pages:p.pages||[],stores:st.stores||[]}))},[]);
 const name=data?.workspace?.name||"Workspace";
 const pages=data?.pages?.length||0,stores=data?.stores?.length||0;
 return <main className="dash-shell has-shared-topbar"><SaaSTopbar/><SaaSSidebar/><section className="dash-content account-dashboard">
  <header className="dash-header"><div><span className="eyebrow">COMPTE CLIENT</span><h1>Mon abonnement</h1><p>Consulte ton workspace, ton plan et l’utilisation de ton compte LandPro.</p></div></header>
  <div className="account-plan-card"><div><small>WORKSPACE</small><h2>{name}</h2><p>Ton espace de travail LandPro.</p></div><span className="account-plan-badge">PRO</span></div>
  <div className="account-usage-grid"><article><small>LANDING PAGES</small><b>{pages}</b><span>Pages créées</span></article><article><small>STORES</small><b>{stores}</b><span>Boutiques créées</span></article><article><small>STATUT</small><b>Actif</b><span>Workspace disponible</span></article></div>
  <div className="account-grid"><section className="account-card"><h3>Plan actuel</h3><div className="account-plan-line"><div><b>LandPro Pro</b><span>Plan de ton workspace</span></div><em>Actif</em></div><p>Les limites et informations de facturation seront affichées ici lorsqu’un système d’abonnement sera connecté.</p></section><section className="account-card"><h3>Informations du workspace</h3><div className="account-detail"><span>Nom</span><b>{name}</b></div><div className="account-detail"><span>Langue</span><b>{data?.workspace?.default_locale||"—"}</b></div><div className="account-detail"><span>Fuseau horaire</span><b>{data?.workspace?.timezone||"—"}</b></div></section></div>
 </section></main>
}