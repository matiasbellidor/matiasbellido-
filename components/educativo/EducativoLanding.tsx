"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import IntroLoader from "@/components/IntroLoader";
import PauseOffscreenGradients from "@/components/PauseOffscreenGradients";
import SectionStepper from "@/components/SectionStepper";
import EducativoHeader from "./EducativoHeader";
import EducativoHero from "./EducativoHero";
import { EducativoAbout, EducativoMethod, EducativoProblem, EducativoSteps } from "./EducativoSections";
import EducativoPacks from "./EducativoPacks";
import EducativoStudy from "./EducativoStudy";
import { EducativoAffiliates, EducativoContact, EducativoFaq } from "./EducativoClosing";
import EducativoCart from "./EducativoCart";
import { CartProvider } from "./cart";

/* Landing de /educativo (Bellido Asesoramientos Educativo): la contraparte
   de /fitness, con su mismo sistema visual (fitness.css, piezas de
   components/fitness/shared.tsx) y su propio header.
   Propuesta corta a propósito (pedido de Matías, con una landing de
   referencia de un programa fitness): se lee y se entiende en pocas
   palabras. Orden: hero → método (3 tarjetas) → quién soy → ¿te pasa? +
   beneficios → packs → cómo arrancar → preguntas → material UBA (fila
   desplegable, discreta) → afiliados → contacto. Las preguntas van después
   de los precios, como en /fitness.
   MotionConfig "user": con "reducir movimiento" quedan solo los fundidos. */
export default function EducativoLanding() {
  /* Siempre oscuro, como /fitness. El script de app/educativo/layout.tsx lo
     aplica antes del primer paint; esto cubre la navegación con <Link>
     desde el portfolio. Al salir se restaura el tema guardado. */
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("theme");
      } catch {
        /* storage bloqueado: oscuro, el valor por defecto */
      }
      document.documentElement.classList.toggle("dark", saved !== "light");
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
      {/* overflow-x-clip (no hidden): hidden rompería los sticky */}
      <main id="top" className="relative min-h-screen overflow-x-clip">
        <IntroLoader />
        <PauseOffscreenGradients />
        <SectionStepper mode="sections" />
        <div className="fit-backdrop" aria-hidden="true" />
        <div className="fixed inset-0 z-0 grid-bg pointer-events-none opacity-60" aria-hidden="true" />
        <EducativoHeader />
        {/* Menos aire entre secciones que en /fitness (pedido de Matías): 32 px en el
            celular y 48 px desde md, en vez de 64 y 96. El hero conserva el suyo. */}
        <div className="relative z-10 [&>section:not(#inicio)]:!py-8 md:[&>section:not(#inicio)]:!py-12">
          <EducativoHero />
          <EducativoMethod />
          <EducativoAbout />
          <EducativoProblem />
          <EducativoPacks />
          <EducativoSteps />
          <EducativoFaq />
          <EducativoStudy />
          <EducativoAffiliates />
          <EducativoContact />
        </div>
        {/* Carrito, como en /fitness: botón flotante + panel de compra con Mercado Pago */}
        <EducativoCart />
      </main>
      </CartProvider>
    </MotionConfig>
  );
}
