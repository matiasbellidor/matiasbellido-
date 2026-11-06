"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { BrandName, Reveal, WhatsAppButton, useGmailLink, whatsappUrl } from "./shared";
import logo from "@/app/icon.png";

/* Contacto (PDF): el único momento centrado de la página. El objetivo es
   que escriban por WhatsApp: ese es el botón grande; el email va debajo,
   con la misma forma pero más chico y neutro. El teléfono no se repite
   (ya está detrás del botón). Pie con la marca en su tipografía, la vuelta
   al portfolio y el aviso de salud. */
export default function FitnessFinalCta() {
  const { t } = useLanguage();
  const f = t.fitness;
  const c = f.contact;
  // Abre Gmail directo: web en otra pestaña en la compu, la app en el celular (ver useGmailLink)
  const gmail = useGmailLink(c.email);

  return (
    <>
      <section id="contacto" className="px-4 sm:px-6 md:px-16 py-24 md:py-32">
        <Reveal className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-fg">{c.title}</h2>
          <p className="mt-6 text-base md:text-lg text-fg-soft leading-relaxed max-w-xl mx-auto">{c.desc}</p>
          <p className="mt-4 text-sm font-semibold text-cyan">{c.freeCall}</p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <WhatsAppButton message={f.whatsappMessage} label={c.cta} size="lg" />
            {/* Misma forma que el de WhatsApp (logo en círculo a la izquierda),
                más chico y neutro: es la segunda opción, no compite */}
            <a
              {...gmail}
              aria-label={c.emailLabel}
              className="fit-surface fit-focus inline-flex max-w-full h-10 items-center gap-2 rounded-full pl-1 pr-4 text-sm font-medium text-fg-soft transition-colors hover:text-fg hover:border-cyan/40 touch-manipulation"
            >
              <Image
                src="/fitness/gmail-logo.png"
                alt=""
                width={32}
                height={32}
                className="shrink-0 rounded-full shadow-[0_1px_4px_rgb(0_0_0/0.25)]"
                style={{ width: 32, height: 32 }}
              />
              <span className="truncate">{c.email}</span>
            </a>
          </div>
        </Reveal>
      </section>

      {/* Pie: centrado en el celular (pedido de Matías); desde md, la marca a
          la izquierda y la vuelta al portfolio a la derecha, con los textos
          alineados a la izquierda */}
      <footer className="px-4 sm:px-6 md:px-16 pb-12">
        <div className="max-w-6xl mx-auto text-center md:text-left">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
          <div className="pt-8 flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
              <BrandName className="text-[1.75rem]" sub={0.38} />
            </div>
            {/* min-h-11: 44 px de zona táctil (en el celular medía 20 px de alto) */}
            <Link href="/" className="fit-focus inline-flex min-h-11 items-center rounded text-sm font-medium text-cyan hover:underline underline-offset-4">
              {f.footer.back}
            </Link>
          </div>
          <p className="mt-4 md:mt-6 text-sm text-fg-soft">{f.footer.rights}</p>
          {/* Botón de arrepentimiento (Res. 424/2020): obligatorio en ventas
              online en Argentina; abre WhatsApp con el pedido precargado */}
          <a
            href={whatsappUrl(f.footer.withdrawalMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="fit-focus mt-2 inline-flex min-h-11 items-center rounded text-sm font-semibold text-fg underline underline-offset-4 hover:text-cyan"
          >
            {f.footer.withdrawal}
          </a>
          <p className="mt-4 text-xs text-fg-muted leading-relaxed max-w-3xl mx-auto md:mx-0">{f.footer.health}</p>
        </div>
      </footer>
    </>
  );
}
