"use client";

import { useEffect, useRef } from "react";

/* Resplandor sutil que sigue al cursor, en todo el sitio (va en app/layout.tsx).
   Pedido de Matías (2026-11-10): solo en computadora, discreto, que no tape
   nada y que no afecte el rendimiento. El aspecto, la capa y cuándo se ve
   están en globals.css (.cursor-glow); acá solo se mueve.

   - Misma condición que el CSS: mouse (hover + pointer fino), 1024 px o más
     y sin "reducir movimiento". Si no se cumple, no se escucha el mouse.
     Si cambia (se achica la ventana, se activa "reducir movimiento"), se
     prende o se apaga solo.
   - Solo eventos de mouse: un toque o un lápiz en una laptop táctil no lo mueven.
   - Sin re-render de React: el evento guarda la posición y un
     requestAnimationFrame escribe `transform` en el elemento. El círculo se
     acerca un poco por cuadro (sigue al cursor con suavidad) y el bucle se
     corta cuando llega, así quieto no gasta nada. */
const QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";
/* Qué parte de la distancia al cursor recorre en cada cuadro (más alto = más pegado) */
const FOLLOW = 0.2;

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(QUERY);
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;
    let placed = false;
    let listening = false;

    const render = () => {
      x += (targetX - x) * FOLLOW;
      y += (targetY - y) * FOLLOW;
      if (Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5) {
        x = targetX;
        y = targetY;
        frame = 0;
      } else {
        frame = requestAnimationFrame(render);
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      targetX = e.clientX;
      targetY = e.clientY;
      // Al entrar aparece donde está el mouse, sin viajar desde donde se fue
      if (!placed) {
        x = targetX;
        y = targetY;
        placed = true;
      }
      el.dataset.active = "";
      if (!frame) frame = requestAnimationFrame(render);
    };
    const hide = () => {
      delete el.dataset.active;
      placed = false;
    };
    // El mouse salió de la ventana (relatedTarget null = no entró a otro elemento)
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) hide();
    };

    const start = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseout", onOut);
      window.addEventListener("blur", hide);
    };
    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", hide);
      cancelAnimationFrame(frame);
      frame = 0;
      hide();
    };
    const sync = () => (mq.matches ? start() : stop());

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
