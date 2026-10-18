"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, ArrowDown, Linkedin, Github, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Magnetic, { useHasFinePointer } from "@/components/Magnetic";
import { getIntroDelay } from "@/components/IntroLoader";

/* Curva de easing premium (ease-out suave, estilo Apple) */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Inclinación máxima de la foto en grados */
const TILT_MAX = 9;

/* ─────────────────────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────────────────────── */
export default function Hero() {
  const { t } = useLanguage();
  const fine = useHasFinePointer();
  const reduced = !!useReducedMotion();
  /* Si la intro está en pantalla, la entrada arranca cuando se va */
  const [introDelay] = useState(getIntroDelay);

  /* ── Tilt 3D + glare de la foto ── */
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
    const px = (e.clientX - rect.left) / rect.width; // 0 → 1
    const py = (e.clientY - rect.top) / rect.height; // 0 → 1
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

  /* ── Stagger de entrada: label → título → párrafo → botones ── */
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.13,
        delayChildren: (reduced ? 0 : 0.25) + introDelay,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduced ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.3 : 0.7, ease: EASE },
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center px-5 sm:px-6 md:px-16 py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full min-w-0">
        {/* ── Columna izquierda: foto con tilt 3D + aurora + redes ── */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 30, scale: reduced ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: introDelay }}
          className="relative flex flex-col items-center gap-6"
        >
          <div className="relative w-full max-w-sm" style={{ perspective: 1100 }}>
            {/* Aurora animada (reemplaza al glow estático) */}
            <div className="aurora-wrap" aria-hidden="true">
              <span className="aurora-blob aurora-blob-1" />
              <span className="aurora-blob aurora-blob-2" />
              <span className="aurora-blob aurora-blob-3" />
            </div>

            {/* Tarjeta de la foto con tilt 3D */}
            <motion.div
              ref={photoRef}
              onMouseMove={onPhotoMove}
              onMouseLeave={onPhotoLeave}
              style={{ rotateX: springRotateX, rotateY: springRotateY }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden glass shadow-glow-lg will-change-transform"
            >
              <Image
                src="/projects/Imagenes/profile.png"
                alt="Matías Bellido"
                fill
                priority
                quality={80}
                sizes="(max-width: 768px) 90vw, 384px"
                className="object-cover object-top scale-90"
              />

              {/* Glare de vidrio que sigue al cursor */}
              <motion.div
                aria-hidden="true"
                style={{ background: glareBackground, opacity: springGlareOpacity }}
                className="absolute inset-0 z-10 pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Redes sociales con efecto magnético */}
          <div className="flex items-center gap-4">
            <Magnetic strength={0.45}>
              <a
                href="https://www.linkedin.com/in/matiasbellido"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="glass p-3 rounded-full hover:text-cyan hover:shadow-glow transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </Magnetic>
            <Magnetic strength={0.45}>
              <a
                href="https://github.com/matiasbellidor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="glass p-3 rounded-full hover:text-cyan hover:shadow-glow transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            </Magnetic>
            <Magnetic strength={0.45}>
              <a
                href="https://wa.me/message/RRG5RHLSINR3M1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="glass p-3 rounded-full hover:text-cyan hover:shadow-glow transition-all"
              >
                <Phone className="w-5 h-5" />
              </a>
            </Magnetic>
          </div>
        </motion.div>

        {/* ── Columna derecha: textos con stagger fade-up ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6 min-w-0"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 rounded-full glass text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest text-cyan max-w-full"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.hero.badge}</span>
            <span className="text-cyan/40">|</span>
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{t.hero.location}</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(2.1rem,10vw,3.75rem)] lg:text-7xl font-bold leading-[1.1]"
          >
            <span className="text-fg">{t.hero.titleLine1}</span>
            <br />
            <span className="whitespace-nowrap gradient-text-animated">
              {t.hero.titleLine2}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl md:text-2xl text-fg-soft max-w-xl leading-relaxed"
          >
            {t.hero.desc}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
            <Magnetic strength={0.3}>
              <a
                href="#projects"
                className="group relative px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-electric text-white font-medium text-base overflow-hidden transition-all hover:shadow-glow"
              >
                <span className="relative z-10">{t.hero.ctaProjects}</span>
              </a>
            </Magnetic>
            <a
              href="#bio"
              className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-full glass text-fg-soft hover:text-fg transition-colors inline-flex items-center gap-2 text-base"
            >
              {t.hero.ctaAbout} <ArrowDown className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}