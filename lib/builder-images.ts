export function reorderImage(images:string[],from:number,to:number){if(from<0||to<0||from>=images.length||to>=images.length||from===to)return images;const a=[...images];const x=a.splice(from,1)[0];a.splice(to,0,x);return a}
export function mainImage(images:string[],index:number){return reorderImage(images,index,0)}
