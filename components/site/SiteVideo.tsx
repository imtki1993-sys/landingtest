"use client";
// Vidéo de présentation : se lance sans le son quand elle arrive à l'écran,
// sauf si le visiteur a demandé moins d'animations. Les contrôles restent disponibles.
import { useEffect, useRef } from "react";

export default function SiteVideo({ base, poster, label }: { base: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="mj-video"
      poster={poster}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={label}
      width={1920}
      height={1080}
    >
      {/* H.264 pour Safari et iPhone, VP9 pour les navigateurs sans H.264 */}
      <source src={`${base}.mp4`} type="video/mp4" />
      <source src={`${base}.webm`} type="video/webm" />
    </video>
  );
}
