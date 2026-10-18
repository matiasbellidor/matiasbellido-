"use client";

import { useEffect, useRef, useState } from "react";

/* ═════════════════════════════════════════════════════════════
   INTRO LOADER — logo girando + fade out, una vez por sesión

   - Un script inline en <head> (app/layout.tsx) agrega la clase
     `intro-seen` al <html> ANTES del primer paint si la intro ya
     se vio en esta sesión → el overlay queda oculto por CSS y no
     hay flash en los refresh.
   - Primera visita: se muestra ~1.7s, hace fade de 0.5s y se
     desmonta. Solo anima transform/opacity (GPU).
   - Si /logo-icon.png no existe todavía, cae al monograma "MB.".
   ═════════════════════════════════════════════════════════════ */

export const INTRO_KEY = "intro-seen";
const SHOW_MS = 1700;
const FADE_MS = 500;

/* Delay (segundos) para las animaciones de entrada del Hero:
   si la intro se está mostrando, esperamos a que termine. */
export function getIntroDelay() {
  if (typeof document === "undefined") return 0;
  return document.documentElement.classList.contains(INTRO_KEY) ? 0 : (SHOW_MS + FADE_MS / 2) / 1000;
}

export default function IntroLoader() {
  const [phase, setPhase] = useState<"show" | "fade" | "done">("show");
  const [logoFailed, setLogoFailed] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    /* La imagen viene del HTML del servidor: si falló antes de hidratar,
       React no ve el onError → lo detectamos acá. */
    const img = logoRef.current;
    if (img && img.complete && img.naturalWidth === 0) setLogoFailed(true);

    const html = document.documentElement;
    if (html.classList.contains(INTRO_KEY)) {
      setPhase("done");
      return;
    }
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* Modo privado / storage bloqueado: la intro igual funciona */
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fadeTimer = setTimeout(() => setPhase("fade"), SHOW_MS);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = prevOverflow;
    }, SHOW_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`intro-loader ${phase === "fade" ? "intro-loader--out" : ""}`}
      role="status"
      aria-label="Cargando"
    >
      <div className="intro-loader__ring" aria-hidden="true" />
      {logoFailed ? (
        <span className="intro-loader__logo flex items-center justify-center font-display text-4xl font-bold text-cyan">MB.</span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={logoRef}
          src="/logo-icon.png"
          alt="Matías Bellido"
          width={88}
          height={88}
          decoding="async"
          fetchPriority="high"
          onError={() => setLogoFailed(true)}
          className="intro-loader__logo"
        />
      )}
    </div>
  );
}
