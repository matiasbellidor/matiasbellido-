"use client";

import { useEffect } from "react";

/* ═════════════════════════════════════════════════════════════
   Los títulos con degradé animado (.gradient-text y
   .gradient-text-animated en globals.css) animan background-position,
   que el navegador tiene que repintar en cada frame. Medido con la
   página quieta: eran ~96% de todo el trabajo de pintado, aunque los
   títulos estuvieran fuera de pantalla. Acá se pausan mientras no se
   ven y vuelven a fluir al entrar en pantalla (cero cambio visual).

   Se pausa la animación CSS por la Web Animations API (no con una
   clase): así no se toca ningún atributo que maneje React y no hay
   diferencias de hidratación en las secciones que cargan aparte.
   ═════════════════════════════════════════════════════════════ */
export default function PauseOffscreenGradients() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        for (const animation of entry.target.getAnimations()) {
          if (entry.isIntersecting) animation.play();
          else animation.pause();
        }
      }
    });
    document.querySelectorAll(".gradient-text, .gradient-text-animated").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
