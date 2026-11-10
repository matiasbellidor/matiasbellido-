"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Emoji } from "./emoji";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, SectionHeading, WhatsAppButton, formatARS } from "./shared";
import { AddToCartButton } from "./cart";

/* Servicios del PDF. Para no mostrar 8 tarjetas de golpe, un selector de
   dos opciones del MISMO ancho (Packs / Planes) en Liquid Glass; las
   tarjetas, también en vidrio, tienen todas el mismo ancho (grilla de
   columnas iguales: con 5 planes quedan 3 + 2, sin estirar ninguna).
   Sin "recomendado": el PDF no marca ninguno. Presencial 1 a 1 va aparte
   porque el PDF no detalla qué incluye. */
export default function FitnessPlans() {
  const { t } = useLanguage();
  const pl = t.fitness.plans;
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const group = pl.groups[active] ?? pl.groups[0];

  // Flechas izquierda/derecha entre pestañas (patrón ARIA de tabs)
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + pl.groups.length) % pl.groups.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <FitnessSection id="planes">
      <SectionHeading eyebrow={pl.eyebrow} title={pl.title} intro={pl.intro} center />

      <Reveal className="flex justify-center mb-4">
        <div
          role="tablist"
          aria-label={pl.tabsLabel}
          className="liquid-glass grid rounded-[1.75rem] p-1 w-full max-w-md"
          style={{ gridTemplateColumns: `repeat(${pl.groups.length}, minmax(0, 1fr))` }}
        >
          {pl.groups.map((g, i) => {
            const selected = i === active;
            return (
              <button
                key={g.id}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`plan-tab-${g.id}`}
                aria-selected={selected}
                aria-controls={`plan-panel-${g.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`fit-focus relative flex flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 min-h-14 transition-colors ${
                  selected ? "text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="plan-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-3xl bg-cyan/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] border border-cyan/30"
                  />
                )}
                {/* Nombre + en qué se diferencia: se elige sin leer las tarjetas */}
                <span className="relative text-sm md:text-base font-semibold leading-tight">{g.label}</span>
                <span className="relative text-xs font-medium leading-tight text-fg-soft">{g.sublabel}</span>
              </button>
            );
          })}
        </div>
      </Reveal>
      <p className="text-center text-sm md:text-base text-fg-soft max-w-2xl mx-auto mb-12">{group.desc}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={group.id}
          id={`plan-panel-${group.id}`}
          role="tabpanel"
          aria-labelledby={`plan-tab-${group.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {group.plans.map((plan) => (
            <article key={plan.name} className="liquid-glass rounded-3xl p-6 flex flex-col min-w-0">
              <h3 className="font-display text-2xl font-bold text-fg">{plan.name}</h3>
              {/* La diferencia principal, antes del precio y la lista */}
              <p className="mt-3 inline-flex self-start items-start gap-2 rounded-2xl bg-cyan/10 border border-cyan/20 px-3 py-2 text-sm font-semibold text-fg leading-snug">
                <Emoji name="sparkles" className="w-[18px] h-[18px]" />
                {plan.highlight}
              </p>
              <div className="mt-4 pb-6 border-b border-cyan/15">
                <p className="font-display text-3xl font-bold text-fg tabular-nums">{plan.price !== null ? formatARS(plan.price) : pl.priceFallback}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">{pl.billing}</p>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-fg-muted">{pl.includes}</p>
              <ul className="mt-3 space-y-3 flex-1">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-fg leading-snug">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-cyan" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {/* Acción principal: comprar; consultar queda como opción tranquila */}
              <div className="mt-8 flex flex-col gap-3">
                {plan.price !== null && <AddToCartButton id={plan.id} className="w-full" />}
                <WhatsAppButton
                  message={pl.message.replace("{plan}", plan.name)}
                  label={pl.cta}
                  variant={plan.price !== null ? "quiet" : "primary"}
                  className="w-full"
                />
              </div>
            </article>
          ))}
        </motion.div>
      </AnimatePresence>

      <Reveal className="mt-8">
        <div className="fit-surface rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <span className="shrink-0 w-12 h-12 rounded-2xl bg-cyan/10 flex items-center justify-center" aria-hidden="true">
            <Emoji name="weightlifter" className="w-8 h-8" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-bold text-fg">{pl.inPerson.title}</h3>
            <p className="mt-1 text-sm md:text-base text-fg-soft leading-relaxed">{pl.inPerson.desc}</p>
            <p className="mt-3 font-display text-2xl font-bold text-fg tabular-nums">
              {formatARS(pl.inPerson.price)} <span className="text-sm font-semibold text-fg-muted">{pl.inPerson.unit}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end shrink-0">
            <AddToCartButton id={pl.inPerson.id} />
            <WhatsAppButton message={pl.inPerson.message} label={pl.inPerson.cta} variant="quiet" />
          </div>
        </div>
      </Reveal>
    </FitnessSection>
  );
}
