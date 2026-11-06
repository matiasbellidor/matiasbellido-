"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation, useInView, useReducedMotion, type MotionProps } from "framer-motion";
import { Lock, X, Mail, Languages, Code2, Briefcase, ExternalLink, FileText, Crown, GitBranch, Newspaper, ArrowRight } from "lucide-react";
import Section from "./Section";
import AsesoramientoAnimation from "./AsesoramientoAnimation";
import { useHasFinePointer } from "./Magnetic";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";

// ============================================================================
// PROPOSAL/RESUMEN LINKS — completá manualmente las URLs faltantes
// ============================================================================
const BUDGENTS_PROPOSAL_URL = "/projects/Imagenes/Budgents.pdf";
const NUTRIOPS_PROPOSAL_URL = "/projects/Imagenes/NutriOps.pdf";
const ONEIRIC_PROPOSAL_URL = "/projects/Imagenes/OneiricAi.pdf";
const IMPORTS_PROPOSAL_URL = "/projects/Imagenes/Importaciones.pdf";
// Fitness ya no abre el PDF: lleva a la landing propia (app/fitness)
const ASESORAMIENTOS_FITNESS_PAGE = "/fitness";
const ASESORAMIENTOS_EDUCATION_URL = "/projects/Imagenes/Bellido-Asesoramientos-Educativo.pdf";

// Tarjetas del modal "Mis Asesoramientos": las dos con la misma forma, centradas
const SERVICE_CARD =
  "group flex flex-col overflow-hidden rounded-2xl border border-cyan/30 bg-cyan/[0.05] text-center transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-cyan/70 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan";
const SERVICE_CTA =
  "mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-electric px-5 py-2 sm:py-2.5 text-sm font-semibold text-white transition-shadow group-hover:shadow-glow";

// NexStock (BootCamp ITBA) — el botón "Propuesta" abre un modal con estos dos archivos
const NEXSTOCK_PROPOSAL_PDF = "/projects/Imagenes/Propuesta - NexStock.pdf";
const NEXSTOCK_PRESENTATION_PPT = "/projects/Imagenes/Presentacion - NexStock.pdf";

// ZIRA — repo del hackathon. El botón "Propuesta" de la card abre este link
// directamente (mismo mecanismo que usan las demás cards, sin componente
// especial). Si más adelante querés sumar también un link de review/post,
// completá ZIRA_REVIEW_URL.
const ZIRA_GITHUB_URL = "https://github.com/felipebridge/aleph-hackathon";
const ZIRA_REVIEW_URL = ""; // TODO: pegar la URL del post/review

// ============================================================================
// DOS CATEGORÍAS — "Soluciones Digitales & IA" y "Operaciones de Negocio".
// Symbiosis y ZIRA viven en Digital, como cards ESTÁNDAR (mismo componente,
// tamaño y aspect-ratio que el resto) — NO vuelven al layout hero/vertical
// viejo solo por ir primeras en la categoría. Para agregar un proyecto
// nuevo, solo hay que sumar un objeto al array correspondiente + su entrada
// en LanguageContext.tsx — el grid de esa categoría se reacomoda solo.
// ============================================================================
const digitalProjectsMeta = [
  /* imageBg = el color del borde de cada imagen (promedio del 2 % de cada lado,
     medido con Pillow el 2026-11-06), así las bandas que quedan alrededor
     (tarjetas con object-contain, la vista ampliada, el halo del desenfoque)
     se funden con la imagen. Si el borde cambia de arriba a abajo, va un
     degradé con esos dos colores. Si cambiás una imagen, volvé a medirlo. */
  { id: "symbiosis", image: "/projects/Imagenes/symbiosis.webp", proposalUrl: "", comingSoon: true, imageBg: "linear-gradient(#161b20, #020305)" },
  { id: "zira", image: "/projects/Imagenes/zira-cover.webp", proposalUrl: ZIRA_GITHUB_URL, links: { github: "", review: ZIRA_REVIEW_URL }, imageBg: "#020203" },
  { id: "oneiric", image: "/projects/Imagenes/OneiricAi.png", proposalUrl: ONEIRIC_PROPOSAL_URL, imageBg: "#05091a" },
  { id: "nutriops", image: "/projects/Imagenes/solver.png", proposalUrl: NUTRIOPS_PROPOSAL_URL, imageBg: "#edebe9" },
  { id: "nexstock", image: "/projects/Imagenes/NexStock.webp", proposalUrl: "", imageBg: "#f6f8f8" },
  { id: "budgents", image: "/projects/Imagenes/agents.webp", proposalUrl: BUDGENTS_PROPOSAL_URL, imageBg: "linear-gradient(#212327, #0d0e12)" },
];

// Bellido Asesoramientos va primero (pedido de Matías, 2026-11-06)
const businessProjectsMeta = [
  { id: "asesoramientos", image: "/projects/Imagenes/asesoramientos.webp", proposalUrl: "" },
  { id: "imports", image: "/projects/Imagenes/Imports.webp", proposalUrl: IMPORTS_PROPOSAL_URL, imageBg: "#272a2c" },
];

// Proyectos cuya imagen es un mockup/logo con fondo propio → object-contain.
// Si zira-cover.png es una captura de pantalla full-bleed, dejalo cover
// (no lo agregues acá). Si en cambio es un logo/mockup con fondo, sumá
// "zira" a este array.
const containedImageIds = ["imports", "nexstock", "oneiric"];

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

function ProposalButton({ projectId, url, lang, onAsesoramientosClick, onNexstockClick }: { projectId: string; url: string; lang: string; onAsesoramientosClick: () => void; onNexstockClick?: () => void }) {
  const label = lang === "es" ? "Propuesta" : "Proposal";
  const isAsesoramientos = projectId === "asesoramientos";
  const isNexstock = projectId === "nexstock";
  const hasUrl = isAsesoramientos || isNexstock || url !== "";

  /* Bellido Asesoramientos es la propuesta distinta (lleva a sus servicios y
     a la landing de /fitness): Matías pidió que se note sí o sí, sin molestar.
     Por eso es la única con relleno sólido del color de acción (texto blanco:
     4,8:1 en oscuro y 7,1:1 en claro), sombra de color, el brillo que la
     recorre y un halo que se expande y se desvanece cada ~4 s. El brillo y el
     halo corren solo con el botón en pantalla y se apagan con "reducir
     movimiento". Flecha en vez de link externo: abre un modal, no otra pestaña. */
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref);
  const reduced = !!useReducedMotion();
  /* En el celular la tarjeta queda quieta al tocarla: sin escala de Framer
     ni :hover pegado (pedido de Matías: el scroll se trababa sobre las tarjetas) */
  const fine = useHasFinePointer();
  const shimmer = isAsesoramientos && !reduced;
  if (!hasUrl) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAsesoramientos) onAsesoramientosClick();
    else if (isNexstock) onNexstockClick?.();
    else window.open(url, "_blank");
  };

  if (isAsesoramientos) {
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
        <motion.button ref={ref} onClick={handleClick}
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

  // El resto de las propuestas: el estilo de siempre (translúcido, con borde) y link externo
  return (
    <button onClick={handleClick}
      className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-electric/20 backdrop-blur-sm text-cyan border border-cyan/40 text-xs can-hover:hover:bg-electric/40 transition-all touch-manipulation">
      <FileText className="relative w-3.5 h-3.5" />
      <span className="relative">{label}</span>
      <ExternalLink className="relative w-3 h-3" />
    </button>
  );
}

export default function Projects() {
  const { t, lang, setLang } = useLanguage();
  const { setModalOpen: setGlobalModalOpen } = useModal();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [canvaModalOpen, setCanvaModalOpen] = useState(false);
  const [nexstockModalOpen, setNexstockModalOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [email, setEmail] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const lockControls = useAnimation();

  const projectContentMap: Record<string, typeof t.projects.oneiric> = {
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

  useEffect(() => {
    setGlobalModalOpen(expandedId !== null || emailModalOpen || canvaModalOpen || nexstockModalOpen);
  }, [expandedId, emailModalOpen, canvaModalOpen, nexstockModalOpen, setGlobalModalOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setExpandedId(null); setEmailModalOpen(false); setCanvaModalOpen(false); setNexstockModalOpen(false); }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (expandedId || emailModalOpen || canvaModalOpen || nexstockModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [expandedId, emailModalOpen, canvaModalOpen, nexstockModalOpen]);

  useEffect(() => {
    if (!clicked) lockControls.start({ scale: [1, 1.08, 1], rotate: 0, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } });
  }, [clicked, lockControls]);

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

  return (
    <Section id="projects" eyebrow={t.projects.eyebrow} title={t.projects.title}>
      {/* CATEGORÍA: Soluciones Digitales & IA — incluye Symbiosis y ZIRA,
          ambas como cards ESTÁNDAR (mismo componente/tamaño que el resto).
          Grid responsive: mobile = carrusel horizontal (scroll-snap);
          md+ = grid que wrappea en 2 columnas, lg: 3 columnas.
          El wrapper de cada tarjeta es flex: la tarjeta se estira y todas
          quedan del mismo alto (en el carrusel y en cada fila del grid).
          Scroll en el celular (bug: el gesto vertical se trababa sobre las
          tarjetas): las que están a la derecha no "entran" en pantalla y
          quedaban con la entrada pendiente (y: 30), así que la fila podía
          scrollear 22 px en vertical y el navegador le daba el gesto a la fila
          en vez de a la página. overflow-y-hidden: la fila nunca scrollea en
          vertical; pb-8 -mb-6: la fila tiene lugar para esos 30 px (no sobra
          nada que scrollear) y el espacio de abajo sigue siendo 8 px. Los
          efectos de hover/toque van con can-hover: (solo con mouse).
          scroll-pl-* = mismo valor que px-*: el snap deja cada tarjeta
          alineada con el margen de la sección (sin él quedaba pegada al
          borde izquierdo de la pantalla). Ícono del título alineado a la
          primera línea por si el texto baja a dos. */}
      <div className="mb-16">
        <div className="flex items-start gap-3 mb-8">
          <Code2 className="w-5 h-5 shrink-0 mt-0.5 sm:mt-1 text-cyan" />
          <h3 className="font-display text-base sm:text-lg font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-fg">{t.projects.digitalSubtitle}</h3>
        </div>
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden snap-x snap-proximity no-scrollbar pb-8 -mb-6 -mx-5 px-5 scroll-pl-5 sm:-mx-6 sm:px-6 sm:scroll-pl-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3">
          {digitalProjects.map((project, i) => (
            <div key={project.id} className="snap-start shrink-0 flex w-[80vw] max-w-[420px] sm:w-[420px] md:w-auto md:max-w-none md:shrink">
              <ProjectCard
                project={project}
                index={i}
                onClick={project.id === "symbiosis" ? handleLockClick : () => setExpandedId(project.id)}
                lang={lang}
                onAsesoramientosClick={() => setCanvaModalOpen(true)}
                onNexstockClick={() => setNexstockModalOpen(true)}
                lockControls={project.id === "symbiosis" ? lockControls : undefined}
                locked={project.id === "symbiosis" ? clicked : undefined}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-fg-muted mt-3 md:hidden uppercase tracking-wider">
          {lang === "es" ? "← Deslizá para ver más →" : "← Swipe to see more →"}
        </p>
      </div>

      {/* CATEGORÍA: Operaciones de Negocio */}
      <div>
        <div className="flex items-start gap-3 mb-8">
          <Briefcase className="w-5 h-5 shrink-0 mt-0.5 sm:mt-1 text-cyan" />
          <h3 className="font-display text-base sm:text-lg font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-fg">{t.projects.businessSubtitle}</h3>
        </div>
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden snap-x snap-proximity no-scrollbar pb-8 -mb-6 -mx-5 px-5 scroll-pl-5 sm:-mx-6 sm:px-6 sm:scroll-pl-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible">
          {businessProjects.map((project, i) => (
            <div key={project.id} className="snap-start shrink-0 flex w-[80vw] max-w-[420px] sm:w-[420px] md:w-auto md:max-w-none md:shrink">
              <ProjectCard
                project={project}
                index={i}
                onClick={() => setExpandedId(project.id)}
                lang={lang}
                onAsesoramientosClick={() => setCanvaModalOpen(true)}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-fg-muted mt-3 md:hidden uppercase tracking-wider">
          {lang === "es" ? "← Deslizá para ver más →" : "← Swipe to see more →"}
        </p>
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
                  <button onClick={() => setExpandedId(null)} className="p-2.5 rounded-full glass hover:bg-cyan/20 transition-all touch-manipulation">
                    <X className="w-5 h-5 text-fg" />
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <div className="relative w-full aspect-video max-h-[70vh] overflow-hidden flex items-center justify-center" style={{ background: expandedProject.imageBg ?? "#000000" }}>
                    <Image src={expandedProject.image} alt={expandedProject.title} fill quality={90} sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain" priority />
                  </div>
                  <div className="p-6 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div key={`${expandedProject.id}-${lang}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan mb-4">{expandedProject.date} - {expandedProject.category}</p>
                        <h3 className="font-display text-3xl md:text-5xl font-bold mb-3 gradient-text">{expandedProject.title}</h3>
                        {expandedProject.role && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan/15 to-electric/10 border border-cyan/30 mb-6">
                            <Crown className="w-3.5 h-3.5 text-cyan" strokeWidth={2} />
                            <span className="text-xs font-semibold uppercase tracking-wider text-cyan">{expandedProject.role}</span>
                          </div>
                        )}
                        <RichDescription text={expandedProject.desc} />
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-cyan/20">
                          {expandedProject.tags.map((tag: string) => <span key={tag} className="text-xs px-4 py-2 rounded-full bg-electric/10 text-cyan border border-cyan/30">{tag}</span>)}
                        </div>
                        {(expandedProject.links?.github || expandedProject.links?.review) && (
                          <div className="flex flex-wrap gap-3 pt-4">
                            {expandedProject.links.github && (
                              <a href={expandedProject.links.github} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-cyan/30 text-cyan text-xs hover:bg-cyan/10 hover:border-cyan/60 transition-all">
                                <GitBranch className="w-4 h-4" /><span>GitHub</span>
                              </a>
                            )}
                            {expandedProject.links.review && (
                              <a href={expandedProject.links.review} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-cyan/30 text-cyan text-xs hover:bg-cyan/10 hover:border-cyan/60 transition-all">
                                <Newspaper className="w-4 h-4" /><span>{lang === "es" ? "Review" : "Review"}</span>
                              </a>
                            )}
                          </div>
                        )}
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="relative glass rounded-2xl p-6 md:p-8 max-w-md w-full shadow-glow-lg">
              <button onClick={() => setEmailModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-fg-soft" /></button>
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
              {/* Opaco (modal-surface), no vidrio: sobre el fondo oscuro del overlay el vidrio
                  quedaba gris en tema claro y el texto oscuro no se leía. px-10: no choca con la X */}
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 px-8 sm:px-10 text-cyan">{lang === "es" ? "Mis Asesoramientos" : "My Services"}</h3>
              {/* Dos tarjetas iguales y centradas (lado a lado desde sm). Arriba, una
                  franja oscura con la animación del mismo personaje en cada
                  servicio (AsesoramientoAnimation); abajo, nombre, bajada y
                  botón. Se levantan y brillan con el hover. En el celular van una
                  abajo de la otra, más compactas: la franja (.service-band en
                  globals.css) se achica para que entren las dos en la pantalla. */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {/* Navegación interna (misma pestaña). Cierra el modal al salir
                    para que no quede el scroll trabado ni el Header oculto. */}
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
                <a href={ASESORAMIENTOS_EDUCATION_URL} target="_blank" rel="noopener noreferrer" className={SERVICE_CARD}>
                  <div aria-hidden="true" className="service-band relative overflow-hidden bg-[#05070D] bg-[radial-gradient(circle_at_50%_55%,rgb(34_211_238/0.14),transparent_65%)]">
                    <AsesoramientoAnimation variant="educativo" className="absolute inset-0 h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col items-center px-5 pb-4 pt-3 sm:pb-5 sm:pt-4">
                    <p className="font-display text-lg sm:text-xl font-bold text-fg">{lang === "es" ? "Asesoramientos Educativos" : "Educational Tutoring"}</p>
                    <p className="mt-0.5 mb-3 sm:mt-1 sm:mb-4 text-sm text-fg-muted">{lang === "es" ? "Ver propuesta (PDF)" : "View proposal (PDF)"}</p>
                    <span className={SERVICE_CTA}>
                      {lang === "es" ? "Abrir la propuesta" : "Open the proposal"}
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nexstockModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNexstockModalOpen(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="relative glass rounded-2xl p-6 md:p-8 max-w-md w-full shadow-glow-lg">
              <button onClick={() => setNexstockModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-fg-soft" /></button>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-2 text-cyan">NexStock</h3>
              <p className="text-center text-fg-soft text-sm mb-6">{lang === "es" ? "Accedé a los materiales del proyecto:" : "Access the project materials:"}</p>
              <div className="space-y-3">
                <a href={NEXSTOCK_PROPOSAL_PDF} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-cyan/20 hover:border-cyan/60 hover:bg-cyan/10 transition-all group">
                  <FileText className="w-5 h-5 text-cyan shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-fg">{lang === "es" ? "Propuesta formal" : "Formal proposal"}</p>
                    <p className="text-[11px] text-fg-muted">PDF</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-fg-muted group-hover:text-cyan transition-colors" />
                </a>
                <a href={NEXSTOCK_PRESENTATION_PPT} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-cyan/20 hover:border-cyan/60 hover:bg-cyan/10 transition-all group">
                  <Briefcase className="w-5 h-5 text-cyan shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-fg">{lang === "es" ? "Presentación" : "Presentation"}</p>
                    <p className="text-[11px] text-fg-muted">PDF</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-fg-muted group-hover:text-cyan transition-colors" />
                </a>
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
    image: string;
    date: string;
    category: string;
    title: string;
    role?: string;
    desc: string;
    tags: string[];
    proposalUrl: string;
    imageBg?: string;
    comingSoon?: boolean;
    comingSoonLabel?: string;
    clickHint?: string;
    links?: { github?: string; review?: string };
  };
  index: number;
  onClick: () => void;
  lang: string;
  onAsesoramientosClick: () => void;
  onNexstockClick?: () => void;
  /** Solo lo usa Symbiosis: controla la animación del ícono de candado del ribbon. */
  lockControls?: ReturnType<typeof useAnimation>;
  /** Solo lo usa Symbiosis: activa el flash rojo mientras se "desbloquea". */
  locked?: boolean;
};

function ProjectCard({ project, index, onClick, lang, onAsesoramientosClick, onNexstockClick, lockControls, locked }: ProjectCardProps) {
  const motionProps: MotionProps = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "0px 0px -50px 0px" }, transition: { duration: 0.5, delay: 0.2 + index * 0.1 } };
  const containedImage = containedImageIds.includes(project.id);
  return (
    <motion.article {...motionProps} onClick={onClick}
      className="relative glass rounded-2xl overflow-hidden flex flex-col group flex-1 w-full cursor-pointer can-hover:hover:shadow-glow transition-shadow touch-manipulation">
      <ProposalButton projectId={project.id} url={project.proposalUrl} lang={lang} onAsesoramientosClick={onAsesoramientosClick} onNexstockClick={onNexstockClick} />

      {/* Ribbon "Coming Soon" — solo para Symbiosis. El candado hereda la
          animación de shake/pulse de handleLockClick vía lockControls. */}
      {project.comingSoon && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur-sm text-cyan border border-cyan/40 text-xs">
          <motion.span animate={lockControls} className="flex">
            <Lock className={`w-3.5 h-3.5 ${locked ? "text-red-500" : "text-cyan"}`} />
          </motion.span>
          <span className="uppercase tracking-wider">{project.comingSoonLabel}</span>
        </div>
      )}

      <div
        className="relative aspect-[16/9] overflow-hidden flex items-center justify-center"
        style={{ background: project.imageBg ?? "#000000" }}
      >
        {/* sizes = ancho real de la tarjeta: carrusel 80vw, 2 columnas en md, 3 en lg */}
        {/* Coming soon (Symbiosis): logo desenfocado a propósito (6 px; antes
            4 px con blur-sm, Matías lo pidió "un poquito más blurreado"); el
            ribbon y el degradé quedan nítidos por encima */}
        <Image src={project.image} alt={project.title} fill quality={80} loading="lazy" sizes="(max-width: 767px) 80vw, (max-width: 1023px) 50vw, 33vw"
          className={`${containedImage ? "object-contain" : "object-cover"} ${project.comingSoon ? "blur-[6px]" : ""} transition-transform duration-700 can-hover:group-hover:scale-105`} />
        {/* El degradé oscuro solo va sobre las imágenes que llenan el recuadro
            (cover). Sobre las que van enteras (contain) con su color de fondo
            se vería como una sombra gris fea. */}
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
        <p className="text-sm text-fg-soft leading-relaxed mb-4 flex-1 line-clamp-3">{project.desc}</p>
        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
          {project.tags.map((tag) => <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-electric/10 text-cyan border border-cyan/20">{tag}</span>)}
        </div>

        {/* Links de GitHub / Review — solo se muestran si el proyecto los tiene (ej. ZIRA) */}
        {(project.links?.github || project.links?.review) && (
          <div className="flex flex-wrap gap-2 pt-3">
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-cyan border border-cyan/20 can-hover:hover:border-cyan/60 can-hover:hover:bg-cyan/10 transition-all">
                <GitBranch className="w-3 h-3" /><span>GitHub</span>
              </a>
            )}
            {project.links.review && (
              <a href={project.links.review} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-cyan border border-cyan/20 can-hover:hover:border-cyan/60 can-hover:hover:bg-cyan/10 transition-all">
                <Newspaper className="w-3 h-3" /><span>Review</span>
              </a>
            )}
          </div>
        )}

        <p className="text-[10px] uppercase tracking-wider text-cyan/70 mt-3">{project.clickHint ?? (lang === "es" ? "Click para leer más →" : "Click to read more →")}</p>
      </div>
    </motion.article>
  );
}