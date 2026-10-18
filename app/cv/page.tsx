import type { Metadata } from "next";
import { Download, ExternalLink, ArrowLeft } from "lucide-react";

/* ═════════════════════════════════════════════════════════════
   CV — vista previa + descarga
   El PDF va en /public con este nombre exacto. El atributo
   `download` fuerza el nombre del archivo guardado, optimizado
   para búsquedas de recruiters de Data Analytics.
   ═════════════════════════════════════════════════════════════ */
const CV_PATH = "/Matias_Bellido_Data_Analytics_CV.pdf";
const CV_FILENAME = "Matias_Bellido_Data_Analytics_CV.pdf";

export const metadata: Metadata = {
  title: "Curriculum Vitae — Matías Bellido",
  description: "CV de Matías Bellido — Actuario & Data Scientist. Data Analytics, Python, SQL, Power BI.",
};

export default function CVPage() {
  return (
    <main className="relative z-10 min-h-screen bg-[var(--bg)] px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-5 sm:gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-cyan hover:opacity-80 transition-opacity mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
            </a>
            <h1 className="font-display text-[clamp(1.75rem,7vw,2.5rem)] font-bold gradient-text leading-tight">
              Curriculum Vitae
            </h1>
            <p className="text-sm text-fg-soft">Matías Bellido · Actuario & Data Scientist</p>
          </div>

          {/* CTA principal: descarga con nombre optimizado */}
          <a
            href={CV_PATH}
            download={CV_FILENAME}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-electric text-white font-semibold text-sm sm:text-base shadow-glow hover:shadow-glow-lg transition-all text-center"
          >
            <Download className="w-5 h-5 shrink-0" />
            <span>Descargar Curriculum Vitae - Bellido, Matías</span>
          </a>
        </header>

        {/* Vista previa. En navegadores mobile que no renderizan PDF
            embebido, queda el link para abrirlo con el visor nativo. */}
        <div className="glass rounded-2xl overflow-hidden">
          <iframe
            src={`${CV_PATH}#view=FitH`}
            title="Vista previa del CV de Matías Bellido"
            className="block w-full h-[75vh] min-h-[480px] bg-white"
          />
        </div>

        <p className="text-center text-sm text-fg-muted">
          ¿No se ve la vista previa?{" "}
          <a
            href={CV_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan hover:underline"
          >
            Abrir PDF <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </p>
      </div>
    </main>
  );
}
