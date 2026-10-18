"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";

/* ═════════════════════════════════════════════════════════════
   CV MODAL — vista previa + descarga, dentro de la misma página
   El PDF va en /public con este nombre exacto. El atributo
   `download` fuerza el nombre del archivo guardado, optimizado
   para búsquedas de recruiters de Data Analytics.
   ═════════════════════════════════════════════════════════════ */
export const CV_PATH = "/Matias_Bellido_Data_Analytics_CV.pdf";
const CV_FILENAME = "Matias_Bellido_Data_Analytics_CV.pdf";

export default function CVModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLanguage();
  const { setModalOpen: setGlobalModalOpen } = useModal();

  /* Oculta el header, bloquea el scroll de fondo y cierra con Esc
     (mismo comportamiento que los modales de Proyectos) */
  useEffect(() => {
    if (!open) return;
    setGlobalModalOpen(true);
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      setGlobalModalOpen(false);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose, setGlobalModalOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] modal-overlay"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-8 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Curriculum Vitae"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative modal-surface rounded-3xl overflow-hidden w-full max-w-4xl h-[92vh] md:h-[90vh] flex flex-col pointer-events-auto text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6 border-b border-cyan/20">
                <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl md:text-3xl font-bold gradient-text leading-tight">
                      Curriculum Vitae
                    </h3>
                    <p className="text-sm text-fg-soft">Matías Bellido · Actuario & Data Scientist</p>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label={lang === "es" ? "Cerrar" : "Close"}
                    className="sm:hidden shrink-0 p-2.5 rounded-full glass hover:bg-cyan/20 transition-all touch-manipulation"
                  >
                    <X className="w-5 h-5 text-fg" />
                  </button>
                </div>

                {/* CTA principal: descarga con nombre optimizado */}
                <a
                  href={CV_PATH}
                  download={CV_FILENAME}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full bg-electric text-white font-semibold text-sm shadow-glow hover:shadow-glow-lg transition-all text-center"
                >
                  <Download className="w-5 h-5 shrink-0" />
                  <span>
                    {lang === "es" ? "Descargar Curriculum Vitae - Bellido, Matías" : "Download Resume - Bellido, Matías"}
                  </span>
                </a>

                <button
                  onClick={onClose}
                  aria-label={lang === "es" ? "Cerrar" : "Close"}
                  className="hidden sm:inline-flex shrink-0 p-2.5 rounded-full glass hover:bg-cyan/20 transition-all touch-manipulation"
                >
                  <X className="w-5 h-5 text-fg" />
                </button>
              </div>

              {/* Vista previa. Algunos navegadores mobile no muestran PDFs
                  embebidos: para esos queda el botón de descarga. */}
              <iframe
                src={`${CV_PATH}#view=FitH`}
                title={lang === "es" ? "Vista previa del CV de Matías Bellido" : "Matías Bellido's resume preview"}
                className="block w-full flex-1 bg-white"
              />
              <p className="text-center text-xs text-fg-muted px-4 py-2.5 border-t border-cyan/10">
                {lang === "es"
                  ? "¿No ves la vista previa? Usá el botón de descarga."
                  : "Can't see the preview? Use the download button."}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
