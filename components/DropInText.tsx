"use client";

import { Fragment, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ═════════════════════════════════════════════════════════════
   DROP-IN TEXT — cada letra cae a su lugar al entrar en pantalla.

   La animación es CSS (.drop-char en globals.css, solo opacity y
   transform → GPU). Antes cada letra era un componente de Framer
   Motion (~330 en la cita) y eso cargaba el hilo principal en
   mobile. Acá solo se observa el párrafo y, al entrar en pantalla,
   se le agrega .is-shown; el retraso de cada letra va inline.
   ═════════════════════════════════════════════════════════════ */

const STAGGER_MS = 12;

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

  if (typeof text !== "string" || !text) return null;
  if (reduced) return <p className={className}>{text}</p>;

  /* Índice global: el stagger corre de punta a punta del texto */
  let charIndex = 0;

  return (
    <p ref={ref} aria-label={text} className={`${className} ${shown ? "is-shown" : ""}`}>
      <span aria-hidden="true">
        {text.split(" ").map((w, wi, words) => (
          <Fragment key={`${w}-${wi}`}>
            {/* inline-block por palabra: nunca la corta a la mitad */}
            <span className="inline-block">
              {Array.from(w).map((c, ci) => (
                <span key={ci} className="drop-char" style={{ animationDelay: `${charIndex++ * STAGGER_MS}ms` }}>
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
