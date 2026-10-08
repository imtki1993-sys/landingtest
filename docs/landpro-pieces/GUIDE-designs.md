# Guide: build a LandPro landing-page "design" from a screenshot

Repo: `/home/claude/landingtest` (Next.js; read `AGENTS.md` there: this Next version has breaking changes, but you only write React components and CSS, so you rarely need to care).

The user (French-speaking Moroccan merchant SaaS "LandPro") gave UX-design screenshots and wants each turned into a NEW landing-page template that looks **exactly like the screenshot** ("exact, ne change rien"): same layout, same header / hero / sections / cards / footer structure, same colours, same typography feel, same spacing rhythm, same decorative details. They ALSO want the **product photos in the screenshots generated** — we draw them as SVG illustrations (network to image hosts is blocked) and use them as the template's demo images.

A landing page here sells ONE product with Cash-On-Delivery. So every design must:
- render the merchant's real data (the `VM`, see below) — every text, image and price comes from `vm`, never hard-coded in JSX (fixed UI labels are fine, translated with `tr(vm, "fr", "ar")`);
- keep a **COD order form** (section key `order`, rendered with `OrderBox` from the kit or the generic one) — style it to fit the design;
- buttons like "Shop now / Add to cart / Get started" → `scrollToOrder` / `<Buy>` (go to the form). Variant cards → `setVariant(i)` then `scrollToOrder()`;
- adapt store / agency / gym screenshots to one product: category cards → `benefits` cards, product grids → `variants` (one card per variant/colour) or `showcase` (photos of the product), "services" → `features`, "process" → `how`, testimonials → `reviews` (only real ones; demo has some), client logos / numbers → `stats`, promo banners → `countdown` or `offers`, newsletter band → `final_cta` (NO email collection — make it a CTA to the form, e.g. a fake-input box showing name+price with the button), video tiles → `video`/`showcase`, schedule/pricing tables → `offers` (bundles) etc.
- NEVER use real brand names / logos (Nike, Adidas, Jordan, Supreme, Stüssy, Samsung, Google, Coca-Cola, Red Bull…). Invent neutral fictional brand/product names for the demo product. Client-logo rows → use `stats` or invented wordmarks drawn as plain text.
- No invented social proof in real pages: reviews/stats come from `vm` (the demo product supplies demo ones only for the gallery). Don't hard-code "12,000+ customers", ratings, etc. in JSX; if the screenshot shows such numbers, take them from `vm.stats` (demo product `stats`).

## Files you own (only touch these)
For each design id `<ID>` assigned to you:
- `components/landpro/designs/<ID>/def.ts` — template card + demo product (stub exists, replace it).
- `components/landpro/designs/<ID>/index.tsx` — the React design (stub exists, replace it).
- `components/landpro/designs/<ID>/style.css` — CSS, imported from index.tsx (`import "./style.css";`).
- `public/template-assets/landpro/designs/<ID>/*.svg` — generated images.
- `/tmp/claude-0/lp/art/gen/<id_with_underscores>.py` — your SVG generator script.
Do NOT edit any other file (shared kit, model, registry, other designs, tests). If you truly need a shared change, describe it in your final report instead. Do not run git commands. Do not start/stop the dev server.

## Reference implementation — read it first
`components/landpro/designs/parfum-bordeaux/` (def.ts, index.tsx, style.css) and its art generator `/tmp/claude-0/lp/art/gen/EXAMPLE_parfum_bordeaux.py`. Its screenshot: `/tmp/claude-0/lp/refs/parfum-bordeaux.jpg`. Copy its patterns.

Also read: `components/landpro/designs/types.ts`, `components/landpro/designs/kit.tsx`, `components/landpro/designs/demo-kit.ts`, `components/landpro/model.ts` (the `VM` interface and `buildVM`), `components/landpro/types.ts`, `components/landpro/parts.tsx` (OrderForm, Countdown, OfferPicker, VariantPicker, VideoFrame), `components/landpro/Sections.tsx` (`SectionProps`, generic renderers, `isEmpty`).

## How a design plugs in
`Design` = `{ fonts?, font?, heading?, header?, hero, footer?, sections?: { [sectionKey]: (p: SectionProps) => ReactNode } }`.
- `p` = `{ vm, qty, setQty, variant, setVariant, preview, onSubmit }`.
- Section keys MUST be existing ones (no new keys): `announcement, trust, benefits, problem, features, how, faq, order, showcase, story, before_after, stats, ugc, reviews, comparison, specs, variants, offers, countdown, video, whatsapp, guarantee, final_cta`. The order on the page = `def.sections` (hero is always first; order is forced if missing). Sections without a design renderer use the generic one (avoid that — give every section in your `def.sections` its own renderer).
- An empty section (e.g. no reviews) is skipped automatically before your renderer is called (see `isEmpty`), so renderers may assume data exists for: benefits, features, faq, problem, reviews, stats, ugc, comparison, specs, variants, story, showcase. Others (how, trust, offers, countdown, guarantee, final_cta) always have data.
- Root element of each section: give it `id={sid("<key>")}` (and the order section must have `id="order"` — `OrderBox` does it) so header nav links work.
- `announcement` is rendered above the header.
- `def.titles` sets default section titles (French); merchant edits override them. Use `vm.titles[key]` in JSX for section headings.
- Fonts: `fonts` = Google css2 params string (e.g. `"family=Anton&family=Inter:wght@400;600;800"`), `font`/`heading` = CSS font-family stacks used for `var(--font)` / `var(--heading)`. Arabic (`vm.rtl`) automatically falls back to Cairo. Fonts available locally for screenshots (so prefer them): Inter, Bebas Neue, Cairo, Cormorant Garamond, Playfair Display, Poppins, Space Grotesk, Orbitron, Montserrat, Jost, Marcellus, Oswald, Barlow Condensed, Barlow, DM Serif Display, DM Sans, Manrope, Outfit, Syne, VT323, Fraunces, Italiana, Archivo, Archivo Black, Teko, Bodoni Moda, Josefin Sans, Raleway, Lato, Urbanist, Sora, Unbounded, Silkscreen, Permanent Marker, Caveat, Tenor Sans.

## Key VM fields
`vm.name, headline, highlight (part of headline to emphasise — use <Headline>), subheadline, description, eyebrow, price, oldPrice, currency, images[], imageLabels[], cta, delivery, show{badge,cta,price,subtitle}, benefits[{icon,title,text}], features[...], steps[...] (how), trust[string], faq[{question,answer}], problem{pains,solution}, reviews[{name,city,rating,text}], stats[{value,label}], ugc[{handle,text}], comparison[{label,us,them}], specs[{label,value}], variants[{name,color}], offers[{qty,price,label,badge}], countdownMinutes, videoUrl, whatsapp, story{title,text}, guarantee{title,text}, finalCta{title,text}, announcement, orderTitle, titles{}, order[] (section keys in page order), hidden (Set), lang, rtl, u (UI strings)`.
Kit helpers: `pic(vm,i)`, `<Img vm i className alt/>` (image i rotates if fewer images — real merchants may have 1–5 photos, so the design must still look right with few photos), `<Buy vm className arrow>`, `<Go to="key">`, `goTo`, `navOf(vm,max)`, `<Headline vm as className/>`, `<Stars n/>`, `<Icon name/>` (see ICONS list in kit.tsx: bolt battery chip spring shield grid truck cash swap chat headset leaf drop flask rabbit star heart cart bag search user arrow back up down play check plus close menu sparkle dumbbell flame clock gift globe lock award eye film pen cube target phone mail pin tag box calendar spa moon sun instagram facebook whatsapp), `iconAt(list,i)`, `money(vm,v)`, `discount(vm)`, `tr(vm,fr,ar)`, `announceParts(vm)`, `totalFor(vm,qty)`, `OrderBox`, `scrollToOrder`, `sid`. From `../../parts`: `Countdown`, `OfferPicker`, `VariantPicker`, `VideoFrame`, `OrderForm`.

## Demo product (def.ts)
Use `demoProduct({...})` from `../demo-kit` and `asset(ID, name)` for image paths. Write the demo copy in natural French, matching the screenshot's texts translated/adapted (Morocco, prices in DH, COD). `copy.features`: use `icon: ""` (the design picks its own icons). `benefits` strings `"Titre : texte"`. Provide `variants` when the design shows a product grid, `stats` when it shows numbers, `specs` for spec lists, `bundles` (offers), `imageLabels` when photos have captions (e.g. FRONT/SIDE/REAR/TOP). Arabic: also set `def.lang:"fr"` (all designs are FR; they must still render correctly in AR/RTL with `?l=ar`).
`def.category`: one of `Premium, Beauté, Tech, Mode, Maison, Sport, Conversion` (Sport is new and fine). `def.name`: short French name (2 words). `hero.variant: "design"`. Set `options.announcement` if the design has an announcement bar.
Image index plan: decide which `images[i]` each part uses (hero = 0) and document it in a comment at the top of index.tsx.

## Generating the product images (SVG)
Python toolkit: `/tmp/claude-0/lp/art/svgkit.py` (class `Svg`: bg_linear, glow, bokeh, floor, shadow, vignette, grain, text, perfume, rose, blossom, petal, leaf, stem, lin()/rad() gradients, clip(), add(raw_svg); `preview(paths,out_png)` makes a contact sheet). Extend locally inside your own generator script (write your own drawing functions for sneakers, bikes, jackets, bottles, dumbbells, etc. using paths + gradients). Aim for a convincing studio-product look: layered gradients for volume, highlights, soft shadows, reflections, background scene matching the screenshot mood (colours, lighting, props). People in screenshots: you may draw a stylised silhouette or simply build the scene around the product — focus quality on the PRODUCT. Keep each SVG < 200 KB. Avoid `<text>` relying on web fonts (SVG in <img> can't load them) — small labels with generic families are OK.
Run: `cd /tmp/claude-0/lp/art && python3 gen/<script>.py`, then Read the preview PNG to check the art. Iterate until it looks good.

## Checking your work (mandatory)
A dev server is ALREADY running on port 3210 (shared — never kill or restart it). Demo route: `http://localhost:3210/landing/zz-demo/<ID>` (add `?l=ar` for Arabic).
Screenshot tool: `python3 /tmp/claude-0/lp/shot.py <ID> [--ar] [--w 1440,390] --out /tmp/claude-0/lp/shots/<ID>` → full-page PNGs `<ID>_1440.png`, `<ID>_390.png`, prints horizontal overflow (must be 0) and console errors. Ignore a "tree hydrated but some attributes…" warning and WebSocket warnings (capture artefacts). The first load after an edit may take a while (compilation).
Downscale before viewing (e.g. PIL: crop the full page into ~2300px tall slices and resize to 720 wide; mobile: put the two halves side by side) then Read the PNGs and compare to the reference screenshot side by side, section by section. Iterate on CSS until it truly matches (layout, proportions, colours, font sizes, card shapes, header & footer). Also check: mobile 390px looks deliberate (stacked, no overflow, readable), Arabic `--ar` renders RTL without breaking.
Typecheck: `cd /home/claude/landingtest && npx tsc --noEmit -p . 2>&1 | grep "designs/<ID>"` (only your files matter; other designs may be mid-edit). Format your files: `npx prettier --write components/landpro/designs/<ID>`. Lint: `npx eslint components/landpro/designs/<ID>`.

## CSS rules
- Prefix every class with a short unique prefix for the design (e.g. `nr-`, `vb-`) to avoid collisions; scope template-level variables under `.lpx-tpl-<ID>`.
- Base styles exist on `.lpx h1,h2,h3,p` (margins, font-family var(--heading)); override with `.lpx .xx-title {…}` or more specific selectors when needed.
- Breakpoints: container queries `@container lpx (max-width: 900px) {…}` (and `560px` if needed), NOT @media. Units: px / cqi / %.
- RTL: use logical properties (`inset-inline-start`, `padding-inline-*`, `border-inline-*`, `text-align: start`) and flip directional gradients/arrows with `.lpx[dir="rtl"] …`.
- Theme colours: use `var(--primary)`, `var(--accent)`, `var(--bg)` etc. where the merchant colour choice should apply (main buttons, highlights), fixed colours for decorative parts.
- The generic OrderForm uses classes `lpx-order`, `lpx-field`, `lpx-btn`, `lpx-order-opt`, `lpx-total` — restyle inside your `.xx-order` container so the form matches the design.

## Final report (keep it short)
Per design: what maps to what (screenshot part → section key), image list, any deviations from the screenshot and why, verification results (overflow 0 at 1440/390, AR checked, tsc clean for your files).
