"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, SectionHeading } from "./shared";

/* Asimilación del deportista (PDF): los tres primeros meses como una línea
   de tiempo. El período de prueba se sacó a pedido de Matías (2026-11-06). */
export default function FitnessAssimilation() {
  const { t } = useLanguage();
  const a = t.fitness.assimilation;

  return (
    <FitnessSection id="asimilacion">
      <SectionHeading eyebrow={a.eyebrow} title={a.title} intro={a.intro} />

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {a.months.map((desc, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
            className="relative fit-surface rounded-3xl p-6"
          >
            <p className="flex items-baseline gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">{a.monthLabel}</span>
              <span className="font-display text-4xl font-bold leading-none text-fg">{i + 1}</span>
            </p>
            <p className="mt-4 text-sm md:text-base text-fg-soft leading-relaxed">{desc}</p>
            {i < a.months.length - 1 && (
              <ArrowRight
                aria-hidden="true"
                className="hidden md:block absolute top-1/2 -right-5 w-4 h-4 -translate-y-1/2 text-cyan/60"
              />
            )}
          </motion.li>
        ))}
      </ol>
    </FitnessSection>
  );
}
