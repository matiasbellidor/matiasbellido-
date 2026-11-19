"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
/* Los mismos códigos de descuento de /fitness (importados tal cual, sin copiarlos) */
import { DISCOUNT_CODES, isValidCode } from "@/components/fitness/shared";
import { Emoji } from "./emoji";
import { PACKS } from "./data";

/* ═════════════════════════════════════════════════════════════
   Carrito de /educativo: el mismo mecanismo que el de /fitness
   (components/fitness/cart.tsx), que no se puede reusar tal cual porque
   arma su catálogo desde t.fitness. Se guarda en el navegador
   (localStorage) para sobrevivir a una recarga y a la ida y vuelta a
   Mercado Pago: si la persona estaba en el paso de pago, al volver se
   abre el carrito ahí. Guarda qué packs, cuántos y el código de
   descuento. No hay backend.
   Códigos: SOLO el primer mes de packs y planes (pedido de Matías); a la
   clase suelta no se le descuenta nada. El porcentaje no se escribe en
   la página: se ve el precio tachado y el final.
   ═════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "bellido-educativo-cart-v1";

export type CartStep = "cart" | "pay" | "done";
type CartLine = { id: string; qty: number };
type CartState = { lines: CartLine[]; step: CartStep; code: string };

const EMPTY: CartState = { lines: [], step: "cart", code: "" };

/* Packs y planes: uno por compra (mensual). La clase suelta se puede sumar de a una. */
const MAX_CLASSES = 30;

/* El código se escribe en mayúsculas, solo letras, números y guiones */
export const cleanCode = (v: string) => v.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);

export type Product = { id: string; name: string; price: number; unit: string; maxQty: number; monthly: boolean };

type CartContextValue = {
  /** discounted: el código se aplicó a esta línea (primer mes de un pack o plan) */
  lines: (CartLine & { product: Product; full: number; discounted: boolean; finalPrice: number })[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  step: CartStep;
  /** Código válido aplicado ("" = ninguno). Ya está restado del total. */
  code: string;
  /** Devuelve false si el código no existe (y no lo guarda) */
  applyCode: (code: string) => boolean;
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

/* Catálogo desde data.ts (precios) con la unidad en el idioma actual */
export function useCatalog(): Record<string, Product> {
  const { t } = useLanguage();
  const units = t.educativo.cart.units;
  return useMemo(() => {
    const catalog: Record<string, Product> = {};
    for (const pack of PACKS) {
      const monthly = pack.unit === "month";
      catalog[pack.id] = { id: pack.id, name: pack.name, price: pack.price, unit: monthly ? units.month : units.class, maxQty: monthly ? 1 : MAX_CLASSES, monthly };
    }
    return catalog;
  }, [units]);
}

function load(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const lines = Array.isArray(parsed.lines) ? parsed.lines.filter((l) => typeof l.id === "string" && l.qty > 0) : [];
    const step = parsed.step === "pay" || parsed.step === "done" ? parsed.step : "cart";
    const code = typeof parsed.code === "string" && isValidCode(cleanCode(parsed.code)) ? cleanCode(parsed.code) : "";
    return { lines, step: lines.length ? step : "cart", code };
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
    const rate = isValidCode(state.code) ? DISCOUNT_CODES[state.code] : 0;
    // Líneas cuyo producto ya no existe (ej. cambió un id en data.ts) se ignoran
    const lines = state.lines
      .filter((l) => catalog[l.id])
      .map((l) => {
        const product = catalog[l.id];
        const full = l.qty * product.price;
        // Solo el primer mes de packs y planes; la clase suelta, a precio lleno
        const lineRate = product.monthly ? rate : 0;
        return { ...l, product, full, discounted: lineRate > 0, finalPrice: full - Math.round(full * lineRate) };
      });
    const subtotal = lines.reduce((n, l) => n + l.full, 0);
    // Suma de lo que baja cada línea: así las líneas, el descuento y el total cierran al peso
    const discount = lines.reduce((n, l) => n + l.full - l.finalPrice, 0);
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      discount,
      total: subtotal - discount,
      step: state.step,
      code: state.code,
      applyCode: (raw) => {
        const code = cleanCode(raw);
        if (code && !isValidCode(code)) return false;
        setState((s) => ({ ...s, code }));
        return true;
      },
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
  if (!ctx) throw new Error("useCart va dentro de <CartProvider> (EducativoLanding)");
  return ctx;
}

/* "🛒 Agregar al carrito", igual que en /fitness: se actualiza al instante.
   Si ya está, pasa a "En el carrito · Ver" y abre el carrito; la clase
   suelta suma una más. */
export function AddToCartButton({ id, className = "" }: { id: string; className?: string }) {
  const { t } = useLanguage();
  const c = t.educativo.cart;
  const cart = useCart();
  const catalog = useCatalog();
  const inCart = cart.has(id);
  const countable = (catalog[id]?.maxQty ?? 1) > 1;

  if (inCart && !countable) {
    return (
      <button
        type="button"
        onClick={cart.open}
        className={`fit-surface fit-focus inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-base font-semibold text-fg transition-colors hover:border-cyan/50 touch-manipulation ${className}`}
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
      className={`liquid-cta fit-focus inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-base font-semibold touch-manipulation ${className}`}
    >
      <Emoji name="cart" className="w-5 h-5" />
      {c.add}
    </button>
  );
}
