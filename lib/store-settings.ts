import {storeBuilderDefaults} from "./store-builder-config";
import {createStoreProV2Config,STORE_PRO_V2_VERSION} from "./store-pro-v2";

export type StoreSettings=typeof storeBuilderDefaults&Record<string,any>;

export function normalizeStoreSettings(input:any):StoreSettings{
 const raw=input&&typeof input==="object"?input:{};const generatorVersion=raw.generatorVersion||"classic";
 return {
  ...storeBuilderDefaults,
  ...raw,
  generatorVersion,
  proV2:generatorVersion===STORE_PRO_V2_VERSION?(raw.proV2&&typeof raw.proV2==="object"?raw.proV2:createStoreProV2Config(raw.proPreset||"modern-glow")):raw.proV2,
  selectedProductIds:Array.isArray(raw.selectedProductIds)?raw.selectedProductIds:[],
  heroImages:Array.isArray(raw.heroImages)?raw.heroImages.filter(Boolean):[],
  sectionOrder:Array.isArray(raw.sectionOrder)?raw.sectionOrder:storeBuilderDefaults.sectionOrder,
  pageSections:raw.pageSections&&typeof raw.pageSections==="object"?raw.pageSections:{}
 } as StoreSettings;
}
