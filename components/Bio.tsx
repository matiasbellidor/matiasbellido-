"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import Section from "./Section";
import DropInText from "@/components/DropInText";
import { useLanguage } from "@/context/LanguageContext";

/* Curva de easing premium (la misma del Hero) */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Bio() {
  const { t } = useLanguage();
  const reduced = !!useReducedMotion();

  const skillCategories = [
    {
      number: "01",
      title: t.bio.categories.data,
      skills: ["Python", "R", "SQL", "Power BI"],
    },
    {
      number: "02",
      title: t.bio.categories.ai,
      skills: ["Claude w/ OpenClaw", "N8N & Make", "APIs / Webhooks"],
    },
    {
      number: "03",
      title: t.bio.categories.dev,
      skills: ["Git / GitHub", "Obsidian", "Microsoft Office", "Notion"],
    },
    {
      number: "04",
      title: t.bio.categories.prof,
      skills: [t.bio.englishSkill, "Data Storytelling"],
    },
  ];

  /* Stagger de entrada (mismo lenguaje de movimiento que el Hero):
     las 4 categorías aparecen en cascada al llegar con el scroll */
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduced ? 0 : 0.12 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduced ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.3 : 0.7, ease: EASE },
    },
  };

  return (
    <Section id="bio" eyebrow={t.bio.eyebrow} title={t.bio.title}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-24"
      >
        {skillCategories.map((category) => (
          <motion.div key={category.title} variants={fadeUp}>
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-cyan/60">{category.number}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan/40 to-transparent" />
              </div>
              <h3 className="text-lg font-semibold text-fg tracking-wide uppercase">
                {category.title}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-base px-4 py-2.5 rounded-full bg-electric/10 text-cyan border border-cyan/30 hover:border-cyan/70 hover:bg-electric/20 hover:scale-105 transition-all duration-300 cursor-default font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        {/* 1. El divisor con las comillas entra primero */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="flex items-center justify-center mb-12"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan/50" />
          <Quote className="w-6 h-6 text-cyan mx-4" strokeWidth={1.5} />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan/50" />
        </motion.div>

        <blockquote className="text-center">
          {/* 2. El manifiesto cae palabra por palabra al entrar en viewport */}
          <DropInText
            text={`\u201C${t.bio.manifesto}\u201D`}
            className="font-sans text-2xl md:text-3xl lg:text-4xl text-fg leading-relaxed font-normal"
          />

          {/* 3. La firma aparece al final, cuando las palabras ya asentaron */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: reduced ? 0 : 1, ease: EASE }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <div className="h-px w-12 bg-cyan/40" />
            <cite className="text-base uppercase tracking-[0.25em] text-cyan not-italic font-medium">
              Matias Bellido
            </cite>
            <div className="h-px w-12 bg-cyan/40" />
          </motion.footer>
        </blockquote>
      </div>
    </Section>
  );
}