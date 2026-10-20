"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, ArrowDown, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Magnetic, { useHasFinePointer } from "@/components/Magnetic";

/* Inclinación máxima de la foto en grados */
const TILT_MAX = 9;

/* Lo que va entre **dobles asteriscos** en LanguageContext se resalta
   con el color de acento (los índices impares son lo capturado). */
function withHighlights(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-cyan">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

/* Entrada escalonada: label → título → párrafo → botones (0.13s entre
   cada uno). La animación es CSS (.hero-photo-in / .hero-reveal en
   globals.css): arranca apenas se pinta el HTML, sin esperar a que
   cargue el JS, así el contenido principal aparece antes. */
const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/* ─────────────────────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────────────────────── */
export default function Hero() {
  const { t } = useLanguage();
  const fine = useHasFinePointer();
  const reduced = !!useReducedMotion();

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

  return (
    <section id="home" className="relative min-h-screen flex items-center px-5 sm:px-6 md:px-10 lg:px-16 py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center w-full min-w-0">
        {/* ── Columna izquierda: foto con tilt 3D + aurora ──
            (las redes viven solo en Contacto, al final del sitio) */}
        <div className="hero-photo-in relative flex flex-col items-center">
          {/* Mobile: 260px de ancho para que nombre, intro y botones entren en
              la primera pantalla (a ancho completo la foto la ocupaba entera) */}
          <div className="relative w-full max-w-[260px] sm:max-w-sm" style={{ perspective: 1100 }}>
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
                src="/projects/Imagenes/profile.webp"
                alt="Matías Bellido"
                fill
                priority
                quality={80}
                /* En mobile la foto mide 260px; declarar 240px hace que las
                   pantallas 3x bajen la de 768w y las 2x la de 512w (nítidas
                   igual), en vez de saltar a 1024w. sm+: 384px reales. */
                sizes="(max-width: 640px) 240px, 384px"
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
        </div>

        {/* ── Columna derecha: textos con entrada escalonada ── */}
        <div className="space-y-6 min-w-0">
          {/* Siempre en una sola línea. Hasta xl la columna de texto es angosta
              (mobile, y tablet a dos columnas): versión compacta con la
              ubicación corta. Desde xl, completa y con separador. */}
          <div
            style={delay(0.25)}
            className="hero-reveal inline-flex flex-wrap max-w-full items-center gap-x-2.5 gap-y-1 xl:gap-x-2 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full glass text-[11px] leading-4 xl:text-sm font-medium xl:font-normal uppercase tracking-wide xl:tracking-widest text-cyan"
          >
            <span className="inline-flex items-center gap-1.5 xl:gap-2 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              {t.hero.badge}
            </span>
            <span className="hidden xl:inline text-cyan/40" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1.5 xl:gap-2 whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span className="xl:hidden">{t.hero.locationShort}</span>
              <span className="hidden xl:inline">{t.hero.location}</span>
            </span>
          </div>

          {/* md+: el tamaño sigue al ancho de la columna (7vw − 12px, tope 72px)
              para que "Matías Bellido" no se corte en tablets */}
          <h1
            style={delay(0.38)}
            className="hero-reveal font-display text-[clamp(2.1rem,10vw,3.75rem)] md:text-[clamp(2.5rem,calc(7vw_-_12px),4.5rem)] font-bold leading-[1.1] lg:leading-none"
          >
            <span className="text-fg">{t.hero.titleLine1}</span>
            <br />
            <span className="whitespace-nowrap gradient-text-animated">
              {t.hero.titleLine2}
            </span>
          </h1>

          <p
            style={delay(0.51)}
            className="hero-reveal text-lg sm:text-xl md:text-2xl text-fg-soft max-w-xl leading-relaxed"
          >
            {withHighlights(t.hero.desc)}
          </p>

          {/* Mobile: dos columnas iguales (mismo ancho y alto, sin hueco a
              la derecha). sm+: fila con el ancho natural de cada botón.
              El borde transparente iguala la altura con el de .glass. */}
          <div style={delay(0.64)} className="hero-reveal grid grid-cols-2 gap-3 pt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
            <Magnetic strength={0.3} className="w-full sm:w-auto">
              <a
                href="#projects"
                className="group relative w-full inline-flex items-center justify-center whitespace-nowrap px-3 sm:px-7 py-3.5 sm:py-4 rounded-full border border-transparent bg-electric text-white font-medium text-base overflow-hidden transition-all hover:shadow-glow"
              >
                <span className="relative z-10">{t.hero.ctaProjects}</span>
              </a>
            </Magnetic>
            <a
              href="#bio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap px-3 sm:px-7 py-3.5 sm:py-4 rounded-full glass text-fg-soft hover:text-fg transition-colors text-base"
            >
              {t.hero.ctaAbout} <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
