import Image from "next/image";
import apple from "@/public/fitness/emojis/apple.png";
import barChart from "@/public/fitness/emojis/bar-chart.png";
import biceps from "@/public/fitness/emojis/biceps.png";
import bone from "@/public/fitness/emojis/bone.png";
import book from "@/public/fitness/emojis/book.png";
import calendar from "@/public/fitness/emojis/calendar.png";
import cart from "@/public/fitness/emojis/cart.png";
import chartUp from "@/public/fitness/emojis/chart-up.png";
import cook from "@/public/fitness/emojis/cook.png";
import fire from "@/public/fitness/emojis/fire.png";
import graduationCap from "@/public/fitness/emojis/graduation-cap.png";
import handshake from "@/public/fitness/emojis/handshake.png";
import hourglass from "@/public/fitness/emojis/hourglass.png";
import label from "@/public/fitness/emojis/label.png";
import lightning from "@/public/fitness/emojis/lightning.png";
import moneyBag from "@/public/fitness/emojis/money-bag.png";
import plate from "@/public/fitness/emojis/plate.png";
import salad from "@/public/fitness/emojis/salad.png";
import shrug from "@/public/fitness/emojis/shrug.png";
import sparkles from "@/public/fitness/emojis/sparkles.png";
import speech from "@/public/fitness/emojis/speech.png";
import stopwatch from "@/public/fitness/emojis/stopwatch.png";
import target from "@/public/fitness/emojis/target.png";
import telephone from "@/public/fitness/emojis/telephone.png";
import videoCamera from "@/public/fitness/emojis/video-camera.png";
import weightlifter from "@/public/fitness/emojis/weightlifter.png";

/* Emojis de Apple (iOS 18.4, © Apple Inc.) como imagen, para que se vean
   iguales en todos los dispositivos: Android y Windows dibujan los suyos.
   Decisión de Matías (2026-11-10): en /fitness, todo ícono que ilustra un
   contenido es uno de estos; los controles (cerrar, flechas, menú, idioma,
   pausa, carrito) y los ✓ de las listas siguen con lucide.
   Para sumar uno: bajá el PNG de 160 px a public/fitness/emojis/ (receta
   "receta-emojis-de-apple" en el vault) e importalo acá. */
export const EMOJI = {
  apple, // 🍎
  barChart, // 📊
  biceps, // 💪
  bone, // 🦴
  book, // 📖
  calendar, // 📅
  cart, // 🛒
  chartUp, // 📈
  cook, // 🧑‍🍳
  fire, // 🔥
  graduationCap, // 🎓
  handshake, // 🤝
  hourglass, // ⏳
  label, // 🏷️
  lightning, // ⚡
  moneyBag, // 💰
  plate, // 🍽️
  salad, // 🥗
  shrug, // 🤷
  sparkles, // ✨
  speech, // 💬
  stopwatch, // ⏱️
  target, // 🎯
  telephone, // ☎️
  videoCamera, // 📹
  weightlifter, // 🏋️
} as const;

export type EmojiName = keyof typeof EMOJI;

/* Decorativo (alt vacío): el texto de al lado ya dice lo mismo. El tamaño
   en pantalla va por clase (w-7 h-7 = 28 px por defecto). width 56 está en
   imageSizes (next.config.js): next/image sirve 56 px en 1x y 112 px en
   2x y 3x, que alcanza para el más grande (32 px × 3 = 96). Todos usan las
   mismas dos URLs, así un emoji repetido en varios tamaños baja una vez. */
export function Emoji({ name, className = "w-7 h-7", eager = false }: { name: EmojiName; className?: string; eager?: boolean }) {
  return (
    <Image
      src={EMOJI[name]}
      alt=""
      width={56}
      height={56}
      loading={eager ? "eager" : undefined}
      draggable={false}
      // Para los tests: separa los emojis de las fotos (img[data-emoji] / img:not([data-emoji]))
      data-emoji={name}
      className={`shrink-0 select-none ${className}`}
    />
  );
}
