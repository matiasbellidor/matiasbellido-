"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/* ═════════════════════════════════════════════════════════════
   Piezas compartidas de la landing /fitness.
   El copy vive en LanguageContext (t.fitness); acá solo hay
   estructura, estilos y el link de WhatsApp. Materiales
   (.liquid-glass, .liquid-cta, .fit-surface) en app/fitness/fitness.css.
   ═════════════════════════════════════════════════════════════ */

/* Número de Bellido Asesoramientos (el mismo del PDF de la propuesta).
   wa.me necesita el número en formato internacional, sin "+" ni espacios. */
export const WHATSAPP_NUMBER = "5491168300606";

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* Email → directo a Gmail, sin el diálogo de "¿con qué app abrir?" que da
   un mailto: en la compu (pedido de Matías, 2026-11-06):
   - Compu: Gmail web listo para escribir, en una pestaña nueva; /fitness
     queda abierta.
   - Android: la app de Gmail (intent de Chrome al paquete
     com.google.android.gm, acción SENDTO). Si no la tiene, Chrome abre Gmail
     web (browser_fallback_url).
   - iPhone/iPad: la app de Gmail (esquema googlegmail://). Si a los 2 s la
     página sigue visible y con foco (no tiene la app), abre su app de mail
     con mailto:.
   El HTML del servidor trae el link de la compu; en el celular se cambia al
   montar la página. Los de celular no se pueden probar sin un teléfono real:
   si cambian, probarlos en uno. */
export const gmailWebUrl = (to: string) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;

type MailPlatform = "desktop" | "android" | "ios";

function mailPlatform(): MailPlatform {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  // iPadOS se presenta como Mac: se lo reconoce por la pantalla táctil
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
}

export function useGmailLink(to: string) {
  const [platform, setPlatform] = useState<MailPlatform>("desktop");
  useEffect(() => setPlatform(mailPlatform()), []);
  const web = gmailWebUrl(to);

  if (platform === "android") {
    return {
      href: `intent:${to}#Intent;scheme=mailto;package=com.google.android.gm;action=android.intent.action.SENDTO;S.browser_fallback_url=${encodeURIComponent(web)};end`,
    };
  }
  if (platform === "ios") {
    const app = `googlegmail:///co?to=${encodeURIComponent(to)}`;
    return {
      href: app,
      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const fallback = setTimeout(() => {
          if (document.visibilityState === "visible" && document.hasFocus()) window.location.href = `mailto:${to}`;
        }, 2000);
        const cancel = () => clearTimeout(fallback);
        document.addEventListener("visibilitychange", cancel, { once: true });
        window.addEventListener("pagehide", cancel, { once: true });
        window.location.href = app;
      },
    };
  }
  return { href: web, target: "_blank", rel: "noopener noreferrer" };
}

/* Logo de WhatsApp en PNG con fondo transparente (glifo de Simple Icons,
   CC0, el mismo de Vibear, en el verde de WhatsApp sobre un círculo blanco).
   Uso nominativo: indica a dónde lleva el botón. */
const WHATSAPP_LOGO = "/fitness/whatsapp-logo.png";

/* Cobro por Mercado Pago (datos de Matías, 2026-11-06). El QR
   (public/fitness/mercadopago-qr.svg) codifica `link` y se verificó
   leyéndolo con zxing: si cambia el link, regenerar el QR y volver a leerlo. */
export const MERCADO_PAGO = {
  alias: "matibellido",
  cvu: "0000003100067468547403",
  name: "Matias Rodrigo Bellido",
  link: "https://mpago.la/1hKUPFy",
  qr: "/fitness/mercadopago-qr.svg",
  logo: "/fitness/mercadopago-logo.png",
};

/* Formulario que se completa después de pagar ("Formulario - Asesoramientos
   Bellido", Google Forms de Matías, 2026-11-06). Es el link público de
   respuesta (/viewform), no el de edición (/edit): ese pide permisos.
   Vacío = el último paso pide solo el comprobante por WhatsApp. */
export const PURCHASE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScNHvgImZI2YxHBVhbx5Tng0rtq_2B7Yd_5ZKPGPEu4I9Xe9A/viewform";

/* Códigos de descuento: se restan solos en el carrito, del primer mes de los
   planes y packs (lo mensual; no las clases presenciales ni los infoproductos).
   El porcentaje NO se muestra en ningún texto de la página (pedido de Matías).
   Valor = fracción: 0.25 = 25 %. Ojo: está en el código del sitio, así que
   quien mire el código fuente (el repo es público) lo puede leer. */
export const DISCOUNT_CODES: Record<string, number> = {
  BELLIDO25OFF: 0.25,
};

export const isValidCode = (code: string) => Object.prototype.hasOwnProperty.call(DISCOUNT_CODES, code);

/* Precios en pesos argentinos, sin decimales: 297000 → "$ 297.000" */
const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const formatARS = (n: number) => ars.format(n);

/* Curva de easing del resto del sitio (Hero y Footer del portfolio) */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Fotos que encontró app/fitness/page.tsx en public/fitness/.
   null = todavía no está → se muestra el placeholder. */
export type FitnessAssets = {
  hero: string | null;
  about: string | null;
  /** n = número del cliente en el nombre del archivo (clientes 1 …) */
  clients: { n: number; before: string | null; after: string | null }[];
};

const SUBLINE = "Asesoramientos";

/* Logotipo "Bellido Asesoramientos", como el logo del portfolio:
   "BELLIDO" en Cinzel (tipografía de marca, ÚNICO uso de esa fuente) y
   debajo "ASESORAMIENTOS" en Inter, con las letras repartidas para ocupar
   exactamente el mismo ancho (flex justify-between), en cualquier tamaño.
   El tamaño se da con font-size en className; `sub` es la escala de la
   segunda línea (más grande en el header para que se lea). */
export function BrandName({ className = "", sub = 0.34 }: { className?: string; sub?: number }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="font-brand font-bold uppercase tracking-[0.04em] text-fg">Bellido</span>
      <span aria-hidden="true" className="mt-[0.12em] flex justify-between font-sans font-semibold uppercase text-cyan" style={{ fontSize: `${sub}em` }}>
        {[...SUBLINE].map((letter, i) => (
          <span key={i}>{letter}</span>
        ))}
      </span>
      {/* La línea de arriba son letras sueltas: el lector de pantalla lee esta */}
      <span className="sr-only"> {SUBLINE}</span>
    </span>
  );
}

/* Entrada al hacer scroll: sube y aparece una sola vez.
   Con "reducir movimiento" (MotionConfig en FitnessLanding) queda solo el fade. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Contenedor de sección. Escala de 4/8 px: gutter 16/24/64, 64 px entre
   secciones en mobile y 96 px en desktop (más aire entre que dentro). */
export function FitnessSection({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-4 sm:px-6 md:px-16 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

/* Eyebrow + título + bajada: los tres niveles de cada sección. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
  className = "",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`mb-12 max-w-3xl ${center ? "text-center mx-auto" : ""} ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan mb-4">{eyebrow}</p>
      <h2 className="font-display text-[clamp(1.875rem,5.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-fg">
        {title}
      </h2>
      {intro && (
        <p className={`mt-6 text-base md:text-lg text-fg-soft leading-relaxed max-w-2xl ${center ? "mx-auto" : ""}`}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}

/* Botón de WhatsApp: el único color de acción de la página, en vidrio
   teñido (.liquid-cta), con el logo en PNG. Mismo componente en el header,
   el hero, los planes y el contacto. `labelFrom` esconde el texto debajo
   de ese ancho y deja solo el logo (el aria-label mantiene el nombre).
   variant="quiet": misma forma, plano y más chico, para cuando al lado hay
   otra acción principal (ej. "Agregar al carrito") y no tiene que competir. */
export function WhatsAppButton({
  message,
  label,
  size = "md",
  labelFrom,
  variant = "primary",
  className = "",
}: {
  message: string;
  label: string;
  size?: "sm" | "md" | "lg";
  labelFrom?: "sm" | "min400";
  variant?: "primary" | "quiet";
  className?: string;
}) {
  if (variant === "quiet") {
    return (
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={`fit-surface fit-focus inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full pl-1 pr-4 text-sm font-medium text-fg-soft transition-colors hover:text-fg hover:border-cyan/40 touch-manipulation ${className}`}
      >
        <Image src={WHATSAPP_LOGO} alt="" width={32} height={32} className="shrink-0 rounded-full" style={{ width: 32, height: 32 }} />
        <span>{label}</span>
      </a>
    );
  }
  const sizes = {
    sm: { box: "h-10 pl-1 pr-4 text-sm gap-2", logo: 32 },
    md: { box: "h-12 pl-1 pr-6 text-base gap-3", logo: 40 },
    // < sm: menos aire para que "Message me on WhatsApp" entre a 320 px
    lg: { box: "h-14 pl-2 pr-5 sm:pr-8 text-base md:text-lg gap-2 sm:gap-3", logo: 40 },
  }[size];
  const hideLabel = labelFrom === "sm" ? "hidden sm:inline" : labelFrom === "min400" ? "hidden min-[400px]:inline" : "";
  const iconOnly = labelFrom === "sm" ? "max-sm:pr-1" : labelFrom === "min400" ? "max-[399px]:pr-1" : "";

  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`liquid-cta inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold touch-manipulation ${sizes.box} ${iconOnly} ${className}`}
    >
      <Image
        src={WHATSAPP_LOGO}
        alt=""
        width={sizes.logo}
        height={sizes.logo}
        className="shrink-0 rounded-full shadow-[0_1px_4px_rgb(0_0_0/0.25)]"
        style={{ width: sizes.logo, height: sizes.logo }}
      />
      <span className={hideLabel}>{label}</span>
    </a>
  );
}

/* Botón secundario (anclas, sin WhatsApp): plano, de menor peso que el CTA. */
export function SecondaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`fit-surface fit-focus inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-medium text-fg transition-colors hover:border-cyan/50 hover:text-cyan touch-manipulation ${className}`}
    >
      {children}
    </a>
  );
}
