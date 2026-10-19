"use client";

import { Fragment, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ═════════════════════════════════════════════════════════════
   WAVE TEXT — las palabras suben en ola al entrar en pantalla.

   La animación es CSS (.wave-word en globals.css, solo opacity y
   transform → GPU). Antes cada palabra era un componente de Framer
   Motion (~100 en la descripción de Proyectos). Acá solo se observa
   el párrafo y se le agrega .is-shown; el retraso de cada palabra va
   inline.
   ═════════════════════════════════════════════════════════════ */

const STAGGER_MS = 25;

export default function WaveText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.2 });

  if (typeof text !== "string" || !text) return null;
  if (reduced) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={`${className} ${shown ? "is-shown" : ""}`}>
      {text.split(" ").map((w, i, arr) => (
        <Fragment key={`${w}-${i}`}>
          <span className="wave-word" style={{ animationDelay: `${i * STAGGER_MS}ms` }}>
            {w}
          </span>
          {i < arr.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </p>
  );
}
