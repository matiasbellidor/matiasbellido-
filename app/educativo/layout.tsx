import type { Metadata } from "next";
import { preload } from "react-dom";
/* Mismo material que /fitness (Liquid Glass, CTA, superficies, fuente de
   marca Cinzel): se importa tal cual, sin copiarlo */
import "../fitness/fitness.css";

const BRAND_FONT = "/fitness/fonts/cinzel-latin.woff2";

/* Metadata propia de /educativo (reemplaza la del portfolio en esta ruta) */
const TITLE = "Bellido Asesoramientos · Asesoramiento Educativo";
const DESCRIPTION =
  "Clases particulares virtuales 1 a 1: encuentro dónde te trabás, completo las bases que faltan y te preparo para lo que viene. Packs de clases, consultas por WhatsApp las 24 h y material de estudio para la UBA.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Bellido Asesoramientos",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/* /educativo es siempre oscuro, como /fitness. El script del layout raíz
   solo fuerza oscuro en /fitness, así que este lo hace acá antes de que se
   pinte el contenido (sin flash claro → oscuro con el tema claro guardado). */
const FORCE_DARK = `document.documentElement.classList.add("dark")`;

export default function EducativoLayout({ children }: { children: React.ReactNode }) {
  preload(BRAND_FONT, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: FORCE_DARK }} />
      {children}
    </>
  );
}
