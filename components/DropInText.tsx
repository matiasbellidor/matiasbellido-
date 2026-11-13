"use client";

import { Fragment, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ═════════════════════════════════════════════════════════════
   DROP-IN TEXT — cada letra cae a su lugar al entrar en pantalla.

   Rendimiento (medido 2026-11-13, build de producción, celular con
   CPU 4× más lenta): antes cada letra tenía una animación CSS con
   animation-delay. Con ~330 letras eso hacía 330 capas de composición
   a la vez (una animación con delay y fill "both" está activa también
   mientras espera) y ~700 eventos animationstart/animationend que React
   procesaba uno por uno. La página pasaba de 74 a 347 capas.

   Ahora un solo requestAnimationFrame larga cada letra cuando le toca
   (cada STAGGER_MS) con la Web Animations API, que no dispara eventos
   en el DOM. Al mismo tiempo se animan ~25 letras, no 330, y al
   terminar cada animación desaparece (no queda nada en el compositor).
   Se ve igual: misma caída, misma curva, mismo escalonado.
   ═════════════════════════════════════════════════════════════ */

const STAGGER_MS = 12;
const DURATION_MS = 300;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const FROM: Keyframe = { opacity: 0, transform: "translateY(-12px)" };
const TO: Keyframe = { opacity: 1, transform: "none" };

export default function DropInText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const root = ref.current;
    if (!shown || !root) return;
    // Solo las que todavía no cayeron (al cambiar de idioma React reusa algunas)
    const chars = Array.from(root.querySelectorAll<HTMLElement>(".drop-char")).filter((el) => el.style.opacity !== "1");
    const settle = (el: HTMLElement) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    if (typeof chars[0]?.animate !== "function") {
      chars.forEach(settle);
      return;
    }
    let next = 0;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // Todas las letras a las que ya les tocó en este cuadro
      while (next < chars.length && next * STAGGER_MS <= now - start) {
        const el = chars[next++];
        settle(el);
        el.animate([FROM, TO], { duration: DURATION_MS, easing: EASING });
      }
      if (next < chars.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Si se desmonta o cambia el texto a mitad de camino, nada queda escondido
      for (let i = next; i < chars.length; i++) settle(chars[i]);
    };
  }, [shown, text]);

  if (typeof text !== "string" || !text) return null;
  if (reduced) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} aria-label={text} className={className}>
      <span aria-hidden="true">
        {text.split(" ").map((w, wi, words) => (
          <Fragment key={`${w}-${wi}`}>
            {/* inline-block por palabra: nunca la corta a la mitad */}
            <span className="inline-block">
              {Array.from(w).map((c, ci) => (
                <span key={ci} className="drop-char">
                  {c}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </span>
    </p>
  );
}
