"""Capture d'un template LandPro de démo avec les vraies polices.
usage: python3 shot.py <id> [<id>...] [--ar] [--w 1440,390] [--full] [--out DIR]
Écrit <out>/<id>[_ar]_<w>.png et affiche le débordement horizontal + erreurs."""
import asyncio, sys, os, re, glob, urllib.parse
from playwright.async_api import async_playwright
FS="/tmp/claude-0/fonts/node_modules/@fontsource/"
def css_for(url):
    q=urllib.parse.urlparse(url).query
    out=[]
    for fam in urllib.parse.parse_qs(q).get("family",[]):
        name=fam.split(":")[0].replace("+"," ")
        d=FS+name.lower().replace(" ","-")+"/files/"
        if not os.path.isdir(d): continue
        for f in glob.glob(d+"*-latin-*-*.woff2"):
            m=re.search(r"-latin-(\d+|wght)-(normal|italic)\.woff2$",f)
            if not m or m.group(1)=="wght": continue
            out.append(f"@font-face{{font-family:'{name}';font-style:{m.group(2)};font-weight:{m.group(1)};font-display:block;src:url(https://fonts.local/{os.path.relpath(f,FS)}) format('woff2')}}")
    return "\n".join(out)
async def main():
    a=sys.argv[1:]; ar="--ar" in a; full="--full" in a
    ws=[1440,390]; out="/tmp/claude-0/lp/shots"
    if "--w" in a: ws=[int(x) for x in a[a.index("--w")+1].split(",")]
    if "--out" in a: out=a[a.index("--out")+1]
    ids=[x for i,x in enumerate(a) if not x.startswith("--") and (i==0 or a[i-1] not in ("--w","--out"))]
    os.makedirs(out,exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for t in ids:
            for w in ws:
                ctx=await b.new_context(viewport={"width":w,"height":900})
                async def gcss(route): await route.fulfill(status=200,content_type="text/css",body=css_for(route.request.url))
                async def gfile(route):
                    path=FS+urllib.parse.urlparse(route.request.url).path.lstrip("/")
                    await route.fulfill(status=200,content_type="font/woff2",body=open(path,"rb").read()) if os.path.exists(path) else await route.abort()
                await ctx.route("**/fonts.googleapis.com/**",gcss)
                await ctx.route("https://fonts.local/**",gfile)
                pg=await ctx.new_page(); errs=[]
                pg.on("pageerror",lambda e: errs.append(str(e)[:300]))
                pg.on("console",lambda m: errs.append(m.text[:1800]) if m.type=="error" and "Failed to load resource" not in m.text else None)
                await pg.goto(f"http://localhost:3210/landing/zz-demo/{t}?l="+("ar" if ar else "fr")+("&real=1" if "--real" in a else ""),wait_until="load",timeout=180000)
                ov=None
                for _ in range(4):
                    await pg.wait_for_timeout(2200)
                    try:
                        ov=await pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth"); break
                    except Exception: pass
                for _ in range(3):
                    try:
                        await pg.wait_for_selector(".lpx", timeout=60000)
                        await pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
                        await pg.evaluate("""async()=>{const H=()=>document.documentElement.scrollHeight;for(let y=0;y<H();y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0);}""")
                        break
                    except Exception:
                        await pg.wait_for_timeout(2000)
                await pg.wait_for_timeout(800)
                fn=f"{out}/{t}{'_ar' if ar else ''}{'_real' if '--real' in a else ''}_{w}.png"
                await pg.screenshot(path=fn,full_page=True)
                print(t,w,"overflow",ov,errs[:3],flush=True)
                await ctx.close()
        await b.close()
asyncio.run(main())
