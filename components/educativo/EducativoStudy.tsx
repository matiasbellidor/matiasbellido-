"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useHasFinePointer } from "@/components/Magnetic";
import { EASE, Reveal } from "@/components/fitness/shared";
import { Emoji, type EmojiName } from "./emoji";
import { MACRO_PALACE_URL, STATS_PALACE_URL } from "./data";

const PALACES: Record<"macro" | "stats", { url: string; emoji: EmojiName }> = {
  macro: { url: MACRO_PALACE_URL, emoji: "classicalBuilding" },
  stats: { url: STATS_PALACE_URL, emoji: "barChart" },
};

/* ── Material de estudio para la UBA: discreto (pedido de Matías) ──
   No va en el menú ni ocupa una sección entera: es una fila chica después
   de las preguntas con un botón "Ver material" que despliega las dos
   tarjetas (materia, parte de la materia, temas y "Abrir palacio").
   Cerrada, las tarjetas no están montadas: sus links no reciben foco. */
export default function EducativoStudy() {
  const { t } = useLanguage();
  const s = t.educativo.study;
  const [open, setOpen] = useState(false);
  const reduced = !!useReducedMotion();

  return (
    <section id="material" className="px-4 sm:px-6 md:px-16 py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className={`fit-surface rounded-3xl transition-colors ${open ? "!border-cyan/40" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6">
              <span className="hidden sm:grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-cyan/10" aria-hidden="true">
                <Emoji name="book" className="w-8 h-8" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg md:text-xl font-bold text-fg">{s.title}</h2>
                <p className="mt-1 text-sm text-fg-soft leading-relaxed">{s.intro}</p>
              </div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="material-palacios"
                onClick={() => setOpen((o) => !o)}
                className="fit-focus inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start sm:self-auto rounded-full border border-cyan/30 px-5 text-sm font-semibold text-fg transition-colors hover:border-cyan/60 hover:text-cyan touch-manipulation"
              >
                {open ? s.toggleClose : s.toggleOpen}
                <ChevronDown aria-hidden="true" className={`w-4 h-4 text-cyan transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Existe siempre (aria-controls nunca apunta a algo que no está); el contenido se monta al abrir */}
            <div id="material-palacios">
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-5 pb-5 md:px-6 md:pb-6">
                      {s.items.map((item) => (
                        <PalaceCard key={item.id} item={item} />
                      ))}
                    </div>
                    <p className="px-5 pb-5 md:px-6 md:pb-6 text-xs text-fg-muted">{s.note}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

type StudyItem = { id: "macro" | "stats"; subject: string; title: string; part: string; topics: string[] };

function PalaceCard({ item }: { item: StudyItem }) {
  const { t } = useLanguage();
  const s = t.educativo.study;
  const palace = PALACES[item.id];

  return (
    <article className="rounded-2xl border border-cyan/15 p-5 flex flex-col min-w-0">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-cyan/10" aria-hidden="true">
          <Emoji name={palace.emoji} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">{item.subject}</p>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold leading-tight text-fg">{item.title}</h3>
      <p className="mt-2 inline-flex self-start rounded-full bg-cyan/10 border border-cyan/20 px-3 py-1 text-xs font-semibold text-fg">{item.part}</p>
      <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-fg-muted">{s.topicsTitle}</h4>
      <ul className="mt-2 flex flex-1 flex-wrap content-start gap-1.5">
        {item.topics.map((topic) => (
          <li key={topic} className="rounded-lg border border-cyan/15 px-2.5 py-1 text-xs text-fg leading-snug">
            {topic}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <PalaceButton url={palace.url} label={s.open} soon={s.soon} hiddenLabel={`${item.title} ${s.newTab}`} />
      </div>
    </article>
  );
}

/* "Abrir palacio" con el lenguaje del botón "Propuesta" de Bellido
   Asesoramientos (AsesoramientosProposalButton en Projects.tsx y la skill
   pitch-web-kit): relleno del color de acción, brillo inclinado que cruza
   cada ~4 s y halo que se expande. Hover solo con mouse: scale 1.03 y
   resplandor. Brillo y halo corren solo con el botón en pantalla y nunca con
   "reducir movimiento". Sin link: deshabilitado con "Próximamente". */
function PalaceButton({ url, label, soon, hiddenLabel }: { url: string; label: string; soon: string; hiddenLabel: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref);
  const reduced = !!useReducedMotion();
  const fine = useHasFinePointer();
  const shimmer = !reduced;

  if (!url) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-11 items-center rounded-full border border-cyan/25 px-5 text-sm font-semibold text-fg-muted cursor-not-allowed"
      >
        {soon}
      </button>
    );
  }

  return (
    <div className="relative inline-flex">
      {shimmer && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-electric"
          initial={{ opacity: 0, scale: 1 }}
          animate={inView ? { opacity: [0.6, 0], scale: [1, 1.3] } : { opacity: 0, scale: 1 }}
          transition={inView ? { duration: 1.6, ease: "easeOut", repeat: Infinity, repeatDelay: 2.4 } : { duration: 0 }}
        />
      )}
      <motion.a
        ref={ref}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={fine && !reduced ? { scale: 1.03, y: -1 } : undefined}
        whileTap={fine ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
        // transition-all animaría también el transform que maneja Framer
        className="fit-focus relative overflow-hidden inline-flex h-11 items-center gap-2 rounded-full bg-electric pl-5 pr-4 text-sm font-semibold text-white border border-white/25 shadow-[0_6px_20px_-6px_rgb(var(--accent-electric)/0.9)] can-hover:hover:shadow-[0_0_24px_rgb(var(--accent-electric)/0.45)] can-hover:hover:brightness-110 transition-[box-shadow,filter] duration-200 touch-manipulation"
      >
        {shimmer && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: "-150%" }}
            animate={inView ? { x: "250%" } : { x: "-150%" }}
            transition={inView ? { duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6 } : { duration: 0 }}
          />
        )}
        <span className="relative">{label}</span>
        <span className="sr-only"> · {hiddenLabel}</span>
        <ArrowUpRight className="relative w-4 h-4" aria-hidden="true" />
      </motion.a>
    </div>
  );
}
