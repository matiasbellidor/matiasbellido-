"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Hook: detecta si el dispositivo tiene mouse real.
   En táctiles (mobile/tablet) no hay hover, así que los efectos
   magnéticos y de tilt se desactivan solos — cero costo extra.
   ───────────────────────────────────────────────────────────── */
export function useHasFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return fine;
}

/* ─────────────────────────────────────────────────────────────
   Componente: envoltorio magnético.
   El elemento se siente "atraído" por el cursor mientras lo
   recorrés, y vuelve a su lugar con un spring suave al salir.
   Uso: <Magnetic strength={0.4}><a ...>...</a></Magnetic>
   ───────────────────────────────────────────────────────────── */
export default function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useHasFinePointer();
  const reduced = !!useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 180, damping: 15, mass: 0.2 });

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!fine || reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  );
}
