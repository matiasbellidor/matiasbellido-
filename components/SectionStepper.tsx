"use client";

import { useEffect, useRef } from "react";
import { useModal } from "@/context/ModalContext";

/* Navegación con las flechas y con un clic en el fondo. Pedido de Matías
   (2026-11-10): a propósito NO se anuncia en ningún lado de la página (no hay
   texto, ícono ni pista); es para quien lo descubre.

   Para "leer todo a la perfección" no salta de sección en sección sino de
   parada en parada:
   - paradas mayores: cada sección (main section[id], el footer de contacto)
     y cada SUBSECCIÓN marcada con data-step (ej. "Operaciones de Negocio",
     "Educación"). La primera subsección de una sección no se marca: cae justo
     debajo del título;
   - paradas de fila (data-step-row: cada tarjeta, grupo o ítem): solo se usan
     cuando la parada mayor siguiente no entra en la pantalla, para no
     saltear contenido que todavía no se vio (ej. las 3 filas de tarjetas de
     Soluciones Digitales en escritorio);
   - si tampoco hay filas, baja una pantalla dejando un poco de la anterior.
   La regla: el destino nunca deja sin mostrar lo que estaba debajo de lo que
   se veía (salvo un margen chico, `slack`, para no frenar por 20 px de borde).

   - ↓ o → avanzan; ↑ o ← retroceden. Un clic con MOUSE en el fondo (espacio
     vacío: no un texto, una tarjeta, una imagen ni un control) avanza. En el
     celular un toque no hace nada: ahí se toca el fondo sin querer.
   - No interfiere: foco en un control (link, botón, campo, carrusel con
     tabindex…), modal abierto, teclas modificadoras o texto seleccionado →
     las flechas y el clic hacen lo de siempre. "Reducir movimiento": salto
     instantáneo.

   Dónde va:
   - app/page.tsx (el portfolio): mode="subsections" (lo de arriba).
   - FitnessLanding (/fitness): mode="sections", de sección completa en
     sección completa (pedido de Matías), sin paradas intermedias. */

/* Lo que NO es fondo: controles, tarjetas (portfolio y /fitness), imágenes,
   listas y formularios */
const NOT_BACKGROUND =
  "a,button,input,textarea,select,label,summary,form,[role=button],[role=link],[role=tab],[role=slider],[role=dialog],[contenteditable=true],article,.glass,.fit-surface,.liquid-glass,.liquid-cta,figure,li,ul,ol,dl,table,img,svg,video,canvas,iframe";
/* Si el foco está en algo de esto, las flechas mantienen su función normal */
const KEEPS_ARROWS = `${NOT_BACKGROUND},[tabindex]`;
/* Cada parada queda a esta distancia del borde de arriba (la misma que el
   scroll-margin-top de section[id]: debajo del header, como con el menú) */
const STOP_OFFSET = 100;

const hasOwnText = (el: Element) => Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "");

/* Posiciones de scroll (scrollY) de una lista de elementos, ordenadas y sin repetidas */
function stopsOf(selector: string, maxScroll: number) {
  const ys = Array.from(document.querySelectorAll<HTMLElement>(selector))
    .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0) // visibles
    .map((el) => Math.round(Math.min(maxScroll, Math.max(0, el.getBoundingClientRect().top + window.scrollY - STOP_OFFSET))))
    .sort((a, b) => a - b);
  return ys.filter((y, i) => i === 0 || y - ys[i - 1] > 8);
}

export default function SectionStepper({ mode = "subsections" }: { mode?: "subsections" | "sections" }) {
  const { isModalOpen } = useModal();
  const modalFlag = useRef(isModalOpen);
  modalFlag.current = isModalOpen;
  // Los modales del portfolio avisan por el contexto; los de /fitness (carrito, visor) son role=dialog
  const modalOpen = { get current() { return modalFlag.current || !!document.querySelector("[role=dialog][aria-modal=true]"); } };

  useEffect(() => {
    let lockUntil = 0;
    let lastPointer = "mouse";
    /* Hacia dónde se está yendo. Un salto largo tarda más de 1 s: si se vuelve
       a tocar ↓ en el medio, la siguiente se cuenta desde el DESTINO (si se
       contara desde donde va pasando la página, repetiría la misma). */
    let heading: { y: number; until: number } | null = null;

    /** Mueve a la parada siguiente (1) o anterior (-1). Devuelve si hubo destino. */
    const go = (dir: 1 | -1) => {
      const now = performance.now();
      if (now < lockUntil) return true; // tecla mantenida apretada: una parada por vez
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const from = heading && now < heading.until && Math.abs(window.scrollY - heading.y) > 4 ? heading.y : window.scrollY;

      // Cuánto se puede avanzar sin saltear: lo que se ve debajo del header
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const reach = window.innerHeight - Math.max(0, headerBottom) - 8;
      const slack = Math.min(80, window.innerHeight * 0.1);

      let target: number | undefined;
      if (mode === "sections") {
        /* /fitness: de sección completa en sección completa. Más las paradas
           marcadas a mano con data-step (los certificados de "Quién soy"),
           pero solo si desde donde estás todavía no se ven enteras: en una
           pantalla alta en la que ya se ven, no frena de más. */
        const extras = Array.from(document.querySelectorAll<HTMLElement>("main [data-step]"))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => {
            const top = r.top + window.scrollY;
            const bottom = r.bottom + window.scrollY;
            return !(top >= from + Math.max(0, headerBottom) && bottom <= from + window.innerHeight);
          })
          .map((r) => Math.round(Math.min(maxScroll, Math.max(0, r.top + window.scrollY - STOP_OFFSET))));
        const stops = Array.from(new Set([...stopsOf("main section[id], main footer", maxScroll), ...extras])).sort((a, b) => a - b);
        target = dir === 1 ? stops.find((y) => y > from + 4) : [...stops].reverse().find((y) => y < from - 4);
        if (target === undefined) return false;
      } else {
        const majors = stopsOf("main section[id], main footer[id], main [data-step]", maxScroll);
        const all = [...majors, ...stopsOf("main [data-step-row]", maxScroll)].sort((a, b) => a - b);
        /* Filas: primero las que entran SIN tolerancia (así cada tarjeta se ve
           entera); la tolerancia solo si no hay ninguna, y para las subsecciones */
        const pick = (lo: number, hi: number, fromEnd: boolean) => {
          const rows = all.filter((y) => y > lo && y <= hi);
          return rows.length ? (fromEnd ? rows[rows.length - 1] : rows[0]) : undefined;
        };
        if (dir === 1) {
          const nextMajor = majors.find((y) => y > from + 4);
          const cap = nextMajor ?? Infinity;
          if (nextMajor !== undefined && nextMajor - from <= reach + slack) target = nextMajor;
          else target = pick(from + 4, Math.min(from + reach, cap), true) ?? pick(from + 4, Math.min(from + reach + slack, cap), true) ?? Math.min(from + reach - 60, maxScroll);
          if (target <= from + 4) return false; // ya es el final
        } else {
          const prevMajor = [...majors].reverse().find((y) => y < from - 4);
          const floor = prevMajor ?? -Infinity;
          if (prevMajor !== undefined && from - prevMajor <= reach + slack) target = prevMajor;
          else target = pick(Math.max(from - reach, floor) - 0.5, from - 4.5, false) ?? pick(Math.max(from - reach - slack, floor) - 0.5, from - 4.5, false) ?? Math.max(from - reach + 60, 0);
          if (target >= from - 4) return false; // ya es el comienzo
        }
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // "instant" (no "auto": "auto" obedece al scroll-behavior: smooth del CSS y se animaría igual)
      window.scrollTo({ top: target, behavior: reduced ? "instant" : "smooth" });
      heading = { y: target, until: now + 1500 };
      lockUntil = now + (reduced ? 120 : 300);
      return true;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || modalOpen.current) return;
      const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement && active.closest(KEEPS_ARROWS)) return;
      if (go(dir)) e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      lastPointer = e.pointerType;
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || modalOpen.current) return;
      if (lastPointer !== "mouse") return;
      const t = e.target instanceof Element ? e.target : null;
      if (!t || !t.closest("main section, main footer") || t.closest(NOT_BACKGROUND) || hasOwnText(t)) return;
      if ((window.getSelection()?.toString() ?? "") !== "") return; // estaba seleccionando texto
      go(1);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
