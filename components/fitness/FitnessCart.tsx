"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart, type CartStep } from "./cart";
import { formatARS, MERCADO_PAGO, PURCHASE_FORM_URL, WhatsAppButton } from "./shared";

const STEPS: CartStep[] = ["cart", "pay", "done"];

/* Reemplaza {llave} del texto por su valor. Con función (no con un string)
   para que un "$&" escrito por la persona no se interprete como patrón. */
const fill = (template: string, vars: Record<string, string>) => template.replace(/\{(\w+)\}/g, (m, key: string) => vars[key] ?? m);

/* Botón flotante del carrito (aparece con el primer producto) y el panel
   de compra: un stepper de 3 pasos para que se vea cuánto falta
   (Carrito → Pago → Formulario). El pago es una transferencia por
   Mercado Pago a la cuenta de Matías (link, QR, alias y CVU); no hay
   confirmación automática, así que el último paso pide el formulario o
   el comprobante. Mobile: hoja desde abajo. Desktop: panel a la derecha. */
export default function FitnessCart() {
  const { t } = useLanguage();
  const c = t.fitness.cart;
  const cart = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // cart.close cambia de identidad con cada cambio del carrito: se lee por ref
  // para que el efecto corra solo al abrir y cerrar (si no, el foco saltaría
  // al botón de cerrar cada vez que se toca − o +)
  const closeFn = useRef(cart.close);
  closeFn.current = cart.close;

  // Al abrir: foco en cerrar, scroll de la página trabado, Escape cierra; al cerrar, el foco vuelve
  useEffect(() => {
    if (!cart.isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeFn.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus?.();
    };
  }, [cart.isOpen]);

  const stepIndex = STEPS.indexOf(cart.step);
  const hasMonthly = cart.lines.some((l) => l.product.monthly);
  const summary = cart.lines.map((l) => `${l.product.name}${l.qty > 1 ? ` ×${l.qty}` : ""}`).join(", ");
  // Lo anotado en Afiliados va en el mensaje del comprobante para que Matías lo vea
  const extras =
    (cart.code ? fill(c.extrasCode, { code: cart.code }) : "") + (cart.referrer ? fill(c.extrasReferrer, { name: cart.referrer }) : "");

  return (
    <>
      <AnimatePresence>
        {cart.count > 0 && !cart.isOpen && (
          <motion.button
            type="button"
            onClick={cart.open}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            aria-label={`${c.open}: ${cart.count} · ${formatARS(cart.total)}`}
            className="liquid-glass fit-focus fixed bottom-4 right-4 z-50 flex h-14 items-center gap-3 rounded-full pl-4 pr-5 text-fg touch-manipulation"
          >
            <span className="relative">
              <ShoppingCart className="w-6 h-6 text-cyan" aria-hidden="true" />
              <motion.span
                key={cart.count}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-3 grid min-w-5 h-5 place-items-center rounded-full bg-electric px-1 text-[11px] font-bold text-white"
              >
                {cart.count}
              </motion.span>
            </span>
            <span className="text-sm font-semibold tabular-nums">{formatARS(cart.total)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cart.isOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cart.close} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-title"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-glass absolute inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl sm:inset-x-auto sm:right-3 sm:top-3 sm:bottom-3 sm:max-h-none sm:w-[440px] sm:rounded-3xl flex flex-col"
            >
              {/* Encabezado + stepper */}
              <div className="px-6 pt-6 pb-4 border-b border-cyan/15">
                <div className="flex items-center justify-between gap-4">
                  <h2 id="cart-title" className="font-display text-xl font-bold text-fg">
                    {c.title}
                  </h2>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={cart.close}
                    aria-label={c.close}
                    className="fit-focus grid place-items-center w-10 h-10 rounded-full text-fg transition-colors hover:bg-cyan/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ol className="mt-4 grid grid-cols-3 gap-2" aria-label={c.steps.join(" → ")}>
                  {c.steps.map((label, i) => {
                    const done = i < stepIndex;
                    const current = i === stepIndex;
                    return (
                      <li key={label} aria-current={current ? "step" : undefined} className="flex flex-col gap-2">
                        <span className={`h-1 rounded-full transition-colors duration-300 ${done || current ? "bg-cyan" : "bg-cyan/15"}`} />
                        <span className={`flex items-center gap-1 text-xs font-semibold ${current ? "text-fg" : done ? "text-fg-soft" : "text-fg-muted"}`}>
                          {done ? <Check className="w-3.5 h-3.5 text-cyan" aria-hidden="true" /> : <span className="tabular-nums">{i + 1}.</span>}
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* min-h-0: sin esto el contenido largo (QR + datos) estira el
                  panel y empuja el pie con "Ya pagué" fuera de la pantalla */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
                {cart.step === "cart" && <CartStepItems />}
                {cart.step === "pay" && <PayStep />}
                {cart.step === "done" && (
                  <div>
                    <p className="font-display text-2xl font-bold text-fg">{c.doneTitle}</p>
                    <p className="mt-2 text-base text-fg-soft leading-relaxed">{c.doneDesc}</p>
                    {!PURCHASE_FORM_URL && <p className="mt-4 text-sm text-fg-soft leading-relaxed">{c.formPending}</p>}
                  </div>
                )}
              </div>

              {/* Pie: total y la acción del paso */}
              {cart.lines.length > 0 && (
                <div className="px-6 pt-4 pb-6 border-t border-cyan/15">
                  {cart.discount > 0 && (
                    <dl className="mb-3 space-y-1 text-sm text-fg-soft">
                      <div className="flex justify-between gap-4">
                        <dt>{c.subtotal}</dt>
                        <dd className="tabular-nums">{formatARS(cart.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between gap-4 text-cyan">
                        <dt>
                          {c.discount} · {cart.code}
                        </dt>
                        <dd className="tabular-nums font-semibold">−{formatARS(cart.discount)}</dd>
                      </div>
                    </dl>
                  )}
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-semibold uppercase tracking-wider text-fg-muted">{c.total}</span>
                    <span className="font-display text-2xl font-bold text-fg tabular-nums">{formatARS(cart.total)}</span>
                  </div>
                  {cart.step === "cart" && hasMonthly && <p className="mt-2 text-xs text-fg-muted">{c.monthNote}</p>}
                  <div className="mt-4 flex flex-col gap-3">
                    {cart.step === "cart" && (
                      <button type="button" onClick={() => cart.setStep("pay")} className="liquid-cta fit-focus h-12 rounded-full font-semibold">
                        {c.toPay}
                      </button>
                    )}
                    {cart.step === "pay" && (
                      <>
                        <button type="button" onClick={() => cart.setStep("done")} className="liquid-cta fit-focus h-12 rounded-full font-semibold">
                          {c.paid}
                        </button>
                        <button type="button" onClick={() => cart.setStep("cart")} className="fit-focus h-10 rounded-full text-sm font-medium text-fg-soft hover:text-fg">
                          {c.back}
                        </button>
                      </>
                    )}
                    {cart.step === "done" && (
                      <>
                        {PURCHASE_FORM_URL && (
                          <a href={PURCHASE_FORM_URL} target="_blank" rel="noopener noreferrer" className="liquid-cta fit-focus inline-flex h-12 items-center justify-center rounded-full font-semibold">
                            {c.formButton}
                          </a>
                        )}
                        <WhatsAppButton
                          message={fill(c.receiptMessage, { items: summary, total: formatARS(cart.total), extras })}
                          label={c.receipt}
                          variant={PURCHASE_FORM_URL ? "quiet" : "primary"}
                          className="w-full"
                        />
                        <button type="button" onClick={cart.clear} className="fit-focus h-10 rounded-full text-sm font-medium text-fg-soft hover:text-fg">
                          {c.finish}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Paso 1: lo que hay en el carrito. "Quitar" en rojo (acción destructiva);
   las clases presenciales tienen − / +. */
function CartStepItems() {
  const { t } = useLanguage();
  const c = t.fitness.cart;
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="mx-auto w-10 h-10 text-fg-faint" aria-hidden="true" />
        <p className="mt-4 text-base text-fg-soft">{c.empty}</p>
        <a href="#planes" onClick={cart.close} className="fit-focus mt-4 inline-flex rounded-full text-sm font-semibold text-cyan hover:underline underline-offset-4">
          {c.emptyCta}
        </a>
      </div>
    );
  }

  return (
    <>
    <ul className="space-y-3">
      {cart.lines.map((line) => (
        <li key={line.id} className="fit-surface rounded-2xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-fg">{line.product.name}</p>
              <p className="mt-1 text-xs text-fg-muted">
                {formatARS(line.product.price)} {line.product.unit}
              </p>
              {line.discounted && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-semibold text-fg">
                  <Check className="w-3.5 h-3.5 text-cyan" aria-hidden="true" />
                  {line.product.monthly ? c.discountChip : c.discountChipOnce}
                </p>
              )}
            </div>
            {line.discounted ? (
              <p className="text-right tabular-nums whitespace-nowrap">
                <span className="block text-sm text-fg-muted line-through">
                  <span className="sr-only">{c.originalPrice}: </span>
                  {formatARS(line.product.price * line.qty)}
                </span>
                <span className="block font-semibold text-cyan">
                  <span className="sr-only">{c.finalPrice}: </span>
                  {formatARS(line.finalPrice)}
                </span>
              </p>
            ) : (
              <p className="font-semibold text-fg tabular-nums whitespace-nowrap">{formatARS(line.product.price * line.qty)}</p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            {line.product.maxQty > 1 ? (
              <div className="inline-flex items-center rounded-full border border-cyan/20">
                <button type="button" onClick={() => cart.setQty(line.id, line.qty - 1)} aria-label={c.less} className="fit-focus grid place-items-center w-9 h-9 rounded-full text-fg hover:bg-cyan/10">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                  {line.qty}
                </span>
                <button
                  type="button"
                  onClick={() => cart.setQty(line.id, line.qty + 1)}
                  disabled={line.qty >= line.product.maxQty}
                  aria-label={c.more}
                  className="fit-focus grid place-items-center w-9 h-9 rounded-full text-fg hover:bg-cyan/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => cart.remove(line.id)}
              className="fit-focus inline-flex items-center gap-1 rounded-full px-3 h-9 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              {c.remove}
            </button>
          </div>
        </li>
      ))}
    </ul>
    {(cart.code || cart.referrer) && (
      <ul className="mt-4 space-y-2">
        {cart.code && (
          <ExtraRow label={c.codeLabel} value={cart.code} onRemove={() => cart.setCode("")} />
        )}
        {cart.referrer && <ExtraRow label={c.referrerLabel} value={cart.referrer} onRemove={() => cart.setReferrer("")} />}
      </ul>
    )}
    </>
  );
}

/* Código de descuento / quién recomendó, anotados en Afiliados */
function ExtraRow({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  const { t } = useLanguage();
  const c = t.fitness.cart;
  return (
    <li className="fit-surface flex items-center justify-between gap-3 rounded-2xl py-1 pl-4 pr-1">
      <p className="min-w-0 py-2 text-sm text-fg-soft [overflow-wrap:anywhere]">
        {label}: <span className="font-semibold text-fg">{value}</span>
      </p>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${c.removeExtra}: ${label}`}
        className="fit-focus grid shrink-0 place-items-center w-9 h-9 rounded-full text-fg-muted transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </li>
  );
}

/* Paso 2: pagar. En el celular, primero el botón (abre la app de Mercado
   Pago); en desktop, primero el QR (se escanea con el celular). */
function PayStep() {
  const { t } = useLanguage();
  const c = t.fitness.cart;
  const cart = useCart();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-xl font-bold text-fg">{c.payTitle}</p>
        <p className="mt-2 text-sm text-fg-soft leading-relaxed">{c.payIntro}</p>
        <p className="mt-4 font-display text-3xl font-bold text-fg tabular-nums">{formatARS(cart.total)}</p>
      </div>

      <div className="flex flex-col gap-6">
        <a
          href={MERCADO_PAGO.link}
          target="_blank"
          rel="noopener noreferrer"
          // Menos aire en celular: a 320 px el texto se partía en dos líneas
          className="liquid-cta fit-focus order-1 sm:order-2 inline-flex h-12 items-center justify-center gap-2 sm:gap-3 rounded-full pl-1 pr-4 sm:pr-6 whitespace-nowrap font-semibold"
        >
          <Image src={MERCADO_PAGO.logo} alt="" width={40} height={40} className="shrink-0 rounded-full" style={{ width: 40, height: 40 }} />
          {c.payButton}
        </a>
        <figure className="order-2 sm:order-1 flex flex-col items-center gap-3">
          {/* El QR va siempre sobre blanco: se escanea igual en los dos temas */}
          <span className="rounded-2xl bg-white p-3 shadow-sm">
            <Image src={MERCADO_PAGO.qr} alt={c.qrLabel} width={180} height={180} unoptimized className="block w-[180px] h-[180px]" />
          </span>
          <figcaption className="text-xs text-fg-muted text-center">{c.qrLabel}</figcaption>
        </figure>
      </div>

      <dl className="fit-surface rounded-2xl divide-y divide-cyan/10">
        <CopyRow label={c.aliasLabel} value={MERCADO_PAGO.alias} />
        <CopyRow label={c.cvuLabel} value={MERCADO_PAGO.cvu} />
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-xs text-fg-muted">{c.nameLabel}</dt>
          <dd className="text-sm font-semibold text-fg text-right">{MERCADO_PAGO.name}</dd>
        </div>
      </dl>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useLanguage();
  const c = t.fitness.cart;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el navegador bloqueó el portapapeles: el dato igual está a la vista */
    }
  };
  /* Grilla de 2 columnas: dt y dd quedan como hijos directos del div
     (lo que pide una <dl> válida) y el botón va en su propio dd a la derecha */
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-3">
      <dt className="col-start-1 text-xs text-fg-muted">{label}</dt>
      <dd className="col-start-1 min-w-0 text-sm font-semibold text-fg tabular-nums [overflow-wrap:anywhere]">{value}</dd>
      <dd className="col-start-2 row-start-1 row-span-2">
        <button
          type="button"
          onClick={copy}
          aria-label={`${copied ? c.copied : c.copy} ${label}`}
          className="fit-focus inline-flex items-center gap-1 rounded-full px-3 h-9 text-xs font-semibold text-cyan hover:bg-cyan/10"
        >
          {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
          {copied ? c.copied : c.copy}
        </button>
      </dd>
    </div>
  );
}
