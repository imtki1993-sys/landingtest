export function reorderImage(images:string[],from:number,to:number){if(from<0||to<0||from>=images.length||to>=images.length||from===to)return images;const a=[...images];const x=a.splice(from,1)[0];a.splice(to,0,x);return a}
export function mainImage(images:string[],index:number){return reorderImage(images,index,0)}

export async function uploadImages(files:File[],limit:number){const selected=files.slice(0,Math.max(0,limit));if(!selected.length)return[];const fd=new FormData();selected.forEach(file=>fd.append("images",file));const r=await fetch("/api/upload",{method:"POST",body:fd}),x=await r.json();if(!r.ok)throw new Error(x.error||"Upload impossible");return Array.isArray(x.urls)?x.urls:[]}
export function replaceImageAt(images:string[],index:number,url:string){return images.map((value,i)=>i===index?url:value)}
