export type StoreBlock={id:string;type:string;visible?:boolean;[key:string]:any};

export function createStoreBlock(type:string,storeName="Ma boutique"):StoreBlock{
 const base:StoreBlock={id:"b_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),type,visible:true,title:"",text:"",image:"",images:[],button:"",url:""};
 if(type==="text"){base.title="Nouveau titre";base.text="Ajoute ton texte ici."}
 if(type==="imageText"){base.title="Titre de la section";base.text="Présente ton produit, ta marque ou ton avantage."}
 if(type==="hero"){base.title=storeName;base.text="Une section forte pour attirer l’attention.";base.button="Découvrir"}
 if(type==="cta"){base.title="Prêt à commander ?";base.button="Commander maintenant"}
 if(type==="whatsapp"){base.title="Besoin d’aide ?";base.button="WhatsApp"}
 if(type==="benefits"){base.title="Pourquoi nous choisir ?";base.items=["Livraison au Maroc","Paiement à la livraison","Service client"];base.variant="cards"}
 if(type==="products"){base.title="Nos produits";base.variant="grid"}
 if(type==="reviews"){base.title="Avis de nos clients";base.items=["Très bon produit","Livraison rapide","Service professionnel"];base.variant="cards"}
 if(type==="contactForm"){base.title="Envoyez-nous un message";base.text="Notre équipe vous répondra rapidement.";base.button="Envoyer le message";base.showName=true;base.showEmail=true;base.showPhone=true;base.showSubject=true;base.showMessage=true;base.requiredEmail=false;base.requiredPhone=false;base.variant="card"}
 return base;
}

export function getHomeItems(settings:any){
 const native=(settings.sectionOrder||["hero","products","trust","faq","footer"]).filter((x:string)=>x!=="footer").map((id:string)=>({id:"native:"+id,native:true,type:id}));
 const custom=Array.isArray(settings.pageSections?.home)?settings.pageSections.home:[];
 const all=[...native,...custom];
 if(!Array.isArray(settings.homeLayoutOrder))return all;
 return settings.homeLayoutOrder.map((id:string)=>all.find((x:any)=>x.id===id)).filter(Boolean);
}

export function moveItem<T extends {id:string}>(items:T[],from:string,to:string):T[]{
 if(from===to)return items;
 const next=[...items],i=next.findIndex(x=>x.id===from),j=next.findIndex(x=>x.id===to);
 if(i<0||j<0)return items;
 const [item]=next.splice(i,1);next.splice(j,0,item);return next;
}

export function moveItemBy<T>(items:T[],index:number,dir:number):T[]{
 const next=[...items],target=index+dir;
 if(index<0||target<0||target>=next.length)return items;
 [next[index],next[target]]=[next[target],next[index]];return next;
}

export function duplicateStoreBlock(block:StoreBlock):StoreBlock{
 return {...block,id:"b_"+Date.now()+"_"+Math.random().toString(36).slice(2,7)};
}

export function removeCustomSection(settings:any,page:string,id:string){
 const blocks=Array.isArray(settings.pageSections?.[page])?settings.pageSections[page].filter((b:any)=>b.id!==id):[];
 return {...settings,pageSections:{...(settings.pageSections||{}),[page]:blocks},homeLayoutOrder:Array.isArray(settings.homeLayoutOrder)?settings.homeLayoutOrder.filter((x:string)=>x!==id):settings.homeLayoutOrder};
}

export function hideHomeNativeSection(settings:any,type:string){
 const nativeId="native:"+type;
 const next={...settings,sectionOrder:(settings.sectionOrder||[]).filter((x:string)=>x!==type),homeLayoutOrder:Array.isArray(settings.homeLayoutOrder)?settings.homeLayoutOrder.filter((x:string)=>x!==nativeId):settings.homeLayoutOrder};
 if(type==="products")next.showProducts=false;
 if(type==="trust")next.showTrust=false;
 if(type==="faq")next.showFaq=false;
 return next;
}
