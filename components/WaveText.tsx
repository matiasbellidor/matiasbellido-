"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Transiciones SIMÉTRICAS: hidden y show definen tanto el estado
   visual de destino como CÓMO llegar a él. Framer Motion usa la
   transition del variant de DESTINO, así que:
   - Entrando (hidden→show): usa la transition de "show"
   - Saliendo (show→hidden): usa la transition de "hidden"
   Ambas con los mismos tiempos = reverse suave e idéntico. */
const word: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: EASE },
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: EASE },
  },
};

const container: Variants = {
  hidden: {
    transition: { staggerChildren: 0.025, staggerDirection: -1 },
  },
  show: {
    transition: { staggerChildren: 0.025 },
  },
};

export default function WaveText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = !!useReducedMotion();

  if (typeof text !== "string" || !text) return null;
  if (reduced) return <p className={className}>{text}</p>;

  return (
    <motion.p
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      className={className}
    >
      {text.split(" ").map((w, i, arr) => (
        <Fragment key={`${w}-${i}`}>
          <motion.span variants={word} className="inline-block">
            {w}
          </motion.span>
          {i < arr.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </motion.p>
  );
}