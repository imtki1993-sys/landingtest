import {NextRequest,NextResponse} from "next/server";
const PUBLIC_GET=["/login","/signup","/api/domain-resolve","/api/landing/","/landing/","/_next/","/favicon.ico"];
function isPublic(req:NextRequest){const p=req.nextUrl.pathname;if(PUBLIC_GET.some(x=>p===x||p.startsWith(x)))return true;if(p==="/api/orders"&&req.method==="POST")return true;if(p==="/api/track"&&req.method==="POST")return true;if(p==="/api/auth/login"||p==="/api/auth/signup"||p==="/api/auth/logout")return true;return false}
async function valid(token:string|undefined){if(!token)return false;const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SECRET_KEY;if(!u||!k)return false;try{const r=await fetch(u+"/auth/v1/user",{headers:{apikey:k,Authorization:"Bearer "+token},cache:"no-store"});return r.ok}catch{return false}}
async function refresh(req:NextRequest){const rt=req.cookies.get("lm_refresh")?.value,u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.SUPABASE_SECRET_KEY;if(!rt||!u||!k)return null;try{const r=await fetch(u+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:k,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:rt}),cache:"no-store"});if(!r.ok)return null;return await r.json()}catch{return null}}
export async function middleware(req:NextRequest){const host=(req.headers.get("host")||"").split(":")[0].toLowerCase(),path=req.nextUrl.pathname;
if(path.startsWith("/_next/")||path.includes("."))return NextResponse.next();
const own=[process.env.VERCEL_PROJECT_PRODUCTION_URL,"landpro.online","www.landpro.online","localhost"].filter(Boolean).map(x=>String(x).replace(/^https?:\/\//,""));
const adminHost=own.includes(host)||host.endsWith(".vercel.app");
if(!adminHost){try{const r=await fetch(req.nextUrl.origin+"/api/domain-resolve?hostname="+encodeURIComponent(host),{headers:{"x-domain-resolve":"1"},cache:"no-store"}),x=await r.json();if(x.slug){const url=req.nextUrl.clone();url.pathname="/landing/"+x.slug;return NextResponse.rewrite(url)}}catch{}}
if(isPublic(req))return NextResponse.next();
if(await valid(req.cookies.get("lm_access")?.value))return NextResponse.next();
const session=await refresh(req);if(session?.access_token){const res=NextResponse.next();res.cookies.set("lm_access",session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:session.expires_in||3600});if(session.refresh_token)res.cookies.set("lm_refresh",session.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*24*30});return res}
if(path.startsWith("/api/"))return NextResponse.json({error:"Non autorisé"},{status:401});
const url=req.nextUrl.clone();url.pathname="/login";url.searchParams.set("next",path);return NextResponse.redirect(url)}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};