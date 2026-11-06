// Genera el logo de un botón (ej. WhatsApp, Gmail) en PNG con fondo transparente:
// el glifo de Simple Icons (CC0) en su color, sobre un círculo blanco, 144×144.
// Uso: PLAYWRIGHT_DIR=<node_modules con playwright> node icon-png.cjs <slug> <#color> <salida.png>
// Ej.:  node icon-png.cjs whatsapp "#25D366" public/fitness/whatsapp-logo.png
//       node icon-png.cjs gmail "#EA4335" public/fitness/gmail-logo.png
const path = require("node:path");

const [slug, color, out] = process.argv.slice(2);
if (!slug || !color || !out) {
  console.error('Uso: node icon-png.cjs <slug> <"#color"> <salida.png>');
  process.exit(1);
}
const req = (m) => require(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, m) : m);
const { chromium } = req("playwright");
const VERSION = "13.21.0"; // la misma versión que los logos que ya están en public/fitness

(async () => {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@${VERSION}/icons/${slug}.svg`);
  if (!res.ok) throw new Error(`Simple Icons no tiene "${slug}" (HTTP ${res.status})`);
  const d = (await res.text()).match(/ d="([^"]+)"/)?.[1];
  if (!d) throw new Error("No encontré el path del ícono");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 144, height: 144 } });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><svg width="144" height="144" viewBox="0 0 144 144" xmlns="http://www.w3.org/2000/svg">` +
      `<circle cx="72" cy="72" r="72" fill="#FFFFFF"/><g transform="translate(36 36) scale(3)"><path fill="${color}" d="${d}"/></g></svg></body></html>`,
  );
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: 144, height: 144 } });
  await browser.close();
  console.log(`+ ${out}`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
