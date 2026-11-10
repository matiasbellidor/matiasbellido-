import fs from "node:fs";
import path from "node:path";
import FitnessLanding from "@/components/fitness/FitnessLanding";
import type { FitnessAssets } from "@/components/fitness/shared";

/* ═════════════════════════════════════════════════════════════
   FOTOS DE LA LANDING — se buscan solas en public/fitness/

   Al generar la página (en dev, en cada recarga; en producción, en el
   build) se revisa qué fotos existen. Para sumarlas alcanza con
   guardarlas en la carpeta; no hace falta tocar código. Se aceptan dos
   formas de nombrarlas (no importan mayúsculas, espacios ni guiones):

     Portada (hero):  public/fitness/portada….jpg
                      o public/fitness/matias-fitness-hero.jpg
     Quién soy:       public/fitness/quien-soy….jpg / sobre-mi….jpg
                      o public/fitness/matias-fitness-about.jpg
     Clientes:        public/fitness/clients/clientes 1 antes.jpg + clientes 1 despues.jpg
                      o public/fitness/clients/client-01-before.jpg + client-01-after.jpg
     Certificados:    public/fitness/Certificados/<nombre de la certificación>.jpg/.png/.pdf
                      (ej. "IFBB Cross Pro Fitness.jpg"). El nombre se compara con
                      t.fitness.about.certs (FitnessAbout.tsx: matchCertificate):
                      la certificación que tiene archivo se puede abrir.

   Extensiones: .jpg .jpeg .png .webp .avif. Se usa el nombre real del
   archivo, así anda igual en Windows y en Vercel (Linux distingue
   mayúsculas). Se muestran solo los clientes que tienen alguna foto;
   el texto de cada uno va en t.fitness.results.captions (LanguageContext).

   Si existe una versión "-hd" más nueva que el original (ej.
   portada_fitness_bellido-hd.jpg, con nitidez y contraste corregidos), se
   usa esa. Al cambiar una foto: node scripts/fitness-photos.mjs
   ═════════════════════════════════════════════════════════════ */

const PUBLIC_DIR = path.join(process.cwd(), "public");
const EXT = String.raw`\.(?:jpe?g|png|webp|avif)$`;
const HERO = new RegExp(String.raw`^(?:matias-fitness-hero|portada.*)` + EXT, "i");
const ABOUT = new RegExp(String.raw`^(?:matias-fitness-about|quien[\s_-]*soy.*|sobre[\s_-]*mi.*)` + EXT, "i");
// "clientes 1 antes", "cliente_2_después", "client-03-before"…
const CLIENT = new RegExp(String.raw`^client(?:e|es)?[\s_-]*0*(\d+)[\s_-]*(before|after|antes|despu[eé]s)` + EXT, "i");
/* Sin ninguna foto de clientes, se muestran estos lugares vacíos */
const PLACEHOLDER_CLIENTS = 2;

function filesIn(folder: string): string[] {
  try {
    return fs.readdirSync(path.join(PUBLIC_DIR, folder)).sort();
  } catch {
    return []; // la carpeta todavía no existe
  }
}

const mtime = (folder: string, file: string) => fs.statSync(path.join(PUBLIC_DIR, folder, file)).mtimeMs;

/* `?v=` = fecha del archivo. next/image guarda cada foto optimizada 30 días
   (minimumCacheTTL en next.config.js) con el link como clave: si Matías
   reemplaza una foto con el MISMO nombre, sin esto se seguía viendo la vieja
   (pasó con el cliente 4, 2026-11-06). Con la fecha en el link, una foto
   nueva es un link nuevo y se procesa de nuevo. */
const url = (folder: string, file: string) =>
  `/${folder}/${encodeURIComponent(file)}?v=${Math.round(mtime(folder, file) / 1000).toString(36)}`;

/* Devuelve el nombre del archivo. La copia "-hd" se usa solo si es más
   nueva que su original: si Matías reemplaza la foto y nadie corrió
   scripts/fitness-photos.mjs, se ve la foto nueva (sin mejorar) y no la
   -hd vieja. */
function findOne(folder: string, pattern: RegExp): string | null {
  const isHd = (f: string) => /-hd\.[a-z]+$/i.test(f);
  const hits = filesIn(folder).filter((f) => pattern.test(f));
  const original = hits.find((f) => !isHd(f));
  if (!original) return hits[0] ?? null; // solo quedó una -hd
  const hd = hits.find((f) => isHd(f) && f.replace(/-hd\.[a-z]+$/i, "") === original.replace(/\.[a-z]+$/i, ""));
  return hd && mtime(folder, hd) >= mtime(folder, original) ? hd : original;
}


function findClients(): FitnessAssets["clients"] {
  const byNumber = new Map<number, { before: string | null; after: string | null }>();
  for (const file of filesIn("fitness/clients")) {
    const m = CLIENT.exec(file.normalize("NFC"));
    if (!m) continue;
    const n = Number(m[1]);
    const slot = byNumber.get(n) ?? { before: null, after: null };
    if (/^(before|antes)$/i.test(m[2])) slot.before = url("fitness/clients", file);
    else slot.after = url("fitness/clients", file);
    byNumber.set(n, slot);
  }
  if (byNumber.size === 0) {
    return Array.from({ length: PLACEHOLDER_CLIENTS }, (_, i) => ({ n: i + 1, before: null, after: null }));
  }
  return [...byNumber.entries()].sort(([a], [b]) => a - b).map(([n, slot]) => ({ n, ...slot }));
}

/* Certificados: imágenes o PDF. La carpeta se busca sin distinguir
   mayúsculas ("Certificados" o "certificados"): Vercel (Linux) sí las distingue. */
const CERT_FILE = /\.(?:jpe?g|png|webp|avif|pdf)$/i;
function findCertificates(): FitnessAssets["certificates"] {
  const folderName = filesIn("fitness").find((f) => /^certificados?$/i.test(f));
  if (!folderName) return [];
  const folder = `fitness/${folderName}`;
  return filesIn(folder)
    .filter((f) => CERT_FILE.test(f))
    .map((file) => ({
      name: file.normalize("NFC").replace(/\.[a-z0-9]+$/i, ""),
      url: url(folder, file),
      pdf: /\.pdf$/i.test(file),
    }));
}

function getFitnessAssets(): FitnessAssets {
  const hero = findOne("fitness", HERO);
  const about = findOne("fitness", ABOUT);
  return {
    hero: hero ? url("fitness", hero) : null,
    about: about ? url("fitness", about) : null,
    clients: findClients(),
    certificates: findCertificates(),
  };
}

export default function FitnessPage() {
  return <FitnessLanding assets={getFitnessAssets()} />;
}
