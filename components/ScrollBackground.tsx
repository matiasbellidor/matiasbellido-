"use client";

import { useEffect, useRef } from "react";

/* ═════════════════════════════════════════════════════════════
   SCROLL-TRIGGERED BACKGROUND TRANSITION

   Capa fija detrás de todo el contenido cuyo color se interpola
   en función de scrollY. El recorrido cromático es:

   DARK:   Midnight Blue → Deep Indigo → Dark Teal
   LIGHT:  Blanco puro   → Ice Blue    → Pearl Grey

   Anclas (centro vertical de cada sección, medido en vivo):
   home → color 1 | skills → color 2 | projects → color 2 (meseta)
   experience → color 3 | de ahí en adelante → color 3

   Performance:
   - Listener de scroll `passive` + throttle con requestAnimationFrame
     (se pinta como máximo 1 vez por frame, nunca más).
   - Cero estado de React: se escribe backgroundColor directo al DOM
     vía ref, así no hay re-renders por scroll.
   - Un MutationObserver detecta el toggle dark/light y repinta.
   ═════════════════════════════════════════════════════════════ */

type RGB = [number, number, number];

const SCROLL_PALETTE: Record<"dark" | "light", { hero: RGB; mid: RGB; end: RGB }> = {
  dark: {
    hero: [2, 8, 20], // Midnight Blue (#020814)
    mid: [17, 10, 40], // Deep Indigo (#110A28)
    end: [4, 20, 24], // Dark Teal (#041418)
  },
  light: {
    hero: [255, 255, 255], // Blanco puro
    mid: [234, 243, 251], // Ice Blue (#EAF3FB)
    end: [243, 244, 246], // Pearl Grey (#F3F4F6)
  },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mix = (c1: RGB, c2: RGB, t: number): RGB => [
  Math.round(lerp(c1[0], c2[0], t)),
  Math.round(lerp(c1[1], c2[1], t)),
  Math.round(lerp(c1[2], c2[2], t)),
];

/* Interpolación por tramos: dado un punto del scroll y una lista de
   anclas [posición, color], devuelve el color fundido entre las dos
   anclas que lo rodean. Antes de la primera o después de la última,
   devuelve el color puro correspondiente. */
function colorAt(pos: number, anchors: Array<[number, RGB]>): RGB {
  if (anchors.length === 0) return [0, 0, 0];
  if (pos <= anchors[0][0]) return anchors[0][1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [p1, c1] = anchors[i];
    const [p2, c2] = anchors[i + 1];
    if (pos <= p2) {
      const t = p2 === p1 ? 1 : clamp01((pos - p1) / (p2 - p1));
      return mix(c1, c2, t);
    }
  }

  return anchors[anchors.length - 1][1];
}

export default function ScrollBackground() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const isDark = () => document.documentElement.classList.contains("dark");

    /* Centro vertical absoluto (en píxeles de documento) de una sección */
    const centerOf = (id: string): number | null => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return window.scrollY + rect.top + rect.height / 2;
    };

    const paint = () => {
      ticking = false;
      const layer = layerRef.current;
      if (!layer) return;

      const palette = SCROLL_PALETTE[isDark() ? "dark" : "light"];

      /* El punto de referencia es el centro del viewport: el fundido
         queda anclado a lo que el usuario está mirando, no al borde. */
      const viewCenter = window.scrollY + window.innerHeight / 2;

      /* Anclas medidas en vivo (toleran secciones que cambien de altura
         por acordeones, carruseles o modales). Si una sección no existe,
         simplemente se omite y el fundido sigue funcionando. */
      const candidates: Array<[number | null, RGB]> = [
        [centerOf("home") ?? window.innerHeight / 2, palette.hero],
        [centerOf("skills"), palette.mid],
        [centerOf("projects"), palette.mid], // meseta: skills y projects comparten color
        [centerOf("experience"), palette.end],
      ];

      const anchors = candidates.filter(
        (a): a is [number, RGB] => a[0] !== null
      );

      const [r, g, b] = colorAt(viewCenter, anchors);
      layer.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    };

    /* Throttle por frame: por más eventos de scroll que lleguen,
       se pinta una sola vez por refresco de pantalla. */
    const requestPaint = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    };

    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint, { passive: true });

    /* Repinta al instante cuando se togglea el tema (clase .dark en <html>) */
    const observer = new MutationObserver(requestPaint);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    paint(); // primer pintado al montar

    return () => {
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
