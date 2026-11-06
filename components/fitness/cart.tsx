"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DISCOUNT_CODES, isValidCode } from "./shared";

/* ═════════════════════════════════════════════════════════════
   Carrito de /fitness: planes, packs, clases presenciales e
   infoproductos. Se guarda en el navegador (localStorage) para que
   sobreviva a una recarga y a la ida y vuelta a Mercado Pago: si la
   persona estaba en el paso de pago, al volver se abre el carrito ahí
   para que toque "Ya pagué" y complete el formulario.
   Solo guarda qué productos y cuántos, más lo que la persona anota en
   Afiliados: el código de descuento y el nombre de quien la recomendó.
   Queda en su navegador; a Matías le llega únicamente si lo manda en el
   mensaje de WhatsApp. No hay backend.
   ═════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "bellido-fitness-cart-v1";

export type CartStep = "cart" | "pay" | "done";
type CartLine = { id: string; qty: number };
type CartState = { lines: CartLine[]; step: CartStep; code: string; referrer: string };

const EMPTY: CartState = { lines: [], step: "cart", code: "", referrer: "" };

/* Lo que la persona escribe se limpia antes de guardarlo: el código va en
   mayúsculas, solo letras, números y guiones; el nombre, sin espacios de
   más ni saltos de línea. */
export const cleanCode = (v: string) => v.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
export const cleanName = (v: string) => v.replace(/\s+/g, " ").trim().slice(0, 60);

/* Lo que se puede comprar, armado desde t.fitness (nombre, precio, unidad) */
export type Product = { id: string; name: string; price: number; unit: string; maxQty: number; /** plan o pack mensual: el código de descuento se aplica al primer mes */ monthly: boolean };

type CartContextValue = {
  /** discounted: el código de descuento se aplicó a esta línea */
  lines: (CartLine & { product: Product; discounted: boolean })[];
  count: number;
  subtotal: number;
  /** Lo que se resta por el código (0 si no hay código o no hay planes/packs) */
  discount: number;
  total: number;
  step: CartStep;
  /** Código de descuento válido anotado en Afiliados ("" = ninguno). Ya está restado del total. */
  code: string;
  /** Nombre de quien recomendó ("" = nadie) */
  referrer: string;
  setCode: (code: string) => void;
  setReferrer: (name: string) => void;
  isOpen: boolean;
  has: (id: string) => boolean;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  setStep: (step: CartStep) => void;
  open: () => void;
  close: () => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/* Catálogo en el idioma actual. Los ids son estables (ver FitnessPlan.id). */
export function useCatalog(): Record<string, Product> {
  const { t } = useLanguage();
  const f = t.fitness;
  return useMemo(() => {
    const catalog: Record<string, Product> = {};
    for (const group of f.plans.groups) {
      for (const plan of group.plans) {
        if (plan.price !== null) catalog[plan.id] = { id: plan.id, name: plan.name, price: plan.price, unit: f.cart.units.month, maxQty: 1, monthly: true };
      }
    }
    const p = f.plans.inPerson;
    catalog[p.id] = { id: p.id, name: p.title, price: p.price, unit: p.unit, maxQty: 30, monthly: false };
    for (const item of f.infoproducts.items) {
      catalog[item.id] = { id: item.id, name: item.title, price: item.price, unit: f.infoproducts.unit, maxQty: 1, monthly: false };
    }
    return catalog;
  }, [f]);
}

function load(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const lines = Array.isArray(parsed.lines) ? parsed.lines.filter((l) => typeof l.id === "string" && l.qty > 0) : [];
    const step = parsed.step === "pay" || parsed.step === "done" ? parsed.step : "cart";
    return {
      lines,
      step: lines.length ? step : "cart",
      // los carritos guardados antes de esta versión no traen estos dos campos
      code: typeof parsed.code === "string" && isValidCode(cleanCode(parsed.code)) ? cleanCode(parsed.code) : "",
      referrer: typeof parsed.referrer === "string" ? cleanName(parsed.referrer) : "",
    };
  } catch {
    return EMPTY; // modo privado o storage bloqueado: carrito en memoria
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const [state, setState] = useState<CartState>(EMPTY);
  const [isOpen, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Se lee después de montar (el servidor no tiene localStorage): sin diferencias de hidratación
  useEffect(() => {
    const saved = load();
    setState(saved);
    if (saved.step !== "cart" && saved.lines.length) setOpen(true); // volvió de pagar
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* sin storage: sigue andando en memoria */
    }
  }, [state, ready]);

  const add = useCallback(
    (id: string) =>
      setState((s) => {
        const line = s.lines.find((l) => l.id === id);
        const max = catalog[id]?.maxQty ?? 1;
        if (line) return { ...s, lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(max, l.qty + 1) } : l)) };
        return { ...s, step: "cart", lines: [...s.lines, { id, qty: 1 }] };
      }),
    [catalog],
  );

  const setQty = useCallback(
    (id: string, qty: number) =>
      setState((s) => {
        const max = catalog[id]?.maxQty ?? 1;
        if (qty <= 0) return { ...s, lines: s.lines.filter((l) => l.id !== id) };
        return { ...s, lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(max, qty) } : l)) };
      }),
    [catalog],
  );

  const value = useMemo<CartContextValue>(() => {
    // Líneas cuyo producto ya no existe (ej. cambió un id) se ignoran
    const rate = isValidCode(state.code) ? DISCOUNT_CODES[state.code] : 0;
    const lines = state.lines
      .filter((l) => catalog[l.id])
      .map((l) => ({ ...l, product: catalog[l.id], discounted: rate > 0 && catalog[l.id].monthly }));
    const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
    const discount = Math.round(lines.filter((l) => l.discounted).reduce((n, l) => n + l.qty * l.product.price * rate, 0));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      discount,
      total: subtotal - discount,
      step: state.step,
      code: state.code,
      referrer: state.referrer,
      setCode: (code) => setState((s) => ({ ...s, code: isValidCode(cleanCode(code)) ? cleanCode(code) : "" })),
      setReferrer: (name) => setState((s) => ({ ...s, referrer: cleanName(name) })),
      isOpen,
      has: (id) => lines.some((l) => l.id === id),
      add,
      setQty,
      remove: (id) => setState((s) => ({ ...s, lines: s.lines.filter((l) => l.id !== id) })),
      setStep: (step) => setState((s) => ({ ...s, step })),
      open: () => setOpen(true),
      close: () => setOpen(false),
      clear: () => {
        setState(EMPTY);
        setOpen(false);
      },
    };
  }, [state, isOpen, catalog, add, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart va dentro de <CartProvider> (FitnessLanding)");
  return ctx;
}

/* "🛒 Agregar al carrito" (decisión de Matías: ese texto exacto). Se
   actualiza al instante (optimista). Si ya está, pasa a "En el carrito ·
   Ver" y abre el carrito; las clases presenciales suman una más. */
export function AddToCartButton({ id, className = "" }: { id: string; className?: string }) {
  const { t } = useLanguage();
  const c = t.fitness.cart;
  const cart = useCart();
  const catalog = useCatalog();
  const inCart = cart.has(id);
  const countable = (catalog[id]?.maxQty ?? 1) > 1;

  if (inCart && !countable) {
    return (
      <button
        type="button"
        onClick={cart.open}
        className={`fit-surface fit-focus inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-fg transition-colors hover:border-cyan/50 touch-manipulation ${className}`}
      >
        <Check className="w-5 h-5 text-cyan" aria-hidden="true" />
        {c.inCart}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => cart.add(id)}
      className={`liquid-cta fit-focus inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold touch-manipulation ${className}`}
    >
      {c.add}
    </button>
  );
}
