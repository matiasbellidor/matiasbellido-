"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useHasFinePointer } from "@/components/Magnetic";
import { BrandName, SecondaryLink, WhatsAppButton } from "@/components/fitness/shared";
/* La foto inicial del portfolio (la misma del Hero de /), importada: el link
   cambia si cambia la foto. 1254 × 1254: el marco cuadrado la muestra entera. */
import profilePhoto from "@/public/projects/Imagenes/profile.webp";

/* Entrada en CSS (.hero-reveal / .hero-photo-in de globals.css), como en
   /fitness: arranca con el primer paint y espera a la intro del logo. */
const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

const TILT_MAX = 9;

/* Hero de /educativo: marca grande, la pregunta, una línea y el CTA. Corto a
   propósito (pedido de Matías): sin chips ni textos sobre la foto. La foto
   tiene inclinación 3D y brillo que siguen al cursor (solo con mouse y sin
   "reducir movimiento"). Marco cuadrado: la foto es 1:1 y se ve entera. */
export default function EducativoHero() {
  const { t } = useLanguage();
  const e = t.educativo;
  const h = e.hero;
  const fine = useHasFinePointer();
  const reduced = !!useReducedMotion();

  const photoRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 140, damping: 16, mass: 0.4 });
  const springRotateY = useSpring(rotateY, { stiffness: 140, damping: 16, mass: 0.4 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(35);
  const glareOpacity = useMotionValue(0);
  const springGlareOpacity = useSpring(glareOpacity, { stiffness: 150, damping: 22 });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.07) 32%, transparent 58%)`;

  const onPhotoMove = (ev: ReactMouseEvent<HTMLDivElement>) => {
    if (!fine || reduced || !photoRef.current) return;
    const rect = photoRef.current.getBoundingClientRect();
    const px = (ev.clientX - rect.left) / rect.width;
    const py = (ev.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * TILT_MAX * 2);
    rotateX.set((0.5 - py) * TILT_MAX * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  };

  const onPhotoLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  return (
    <section id="inicio" className="relative md:min-h-screen flex items-center px-4 sm:px-6 md:px-10 lg:px-16 pt-28 pb-16 md:py-32">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center min-w-0">
        <div className="min-w-0">
          {/* Mismo cálculo de tamaño que /fitness: "BELLIDO" = columna / 5,4 */}
          <h1 style={delay(0.2)} className="hero-reveal">
            <BrandName className="text-[clamp(2.5rem,calc((100vw_-_32px)/5.4),6.5rem)] md:text-[clamp(2.5rem,calc(9.907vw_-_12.7px),6.5rem)] lg:text-[clamp(3rem,calc(9.907vw_-_19px),6.5rem)]" />
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{h.kicker}</span>
            <span className="mt-3 block font-display text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight tracking-tight text-fg">{h.tagline}</span>
          </h1>

          <p style={delay(0.34)} className="hero-reveal mt-4 text-base md:text-lg text-fg-soft leading-relaxed max-w-xl">
            {h.who}
          </p>

          <div style={delay(0.44)} className="hero-reveal mt-8 flex flex-wrap gap-3">
            <WhatsAppButton message={e.whatsappMessage} label={h.cta} size="lg" />
            <SecondaryLink href="#packs">{h.ctaSecondary}</SecondaryLink>
          </div>
        </div>

        <div className="hero-photo-in relative flex justify-center min-w-0">
          <div className="relative w-full max-w-[400px] md:max-w-[480px]" style={{ perspective: 1100 }}>
            <div className="aurora-wrap" aria-hidden="true">
              <span className="aurora-blob aurora-blob-1" />
              <span className="aurora-blob aurora-blob-2" />
              <span className="aurora-blob aurora-blob-3" />
            </div>
            <motion.div
              ref={photoRef}
              onMouseMove={onPhotoMove}
              onMouseLeave={onPhotoLeave}
              style={{ rotateX: springRotateX, rotateY: springRotateY }}
              className="relative aspect-square rounded-3xl overflow-hidden fit-surface shadow-glow-lg will-change-transform"
            >
              <Image
                src={profilePhoto}
                alt={h.photoAlt}
                fill
                priority
                quality={90}
                placeholder="blur"
                sizes="(max-width: 767px) 92vw, 480px"
                className="object-cover"
              />
              <motion.div
                aria-hidden="true"
                style={{ background: glareBackground, opacity: springGlareOpacity }}
                className="absolute inset-0 z-10 pointer-events-none"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
