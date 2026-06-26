"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, MapPin, Linkedin, Github, Phone, ArrowUpRight, Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Magnetic from "@/components/Magnetic";

/* Curva de easing premium (la misma del Hero) */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const EMAIL = "rbellidomatias@gmail.com";
const MAILTO_URL = `mailto:${EMAIL}`;
const MAPS_URL =
  "https://www.google.com/maps/place/Buenos+Aires/@-34.615796,-58.5156997,12z/data=!3m1!4b1!4m6!3m5!1s0x95bcca3b4ef90cbd:0xa0b3812e88e88e87!8m2!3d-34.6036739!4d-58.3821215!16zL20vMDFseTVt";

export default function Footer() {
  const { t } = useLanguage();
  const reduced = !!useReducedMotion();
  const [copied, setCopied] = useState(false);

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
     eyebrow → título → texto → tarjetas → redes */
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
    <footer id="contact" className="px-6 md:px-16 py-16 border-t border-white/5">
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
          className="font-display text-5xl md:text-7xl font-bold gradient-text mb-6"
        >
          {t.footer.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-xl text-fg-soft max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t.footer.desc}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="grid sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto"
        >
          {/* Tarjeta de Email = CTA principal.
             Estructura: la tarjeta entera es un enlace mailto, con un
             botón de copiar SEPARADO (no anidado, para HTML válido).
             Borde de acento cyan + hover marcado para cargar el peso
             visual que dejó el botón azul eliminado. */}
          <div className="relative glass rounded-xl p-5 flex items-center gap-4 text-left border border-cyan/30 hover:border-cyan/60 hover:shadow-glow transition-all group">
            <a
              href={MAILTO_URL}
              className="flex items-center gap-4 flex-1 min-w-0"
              aria-label={`Enviar email a ${EMAIL}`}
            >
              <Mail className="w-5 h-5 text-cyan shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-fg-muted">{t.footer.emailLabel}</p>
                <p className="text-base truncate text-fg group-hover:text-cyan transition-colors">{EMAIL}</p>
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
            className="glass rounded-xl p-5 flex items-center gap-4 text-left hover:shadow-glow transition-all group"
          >
            <MapPin className="w-5 h-5 text-cyan shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-fg-muted">{t.footer.locationLabel}</p>
              <p className="text-base text-fg">{t.footer.location}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-fg-muted group-hover:text-cyan transition-all" />
          </a>
        </motion.div>

        {/* Redes sociales con efecto magnético (igual que en el Hero) */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-3"
        >
          <Magnetic strength={0.45}>
            <a
              href="https://www.linkedin.com/in/matiasbellido"
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-3 rounded-full hover:text-cyan hover:shadow-glow transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </Magnetic>
          <Magnetic strength={0.45}>
            <a
              href="https://github.com/rbellidomatias-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-3 rounded-full hover:text-cyan hover:shadow-glow transition-all"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </Magnetic>
          <Magnetic strength={0.45}>
            <a
              href="https://wa.me/message/RRG5RHLSINR3M1"
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-3 rounded-full hover:text-cyan hover:shadow-glow transition-all"
              aria-label="WhatsApp"
            >
              <Phone className="w-5 h-5" />
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* ── Franja inferior absoluta: nombre, bio y enlaces de texto ── */}
      <div className="max-w-5xl mx-auto mt-16 pt-10 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Nombre + bio */}
          <div className="text-center md:text-left">
            <p className="font-display text-xl font-bold text-fg">
              Matías Rodrigo Bellido
            </p>
            <p className="text-sm text-fg-soft mt-1">
              {t.footer.tagline}
            </p>
          </div>

          {/* Enlaces de texto explícitos (para quien no reconoce los íconos) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <a
              href={MAILTO_URL}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass text-sm text-fg-soft hover:text-cyan hover:shadow-glow transition-all"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/matiasbellido"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass text-sm text-fg-soft hover:text-cyan hover:shadow-glow transition-all"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href="https://github.com/matiasbellidor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass text-sm text-fg-soft hover:text-cyan hover:shadow-glow transition-all"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://wa.me/message/RRG5RHLSINR3M1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass text-sm text-fg-soft hover:text-cyan hover:shadow-glow transition-all"
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-fg-faint mt-10">
          {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}