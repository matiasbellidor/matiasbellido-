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
   Orden: propuesta de valor (hero, para quién, quién soy) y después la
   estructura del PDF: cómo empezar, método, asimilación, (resultados),
   preguntas, servicios, infoproductos, afiliados y contacto.
   MotionConfig "user": con "reducir movimiento" Framer saca los
   desplazamientos y deja solo los fundidos. */
export default function FitnessLanding({ assets }: { assets: FitnessAssets }) {
  /* La misma foto nunca aparece dos veces: el Hero usa la de entrenamiento
     (o la del portfolio si todavía no está) y Quién soy usa la suya (o la
     del portfolio solo si el Hero ya no la ocupa; si no, el panel con el logo). */
  const heroPhoto = assets.hero ?? PROFILE_PHOTO;
  const aboutPhoto = assets.about ?? (assets.hero ? PROFILE_PHOTO : null);

  /* Sin tema guardado, /fitness sigue al sistema y cambia en vivo si el
     usuario cambia el modo del sistema (el script del layout raíz ya lo
     aplica antes del primer paint; acá cubre la navegación con <Link>). */
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {
      /* storage bloqueado: seguimos al sistema */
    }
    if (saved) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => document.documentElement.classList.toggle("dark", !mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
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
          <FitnessSteps />
          <FitnessMethod />
          <FitnessAssimilation />
          <FitnessResults clients={assets.clients} />
          <FitnessFaq />
          <FitnessPlans />
          <FitnessInfoproducts />
          <FitnessAffiliates />
          <FitnessFinalCta />
        </div>
        {/* Carrito: botón flotante + panel de compra con Mercado Pago */}
        <FitnessCart />
      </main>
      </CartProvider>
    </MotionConfig>
  );
}
