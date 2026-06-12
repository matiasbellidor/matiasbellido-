"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* Curva de easing premium (la misma de toda la página) */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ═════════════════════════════════════════════════════════════
   DROP-IN TEXT (disparado por scroll, una sola vez)

   Cuando el bloque entra al viewport (Intersection Observer vía
   el `whileInView` de Framer Motion), cada palabra cae desde
   y: -20px a su posición con fade-in, en secuencia rápida.

   Es el hermano "disparado" de ScrollRevealText (que es scrubbing
   1:1 con el scroll): este se ejecuta una vez y queda.

   Performance y responsive:
   - Split por PALABRA, no por letra: ~40 spans animados en vez de
     ~250. Solo se animan transform y opacity (GPU, sin repaints).
   - Cada palabra es un inline-block (necesario para transform) y
     los espacios entre palabras son espacios reales del texto, así
     el párrafo conserva line-height, wrapping y centrado naturales
     en cualquier ancho de pantalla — en mobile las líneas quiebran
     exactamente donde quebrarían sin el efecto.
   - `once: true`: anima una vez y no vuelve a correr en cada scroll.

   Uso:
   <DropInText text={t.bio.manifesto} className="..." />
   ═════════════════════════════════════════════════════════════ */

export default function DropInText({
  text,
  className = "",
  stagger = 0.02,
}: {
  text: string;
  className?: string;
  /* Delay entre palabras, en segundos. 0.02 = secuencia rápida */
  stagger?: number;
}) {
  const reduced = !!useReducedMotion();

  /* Blindaje: clave inexistente en LanguageContext → no explota */
  if (typeof text !== "string" || text.length === 0) {
    console.warn(
      "DropInText: la prop `text` llegó vacía o indefinida. " +
        "Revisá que la clave usada exista en LanguageContext.tsx."
    );
    return null;
  }

  /* Accesibilidad: con "reducir movimiento" activo, texto plano */
  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  const words = text.split(" ");

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger },
    },
  };

  const drop = {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: EASE },
    },
  };

  return (
    <motion.p
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span variants={drop} className="inline-block">
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </motion.p>
  );
}
