"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useAnimationFrame, useInView, useReducedMotion } from "framer-motion";

/* ═════════════════════════════════════════════════════════════
   Animación minimalista de "Mis Asesoramientos" (modal de Projects).
   El MISMO personaje (line art blanco, acentos neón) en las dos
   tarjetas, moviéndose de forma continua (no cuadros que cambian):

   - fitness:   curl pesado (le cuesta: tiembla, transpira) → curl fácil
                → sube las mancuernas a los hombros → press arriba →
                saca bíceps contento → vuelve a empezar.
   - educativo: lee → se agarra la cabeza → se le prende la lamparita
                → escribe → levanta el "A+" y festeja → vuelve a leer.

   Cómo funciona: un esqueleto con articulaciones (grupos SVG anidados:
   hombro → codo, cadera → rodilla) y una línea de tiempo de poses
   (POSES/SEQUENCES) que se interpola con easing. Framer Motion da el
   reloj (useAnimationFrame), la pausa fuera de pantalla (useInView) y
   "reducir movimiento" (useReducedMotion: queda quieto en la pose
   final, la contenta). Cada cuadro escribe atributos `transform`
   directo en el DOM, sin re-render de React.
   Ángulos en grados; 0 = el segmento cuelga hacia abajo y los positivos
   giran en sentido horario (brazo "R" = el de la izquierda de la pantalla).
   ═════════════════════════════════════════════════════════════ */

export type AsesoramientoVariant = "fitness" | "educativo";

const LINE = "#EAF4FF";
const ACCENT = "#22D3EE";
const IDEA = "#FACC15";
const STRESS = "#F87171";
const DESK = "#0B1424";

// Proporciones del personaje (las mismas en las dos escenas)
const UPPER = 16;
const FORE = 15;
const THIGH = 18;
const SHIN = 18;
const SHOULDER_Y = -28;
const HEAD_Y = -43;
const GROUND = 160;
const DURATION = 8.4;

const KEYS = [
  "sR", "eR", "sL", "eL", "hR", "kR", "hL", "kL", "lean", "tilt", "look",
  "smile", "open", "happy", "brow", "wob", "sweat", "stress", "bulge", "spark",
  "bulb", "finger", "pencil", "writeAmp", "scratch", "write", "ink", "paper", "hop",
] as const;
type Key = (typeof KEYS)[number];
type Pose = Record<Key, number>;

const BASE: Pose = {
  sR: 22, eR: 8, sL: -22, eL: -8, hR: 7, kR: -3, hL: -7, kL: 3, lean: 0, tilt: 0, look: 0,
  smile: 0.25, open: 0, happy: 0, brow: 0, wob: 0, sweat: 0, stress: 0, bulge: 0, spark: 0,
  bulb: 0, finger: 0, pencil: 0, writeAmp: 0, scratch: 0, write: 0, ink: 0, paper: 0, hop: 0,
};
const pose = (p: Partial<Pose>): Pose => ({ ...BASE, ...p });

/* ── Fitness ── */
const F_NEUTRAL = pose({});
const F_CURL_HARD = pose({ sR: 25, eR: 130, lean: -3, tilt: -5, smile: -0.6, brow: -1, wob: 3, sweat: 1, stress: 1 });
const F_CURL_EASY = pose({ sL: -25, eL: -130, lean: 2, tilt: 3, smile: 0.45, brow: 0.2, sweat: 0.3 });
// Mancuernas a la altura de los hombros, antebrazos un poco abiertos para no tapar la cara
const F_RACK = pose({ sR: 100, eR: 62, sL: -100, eL: -62, smile: 0.5, brow: 0.3 });
const WIDE = { hR: 12, kR: -6, hL: -12, kL: 6 };
// Press en V: las dos mancuernas arriba sin chocarse
const F_PRESS = pose({ sR: 145, eR: 25, sL: -145, eL: -25, ...WIDE, smile: 1, happy: 1, brow: 0.6, spark: 1 });
const F_FLEX = pose({ sR: 100, eR: 65, sL: -100, eL: -65, ...WIDE, smile: 1, happy: 1, brow: 0.5, bulge: 1, spark: 0.7 });

/* ── Educativo (sentado detrás del escritorio: las piernas no se ven) ── */
const E_READ = pose({ sR: 55, eR: -80, sL: -55, eL: 80, look: 1, smile: 0.05 });
const E_STRESS = pose({ sR: 110, eR: 82, sL: -110, eL: -82, smile: -0.7, brow: -1, stress: 1, scratch: 1 });
const E_IDEA = pose({ sR: 125, eR: 50, sL: -55, eL: 80, look: -0.4, open: 1, brow: 1, bulb: 1, finger: 1 });
const E_WRITE = { sR: 15, eR: 81, sL: -55, eL: 80, look: 1, smile: 0.5, brow: 0.2, pencil: 1, writeAmp: 1, ink: 1 };
const E_WRITE_0 = pose({ ...E_WRITE, write: 0 });
const E_WRITE_1 = pose({ ...E_WRITE, write: 1 });
const E_CELEBRATE = pose({ sR: 155, eR: 10, sL: -140, eL: -20, look: -0.4, smile: 1.2, happy: 1, brow: 0.6, paper: 1, spark: 1, hop: 1, ink: 1, write: 1 });
const E_READ_END = pose({ ...E_READ, write: 1, ink: 0 });

const SEQUENCES: Record<AsesoramientoVariant, [number, Pose][]> = {
  fitness: [
    [0, F_NEUTRAL], [0.6, F_NEUTRAL], [1.5, F_CURL_HARD], [2.0, F_CURL_HARD],
    [2.6, pose({ sweat: 0.6 })], [3.4, F_CURL_EASY], [3.9, pose({ sweat: 0.2 })],
    [4.5, F_RACK], [5.1, F_PRESS], [5.9, F_PRESS], [6.5, F_FLEX], [7.3, F_FLEX],
    [8.0, F_NEUTRAL], [DURATION, F_NEUTRAL],
  ],
  educativo: [
    [0, E_READ], [0.5, E_READ], [1.1, E_STRESS], [2.1, E_STRESS], [2.6, E_IDEA], [3.3, E_IDEA],
    [3.8, E_WRITE_0], [5.3, E_WRITE_1], [5.9, E_CELEBRATE], [7.0, E_CELEBRATE],
    [7.8, E_READ_END], [DURATION, E_READ_END],
  ],
};

/* Pose quieta para "reducir movimiento": el final feliz de cada historia */
const STILL_AT: Record<AsesoramientoVariant, number> = { fitness: 6.9, educativo: 6.5 };

const BLINKS = [0.35, 3.95, 7.6];

const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function sample(seq: [number, Pose][], t: number): Pose {
  let i = 0;
  while (i < seq.length - 2 && t >= seq[i + 1][0]) i++;
  const [t0, a] = seq[i];
  const [t1, b] = seq[i + 1];
  const u = easeInOut(Math.min(1, Math.max(0, (t - t0) / (t1 - t0 || 1))));
  const out = {} as Pose;
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * u;
  return out;
}

const rad = (d: number) => (d * Math.PI) / 180;
/* Dirección de un segmento que, con ángulo 0, cuelga hacia abajo */
const dir = (deg: number): [number, number] => [-Math.sin(rad(deg)), Math.cos(rad(deg))];
const rotate = (x: number, y: number, deg: number): [number, number] => [
  x * Math.cos(rad(deg)) - y * Math.sin(rad(deg)),
  x * Math.sin(rad(deg)) + y * Math.cos(rad(deg)),
];
const legDrop = (h: number, k: number) => THIGH * Math.cos(rad(h)) + SHIN * Math.cos(rad(h + k)) + 0.6;
const f = (n: number) => n.toFixed(2);

type Attrs = Record<string, Record<string, string>>;

/* Todo lo que cambia en un instante t: atributos por elemento */
function frame(variant: AsesoramientoVariant, t: number, still = false): Attrs {
  const p = sample(SEQUENCES[variant], t);
  const breath = still ? 0 : Math.sin((t * 2 * Math.PI) / 3) * 0.5;

  // Brazos con temblor (esfuerzo), rascado de cabeza o escritura
  const sR = p.sR + p.wob * 0.4 * Math.sin(t * 29) + p.writeAmp * 2 * Math.sin(t * 10);
  const eR = p.eR + p.wob * Math.sin(t * 34) + p.scratch * 7 * Math.sin(t * 24) + p.writeAmp * 5 * Math.sin(t * 20);
  const sL = p.sL;
  const eL = p.eL - p.scratch * 7 * Math.sin(t * 24 + 1.3);

  const rootX = 100;
  const rootY =
    variant === "fitness"
      ? GROUND - Math.max(legDrop(p.hR, p.kR), legDrop(p.hL, p.kL)) + breath
      : 140 - p.hop * Math.abs(Math.sin(t * 7.5)) * 5 + breath;

  // Posiciones en el mundo (cabeza y manos) para lo que no cuelga del esqueleto
  const [hx, hy] = rotate(0, HEAD_Y, p.lean);
  const head: [number, number] = [rootX + hx, rootY + hy];
  const [shx, shy] = rotate(0, SHOULDER_Y, p.lean);
  const handL = (() => {
    const [ux, uy] = dir(p.lean + sL);
    const [fx, fy] = dir(p.lean + sL + eL);
    return [rootX + shx + UPPER * ux + FORE * fx, rootY + shy + UPPER * uy + FORE * fy];
  })();

  const blinking = !still && p.happy < 0.5 && BLINKS.some((b) => t >= b && t < b + 0.13);
  const brow = p.brow;
  const fall = (t * 12) % 7;
  const sparkAt = variant === "fitness" ? [head[0], head[1] - 4] : [handL[0] + 4, handL[1] - 12];
  const writeLine = (i: number) => Math.min(1, Math.max(0, p.write * 3 - i));

  return {
    root: { transform: `translate(${f(rootX)} ${f(rootY)})` },
    lean: { transform: `rotate(${f(p.lean)})` },
    head: { transform: `translate(0 ${HEAD_Y}) rotate(${f(p.tilt)})` },
    face: { transform: `translate(0 ${f(p.look * 2.2)})` },
    eyes: { transform: `translate(0 -1) scale(1 ${blinking ? 0.15 : 1}) translate(0 1)`, opacity: f(1 - p.happy) },
    eyesHappy: { opacity: f(p.happy) },
    mouth: { d: `M -4 3.6 Q 0 ${f(3.6 + 5.5 * p.smile)} 4 3.6`, opacity: f(1 - p.open) },
    mouthO: { opacity: f(p.open) },
    browL: { transform: `translate(0 ${f(-Math.max(brow, 0) * 1.6)}) rotate(${f(-brow * 14)} -4 -5.5)` },
    browR: { transform: `translate(0 ${f(-Math.max(brow, 0) * 1.6)}) rotate(${f(brow * 14)} 4 -5.5)` },
    armR: { transform: `translate(0 ${SHOULDER_Y}) rotate(${f(sR)})` },
    foreR: { transform: `translate(0 ${UPPER}) rotate(${f(eR)})` },
    armL: { transform: `translate(0 ${SHOULDER_Y}) rotate(${f(sL)})` },
    foreL: { transform: `translate(0 ${UPPER}) rotate(${f(eL)})` },
    legR: { transform: `rotate(${f(p.hR)})` },
    shinR: { transform: `translate(0 ${THIGH}) rotate(${f(p.kR)})` },
    legL: { transform: `rotate(${f(p.hL)})` },
    shinL: { transform: `translate(0 ${THIGH}) rotate(${f(p.kL)})` },
    bulgeR: { transform: `translate(0 8) scale(${f(p.bulge)} 1) translate(0 -8)`, opacity: p.bulge > 0.02 ? "1" : "0" },
    bulgeL: { transform: `translate(0 8) scale(${f(p.bulge)} 1) translate(0 -8)`, opacity: p.bulge > 0.02 ? "1" : "0" },
    sweat: { transform: `translate(12 ${f(-3 + fall)})`, opacity: f(p.sweat * (1 - fall / 7)) },
    stress: { transform: `translate(${f(still ? 0 : Math.sin(t * 30) * 0.6)} 0)`, opacity: f(p.stress) },
    spark: {
      transform: `translate(${f(sparkAt[0])} ${f(sparkAt[1])}) rotate(${f(still ? 0 : t * 25)}) scale(${f(0.7 + p.spark * 0.35 + (still ? 0 : Math.sin(t * 9) * 0.05))})`,
      opacity: f(p.spark),
    },
    bulb: { transform: `translate(${f(head[0])} ${f(head[1] - 24)}) scale(${f(Math.min(1.15, p.bulb * 1.15))})`, opacity: f(Math.min(1, p.bulb * 1.6)) },
    finger: { opacity: f(p.finger) },
    pencil: { opacity: f(p.pencil) },
    ink0: { "stroke-dashoffset": f(14 * (1 - writeLine(0))), opacity: f(p.ink) },
    ink1: { "stroke-dashoffset": f(14 * (1 - writeLine(1))), opacity: f(p.ink) },
    ink2: { "stroke-dashoffset": f(14 * (1 - writeLine(2))), opacity: f(p.ink) },
    paper: { transform: `translate(${f(handL[0] + 4)} ${f(handL[1] - 12)}) rotate(8) scale(${f(Math.max(0.01, p.paper))})`, opacity: f(p.paper) },
  };
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function AsesoramientoAnimation({ variant, className = "" }: { variant: AsesoramientoVariant; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const els = useRef<Record<string, SVGElement | null>>({});
  const reduced = !!useReducedMotion();
  const inView = useInView(svgRef, { margin: "80px" });
  const r = (key: string) => (el: SVGElement | null) => {
    els.current[key] = el;
  };

  const apply = (attrs: Attrs) => {
    for (const key in attrs) {
      const el = els.current[key];
      if (!el) continue;
      for (const name in attrs[key]) el.setAttribute(name, attrs[key][name]);
    }
  };

  // Primera pose antes de pintar (y la definitiva si hay "reducir movimiento")
  useIsoLayoutEffect(() => {
    apply(reduced ? frame(variant, STILL_AT[variant], true) : frame(variant, 0));
  }, [reduced, variant]);

  useAnimationFrame((time) => {
    if (reduced || !inView) return;
    apply(frame(variant, (time / 1000) % DURATION));
  });

  const isFitness = variant === "fitness";

  return (
    <svg
      ref={svgRef}
      // Encuadre ajustado al personaje: en educativo, un poco más cerrado para que
      // el escritorio no se coma la mitad de abajo
      viewBox={isFitness ? "38 48 124 118" : "44 44 112 108"}
      aria-hidden="true"
      fill="none"
      stroke={LINE}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ filter: "drop-shadow(0 0 3px rgba(34, 211, 238, 0.45))" }}
    >
      {isFitness && (
        <>
          <line x1="36" y1={GROUND + 0.6} x2="164" y2={GROUND + 0.6} stroke={ACCENT} strokeOpacity="0.35" strokeWidth="1.4" />
          <ellipse cx="100" cy={GROUND + 1.5} rx="20" ry="2.2" fill={ACCENT} fillOpacity="0.12" stroke="none" />
        </>
      )}

      <g ref={r("root")}>
        {isFitness && (
          <>
            <g ref={r("legR")}>
              <line x1="0" y1="0" x2="0" y2={THIGH} />
              <g ref={r("shinR")}>
                <line x1="0" y1="0" x2="0" y2={SHIN} />
                <line x1="0" y1={SHIN} x2="-4.5" y2={SHIN + 0.4} />
              </g>
            </g>
            <g ref={r("legL")}>
              <line x1="0" y1="0" x2="0" y2={THIGH} />
              <g ref={r("shinL")}>
                <line x1="0" y1="0" x2="0" y2={SHIN} />
                <line x1="0" y1={SHIN} x2="4.5" y2={SHIN + 0.4} />
              </g>
            </g>
          </>
        )}
        <g ref={r("lean")}>
          <line x1="0" y1="0" x2="0" y2={HEAD_Y + 10} />
          <g ref={r("head")}>
            <circle cx="0" cy="0" r="10" />
            <g ref={r("face")}>
              <g ref={r("eyes")} fill={LINE} stroke="none">
                <circle cx="-3.4" cy="-1" r="1.3" />
                <circle cx="3.4" cy="-1" r="1.3" />
              </g>
              <path ref={r("eyesHappy")} d="M -5 -0.6 Q -3.4 -3.2 -1.8 -0.6 M 1.8 -0.6 Q 3.4 -3.2 5 -0.6" strokeWidth="1.6" opacity="0" />
              <line ref={r("browL")} x1="-6" y1="-5.5" x2="-2" y2="-5.5" strokeWidth="1.5" />
              <line ref={r("browR")} x1="2" y1="-5.5" x2="6" y2="-5.5" strokeWidth="1.5" />
              <path ref={r("mouth")} d="M -4 3.6 Q 0 5 4 3.6" strokeWidth="1.7" />
              <ellipse ref={r("mouthO")} cx="0" cy="4.2" rx="1.9" ry="2.4" strokeWidth="1.5" opacity="0" />
            </g>
            <path ref={r("sweat")} d="M 0 -3 Q 2.2 0.5 0 1.8 Q -2.2 0.5 0 -3 Z" fill={ACCENT} stroke="none" opacity="0" />
            <path
              ref={r("stress")}
              d="M -17 -9 l 3 -3.5 l 0.5 3.5 l 3 -3.5 M 11 -12.5 l 3 3.5 l 0.5 -3.5 l 3 3.5"
              stroke={STRESS}
              strokeWidth="1.7"
              opacity="0"
            />
          </g>

          {/* Brazo R (izquierda de la pantalla) */}
          <g ref={r("armR")}>
            <line x1="0" y1="0" x2="0" y2={UPPER} />
            {isFitness && <path ref={r("bulgeR")} d={`M 0 3 Q -6.5 8 0 13`} opacity="0" />}
            <g ref={r("foreR")}>
              <line x1="0" y1="0" x2="0" y2={FORE} />
              <circle cx="0" cy={FORE} r="1.9" fill={LINE} stroke="none" />
              {isFitness ? (
                <Dumbbell y={FORE} />
              ) : (
                <>
                  <line ref={r("finger")} x1="0" y1={FORE + 1} x2="0" y2={FORE + 6} strokeWidth="2.2" opacity="0" />
                  <path ref={r("pencil")} d={`M 0 ${FORE} L 4.5 ${FORE + 5.5}`} stroke={ACCENT} strokeWidth="2" opacity="0" />
                </>
              )}
            </g>
          </g>
          {/* Brazo L */}
          <g ref={r("armL")}>
            <line x1="0" y1="0" x2="0" y2={UPPER} />
            {isFitness && <path ref={r("bulgeL")} d={`M 0 3 Q 6.5 8 0 13`} opacity="0" />}
            <g ref={r("foreL")}>
              <line x1="0" y1="0" x2="0" y2={FORE} />
              <circle cx="0" cy={FORE} r="1.9" fill={LINE} stroke="none" />
              {isFitness && <Dumbbell y={FORE} />}
            </g>
          </g>
        </g>
      </g>

      {!isFitness && (
        <>
          {/* Escritorio: tapa la cadera; arriba, el libro abierto y el cuaderno */}
          <rect x="18" y="126" width="164" height="60" rx="3" fill={DESK} stroke="none" />
          <line x1="18" y1="126" x2="182" y2="126" />
          <path d="M 96 125.4 L 98 119.6 Q 103.5 118.2 110 120.6 Q 116.5 118.2 122 119.6 L 124 125.4 Z" fill={DESK} strokeWidth="1.8" />
          <line x1="110" y1="120.6" x2="110" y2="125.4" strokeWidth="1.4" />
          <path d="M 66 125.4 L 70 120 L 90 120 L 88 125.4 Z" fill={DESK} strokeWidth="1.8" />
          <path ref={r("ink0")} d="M 71.5 122 h 14" stroke={ACCENT} strokeWidth="1.2" strokeDasharray="14" strokeDashoffset="14" opacity="0" />
          <path ref={r("ink1")} d="M 70.5 123.8 h 14" stroke={ACCENT} strokeWidth="1.2" strokeDasharray="14" strokeDashoffset="14" opacity="0" />
          <path ref={r("ink2")} d="M 69.8 125.2 h 10" stroke={ACCENT} strokeWidth="1.2" strokeDasharray="14" strokeDashoffset="14" opacity="0" />

          {/* Lamparita */}
          <g ref={r("bulb")} stroke={IDEA} opacity="0">
            <circle cx="0" cy="0" r="5.5" strokeWidth="2" />
            <path d="M -2.4 6.6 H 2.4 M -1.8 8.8 H 1.8" strokeWidth="1.8" />
            <path d="M -1.8 1.2 L -0.6 -1.4 L 0.6 1.2 L 1.8 -1.4" strokeWidth="1.2" />
            <path d="M 0 -9 V -12 M 7 -6 L 9.2 -8.2 M -7 -6 L -9.2 -8.2 M 9 0.5 H 12 M -9 0.5 H -12" strokeWidth="1.8" />
          </g>

          {/* Hoja con la nota */}
          <g ref={r("paper")} opacity="0">
            <rect x="-8" y="-11" width="16" height="21" rx="1.5" fill={DESK} strokeWidth="1.8" />
            <text x="-6.4" y="-0.8" fontSize="9" fontWeight="800" fontFamily="Inter, Arial, sans-serif" fill={ACCENT} stroke="none">
              A+
            </text>
            <path d="M -5 3.5 H 5 M -5 6.5 H 3" strokeWidth="1.2" />
          </g>
        </>
      )}

      {/* Destellos de logro */}
      <g ref={r("spark")} stroke={ACCENT} strokeWidth="2" opacity="0">
        {[-150, -110, -70, -30, 10, 50, 130, 170].map((a) => {
          const [x1, y1] = [Math.cos(rad(a)) * 17, Math.sin(rad(a)) * 17];
          const [x2, y2] = [Math.cos(rad(a)) * 22, Math.sin(rad(a)) * 22];
          return <line key={a} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} />;
        })}
      </g>
    </svg>
  );
}

/* Mancuerna en la mano: perpendicular al antebrazo, gira con él */
function Dumbbell({ y }: { y: number }) {
  return (
    <g stroke={ACCENT}>
      <line x1="-5.5" y1={y} x2="5.5" y2={y} strokeWidth="2" />
      <rect x="-8.6" y={y - 4} width="3.2" height="8" rx="1" fill={ACCENT} stroke="none" />
      <rect x="5.4" y={y - 4} width="3.2" height="8" rx="1" fill={ACCENT} stroke="none" />
    </g>
  );
}
