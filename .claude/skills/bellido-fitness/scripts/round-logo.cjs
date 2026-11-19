// Logos de apps REDONDOS: el círculo entero es del color de la marca y el glifo va en blanco
// (no un círculo blanco con el logo adentro). Glifos de Simple Icons (CC0).
// Uso: node round-logo.cjs <carpeta-de-salida>      (sharp sale de node_modules del repo)
// Genera: linkedin-round.png, github-round.png, whatsapp-round.png (192×192) y google-forms.png (1024×1024), con fondo transparente.
const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

const OUT = process.argv[2];
if (!OUT) {
  console.error("Uso: node round-logo.cjs <carpeta-de-salida>");
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
const VERSION = "13.21.0";
const SIZE = 192;

const glyph = async (slug) => {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@${VERSION}/icons/${slug}.svg`);
  if (!res.ok) throw new Error(`Simple Icons no tiene "${slug}" (HTTP ${res.status})`);
  const d = (await res.text()).match(/ d="([^"]+)"/)?.[1];
  if (!d) throw new Error(`sin path para ${slug}`);
  return d;
};
const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24">${inner}</svg>`;

(async () => {
  // LinkedIn: disco azul y las letras "in" en blanco. El glifo es un cuadrado azul con "in" calado:
  // se usa como máscara invertida, así lo blanco son solo las letras.
  const li = await glyph("linkedin");
  const linkedin = wrap(
    `<defs><mask id="m"><rect width="24" height="24" fill="#fff"/><path fill="#000" d="${li}"/></mask><clipPath id="c"><rect x="2" y="2" width="20" height="20"/></clipPath></defs>` +
      `<circle cx="12" cy="12" r="12" fill="#0A66C2"/>` +
      // el recorte (clipPath) deja afuera los bordes y las esquinas del cuadrado: quedan solo las letras
      `<g transform="translate(12 12) scale(0.66) translate(-12 -12)"><g clip-path="url(#c)"><rect width="24" height="24" fill="#fff" mask="url(#m)"/></g></g>`,
  );
  // WhatsApp: disco verde y el teléfono en blanco
  const wa = await glyph("whatsapp");
  const whatsapp = wrap(
    `<circle cx="12" cy="12" r="12" fill="#25D366"/>` + `<g transform="translate(12 12) scale(0.62) translate(-12 -12)"><path fill="#fff" d="${wa}"/></g>`,
  );
  // GitHub: disco oscuro y el gato en blanco, CHICO (no zoomeado). El glifo de Simple Icons es un disco con el gato
  // calado: se usa como máscara invertida (lo blanco es el gato), recortada al disco y achicada.
  const gh = await glyph("github");
  const github = wrap(
    `<defs><mask id="g"><rect width="24" height="24" fill="#fff"/><path fill="#000" d="${gh}"/></mask><clipPath id="gc"><circle cx="12" cy="12" r="11.6"/></clipPath></defs>` +
      `<circle cx="12" cy="12" r="12" fill="#181717"/>` +
      `<circle cx="12" cy="12" r="11.75" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="0.5"/>` +
      `<g transform="translate(12 12) scale(0.6) translate(-12 -12)"><g clip-path="url(#gc)"><rect width="24" height="24" fill="#fff" mask="url(#g)"/></g></g>`,
  );
  // Google Forms (ícono nuevo, violeta): Google no publica el PNG nuevo (el CDN solo tiene el viejo), así que se
  // dibuja en vectores siguiendo la captura de Matías: cuadrado redondeado con degradé violeta y dos filas
  // (punto + barra) en blanco. 1024 px, sin pérdida al achicarlo.
  const forms = wrap(
    `<defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8F83FA"/><stop offset="1" stop-color="#6A55E8"/></linearGradient></defs>` +
      `<rect x="1" y="1" width="22" height="22" rx="6.4" fill="url(#f)"/>` +
      `<g fill="#fff"><circle cx="7.6" cy="9.4" r="1.45"/><rect x="10.6" y="8.2" width="6.6" height="2.4" rx="1.2"/><circle cx="7.6" cy="14.6" r="1.45"/><rect x="10.6" y="13.4" width="6.6" height="2.4" rx="1.2"/></g>`,
  );
  await sharp(Buffer.from(forms), { density: 1200 }).resize(1024, 1024).png({ compressionLevel: 9 }).toFile(path.join(OUT, "google-forms.png"));
  console.log("+", path.join(OUT, "google-forms.png"));

  for (const [name, svg] of Object.entries({ linkedin, whatsapp, github })) {
    const file = path.join(OUT, `${name}-round.png`);
    await sharp(Buffer.from(svg), { density: 300 }).resize(SIZE, SIZE).png({ compressionLevel: 9 }).toFile(file);
    console.log("+", file);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
