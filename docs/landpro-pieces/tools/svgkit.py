"""Petite boîte à outils pour dessiner les visuels produits en SVG (rendu « photo studio »).

Usage :
    from svgkit import Svg
    s = Svg(1600, 900)
    s.bg_linear(["#f7e4df", "#fbf2ee"], angle=90)
    s.bokeh(seed=1, n=18, colors=["#ffffff", "#f3c6c6"], area=(0, 0, 1600, 900))
    s.shadow(800, 760, 260, 40)
    s.save("/path/hero.svg")

Tout est vectoriel (léger, net à toutes les tailles). Chaque appel ajoute des éléments
dans l'ordre (le premier est au fond). Les dégradés sont créés à la volée.
"""
import math, random, os

def _esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def mix(c1: str, c2: str, t: float) -> str:
    """Mélange deux couleurs #rrggbb (t=0 → c1, t=1 → c2)."""
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(a, b))

def shade(c: str, t: float) -> str:
    """t>0 éclaircit vers le blanc, t<0 assombrit vers le noir."""
    return mix(c, "#ffffff", t) if t >= 0 else mix(c, "#000000", -t)


class Svg:
    def __init__(self, w: int, h: int):
        self.w, self.h = w, h
        self.defs: list[str] = []
        self.body: list[str] = []
        self._n = 0
        # filtres communs
        self.defs.append(
            '<filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>'
            '<filter id="blur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>'
            '<filter id="blur40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>'
            '<filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>'
            '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>'
            '<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .06 0"/></filter>'
        )

    # ─── outils ───
    def uid(self, p="g"):
        self._n += 1
        return f"{p}{self._n}"

    def add(self, el: str):
        self.body.append(el)
        return self

    def lin(self, stops, angle=90, x1=None, y1=None, x2=None, y2=None) -> str:
        """Dégradé linéaire. stops = ["#c1", "#c2"] ou [("#c1", 0, 1), ("#c2", .5, .8) ...] (couleur, offset, opacité).
        angle : 90 = haut→bas, 0 = gauche→droite."""
        i = self.uid("l")
        if x1 is None:
            a = math.radians(angle)
            x1, y1 = 0.5 - math.cos(a) / 2, 0.5 - math.sin(a) / 2
            x2, y2 = 0.5 + math.cos(a) / 2, 0.5 + math.sin(a) / 2
        self.defs.append(f'<linearGradient id="{i}" x1="{x1:.3f}" y1="{y1:.3f}" x2="{x2:.3f}" y2="{y2:.3f}">{self._stops(stops)}</linearGradient>')
        return f"url(#{i})"

    def rad(self, stops, cx=0.5, cy=0.5, r=0.5, fx=None, fy=None) -> str:
        i = self.uid("r")
        f = f' fx="{fx}" fy="{fy}"' if fx is not None else ""
        self.defs.append(f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}"{f}>{self._stops(stops)}</radialGradient>')
        return f"url(#{i})"

    def _stops(self, stops):
        out = []
        n = len(stops)
        for k, s in enumerate(stops):
            if isinstance(s, str):
                c, o, op = s, k / max(1, n - 1), 1
            else:
                c, o, op = (list(s) + [1])[:3]
            out.append(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{op}"/>')
        return "".join(out)

    def clip(self, inner: str) -> str:
        i = self.uid("c")
        self.defs.append(f'<clipPath id="{i}">{inner}</clipPath>')
        return f"url(#{i})"

    # ─── fonds ───
    def bg(self, color):
        return self.add(f'<rect width="{self.w}" height="{self.h}" fill="{color}"/>')

    def bg_linear(self, colors, angle=90):
        return self.bg(self.lin(colors, angle))

    def glow(self, cx, cy, r, color, opacity=0.6):
        """Halo lumineux doux."""
        return self.add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{self.rad([(color, 0, opacity), (color, 1, 0)])}"/>')

    def vignette(self, strength=0.35, color="#000000"):
        return self.add(f'<rect width="{self.w}" height="{self.h}" fill="{self.rad([(color, .55, 0), (color, 1, strength)], r=.75)}"/>')

    def grain(self, opacity=1.0):
        return self.add(f'<rect width="{self.w}" height="{self.h}" filter="url(#grain)" opacity="{opacity}"/>')

    def bokeh(self, seed=1, n=16, colors=("#ffffff",), area=None, rmin=20, rmax=90, op=(0.08, 0.35)):
        rnd = random.Random(seed)
        x0, y0, x1, y1 = area or (0, 0, self.w, self.h)
        for _ in range(n):
            x, y, r = rnd.uniform(x0, x1), rnd.uniform(y0, y1), rnd.uniform(rmin, rmax)
            c = rnd.choice(colors)
            self.add(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{c}" opacity="{rnd.uniform(*op):.2f}" filter="url(#blur8)"/>')
        return self

    def floor(self, y, color, reflect=0.25):
        """Sol / table : aplat + reflet doux."""
        self.add(f'<rect x="0" y="{y}" width="{self.w}" height="{self.h - y}" fill="{color}"/>')
        self.add(f'<rect x="0" y="{y}" width="{self.w}" height="{min(80, self.h - y)}" fill="{self.lin([("#ffffff", 0, reflect), ("#ffffff", 1, 0)], 90)}"/>')
        return self

    def shadow(self, cx, cy, rx, ry, opacity=0.35, color="#000000"):
        return self.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{color}" opacity="{opacity}" filter="url(#blur20)"/>')

    def text(self, x, y, t, size=20, color="#000", family="Georgia, serif", weight=400, anchor="middle", spacing=0, italic=False, opacity=1, rotate=0):
        st = ' font-style="italic"' if italic else ""
        rot = f' transform="rotate({rotate} {x} {y})"' if rotate else ""
        return self.add(
            f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{color}" '
            f'text-anchor="{anchor}" letter-spacing="{spacing}" opacity="{opacity}"{st}{rot}>{_esc(t)}</text>'
        )

    # ─── objets ───
    def perfume(self, cx, base_y, w=220, h=300, liquid="#7a1026", glass_tint=None, cap="gold", cap_style="square",
                label=None, sub=None, label_color="#f3dcc0", body_style="square"):
        """Flacon de parfum (verre épais, liquide, bouchon doré/cristal, étiquette gravée).
        cx = centre, base_y = bas du flacon."""
        x, y = cx - w / 2, base_y - h
        r = 18 if body_style == "square" else w * 0.48
        glass_tint = glass_tint or shade(liquid, 0.55)
        # verre (bord épais)
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{self.lin([shade(glass_tint, .35), glass_tint, shade(glass_tint, -.15)], 0)}" opacity=".95"/>')
        # liquide
        inset = w * 0.07
        self.add(f'<rect x="{x + inset}" y="{y + h * .10}" width="{w - 2 * inset}" height="{h * .84}" rx="{max(6, r - 8)}" '
                 f'fill="{self.lin([shade(liquid, -.25), liquid, shade(liquid, .18), shade(liquid, -.35)], 0)}"/>')
        # reflets
        self.add(f'<rect x="{x + w * .12}" y="{y + h * .14}" width="{w * .07}" height="{h * .72}" rx="8" fill="#ffffff" opacity=".28"/>')
        self.add(f'<rect x="{x + w * .82}" y="{y + h * .14}" width="{w * .03}" height="{h * .72}" rx="4" fill="#ffffff" opacity=".18"/>')
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="2"/>')
        # col + bouchon
        nw = w * .34
        self.add(f'<rect x="{cx - nw / 2}" y="{y - h * .07}" width="{nw}" height="{h * .08}" rx="4" fill="{self.lin(["#7c5a2a", "#e9cf8a", "#a77b36", "#f4e2a6", "#8a6630"], 0)}"/>')
        if cap == "gold":
            capfill = self.lin(["#7a5524", "#d8b56b", "#fbeab0", "#c99a4e", "#6e4b1f"], 0)
        elif cap == "crystal":
            capfill = self.lin([shade(glass_tint, .5), "#ffffff", shade(glass_tint, .2), shade(glass_tint, .6)], 0)
        else:
            capfill = self.lin(["#111", "#4a4a4a", "#181818"], 0)
        cw = w * (.5 if cap_style == "square" else .62)
        ch = h * (.26 if cap_style == "square" else .22)
        cy = y - h * .07 - ch
        if cap_style == "facet":
            pts = f"{cx - cw * .38},{cy} {cx + cw * .38},{cy} {cx + cw / 2},{cy + ch * .35} {cx + cw / 2},{cy + ch} {cx - cw / 2},{cy + ch} {cx - cw / 2},{cy + ch * .35}"
            self.add(f'<polygon points="{pts}" fill="{capfill}" stroke="#ffffff" stroke-opacity=".5"/>')
        else:
            self.add(f'<rect x="{cx - cw / 2}" y="{cy}" width="{cw}" height="{ch}" rx="6" fill="{capfill}"/>')
            self.add(f'<rect x="{cx - cw / 2 + 6}" y="{cy + 6}" width="{cw * .12}" height="{ch - 12}" rx="3" fill="#ffffff" opacity=".35"/>')
        if label:
            self.text(cx, y + h * .42, label, size=w * .16, color=label_color, family="Cormorant Garamond, Georgia, serif", weight=500)
        if sub:
            self.text(cx, y + h * .52, sub, size=w * .055, color=label_color, family="Helvetica, Arial, sans-serif", spacing=2, opacity=.85)
        return self

    def rose(self, cx, cy, r, color="#c4566e", seed=0, open_=1.0):
        """Rose vue de dessus (pétales concentriques)."""
        rnd = random.Random(seed)
        dark, light = shade(color, -.35), shade(color, .35)
        rings = [(1.0, 9), (.78, 8), (.58, 7), (.4, 6), (.24, 5)]
        for k, (f, n) in enumerate(rings):
            rr = r * f * open_
            fill = self.rad([(light, 0, 1), (color, .6, 1), (dark, 1, 1)], fx=.4, fy=.35)
            off = rnd.uniform(0, 1)
            for j in range(n):
                a = (j + off) / n * 2 * math.pi
                px, py = cx + math.cos(a) * rr * .45, cy + math.sin(a) * rr * .45
                self.add(f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{rr * .55:.1f}" ry="{rr * .4:.1f}" transform="rotate({math.degrees(a) + 90:.0f} {px:.1f} {py:.1f})" fill="{fill}" stroke="{dark}" stroke-opacity=".35" stroke-width="1"/>')
        self.add(f'<circle cx="{cx}" cy="{cy}" r="{r * .12}" fill="{dark}"/>')
        return self

    def blossom(self, cx, cy, r, color="#ffffff", center="#e8c35a", petals=5, rot=0, seed=0):
        """Fleur simple (magnolia, fleur de cerisier, frangipanier…)."""
        fill = self.rad([(shade(color, .6), 0, 1), (color, .5, 1), (shade(color, -.18), 1, 1)], cx=.5, cy=.8, r=.9)
        for j in range(petals):
            a = rot + j / petals * 360
            self.add(f'<ellipse cx="{cx}" cy="{cy - r * .5}" rx="{r * .42}" ry="{r * .56}" transform="rotate({a:.0f} {cx} {cy})" fill="{fill}" stroke="{shade(color, -.3)}" stroke-opacity=".25"/>')
        self.add(f'<circle cx="{cx}" cy="{cy}" r="{r * .16}" fill="{center}"/>')
        rnd = random.Random(seed)
        for _ in range(8):
            a = rnd.uniform(0, 2 * math.pi)
            d = rnd.uniform(r * .12, r * .26)
            self.add(f'<circle cx="{cx + math.cos(a) * d:.1f}" cy="{cy + math.sin(a) * d:.1f}" r="{r * .03:.1f}" fill="{shade(center, -.3)}"/>')
        return self

    def petal(self, cx, cy, r, color="#e7a3ae", rot=0):
        fill = self.lin([shade(color, .3), color, shade(color, -.2)], 30)
        return self.add(f'<path d="M{cx},{cy - r} C{cx + r},{cy - r * .6} {cx + r * .8},{cy + r * .7} {cx},{cy + r} C{cx - r * .8},{cy + r * .7} {cx - r},{cy - r * .6} {cx},{cy - r}z" '
                        f'transform="rotate({rot} {cx} {cy})" fill="{fill}" opacity=".95"/>')

    def leaf(self, x, y, length, angle, color="#5f7d3a", width=.35):
        a = math.radians(angle)
        ex, ey = x + math.cos(a) * length, y + math.sin(a) * length
        nx, ny = -math.sin(a) * length * width, math.cos(a) * length * width
        mx, my = (x + ex) / 2, (y + ey) / 2
        fill = self.lin([shade(color, .25), color, shade(color, -.3)], angle + 90)
        self.add(f'<path d="M{x:.1f},{y:.1f} Q{mx + nx:.1f},{my + ny:.1f} {ex:.1f},{ey:.1f} Q{mx - nx:.1f},{my - ny:.1f} {x:.1f},{y:.1f}z" fill="{fill}"/>')
        self.add(f'<path d="M{x:.1f},{y:.1f} L{ex:.1f},{ey:.1f}" stroke="{shade(color, -.4)}" stroke-width="1.2" opacity=".5"/>')
        return self

    def stem(self, x1, y1, x2, y2, color="#4d6b33", width=3, bend=40):
        mx, my = (x1 + x2) / 2 + bend, (y1 + y2) / 2
        return self.add(f'<path d="M{x1},{y1} Q{mx},{my} {x2},{y2}" stroke="{color}" stroke-width="{width}" fill="none" stroke-linecap="round"/>')

    def save(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" height="{self.h}">'
               f'<defs>{"".join(self.defs)}</defs>{"".join(self.body)}</svg>')
        with open(path, "w") as f:
            f.write(svg)
        return path


def preview(paths, out, cols=4, cell=360):
    """Planche de contrôle PNG des SVG (via Chromium/playwright)."""
    import asyncio
    from playwright.async_api import async_playwright
    html = "<html><body style='margin:0;background:#888;display:grid;grid-template-columns:repeat(%d,%dpx);gap:6px'>" % (cols, cell)
    for p in paths:
        html += f"<div style='background:#fff'><img src='file://{p}' style='width:{cell}px;height:{cell}px;object-fit:contain;display:block'><small>{os.path.basename(p)}</small></div>"
    html += "</body></html>"
    tmp = out + ".html"
    open(tmp, "w").write(html)

    async def run():
        async with async_playwright() as pw:
            b = await pw.chromium.launch()
            pg = await b.new_page(viewport={"width": cols * (cell + 6), "height": 400})
            await pg.goto("file://" + tmp)
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=out, full_page=True)
            await b.close()
    asyncio.run(run())
    return out
