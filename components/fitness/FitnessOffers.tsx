"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChefHat, Apple, HandCoins, Check, Tag, UserCheck, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, SectionHeading, WhatsAppButton, formatARS, isValidCode } from "./shared";
import { AddToCartButton, cleanCode, cleanName, useCart } from "./cart";

/* Un ícono por infoproducto, por id (no por posición: el orden de la lista puede cambiar) */
const PRODUCT_ICONS: Record<string, LucideIcon> = { anatomia: BookOpen, alimentacion: Apple, recetario: ChefHat };

/* Infoproductos y Afiliados (PDF, páginas 11 y 12). Superficies planas:
   el vidrio queda para los planes, que son la decisión principal. */
export function FitnessInfoproducts() {
  const { t } = useLanguage();
  const ip = t.fitness.infoproducts;

  return (
    <FitnessSection id="infoproductos">
      <SectionHeading eyebrow={ip.eyebrow} title={ip.title} intro={ip.intro} />
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ip.items.map((product, i) => {
          const Icon = PRODUCT_ICONS[product.id] ?? BookOpen;
          return (
            <motion.li
              key={product.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              className="fit-surface rounded-3xl p-6 flex flex-col"
            >
              <span className="w-12 h-12 rounded-2xl bg-cyan/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-cyan" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-fg">{product.title}</h3>
              <ul className="mt-3 space-y-2 flex-1">
                {product.items.map((item) => (
                  <li key={item} className="text-sm md:text-base text-fg-soft leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-display text-2xl font-bold text-fg tabular-nums">
                {formatARS(product.price)} <span className="text-sm font-semibold text-fg-muted">{ip.unit}</span>
              </p>
              <AddToCartButton id={product.id} className="mt-4 w-full" />
            </motion.li>
          );
        })}
      </ul>
    </FitnessSection>
  );
}

export function FitnessAffiliates() {
  const { t } = useLanguage();
  const af = t.fitness.affiliates;
  const cart = useCart();

  return (
    <FitnessSection id="afiliados">
      <Reveal>
        <div className="fit-surface rounded-3xl p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan mb-4">
              <HandCoins className="w-4 h-4" aria-hidden="true" />
              {af.eyebrow}
            </p>
            <h2 className="font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-fg">{af.title}</h2>
            <p className="mt-4 text-base md:text-lg text-fg-soft leading-relaxed">{af.intro}</p>
            <p className="mt-4 text-sm md:text-base text-fg-soft leading-relaxed">{af.payout}</p>
            <p className="mt-4 text-sm text-fg-muted">{af.example}</p>
            <WhatsAppButton message={af.message} label={af.cta} className="mt-8" />
          </div>
          <dl className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
            {[
              { value: af.firstValue, label: af.firstLabel },
              { value: af.afterValue, label: af.afterLabel },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-cyan/10 border border-cyan/20 p-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-none text-fg tabular-nums">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-sm text-fg-soft leading-snug">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {/* Dos bloques chicos: lo que se anota acá queda en el carrito y viaja
          en el mensaje del comprobante (ver cart.tsx) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Reveal className="h-full">
          <ReferralBox
            icon={Tag}
            title={af.referral.code.title}
            desc={af.referral.code.desc}
            label={af.referral.code.label}
            placeholder={af.referral.code.placeholder}
            value={cart.code}
            savedLabel={af.referral.code.applied}
            clean={cleanCode}
            validate={isValidCode}
            invalidMessage={af.referral.code.invalid}
            onSave={cart.setCode}
            maxLength={24}
            uppercase
          />
        </Reveal>
        <Reveal delay={0.1} className="h-full">
          <ReferralBox
            icon={UserCheck}
            title={af.referral.referrer.title}
            desc={af.referral.referrer.desc}
            label={af.referral.referrer.label}
            placeholder={af.referral.referrer.placeholder}
            value={cart.referrer}
            savedLabel={af.referral.saved}
            clean={cleanName}
            onSave={cart.setReferrer}
            maxLength={60}
          />
        </Reveal>
      </div>
    </FitnessSection>
  );
}

/* Un campo + "Guardar" dentro de la misma píldora (entra bien hasta en 320 px).
   Se guarda con el botón o con Enter; al guardar muestra el valor y un "Quitar".
   Si el valor cambia desde afuera (ej. se quita en el carrito), el campo se vacía. */
function ReferralBox({
  icon: Icon,
  title,
  desc,
  label,
  placeholder,
  value,
  savedLabel,
  clean,
  validate,
  invalidMessage,
  onSave,
  maxLength,
  uppercase = false,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  label: string;
  placeholder: string;
  value: string;
  /** "Código aplicado" / "Guardado en tu compra": lo que se lee junto al valor guardado */
  savedLabel: string;
  clean: (v: string) => string;
  /** Si está, el valor limpio se prueba antes de guardar; si falla se muestra invalidMessage */
  validate?: (v: string) => boolean;
  invalidMessage?: string;
  onSave: (v: string) => void;
  maxLength: number;
  uppercase?: boolean;
}) {
  const { t } = useLanguage();
  const r = t.fitness.affiliates.referral;
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  const errorId = `${id}-error`;
  useEffect(() => setDraft(value), [value]);

  const cleaned = clean(draft);
  const canSave = cleaned !== "" && cleaned !== value;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    if (validate && !validate(cleaned)) {
      setError(invalidMessage ?? "");
      return;
    }
    setError("");
    onSave(cleaned);
  };

  return (
    <form onSubmit={submit} className="fit-surface rounded-3xl p-6 h-full flex flex-col">
      <h3 className="flex items-center gap-3 font-display text-xl font-bold text-fg">
        <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-cyan/10">
          <Icon className="w-5 h-5 text-cyan" aria-hidden="true" />
        </span>
        {title}
      </h3>
      <p className="mt-3 flex-1 text-sm md:text-base text-fg-soft leading-relaxed">{desc}</p>

      <label htmlFor={id} className="mt-5 block text-sm font-semibold text-fg">
        {label}
      </label>
      <div className="mt-2 flex h-12 items-center gap-2 rounded-full border border-cyan/25 bg-transparent pl-5 pr-1.5 transition-colors focus-within:border-cyan">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => {
            setError("");
            setDraft(uppercase ? e.target.value.toUpperCase() : e.target.value);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          autoCapitalize={uppercase ? "characters" : "words"}
          spellCheck={false}
          // text-base (16 px): iOS no hace zoom al enfocar. Sin outline: el foco lo muestra la píldora
          className="min-w-0 flex-1 bg-transparent text-base text-fg placeholder:text-fg-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSave}
          className="liquid-cta fit-focus h-9 shrink-0 rounded-full px-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {r.save}
        </button>
      </div>

      {/* Error del código: role="alert" para que lo lea el lector de pantalla */}
      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Confirmación: se lee con lector de pantalla (aria-live) y deja quitarlo */}
      <p aria-live="polite" className="mt-3 flex min-h-9 items-center justify-between gap-3 text-sm">
        {value && !error && (
          <>
            <span className="flex min-w-0 items-center gap-2 text-fg">
              <Check className="w-4 h-4 shrink-0 text-cyan" aria-hidden="true" />
              <span className="[overflow-wrap:anywhere]">
                {savedLabel}: <strong>{value}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => onSave("")}
              className="fit-focus shrink-0 rounded-full px-3 h-9 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              {r.clear}
            </button>
          </>
        )}
      </p>
    </form>
  );
}
