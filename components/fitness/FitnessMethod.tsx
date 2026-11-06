"use client";

import { motion } from "framer-motion";
import { Layers, Utensils, MessageCircle, Video, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, SectionHeading } from "./shared";

/* Un ícono por pieza del método, en el mismo orden que t.fitness.method.items */
const ITEM_ICONS = [Layers, Utensils, MessageCircle, Video];

/* Mi método (PDF): mesociclos, alimentación sin prohibiciones, seguimiento
   por WhatsApp y el límite honesto de la modalidad virtual. El foco visual
   es el bloque de ejemplo, que se llena semana por semana al entrar. */
export default function FitnessMethod() {
  const { t } = useLanguage();
  const m = t.fitness.method;
  const sheet = m.sheet;
  const lastCol = sheet.columns.length - 2; // índice de la última semana dentro de values

  return (
    <FitnessSection id="metodo">
      <SectionHeading eyebrow={m.eyebrow} title={m.title} intro={m.intro} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
        <Reveal>
          <figure className="fit-surface rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-cyan font-semibold">{sheet.label}</p>
              <TrendingUp className="w-5 h-5 text-cyan shrink-0" aria-hidden="true" />
            </div>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-cyan/20">
                  {sheet.columns.map((col, i) => (
                    <th
                      key={col}
                      scope="col"
                      className={`py-2 text-[11px] uppercase tracking-wider font-medium ${
                        i === 0 ? "text-left pr-2" : "text-right pl-2"
                      } ${i === sheet.columns.length - 1 ? "text-cyan" : "text-fg-muted"}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheet.rows.map((row) => (
                  <tr key={row.exercise} className="border-b border-cyan/10 last:border-0">
                    <th scope="row" className="py-3 pr-2 text-left font-medium text-fg">
                      {row.exercise}
                    </th>
                    {row.values.map((value, col) => (
                      <motion.td
                        key={col}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, ease: EASE, delay: 0.25 + col * 0.18 }}
                        className={`py-3 pl-2 text-right ${col === lastCol ? "font-bold text-cyan" : "text-fg-soft"}`}
                      >
                        {value}
                      </motion.td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption className="mt-4 text-xs text-fg-muted">{sheet.note}</figcaption>
          </figure>
        </Reveal>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {m.items.map((item, i) => {
            const Icon = ITEM_ICONS[i % ITEM_ICONS.length];
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="flex gap-4"
              >
                <span className="shrink-0 w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cyan" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-fg">{item.title}</h3>
                  <p className="mt-1 text-sm md:text-base text-fg-soft leading-relaxed">{item.desc}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </FitnessSection>
  );
}
