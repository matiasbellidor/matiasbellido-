// Verificación funcional de /educativo contra el dev de :3000.
// Uso: PLAYWRIGHT_DIR=<node_modules con playwright> node .claude/skills/bellido-educativo/scripts/check-educativo.cjs
// Opcionales: ORIGIN (default http://localhost:3000), OUT (capturas; default carpeta temporal).
// Si la página cambia de estructura a propósito, actualizá las aserciones en el mismo cambio.
const path = require("path");
const fs = require("fs");
const os = require("os");
const { chromium } = require(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, "playwright") : "playwright");
const REPO = path.resolve(__dirname, "../../../..");
const AXE = fs.readFileSync(path.join(REPO, "node_modules/axe-core/axe.min.js"), "utf8");
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
const OUT = process.env.OUT || path.join(os.tmpdir(), "educativo-check");
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, cond, extra = "") => {
  results.push({ name, pass: !!cond, extra });
  console.log(`${cond ? "OK  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};

const WA = "https://wa.me/5491168300606?text=";
const decodeWa = (href) => (href && href.startsWith(WA) ? decodeURIComponent(href.slice(WA.length)) : null);

async function newPage(browser, { width = 1440, height = 900, lang = "es", theme = "light", reduced = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.addInitScript(
    ([lang, theme]) => {
      try {
        sessionStorage.setItem("intro-seen", "1");
        localStorage.setItem("lang", lang);
        localStorage.setItem("theme", theme);
      } catch {}
    },
    [lang, theme],
  );
  const page = await ctx.newPage();
  page.setDefaultTimeout(40000);
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page, errors };
}

// Baja de a poco para que entren todas las animaciones de scroll (whileInView)
async function scrollThrough(page) {
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(900);
}

(async () => {
  const browser = await chromium.launch();

  // ── 1. Español, desktop, con tema claro guardado (la página tiene que ser oscura igual)
  {
    const { ctx, page, errors } = await newPage(browser, { theme: "light" });
    await page.goto(`${ORIGIN}/educativo`, { waitUntil: "load" });
    await page.waitForSelector("#inicio h1");
    ok("título de la pestaña", (await page.title()) === "Bellido Asesoramientos · Asesoramiento Educativo", await page.title());
    ok("siempre oscuro (aunque el tema guardado sea claro)", await page.evaluate(() => document.documentElement.classList.contains("dark")));

    const ids = await page.evaluate(() => [...document.querySelectorAll("main section[id]")].map((s) => s.id));
    const expected = ["inicio", "metodo", "sobre-mi", "problema", "packs", "empezar", "preguntas", "material", "afiliados", "contacto"];
    ok("10 secciones en orden, sin 'Para padres'", JSON.stringify(ids) === JSON.stringify(expected), ids.join(" → "));

    const headers = await page.evaluate(() => [...document.querySelectorAll("header")].map((h) => h.innerText.replace(/\s+/g, " ").slice(0, 80)));
    ok("sin el Header del portfolio (un solo header, el de la landing)", headers.length === 1 && !/Proyectos|Experiencia|Habilidades/.test(headers[0]), headers.join(" | "));
    const navLinks = await page.$$eval("header nav a", (as) => as.map((a) => a.getAttribute("href")));
    ok("cada link del menú apunta a una sección que existe", navLinks.length === 4 && !navLinks.includes("#material") && navLinks.every((h) => expected.includes(h.slice(1))), navLinks.join(" "));

    // Foto del hero
    const photo = await page.evaluate(() => {
      const img = document.querySelector("#inicio img[alt='Matías Bellido']");
      if (!img) return null;
      const box = img.parentElement.getBoundingClientRect();
      return { src: img.currentSrc, nw: img.naturalWidth, nh: img.naturalHeight, fw: Math.round(box.width), fh: Math.round(box.height), fit: getComputedStyle(img).objectFit };
    });
    ok("foto de perfil en el hero, cargada", photo && /profile/.test(photo.src) && photo.nw > 0, photo && `${photo.src.split("?")[0].split("/").pop()} url=${photo.src.slice(-60)}`);
    ok("marco cuadrado: la foto 1:1 se ve entera", photo && Math.abs(photo.fw - photo.fh) <= 1, photo && `${photo.fw}×${photo.fh}, natural ${photo.nw}×${photo.nh}, ${photo.fit}`);

    await scrollThrough(page);

    // Packs
    const packs = await page.$$eval("#packs article", (arts) =>
      arts.map((a) => ({
        name: a.querySelector("h3")?.textContent.trim(),
        text: a.innerText.replace(/\s+/g, " "),
        struck: a.querySelector("s")?.textContent.trim() || null,
        buy: [...a.querySelectorAll("a")].map((l) => ({ href: l.getAttribute("href"), target: l.target, rel: l.rel, text: l.innerText.trim() })),
        featured: /Recomendado/.test(a.innerText),
      })),
    );
    const names = packs.map((p) => p.name);
    ok("7 packs y servicios", names.join("|") === "Promotion Pack|Support Pack|Tec Pack|Plan Black|Plan Avanzado|Plan Smart|Clase Particular", names.join(", "));
    const price = (n) => packs.find((p) => p.name === n);
    const NB = String.fromCharCode(160);
    const norm = (s) => (s || "").split(NB).join(" ");
    ok("precio es-AR con ARS: Promotion 390.000 y tachado 480.000", /ARS 390\.000/.test(norm(price("Promotion Pack").text)) && norm(price("Promotion Pack").struck) === "ARS 480.000", norm(price("Promotion Pack").struck));
    ok("tachados solo donde hay precio anterior (4)", packs.filter((p) => p.struck).map((p) => p.name).join(",") === "Promotion Pack,Support Pack,Tec Pack,Plan Black");
    ok("descuento en número (−19 % en Promotion)", /−19 %/.test(norm(price("Promotion Pack").text)));
    ok("solo el Promotion Pack destacado", packs.filter((p) => p.featured).map((p) => p.name).join(",") === "Promotion Pack");
    // innerText respeta text-transform: la etiqueta se lee "POR MES"
    ok("'por mes' en packs y planes, 'por clase' en la clase", packs.filter((p) => /por mes/i.test(p.text)).length === 6 && /por clase/i.test(price("Clase Particular").text));
    const tops = await page.$$eval("#packs article.liquid-glass", (as) => as.slice(0, 3).map((a) => Math.round(a.querySelector("h3").getBoundingClientRect().top)));
    ok("fila de packs alineada (el sello no empuja el contenido)", new Set(tops).size === 1, tops.join(","));
    const rows = await page.$$eval("#contacto ul a", (as) => as.map((a) => Math.round(a.getBoundingClientRect().width)));
    ok("contacto: filas de email, LinkedIn y formulario del mismo ancho", rows.length === 3 && new Set(rows).size === 1, rows.join(","));
    ok("Tec Pack con 10 clases", /10 clases de una hora/.test(price("Tec Pack").text));
    const addButtons = await page.$$eval("#packs article", (as) => as.map((a) => [...a.querySelectorAll("button")].some((b) => /Agregar al carrito/.test(b.innerText))));
    ok("cada pack tiene '🛒 Agregar al carrito'", addButtons.length === 7 && addButtons.every(Boolean));
    const consultOk = packs.every((p) => {
      const wa = p.buy.find((b) => b.href && b.href.startsWith(WA));
      const msg = wa && decodeWa(wa.href);
      return wa && msg.includes(p.name) && wa.target === "_blank" && /noopener/.test(wa.rel) && /noreferrer/.test(wa.rel);
    });
    ok("cada pack tiene 'Consultar' por WhatsApp con su nombre (otra pestaña, noopener noreferrer)", consultOk, decodeWa(packs[0].buy[0]?.href));
    ok("links de tienda ocultos mientras no hay URL", !packs.some((p) => p.buy.some((b) => /Ver detalle|Ver en la tienda/.test(b.text))));
    ok("Plan Black con su lista de la tienda (clase semanal y 22,3%)", /1 clase semanal de 1 hora/.test(price("Plan Black").text) && /22,3%/.test(price("Plan Black").text));
    ok("Avanzado y Smart con su lista (16,1% y 12,7%)", /Asesoramiento semanal/.test(price("Plan Avanzado").text) && /16,1%/.test(price("Plan Avanzado").text) && /12,7%/.test(price("Plan Smart").text));
    ok("ningún link a '#' vacío", (await page.$$eval("a[href='#'], a[href='']", (a) => a.length)) === 0);

    ok("ningún plan manda a la tienda para entender qué incluye", !packs.some((p) => /en la tienda/i.test(p.text)));

    // Material UBA: fila discreta, cerrada por defecto; se despliega con "Ver material"
    ok("Material UBA cerrado por defecto (sin links montados)", (await page.$$eval("#material a", (a) => a.length)) === 0);
    const toggle = page.getByRole("button", { name: "Ver material" });
    ok("el botón del desplegable dice que está cerrado", (await toggle.getAttribute("aria-expanded")) === "false");
    await toggle.click();
    await page.waitForTimeout(600);
    ok("al abrir, aria-expanded pasa a true", (await page.locator("#material button[aria-expanded]").getAttribute("aria-expanded")) === "true");
    const palaces = await page.$$eval("#material a",(as) => as.map((a) => ({ href: a.href, target: a.target, rel: a.rel, text: a.innerText.trim() })));
    ok(
      "dos 'Abrir palacio' a GitHub Pages, en otra pestaña",
      palaces.length === 2 &&
        palaces[0].href === "https://matiasbellidor.github.io/3PMAC_2C2026/" &&
        palaces[1].href === "https://matiasbellidor.github.io/REC1PAE2/" &&
        palaces.every((p) => p.target === "_blank" && /noopener/.test(p.rel) && /noreferrer/.test(p.rel)),
      palaces.map((p) => p.href).join(" "),
    );
    const study = await page.$eval("#material", (s) => s.innerText);
    ok("Macro: 'Segunda parte de la materia', sin 'tercer parcial'", /Segunda parte de la materia/.test(study) && !/tercer|3er/i.test(study));
    ok("AE2: 'Primera parte de la materia'", /Primera parte de la materia/.test(study));
    const shimmer = await page.$$eval("#material a span[aria-hidden='true']", (s) => s.length);
    ok("brillo del botón presente con movimiento normal", shimmer >= 2, `${shimmer} capas`);

    // Beneficios textuales
    const inc = await page.$$eval("#problema .fit-surface li", (lis) => lis.map((l) => l.innerText.trim()));
    ok(
      "beneficios textuales",
      JSON.stringify(inc) ===
        JSON.stringify(["Temario organizacional en pasos", "Asesoramiento personalizado P2P las 24 h", "Videos explicativos personalizados (opcional)", "20 clases de una hora cada una", "Reembolso de no obtener resultados esperados"]),
      inc.join(" / "),
    );

    // FAQ acordeón
    const faqCount = await page.$$eval("#preguntas button[aria-expanded]", (b) => b.length);
    const bodyText = await page.evaluate(() => document.querySelector("main").innerText);
    ok("8 preguntas en acordeón", faqCount === 8, String(faqCount));
    const portfolioLink = page.locator("#sobre-mi a[href='/']");
    ok("Quién soy: botón al portfolio profesional (misma pestaña)", (await portfolioLink.count()) === 1 && !(await portfolioLink.getAttribute("target")) && /portfolio profesional/i.test(await portfolioLink.innerText()));
    ok("lista las materias y dice Actuario", ["Matemática", "Estadística", "Contabilidad", "Macroeconomía", "Inglés", "Excel", "Python", "SQL", "HTML", "Inteligencia Artificial"].every((m) => bodyText.includes(m)) && /Estudio Actuario en la UBA/.test(bodyText) && /primario, secundario y universitario/.test(bodyText));
    ok("aclara que muchas clases las da alguien del equipo", /me reparto las clases con otros profes/.test(await page.$eval("#sobre-mi", (s) => s.innerText)));
    ok("sin 'Para padres' en la página", !/Para padres|Para madres/.test(await page.evaluate(() => document.body.innerText)));
    const first = page.locator("#preguntas button[aria-expanded]").first();
    await first.click();
    await page.waitForTimeout(400);
    const opened = await first.getAttribute("aria-expanded");
    const regionH = await page.evaluate(() => {
      const b = document.querySelector("#preguntas button[aria-expanded]");
      return document.getElementById(b.getAttribute("aria-controls")).getBoundingClientRect().height;
    });
    ok("la pregunta se abre", opened === "true" && regionH > 20, `alto ${Math.round(regionH)}px`);

    // Afiliados y contacto
    const af = await page.$eval("#afiliados", (s) => ({ text: s.innerText, wa: s.querySelector("a")?.getAttribute("href") }));
    ok("afiliados: 25% y 20% residual, CTA a WhatsApp", /25%/.test(af.text) && /20%/.test(af.text) && /afiliados/.test(decodeWa(af.wa) || ""));
    const contact = await page.$$eval("#contacto a", (as) => as.map((a) => a.getAttribute("href")));
    ok("contacto: WhatsApp, Gmail y LinkedIn", contact.some((h) => h.startsWith(WA)) && contact.some((h) => /mail\.google\.com/.test(h)) && contact.some((h) => /linkedin\.com\/in\/matiasbellido/.test(h)), contact.join(" "));
    const footerLinks = await page.$$eval("footer a", (as) => as.map((a) => a.getAttribute("href")));
    ok("pie: vuelta al portfolio y botón de arrepentimiento", footerLinks.includes("/") && footerLinks.some((h) => /arrepent/.test(decodeWa(h) || "")));
    const formLink = page.locator("#contacto a[href*='docs.google.com/forms']");
    ok("contacto: botón del formulario de Google, en otra pestaña, sin aviso de 'falta el link'", (await formLink.count()) === 1 && (await formLink.getAttribute("href")).endsWith("/viewform") && (await formLink.getAttribute("target")) === "_blank" && /noopener/.test(await formLink.getAttribute("rel")) && !/falta pegar/.test(await page.$eval("#contacto", (s) => s.innerText)));
    ok("el PDF no aparece en la página", !(await page.content()).includes("Bellido-Asesoramientos-Educativo.pdf"));

    const body = await page.evaluate(() => document.querySelector("main").innerText);
    ok("sin proyectos del portfolio en la página", !/ZIRA|NexStock|OneiricAi|NutriOps|Symbiosis|AgroCow/.test(body));
    ok("sin texto genérico sobre la foto", !/Diagnosticar|Completar|Avanzar/i.test(await page.$eval("#inicio", (s) => s.innerText)));
    ok("21 años (no 20)", /21 años/.test(body) && !/20 años/.test(body));
    ok("titular nuevo, sin 'no te entra'",!/no te entra/i.test(body) && /no te cierra/.test(body));
    const words = body.split(/\s+/).filter(Boolean).length;
    ok("palabras visibles en la página (FAQ cerrada)", true, String(words));
    // Emojis cargados
    const emojis = await page.$$eval("img[data-emoji]", (imgs) => imgs.map((i) => ({ n: i.dataset.emoji, ok: i.complete && i.naturalWidth > 0 })));
    ok("todos los emojis cargaron", emojis.every((e) => e.ok), `${emojis.length} imágenes, ${new Set(emojis.map((e) => e.n)).size} distintos`);

    // axe
    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
      return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
    });
    ok("axe WCAG 2.1 AA sin violaciones", axe.length === 0, axe.join(" ;; "));

    // Capturas por sección
    for (const id of expected) {
      const el = page.locator(`#${id}`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await el.screenshot({ path: path.join(OUT, `1440-${id}.png`) });
    }
    await page.locator("footer").screenshot({ path: path.join(OUT, `1440-footer.png`) });
    ok("consola sin errores (es, 1440)", errors.length === 0, errors.slice(0, 3).join(" || "));
    await ctx.close();
  }

  // ── 2. Inglés, 375 px
  {
    const { ctx, page, errors } = await newPage(browser, { width: 375, height: 812, lang: "en", theme: "dark" });
    await page.goto(`${ORIGIN}/educativo`, { waitUntil: "load" });
    await page.waitForSelector("#inicio h1");
    await scrollThrough(page);
    const NB = String.fromCharCode(160);
    const packsText = (await page.$eval("#packs", (s) => s.innerText)).split(NB).join(" ");
    ok("en-US: ARS 390,000 y 'per month'", /ARS 390,000/.test(packsText) && /per month/i.test(packsText));
    ok("nombres de packs iguales en inglés", /Promotion Pack/.test(packsText) && /Clase Particular/.test(packsText));
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    ok("375 px sin scroll horizontal", sw[0] <= sw[1], sw.join(" vs "));
    // tarjetas de packs apiladas: una por fila
    const lefts = await page.$$eval("#packs article.liquid-glass", (as) => [...new Set(as.map((a) => Math.round(a.getBoundingClientRect().left)))]);
    ok("en el celular los packs se apilan (una columna)", lefts.length === 1, lefts.join(","));
    // fila de proyectos: se desliza en horizontal y no en vertical

    for (const id of ["inicio", "metodo", "problema", "packs", "empezar", "contacto"]) {
      const el = page.locator(`#${id}`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await el.screenshot({ path: path.join(OUT, `375-en-${id}.png`) });
    }
    ok("consola sin errores (en, 375)", errors.length === 0, errors.slice(0, 3).join(" || "));
    await ctx.close();
  }

  // ── 3. Reducir movimiento: sin brillo ni halo en "Abrir palacio"
  {
    const { ctx, page } = await newPage(browser, { reduced: true });
    await page.goto(`${ORIGIN}/educativo`, { waitUntil: "load" });
    await page.waitForSelector("#material", { state: "attached" });
    await scrollThrough(page);
    await page.getByRole("button", { name: "Ver material" }).click();
    await page.waitForTimeout(300);
    const opened = await page.$$eval("#material a", (a) => a.length);
    ok("con 'reducir movimiento' el desplegable abre igual", opened === 2, String(opened));
    const layers =await page.$$eval("#material a span[aria-hidden='true'], #material a + span, #material div.relative > span[aria-hidden='true']", (s) => s.length);
    ok("con 'reducir movimiento' no hay brillo ni halo", layers === 0, `${layers} capas`);
    await ctx.close();
  }

  // ── 4. Portfolio: el botón educativo del modal lleva a /educativo en la misma pestaña
  {
    const { ctx, page, errors } = await newPage(browser, { theme: "dark" });
    await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
    await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
    const btn = page.getByRole("button", { name: /^Propuesta$/ }).first();
    // la tarjeta de Asesoramientos es la que tiene el botón destacado (bg-electric)
    const asesBtn = page.locator("button.bg-electric", { hasText: "Propuesta" }).first();
    await asesBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await asesBtn.click();
    const card = page.getByRole("link", { name: /Asesoramientos Educativos/ });
    await card.waitFor();
    const href = await card.getAttribute("href");
    const target = await card.getAttribute("target");
    const popups = [];
    ctx.on("page", (p) => popups.push(p));
    await card.click();
    await page.waitForURL(/\/educativo$/, { timeout: 60000 });
    await page.waitForSelector("#inicio h1");
    ok("modal del portfolio → /educativo con <Link>, misma pestaña", href === "/educativo" && !target && popups.length === 0, `href=${href} target=${target}`);
    ok("sin botón de PDF en el modal", !(await page.content()).includes("Bellido-Asesoramientos-Educativo.pdf"));
    ok("al llegar por <Link>, la página queda oscura", await page.evaluate(() => document.documentElement.classList.contains("dark")));
    const portfolioHeader = await page.$$eval("header", (hs) => hs.length);
    ok("al llegar por <Link>, sin el Header del portfolio", portfolioHeader === 1, String(portfolioHeader));
    void btn;
    ok("consola sin errores (portfolio → educativo)", errors.filter((e) => !/418|422|hydrat/i.test(e)).length === 0, errors.slice(0, 3).join(" || "));
    await ctx.close();
  }

  // ── 5. Carrito (mismo flujo que /fitness): agregar, pasos, Mercado Pago, recarga y comprobante
  {
    const NB = String.fromCharCode(160);
    const norm = (s) => (s || "").split(NB).join(" ");
    const { ctx, page, errors } = await newPage(browser, { width: 390, height: 844 });
    await page.goto(`${ORIGIN}/educativo`, { waitUntil: "load" });
    await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
    const floating = page.locator("button[aria-label^='Ver carrito:']");
    await floating.waitFor();
    ok("carrito flotante siempre a la vista; vacío dice 'Vacío'", /Ver carrito: Vacío/.test(norm(await floating.getAttribute("aria-label"))) && /Vacío/.test(await floating.innerText()));
    // No tapa los botones del hero (regla del vault: mirar qué tapa un flotante)
    const overlap = await page.evaluate(() => {
      const f = document.querySelector("button[aria-label^='Ver carrito:']").getBoundingClientRect();
      return [...document.querySelectorAll("#inicio a")].some((a) => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.left < f.right && r.right > f.left && r.top < f.bottom && r.bottom > f.top;
      });
    });
    ok("el carrito flotante no tapa los botones del hero (390 px)", !overlap);
    const promo = page.locator("#packs article", { hasText: "Promotion Pack" });
    await promo.scrollIntoViewIfNeeded();
    await promo.getByRole("button", { name: "Agregar al carrito" }).click();
    await promo.getByRole("button", { name: /En el carrito/ }).waitFor();
    ok("al agregar un pack, el botón pasa a 'En el carrito · Ver'", true);
    const clase = page.locator("#packs article", { hasText: "Clase Particular" });
    await clase.scrollIntoViewIfNeeded();
    await clase.getByRole("button", { name: "Agregar al carrito" }).click();
    await clase.getByRole("button", { name: "Agregar al carrito" }).click();
    await page.waitForTimeout(200);
    const label = norm(await floating.getAttribute("aria-label"));
    ok("botón flotante con cantidad y total (390.000 + 2 × 27.330)", /Ver carrito: 3 · ARS 444\.660/.test(label), label);
    await floating.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    ok("panel con los pasos Carrito → Pago → Formulario", /Carrito[\s\S]*Pago[\s\S]*Formulario/.test(await dialog.innerText()));
    await dialog.getByRole("button", { name: "Una clase menos" }).click();
    await page.waitForTimeout(200);
    ok("'−' en la clase suelta baja el total", /ARS 417\.330/.test(norm(await dialog.innerText())));
    // Código de descuento arriba de pagar: inválido → error al lado del campo; válido → solo el primer mes de packs y planes
    const codeInput = dialog.getByLabel("Código de descuento");
    await codeInput.fill("NOEXISTE");
    await dialog.getByRole("button", { name: "Aplicar" }).click();
    ok("código inválido: error al lado del campo", (await dialog.getByRole("alert").innerText()).includes("no es válido") && (await codeInput.getAttribute("aria-invalid")) === "true");
    await codeInput.fill("bellido25off");
    await dialog.getByRole("button", { name: "Aplicar" }).click();
    await page.waitForTimeout(200);
    const withCode = norm(await dialog.innerText());
    // 390.000 − 25 % = 292.500; la clase suelta (27.330) no se descuenta → 319.830
    ok("código válido: descuenta solo el primer mes del pack, no la clase suelta", /Descuento · BELLIDO25OFF\s*−ARS 97\.500/.test(withCode) && /ARS 319\.830/.test(withCode) && /Primer mes con descuento/.test(withCode), withCode.match(/Descuento[^\n]*\n?[^\n]*/)?.[0]);
    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document.querySelector("[role='dialog']"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
      return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
    });
    ok("axe sin violaciones en el panel del carrito", axe.length === 0, axe.join(" ;; "));
    await dialog.getByRole("button", { name: "Ir a pagar" }).click();
    const mp = await dialog.locator("a[href*='mpago.la']").getAttribute("href");
    ok("paso de pago: link de Mercado Pago y alias", !!mp && /matibellido/.test(await dialog.innerText()));
    await page.reload({ waitUntil: "load" });
    const reopened = page.getByRole("dialog");
    await reopened.waitFor();
    ok("al recargar en el pago, el carrito se reabre en ese paso", /Pagá con Mercado Pago/.test(await reopened.innerText()));
    await reopened.getByRole("button", { name: "Ya pagué" }).click();
    const receipt = await reopened.locator(`a[href^='${WA}']`).first().getAttribute("href");
    const msg = norm(decodeWa(receipt));
    ok("último paso: comprobante por WhatsApp con lo comprado, el total y el código", /Promotion Pack/.test(msg) && /Clase Particular/.test(msg) && /ARS 319\.830/.test(msg) && /BELLIDO25OFF/.test(msg), msg);
    const formBtn = reopened.locator("a[href*='docs.google.com/forms']");
    ok("último paso: botón 'Completar el formulario' a Google Forms (otra pestaña)", (await formBtn.count()) === 1 && (await formBtn.getAttribute("target")) === "_blank" && /noopener/.test(await formBtn.getAttribute("rel")) && !/falta pegar/.test(await reopened.innerText()));
    await reopened.getByRole("button", { name: "Terminar" }).click();
    await page.waitForTimeout(400);
    ok("'Terminar' vacía el carrito (el flotante vuelve a decir 'Vacío')", /Vacío/.test(norm(await page.locator("button[aria-label^='Ver carrito:']").getAttribute("aria-label"))));
    ok("consola sin errores (carrito)", errors.length === 0, errors.slice(0, 3).join(" || "));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} OK`);
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
