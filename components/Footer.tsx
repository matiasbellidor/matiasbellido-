"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Magnetic from "@/components/Magnetic";
import CVModal from "@/components/CVModal";
import ContactForm from "@/components/ContactForm";
/* El mismo ícono del Header (y del favicon) cierra la página */
import logo from "@/app/icon.png";
/* Logos importados (no "/logos/…" como texto): el link lleva una huella del
   contenido, así un logo nuevo con el mismo nombre se ve al toque */
import linkedinLogo from "@/public/logos/linkedin-round.png";
import githubLogo from "@/public/logos/github.png";
import whatsappLogo from "@/public/logos/whatsapp-round.png";

/* Curva de easing premium (la misma del Hero) */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const EMAIL = "rbellidomatias@gmail.com";

/* Único lugar del sitio con las redes. Cada botón usa el logo PNG de su app
   (public/logos), no un ícono genérico. */
const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/matiasbellido", logo: linkedinLogo },
  // GitHub: el logo original (círculo blanco con el gato), un poco más grande que los otros
  { label: "GitHub", href: "https://github.com/matiasbellidor", logo: githubLogo, big: true },
  { label: "WhatsApp", href: "https://wa.me/message/RRG5RHLSINR3M1", logo: whatsappLogo },
];

/* Pill simétrica: el logo (ya redondo, del color de su marca) pegado a la izquierda, el nombre en
   el medio y, a la derecha, un hueco del mismo ancho que el círculo; así el
   texto queda centrado en el botón. El hueco puede achicarse (a 320 px
   "WhatsApp" no entraría) antes que cortar el nombre. px-[5px] + 1 px de
   borde del vidrio = 6 px al costado, lo mismo que arriba y abajo. */
const socialClass =
  "w-full h-11 glass rounded-full flex items-center px-[5px] text-sm font-semibold text-fg-soft hover:text-cyan hover:shadow-glow transition-all touch-manipulation";
const logoCircle = "h-8 w-8 shrink-0 rounded-full";
/* 34 px = el máximo que entra en la pill de 44 px dejando 5 px de aire arriba y abajo */
const logoCircleBig = "h-[34px] w-[34px] shrink-0 rounded-full shadow-[0_1px_4px_rgb(0_0_0/0.25)]";
const logoSpacer = <span aria-hidden="true" className="w-8 shrink" />;
const logoSpacerBig = <span aria-hidden="true" className="w-[34px] shrink" />;

export default function Footer() {
  const { t } = useLanguage();
  const reduced = !!useReducedMotion();
  const [cvOpen, setCvOpen] = useState(false);
  const closeCv = useCallback(() => setCvOpen(false), []);

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
        <motion.div variants={fadeUp} className="max-w-2xl mx-auto mb-10">
          <ContactForm to={EMAIL} />
        </motion.div>

        {/* Redes + CV: un solo juego de enlaces, con logo Y texto. Las 4
            pills miden lo mismo: grilla 2×2 en mobile y una fila desde md. */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          {SOCIAL_LINKS.map(({ label, href, logo: src, big }) => (
            <Magnetic key={label} strength={0.45} className="w-full">
              <a href={href} target="_blank" rel="noopener noreferrer" className={socialClass}>
                <Image src={src} alt="" width={big ? 34 : 32} height={big ? 34 : 32} className={big ? logoCircleBig : logoCircle} />
                <span className="flex-1 text-center whitespace-nowrap">{label}</span>
                {big ? logoSpacerBig : logoSpacer}
              </a>
            </Magnetic>
          ))}
          <Magnetic strength={0.45} className="w-full">
            {/* Abre el CV en un modal, sin salir de la página. No es una app:
                lleva el ícono de documento en un círculo lleno del color de acción */}
            <button
              type="button"
              onClick={() => setCvOpen(true)}
              className={socialClass}
              aria-label="Curriculum Vitae"
              aria-haspopup="dialog"
            >
              <span className={`${logoCircle} grid place-items-center bg-electric`}>
                <FileText className="w-4 h-4 text-white" aria-hidden="true" />
              </span>
              <span className="flex-1 text-center whitespace-nowrap">CV</span>
              {logoSpacer}
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