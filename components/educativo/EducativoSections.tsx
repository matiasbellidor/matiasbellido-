"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, SectionHeading, WhatsAppButton } from "@/components/fitness/shared";
import { Emoji, type EmojiName } from "./emoji";

/* Secciones de contenido de /educativo, con las mismas piezas que /fitness
   (FitnessSection, SectionHeading, Reveal, .fit-surface). Propuesta corta:
   una idea por tarjeta, una línea por idea. Un emoji de Apple por ítem, en
   el mismo orden que t.educativo. */
const METHOD_EMOJIS: EmojiName[] = ["magnifier", "brick", "calendar"];
const PROBLEM_EMOJIS: EmojiName[] = ["hourglass", "abacus", "brick", "anxious"];

const itemIn = (i: number, step = 0.08) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -60px 0px" },
  transition: { duration: 0.5, ease: EASE, delay: i * step },
});

const H2 = "font-display text-[clamp(1.875rem,5.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-fg";
const EYEBROW = "text-xs font-semibold uppercase tracking-[0.3em] text-cyan mb-4";

/* ── Método: tres tarjetas, justo después del hero ── */
export function EducativoMethod() {
  const { t } = useLanguage();
  const m = t.educativo.method;

  return (
    <FitnessSection id="metodo">
      <SectionHeading eyebrow={m.eyebrow} title={m.title} />
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {m.steps.map((step, i) => (
          <motion.li key={step.title} {...itemIn(i, 0.1)} className="fit-surface rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <span className="w-12 h-12 rounded-2xl bg-cyan/10 flex items-center justify-center" aria-hidden="true">
                <Emoji name={METHOD_EMOJIS[i % METHOD_EMOJIS.length]} className="w-8 h-8" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan">
                {m.stepLabel} {i + 1}
              </span>
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-fg">{step.title}</h3>
            <p className="mt-1 text-sm md:text-base text-fg-soft leading-relaxed">{step.desc}</p>
          </motion.li>
        ))}
      </ol>
    </FitnessSection>
  );
}

/* ── Quién soy: dos líneas. Sin proyectos ni nada del portfolio (pedido
   de Matías); la vuelta al portfolio está solo en el pie. ── */
export function EducativoAbout() {
  const { t } = useLanguage();
  const a = t.educativo.about;

  return (
    <FitnessSection id="sobre-mi">
      <Reveal className="max-w-3xl">
        <p className={EYEBROW}>{a.eyebrow}</p>
        <h2 className={H2}>{a.title}</h2>
        <p className="mt-6 text-base md:text-lg text-fg-soft leading-relaxed">{a.text}</p>
        <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-fg-muted">{a.subjectsTitle}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {a.subjects.map((subject, i) => (
            <li
              key={subject}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                i === a.subjects.length - 1 ? "border-dashed border-cyan/40 text-fg-soft" : "border-cyan/25 bg-cyan/5 text-fg"
              }`}
            >
              {subject}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-fg-soft">{a.levels}</p>
        {/* Para quien quiere saber más de Matías: al portfolio profesional, discreto */}
        <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-soft">
          {a.portfolioIntro}
          <Link
            href="/"
            className="fit-surface fit-focus inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold text-fg transition-colors hover:border-cyan/50 hover:text-cyan touch-manipulation"
          >
            {a.portfolioCta}
            <ArrowRight className="w-4 h-4 text-cyan" aria-hidden="true" />
          </Link>
        </p>
      </Reveal>
    </FitnessSection>
  );
}

/* ── ¿Te pasa? + Beneficios incluidos: el problema a la izquierda y lo que
   trae el pack de 20 clases a la derecha (los cinco, textuales). ── */
export function EducativoProblem() {
  const { t } = useLanguage();
  const p = t.educativo.problem;

  return (
    <FitnessSection id="problema">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="min-w-0">
          <Reveal>
            <p className={EYEBROW}>{p.eyebrow}</p>
            <h2 className={H2}>{p.title}</h2>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {p.items.map((item, i) => (
              <motion.li key={item} {...itemIn(i, 0.06)} className="flex items-center gap-4">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center" aria-hidden="true">
                  <Emoji name={PROBLEM_EMOJIS[i % PROBLEM_EMOJIS.length]} />
                </span>
                <p className="text-base md:text-lg text-fg leading-snug">{item}</p>
              </motion.li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <p className="border-l-2 border-cyan pl-6 text-lg md:text-xl font-semibold text-fg">{p.closing}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="min-w-0">
          <div className="fit-surface rounded-3xl p-6 md:p-8">
            <h3 className="font-display text-2xl font-bold text-fg">{p.benefitsTitle}</h3>
            <ul className="mt-6 space-y-3">
              {p.benefits.map((item) => (
                <li key={item} className="flex items-center gap-3 text-base md:text-lg font-medium text-fg">
                  <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-cyan/15" aria-hidden="true">
                    <Check className="w-4 h-4 text-cyan" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-fg-muted">{p.benefitsNote}</p>
          </div>
        </Reveal>
      </div>
    </FitnessSection>
  );
}

/* ── Cómo arrancar: el stepper de /fitness (FitnessSteps), con 3 pasos ──
   Mobile: riel vertical. Desktop: nodos en fila unidos por una línea que se
   dibuja al entrar. Los cuadros miden lo mismo (auto-rows-fr). */
export function EducativoSteps() {
  const { t } = useLanguage();
  const e = t.educativo;
  const s = e.start;

  return (
    <FitnessSection id="empezar">
      <SectionHeading eyebrow={s.eyebrow} title={s.title} />

      <ol className="relative grid grid-cols-1 lg:grid-cols-3 auto-rows-fr gap-y-6 lg:gap-6">
        <motion.span
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          className="hidden lg:block absolute top-6 left-6 right-[calc(33.333%-1.5rem)] h-0.5 origin-left rounded-full bg-gradient-to-r from-cyan via-cyan/60 to-cyan/30"
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
            {i < s.steps.length - 1 && (
              <span aria-hidden="true" className="lg:hidden absolute left-6 top-12 -bottom-6 w-0.5 -translate-x-1/2 bg-cyan/30" />
            )}
            <span className="relative z-10 grid place-items-center w-12 h-12 rounded-full bg-electric text-white font-display text-lg font-bold shadow-[0_0_0_6px_rgb(var(--accent-electric)/0.15)]">
              {i + 1}
            </span>
            <div className="fit-surface flex flex-col rounded-2xl p-5 lg:mt-6 lg:flex-1">
              <h3 className="font-display text-lg font-semibold text-fg">
                <span className="sr-only">
                  {s.stepLabel} {i + 1}:{" "}
                </span>
                {step.title}
              </h3>
              <p className="mt-1 flex-1 text-sm md:text-base text-fg-soft leading-relaxed">{step.desc}</p>
              <p className="mt-3 inline-flex items-center gap-2 self-start rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-fg">
                <Emoji name="stopwatch" className="w-4 h-4" />
                {step.when}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-12 flex justify-center">
        <WhatsAppButton message={e.whatsappMessage} label={s.cta} size="lg" />
      </div>
    </FitnessSection>
  );
}
