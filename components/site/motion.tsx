"use client";
// Mouvements du site de présentation : défilement doux (Lenis) synchronisé sur le ticker de GSAP,
// apparitions au défilement (ScrollTrigger) et composants React Bits.
// Tout reste discret et s'arrête si le visiteur demande moins d'animations (prefers-reduced-motion).
import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import BlurText from "./bits/BlurText";
import CountUp from "./bits/CountUp";
import LightRays from "./bits/LightRays";
import StarBorder from "./bits/StarBorder";

const REDUCE = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(REDUCE);
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Défilement doux + apparition des blocs marqués data-reveal. */
export function SiteMotion() {
  useEffect(() => {
    if (window.matchMedia(REDUCE).matches) return;
    gsap.registerPlugin(ScrollTrigger);

    // Lenis avance au rythme du ticker GSAP : un seul requestAnimationFrame pour les deux.
    const lenis = new Lenis({ duration: 1.1, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Seuls les blocs encore sous l'écran sont masqués : rien ne disparaît sous les yeux.
    const items = gsap.utils
      .toArray<HTMLElement>("[data-reveal]")
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    gsap.set(items, { autoAlpha: 0, y: 28 });
    const batch = ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (els) =>
        gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.08, overwrite: true }),
    });

    // Les images chargées après coup changent la hauteur de la page.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      batch.forEach((st) => st.kill());
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

/** Titre du hero : chaque ligne apparaît en se défloutant (React Bits « Blur Text »). */
export function HeroTitle({ lines }: { lines: readonly string[] }) {
  return (
    <h1 className="mj-h1" aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span key={line} className="mj-h1-line" aria-hidden="true">
          <BlurText
            text={line}
            animateBy="words"
            direction="bottom"
            trigger="load"
            delay={120 + i * 160}
            stepDuration={0.45}
            blur={8}
            distance={18}
          />
        </span>
      ))}
    </h1>
  );
}

/** Fond du hero : rayons de lumière aux couleurs du site (React Bits « Light Rays »). */
export function HeroRays() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="mj-hero-rays" aria-hidden="true">
      <LightRays
        raysOrigin="top-right"
        raysColor="#FFC83D"
        raysSpeed={0.6}
        lightSpread={0.9}
        rayLength={1.6}
        intensity={0.8}
        saturation={0.9}
        fadeDistance={1}
        noiseAmount={0.04}
        followMouse={false}
        cursorShadow={false}
        clickPulse={false}
        opacity={0.7}
        maxDevicePixelRatio={1.5}
      />
    </div>
  );
}

/** Prix qui compte jusqu'à sa valeur quand il arrive à l'écran (React Bits « Count Up »). */
export function Count({ value, separator = "" }: { value: number; separator?: string }) {
  return <CountUp to={value} from={0} duration={1.4} separator={separator} easing="easeOut" />;
}

/** Bouton principal avec un liseré lumineux qui fait le tour (React Bits « Star Border »). */
export function PrimaryCta({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return (
    <StarBorder
      as="a"
      href={href}
      className={className}
      color="#FFFFFF"
      backgroundColor="#FFC83D"
      textColor="#17133A"
      radius={10}
      thickness={1.5}
      duration={5}
      glow={0.35}
      hover="brighten"
      clickPulse={false}
      theme="light"
      borderColor="#FFC83D"
    >
      {children}
    </StarBorder>
  );
}
