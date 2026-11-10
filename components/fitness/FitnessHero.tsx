"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useHasFinePointer } from "@/components/Magnetic";
import { Emoji, type EmojiName } from "./emoji";
import { BrandName, SecondaryLink, WhatsAppButton } from "./shared";

/* Los tres pilares del hero llevan el mismo emoji que en "Mi método" */
const METHOD_EMOJIS: EmojiName[] = ["barChart", "plate", "speech"];

/* Entrada en CSS (.hero-reveal / .hero-photo-in de globals.css), igual que
   el Hero del portfolio: arranca con el primer paint, sin esperar al JS, y
   espera a la intro del logo si es la primera visita de la sesión. */
const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/* Inclinación máxima de la foto en grados (la misma del Hero del portfolio) */
const TILT_MAX = 9;

/* Hero: la marca grande (tipografía de marca) + la propuesta de valor en
   tres respuestas: a quién (who), qué resuelve (who) y cómo (method).
   La foto usa el mismo efecto que la del portfolio: inclinación 3D y un
   brillo de vidrio que siguen al cursor (solo con mouse y sin "reducir
   movimiento"). Marco 4:5 (el mismo de "Quién soy" y los clientes) a todo
   el ancho de su columna; con la portada vertical (9:16) el encuadre baja
   un 18 % para que entren la gorra, la cara y el brazo hasta la mano. */
export default function FitnessHero({ photo }: { photo: string }) {
  const { t } = useLanguage();
  const h = t.fitness.hero;
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

  const onPhotoMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!fine || reduced || !photoRef.current) return;
    const rect = photoRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
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
    <section
      id="inicio"
      className="relative md:min-h-screen flex items-center px-4 sm:px-6 md:px-10 lg:px-16 pt-28 pb-16 md:py-32"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center min-w-0">
        <div className="min-w-0">
          {/* Logotipo como el del portfolio. "BELLIDO" mide 4,91 em en Cinzel
              (medido en Chromium): tamaño = columna / 5,4, así ocupa ~90 % y
              nunca se corta. Mobile: 100vw − gutter; md/lg: 1,15/2,15 de
              (100vw − gutters − gap); tope 6,5rem con el max-w-6xl. */}
          <h1 style={delay(0.2)} className="hero-reveal">
            <BrandName className="text-[clamp(2.5rem,calc((100vw_-_32px)/5.4),6.5rem)] md:text-[clamp(2.5rem,calc(9.907vw_-_12.7px),6.5rem)] lg:text-[clamp(3rem,calc(9.907vw_-_19px),6.5rem)]" />
            <span className="mt-6 block font-display text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight tracking-tight text-fg">
              {h.tagline}
            </span>
          </h1>

          <p style={delay(0.34)} className="hero-reveal mt-4 text-base md:text-lg text-fg-soft leading-relaxed max-w-xl">
            {h.who}
          </p>

          <ul style={delay(0.44)} className="hero-reveal mt-6 flex flex-wrap gap-2">
            {h.method.map((item, i) => (
              <li key={item} className="fit-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-fg">
                {/* eager: está en la primera pantalla, que no espere al lazy-load */}
                <Emoji name={METHOD_EMOJIS[i % METHOD_EMOJIS.length]} className="w-[18px] h-[18px]" eager />
                {item}
              </li>
            ))}
          </ul>

          {/* flex-wrap: si no entran los dos en una fila, "Ver planes" baja
              (antes se achicaba el CTA y se cortaba su texto en tablets) */}
          <div style={delay(0.54)} className="hero-reveal mt-8 flex flex-wrap gap-3">
            <WhatsAppButton message={t.fitness.whatsappMessage} label={h.cta} size="lg" />
            <SecondaryLink href="#planes">{h.ctaSecondary}</SecondaryLink>
          </div>
        </div>

        {/* Foto: aurora + inclinación 3D + brillo, como en el portfolio */}
        <div className="hero-photo-in relative flex justify-center min-w-0">
          <div className="relative w-full max-w-[420px] md:max-w-[520px]" style={{ perspective: 1100 }}>
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
              className="relative aspect-[4/5] rounded-3xl overflow-hidden fit-surface shadow-glow-lg will-change-transform"
            >
              <Image
                src={photo}
                alt={h.photoAlt}
                fill
                priority
                quality={92}
                sizes="(max-width: 767px) 92vw, 520px"
                className="object-cover object-[50%_18%]"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <p className="absolute left-3 right-3 bottom-3 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white">
                {h.loop.map((word, i) => (
                  <span key={word} className="inline-flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="text-[rgb(0,229,255)]">→</span>}
                    {word}
                  </span>
                ))}
              </p>
              {/* Brillo de vidrio que sigue al cursor */}
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
