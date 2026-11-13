"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Languages, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BrandName, WhatsAppButton } from "./shared";
/* El mismo ícono del Header del portfolio y del favicon */
import logo from "@/app/icon.png";

/* Qué sección de la página corresponde a cada link del menú (en orden).
   Las que no tienen link propio se suman al anterior: así siempre hay
   uno marcado mientras se baja. */
const SECTIONS_BY_LINK: Record<string, string[]> = {
  "sobre-mi": ["para-quien", "sobre-mi"],
  resultados: ["resultados"],
  metodo: ["metodo", "asimilacion"],
  empezar: ["empezar"],
  planes: ["planes", "infoproductos", "afiliados"],
  preguntas: ["preguntas", "contacto"],
};

/* Header flotante en Liquid Glass. Desktop (lg+): logo a la izquierda,
   secciones CENTRADAS y CTA a la derecha (grilla 1fr · auto · 1fr). El
   menú marca dónde estás: una píldora que se desliza al link activo, un
   punto por sección (lleno = ya la pasaste) y una barra de progreso fina
   en el borde de abajo. Menos de lg: logo, CTA y un menú desplegable con
   el mismo material y las mismas marcas. */
export default function FitnessHeader() {
  const { t, lang, setLang } = useLanguage();
  const nav = t.fitness.nav;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  // Sección activa: la última cuyo borde de arriba ya pasó el 35 % de la pantalla.
  // Rendimiento (2026-11-13): el borde de arriba de cada sección se mide una vez
  // y otra vez solo cuando algo cambia de tamaño (ResizeObserver); en cada cuadro
  // del scroll solo se compara con window.scrollY. Antes se medían todas las
  // secciones en cada cuadro y eso obligaba a recalcular el layout (~13 ms por
  // cuadro en un celular).
  useEffect(() => {
    const order = nav.links.flatMap((link) => (SECTIONS_BY_LINK[link.id] ?? [link.id]).map((section) => ({ section, link: link.id })));
    let tops: { top: number; link: string }[] = [];
    const measure = () => {
      const scrollY = window.scrollY;
      tops = order.flatMap(({ section, link }) => {
        const el = document.getElementById(section);
        return el ? [{ top: scrollY + el.getBoundingClientRect().top, link }] : [];
      });
    };
    let ticking = false;
    const update = () => {
      ticking = false;
      const probe = window.scrollY + window.innerHeight * 0.35;
      let current: string | null = null;
      for (const { top, link } of tops) if (top <= probe) current = link;
      setActive(current);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      onScroll();
    };
    const resize = new ResizeObserver(remeasure);
    resize.observe(document.body);
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      resize.disconnect();
    };
  }, [nav.links]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const toggleLang = () => setLang(lang === "es" ? "en" : "es");
  const activeIndex = nav.links.findIndex((link) => link.id === active);
  const stateOf = (i: number) => (i === activeIndex ? "active" : activeIndex > i ? "done" : "next");

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-4 md:px-8"
    >
      <div ref={rootRef} className="max-w-6xl mx-auto">
        <div className="liquid-glass relative overflow-hidden rounded-full h-14 pl-3 pr-2 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-2">
          <a href="#inicio" aria-label={nav.home} className="fit-focus justify-self-start flex items-center gap-2 min-w-0 rounded-full">
            <Image src={logo} alt="" width={32} height={32} priority className="w-8 h-8 object-contain shrink-0" />
            {/* 24 px: la segunda línea queda en 10 px, legible */}
            <BrandName className="text-[1.5rem]" sub={0.42} />
          </a>

          {/* Entre lg y xl los links van más juntos para que el menú entre centrado */}
          <nav aria-label="Secciones" className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {nav.links.map((link, i) => (
              <NavLink key={link.id} id={link.id} label={link.label} state={stateOf(i)} layoutId="nav-pill-desktop" />
            ))}
          </nav>

          <div className="justify-self-end flex items-center gap-1 shrink-0">
            {/* Idioma: el mismo botón que el Header del portfolio (ícono + "es"/"en"); el idioma se
                guarda y vale para todo el sitio. Desde sm: abajo de 640 px no entra al lado de la
                marca y del CTA (faltaban hasta 40 px), así que ahí va en el menú. Entre lg y xl va
                sin ícono: con las 6 secciones, la marca y el CTA, el menú no quedaba centrado. */}
            <button
              type="button"
              onClick={toggleLang}
              // Empieza con lo que se ve ("ES") para que el control por voz lo encuentre
              aria-label={`${lang.toUpperCase()}, ${nav.lang}`}
              className="fit-focus hidden sm:flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 lg:max-xl:px-2 transition-colors hover:bg-cyan/10 touch-manipulation"
            >
              <Languages className="w-4 h-4 text-cyan lg:max-xl:hidden" aria-hidden="true" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs uppercase font-mono text-fg-soft"
                >
                  {lang}
                </motion.span>
              </AnimatePresence>
            </button>
            <WhatsAppButton message={t.fitness.whatsappMessage} label={nav.cta} size="sm" labelFrom="min400" />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="fitness-menu"
              aria-label={open ? nav.close : nav.menu}
              className="fit-focus lg:hidden grid place-items-center w-10 h-10 rounded-full text-fg transition-colors hover:bg-cyan/10 touch-manipulation"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Progreso de lectura: solo transform (scaleX), sin repintar */}
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress }}
            className="pointer-events-none absolute left-4 right-4 bottom-0 h-0.5 origin-left rounded-full bg-gradient-to-r from-cyan to-electric"
          />
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              id="fitness-menu"
              aria-label="Secciones"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="liquid-glass lg:hidden mt-2 rounded-3xl p-2 origin-top"
            >
              <ul className="flex flex-col">
                {nav.links.map((link, i) => (
                  <li key={link.id}>
                    <NavLink id={link.id} label={link.label} state={stateOf(i)} layoutId="nav-pill-mobile" block onClick={() => setOpen(false)} />
                  </li>
                ))}
                {/* Idioma en el celular (abajo de sm no entra en la barra): dice a qué idioma cambia */}
                <li className="sm:hidden mt-1 border-t border-cyan/15 pt-1">
                  <button
                    type="button"
                    onClick={toggleLang}
                    className="fit-focus flex h-12 w-full items-center gap-2 rounded-full px-4 text-base font-medium text-fg-muted transition-colors hover:text-fg"
                  >
                    <Languages className="w-4 h-4 text-cyan" aria-hidden="true" />
                    <span lang={lang === "es" ? "en" : "es"}>{nav.langOther}</span>
                  </button>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

function NavLink({
  id,
  label,
  state,
  layoutId,
  block = false,
  onClick,
}: {
  id: string;
  label: string;
  state: "active" | "done" | "next";
  layoutId: string;
  block?: boolean;
  onClick?: () => void;
}) {
  const isActive = state === "active";
  return (
    <a
      href={`#${id}`}
      onClick={onClick}
      aria-current={isActive ? "location" : undefined}
      className={`fit-focus relative flex items-center gap-2 rounded-full transition-colors ${
        block ? "h-12 px-4 text-base" : "h-10 px-3 lg:max-xl:px-2 text-sm"
      } font-medium ${isActive ? "text-fg" : state === "done" ? "text-fg-soft hover:text-fg" : "text-fg-muted hover:text-fg"}`}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-full bg-cyan/15 border border-cyan/30 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]"
        />
      )}
      {/* Punto de progreso: vacío = falta, lleno = ya la pasaste, con halo = estás acá */}
      <span
        aria-hidden="true"
        className={`relative w-1.5 h-1.5 shrink-0 rounded-full transition-colors duration-200 ${
          isActive ? "bg-cyan shadow-[0_0_0_3px_rgb(var(--accent-cyan)/0.25)]" : state === "done" ? "bg-cyan/70" : "border border-current opacity-50"
        }`}
      />
      <span className="relative whitespace-nowrap">{label}</span>
    </a>
  );
}
