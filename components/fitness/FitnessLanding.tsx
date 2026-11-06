"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import IntroLoader from "@/components/IntroLoader";
import PauseOffscreenGradients from "@/components/PauseOffscreenGradients";
import FitnessHeader from "./FitnessHeader";
import FitnessHero from "./FitnessHero";
import FitnessAudience from "./FitnessAudience";
import FitnessAbout from "./FitnessAbout";
import FitnessSteps from "./FitnessSteps";
import FitnessMethod from "./FitnessMethod";
import FitnessAssimilation from "./FitnessAssimilation";
import FitnessResults from "./FitnessResults";
import FitnessFaq from "./FitnessFaq";
import FitnessPlans from "./FitnessPlans";
import { FitnessAffiliates, FitnessInfoproducts } from "./FitnessOffers";
import FitnessFinalCta from "./FitnessFinalCta";
import FitnessCart from "./FitnessCart";
import { CartProvider } from "./cart";
import type { FitnessAssets } from "./shared";

/* Foto del Hero del portfolio: respaldo mientras falten las de /fitness */
const PROFILE_PHOTO = "/projects/Imagenes/profile.webp";

/* Landing de /fitness (Bellido Asesoramientos), 100 % entrenamiento.
   Orden: propuesta de valor (hero, para quién, quién soy), resultados
   (pedido de Matías: la prueba de que funciona, antes de explicar cómo se
   empieza) y después la estructura del PDF: cómo empezar, método,
   asimilación, servicios con precios, infoproductos, afiliados, preguntas
   y contacto.
   Las preguntas van DESPUÉS de los precios (pedido de Matías: el objetivo
   es que compre): primero ve la oferta y, justo antes del contacto, se le
   resuelven las dudas que le quedan.
   MotionConfig "user": con "reducir movimiento" Framer saca los
   desplazamientos y deja solo los fundidos. */
export default function FitnessLanding({ assets }: { assets: FitnessAssets }) {
  /* La misma foto nunca aparece dos veces: el Hero usa la de entrenamiento
     (o la del portfolio si todavía no está) y Quién soy usa la suya (o la
     del portfolio solo si el Hero ya no la ocupa; si no, el panel con el logo). */
  const heroPhoto = assets.hero ?? PROFILE_PHOTO;
  const aboutPhoto = assets.about ?? (assets.hero ? PROFILE_PHOTO : null);

  /* /fitness es siempre oscuro, sin importar el tema guardado ni el del
     sistema (en claro se veía raro, sobre todo en el celular). El script del
     layout raíz ya lo aplica antes del primer paint; acá cubre la navegación
     con <Link> desde el portfolio (que puede estar en claro). Al salir se
     restaura el tema guardado; el Header del portfolio también lo hace al
     montarse, así que no hay parpadeo al volver. */
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
        <div className="fit-backdrop" aria-hidden="true" />
        <div className="fixed inset-0 z-0 grid-bg pointer-events-none opacity-60" aria-hidden="true" />
        <FitnessHeader />
        <div className="relative z-10">
          <FitnessHero photo={heroPhoto} />
          <FitnessAudience />
          <FitnessAbout photo={aboutPhoto} />
          <FitnessResults clients={assets.clients} />
          <FitnessSteps />
          <FitnessMethod />
          <FitnessAssimilation />
          <FitnessPlans />
          <FitnessInfoproducts />
          <FitnessAffiliates />
          <FitnessFaq />
          <FitnessFinalCta />
        </div>
        {/* Carrito: botón flotante + panel de compra con Mercado Pago */}
        <FitnessCart />
      </main>
      </CartProvider>
    </MotionConfig>
  );
}
