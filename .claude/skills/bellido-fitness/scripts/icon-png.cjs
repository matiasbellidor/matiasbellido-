// Genera el logo de un botón (ej. WhatsApp, Gmail) en PNG con fondo transparente:
// el glifo de Simple Icons (CC0) en su color, sobre un círculo blanco, 144×144.
// Uso: PLAYWRIGHT_DIR=<node_modules con playwright> node icon-png.cjs <slug> <#color> <salida.png> [versión]
// Ej.:  node icon-png.cjs whatsapp "#25D366" public/fitness/whatsapp-logo.png
//       node icon-png.cjs gmail "#EA4335" public/fitness/gmail-logo.png
// Regla de Matías: SIEMPRE el logo PNG de la app en los botones que llevan a una app (no íconos genéricos).
// Si el glifo de Simple Icons es viejo o no existe (Outlook: lo sacaron en la 12.5 y el de la 12.0 es el
// de 2019, que Matías rechazó), usar el ícono actual de la App Store con appstore-logo.py.
const path = require("node:path");

const [slug, color, out, version] = process.argv.slice(2);
if (!slug || !color || !out) {
  console.error('Uso: node icon-png.cjs <slug> <"#color"> <salida.png> [versión]');
  process.exit(1);
}
const req = (m) => require(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, m) : m);
const { chromium } = req("playwright");
const VERSION = version || "13.21.0"; // por defecto, la misma versión que los logos que ya están en public/

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
