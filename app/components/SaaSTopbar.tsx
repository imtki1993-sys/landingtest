"use client";
import {useEffect,useState} from "react";
export default function SaaSTopbar(){
 const [theme,setTheme]=useState<"light"|"dark">("light");
 useEffect(()=>{const saved=localStorage.getItem("landpro-theme");const next=saved==="dark"?"dark":"light";setTheme(next);document.documentElement.dataset.theme=next},[]);
 function toggleTheme(){const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;localStorage.setItem("landpro-theme",next)}
 return <div className="saas-topbar"><div className="saas-global-search"><span>⌕</span><input aria-label="Recherche globale" placeholder="Rechercher..."/></div><div className="saas-topbar-actions"><button type="button" className="saas-theme-toggle" onClick={toggleTheme} aria-label={theme==="dark"?"Activer le mode clair":"Activer le mode sombre"} title={theme==="dark"?"Mode clair":"Mode sombre"}><span className="theme-sun">☀</span><i></i><span className="theme-moon">☾</span></button><button type="button" className="saas-notification" aria-label="Notifications">♢<i></i></button><div className="saas-user"><div className="avatar">M</div><div><b>Mohamed</b><small>Pro Plan</small></div><span>⌄</span></div></div></div>
}