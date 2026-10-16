// Site de présentation de LandPro (direction « Majorelle »), en français ou en darija.
// Composant serveur sans JavaScript côté navigateur : la FAQ utilise <details>.
import DocumentLang from "../public/DocumentLang";
import { SITE, type SiteLang } from "./content";
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

      <section id="top" className="mj-hero">
        <header className="mj-wrap mj-header">
          <a href={ar ? "/ar" : "/"} className="mj-logo">
            landpro
          </a>
          <nav aria-label={ar ? "القائمة الرئيسية" : "Navigation principale"} className="mj-nav">
            <a href="#templates">{t.nav.templates}</a>
            <a href="#trajet">{t.nav.trajet}</a>
            <a href="#equipe">{t.nav.equipe}</a>
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
            <h1 className="mj-h1">
              {t.hero.title.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </h1>
            <p className="mj-hero-text">{t.hero.text}</p>
            <div className="mj-hero-actions">
              <a href="#tarifs" className="mj-btn mj-btn-saffron mj-btn-lg">
                {t.hero.cta}
              </a>
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

      <section id="templates" className="mj-templates">
        <div className="mj-wrap mj-split-head">
          <h2 className="mj-h2">{t.templates.title}</h2>
          <p className="mj-muted">{t.templates.text}</p>
        </div>
        <div className="mj-strip">
          {t.templates.items.map(([file, name], i) => (
            <figure key={file} className={"mj-tpl" + (i % 2 ? " mj-tpl-low" : "")}>
              <img src={`/site/${file}.webp`} alt={name} width={390} height={844} loading="lazy" />
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mj-wrap">
          <a href="/template-showcase" className="mj-link">
            {t.templates.link}
          </a>
        </div>
      </section>

      <section id="trajet" className="mj-trajet">
        <div className="mj-wrap">
          <h2 className="mj-h2 mj-h2-narrow">{t.trajet.title}</h2>
          <p className="mj-muted mj-lead">{t.trajet.text}</p>
          <ol className="mj-route">
            {t.trajet.steps.map(([name, text], i) => (
              <li key={name} className={i === t.trajet.steps.length - 1 ? "is-done" : ""}>
                <b>{name}</b>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <div className="mj-shot mj-shot-bleed">
            <img src="/site/dash-commandes.webp" alt={t.trajet.shot} width={2880} height={1620} loading="lazy" />
          </div>
        </div>
      </section>

      <section id="equipe" className="mj-wrap mj-equipe">
        <div className="mj-equipe-copy">
          <h2 className="mj-h2">{t.equipe.title}</h2>
          <p className="mj-muted">{t.equipe.p1}</p>
          <p className="mj-muted">{t.equipe.p2}</p>
        </div>
        <div className="mj-shot">
          <img src="/site/dash-equipe.webp" alt={t.equipe.shot} width={2880} height={1560} loading="lazy" />
        </div>
      </section>

      <section id="tarifs" className="mj-tarifs">
        <div className="mj-wrap">
          <div className="mj-split-head">
            <h2 className="mj-h2">{t.tarifs.title}</h2>
            <p className="mj-on-blue">{t.tarifs.text}</p>
          </div>
          <div className="mj-tickets">
            {t.tarifs.plans.map((p) => (
              <article key={p.months} className={"mj-ticket" + (p.months === 12 ? " is-best" : "")}>
                <div className="mj-ticket-label">{p.label}</div>
                <div className="mj-price">
                  {p.price}
                  <span> {t.tarifs.currency}</span>
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
          <p className="mj-on-blue mj-included">{t.tarifs.included}</p>
        </div>
      </section>

      <section id="faq" className="mj-wrap mj-faq">
        <h2 className="mj-h2 mj-faq-title">{t.faq.title}</h2>
        <div className="mj-faq-list">
          {t.faq.items.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mj-final">
        <div className="mj-wrap mj-final-row">
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
            <a href="#templates">{t.nav.templates}</a>
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
