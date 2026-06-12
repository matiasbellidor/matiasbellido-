"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/* ═════════════════════════════════════════════════════════════
   SCROLL REVEAL TEXT

   Revela un párrafo palabra por palabra atado a la posición del
   scroll: cada palabra "cae" a su lugar a medida que bajás, y el
   efecto se rebobina solo cuando subís (es scrubbing 1:1 con el
   scroll, no una animación disparada una vez).

   Cómo funciona:
   - useScroll mide el progreso del párrafo dentro del viewport
     (0 cuando entra por abajo, 1 cuando ya se leyó).
   - A cada palabra se le asigna una franja de ese progreso, y su
     opacidad + caída (y) se interpolan dentro de esa franja.
   - Debajo hay una copia "fantasma" del texto al 20% de opacidad,
     para que el bloque mantenga su forma y se intuya lo que viene.

   Performance: la animación es por PALABRA y no por letra a
   propósito — este párrafo tiene ~90 palabras vs ~600 letras, y
   600 spans animados por frame es jank garantizado en mobile.
   A velocidad de lectura el resultado visual es el mismo.

   Uso (el texto sigue viniendo de LanguageContext):
   <ScrollRevealText text={t.projects.intro} className="..." />
   ═════════════════════════════════════════════════════════════ */

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [-14, 0]);

  return (
    <span className="relative inline-block">
      {/* Copia fantasma: mantiene el layout y deja entrever el texto */}
      <span aria-hidden="true" className="opacity-20">
        {children}
      </span>
      {/* Palabra real: cae y aparece según el scroll */}
      <motion.span style={{ opacity, y }} className="absolute left-0 top-0">
        {children}
      </motion.span>
    </span>
  );
}

export default function ScrollRevealText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = !!useReducedMotion();

  /* Progreso: 0 cuando el tope del párrafo entra al 90% del viewport,
     1 cuando su final pasa el 60% — se termina de leer antes de que
     el bloque salga de pantalla. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.6"],
  });

  /* Blindaje: si la prop `text` llega vacía o indefinida (p. ej. una
     clave inexistente en LanguageContext), no renderizamos nada en vez
     de romper el prerender con `undefined.split`. */
  if (typeof text !== "string" || text.length === 0) {
    console.warn(
      "ScrollRevealText: la prop `text` llegó vacía o indefinida. " +
        "Revisá que la clave usada exista en LanguageContext.tsx."
    );
    return null;
  }

  const words = text.split(" ");

  /* Accesibilidad: con "reducir movimiento" activo, texto plano */
  if (reduced) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const step = 1 / words.length;
        const start = i * step;
        return (
          <span key={`${word}-${i}`}>
            <Word progress={scrollYProgress} range={[start, start + step]}>
              {word}
            </Word>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}