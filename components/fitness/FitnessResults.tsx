"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ImageIcon, Pause, Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal, SectionHeading, type FitnessAssets } from "./shared";

/* Resultados: comparadores antes/después, centrados.
   La barra se mueve sola (centro → derecha → izquierda → centro, con una
   pausa) mientras el comparador está en pantalla. Mientras la persona la
   sostiene con el dedo o el mouse, la barra sigue al puntero; al soltarla
   vuelve suave al recorrido desde donde quedó (pedido de Matías: que nunca
   se quede quieta para siempre). Con el teclado (flechas) queda donde la
   dejan hasta que el foco sale de la manija.
   Rendimiento: la posición es una variable CSS (--pos) que se escribe
   desde requestAnimationFrame sin re-render de React, y todo se mueve con
   transform (la foto de "antes" se recorta con dos traslaciones opuestas),
   así que no se repinta la foto en cada cuadro.
   Con "reducir movimiento", la barra queda quieta en el medio. */

/* Recorrido automático: [momento del ciclo 0–1, posición %] */
const SWEEP: [number, number][] = [
  [0, 50],
  [0.12, 50],
  [0.38, 82],
  [0.72, 18],
  [0.9, 50],
  [1, 50],
];
const SWEEP_MS = 6500;
/* Al soltar la barra, vuelve al recorrido en hasta 0,7 s (proporcional a la distancia) */
const GLIDE_MS = 700;

/* Encuadre de las fotos de cada cliente. Matías no quiere ninguna cara y
   quiere ver el torso. Como el repo es público, las caras se cortan en el
   ARCHIVO (los originales de Matías no se suben): 1 y 3 ya vienen cortadas;
   2 y 4 se cortaron el 2026-11-06 (originales respaldados fuera del repo).
   Todas se muestran con la foto entera salvo las de FRAMING, que fijan qué
   franja se ve, de arriba (`start`, 0–1) a abajo (`end`) de la foto YA
   cortada, por separado para el antes y el después: así se alinean dos fotos
   sacadas a distinta distancia (cliente 4: todo el pecho y todo el abdomen,
   de las clavículas al elástico). Un cliente nuevo cae en SAFE_FRAMING (zoom
   de seguridad: oculta el 18 % de arriba), por si sube fotos sin cortar.
   La cuenta supone fotos más anchas que el marco 4:5 (se ajustan al alto);
   con una más angosta, revisarla en una captura. */
const PRE_CROPPED_CLIENTS = new Set([1, 2, 3]);
type Framing = { start: number; end: number };
type ClientFraming = { before: Framing; after: Framing };
const SAFE: Framing = { start: 0.18, end: 1 };
const SAFE_FRAMING: ClientFraming = { before: SAFE, after: SAFE };
const FRAMING: Record<number, ClientFraming> = {
  // antes: cortada al 17 % (sin zoom); después: cortada al 13 % y vista hasta el 78 % de lo que queda
  4: { before: { start: 0, end: 1 }, after: { start: 0, end: 0.7816 } },
};
const framingFor = (n: number): ClientFraming | null => (FRAMING[n] ?? (PRE_CROPPED_CLIENTS.has(n) ? null : SAFE_FRAMING));

function sweepAt(t: number) {
  for (let i = 1; i < SWEEP.length; i++) {
    const [t1, p1] = SWEEP[i];
    const [t0, p0] = SWEEP[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0 || 1);
      return p0 + (p1 - p0) * (0.5 - Math.cos(Math.PI * k) / 2); // ease in-out
    }
  }
  return 50;
}

export default function FitnessResults({ clients }: { clients: FitnessAssets["clients"] }) {
  const { t } = useLanguage();
  const r = t.fitness.results;

  /* La sección no usa FitnessSection: el carrusel va de borde a borde de
     la pantalla y el texto, en la columna de siempre. */
  return (
    <section id="resultados" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-16">
        <SectionHeading eyebrow={r.eyebrow} title={r.title} intro={r.intro} center className="!mb-6" />
        <Reveal className="mb-12 text-center">
          <p className="text-base md:text-lg font-medium text-fg">{r.hint}</p>
        </Reveal>
      </div>

      <ResultsCarousel clients={clients} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-16">
        <Reveal className="mt-12 text-center">
          <p className="text-xs md:text-sm text-fg-muted max-w-2xl mx-auto">{r.disclaimer}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* Carrusel como el de Vibear (.marquee): los comparadores corren solos de
   derecha a izquierda en loop. La lista está dos veces, así que -50 % cae
   donde empezó; cada "copia" se repite hasta pasar los 1800 px para que
   nunca quede un hueco. Se frena (pausa) con el mouse encima, mientras un
   dedo está apoyado (al soltarlo sigue en el acto), con el foco de TECLADO
   adentro y fuera de pantalla; hay un botón de pausa (WCAG 2.2.2).
   Ojo: tocar la manija con el dedo también le da foco, y en el celular ese
   foco no se va nunca; por eso el foco que llega justo después de un toque
   o clic NO pausa (antes el carrusel quedaba frenado para siempre).
   Con "reducir movimiento" no se mueve: es una fila que se desliza con el
   dedo. Solo el primer juego es accesible: el resto está aria-hidden y sin
   foco. Las animaciones están en fitness.css. */
const CARD_PX = 364; // 340 de tarjeta + 24 de separación (desde md)
const MIN_COPY_PX = 1800;
const SPEED_PX_S = 35;
/* Un foco que llega hasta 800 ms después de tocar o hacer clic vino del puntero, no del teclado */
const POINTER_FOCUS_MS = 800;

function ResultsCarousel({ clients }: { clients: FitnessAssets["clients"] }) {
  const { t } = useLanguage();
  const r = t.fitness.results;
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef(-Infinity);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const repeats = Math.max(1, Math.ceil(MIN_COPY_PX / (clients.length * CARD_PX)));
  const style = { "--marquee": `${Math.round((clients.length * repeats * CARD_PX) / SPEED_PX_S)}s` } as CSSProperties;
  const playing = !userPaused && !hover && !focused && !touching && inView;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    lastPointer.current = performance.now();
    if (e.pointerType === "mouse") return; // con mouse ya está en pausa por el hover
    setTouching(true);
  };
  // Al soltar el dedo sigue en el acto (pedido de Matías: que nunca quede frenado)
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") setTouching(false);
  };

  const renderSet = (copy: number) =>
    Array.from({ length: repeats }, (_, rep) =>
      clients.map((client, i) => {
        const primary = copy === 0 && rep === 0;
        const number = String(client.n).padStart(2, "0");
        const caption = r.captions[client.n - 1] ?? "";
        return (
          <div
            key={`${copy}-${rep}-${client.n}`}
            role={primary ? "listitem" : undefined}
            aria-hidden={primary ? undefined : true}
            className={`w-[284px] shrink-0 pr-6 sm:w-[324px] md:w-[364px] ${primary ? "" : "fit-marquee-dup"}`}
          >
            <BeforeAfter
              before={client.before}
              after={client.after}
              label={`${r.clientLabel} ${number}: ${r.compare}`}
              beforeLabel={r.before}
              afterLabel={r.after}
              pending={r.pending}
              altBefore={primary ? `${r.clientLabel} ${number} · ${r.before}` : ""}
              altAfter={primary ? `${r.clientLabel} ${number} · ${r.after}` : ""}
              caption={caption}
              phase={i * 0.35}
              framing={framingFor(client.n)}
              decorative={!primary}
            />
            <p className="px-2 pt-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-fg-muted">
              {r.clientLabel} {number}
              {caption && primary && <span className="sr-only">: {caption}</span>}
            </p>
          </div>
        );
      }),
    );

  return (
    <>
      <div
        ref={wrapRef}
        aria-label={r.carouselLabel}
        aria-roledescription="carousel"
        role="region"
        data-playing={playing}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onFocusCapture={() => setFocused(performance.now() - lastPointer.current > POINTER_FOCUS_MS)}
        onKeyDownCapture={() => setFocused(true)}
        onBlurCapture={() => {
          setFocused(false);
          // el foco puede haber corrido el carrusel (overflow oculto): se vuelve al origen
          if (wrapRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) wrapRef.current.scrollLeft = 0;
        }}
        className="fit-marquee-wrap fit-marquee-fade mx-auto max-w-[1800px]"
      >
        <div role="list" className="fit-marquee flex w-max" style={style}>
          {renderSet(0)}
          <div className="fit-marquee-dup flex" aria-hidden="true">
            {renderSet(1)}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center motion-reduce:hidden">
        <button
          type="button"
          aria-pressed={userPaused}
          onClick={() => setUserPaused((v) => !v)}
          className="fit-surface fit-focus inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium text-fg-soft transition-colors hover:text-fg hover:border-cyan/40 touch-manipulation"
        >
          {userPaused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
          {userPaused ? r.play : r.pause}
        </button>
      </div>
    </>
  );
}

function BeforeAfter({
  before,
  after,
  label,
  beforeLabel,
  afterLabel,
  pending,
  altBefore,
  altAfter,
  caption,
  phase,
  framing,
  decorative = false,
}: {
  before: string | null;
  after: string | null;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  pending: string;
  altBefore: string;
  altAfter: string;
  /** Tiempo del cambio (ej. "16 semanas"); vacío = no se muestra */
  caption: string;
  /** Desfase del recorrido automático (0–1), para que no se muevan todos iguales */
  phase: number;
  /** Franja que se ve de cada foto (null = las fotos enteras): ver FRAMING */
  framing: ClientFraming | null;
  /** Copia del carrusel (aria-hidden): la manija no es un control ni recibe foco */
  decorative?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  /* Momento del recorrido (0–1) donde va la barra: al volver del arrastre, de
     fuera de pantalla o del teclado, sigue desde acá en vez de saltar */
  const cycle = useRef(phase % 1);
  // Refs: frenan el recorrido en el mismo evento; el estado lo reanuda después
  const dragging = useRef(false);
  const keyboardRef = useRef(false);
  const reduced = !!useReducedMotion();
  const [held, setHeld] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [inView, setInView] = useState(false);

  const apply = useCallback((p: number) => {
    const v = Math.min(100, Math.max(0, p));
    pos.current = v;
    frameRef.current?.style.setProperty("--pos", v.toFixed(2));
    knobRef.current?.setAttribute("aria-valuenow", String(Math.round(v)));
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Recorrido automático: solo en pantalla, sin "reducir movimiento" y
     mientras nadie la sostiene ni la maneja con el teclado. Al (re)empezar
     se desliza desde donde está la barra hasta su punto del recorrido y
     sigue desde ahí: nunca salta. */
  useEffect(() => {
    if (held || keyboard || reduced || !inView) return;
    let raf = 0;
    const from = pos.current;
    const begin = cycle.current;
    const to = sweepAt(begin);
    const glide = (Math.min(50, Math.abs(to - from)) / 50) * GLIDE_MS;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (dragging.current || keyboardRef.current) return; // tomaron el control en este mismo cuadro
      const elapsed = now - t0;
      if (elapsed < glide) {
        apply(from + (to - from) * (0.5 - Math.cos(Math.PI * (elapsed / glide)) / 2));
      } else {
        cycle.current = (begin + (elapsed - glide) / SWEEP_MS) % 1;
        apply(sweepAt(cycle.current));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [held, keyboard, reduced, inView, apply]);

  useEffect(() => {
    if (reduced) apply(50);
  }, [reduced, apply]);

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) apply(((e.clientX - rect.left) / rect.width) * 100);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    setHeld(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    fromPointer(e);
  };

  // Al soltar (o si el navegador se queda con el gesto para hacer scroll), vuelve al recorrido
  const release = () => {
    dragging.current = false;
    setHeld(false);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const now = Math.round(pos.current);
    const step = e.shiftKey ? 10 : 5;
    const next = { ArrowLeft: now - step, ArrowRight: now + step, Home: 0, End: 100 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    keyboardRef.current = true;
    setKeyboard(true);
    apply(next);
  };

  // El teclado deja la barra quieta hasta que el foco sale de la manija
  const onKnobBlur = () => {
    keyboardRef.current = false;
    setKeyboard(false);
  };

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => dragging.current && fromPointer(e)}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      style={{ "--pos": "50" } as CSSProperties}
      className="relative aspect-[4/5] overflow-hidden rounded-3xl fit-surface select-none touch-pan-y cursor-ew-resize shadow-[0_24px_60px_-24px_rgb(0_0_0/0.6)]"
    >
      {/* Después: la foto de base */}
      <Photo src={after} alt={altAfter} pending={pending} framing={framing?.after ?? null} />

      {/* Antes: misma foto recortada a la izquierda de la barra. El marco se
          corre a la izquierda y la foto, lo mismo a la derecha: queda quieta
          y solo cambia cuánto se ve (todo con transform). */}
      <div className="absolute inset-0 overflow-hidden" style={{ transform: "translateX(calc((var(--pos) - 100) * 1%))" }}>
        <div className="absolute inset-0" style={{ transform: "translateX(calc((100 - var(--pos)) * 1%))" }}>
          <Photo src={before} alt={altBefore} pending={pending} framing={framing?.before ?? null} />
        </div>
      </div>

      <span className="pointer-events-none absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold uppercase tracking-wider">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-electric text-white text-[11px] font-semibold uppercase tracking-wider">
        {afterLabel}
      </span>
      {/* Tiempo del cambio, abajo al centro, por encima de la barra (z-30) para
          que la línea no lo corte. pointer-events-none: no tapa el arrastre */}
      {caption && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-black/60 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-semibold text-white"
        >
          <Clock className="w-4 h-4 text-[rgb(0,229,255)]" />
          {caption}
        </span>
      )}

      {/* Barra + manija: una capa del ancho del marco corrida (pos − 50) %, con la barra en su centro */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{ transform: "translateX(calc((var(--pos) - 50) * 1%))" }}>
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(255_255_255/0.9),0_0_2px_rgb(0_0_0/0.6)]" />
        <div
          ref={knobRef}
          {...(decorative
            ? {}
            : { role: "slider", tabIndex: 0, "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 50, onKeyDown: onKey, onBlur: onKnobBlur })}
          // Vidrio con tinte oscuro fijo: va sobre una foto, en los dos temas
          className="liquid-glass fit-focus pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 place-items-center w-12 h-12 rounded-full !bg-black/35 !border-white/60 text-white cursor-grab active:cursor-grabbing"
        >
          <ChevronLeft className="w-4 h-4 -mr-1" aria-hidden="true" />
          <ChevronRight className="w-4 h-4 -ml-1" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function Photo({ src, alt, pending, framing }: { src: string | null; alt: string; pending: string; framing: Framing | null }) {
  if (!src) {
    return (
      <div className="absolute inset-0 grid-bg flex flex-col items-center justify-center gap-2 text-fg-faint bg-[var(--bg-alt)]">
        <ImageIcon className="w-8 h-8" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{pending}</span>
      </div>
    );
  }
  /* Zoom = 1 / alto de la franja. El origen del zoom (y0) es el punto que
     queda quieto: con y0 = start / (1 − 1/zoom), lo que se ve empieza justo
     en `start`. SAFE (18–100 %) da zoom 1,22 con origen abajo. */
  const zoom = framing ? 1 / (framing.end - framing.start) : 1;
  const originY = framing && zoom > 1 ? (framing.start / (1 - 1 / zoom)) * 100 : 50;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      quality={85}
      draggable={false}
      sizes="(max-width: 639px) 260px, (max-width: 767px) 300px, 340px"
      className="object-cover object-bottom pointer-events-none"
      style={framing ? { transform: `scale(${zoom.toFixed(4)})`, transformOrigin: `50% ${originY.toFixed(2)}%` } : undefined}
    />
  );
}
