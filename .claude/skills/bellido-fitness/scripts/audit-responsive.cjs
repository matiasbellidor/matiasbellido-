// Auditoría responsive de todo el sitio (home y /fitness): 13 anchos de 320 a 1920 px, claro/oscuro y es/en.
// Marca: scroll horizontal, elementos que se salen de la pantalla (fuera de carruseles), texto que no entra
// en su caja y zonas táctiles de menos de 24 px en celular. Deja capturas de página completa.
// Uso: PLAYWRIGHT_DIR=<node_modules con playwright> ORIGIN=http://localhost:3007 node audit-responsive.cjs
// Opcionales: PAGES="/,/fitness", OUT=<carpeta> (default: carpeta temporal). En Git Bash, con PAGES anteponé
// MSYS_NO_PATHCONV=1 (si no, convierte "/fitness" en una ruta de Windows). Falso positivo conocido: el
// input.peer.sr-only del contacto (radio oculto; se toca su etiqueta, que mide 44 px).
const path = require("path");
const fs = require("fs");
const os = require("os");
const { chromium } = require(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, "playwright") : "playwright");
const OUT = process.env.OUT || path.join(os.tmpdir(), "responsive-audit");
fs.mkdirSync(OUT, { recursive: true });
const ORIGIN = process.env.ORIGIN || "http://localhost:3007";
const PAGES = (process.env.PAGES || "/,/fitness").split(",");
const WIDTHS = [320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1920];
const SHOTS = new Set([320, 375, 768, 1024, 1440]);

async function audit(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox !== "visible") return true; // dentro de un carrusel o contenedor que recorta
      }
      return false;
    };
    const label = (el) => {
      const cls = typeof el.className === "string" ? el.className : el.getAttribute("class") || "";
      const txt = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 40);
      const sec = el.closest("section[id], header, footer, nav")?.id || el.closest("section[id], header, footer, nav")?.tagName.toLowerCase() || "";
      return `${sec} › ${el.tagName.toLowerCase()}.${cls.split(" ").slice(0, 3).join(".")} "${txt}"`;
    };
    const visible = (el, r) => {
      if (r.width < 1 || r.height < 1) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05;
    };
    const out = { overflow: document.documentElement.scrollWidth > vw + 1, scrollW: document.documentElement.scrollWidth, vw, protrude: [], textCut: [], small: [] };
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("[aria-hidden='true']") && el.closest(".fit-marquee")) continue;
      const r = el.getBoundingClientRect();
      if (!visible(el, r)) continue;
      const fixed = getComputedStyle(el).position === "fixed";
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el) && !fixed) out.protrude.push(`${label(el)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
      // texto que no entra en su caja (sin recorte a propósito: ellipsis/line-clamp)
      const cs = getComputedStyle(el);
      if (el.children.length === 0 && el.textContent.trim().length > 1 && el.scrollWidth > el.clientWidth + 2 && cs.overflowX === "visible" && cs.textOverflow !== "ellipsis" && !cs.webkitLineClamp?.match(/\d/) && cs.display !== "inline")
        out.textCut.push(`${label(el)} (${el.scrollWidth}>${el.clientWidth})`);
      if (vw <= 480 && el.matches("a, button, [role='button'], [role='slider'], input, summary") && !el.closest("p, li > p") ) {
        if ((r.width < 24 || r.height < 24) && visible(el, r)) out.small.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    out.protrude = [...new Set(out.protrude)].slice(0, 12);
    out.textCut = [...new Set(out.textCut)].slice(0, 12);
    out.small = [...new Set(out.small)].slice(0, 12);
    return out;
  });
}

(async () => {
  const browser = await chromium.launch();
  const report = [];
  for (const pagePath of PAGES) {
    for (const width of WIDTHS) {
      const combos = [["dark", "es"]];
      if ([320, 375, 768, 1440].includes(width)) combos.push(["light", "es"], ["dark", "en"]);
      for (const [theme, lang] of combos) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
        await ctx.addInitScript(({ theme, lang }) => { try { localStorage.setItem("theme", theme); localStorage.setItem("lang", lang); sessionStorage.setItem("intro-seen", "1"); } catch {} }, { theme, lang });
        const page = await ctx.newPage();
        await page.goto(ORIGIN + pagePath, { waitUntil: "networkidle" });
        await page.addStyleTag({ content: "html{scroll-behavior:auto!important} *{animation-duration:0s!important;transition-duration:0s!important}" });
        // pasar por toda la página para que aparezca lo que entra con el scroll
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
        await page.waitForTimeout(500);
        const a = await audit(page);
        const tag = `${pagePath} ${width}px ${theme} ${lang}`;
        const bad = a.overflow || a.protrude.length || a.textCut.length || a.small.length;
        report.push(`${bad ? "REVISAR" : "OK     "} ${tag}${a.overflow ? ` · SCROLL HORIZONTAL (${a.scrollW}>${a.vw})` : ""}`);
        for (const x of a.protrude) report.push(`    se sale: ${x}`);
        for (const x of a.textCut) report.push(`    texto cortado: ${x}`);
        for (const x of a.small) report.push(`    táctil chico: ${x}`);
        if (SHOTS.has(width) && theme === "dark" && lang === "es") {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `${OUT}/resp${pagePath.replace(/\//g, "_") || "_home"}-${width}.png`, fullPage: true });
        }
        await ctx.close();
      }
    }
  }
  fs.writeFileSync(`${OUT}/audit.txt`, report.join("\n"));
  console.log(report.join("\n"));
  await browser.close();
})();
