import Image from "next/image";
/* Los que ya usa /fitness (mismos archivos, sin duplicarlos) */
import barChart from "@/public/fitness/emojis/bar-chart.png";
import book from "@/public/fitness/emojis/book.png";
import calendar from "@/public/fitness/emojis/calendar.png";
import cart from "@/public/fitness/emojis/cart.png";
import hourglass from "@/public/fitness/emojis/hourglass.png";
import moneyBag from "@/public/fitness/emojis/money-bag.png";
import sparkles from "@/public/fitness/emojis/sparkles.png";
import stopwatch from "@/public/fitness/emojis/stopwatch.png";
import telephone from "@/public/fitness/emojis/telephone.png";
/* Propios de /educativo */
import abacus from "@/public/educativo/emojis/abacus.png";
import anxious from "@/public/educativo/emojis/anxious.png";
import brick from "@/public/educativo/emojis/brick.png";
import classicalBuilding from "@/public/educativo/emojis/classical-building.png";
import construction from "@/public/educativo/emojis/construction.png";
import magnifier from "@/public/educativo/emojis/magnifier.png";

/* Emojis de Apple (iOS 18.4, © Apple Inc.) como imagen, igual que en /fitness:
   todo ícono que ilustra un contenido es uno de estos; los controles (menú,
   idioma, flechas, acordeón) y los ✓ de las listas siguen con lucide.
   El mismo concepto lleva el mismo emoji en toda la página: lo que quedó
   flojo es 🧱, el diagnóstico 🔍, lo que viene 📅.
   Para sumar uno: PNG de 160 px en public/educativo/emojis/ (receta
   "receta-emojis-de-apple" en el vault) e importalo acá. */
const EMOJI = {
  abacus, // 🧮
  anxious, // 😰
  barChart, // 📊
  book, // 📖
  brick, // 🧱
  calendar, // 📅
  cart, // 🛒
  classicalBuilding, // 🏛️
  construction, // 🏗️
  hourglass, // ⏳
  magnifier, // 🔍
  moneyBag, // 💰
  sparkles, // ✨
  stopwatch, // ⏱️
  telephone, // ☎️
} as const;

export type EmojiName = keyof typeof EMOJI;

/* Decorativo (alt vacío): el texto de al lado ya dice lo mismo. width 56 está
   en imageSizes (next.config.js): sirve 56 px en 1x y 112 px en 2x y 3x. */
export function Emoji({ name, className = "w-7 h-7", eager = false }: { name: EmojiName; className?: string; eager?: boolean }) {
  return (
    <Image
      src={EMOJI[name]}
      alt=""
      width={56}
      height={56}
      loading={eager ? "eager" : undefined}
      draggable={false}
      data-emoji={name}
      className={`shrink-0 select-none ${className}`}
    />
  );
}
