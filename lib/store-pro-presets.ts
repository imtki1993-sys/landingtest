import {MODERN_GLOW_PRESET,StoreProConfig} from "./store-pro-v2";
export type StoreProPresetMeta={id:string;name:string;description:string;available:boolean;config:StoreProConfig};
export const STORE_PRO_PRESETS:StoreProPresetMeta[]=[{id:"modern-glow",name:"Modern Glow Commerce",description:"Store premium moderne avec halos, grandes cartes, offres interactives et forte hiérarchie produit.",available:true,config:MODERN_GLOW_PRESET}];
export function getStoreProPreset(id:string){return STORE_PRO_PRESETS.find(x=>x.id===id)||STORE_PRO_PRESETS[0]}
