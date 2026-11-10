"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Eye, X } from "lucide-react";
import { Emoji } from "./emoji";
import { translations, useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, type FitnessAssets } from "./shared";
import logo from "@/app/icon.png";
/* Logos de las instituciones que dieron los títulos (pedido de Matías), en el
   formato de public/logos: 144x144, círculo blanco. IFBB Academy: el emblema
   de su diploma original, limpio del marco; ISSA: el logo oficial (avatar
   del canal de YouTube de ISSA, 1424 px). Importados: link con huella. */
import ifbbLogo from "@/public/logos/ifbb-academy.png";
import issaLogo from "@/public/logos/issa.png";

/* Qué logo va con cada entidad ("IFBB Academy — …", "ISSA — …") */
const ISSUER_LOGOS: { match: RegExp; logo: StaticImageData }[] = [
  { match: /^IFBB/i, logo: ifbbLogo },
  { match: /^ISSA/i, logo: issaLogo },
];

type Certificate = FitnessAssets["certificates"][number];

/* Palabras sin tildes ni signos: "IFBB — Cross Pro Fitness" → ifbb cross pro fitness */
const words = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tildes sueltas tras NFD
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/* Imagen del visor: los mismos valores en el visor y en la precarga, así
   next/image arma el mismo link y la segunda vez sale de la caché */
const VIEWER_W = 1600;
const VIEWER_H = 1131;
const VIEWER_SIZES = "(max-width: 896px) 100vw, 864px";
const VIEWER_QUALITY = 85;

/* Palabras que no sirven para distinguir una certificación de otra */
const STOPWORDS = new Set(["and", "y", "de", "of", "the", "en", "in"]);

/* Qué archivo de public/fitness/Certificados va con cada certificación.
   El nombre del archivo tiene que tener la entidad (la primera palabra:
   "IFBB", "ISSA") y gana la certificación con más palabras del título en
   común. Así "IFBB Certified Personal Trainer.png" va con "IFBB Academy —
   Personal Trainer / Bodybuilding Instructor" (comparten personal y trainer)
   y no con "ISSA — Certified Personal Trainer" (otra entidad). Cada archivo
   va con una sola certificación: primero los pares con más palabras en
   común. Sin archivo, la certificación se muestra igual pero no se abre.
   Cada certificación trae sus nombres en los dos idiomas (mismo orden en
   es y en): "IFBB Nutrición Deportiva.jpg" o "IFBB Sports Nutrition.jpg"
   sirven igual, se vea la página en español o en inglés. */
function matchCertificates(certs: string[][], files: Certificate[]): (Certificate | null)[] {
  const pairs: { ci: number; fi: number; score: number }[] = [];
  certs.forEach((names, ci) => {
    const [issuer] = names[0].split(" — ");
    const entity = words(issuer)[0];
    const title = Array.from(new Set(names.flatMap((n) => words(n.split(" — ").slice(1).join(" "))))).filter((w) => !STOPWORDS.has(w));
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
  const matched = matchCertificates(
    a.certs.map((_, i) => [translations.es.fitness.about.certs[i], translations.en.fitness.about.certs[i]].filter(Boolean)),
    certificates,
  );

  /* Precarga (Matías: "que tarde lo menos posible en cargar"): cuando la
     sección está a 800 px de entrar, se piden en segundo plano las MISMAS
     imágenes que va a mostrar el visor (mismo sizes, quality y ancho → el
     mismo link de next/image). Al tocar una certificación ya está en caché;
     antes recién se pedía al abrirla y la primera vez el servidor además
     tenía que optimizarla. */
  const sectionRef = useRef<HTMLDivElement>(null);
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || warm || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWarm(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [warm]);
  const imageUrls = matched.filter((f): f is Certificate => !!f && !f.pdf).map((f) => f.url);

  return (
    <FitnessSection id="sobre-mi">
      {warm && (
        <div aria-hidden="true" className="sr-only">
          {imageUrls.map((url) => (
            <Image key={url} src={url} alt="" width={VIEWER_W} height={VIEWER_H} sizes={VIEWER_SIZES} quality={VIEWER_QUALITY} loading="eager" />
          ))}
        </div>
      )}
      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
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

          {/* data-step: parada extra de la navegación con flechas (SectionStepper):
              antes de pasar a Resultados, baja hasta que se vean los certificados
              (pedido de Matías). No cambia el diseño. */}
          <div data-step="">
          <h3 className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-fg-muted">{a.certsTitle}</h3>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {a.certs.map((cert, i) => {
              const [issuer, ...rest] = cert.split(" — ");
              const title = rest.join(" — ");
              const file = matched[i];
              const issuerLogo = ISSUER_LOGOS.find((l) => l.match.test(issuer))?.logo;
              const body = (
                <>
                  {/* Logo de la institución (alt vacío: el nombre está escrito al lado) */}
                  {issuerLogo ? (
                    <Image src={issuerLogo} alt="" width={96} height={96} className="h-12 w-12 shrink-0 rounded-full shadow-[0_2px_8px_rgb(0_0_0/0.35)]" />
                  ) : (
                    // Institución sin logo: birrete de Apple en un círculo del mismo tamaño que los logos
                    <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cyan/10">
                      <Emoji name="graduationCap" />
                    </span>
                  )}
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
                  // Entrada a tiempo: arranca un poco antes de entrar, demora tope de 0,12 s
                  viewport={{ once: true, margin: "0px 0px 15% 0px" }}
                  transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 3) * 0.04 }}
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
      </div>

      <CertificateViewer cert={viewing} onClose={() => setViewing(null)} />
    </FitnessSection>
  );
}

/* Certificado que todavía no se subió (pedido de Matías: "Error 404 con un UX
   más cool y creativo que siga la identidad de marca"). Un diploma en blanco:
   doble marco punteado como el de un diploma, un "404" cuyo 0 es un disco de
   pesas que gira despacio (solo transform; quieto con "reducir movimiento"), el
   texto y, como sello, el logo de Bellido todavía sin firmar. Colores de la
   marca (celeste y azul eléctrico sobre la superficie plana), sin vidrio:
   no se toca. En el celular deja de ser apaisado para que el texto entre. */
function WeightPlate({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="7" />
      <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="2" strokeOpacity="0.55" />
      {/* Agarres del disco */}
      {[0, 90, 180, 270].map((deg) => (
        <rect key={deg} x="46" y="17" width="8" height="12" rx="4" fill="currentColor" fillOpacity="0.55" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="9" fill="currentColor" />
      <circle cx="50" cy="50" r="4" fill="rgb(6 8 12)" />
    </svg>
  );
}

/* Los "4": degradé del color del texto al celeste de la marca (variables de
   globals.css; Tailwind no tiene from-fg/to-fg-muted y quedaban invisibles) */
const DIGIT_STYLE = { backgroundImage: "linear-gradient(180deg, var(--fg) 35%, rgb(var(--accent-cyan) / 0.75))" } as const;

function CertMissing() {
  const { t } = useLanguage();
  const a = t.fitness.about;
  return (
    <div className="fit-surface relative flex w-full min-h-[300px] sm:min-h-0 sm:aspect-[1.414] max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-10rem)] flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-10 text-center bg-[radial-gradient(circle_at_50%_40%,rgb(var(--accent-cyan)/0.10),transparent_60%)]">
      {/* Doble marco de diploma */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-2 sm:inset-3 rounded-xl border border-dashed border-cyan/35" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 sm:inset-6 rounded-lg border border-cyan/10" />

      <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{a.certMissing}</p>
      <div aria-hidden="true" className="relative mt-3 flex items-center gap-2 sm:gap-3 font-display text-7xl sm:text-8xl md:text-9xl font-bold leading-none tracking-tight">
        <span className="bg-clip-text text-transparent" style={DIGIT_STYLE}>4</span>
        <WeightPlate className="h-[0.78em] w-[0.78em] text-cyan drop-shadow-[0_0_18px_rgb(var(--accent-cyan)/0.35)] motion-safe:animate-[spin_9s_linear_infinite]" />
        <span className="bg-clip-text text-transparent" style={DIGIT_STYLE}>4</span>
      </div>
      <p className="relative mt-5 text-lg sm:text-xl font-semibold text-fg">{a.certMissingTitle}</p>
      <p className="relative mt-1.5 max-w-sm text-sm text-fg-soft leading-relaxed">{a.certMissingDesc}</p>

      {/* Sello del diploma: el logo, todavía sin firmar */}
      <div aria-hidden="true" className="absolute bottom-6 right-6 sm:bottom-9 sm:right-10 hidden min-[380px]:grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-full border border-dashed border-cyan/40 rotate-[-12deg]">
        <Image src={logo} alt="" width={40} height={40} className="h-6 w-6 sm:h-8 sm:w-8 opacity-40 grayscale" />
      </div>
    </div>
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
  /* Hasta que la imagen llega se ve un lugar del tamaño del diploma que late
     suave (con la precarga casi nunca se llega a ver) */
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

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
                  width={VIEWER_W}
                  height={VIEWER_H}
                  sizes={VIEWER_SIZES}
                  quality={VIEWER_QUALITY}
                  loading="eager"
                  onLoad={() => setLoadedUrl(cert.url)}
                  className={`block h-auto w-auto max-w-full max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-10rem)] rounded-2xl object-contain ${
                    loadedUrl === cert.url ? "" : "animate-pulse bg-cyan/[0.08] motion-reduce:animate-none"
                  }`}
                />
              ) : (
                <CertMissing />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
