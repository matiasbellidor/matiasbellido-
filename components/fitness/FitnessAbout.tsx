"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ExternalLink, Eye, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, type FitnessAssets } from "./shared";
import logo from "@/app/icon.png";

type Certificate = FitnessAssets["certificates"][number];

/* Palabras sin tildes ni signos: "IFBB — Cross Pro Fitness" → ifbb cross pro fitness */
const words = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tildes sueltas tras NFD
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/* Palabras que no sirven para distinguir una certificación de otra */
const STOPWORDS = new Set(["and", "y", "de", "of", "the", "en", "in"]);

/* Qué archivo de public/fitness/Certificados va con cada certificación.
   El nombre del archivo tiene que tener la entidad (la primera palabra:
   "IFBB", "ISSA") y gana la certificación con más palabras del título en
   común. Así "IFBB Certified Personal Trainer.png" va con "IFBB Academy —
   Personal Trainer / Bodybuilding Instructor" (comparten personal y trainer)
   y no con "ISSA — Certified Personal Trainer" (otra entidad). Cada archivo
   va con una sola certificación: primero los pares con más palabras en
   común. Sin archivo, la certificación se muestra igual pero no se abre. */
function matchCertificates(certs: string[], files: Certificate[]): (Certificate | null)[] {
  const pairs: { ci: number; fi: number; score: number }[] = [];
  certs.forEach((cert, ci) => {
    const [issuer, ...rest] = cert.split(" — ");
    const entity = words(issuer)[0];
    const title = words(rest.join(" ")).filter((w) => !STOPWORDS.has(w));
    files.forEach((file, fi) => {
      const fileWords = new Set(words(file.name));
      if (!entity || !fileWords.has(entity)) return;
      const score = new Set(title.filter((w) => fileWords.has(w))).size;
      if (score > 0) pairs.push({ ci, fi, score });
    });
  });
  pairs.sort((p, q) => q.score - p.score || p.ci - q.ci);
  const matched: (Certificate | null)[] = certs.map(() => null);
  const usedFiles = new Set<number>();
  for (const { ci, fi } of pairs) {
    if (matched[ci] || usedFiles.has(fi)) continue;
    matched[ci] = files[fi];
    usedFiles.add(fi);
  }
  return matched;
}

/* Quién soy + certificaciones. Las certificaciones son la señal de
   autoridad de la sección: chips sobrios con la entidad arriba y el
   título abajo, textuales (t.fitness.about.certs, "Entidad — Título").
   Todas se pueden abrir (pedido de Matías, 2026-11-10): una imagen se ve
   en un visor encima de la página (no se sale de la landing); un PDF se
   abre en otra pestaña. Si todavía no hay archivo en
   public/fitness/Certificados, el visor muestra "ERROR 404" (también pedido
   de Matías) hasta que lo suba: entonces sale la imagen, sin tocar código. */
export default function FitnessAbout({ photo, certificates }: { photo: string | null; certificates: Certificate[] }) {
  const { t } = useLanguage();
  const a = t.fitness.about;
  /** url null = la certificación todavía no tiene archivo */
  const [viewing, setViewing] = useState<{ label: string; url: string | null } | null>(null);
  const matched = matchCertificates(a.certs, certificates);

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
              const file = matched[i];
              const body = (
                <>
                  <BadgeCheck className="w-6 h-6 shrink-0 text-cyan" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-cyan">{issuer}</span>
                    {/* Guion solo para lectores de pantalla: se lee igual que el texto original */}
                    <span className="sr-only"> — </span>
                    <span className="mt-1 block text-sm md:text-base font-semibold text-fg leading-snug">{title}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-fg-soft">
                      {file?.pdf ? <ExternalLink className="w-3.5 h-3.5 text-cyan" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5 text-cyan" aria-hidden="true" />}
                      {a.certView}
                      {file?.pdf && <span className="sr-only"> {a.certNewTab}</span>}
                    </span>
                  </span>
                </>
              );
              const clickable = "fit-surface fit-focus rounded-2xl p-4 flex h-full w-full items-start gap-3 text-left transition-colors can-hover:hover:border-cyan/50 touch-manipulation";
              return (
                <motion.li
                  key={cert}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                >
                  {file?.pdf ? (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className={clickable}>
                      {body}
                    </a>
                  ) : (
                    <button type="button" onClick={() => setViewing({ label: `${issuer} — ${title}`, url: file?.url ?? null })} className={clickable}>
                      {body}
                    </button>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      <CertificateViewer cert={viewing} onClose={() => setViewing(null)} />
    </FitnessSection>
  );
}

/* Visor del certificado: la imagen entera, encima de la página. Mismo
   comportamiento que el carrito: foco en "cerrar", Escape o tocar afuera
   cierran, la página no scrollea abajo y al cerrar el foco vuelve a la
   certificación que se abrió. Va en un portal a <body>: dentro de la
   sección, un ancestro con transform (las animaciones de entrada) haría que
   el `fixed` se ubique respecto de él y no de la pantalla. */
function CertificateViewer({ cert, onClose }: { cert: { label: string; url: string | null } | null; onClose: () => void }) {
  const { t } = useLanguage();
  const a = t.fitness.about;
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeFn = useRef(onClose);
  closeFn.current = onClose;
  const open = cert !== null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFn.current();
      // "Cerrar" es lo único que se puede tocar: Tab no se va a la página de atrás
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!mounted) return null; // el servidor no tiene document.body
  return createPortal(
    <AnimatePresence>
      {cert && (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-title"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="liquid-glass relative flex max-h-full w-full max-w-4xl flex-col rounded-3xl p-3 sm:p-4"
          >
            <div className="flex items-center justify-between gap-4 pb-3 pl-2 sm:pl-3">
              <h2 id="cert-title" className="min-w-0 text-sm sm:text-base font-semibold text-fg leading-snug">
                {cert.label}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={a.certClose}
                className="fit-focus grid shrink-0 place-items-center w-10 h-10 rounded-full text-fg transition-colors hover:bg-cyan/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* min-h-0 + max-h: la imagen se achica para entrar entera en la pantalla, sin cortarse */}
            <div className="min-h-0 flex-1 flex items-center justify-center">
              {cert.url ? (
                <Image
                  src={cert.url}
                  alt={`${a.certAlt}: ${cert.label}`}
                  width={1600}
                  height={1131}
                  sizes="(max-width: 896px) 100vw, 864px"
                  quality={85}
                  className="block h-auto w-auto max-w-full max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-10rem)] rounded-2xl object-contain"
                />
              ) : (
                // Todavía sin archivo: un lugar del tamaño de un diploma con "ERROR 404"
                <div className="fit-surface grid w-full aspect-[1.414] max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-10rem)] place-items-center rounded-2xl">
                  <p className="font-display text-4xl sm:text-6xl font-bold tracking-widest text-fg-muted">{a.certMissing}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
