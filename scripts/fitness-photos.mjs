// Genera las copias "-hd" de las fotos de Matías en public/fitness/ (portada y quién soy):
// nitidez suave, un poco más de contraste y color, JPEG 92 % con color completo (4:4:4).
// El original nunca se toca. Se regenera solo lo que cambió (original más nuevo que su -hd)
// y se borran las -hd que quedaron sin original.
//
// Uso: node scripts/fitness-photos.mjs          (desde la raíz del repo)
//      node scripts/fitness-photos.mjs --force  (regenera todas)
//
// app/fitness/page.tsx usa la -hd solo si es más nueva que el original, así una -hd vieja
// nunca tapa una foto nueva aunque alguien se olvide de correr este script.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public", "fitness");
const PHOTO = /^(?:matias-fitness-hero|portada.*|matias-fitness-about|quien[\s_-]*soy.*|sobre[\s_-]*mi.*)\.(?:jpe?g|png|webp)$/i;
const HD = /-hd\.jpg$/i;
const force = process.argv.includes("--force");

if (!fs.existsSync(DIR)) {
  console.error(`No existe ${DIR}. Correlo desde la raíz del repo.`);
  process.exit(1);
}

const files = fs.readdirSync(DIR);
const hdOf = (file) => file.replace(/\.[a-z]+$/i, "-hd.jpg");
const mtime = (file) => fs.statSync(path.join(DIR, file)).mtimeMs;

let made = 0;
for (const file of files.filter((f) => PHOTO.test(f) && !HD.test(f))) {
  const hd = hdOf(file);
  if (!force && files.includes(hd) && mtime(hd) >= mtime(file)) {
    console.log(`= ${hd} al día`);
    continue;
  }
  await sharp(path.join(DIR, file))
    .rotate() // respeta la orientación EXIF de las fotos de celular
    .linear(1.04, -4) // un poco más de contraste
    .modulate({ saturation: 1.06 }) // color apenas más vivo
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 2.2 }) // nitidez suave, sin halos
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(DIR, hd));
  const { width, height } = await sharp(path.join(DIR, hd)).metadata();
  console.log(`+ ${hd} (${width}×${height}) desde ${file}`);
  made++;
}

// -hd huérfanas: su original ya no está
for (const hd of files.filter((f) => HD.test(f))) {
  const hasOriginal = files.some((f) => !HD.test(f) && hdOf(f) === hd);
  if (!hasOriginal) {
    fs.unlinkSync(path.join(DIR, hd));
    console.log(`- ${hd} borrada (no tiene original)`);
  }
}

console.log(made ? `Listo: ${made} copia(s) nueva(s).` : "Nada que regenerar.");
