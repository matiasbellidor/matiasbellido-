"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, FitnessSection, Reveal, SectionHeading, WhatsAppButton } from "@/components/fitness/shared";
import { Emoji } from "./emoji";
import { AddToCartButton } from "./cart";
import { PACKS, STORE_CART_URL, discountPct, formatPrice, type EducativoPack } from "./data";

/* ── Packs y servicios ──
   Precios en data.ts; descripciones en t.educativo.packs.
   Se compra con el carrito de la página, como en /fitness: "🛒 Agregar al
   carrito" es la acción principal de cada pack y "Consultar" (WhatsApp) la
   tranquila. Los links de la tienda son opcionales y secundarios.
   Arriba los tres packs de clases en tarjetas de vidrio (el Promotion Pack
   destacado); abajo, planes y clase suelta en filas, para que la página
   siga corta. */
export default function EducativoPacks() {
  const { t } = useLanguage();
  const p = t.educativo.packs;
  const packs = PACKS.filter((pack) => pack.group === "packs");
  const others = PACKS.filter((pack) => pack.group !== "packs");

  return (
    <FitnessSection id="packs">
      <SectionHeading eyebrow={p.eyebrow} title={p.title} center />

      {/* Lo que traen los tres packs, una sola vez: cada tarjeta muestra solo cuántas clases */}
      <p className="-mt-2 mb-8 mx-auto max-w-2xl flex items-start justify-center gap-2 text-center text-sm md:text-base text-fg-soft">
        <Check className="w-4 h-4 mt-1 shrink-0 text-cyan" aria-hidden="true" strokeWidth={3} />
        {p.common}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {packs.map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
            className="min-w-0"
          >
            <PackCard pack={pack} />
          </motion.div>
        ))}
      </div>

      <GroupTitle className="mt-14">{p.othersTitle}</GroupTitle>
      <ul className="space-y-3">
        {others.map((pack, i) => (
          <OtherRow key={pack.id} pack={pack} index={i} />
        ))}
      </ul>

      {/* El carrito vive en el botón flotante de abajo (EducativoCart), siempre a la vista.
          Sin aclaración de moneda: cada precio ya dice ARS (pedido de Matías). */}
      {STORE_CART_URL && (
        <Reveal className="mt-8 flex justify-center">
          <StoreLink href={STORE_CART_URL} label={p.storeAll} hidden={p.newTab} />
        </Reveal>
      )}
    </FitnessSection>
  );
}

function GroupTitle({ children, className = "" }: { children: string; className?: string }) {
  return <h3 className={`mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-fg-muted ${className}`}>{children}</h3>;
}

function PackCard({ pack }: { pack: EducativoPack }) {
  const { t } = useLanguage();
  const p = t.educativo.packs;

  return (
    <article
      className={`liquid-glass h-full rounded-3xl p-6 flex flex-col min-w-0 ${
        pack.featured ? "ring-2 ring-cyan/60 shadow-[0_0_0_6px_rgb(var(--accent-cyan)/0.08),0_20px_48px_-16px_rgb(var(--accent-electric)/0.6)]" : ""
      }`}
    >
      {/* Sello sobre el borde: no empuja el contenido, así los precios de la fila quedan alineados */}
      {pack.featured && (
        <p className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full bg-electric px-3 py-1 text-xs font-semibold text-white shadow-[0_4px_12px_-4px_rgb(var(--accent-electric)/0.8)]">
          <Emoji name="sparkles" className="w-4 h-4" />
          {p.featured}
        </p>
      )}
      <h3 className="font-display text-2xl font-bold text-fg">{pack.name}</h3>
      <Price pack={pack} className="mt-4 pb-6 border-b border-cyan/15" />
      <p className="mt-6 flex-1 text-sm md:text-base text-fg leading-relaxed">{p.descriptions[pack.id]}</p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <AddToCartButton id={pack.id} className="w-full" />
        <WhatsAppButton message={p.message.replace("{pack}", pack.name)} label={p.consult} variant="quiet" className="w-full" />
        <PackStoreLink pack={pack} />
      </div>
    </article>
  );
}

/* Precio actual grande; el de lista tachado arriba, con el descuento en número */
function Price({ pack, compact = false, className = "" }: { pack: EducativoPack; compact?: boolean; className?: string }) {
  const { t, lang } = useLanguage();
  const p = t.educativo.packs;
  const pct = discountPct(pack);

  return (
    <div className={className}>
      {pack.listPrice !== null && (
        <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted ${compact ? "md:justify-end" : ""}`}>
          <span>{p.before}</span>
          <s className="tabular-nums">{formatPrice(pack.listPrice, lang)}</s>
          {pct !== null && <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-xs font-semibold text-cyan tabular-nums">−{pct}&nbsp;%</span>}
        </p>
      )}
      <p className={`mt-1 font-display font-bold text-fg tabular-nums ${compact ? "text-2xl" : "text-3xl"}`}>{formatPrice(pack.price, lang)}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">{pack.unit === "month" ? p.perMonth : p.perClass}</p>
    </div>
  );
}

/* Link opcional a la tienda: "Ver en la tienda" solo si el pack tiene buyUrl.
   Cada descripción dice todo lo que incluye el pack: la página no manda a la
   tienda para entender qué se compra (pedido de Matías). */
function PackStoreLink({ pack }: { pack: EducativoPack }) {
  const { t } = useLanguage();
  const p = t.educativo.packs;
  if (!pack.buyUrl) return null;
  return <StoreLink href={pack.buyUrl} label={p.store} hidden={`${pack.name} ${p.newTab}`} />;
}

function StoreLink({ href, label, hidden }: { href: string; label: string; hidden: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fit-focus inline-flex min-h-11 items-center rounded text-sm font-semibold text-cyan underline underline-offset-4 hover:text-fg"
    >
      {label}
      <span className="sr-only"> {hidden}</span>
    </a>
  );
}

/* Planes y clase suelta: una fila por opción (nombre, una línea y todo lo
   que incluye · precio · acciones). La lista de cada plan es la de su ficha
   en la tienda: la persona entiende acá qué compra, sin salir de la página.
   En el celular se apila y los botones van a todo el ancho. */
function OtherRow({ pack, index }: { pack: EducativoPack; index: number }) {
  const { t } = useLanguage();
  const p = t.educativo.packs;
  const includes = pack.id in p.includes ? p.includes[pack.id as keyof typeof p.includes] : null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.06 }}
    >
      <article className="fit-surface rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] md:items-center gap-4 md:gap-8">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-fg">{pack.name}</h3>
          <p className="mt-1 text-sm text-fg-soft leading-relaxed">{p.descriptions[pack.id]}</p>
          {includes && (
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {includes.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-fg leading-snug">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-cyan" aria-hidden="true" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Price pack={pack} compact className="md:text-right" />
        <div className="flex flex-col items-center gap-2 md:w-60">
          <AddToCartButton id={pack.id} className="w-full" />
          <WhatsAppButton message={p.message.replace("{pack}", pack.name)} label={p.consult} variant="quiet" className="w-full" />
          <PackStoreLink pack={pack} />
        </div>
      </article>
    </motion.li>
  );
}
