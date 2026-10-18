import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ScrollBackground from "@/components/ScrollBackground";
import IntroLoader from "@/components/IntroLoader";

/* Secciones debajo del fold: cada una en su propio chunk de JS.
   Siguen renderizándose en el servidor (SEO intacto), pero su
   código se hidrata aparte y no bloquea el primer paint del Hero. */
const Bio = dynamic(() => import("@/components/Bio"));
const Projects = dynamic(() => import("@/components/Projects"));
const Experience = dynamic(() => import("@/components/Experience"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-hidden">
      <IntroLoader />
      {/* Capa 1 (fondo): color interpolado por scroll */}
      <ScrollBackground />
      {/* Capa 2: grilla decorativa, transparente, sobre el color */}
      <div className="fixed inset-0 z-0 grid-bg pointer-events-none" aria-hidden="true" />
      {/* Capa 3 (arriba de todo): contenido */}
      <Header />
      <div className="relative z-10">
        <Hero />
        <Bio />
        <Projects />
        <Experience />
        <Footer />
      </div>
    </main>
  );
}
