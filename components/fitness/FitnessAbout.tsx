"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal } from "./shared";
import logo from "@/app/icon.png";

/* Quién soy + certificaciones. Las certificaciones son la señal de
   autoridad de la sección: chips sobrios con la entidad arriba y el
   título abajo, textuales (t.fitness.about.certs, "Entidad — Título"). */
export default function FitnessAbout({ photo }: { photo: string | null }) {
  const { t } = useLanguage();
  const a = t.fitness.about;

  return (
    <FitnessSection id="sobre-mi">
      <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
        <Reveal className="mx-auto w-full max-w-[320px] md:max-w-none md:sticky md:top-32">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden fit-surface">
            {photo ? (
              <Image src={photo} alt={a.photoAlt} fill quality={80} sizes="(max-width: 767px) 320px, 420px" className="object-cover object-top" />
            ) : (
              <div className="absolute inset-0 grid-bg flex items-center justify-center" aria-hidden="true">
                <Image src={logo} alt="" width={96} height={96} className="w-24 h-24 object-contain opacity-80" />
              </div>
            )}
          </div>
        </Reveal>

        <div className="min-w-0">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan mb-4">{a.eyebrow}</p>
            <h2 className="font-display text-[clamp(1.875rem,5.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-fg">{a.title}</h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-6 space-y-4 max-w-2xl">
            {a.paragraphs.map((p) => (
              <p key={p} className="text-base md:text-lg text-fg-soft leading-relaxed">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
            {a.facts.map((fact) => (
              <p key={fact.label} className="text-sm text-fg-muted">
                {fact.label}: <span className="font-semibold text-fg">{fact.value}</span>
              </p>
            ))}
          </Reveal>

          <h3 className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-fg-muted">{a.certsTitle}</h3>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {a.certs.map((cert, i) => {
              const [issuer, ...rest] = cert.split(" — ");
              const title = rest.join(" — ");
              return (
                <motion.li
                  key={cert}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                  className="fit-surface rounded-2xl p-4 flex items-start gap-3"
                >
                  <BadgeCheck className="w-6 h-6 shrink-0 text-cyan" aria-hidden="true" />
                  <p className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-cyan">{issuer}</span>
                    {/* Guion solo para lectores de pantalla: se lee igual que el texto original */}
                    <span className="sr-only"> — </span>
                    <span className="mt-1 block text-sm md:text-base font-semibold text-fg leading-snug">{title}</span>
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </FitnessSection>
  );
}
