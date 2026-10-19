"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, MapPin, Linkedin, Github, Phone, ArrowUpRight, Copy, Check, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Magnetic from "@/components/Magnetic";
import CVModal from "@/components/CVModal";
import ContactForm from "@/components/ContactForm";
/* El mismo ícono del Header (y del favicon) cierra la página */
import logo from "@/app/icon.png";

/* Curva de easing premium (la misma del Hero) */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const EMAIL = "rbellidomatias@gmail.com";
const MAILTO_URL = `mailto:${EMAIL}`;
const MAPS_URL =
  "https://www.google.com/maps/place/Buenos+Aires/@-34.615796,-58.5156997,12z/data=!3m1!4b1!4m6!3m5!1s0x95bcca3b4ef90cbd:0xa0b3812e88e88e87!8m2!3d-34.6036739!4d-58.3821215!16zL20vMDFseTVt";

/* Único lugar del sitio con las redes (el Hero ya no las repite) */
const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/matiasbellido", Icon: Linkedin },
  { label: "GitHub", href: "https://github.com/matiasbellidor", Icon: Github },
  { label: "WhatsApp", href: "https://wa.me/message/RRG5RHLSINR3M1", Icon: Phone },
];

const socialClass =
  "w-full sm:w-auto glass px-5 py-3 rounded-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-fg-soft hover:text-cyan hover:shadow-glow transition-all touch-manipulation";

export default function Footer() {
  const { t } = useLanguage();
  const reduced = !!useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const closeCv = useCallback(() => setCvOpen(false), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Si el navegador bloquea el portapapeles, no rompemos nada */
    }
  };

  /* Stagger de entrada al hacer scroll hasta la sección:
     eyebrow → título → texto → formulario → tarjetas → redes */
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
    <footer id="contact" className="px-5 sm:px-6 md:px-16 py-16 border-t border-white/5">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.p
          variants={fadeUp}
          className="text-sm uppercase tracking-[0.3em] text-cyan mb-4"
        >
          {t.footer.eyebrow}
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-display text-[clamp(2.25rem,9vw,4.5rem)] leading-tight font-bold gradient-text mb-6"
        >
          {t.footer.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-xl text-fg-soft max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t.footer.desc}
        </motion.p>

        {/* Formulario = CTA principal: arma el email en Gmail u Outlook */}
        <motion.div variants={fadeUp} className="max-w-2xl mx-auto mb-4">
          <ContactForm to={EMAIL} />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto"
        >
          {/* Tarjeta de Email (dato de contacto, debajo del formulario).
             Estructura: la tarjeta entera es un enlace mailto, con un
             botón de copiar SEPARADO (no anidado, para HTML válido). */}
          <div className="relative glass rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left min-w-0 border border-cyan/30 hover:border-cyan/60 hover:shadow-glow transition-all group">
            <a
              href={MAILTO_URL}
              className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0"
              aria-label={`Enviar email a ${EMAIL}`}
            >
              <Mail className="w-5 h-5 text-cyan shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-fg-muted">{t.footer.emailLabel}</p>
                <p className="text-sm sm:text-base [overflow-wrap:anywhere] text-fg group-hover:text-cyan transition-colors">
                  {/* <wbr> → en pantallas angostas corta en la "@", no a mitad de palabra */}
                  {EMAIL.split("@")[0]}@<wbr />{EMAIL.split("@")[1]}
                </p>
              </div>
            </a>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Email copiado" : "Copiar email"}
              className="shrink-0 p-2 rounded-lg hover:bg-cyan/10 transition-colors touch-manipulation"
            >
              {copied ? (
                <Check className="w-4 h-4 text-cyan" />
              ) : (
                <Copy className="w-4 h-4 text-fg-muted hover:text-cyan transition-colors" />
              )}
            </button>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left min-w-0 hover:shadow-glow transition-all group"
          >
            <MapPin className="w-5 h-5 text-cyan shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-fg-muted">{t.footer.locationLabel}</p>
              <p className="text-base text-fg">{t.footer.location}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-fg-muted group-hover:text-cyan transition-all" />
          </a>
        </motion.div>

        {/* Redes + CV: un solo juego de enlaces, con ícono Y texto (antes
            había una fila de íconos y otra de texto con los mismos links).
            Mobile: grilla 2×2 simétrica; sm+: una fila centrada. */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center"
        >
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <Magnetic key={label} strength={0.45} className="w-full sm:w-auto">
              <a href={href} target="_blank" rel="noopener noreferrer" className={socialClass}>
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </a>
            </Magnetic>
          ))}
          <Magnetic strength={0.45} className="w-full sm:w-auto">
            {/* Abre el CV en un modal, sin salir de la página */}
            <button
              type="button"
              onClick={() => setCvOpen(true)}
              className={socialClass}
              aria-label="Curriculum Vitae"
              aria-haspopup="dialog"
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>CV</span>
            </button>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* ── Cierre: mismo lenguaje visual que el resto del sitio — divisor
          con degradé cyan (se ve en ambos temas; el border blanco no se veía
          en light), el logo del Header y el rol entre líneas como la firma
          de la cita de Habilidades. Entra con el mismo fade-up. ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-5xl mx-auto mt-16"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
        <div className="pt-10 flex flex-col items-center text-center">
          <Image src={logo} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
          <p className="mt-4 font-display text-xl font-bold text-fg">
            Matías Rodrigo Bellido
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-6 sm:w-12 shrink-0 bg-cyan/40" />
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium text-cyan">
              {t.footer.role}
            </p>
            <div className="h-px w-6 sm:w-12 shrink-0 bg-cyan/40" />
          </div>
          <p className="mt-3 text-sm text-fg-soft">
            {t.footer.tagline}
          </p>
          <p className="mt-8 text-xs text-fg-faint">
            {t.footer.rights}
          </p>
        </div>
      </motion.div>

      <CVModal open={cvOpen} onClose={closeCv} />
    </footer>
  );
}