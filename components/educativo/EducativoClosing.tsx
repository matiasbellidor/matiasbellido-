"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BrandName, FitnessSection, Reveal, SectionHeading, WhatsAppButton, useGmailLink, whatsappUrl } from "@/components/fitness/shared";
import { Emoji, type EmojiName } from "./emoji";
import { EDU_FORM_PREVIEW, EDU_FORM_URL, LINKEDIN_URL } from "./data";
import logo from "@/app/icon.png";
/* Logos de apps tal cual, sin círculo ni fondo blanco (regla de Matías del
   2026-11-18; los mismos PNG de los palacios de estudio) */
import gmailLogo from "@/public/educativo/gmail.png";
import linkedinLogo from "@/public/educativo/linkedin.png";
import formsLogo from "@/public/educativo/google-forms.png";

/* ── Preguntas frecuentes: acordeón, como en /fitness ──
   El alto se anima con grid-template-rows 0fr → 1fr (sin medir en JS). */
const GROUP_EMOJIS: EmojiName[] = ["book", "cart"];

export function EducativoFaq() {
  const { t } = useLanguage();
  const f = t.educativo.faq;

  return (
    <FitnessSection id="preguntas">
      <SectionHeading eyebrow={f.eyebrow} title={f.title} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {f.groups.map((group, g) => (
          <Reveal key={group.title} delay={g * 0.08}>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-fg-muted mb-4">
              <Emoji name={GROUP_EMOJIS[g % GROUP_EMOJIS.length]} className="w-[18px] h-[18px]" />
              {group.title}
            </h3>
            <ul className="space-y-3">
              {group.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </ul>
          </Reveal>
        ))}
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

/* ── Afiliados: una sola fila, más liviana que las secciones principales ──
   Solo los datos del pedido (25 % del pago inicial y 20 % residual): sin
   plazos, topes ni seguimiento. */
export function EducativoAffiliates() {
  const { t } = useLanguage();
  const af = t.educativo.affiliates;

  return (
    <FitnessSection id="afiliados">
      <Reveal>
        <div className="fit-surface rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan mb-3">
              <Emoji name="moneyBag" className="w-4 h-4" />
              {af.eyebrow}
            </p>
            <h2 className="font-display text-[clamp(1.25rem,3.5vw,1.75rem)] font-bold leading-snug tracking-tight text-fg">{af.title}</h2>
          </div>
          <WhatsAppButton message={af.message} label={af.cta} className="self-start md:self-auto shrink-0" />
        </div>
      </Reveal>
    </FitnessSection>
  );
}

/* ── Contacto (CTA final) y pie ──
   El mismo bloque que /fitness: WhatsApp grande; email (Gmail directo) y
   LinkedIn debajo, más chicos y neutros. Pie con la marca, la vuelta al
   portfolio, el botón de arrepentimiento (Res. 424/2020, se vende online)
   y el aviso de que no es un servicio oficial de la UBA. */
export function EducativoContact() {
  const { t } = useLanguage();
  const e = t.educativo;
  const c = e.contact;
  const gmail = useGmailLink(c.email);
  /* Filas de "otras vías": logo redondo a la izquierda, etiqueta chica arriba y el dato abajo */
  const row =
    "fit-surface fit-focus flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:border-cyan/40 touch-manipulation";

  return (
    <>
      <section id="contacto" className="px-4 sm:px-6 md:px-16 py-24 md:py-32">
        <Reveal className="max-w-5xl mx-auto">
          {/* Una sola tarjeta: a la izquierda el mensaje y el WhatsApp (la acción principal);
              a la derecha, las otras vías en filas iguales. En el celular se apila. */}
          <div className="liquid-glass rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
            <div className="min-w-0">
              <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.1] tracking-tight text-fg">{c.title}</h2>
              <p className="mt-4 text-base md:text-lg text-fg-soft leading-relaxed">{c.desc}</p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan/10 px-3 py-1.5 text-sm font-semibold text-fg">
                <Emoji name="telephone" className="w-4 h-4" />
                {c.freeCall}
              </p>
              <div className="mt-8">
                <WhatsAppButton message={e.whatsappMessage} label={c.cta} size="lg" />
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-fg-muted">{c.otherTitle}</p>
              <ul className="space-y-3">
                <li>
                  <a {...gmail} aria-label={c.emailLabel} className={row}>
                    <Image src={gmailLogo} alt="" width={36} height={36} className="shrink-0" style={{ width: 36, height: 36 }} />
                    <span className="min-w-0">
                      <span className="block text-xs text-fg-muted">Email</span>
                      <span className="block truncate text-sm font-semibold text-fg">{c.email}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={row}>
                    <Image src={linkedinLogo} alt="" width={36} height={36} className="shrink-0" style={{ width: 36, height: 36 }} />
                    <span className="min-w-0">
                      <span className="block text-xs text-fg-muted">LinkedIn</span>
                      <span className="block truncate text-sm font-semibold text-fg">
                        {c.linkedin}
                        <span className="sr-only"> {c.linkedinLabel}</span>
                      </span>
                    </span>
                  </a>
                </li>
                {/* Formulario (materia, clases, fecha del examen, contacto): después de pagar o para consultas */}
                {(EDU_FORM_URL || EDU_FORM_PREVIEW) && (
                  <li>
                    <a
                      href={EDU_FORM_URL || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={EDU_FORM_URL ? undefined : true}
                      className={row}
                    >
                      {/* Logo de Google Forms (PNG de 1024 px, se achica sin perder nitidez) */}
                      <Image src={formsLogo} alt="" width={36} height={36} className="shrink-0" style={{ width: 36, height: 36 }} />
                      <span className="min-w-0">
                        <span className="block text-xs text-fg-muted">{c.formQuestion}</span>
                        <span className="block text-sm font-semibold text-fg">
                          {c.formLink}
                          <span className="sr-only"> {c.linkedinLabel}</span>
                        </span>
                      </span>
                    </a>
                    {EDU_FORM_PREVIEW && <p className="mt-2 px-1 text-xs text-fg-muted">{c.formMissing}</p>}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="px-4 sm:px-6 md:px-16 pb-12">
        <div className="max-w-6xl mx-auto text-center md:text-left">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
          <div className="pt-8 flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
              <BrandName className="text-[1.75rem]" sub={0.38} />
            </div>
            <Link href="/" className="fit-focus inline-flex min-h-11 items-center rounded text-sm font-medium text-cyan hover:underline underline-offset-4">
              {e.footer.back}
            </Link>
          </div>
          <p className="mt-4 md:mt-6 text-sm text-fg-soft">{e.footer.rights}</p>
          <a
            href={whatsappUrl(e.footer.withdrawalMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="fit-focus mt-2 inline-flex min-h-11 items-center rounded text-sm font-semibold text-fg underline underline-offset-4 hover:text-cyan"
          >
            {e.footer.withdrawal}
          </a>
          <p className="mt-4 text-xs text-fg-muted leading-relaxed max-w-3xl mx-auto md:mx-0">{e.footer.notes}</p>
        </div>
      </footer>
    </>
  );
}
