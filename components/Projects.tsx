"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation, type MotionProps } from "framer-motion";
import { Lock, Clock, X, Mail, Languages, Code2, Briefcase, ExternalLink, FileText } from "lucide-react";
import Section from "./Section";
import WaveText from "@/components/WaveText";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";

// ============================================================================
// PROPOSAL/RESUMEN LINKS — completá manualmente las URLs faltantes
// ============================================================================
const SYMBIOSIS_PROPOSAL_URL = "";
const BUDGENTS_PROPOSAL_URL = "/projects/Imagenes/Budgents.pdf";
const NUTRIOPS_PROPOSAL_URL = "/projects/Imagenes/NutriOps.pdf";
const ONEIRIC_PROPOSAL_URL = "/projects/Imagenes/OneiricAi.pdf";
const IMPORTS_PROPOSAL_URL = "/projects/Imagenes/Importaciones.pdf";
const ASESORAMIENTOS_FITNESS_URL = "https://canva.link/yj6is9jfjf8y3j3";
const ASESORAMIENTOS_EDUCATION_URL = "https://canva.link/mxh1ejfv32c2en1";

// NexStock (BootCamp ITBA) — el botón "Propuesta" abre un modal con estos dos archivos
const NEXSTOCK_PROPOSAL_PDF = "/projects/Imagenes/Propuesta - NexStock.pdf";
const NEXSTOCK_PRESENTATION_PPT = "/projects/Imagenes/Presentacion - NexStock.pdf";

// ORDEN del carrusel (grid-flow-col con 2 filas -> se llena por COLUMNAS):
// [0] OneiricAi (arriba-izq) | [1] NutriOps (abajo-izq) | [2] NexStock (arriba-der) | [3] Budgents (abajo-der)
const digitalProjectsMeta = [
  { id: "oneiric", image: "/projects/Imagenes/OneiricAi.png", proposalUrl: ONEIRIC_PROPOSAL_URL, imageBg: "#05060E" },
  { id: "nutriops", image: "/projects/Imagenes/solver.png", proposalUrl: NUTRIOPS_PROPOSAL_URL },
  { id: "nexstock", image: "/projects/Imagenes/NexStock.png", proposalUrl: "", imageBg: "#FFFFFF" },
  { id: "budgents", image: "/projects/Imagenes/agents.png", proposalUrl: BUDGENTS_PROPOSAL_URL },
];

const businessProjectsMeta = [
  { id: "imports", image: "/projects/Imagenes/Imports.png", proposalUrl: IMPORTS_PROPOSAL_URL, imageBg: "#252629" },
  { id: "asesoramientos", image: "/projects/Imagenes/asesoramientos.png", proposalUrl: "" },
];

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
  if (!hasUrl) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAsesoramientos) onAsesoramientosClick();
    else if (isNexstock) onNexstockClick?.();
    else window.open(url, "_blank");
  };

  return (
    <button onClick={handleClick}
      className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-electric/20 backdrop-blur-sm text-cyan border border-cyan/40 text-xs hover:bg-electric/40 transition-all touch-manipulation">
      <FileText className="w-3.5 h-3.5" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3" />
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

  const digitalProjects = digitalProjectsMeta.map((meta) => {
    const content =
      meta.id === "oneiric" ? t.projects.oneiric :
      meta.id === "nexstock" ? t.projects.nexstock :
      meta.id === "nutriops" ? t.projects.nutriops :
      t.projects.budgents;
    return { ...meta, ...content };
  });
  const businessProjects = businessProjectsMeta.map((meta) => ({ ...meta, ...(meta.id === "imports" ? t.projects.imports : t.projects.asesoramientos) }));
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
      <WaveText
        key={lang}
        text={t.projects.sectionDesc}
        className="max-w-4xl mx-auto text-base md:text-lg text-fg-soft leading-relaxed text-center mb-16"
      />

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <Code2 className="w-5 h-5 text-cyan" />
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-fg">{t.projects.digitalSubtitle}</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
            onClick={handleLockClick}
            className="relative glass rounded-2xl overflow-hidden cursor-pointer group min-h-[500px] lg:min-h-[600px] flex flex-col touch-manipulation">
            {SYMBIOSIS_PROPOSAL_URL && (
              <button onClick={(e) => { e.stopPropagation(); window.open(SYMBIOSIS_PROPOSAL_URL, "_blank"); }}
                className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-electric/20 backdrop-blur-sm text-cyan border border-cyan/40 text-xs hover:bg-electric/40 transition-all touch-manipulation">
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === "es" ? "Propuesta" : "Proposal"}</span>
              </button>
            )}
            <div className="absolute inset-0">
              <Image src="/projects/Imagenes/symbiosis.png" alt="Symbiosis AI" fill quality={80} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            </div>
            <AnimatePresence>{clicked && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-red-500 z-30 mix-blend-overlay" />}</AnimatePresence>
            <div className="relative z-20 flex flex-col items-center justify-center flex-1 gap-6 p-8">
              <motion.div animate={lockControls}><Lock className={`w-20 h-20 ${clicked ? "text-red-500" : "text-cyan"}`} strokeWidth={1.5} /></motion.div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan">{t.projects.symbiosis.status}</p>
              <div className="flex items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><Clock className="w-6 h-6 text-white" strokeWidth={1.5} /></motion.div>
                <p className="font-display text-3xl font-bold text-white">{t.projects.symbiosis.building}...</p>
              </div>
              <p className="text-xs uppercase tracking-wider text-white/60 mt-4 text-center">{t.projects.symbiosis.clickHint}</p>
            </div>
            <div className="relative z-20 p-6 md:p-8 border-t border-white/10 bg-black/40 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">{t.projects.symbiosis.meta}</p>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 text-cyan">{t.projects.symbiosis.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{t.projects.symbiosis.desc}</p>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                {["Python Backend", "LLM API Integration", "Streamlit UI", "RAG (Retrieval-Augmented Generation)"].map((tag) => <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-electric/10 text-cyan border border-cyan/20">{tag}</span>)}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-flow-col grid-rows-[1fr_1fr] gap-6 auto-cols-[82%] sm:auto-cols-[calc(50%_-_0.75rem)] overflow-x-scroll h-full scroll-fade-x">
            {digitalProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onClick={() => setExpandedId(project.id)} lang={lang} onAsesoramientosClick={() => setCanvaModalOpen(true)} onNexstockClick={() => setNexstockModalOpen(true)} variant="carousel" />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-8">
          <Briefcase className="w-5 h-5 text-cyan" />
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-fg">{t.projects.businessSubtitle}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {businessProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onClick={() => setExpandedId(project.id)} lang={lang} onAsesoramientosClick={() => setCanvaModalOpen(true)} />
          ))}
        </div>
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
                  <div className="relative w-full flex items-center justify-center" style={{ minHeight: "250px", maxHeight: "55vh", backgroundColor: expandedProject.imageBg ?? "#000000" }}>
                    <Image src={expandedProject.image} alt={expandedProject.title} fill quality={90} sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain" priority />
                  </div>
                  <div className="p-6 md:p-12">
                    <AnimatePresence mode="wait">
                      <motion.div key={`${expandedProject.id}-${lang}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan mb-4">{expandedProject.date} - {expandedProject.category}</p>
                        <h3 className="font-display text-3xl md:text-5xl font-bold mb-6 gradient-text">{expandedProject.title}</h3>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCanvaModalOpen(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", duration: 0.5 }} onClick={(e) => e.stopPropagation()} className="relative glass rounded-2xl p-6 md:p-8 max-w-md w-full shadow-glow-lg">
              <button onClick={() => setCanvaModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-fg-soft" /></button>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-6 text-cyan">{lang === "es" ? "Mis Asesoramientos" : "My Services"}</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-lg font-semibold text-cyan mb-2">{lang === "es" ? "Asesoramientos Fitness" : "Fitness Coaching"}</p>
                  <a href={ASESORAMIENTOS_FITNESS_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-electric hover:text-cyan break-all underline">{ASESORAMIENTOS_FITNESS_URL}</a>
                </div>
                <div>
                  <p className="text-lg font-semibold text-cyan mb-2">{lang === "es" ? "Asesoramientos Educativos" : "Educational Tutoring"}</p>
                  <a href={ASESORAMIENTOS_EDUCATION_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-electric hover:text-cyan break-all underline">{ASESORAMIENTOS_EDUCATION_URL}</a>
                </div>
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
  project: { id: string; image: string; date: string; category: string; title: string; desc: string; tags: string[]; proposalUrl: string; imageBg?: string };
  index: number;
  onClick: () => void;
  lang: string;
  onAsesoramientosClick: () => void;
  onNexstockClick?: () => void;
  variant?: "grid" | "carousel";
};

function ProjectCard({ project, index, onClick, lang, onAsesoramientosClick, onNexstockClick, variant = "grid" }: ProjectCardProps) {
  const isCarousel = variant === "carousel";
  const motionProps: MotionProps = isCarousel
    ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.15 + index * 0.1 } }
    : { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-50px" }, transition: { duration: 0.5, delay: 0.2 + index * 0.1 } };
  const containedImage = project.id === "imports" || project.id === "nexstock" || project.id === "oneiric";
  return (
    <motion.article {...motionProps} onClick={onClick}
      className="relative glass rounded-2xl overflow-hidden flex flex-col group flex-1 w-full cursor-pointer hover:shadow-glow transition-shadow touch-manipulation">
      <ProposalButton projectId={project.id} url={project.proposalUrl} lang={lang} onAsesoramientosClick={onAsesoramientosClick} onNexstockClick={onNexstockClick} />
      <div
        className="relative aspect-[16/9] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: project.imageBg ?? "#000000" }}
      >
        <Image src={project.image} alt={project.title} fill quality={80} loading="lazy" sizes="(max-width: 1024px) 100vw, 50vw"
          className={`${containedImage ? "object-contain" : "object-cover"} transition-transform duration-700 group-hover:scale-105`} />
        {/* El degradé oscuro solo tiene sentido sobre fondo oscuro (imágenes
            cover). Sobre un imageBg claro se vería como una sombra gris fea,
            así que lo omitimos cuando hay un fondo personalizado. */}
        {!project.imageBg && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-fg-muted mb-2">{project.date} - {project.category}</p>
        <h3 className="font-display text-xl font-bold mb-3 text-cyan">{project.title}</h3>
        <p className="text-sm text-fg-soft leading-relaxed mb-4 flex-1 line-clamp-3">{project.desc}</p>
        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
          {project.tags.map((tag) => <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-electric/10 text-cyan border border-cyan/20">{tag}</span>)}
        </div>
        <p className="text-[10px] uppercase tracking-wider text-cyan/70 mt-3">{lang === "es" ? "Click para leer más →" : "Click to read more →"}</p>
      </div>
    </motion.article>
  );
}