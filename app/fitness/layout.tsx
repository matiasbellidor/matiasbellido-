import type { Metadata } from "next";
import { preload } from "react-dom";
import "./fitness.css";

/* Tipografía de marca, solo para "BELLIDO" (header, hero y pie): Cinzel,
   capitales romanas estilo Trajan, como el logo de Bellido Asesoramientos
   del portfolio (public/projects/Imagenes/asesoramientos.png). Debajo va
   "ASESORAMIENTOS" en Inter espaciada, igual que en el logo, así la página
   sigue con dos familias. El texto corrido sigue en Inter (layout raíz).
   Se declara en fitness.css (@font-face "Bellido Cinzel", archivos en
   public/fitness/fonts) y acá solo se precarga el archivo latin, para que
   el nombre aparezca con su fuente desde el primer pintado. */
const BRAND_FONT = "/fitness/fonts/cinzel-latin.woff2";

/* Metadata propia de /fitness (reemplaza la del portfolio en esta ruta).
   El layout raíz sigue aplicando: fuente base, tema, idioma y favicon. */
const TITLE = "Bellido Asesoramientos · Fitness Coaching";
const DESCRIPTION =
  "Entrenamiento y alimentación personalizados: mesociclos ajustados a tu progreso, sin prohibir alimentos y con seguimiento por WhatsApp. Packs y planes, virtuales o presenciales.";

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

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  preload(BRAND_FONT, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return <>{children}</>;
}
