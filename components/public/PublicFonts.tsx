"use client";
// Charge les polices des pages publiques APRÈS l'affichage (display=swap) :
// le texte s'affiche immédiatement avec une police système, sans attendre Google Fonts.
import {useEffect} from "react";
const HREF="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap";
export default function PublicFonts(){
 useEffect(()=>{
  if(document.getElementById("lp-public-fonts"))return;
  const l=document.createElement("link");l.id="lp-public-fonts";l.rel="stylesheet";l.href=HREF;document.head.appendChild(l);
 },[]);
 return <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>;
}
