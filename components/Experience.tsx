"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Section from "./Section";
import { Briefcase, GraduationCap, Award, X, Languages, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";

// ============================================================================
// LOGOS - mismo orden que los items en LanguageContext
// [0] Tutor Académico → asesoramientoslogo
// [1] Personal Trainer → asesoramientoslogo
// [2] Customer Experience → arcosdorados
// [3] Business Development → SOMECLUB
// [4] Consultor Comercial → fiat
// [5] Asistente Investigación → fundacionapolo
// ============================================================================
const experienceLogos = [
  "/projects/Imagenes/asesoramientoslogo.png",
  "/projects/Imagenes/asesoramientoslogo.png",
  "/projects/Imagenes/arcosdorados.png",
  "/projects/Imagenes/SOMECLUB.png",
  "/projects/Imagenes/fiat.png",
  "/projects/Imagenes/fundacionapolo.png",
];

const educationLogos = [
  "/projects/Imagenes/UBA.jpg",
  "/projects/Imagenes/STJ.png",
];


export default function Experience() {
  const { t, lang, setLang } = useLanguage();
  const { setModalOpen: setGlobalModalOpen } = useModal();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    setGlobalModalOpen(expandedIdx !== null);
  }, [expandedIdx, setGlobalModalOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedIdx(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (expandedIdx !== null) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [expandedIdx]);

  // Listener de scroll para sincronizar la activeCard con scroll manual (dedo/mouse)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const handleScroll = () => {
      const cards = carousel.querySelectorAll("[data-card]");
      if (cards.length === 0) return;
      const cardWidth = (cards[0] as HTMLElement).offsetWidth + 24;
      const idx = Math.round(carousel.scrollLeft / cardWidth);
      setActiveCard(Math.min(idx, cards.length - 1));
    };
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  // DESKTOP: evita que el carrusel atrape la rueda del mouse.
  // Cuando el gesto es mayormente vertical, lo bloqueamos en el carrusel
  // y movemos la página manualmente. CLAVE: desactivamos temporalmente el
  // `scroll-behavior: smooth` del <html> durante el reenvío, porque ese
  // smooth peleaba con cada evento de rueda y causaba la traba.
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal → carrusel
      e.preventDefault();
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto"; // sin smooth: scroll 1:1 con la rueda
      window.scrollBy(0, e.deltaY);
      html.style.scrollBehavior = prev;
    };
    carousel.addEventListener("wheel", handleWheel, { passive: false });
    return () => carousel.removeEventListener("wheel", handleWheel);
  }, []);

  const scrollToCard = (idx: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = carousel.querySelectorAll("[data-card]");
    if (!cards[idx]) return;
    const cardWidth = (cards[0] as HTMLElement).offsetWidth + 24;
    carousel.scrollTo({ left: cardWidth * idx, behavior: "smooth" });
  };

  const scrollPrev = () => scrollToCard(Math.max(0, activeCard - 1));
  const scrollNext = () => scrollToCard(Math.min(t.experience.items.length - 1, activeCard + 1));

  const handleModalLangToggle = () => setLang(lang === "es" ? "en" : "es");

  const expandedEdu = expandedIdx !== null ? t.experience.education[expandedIdx] : null;
  const expandedLogo = expandedIdx !== null ? educationLogos[expandedIdx] : null;
  const isAtEnd = activeCard === t.experience.items.length - 1;
  const totalCards = t.experience.items.length;

  return (
    <Section id="experience" eyebrow={t.experience.eyebrow} title={t.experience.title}>
      {/* CARRUSEL DE EXPERIENCIA */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-cyan" />
            <h3 className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-fg">
              {t.experience.experienceTitle}
            </h3>
          </div>
          {/* Flechas - solo en desktop. Mobile usa swipe */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={scrollPrev} disabled={activeCard === 0} aria-label="Previous"
              className="p-2 rounded-full glass hover:shadow-glow transition-all disabled:opacity-10 disabled:cursor-not-allowed disabled:hover:shadow-none touch-manipulation">
              <ChevronLeft className="w-5 h-5 text-cyan" />
            </button>
            <button onClick={scrollNext} disabled={isAtEnd} aria-label="Next"
              className="p-2 rounded-full glass hover:shadow-glow transition-all disabled:opacity-10 disabled:cursor-not-allowed disabled:hover:shadow-none touch-manipulation">
              <ChevronRight className="w-5 h-5 text-cyan" />
            </button>
          </div>
        </div>

        {/* Scroll container:
            - DESKTOP: el handler de wheel (arriba) reenvía el gesto
              vertical a la página, así no te quedás atrapado.
            - MOBILE: touch-action "pan-x pan-y" permite AMBOS ejes; el
              navegador decide por la dirección del gesto: swipe horizontal
              mueve las tarjetas, swipe vertical baja la página. (pan-x solo
              dejaba el gesto vertical en tierra de nadie y se trababa.)
            - snap-proximity (no mandatory) → el snap no "agarra" el gesto. */}
        <div ref={carouselRef}
          className="flex gap-6 overflow-x-auto snap-x snap-proximity no-scrollbar pb-2 -mx-6 px-6 md:-mx-16 md:px-16"
          style={{
            scrollPaddingLeft: "1.5rem",
            touchAction: "pan-x pan-y",
            overscrollBehaviorX: "contain",
          }}>
          {t.experience.items.map((item, i) => (
            <motion.div
              key={item.role + item.company}
              data-card
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="snap-start shrink-0 w-[85vw] sm:w-[400px] md:w-[440px]"
            >
              <div className="glass rounded-xl p-6 h-full flex flex-col hover:shadow-glow transition-all">
                {/* Header con logo - SIN fondo blanco, transparente para PNGs */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 relative w-14 h-14 rounded-xl overflow-hidden">
                    <Image
                      src={experienceLogos[i]}
                      alt={item.company}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan/80 mb-1 font-mono">{item.period}</p>
                    <h4 className="font-display text-lg md:text-xl font-bold text-fg leading-tight">{item.role}</h4>
                    <p className="text-base text-cyan">{item.company}</p>
                  </div>
                </div>
                <p className="text-xs text-fg-muted uppercase tracking-wider mb-3">{item.type}</p>
                <p className="text-sm md:text-base text-fg-soft leading-relaxed mb-4 flex-1">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-electric/10 text-cyan border border-cyan/20">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PROGRESS BAR - puntos que se van llenando */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {t.experience.items.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`Go to experience ${i + 1}`}
              className="touch-manipulation p-1.5 group"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= activeCard
                    ? "w-10 bg-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                    : "w-2 bg-cyan/20 group-hover:bg-cyan/50"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Counter "X de N" + indicador de fin */}
        <div className="text-center mt-3">
          <p className="text-xs text-cyan/60 uppercase tracking-wider font-mono">
            {activeCard + 1} / {totalCards}
            {isAtEnd && (
              <span className="ml-3 text-cyan">
                {lang === "es" ? "— Fin —" : "— End —"}
              </span>
            )}
          </p>
        </div>

        {/* Hint de swipe solo en mobile */}
        <p className="text-center text-xs text-fg-muted mt-2 md:hidden uppercase tracking-wider">
          {lang === "es" ? "← Deslizá para ver más →" : "← Swipe to see more →"}
        </p>
      </div>

      {/* EDUCACIÓN + FORMACIÓN */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-5 h-5 text-cyan" />
            <h3 className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-fg">{t.experience.educationTitle}</h3>
          </div>
          <div className="space-y-6">
            {t.experience.education.map((item, i) => (
              <motion.div key={item.institution} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: i * 0.1 }} onClick={() => setExpandedIdx(i)} className="glass rounded-xl p-5 md:p-6 hover:shadow-glow transition-all cursor-pointer group touch-manipulation">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden">
                    <Image src={educationLogos[i]} alt={item.institution} fill sizes="80px" className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan/80 mb-2 font-mono">{item.period}</p>
                    <h4 className="font-display text-lg md:text-xl font-bold text-fg mb-1">{item.institution}</h4>
                    <p className="text-sm md:text-base text-cyan mb-3">{item.degree}</p>
                    <p className="text-sm md:text-base text-fg-soft leading-relaxed line-clamp-3">{item.desc}</p>
                    <p className="text-[10px] uppercase tracking-wider text-cyan/70 mt-3">{lang === "es" ? "Click para leer más →" : "Click to read more →"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-5 h-5 text-cyan" />
            <h3 className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-fg">{t.experience.coursesTitle}</h3>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass rounded-xl p-6">
            <ul className="space-y-4">
              {t.experience.courses.map((course, i) => (
                <motion.li key={`${course}-${i}`} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex items-start gap-3 text-sm md:text-base text-fg-soft">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0 mt-2" />
                  <span>{course}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* EDUCATION MODAL */}
      <AnimatePresence>
        {expandedEdu && expandedLogo && expandedIdx !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={() => setExpandedIdx(null)} className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md" />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-8 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="glass rounded-3xl overflow-hidden w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col pointer-events-auto shadow-glow-lg">
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-50 flex items-center gap-2">
                  <button onClick={handleModalLangToggle} className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-black/60 backdrop-blur-sm hover:bg-cyan/20 border border-white/10 transition-all touch-manipulation">
                    <Languages className="w-4 h-4 text-cyan" />
                    <span className="text-xs uppercase text-white">{lang}</span>
                  </button>
                  <button onClick={() => setExpandedIdx(null)} className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm hover:bg-cyan/20 border border-white/10 transition-all touch-manipulation">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="overflow-y-auto p-6 md:p-12">
                  <AnimatePresence mode="wait">
                    <motion.div key={`edu-${expandedIdx}-${lang}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-8 pr-24 md:pr-28">
                        <div className="shrink-0 relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden">
                          <Image src={expandedLogo} alt={expandedEdu.institution} fill sizes="112px" className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan/80 mb-2 font-mono">{expandedEdu.period}</p>
                          <h3 className="font-display text-2xl md:text-4xl font-bold text-fg mb-2 leading-tight">{expandedEdu.institution}</h3>
                          <p className="text-base md:text-lg text-cyan">{expandedEdu.degree}</p>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-6">
                        {expandedEdu.longDesc.split("\n\n").map((paragraph, idx) => {
                          const lines = paragraph.split("\n");
                          const hasBullets = paragraph.includes("•");
                          const headerLine = hasBullets ? lines[0] : null;
                          const bulletLines = hasBullets ? lines.slice(1) : lines;
                          return (
                            <div key={idx} className="mb-5 last:mb-0">
                              {headerLine && <p className="text-base md:text-lg text-cyan font-semibold mb-3">{headerLine}</p>}
                              {bulletLines.map((line, lineIdx) => (
                                <p key={lineIdx} className={`text-sm md:text-base text-fg-soft leading-relaxed ${line.startsWith("•") ? "pl-4 mb-1" : "mb-2"}`}>{line}</p>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Section>
  );
}