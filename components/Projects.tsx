"use client";

import { useState, useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation, useInView, useReducedMotion, type MotionProps } from "framer-motion";
import { Lock, X, Mail, Languages, Code2, Briefcase, ExternalLink, FileText, Crown, ArrowRight, ArrowUpRight, Rocket, ChevronDown } from "lucide-react";
/* Imágenes importadas (no la ruta como texto): el link lleva una huella del
   contenido y next/image nunca sirve una versión vieja de su caché */
import githubLogo from "@/public/logos/github.png";
import agrocowLogo from "@/public/logos/agrocow.png";
import nexstockLogo from "@/public/logos/nexstock.png";
import powerpointLogo from "@/public/logos/powerpoint.png";
import agrocowCover from "@/public/projects/Imagenes/agrocow-cover.webp";
import ziraCover from "@/public/projects/Imagenes/zira-cover.webp";
import oneiricCover from "@/public/projects/Imagenes/OneiricAi.png";
import nexstockCover from "@/public/projects/Imagenes/NexStock.webp";
import nutriopsCover from "@/public/projects/Imagenes/solver.png";
import budgentsCover from "@/public/projects/Imagenes/agents.webp";
import symbiosisCover from "@/public/projects/Imagenes/symbiosis-blur.webp";
import asesoramientosCover from "@/public/projects/Imagenes/bellido_asesoramientos_vf.png";
import importsCover from "@/public/projects/Imagenes/Imports.webp";
import Section from "./Section";
import AsesoramientoAnimation from "./AsesoramientoAnimation";
import { useHasFinePointer } from "./Magnetic";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";

const BUDGENTS_PROPOSAL_URL = "/projects/Imagenes/Budgents.pdf";
const NUTRIOPS_PROPOSAL_URL = "/projects/Imagenes/NutriOps.pdf";
const ONEIRIC_PROPOSAL_URL = "/projects/Imagenes/OneiricAi.pdf";
const IMPORTS_PROPOSAL_URL = "/projects/Imagenes/Importaciones.pdf";
const ZIRA_GITHUB_URL = "https://github.com/felipebridge/aleph-hackathon";
const ASESORAMIENTOS_FITNESS_PAGE = "/fitness";
const ASESORAMIENTOS_EDUCATION_PAGE = "/educativo";
const NEXSTOCK_PROPOSAL_PDF = "/projects/Imagenes/Propuesta - NexStock.pdf";
const NEXSTOCK_PRESENTATION_PPT = "/projects/Imagenes/Presentacion - NexStock.pdf";
const AGROCOW_GITHUB_URL = "https://github.com/Goat-Builders/agrocow";
const AGROCOW_LANDING_URL = "https://agrocow.vercel.app/#1";

// Tarjetas del modal "Mis Asesoramientos"
const SERVICE_CARD =
  "group flex flex-col overflow-hidden rounded-2xl border border-cyan/30 bg-cyan/[0.05] text-center transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-cyan/70 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan";
const SERVICE_CTA =
  "mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-electric px-5 py-2 sm:py-2.5 text-sm font-semibold text-white transition-shadow group-hover:shadow-glow";

type ProjectMeta = {
  id: string;
  image: StaticImageData;
  proposalUrl: string;
  /** Color medido del borde de la imagen (promedio del 2 % de cada lado; un
      degradé si cambia de arriba a abajo): rellena las bandas de
      object-contain y de la vista ampliada. Se vuelve a medir si cambia la imagen. */
  imageBg?: string;
  comingSoon?: boolean;
};

/** Opción del modal de "Propuesta" en los proyectos con más de un material */
type ProposalOption = { href: string; label: string; sub: string; logo?: StaticImageData; Icon?: typeof FileText };

// El orden de cada arreglo es el de la página (sus textos están en LanguageContext)
const digitalProjectsMeta: ProjectMeta[] = [
  { id: "agrocow", image: agrocowCover, proposalUrl: "", imageBg: "#17201d" },
  { id: "zira", image: ziraCover, proposalUrl: ZIRA_GITHUB_URL, imageBg: "#020203" },
  { id: "oneiric", image: oneiricCover, proposalUrl: ONEIRIC_PROPOSAL_URL, imageBg: "#05091a" },
  { id: "nexstock", image: nexstockCover, proposalUrl: "", imageBg: "#f6f8f8" },
  { id: "nutriops", image: nutriopsCover, proposalUrl: NUTRIOPS_PROPOSAL_URL, imageBg: "#edebe9" },
  { id: "budgents", image: budgentsCover, proposalUrl: BUDGENTS_PROPOSAL_URL, imageBg: "linear-gradient(#212327, #0d0e12)" },
  // Desenfocada desde el archivo: un blur de CSS había que repintarlo en cada cuadro de la entrada
  { id: "symbiosis", image: symbiosisCover, proposalUrl: "", comingSoon: true, imageBg: "linear-gradient(#161b20, #020305)" },
];

const businessProjectsMeta: ProjectMeta[] = [
  { id: "asesoramientos", image: asesoramientosCover, proposalUrl: "" },
  { id: "imports", image: importsCover, proposalUrl: IMPORTS_PROPOSAL_URL, imageBg: "#272a2c" },
];

// Logos con fondo propio: van enteros (object-contain) sobre su imageBg
const containedImageIds = ["imports", "nexstock", "oneiric"];

// Soluciones Digitales muestra estas primeras; el resto, con "Ver más proyectos"
const INITIAL_DIGITAL = 6;
const EXPAND_EASE = [0.22, 1, 0.36, 1] as const;

/* Filas de tarjetas: carrusel en el celular, grilla desde md.
   overflow-y-hidden + pb-8 -mb-6: la fila nunca scrollea en vertical (si no,
   mientras las tarjetas entran con y: 24 el gesto del dedo se quedaba en la
   fila). scroll-pl-* = px-*: el snap alinea cada tarjeta con el margen. */
const CARD_ROW =
  "flex gap-6 overflow-x-auto overflow-y-hidden snap-x snap-proximity no-scrollbar pb-8 -mb-6 -mx-5 px-5 scroll-pl-5 sm:-mx-6 sm:px-6 sm:scroll-pl-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible";
const DIGITAL_ROW = `${CARD_ROW} lg:grid-cols-3`;
const CARD_CELL = "snap-start shrink-0 flex w-[80vw] max-w-[420px] sm:w-[420px] md:w-auto md:max-w-none md:shrink";
/* Ancho real de la imagen de cada fila (sección max-w-7xl con px-16 desde md,
   gap de 24 px), para que el navegador baje una versión que no tenga que estirar */
const DIGITAL_SIZES = "(max-width: 639px) 80vw, (max-width: 767px) 420px, (max-width: 1023px) calc(50vw - 75px), (max-width: 1407px) calc(33.4vw - 58px), 411px";
const BUSINESS_SIZES = "(max-width: 639px) 80vw, (max-width: 767px) 420px, (max-width: 1407px) calc(50vw - 75px), 628px";

function RichDescription({ text }: { text: string }) {
  return (
    <div className="mb-8 space-y-5">
      {text.split("\n\n").map((paragraph, idx) => {
        const lines = paragraph.split("\n");
        const hasBullets = paragraph.includes("•");
        const headerLine = hasBullets ? lines[0] : null;
        const contentLines = hasBullets ? lines.slice(1) : lines;
        return (
          <div key={idx}>
            {headerLine && <p className="text-base md:text-lg text-cyan font-semibold mb-3">{headerLine}</p>}
            {contentLines.map((line, lineIdx) => (
              <p key={lineIdx} className={`text-sm md:text-base text-fg leading-relaxed ${line.startsWith("•") ? "pl-4 mb-1.5" : "mb-2"}`}>{line}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* Con onOptionsClick, "Propuesta" abre el modal para elegir material; si no,
   abre su link directo */
function ProposalButton({ projectId, url, lang, onAsesoramientosClick, onOptionsClick }: { projectId: string; url: string; lang: string; onAsesoramientosClick: () => void; onOptionsClick?: () => void }) {
  const label = lang === "es" ? "Propuesta" : "Proposal";
  const isAsesoramientos = projectId === "asesoramientos";
  const hasUrl = isAsesoramientos || !!onOptionsClick || url !== "";
  if (!hasUrl) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAsesoramientos) onAsesoramientosClick();
    else if (onOptionsClick) onOptionsClick();
    else window.open(url, "_blank");
  };

  if (isAsesoramientos) return <AsesoramientosProposalButton label={label} onClick={handleClick} />;

  return (
    <button onClick={handleClick}
      className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-electric/20 backdrop-blur-sm text-cyan border border-cyan/40 text-xs can-hover:hover:bg-electric/40 transition-all touch-manipulation">
      <FileText className="relative w-3.5 h-3.5" />
      <span className="relative">{label}</span>
      <ExternalLink className="relative w-3 h-3" />
    </button>
  );
}

/* La única propuesta destacada: relleno sólido (texto blanco 4,8:1 en oscuro
   y 7,1:1 en claro), brillo y halo cada ~4 s. Brillo y halo corren solo con el
   botón en pantalla y nunca con "reducir movimiento". Flecha y no link
   externo: abre un modal. */
function AsesoramientosProposalButton({ label, onClick }: { label: string; onClick: (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref);
  const reduced = !!useReducedMotion();
  // Escala solo con mouse: en el celular el toque la dejaba pegada
  const fine = useHasFinePointer();
  const shimmer = !reduced;
  return (
      <div className="absolute top-3 right-3 z-30">
        {shimmer && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-electric"
            initial={{ opacity: 0, scale: 1 }}
            animate={inView ? { opacity: [0.6, 0], scale: [1, 1.3] } : { opacity: 0, scale: 1 }}
            transition={inView ? { duration: 1.6, ease: "easeOut", repeat: Infinity, repeatDelay: 2.4 } : { duration: 0 }}
          />
        )}
        <motion.button ref={ref} onClick={onClick}
          whileHover={fine && !reduced ? { scale: 1.04 } : undefined}
          whileTap={fine ? { scale: 0.97 } : undefined}
          transition={{ duration: 0.2, ease: "easeOut" }}
          // transition-all animaría también el transform que maneja Framer
          className="relative overflow-hidden flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full bg-electric text-white text-xs font-semibold border border-white/25 shadow-[0_6px_20px_-6px_rgb(var(--accent-electric)/0.9)] can-hover:hover:shadow-glow can-hover:hover:brightness-110 transition-[box-shadow,filter] duration-200 touch-manipulation">
          {shimmer && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: "-150%" }}
              animate={inView ? { x: "250%" } : { x: "-150%" }}
              transition={inView ? { duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6 } : { duration: 0 }}
            />
          )}
          <FileText className="relative w-3.5 h-3.5" aria-hidden="true" />
          <span className="relative">{label}</span>
          <ArrowRight className="relative w-3.5 h-3.5" aria-hidden="true" />
        </motion.button>
      </div>
  );
}

export default function Projects() {
  const { t, lang, setLang } = useLanguage();
  const { setModalOpen: setGlobalModalOpen } = useModal();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [canvaModalOpen, setCanvaModalOpen] = useState(false);
  /** Proyecto con el modal de opciones de "Propuesta" abierto */
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const optionsCloseRef = useRef<HTMLButtonElement>(null);
  const [clicked, setClicked] = useState(false);
  const [email, setEmail] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const lockControls = useAnimation();
  /* "Ver más proyectos": renderRest mantiene montadas las tarjetas extra hasta
     que termina de cerrarse; restSettled deja el overflow visible cuando
     terminó de abrirse (hidden recortaría el brillo de hover). */
  const [showAllDigital, setShowAllDigital] = useState(false);
  const [renderRest, setRenderRest] = useState(false);
  const [restSettled, setRestSettled] = useState(false);
  const reducedMotion = !!useReducedMotion();
  const toggleDigital = () => {
    if (showAllDigital) {
      setRestSettled(false);
      setShowAllDigital(false);
    } else {
      setRenderRest(true);
      setShowAllDigital(true);
    }
  };
  /* Las imágenes se piden cuando la sección está a 800 px (con lazy solo, las
     del carrusel a la derecha llegaban tarde). Acá no va estado que cambie al
     scrollear: re-dibujaría todas las tarjetas mientras entran (eso vive en
     ProjectCard y LockPulse). */
  const gridRef = useRef<HTMLDivElement>(null);
  const gridNear = useInView(gridRef, { once: true, margin: "800px 0px 800px 0px" });

  const projectContentMap: Record<string, typeof t.projects.oneiric> = {
    agrocow: t.projects.agrocow,
    symbiosis: t.projects.symbiosis,
    zira: t.projects.zira,
    oneiric: t.projects.oneiric,
    nexstock: t.projects.nexstock,
    nutriops: t.projects.nutriops,
    budgents: t.projects.budgents,
    imports: t.projects.imports,
    asesoramientos: t.projects.asesoramientos,
  };
  const digitalProjects = digitalProjectsMeta.map((meta) => ({ ...meta, ...projectContentMap[meta.id] }));
  const businessProjects = businessProjectsMeta.map((meta) => ({ ...meta, ...projectContentMap[meta.id] }));
  const allProjects = [...digitalProjects, ...businessProjects];

  // Proyectos con más de un material: "Propuesta" abre un modal para elegir
  const proposalOptions: Record<string, { title: string; options: ProposalOption[] }> = {
    agrocow: {
      title: "AgroCow",
      options: [
        { href: AGROCOW_LANDING_URL, label: "Landing Page", sub: lang === "es" ? "Presentación del pitch" : "Pitch presentation", logo: agrocowLogo },
        { href: AGROCOW_GITHUB_URL, label: lang === "es" ? "Repositorio en GitHub" : "GitHub repository", sub: lang === "es" ? "Código y documentación" : "Code and documentation", logo: githubLogo },
      ],
    },
    nexstock: {
      title: "NexStock",
      options: [
        { href: NEXSTOCK_PROPOSAL_PDF, label: lang === "es" ? "Propuesta formal" : "Formal proposal", sub: lang === "es" ? "Documento · PDF" : "Document · PDF", logo: nexstockLogo },
        { href: NEXSTOCK_PRESENTATION_PPT, label: lang === "es" ? "Presentación" : "Presentation", sub: lang === "es" ? "Diapositivas · PDF" : "Slides · PDF", logo: powerpointLogo },
      ],
    },
  };
  const optionsProject = optionsFor ? proposalOptions[optionsFor] : undefined;

  useEffect(() => {
    setGlobalModalOpen(expandedId !== null || emailModalOpen || canvaModalOpen || optionsFor !== null);
  }, [expandedId, emailModalOpen, canvaModalOpen, optionsFor, setGlobalModalOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setExpandedId(null); setEmailModalOpen(false); setCanvaModalOpen(false); setOptionsFor(null); }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (expandedId || emailModalOpen || canvaModalOpen || optionsFor) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [expandedId, emailModalOpen, canvaModalOpen, optionsFor]);

  /* Modal de opciones: el foco va al botón de cerrar al abrir y vuelve a
     "Propuesta" al cerrar (teclado y lectores de pantalla) */
  useEffect(() => {
    if (!optionsFor) return;
    const opener = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => optionsCloseRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      opener?.focus?.();
    };
  }, [optionsFor]);

  const handleLockClick = async () => {
    setClicked(true);
    await lockControls.start({ rotate: [0, -8, 8, -8, 8, -4, 4, 0], scale: [1, 1.1, 1.1, 1.1, 1.1, 1.05, 1.05, 1], transition: { duration: 0.5 } });
    setTimeout(() => { setEmailModalOpen(true); setClicked(false); }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const subject = encodeURIComponent("Interesado en Symbiosis AI");
    const body = encodeURIComponent(`Hola Matías,\n\nMe gustaría recibir novedades sobre Symbiosis AI.\n\nMi email: ${email}\n\nGracias!`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=rbellidomatias@gmail.com&su=${subject}&body=${body}`, "_blank");
    setTimeout(() => { setEmailModalOpen(false); setEmail(""); }, 500);
  };

  const handleModalLangToggle = () => setLang(lang === "es" ? "en" : "es");
  const expandedProject = allProjects.find((p) => p.id === expandedId);

  /* Celda de la fila (flex: todas las tarjetas de una fila quedan del mismo
     alto). data-step-row: parada de la navegación con flechas (SectionStepper) */
  const renderCard = (project: (typeof allProjects)[number], i: number, sizes: string) => (
    <div key={project.id} data-step-row="" className={CARD_CELL}>
      <ProjectCard
        project={project}
        index={i}
        onClick={project.id === "symbiosis" ? handleLockClick : () => setExpandedId(project.id)}
        lang={lang}
        onAsesoramientosClick={() => setCanvaModalOpen(true)}
        onOptionsClick={proposalOptions[project.id] ? () => setOptionsFor(project.id) : undefined}
        lockControls={project.id === "symbiosis" ? lockControls : undefined}
        locked={project.id === "symbiosis" ? clicked : undefined}
        eager={gridNear}
        sizes={sizes}
      />
    </div>
  );

  const swipeHint = (
    <p className="text-center text-xs text-fg-muted mt-3 md:hidden uppercase tracking-wider">
      {lang === "es" ? "← Deslizá para ver más →" : "← Swipe to see more →"}
    </p>
  );

  return (
    <Section id="projects" eyebrow={t.projects.eyebrow} title={t.projects.title}>
      <div ref={gridRef} className="mb-16">
        <div className="flex items-start gap-3 mb-8">
          <Code2 className="w-5 h-5 shrink-0 mt-0.5 sm:mt-1 text-cyan" />
          <h3 className="font-display text-base sm:text-lg font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-fg">{t.projects.digitalSubtitle}</h3>
        </div>
        <div data-carousel-row="" className={DIGITAL_ROW}>
          {digitalProjects.slice(0, INITIAL_DIGITAL).map((project, i) => renderCard(project, i, DIGITAL_SIZES))}
        </div>
        {swipeHint}

        {/* El resto se despliega debajo de la fila, también en el celular (al
            final del carrusel no se vería aparecer). El contenedor existe
            siempre para que aria-controls apunte a algo. */}
        {digitalProjects.length > INITIAL_DIGITAL && (
          <>
            <motion.div
              id="projects-digital-more"
              initial={false}
              animate={{ height: showAllDigital ? "auto" : 0, opacity: showAllDigital ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, ease: EXPAND_EASE }}
              onAnimationComplete={() => {
                if (showAllDigital) setRestSettled(true);
                else setRenderRest(false);
              }}
              style={{ overflow: restSettled ? "visible" : "hidden" }}
            >
              {renderRest && (
                <div data-carousel-row="" className={`${DIGITAL_ROW} pt-6`}>
                  {digitalProjects.slice(INITIAL_DIGITAL).map((project, i) => renderCard(project, INITIAL_DIGITAL + i, DIGITAL_SIZES))}
                </div>
              )}
            </motion.div>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={toggleDigital}
                aria-expanded={showAllDigital}
                aria-controls="projects-digital-more"
                className="group inline-flex h-11 items-center gap-3 rounded-full glass pl-5 pr-2 text-sm font-semibold text-fg-soft transition-[color,box-shadow] duration-200 can-hover:hover:text-cyan can-hover:hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan touch-manipulation"
              >
                {showAllDigital ? (lang === "es" ? "Ver menos proyectos" : "Show fewer projects") : lang === "es" ? "Ver más proyectos" : "Show more projects"}
                <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-cyan/10 text-cyan">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      showAllDigital ? "rotate-180" : "motion-safe:animate-[bounce_2.4s_ease-in-out_infinite]"
                    }`}
                  />
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* data-step: parada de la navegación con flechas (SectionStepper) */}
      <div data-step="">
        <div className="flex items-start gap-3 mb-8">
          <Briefcase className="w-5 h-5 shrink-0 mt-0.5 sm:mt-1 text-cyan" />
          <h3 className="font-display text-base sm:text-lg font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-fg">{t.projects.businessSubtitle}</h3>
        </div>
        <div data-carousel-row="" className={CARD_ROW}>
          {businessProjects.map((project, i) => renderCard(project, i, BUSINESS_SIZES))}
        </div>
        {swipeHint}
      </div>

      <AnimatePresence>
        {expandedProject && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExpandedId(null)} className="fixed inset-0 z-[60] modal-overlay" />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-8 pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ duration: 0.35 }}
                className="relative modal-surface rounded-3xl overflow-hidden w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] flex flex-col pointer-events-auto">
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-50 flex items-center gap-2">
                  <button onClick={handleModalLangToggle} className="flex items-center gap-1.5 px-3 py-2.5 rounded-full glass hover:bg-cyan/20 transition-all touch-manipulation">
                    <Languages className="w-4 h-4 text-cyan" />
                    <span className="text-xs uppercase text-fg">{lang}</span>
                  </button>
                  <button onClick={() => setExpandedId(null)} aria-label={lang === "es" ? "Cerrar" : "Close"} className="p-2.5 rounded-full glass hover:bg-cyan/20 transition-all touch-manipulation">
                    <X className="w-5 h-5 text-fg" aria-hidden="true" />
                  </button>
                </div>
                {/* Enfocable: sin links adentro, es la única forma de bajar con el teclado */}
                <div tabIndex={0} aria-label={expandedProject.title} className="overflow-y-auto focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan">

                  <div className="relative w-full aspect-video max-h-[70vh] overflow-hidden flex items-center justify-center" style={{ background: expandedProject.imageBg ?? "#000000" }}>
                    <Image src={expandedProject.image} alt={expandedProject.title} fill quality={90} sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain" priority />
                  </div>
                  <div className="p-6 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div key={`${expandedProject.id}-${lang}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan mb-4">{expandedProject.date} - {expandedProject.category}</p>
                        <h3 className="font-display text-3xl md:text-5xl font-bold mb-3 gradient-text">{expandedProject.title}</h3>
                        {(expandedProject.role || expandedProject.badge) && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {expandedProject.role && (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan/15 to-electric/10 border border-cyan/30">
                                <Crown className="w-3.5 h-3.5 text-cyan" strokeWidth={2} />
                                <span className="text-xs font-semibold uppercase tracking-wider text-cyan">{expandedProject.role}</span>
                              </div>
                            )}
                            {expandedProject.badge && (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan/15 to-electric/10 border border-cyan/30">
                                <Rocket className="w-3.5 h-3.5 text-cyan" strokeWidth={2} aria-hidden="true" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-cyan">{expandedProject.badge}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <RichDescription text={expandedProject.desc} />
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-cyan/20">
                          {expandedProject.tags.map((tag: string) => <span key={tag} className="text-xs px-4 py-2 rounded-full bg-electric/10 text-cyan border border-cyan/30">{tag}</span>)}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emailModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEmailModalOpen(false)} className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="relative modal-surface rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-glow-lg">
              <button onClick={() => setEmailModalOpen(false)} aria-label={lang === "es" ? "Cerrar" : "Close"} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-fg-soft" aria-hidden="true" /></button>
              <div className="flex justify-center mb-4"><Lock className="w-12 h-12 text-cyan" strokeWidth={1.5} /></div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-2 text-cyan">{t.projects.modal.title}</h3>
              <p className="text-center text-fg-soft text-sm mb-6">{t.projects.modal.desc}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.projects.modal.placeholder} required className="w-full px-4 py-3 rounded-full bg-white/5 border border-cyan/20 text-fg placeholder:text-fg-faint focus:outline-none focus:border-cyan/60" />
                <button type="submit" className="w-full px-6 py-3 rounded-full bg-electric text-white font-medium hover:shadow-glow transition-all flex items-center justify-center gap-2 touch-manipulation">
                  <Mail className="w-4 h-4" />{t.projects.modal.button}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canvaModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCanvaModalOpen(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", duration: 0.5 }} onClick={(e) => e.stopPropagation()}
              className="relative modal-surface rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-glow-lg">
              <button onClick={() => setCanvaModalOpen(false)} aria-label={lang === "es" ? "Cerrar" : "Close"} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-fg-soft" /></button>
              {/* modal-surface (opaco): el vidrio quedaba gris en tema claro y el texto no se leía. px-10: no choca con la X */}
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 px-8 sm:px-10 text-cyan">{lang === "es" ? "Mis Asesoramientos" : "My Services"}</h3>
              {/* En el celular la franja de la animación (.service-band) se achica para que entren las dos tarjetas */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {/* Cierra el modal al navegar: si no, quedan el scroll trabado y el Header oculto */}
                <Link href={ASESORAMIENTOS_FITNESS_PAGE} onClick={() => setCanvaModalOpen(false)} className={SERVICE_CARD}>
                  <div aria-hidden="true" className="service-band relative overflow-hidden bg-[#05070D] bg-[radial-gradient(circle_at_50%_55%,rgb(34_211_238/0.14),transparent_65%)]">
                    <AsesoramientoAnimation variant="fitness" className="absolute inset-0 h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col items-center px-5 pb-4 pt-3 sm:pb-5 sm:pt-4">
                    <p className="font-display text-lg sm:text-xl font-bold text-fg">{lang === "es" ? "Asesoramientos Fitness" : "Fitness Coaching"}</p>
                    <p className="mt-0.5 mb-3 sm:mt-1 sm:mb-4 text-sm text-fg-muted">{lang === "es" ? "Ver planes y cómo trabajo" : "See plans and how I work"}</p>
                    <span className={SERVICE_CTA}>
                      {lang === "es" ? "Ver la página" : "Open the page"}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
                <Link href={ASESORAMIENTOS_EDUCATION_PAGE} onClick={() => setCanvaModalOpen(false)} className={SERVICE_CARD}>
                  <div aria-hidden="true" className="service-band relative overflow-hidden bg-[#05070D] bg-[radial-gradient(circle_at_50%_55%,rgb(34_211_238/0.14),transparent_65%)]">
                    <AsesoramientoAnimation variant="educativo" className="absolute inset-0 h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col items-center px-5 pb-4 pt-3 sm:pb-5 sm:pt-4">
                    <p className="font-display text-lg sm:text-xl font-bold text-fg">{lang === "es" ? "Asesoramientos Educativos" : "Educational Tutoring"}</p>
                    <p className="mt-0.5 mb-3 sm:mt-1 sm:mb-4 text-sm text-fg-muted">{lang === "es" ? "Ver packs y cómo trabajo" : "See packs and how I work"}</p>
                    <span className={SERVICE_CTA}>
                      {lang === "es" ? "Ver la página" : "Open the page"}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de opciones de "Propuesta": alto máximo de la pantalla con scroll interno */}
      <AnimatePresence>
        {optionsProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOptionsFor(null)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="proposal-options-title"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative modal-surface rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-glow-lg"
            >
              <button ref={optionsCloseRef} onClick={() => setOptionsFor(null)} aria-label={lang === "es" ? "Cerrar" : "Close"} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors touch-manipulation"><X className="w-5 h-5 text-fg-soft" aria-hidden="true" /></button>
              <h3 id="proposal-options-title" className="font-display text-2xl md:text-3xl font-bold text-center mb-2 px-8 text-cyan">{optionsProject.title}</h3>
              <p className="text-center text-fg-soft text-sm mb-6">{lang === "es" ? "Accedé a los materiales del proyecto:" : "Access the project materials:"}</p>
              <div className="space-y-3">
                {optionsProject.options.map(({ href, label, sub, logo, Icon }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    className="group flex min-h-[68px] items-center gap-3.5 rounded-2xl border border-cyan/20 bg-cyan/[0.04] px-3.5 py-3 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out can-hover:hover:-translate-y-0.5 can-hover:hover:border-cyan/50 can-hover:hover:bg-cyan/[0.08] can-hover:hover:shadow-glow active:scale-[0.98] motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan touch-manipulation">
                    {logo ? (
                      <Image src={logo} alt="" width={88} height={88} className="h-11 w-11 shrink-0 rounded-full shadow-[0_2px_8px_rgb(0_0_0/0.3)]" />
                    ) : (
                      Icon && (
                        <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan/15">
                          <Icon className="h-5 w-5 text-cyan" />
                        </span>
                      )
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-tight text-fg">{label}</p>
                      <p className="mt-0.5 text-xs text-fg-muted">{sub}</p>
                    </div>
                    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan/10 text-fg-muted transition-colors can-hover:group-hover:bg-cyan/20 can-hover:group-hover:text-cyan">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                    <span className="sr-only">{lang === "es" ? "(se abre en otra pestaña)" : "(opens in a new tab)"}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

type ProjectCardProps = {
  project: {
    id: string;
    image: StaticImageData;
    date: string;
    category: string;
    title: string;
    role?: string;
    badge?: string;
    desc: string;
    tags: string[];
    proposalUrl: string;
    imageBg?: string;
    comingSoon?: boolean;
    comingSoonLabel?: string;
    clickHint?: string;
  };
  index: number;
  onClick: () => void;
  lang: string;
  onAsesoramientosClick: () => void;
  /** "Propuesta" abre el modal para elegir material */
  onOptionsClick?: () => void;
  /** Solo Symbiosis: animación del candado del ribbon */
  lockControls?: ReturnType<typeof useAnimation>;
  /** Solo Symbiosis: flash rojo mientras se "desbloquea" */
  locked?: boolean;
  /** La sección ya está cerca: la imagen se pide ya (si no, lazy) */
  eager?: boolean;
  /** Atributo sizes de la imagen: el ancho real de la tarjeta en su fila */
  sizes: string;
};

/* Entrada de las tarjetas: arranca un poco antes de entrar (15 % abajo), con
   demora por columna y no por posición, y solo opacity/transform. En el
   carrusel del celular entran todas cuando entra la FILA: el carrusel recorta
   las de los costados y el IntersectionObserver las ve ocultas. */
const CARD_VIEWPORT = { once: true, margin: "0px 0px 15% 0px" } as const;

/* ¿La grilla es el carrusel del celular (menos de md)? */
function useIsCarousel() {
  const [carousel, setCarousel] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setCarousel(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCarousel(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return carousel;
}

/* En el carrusel: ¿ya entró la fila de esta tarjeta (data-carousel-row)?
   Solo observa en el carrusel; en la grilla de escritorio no hace nada. */
function useRowShown(cardRef: React.RefObject<HTMLElement>, active: boolean) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active || shown) return;
    const row = cardRef.current?.closest("[data-carousel-row]");
    if (!row || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px 15% 0px" },
    );
    io.observe(row);
    return () => io.disconnect();
  }, [active, shown, cardRef]);
  return shown;
}

/* Candado del ribbon de Symbiosis: late solo en pantalla y nunca con "reducir
   movimiento". Componente propio para que entrar y salir de pantalla
   re-dibuje solo el ícono. El sacudón del clic usa los mismos controles. */
function LockPulse({ controls, locked }: { controls: ReturnType<typeof useAnimation>; locked?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const reduced = !!useReducedMotion();
  useEffect(() => {
    if (locked) return;
    if (inView && !reduced) controls.start({ scale: [1, 1.08, 1], rotate: 0, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } });
    else {
      controls.stop();
      controls.set({ scale: 1, rotate: 0 });
    }
  }, [controls, locked, inView, reduced]);
  return (
    <motion.span ref={ref} animate={controls} className="flex">
      <Lock className={`w-3.5 h-3.5 ${locked ? "text-red-500" : "text-cyan"}`} />
    </motion.span>
  );
}

function ProjectCard({ project, index, onClick, lang, onAsesoramientosClick, onOptionsClick, lockControls, locked, eager, sizes }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const isCarousel = useIsCarousel();
  const rowShown = useRowShown(cardRef, isCarousel);
  const motionProps: MotionProps = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    animate: isCarousel && rowShown ? { opacity: 1, y: 0 } : undefined,
    viewport: CARD_VIEWPORT,
    transition: { duration: 0.4, ease: "easeOut", delay: (index % 3) * 0.06 },
  };
  const containedImage = containedImageIds.includes(project.id);
  return (
    <motion.article ref={cardRef} {...motionProps} onClick={onClick}
      className="relative glass rounded-2xl overflow-hidden flex flex-col group flex-1 w-full cursor-pointer can-hover:hover:shadow-glow transition-shadow touch-manipulation">
      <ProposalButton projectId={project.id} url={project.proposalUrl} lang={lang} onAsesoramientosClick={onAsesoramientosClick} onOptionsClick={onOptionsClick} />

      {project.comingSoon && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur-sm text-cyan border border-cyan/40 text-xs">
          {lockControls && <LockPulse controls={lockControls} locked={locked} />}
          <span className="uppercase tracking-wider">{project.comingSoonLabel}</span>
        </div>
      )}

      <div
        className="relative aspect-[16/9] overflow-hidden flex items-center justify-center"
        style={{ background: project.imageBg ?? "#000000" }}
      >
        {/* quality 90: con menos, el AVIF (Next lo codifica a quality − 15) ablanda el texto de los logos */}
        <Image src={project.image} alt={project.title} fill quality={90} loading={eager ? "eager" : "lazy"} sizes={sizes}
          className={`${containedImage ? "object-contain" : "object-cover"} transition-transform duration-700 can-hover:group-hover:scale-105`} />
        {/* Degradé solo sobre las imágenes cover: sobre las contain se vería como una sombra gris */}
        {!containedImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-fg-muted mb-2">{project.date} - {project.category}</p>
        <h3 className="font-display text-xl font-bold mb-2 text-cyan">{project.title}</h3>
        {project.role && (
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan/15 to-electric/10 border border-cyan/30 mb-3">
            <Crown className="w-3 h-3 text-cyan" strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan">{project.role}</span>
          </div>
        )}
        {project.badge && (
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan/15 to-electric/10 border border-cyan/30 mb-3">
            <Rocket className="w-3 h-3 text-cyan" strokeWidth={2} aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan">{project.badge}</span>
          </div>
        )}
        {/* Sin flex-1: estirada con la fila mostraba texto debajo de los "…".
            mt-auto en los tags los alinea abajo en toda la fila */}
        <p className="text-sm text-fg-soft leading-relaxed mb-4 line-clamp-3">{project.desc}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-white/5">
          {project.tags.map((tag) => <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-electric/10 text-cyan border border-cyan/20">{tag}</span>)}
        </div>

        <p className="text-[10px] uppercase tracking-wider text-cyan/70 mt-3">{project.clickHint ?? (lang === "es" ? "Click para leer más →" : "Click to read more →")}</p>
      </div>
    </motion.article>
  );
}