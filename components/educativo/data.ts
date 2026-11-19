import type { EducativoPackId } from "@/context/LanguageContext";

/* ═════════════════════════════════════════════════════════════
   /educativo — precios y links (lo que Matías actualiza a mano)

   Los precios COPIAN los de la tienda online: no se sincronizan solos.
   Si cambian en la tienda, actualizalos acá a mano.
   La descripción de cada pack está en LanguageContext
   (t.educativo.packs.descriptions[id]) porque va en español y en inglés.

   La compra va por el carrito de la página (mismo flujo que /fitness:
   Carrito → Mercado Pago → formulario). Los links de la tienda son
   opcionales: con link, cada pack suma "Ver en la tienda" (otra pestaña) y
   abajo aparece "Ver tienda completa". Vacíos (""), no se muestran: nunca
   un link a "#".
   ═════════════════════════════════════════════════════════════ */

// TODO(Matías): pegá el link de la tienda completa (opcional). Vacío = no se muestra.
export const STORE_CART_URL = "";

export type EducativoPack = {
  /** Estable: lo usan el diccionario y los tests (no cambiar aunque cambie el nombre) */
  id: EducativoPackId;
  /** Nombre de marca: igual en los dos idiomas */
  name: string;
  /** Precio actual en ARS */
  price: number;
  /** Precio de lista anterior (se muestra tachado); null = no tiene */
  listPrice: number | null;
  /** Link directo a ese producto en la tienda (opcional). "" = no se muestra */
  buyUrl: string;
  group: "packs" | "plans" | "single";
  unit: "month" | "class";
  /** Pack destacado (uno solo) */
  featured?: boolean;
};

export const PACKS: EducativoPack[] = [
  // TODO(Matías): si querés, pegá en cada buyUrl el link del producto en la tienda.
  { id: "promotion", name: "Promotion Pack", price: 390000, listPrice: 480000, buyUrl: "", group: "packs", unit: "month", featured: true },
  { id: "support", name: "Support Pack", price: 320000, listPrice: 350000, buyUrl: "", group: "packs", unit: "month" },
  { id: "tec", name: "Tec Pack", price: 250000, listPrice: 280000, buyUrl: "", group: "packs", unit: "month" },
  { id: "black", name: "Plan Black", price: 115600, listPrice: 138400, buyUrl: "", group: "plans", unit: "month" },
  { id: "avanzado", name: "Plan Avanzado", price: 47480, listPrice: null, buyUrl: "", group: "plans", unit: "month" },
  { id: "smart", name: "Plan Smart", price: 15980, listPrice: null, buyUrl: "", group: "plans", unit: "month" },
  { id: "clase", name: "Clase Particular", price: 27330, listPrice: null, buyUrl: "", group: "single", unit: "class" },
];

/* Material de estudio publicado en GitHub Pages (repos públicos de Matías).
   Vacío = el botón queda deshabilitado con "Próximamente".
   TODO(Matías): si un palacio cambia de dirección, actualizá su link acá. */
export const MACRO_PALACE_URL = "https://matiasbellidor.github.io/3PMAC_2C2026/";
export const STATS_PALACE_URL = "https://matiasbellidor.github.io/REC1PAE2/";

/* Formulario de Google para después de pagar o para consultas (materia,
   cuántas clases, fecha del examen, email, teléfono…). Es el link público de
   respuesta (/viewform), no el de edición (/edit).
   Cargado el 2026-11-19. Si algún día queda vacío, en el sitio publicado los
   botones del formulario no aparecen (el carrito pide el comprobante por
   WhatsApp) y en desarrollo se ve un aviso de que falta el link. */
export const EDU_FORM_URL: string = "https://docs.google.com/forms/d/e/1FAIpQLSeSXNJHKHVHYITD8eQU5VCLH1oxFmWuUd8wyOJ9mmC_5qGhLA/viewform";
export const EDU_FORM_PREVIEW = EDU_FORM_URL === "" && process.env.NODE_ENV === "development";

/* Perfil profesional (el mismo link del pie del portfolio) */
export const LINKEDIN_URL = "https://www.linkedin.com/in/matiasbellido";

/* Precio con la etiqueta ARS: "ARS 390.000" (es-AR) / "ARS 390,000" (en-US) */
const formatters = {
  es: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", currencyDisplay: "code", maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat("en-US", { style: "currency", currency: "ARS", currencyDisplay: "code", maximumFractionDigits: 0 }),
};
export const formatPrice = (n: number, lang: "es" | "en") => formatters[lang].format(n);

/** Descuento contra el precio de lista, redondeado: 480.000 → 390.000 = 19 */
export const discountPct = (pack: EducativoPack) =>
  pack.listPrice && pack.listPrice > pack.price ? Math.round((1 - pack.price / pack.listPrice) * 100) : null;
