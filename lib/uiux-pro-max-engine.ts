import "server-only";
import fs from "node:fs";import path from "node:path";

type Row=Record<string,string>;
const ROOT=path.join(process.cwd(),"vendor","ui-ux-pro-max","data");
function csv(name:string):Row[]{const s=fs.readFileSync(path.join(ROOT,name),"utf8");const rows:string[][]=[];let row:string[]=[],cell="",q=false;for(let i=0;i<s.length;i++){const ch=s[i];if(ch==='"'){if(q&&s[i+1]==='"'){cell+='"';i++}else q=!q}else if(ch===","&&!q){row.push(cell);cell=""}else if((ch==="\n"||ch==="\r")&&!q){if(ch==="\r"&&s[i+1]==="\n")i++;row.push(cell);cell="";if(row.some(Boolean))rows.push(row);row=[]}else cell+=ch}if(cell||row.length){row.push(cell);rows.push(row)}const h=rows.shift()||[];return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k.trim(),(r[i]||"").trim()])))}
const norm=(v:string)=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const toks=(v:string)=>new Set(norm(v).split(/\s+/).filter(x=>x.length>1));
function score(query:string,text:string){const q=toks(query),t=toks(text);let n=0;q.forEach(x=>{if(t.has(x))n+=3;else if(norm(text).includes(x))n+=1});return n}
function best(rows:Row[],query:string,fields:string[]){return rows.map(r=>({r,s:score(query,fields.map(f=>r[f]||"").join(" "))})).sort((a,b)=>b.s-a.s)[0]?.r||rows[0]}
function exact(rows:Row[],field:string,value:string){const n=norm(value);return rows.find(r=>norm(r[field]||"")===n)}
function splitStyles(v:string){return v.split(/[+,]/).map(x=>x.trim()).filter(Boolean)}
export type UiUxDesignSystem={source:string;version:string;productType:string;reasoning:Row;landing:Row;style:Row;secondaryStyles:Row[];palette:Row;typography:Row;uxRules:Row[];tokens:{colors:Record<string,string>;fonts:{heading:string;body:string};radius:string;effects:string;pattern:string;sectionOrder:string[]};antiPatterns:string[]};
export function generateUiUxProMaxDesignSystem(input:{name:string;description?:string;characteristics?:string;language?:string}):UiUxDesignSystem{
 const query=[input.name,input.description,input.characteristics].filter(Boolean).join(" ");
 const products=csv("products.csv"),reasonings=csv("ui-reasoning.csv"),landings=csv("landing.csv"),styles=csv("styles.csv"),colors=csv("colors.csv"),typography=csv("typography.csv"),ux=csv("ux-guidelines.csv");
 const product=best(products,query,["Product Type","Keywords","Key Considerations"]);
 const productType=product["Product Type"];const reasoning=exact(reasonings,"UI_Category",productType)||best(reasonings,productType,["UI_Category"]);
 const pattern=reasoning["Recommended_Pattern"]||product["Landing Page Pattern"];const landing=exact(landings,"Pattern Name",pattern)||best(landings,pattern,["Pattern Name","Keywords","Aliases"]);
 const wanted=splitStyles(reasoning["Style_Priority"]||product["Primary Style Recommendation"]);const style=exact(styles,"Style Category",wanted[0])||best(styles,wanted[0]||query,["Style Category","Keywords","Best For","Aliases"]);
 const secondaryStyles=wanted.slice(1,3).map(x=>exact(styles,"Style Category",x)||best(styles,x,["Style Category","Keywords"])).filter(Boolean) as Row[];
 const palette=exact(colors,"Product Type",productType)||best(colors,productType,["Product Type","Notes"]);
 const typoQuery=[reasoning["Typography_Mood"],productType,query].join(" ");const typography=best(typography,typoQuery,["Font Pairing Name","Mood/Style Keywords","Best For"]);
 const uxRules=ux.map(r=>({r,s:score([pattern,style["Style Category"],productType,"web navigation form accessibility mobile conversion"].join(" "),[r.Category,r.Issue,r.Platform,r.Description,r.Do,r.Severity].join(" "))+(r.Severity==="High"?4:r.Severity==="Medium"?2:0)})).sort((a,b)=>b.s-a.s).slice(0,16).map(x=>x.r);
 const order=(landing["Section Order"]||"Hero > Features > CTA > Footer").split(">").map(x=>norm(x).replace(/\s+/g,"-")).filter(Boolean);
 const vars=style["Design System Variables"]||"";const radius=(vars.match(/border-radius:\s*([^,]+)/i)?.[1]||"12px").trim();
 return {source:"nextlevelbuilder/ui-ux-pro-max-skill",version:"2.13.0-vendored",productType,reasoning,landing,style,secondaryStyles,palette,typography,uxRules,tokens:{colors:{primary:palette.Primary,secondary:palette.Secondary,accent:palette.Accent,background:palette.Background,foreground:palette.Foreground,card:palette.Card,border:palette.Border,muted:palette.Muted},fonts:{heading:typography["Heading Font"]||"Inter",body:typography["Body Font"]||"Inter"},radius,effects:reasoning["Key_Effects"]||style["Effects & Animation"]||"",pattern:landing["Pattern ID"]||norm(pattern).replace(/\s+/g,"-"),sectionOrder:order},antiPatterns:(reasoning["Anti_Patterns"]||"").split("+").map(x=>x.trim()).filter(Boolean)};
}
