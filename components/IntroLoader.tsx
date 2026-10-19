"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
/* El mismo ícono del Header y del favicon */
import logo from "@/app/icon.png";

/* ═════════════════════════════════════════════════════════════
   INTRO LOADER — logo girando + fade out, una vez por sesión

   - Un script inline en <head> (app/layout.tsx) agrega la clase
     `intro-seen` al <html> ANTES del primer paint si la intro ya
     se vio en esta sesión → el overlay queda oculto por CSS y no
     hay flash en los refresh.
   - Primera visita: 0.6s visible + 0.3s de fade. El fade es CSS
     (.intro-loader en globals.css): arranca con el primer paint y
     dura lo mismo aunque el JS tarde en cargar (antes, en un
     celular lento, podía tapar el contenido hasta 3s). El JS solo
     traba el scroll mientras tanto y desmonta el overlay al final.
   - La entrada del Hero espera 0.75s cuando no hay `intro-seen`
     (.hero-reveal en globals.css). Si cambiás estos tiempos,
     ajustá los dos lugares.
   - El logo es lazy: en las visitas con la intro oculta
     (display: none) el navegador ni lo descarga.
   - Si el logo no carga, cae al monograma "MB.".
   ═════════════════════════════════════════════════════════════ */

const INTRO_KEY = "intro-seen";

export default function IntroLoader() {
  const [done, setDone] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    /* La imagen viene del HTML del servidor: si falló antes de hidratar,
       React no ve el onError → lo detectamos acá. */
    const img = logoRef.current;
    if (img && img.complete && img.naturalWidth === 0) setLogoFailed(true);

    const root = rootRef.current;
    /* Ya vista en esta sesión, o el JS llegó cuando el fade CSS ya terminó */
    if (!root || document.documentElement.classList.contains(INTRO_KEY) || getComputedStyle(root).visibility === "hidden") {
      setDone(true);
      return;
    }
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* Modo privado / storage bloqueado: la intro igual funciona */
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEnd = (e: AnimationEvent) => {
      if (e.target === root && e.animationName === "intro-out") finish();
    };
    const finish = () => {
      root.removeEventListener("animationend", onEnd);
      document.body.style.overflow = prevOverflow;
      setDone(true);
    };
    root.addEventListener("animationend", onEnd);

    return () => {
      root.removeEventListener("animationend", onEnd);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="intro-loader" role="status" aria-label="Cargando">
      <div className="intro-loader__ring" aria-hidden="true" />
      {logoFailed ? (
        <span className="intro-loader__logo flex items-center justify-center font-display text-4xl font-bold text-cyan">MB.</span>
      ) : (
        <Image
          ref={logoRef}
          src={logo}
          alt="Matías Bellido"
          width={88}
          height={88}
          onError={() => setLogoFailed(true)}
          className="intro-loader__logo"
        />
      )}
    </div>
  );
}
