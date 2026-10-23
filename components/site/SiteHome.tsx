// Site de présentation de LandPro (direction « Majorelle »), en français ou en darija.
// Composant serveur ; les mouvements (Lenis, GSAP, React Bits) sont dans ./motion.
import DocumentLang from "../public/DocumentLang";
import { SITE, type SiteLang } from "./content";
import SiteVideo from "./SiteVideo";
import { Count, HeroRays, HeroTitle, PrimaryCta, SiteMotion } from "./motion";
import "./site.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Noto+Kufi+Arabic:wght@500;700;800&display=swap";

/** Lien WhatsApp vers l'équipe commerciale (LANDPRO_SALES_WHATSAPP), sinon l'inscription. */
function salesLink(phone: string, text: string) {
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : "/signup";
}

export default function SiteHome({ lang, salesPhone }: { lang: SiteLang; salesPhone: string }) {
  const t = SITE[lang];
  const ar = lang === "ar";
  const external = !!salesPhone;
  return (
    <div className={"mj" + (ar ? " mj-ar" : "")} dir={ar ? "rtl" : "ltr"} lang={lang}>
      <DocumentLang locale={ar ? "ar-MA" : "fr"} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <SiteMotion />

      <section id="top" className="mj-hero">
        <HeroRays />
        <header className="mj-wrap mj-header">
          <a href={ar ? "/ar" : "/"} className="mj-logo">
            landpro
          </a>
          <nav aria-label={ar ? "القائمة الرئيسية" : "Navigation principale"} className="mj-nav">
            <a href="#nouveau">{t.nav.nouveau}</a>
            <a href="#templates">{t.nav.templates}</a>
            <a href="#boutique">{t.nav.boutique}</a>
            <a href="#trajet">{t.nav.trajet}</a>
            <a href="#fonctions">{t.nav.fonctions}</a>
            <a href="#tarifs">{t.nav.tarifs}</a>
          </nav>
          <div className="mj-header-actions">
            <a href={t.otherLang.href} lang={t.otherLang.lang} className="mj-lang">
              {t.otherLang.label}
            </a>
            <a href="/login" className="mj-login">
              {t.login}
            </a>
            <a href="/signup" className="mj-btn mj-btn-saffron">
              {t.activate}
            </a>
          </div>
        </header>

        <div className="mj-wrap mj-hero-grid">
          <div className="mj-hero-copy">
            <HeroTitle lines={t.hero.title} />
            <p className="mj-hero-text">{t.hero.text}</p>
            <div className="mj-hero-actions">
              <PrimaryCta href="#tarifs" className="mj-btn mj-btn-saffron mj-btn-lg">
                {t.hero.cta}
              </PrimaryCta>
              <a href="#trajet" className="mj-link-light">
                {t.hero.secondary}
              </a>
            </div>
          </div>

          <div className="mj-hero-art" aria-hidden={false}>
            <div className="mj-phone mj-phone-a">
              <img src="/site/tpl-sneaker-pop.webp" alt={t.hero.phoneA} width={390} height={844} />
            </div>
            <div className="mj-phone mj-phone-b">
              <img src="/site/tpl-abaya-story-ar.webp" alt={t.hero.phoneB} width={390} height={844} />
            </div>
            <div className="mj-slip">
              <div className="mj-slip-title">{t.hero.slip.title}</div>
              <div className="mj-slip-ref">{t.hero.slip.ref}</div>
              <div className="mj-slip-lines">
                {t.hero.slip.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
                <b>{t.hero.slip.total}</b>
              </div>
              <div className="mj-stamp">{t.hero.slip.stamp}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="video" className="mj-videosec">
        <div className="mj-wrap">
          <div className="mj-video-head" data-reveal>
            <h2 className="mj-h2">{t.video.title}</h2>
            <p className="mj-on-ink">{t.video.text}</p>
          </div>
          <div className="mj-video-frame" data-reveal>
            <SiteVideo
              base={`/site/landpro-${lang}`}
              poster={`/site/landpro-${lang}-poster.webp`}
              label={t.video.label}
            />
          </div>
        </div>
      </section>

      <section id="nouveau" className="mj-nouveau" aria-labelledby="mj-nouveau-title">
        <div className="mj-wrap">
          <div className="mj-split-head" data-reveal>
            <h2 id="mj-nouveau-title" className="mj-h2">
              {t.nouveau.title}
            </h2>
            <p className="mj-muted">{t.nouveau.text}</p>
          </div>
          {t.nouveau.items.map((f, i) => (
            <article key={f.id} id={f.id} className={"mj-feature" + (i % 2 ? " is-flip" : "")}>
              <div className="mj-feature-copy" data-reveal>
                <p className="mj-feature-name">
                  <span className="mj-new-badge">{t.nouveau.badge}</span>
                  {f.name}
                </p>
                <h3 className="mj-feature-title">{f.title}</h3>
                <p className="mj-muted">{f.text}</p>
                <dl className="mj-points mj-points-ink">
                  {f.points.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="mj-shot" data-reveal>
                <img src={`/site/${f.shot}.webp`} alt={f.alt} width={2880} height={f.height} loading="lazy" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="templates" className="mj-templates">
        <div className="mj-wrap mj-split-head" data-reveal>
          <h2 className="mj-h2">{t.templates.title}</h2>
          <p className="mj-muted">{t.templates.text}</p>
        </div>
        <div className="mj-strip" data-reveal>
          {t.templates.items.map(([file, name, price], i) => (
            <figure key={file} className={"mj-tpl" + (i % 2 ? " mj-tpl-low" : "")}>
              <img src={`/site/${file}.webp`} alt={name} width={390} height={844} loading="lazy" />
              <figcaption>
                {name}
                <span>{price}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="boutique" className="mj-boutique">
        <div className="mj-wrap mj-boutique-grid">
          <div className="mj-boutique-copy" data-reveal>
            <h2 className="mj-h2">{t.boutique.title}</h2>
            <p className="mj-on-ink">{t.boutique.text}</p>
            <dl className="mj-points">
              {t.boutique.points.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mj-browsers" data-reveal>
            <figure className="mj-browser mj-browser-a">
              <div className="mj-browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span dir="ltr">{t.boutique.url}</span>
              </div>
              <img src="/site/store-fr.webp" alt={t.boutique.shotFr} width={1920} height={1200} loading="lazy" />
            </figure>
            <figure className="mj-browser mj-browser-b">
              <div className="mj-browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span dir="ltr">{t.boutique.url}</span>
              </div>
              <img src="/site/store-ar.webp" alt={t.boutique.shotAr} width={1920} height={1200} loading="lazy" />
            </figure>
          </div>
        </div>
      </section>

      <section id="trajet" className="mj-trajet">
        <div className="mj-wrap">
          <h2 className="mj-h2 mj-h2-narrow" data-reveal>
            {t.trajet.title}
          </h2>
          <p className="mj-muted mj-lead" data-reveal>
            {t.trajet.text}
          </p>
          <ol className="mj-route" data-reveal>
            {t.trajet.steps.map(([name, text], i) => (
              <li key={name} className={i === t.trajet.steps.length - 1 ? "is-done" : ""}>
                <b>{name}</b>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <div className="mj-shot mj-shot-bleed" data-reveal>
            <img src="/site/dash-commandes.webp" alt={t.trajet.shot} width={2880} height={1620} loading="lazy" />
          </div>
        </div>
      </section>

      <section id="equipe" className="mj-wrap mj-equipe">
        <div className="mj-equipe-copy" data-reveal>
          <h2 className="mj-h2">{t.equipe.title}</h2>
          <p className="mj-muted">{t.equipe.p1}</p>
          <p className="mj-muted">{t.equipe.p2}</p>
        </div>
        <div className="mj-shot" data-reveal>
          <img src="/site/dash-equipe.webp" alt={t.equipe.shot} width={2880} height={1560} loading="lazy" />
        </div>
      </section>

      <section id="fonctions" className="mj-wrap mj-fonctions">
        <div className="mj-split-head" data-reveal>
          <h2 className="mj-h2">{t.fonctions.title}</h2>
          <p className="mj-muted">{t.fonctions.text}</p>
        </div>
        <div className="mj-groups" data-reveal>
          {t.fonctions.groups.map((g) => (
            <section key={g.name} className="mj-group" aria-label={g.name}>
              <h3>{g.name}</h3>
              <dl>
                {g.items.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>

      <section id="tarifs" className="mj-tarifs">
        <div className="mj-wrap">
          <div className="mj-split-head" data-reveal>
            <h2 className="mj-h2">{t.tarifs.title}</h2>
            <p className="mj-on-blue">{t.tarifs.text}</p>
          </div>
          <div className="mj-tickets" data-reveal>
            {t.tarifs.plans.map((p) => (
              <article key={p.months} className={"mj-ticket" + (p.months === 12 ? " is-best" : "")}>
                <div className="mj-ticket-label">{p.label}</div>
                <div className="mj-price">
                  <Count value={Number(p.price.replace(/\D/g, ""))} separator={p.price.includes(" ") ? " " : ""} />
                  <span className="mj-cur"> {t.tarifs.currency}</span>
                </div>
                <div className="mj-ticket-sub">{p.perMonth}</div>
                <a
                  href={salesLink(salesPhone, t.tarifs.whatsapp(p.months))}
                  {...(external ? { target: "_blank", rel: "noopener" } : {})}
                  className={"mj-btn " + (p.months === 12 ? "mj-btn-ink" : "mj-btn-outline")}
                >
                  {p.cta}
                </a>
              </article>
            ))}
          </div>
          <p className="mj-on-blue mj-included" data-reveal>
            {t.tarifs.included}
          </p>
        </div>
      </section>

      <section id="faq" className="mj-wrap mj-faq">
        <h2 className="mj-h2 mj-faq-title" data-reveal>
          {t.faq.title}
        </h2>
        <div className="mj-faq-list" data-reveal>
          {t.faq.items.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mj-final">
        <div className="mj-wrap mj-final-row" data-reveal>
          <div>
            <p lang="ar" className="mj-final-ar">
              {t.final.arabic}
            </p>
            <p className="mj-final-title">{t.final.title}</p>
          </div>
          <div className="mj-final-actions">
            <a href="/signup" className="mj-btn mj-btn-ink mj-btn-lg">
              {t.activate}
            </a>
            <a
              href={salesLink(salesPhone, t.final.whatsappText)}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
              className="mj-btn mj-btn-outline mj-btn-lg"
            >
              {t.final.whatsapp}
            </a>
          </div>
        </div>
      </section>

      <footer className="mj-footer">
        <div className="mj-wrap mj-footer-row">
          <div>
            <div className="mj-logo">landpro</div>
            <p>{t.footer.text}</p>
          </div>
          <nav aria-label={ar ? "روابط أسفل الصفحة" : "Pied de page"} className="mj-footer-nav">
            <a href="#nouveau">{t.nav.nouveau}</a>
            <a href="#templates">{t.nav.templates}</a>
            <a href="#boutique">{t.nav.boutique}</a>
            <a href="#fonctions">{t.nav.fonctions}</a>
            <a href="#tarifs">{t.nav.tarifs}</a>
            <a href="/login">{t.login}</a>
            <a href={t.otherLang.href} lang={t.otherLang.lang}>
              {t.otherLang.label}
            </a>
          </nav>
        </div>
        <div className="mj-wrap mj-footer-legal">© {new Date().getFullYear()} LandPro</div>
      </footer>
    </div>
  );
}
