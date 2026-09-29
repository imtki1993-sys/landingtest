import {storeBuilderDefaults} from "./store-builder-config";

export type StoreSettings=typeof storeBuilderDefaults&Record<string,any>;

export function normalizeStoreSettings(input:any):StoreSettings{
 const raw=input&&typeof input==="object"?input:{};
 return {
  ...storeBuilderDefaults,
  ...raw,
  selectedProductIds:Array.isArray(raw.selectedProductIds)?raw.selectedProductIds:[],
  heroImages:Array.isArray(raw.heroImages)?raw.heroImages.filter(Boolean):[],
  sectionOrder:Array.isArray(raw.sectionOrder)?raw.sectionOrder:storeBuilderDefaults.sectionOrder,
  pageSections:raw.pageSections&&typeof raw.pageSections==="object"?raw.pageSections:{}
 } as StoreSettings;
}
