"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Emoji } from "./emoji";
import { EASE, FitnessSection, SectionHeading, WhatsAppButton } from "./shared";

/* Cómo empezar: stepper visual de 4 pasos (formulario → objetivo →
   rutina y dieta en ~2 días → seguimiento por WhatsApp), con cuándo pasa
   cada uno. Mobile: riel vertical a la izquierda. Desktop: los nodos en
   fila unidos por una línea que se dibuja al entrar. Los 4 cuadros miden
   lo mismo (auto-rows-fr: todas las filas, o la fila entera en desktop,
   toman el alto del cuadro más largo) y el chip de "cuándo" queda abajo.
   Cierra con el CTA. */
export default function FitnessSteps() {
  const { t } = useLanguage();
  const s = t.fitness.start;

  return (
    <FitnessSection id="empezar">
      <SectionHeading eyebrow={s.eyebrow} title={s.title} intro={s.intro} />

      <p className="fit-surface -mt-4 mb-12 inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm md:text-base text-fg">
        <Emoji name="telephone" className="w-5 h-5" />
        {s.freeCall}
      </p>

      <ol className="relative grid grid-cols-1 lg:grid-cols-4 auto-rows-fr gap-y-8 lg:gap-6">
        {/* Línea que une los nodos en desktop */}
        <motion.span
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          className="hidden lg:block absolute top-6 left-6 right-[calc(25%-1.5rem)] h-0.5 origin-left rounded-full bg-gradient-to-r from-cyan via-cyan/60 to-cyan/30"
        />
        {s.steps.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.12 }}
            className="relative grid grid-cols-[48px_1fr] gap-4 lg:flex lg:flex-col"
          >
            {/* Riel vertical en mobile (no después del último paso) */}
            {i < s.steps.length - 1 && (
              <span aria-hidden="true" className="lg:hidden absolute left-6 top-12 -bottom-8 w-0.5 -translate-x-1/2 bg-cyan/30" />
            )}
            <span className="relative z-10 grid place-items-center w-12 h-12 rounded-full bg-electric text-white font-display text-lg font-bold shadow-[0_0_0_6px_rgb(var(--accent-electric)/0.15)]">
              {i + 1}
            </span>
            <div className="fit-surface flex flex-col rounded-2xl p-6 lg:mt-6 lg:flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan">
                {s.stepLabel} {i + 1}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-fg">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm md:text-base text-fg-soft leading-relaxed">{step.desc}</p>
              <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-fg">
                <Emoji name="stopwatch" className="w-4 h-4" />
                {step.when}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-12 flex justify-center">
        <WhatsAppButton message={t.fitness.whatsappMessage} label={s.cta} size="lg" />
      </div>
    </FitnessSection>
  );
}
