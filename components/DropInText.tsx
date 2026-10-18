"use client";

import { Fragment, type CSSProperties } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Solo transform/opacity: corren en el compositor (GPU). El blur por
   carácter que había antes forzaba repaints de cientos de spans. */
const charStyle: CSSProperties = {
  display: "inline-block",
};

/* Transiciones SIMÉTRICAS — ver comentario en WaveText. */
const char: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3, ease: EASE },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};

const container: Variants = {
  hidden: {
    transition: { staggerChildren: 0.012, staggerDirection: -1 },
  },
  show: {
    transition: { staggerChildren: 0.012 },
  },
};

export default function DropInText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = !!useReducedMotion();

  if (typeof text !== "string" || !text) return null;
  if (reduced) return <p className={className}>{text}</p>;

  const words = text.split(" ");

  return (
    <motion.p
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      aria-label={text}
      className={className}
    >
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <Fragment key={`${w}-${wi}`}>
            <span style={{ display: "inline-block" }}>
              {Array.from(w).map((c, ci) => (
                <motion.span key={`${c}-${ci}`} variants={char} style={charStyle}>
                  {c}
                </motion.span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </span>
    </motion.p>
  );
}