function rgb(hex:string){const h=hex.replace("#","");const v=h.length===3?h.split("").map(x=>x+x).join(""):h;return[0,2,4].map(i=>parseInt(v.slice(i,i+2),16)/255)}
function luminance(hex:string){const c=rgb(hex).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]}
export function contrastRatio(a:string,b:string){const[x,y]=[luminance(a),luminance(b)].sort((m,n)=>n-m);return Number(((x+.05)/(y+.05)).toFixed(2))}
export function bestText(background:string){return contrastRatio(background,"#ffffff")>=contrastRatio(background,"#111827")?"#ffffff":"#111827"}
