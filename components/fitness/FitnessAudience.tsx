"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Emoji, type EmojiName } from "./emoji";
import { EASE, FitnessSection, Reveal } from "./shared";

/* Un emoji de Apple por chip y por problema, en el mismo orden que
   t.fitness.audience.who y t.fitness.audience.problems (ver emoji.tsx) */
const WHO_EMOJIS: EmojiName[] = ["biceps", "lightning", "target", "fire"];
const PROBLEM_EMOJIS: EmojiName[] = ["calendar", "hourglass", "salad", "bone", "shrug"];

/* Para quién es + qué problema resuelve. Desktop: el título y el perfil
   quedan fijos a la izquierda mientras pasan los cinco problemas. */
export default function FitnessAudience() {
  const { t } = useLanguage();
  const a = t.fitness.audience;

  return (
    <FitnessSection id="para-quien">
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
        <Reveal className="lg:sticky lg:top-32 self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan mb-4">{a.eyebrow}</p>
          <h2 className="font-display text-[clamp(1.875rem,5.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-fg">
            {a.title}
          </h2>
          <p className="mt-8 text-sm font-semibold text-fg">{a.whoTitle}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {a.who.map((item, i) => (
              <li key={item} className="fit-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-fg">
                <Emoji name={WHO_EMOJIS[i % WHO_EMOJIS.length]} className="w-[18px] h-[18px]" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-fg-muted mb-4">{a.problemsTitle}</h3>
          <ul className="space-y-3">
            {a.problems.map((problem, i) => (
              <motion.li
                key={problem.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="fit-surface rounded-2xl p-6 flex gap-4"
              >
                <span className="shrink-0 w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center" aria-hidden="true">
                  <Emoji name={PROBLEM_EMOJIS[i % PROBLEM_EMOJIS.length]} />
                </span>
                <div className="min-w-0">
                  <h4 className="font-semibold text-fg">{problem.title}</h4>
                  <p className="mt-1 text-sm md:text-base text-fg-soft leading-relaxed">{problem.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <p className="border-l-2 border-cyan pl-6 text-lg md:text-xl font-semibold text-fg leading-snug">{a.closing}</p>
          </Reveal>
        </div>
      </div>
    </FitnessSection>
  );
}
