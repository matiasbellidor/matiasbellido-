"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Emoji, type EmojiName } from "./emoji";
import { FitnessSection, Reveal, SectionHeading } from "./shared";

/* Un emoji de Apple por grupo, en el mismo orden que t.fitness.faq.groups */
const GROUP_EMOJIS: EmojiName[] = ["weightlifter", "salad"];

/* Preguntas frecuentes del PDF (entrenamiento y alimentación) en acordeón.
   El alto se anima con grid-template-rows 0fr → 1fr (sin medir en JS). */
export default function FitnessFaq() {
  const { t } = useLanguage();
  const f = t.fitness.faq;

  return (
    <FitnessSection id="preguntas">
      <SectionHeading eyebrow={f.eyebrow} title={f.title} intro={f.intro} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {f.groups.map((group, g) => {
          const emoji = GROUP_EMOJIS[g % GROUP_EMOJIS.length];
          return (
            <Reveal key={group.title} delay={g * 0.08}>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-fg-muted mb-4">
                <Emoji name={emoji} className="w-[18px] h-[18px]" />
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </FitnessSection>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className={`fit-surface rounded-2xl transition-colors ${open ? "!border-cyan/40" : ""}`}>
      <h4>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={() => setOpen((o) => !o)}
          className="fit-focus w-full flex items-center justify-between gap-4 rounded-2xl px-6 py-4 text-left font-semibold text-fg transition-colors hover:text-cyan"
        >
          <span>{q}</span>
          <ChevronDown
            aria-hidden="true"
            className={`w-5 h-5 shrink-0 text-cyan transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h4>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-4 text-sm md:text-base text-fg-soft leading-relaxed">{a}</p>
        </div>
      </div>
    </li>
  );
}
