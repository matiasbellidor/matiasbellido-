"use client";

import { useEffect, useRef } from "react";

/* Color de fondo interpolado con el scroll:
   dark:  Midnight Blue → Deep Indigo → Charcoal Black
   light: blanco → Ice Blue → Pearl Grey
   El progreso sale de document.scrollingElement (no de useScroll, que se
   queda en 0 si scrollea un contenedor interno). Listener passive + rAF, el
   color se escribe directo en el DOM (sin re-renders), un MutationObserver
   repinta al cambiar de tema y el recorrido máximo se mide solo cuando
   cambia el tamaño (leer scrollHeight en cada cuadro forzaba un layout). */

type RGB = [number, number, number];

const PALETTES: Record<"dark" | "light", { a: RGB; b: RGB; c: RGB }> = {
  dark: {
    a: [5, 10, 28], // Midnight Blue
    b: [10, 38, 82], // Deep Ocean Blue (Proyectos)
    c: [16, 24, 32], // Charcoal Black
  },
  light: {
    a: [248, 250, 252], // Casi blanco
    b: [205, 222, 240], // Azul hielo (perceptible)
    c: [214, 219, 226], // Gris perla
  },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (x: number, y: number, t: number) => Math.round(x + (y - x) * t);

function colorAt(prog: number, a: RGB, b: RGB, c: RGB): RGB {
  if (prog <= 0.5) {
    const t = prog / 0.5;
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }
  const t = (prog - 0.5) / 0.5;
  return [lerp(b[0], c[0], t), lerp(b[1], c[1], t), lerp(b[2], c[2], t)];
}

export default function ScrollBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let max = 0;
    const doc = document.scrollingElement || document.documentElement;
    const measure = () => {
      max = doc.scrollHeight - doc.clientHeight;
    };

    const isDark = () => document.documentElement.classList.contains("dark");

    const paint = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;

      const prog = max > 0 ? clamp01(window.scrollY / max) : 0;

      const p = isDark() ? PALETTES.dark : PALETTES.light;
      const [r, g, b] = colorAt(prog, p.a, p.b, p.c);
      el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new MutationObserver(paint);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Cambió el alto de la página (se abrió algo, cargó una imagen) o de la ventana
    const resize = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    resize.observe(document.body);
    const onWindowResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("resize", onWindowResize, { passive: true });

    measure();
    paint();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onWindowResize);
      observer.disconnect();
      resize.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ backgroundColor: "rgb(2, 8, 20)" }}
    />
  );
}