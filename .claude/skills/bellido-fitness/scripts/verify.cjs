// Verificación de /fitness: layout 320–1920 px (claro, oscuro, inglés), contenido, WhatsApp,
// header y progreso, planes, comparadores antes/después, acordeón, tema y axe (WCAG AA).
// Playwright no está en el repo: PLAYWRIGHT_DIR=<node_modules con playwright y @axe-core/playwright>
// Uso (con npm run dev corriendo): PLAYWRIGHT_DIR=... node .claude/skills/bellido-fitness/scripts/verify.cjs
// Opcionales: BASE_URL (default http://localhost:3000/fitness), OUT_DIR (capturas; default carpeta temporal).
// Varias aserciones cuentan cosas del contenido actual (links, planes, clientes, textos):
// si las cambiás a propósito, actualizá la aserción.
const path = require("path");
const fs = require("fs");
const os = require("os");
const req = (m) => require(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, m) : m);
const { chromium } = req("playwright");
const { AxeBuilder } = req("@axe-core/playwright");
const OUT = process.env.OUT_DIR || path.join(os.tmpdir(), "fitness-verify");
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE_URL || "http://localhost:3000/fitness";
const results = [];
const log = (ok, msg) => results.push(`${ok ? "OK  " : "FAIL"} ${msg}`);

async function open(browser, { width = 1280, height = 900, theme = "dark", lang = "es", colorScheme = "dark", reducedMotion = "no-preference", saveTheme = true, url = BASE, touch = false, userAgent } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion, hasTouch: touch, isMobile: touch, ...(userAgent && { userAgent }) });
  await ctx.addInitScript(({ theme, lang, saveTheme }) => {
    try {
      if (saveTheme) localStorage.setItem("theme", theme); else localStorage.removeItem("theme");
      localStorage.setItem("lang", lang);
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
  }, { theme, lang, saveTheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" || /hydrat|Warning:/i.test(m.text())) errors.push(`console.${m.type()}: ${m.text().slice(0, 160)}`); });
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(() => document.fonts.ready);
  if (lang === "en") await page.waitForFunction(() => document.querySelector("h1")?.innerText.includes("Training"));
  return { ctx, page, errors };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.5);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
    await new Promise((r) => setTimeout(r, 1200));
    scrollTo({ top: 0, behavior: "instant" });
  });
}

async function overflow(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const doc = document.documentElement.scrollWidth - vw;
    const inScroller = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && p !== document.body && p.tagName !== "MAIN" && p.tagName !== "HTML") return true; } return false; };
    const off = [];
    document.querySelectorAll("main *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || inScroller(el) || el.closest(".aurora-wrap, .fit-backdrop, .grid-bg")) return;
      if (r.right > vw + 1 || r.left < -1) off.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} [${Math.round(r.left)},${Math.round(r.right)}]`);
    });
    // Texto cortado: elementos de texto cuyo contenido es más ancho que su caja
    const clipped = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main p, main a, main button, main li")]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "visible" && !el.closest(".fit-marquee"))
      .map((el) => el.textContent.trim().slice(0, 30));
    return { doc, off: off.slice(0, 5), clipped: clipped.slice(0, 5) };
  });
}

(async () => {
  const browser = await chromium.launch();

  // 1) Matriz responsive: anchos × temas (+ inglés en los anchos chicos)
  const matrix = [];
  for (const theme of ["dark", "light"]) for (const width of [320, 375, 768, 1024, 1440, 1920]) matrix.push({ theme, width, lang: "es" });
  for (const width of [320, 375, 768]) matrix.push({ theme: "dark", width, lang: "en" });
  for (const m of matrix) {
    const { ctx, page, errors } = await open(browser, { width: m.width, theme: m.theme, lang: m.lang, colorScheme: m.theme });
    await scrollThrough(page);
    const o = await overflow(page);
    log(o.doc <= 0 && o.off.length === 0 && o.clipped.length === 0, `layout ${m.lang} ${m.theme} ${m.width}px: doc=${o.doc} ${o.off.join(" | ")} ${o.clipped.length ? "cortado: " + o.clipped.join(" | ") : ""}`);
    // Marca en una línea por palabra
    const brand = await page.evaluate(() => {
      const [top, sub] = document.querySelector("h1 > span").children;
      const range = document.createRange(); range.selectNodeContents(top);
      return { lines: top.getClientRects().length, top: Math.round(range.getBoundingClientRect().width), sub: Math.round(sub.getBoundingClientRect().width), fam: getComputedStyle(top).fontFamily.includes("Cinzel") };
    });
    log(brand.lines === 1 && brand.fam && Math.abs(brand.top - brand.sub) <= 6, `marca ${m.lang} ${m.width}px: ${JSON.stringify(brand)}`);
    log(errors.length === 0, `errores ${m.lang} ${m.theme} ${m.width}px: ${errors.join(" || ") || "ninguno"}`);
    await ctx.close();
  }

  // 2) Contenido: nada actuarial, certificaciones textuales, estructura del PDF
  {
    const { ctx, page } = await open(browser);
    await scrollThrough(page); // las imágenes son lazy: hay que pasar por cada sección
    await page.locator("#contacto").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const weeks = await page.evaluate(() => [...document.querySelectorAll("#resultados [role='listitem'] [aria-hidden='true'].bottom-3")].map((c) => c.textContent.trim()));
    log(JSON.stringify(weeks) === JSON.stringify(["16 semanas", "22 semanas", "28 semanas"]), `tiempo de cada cliente en el comparador: ${JSON.stringify(weeks)}`);
    const info = await page.evaluate(() => ({
      text: document.querySelector("main").textContent,
      sections: [...document.querySelectorAll("main section[id]")].map((s) => s.id),
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
    }));
    const banned = (info.text + " " + info.desc).match(/actuar|\bseguros?\b|insurance|\bDECI\b|\bFCE\b|\bUBA\b|data analy|análisis de datos|ciencias exactas/g);
    log(!banned, `sin contenido actuarial: ${banned ? banned.join(", ") : "ninguno"}`);
    const certs = ["IFBB Academy — Personal Trainer / Bodybuilding Instructor", "IFBB Academy — Strength and Power", "IFBB Academy — Cross Pro Fitness", "ISSA — Certified Personal Trainer"];
    const flat = info.text.replace(/\s+/g, " ");
    log(certs.every((c) => flat.includes(c.replace(" — ", " — "))) || certs.every((c) => flat.replace(/ — /g, "—").includes(c.replace(/ — /g, "—"))), `certificaciones textuales: ${certs.filter((c) => !flat.includes(c)).join(" | ") || "las 4"}`);
    log(!/24 ?h/i.test(info.text), `sin "atención 24 h"`);
    const contact = await page.evaluate(() => ({ phone: /6830\s?0606/.test(document.getElementById("contacto").textContent), mail: !!document.querySelector('#contacto a[href*="mail.google.com"].fit-surface') }));
    const extra = await page.evaluate(() => ({ p2p: /P2P/.test(document.querySelector("main").textContent), story: /2021/.test(document.getElementById("sobre-mi").textContent) && /Un año después/.test(document.getElementById("sobre-mi").textContent), gmail: (() => { const i = document.querySelector('#contacto a[href*="mail.google.com"] img'); return !!i && /gmail-logo/.test(i.currentSrc) && i.complete && i.naturalWidth > 0; })(), highlights: document.querySelectorAll("#planes article p.inline-flex").length }));
    log(!extra.p2p && extra.story && extra.gmail && extra.highlights === 3, `copy: sin "P2P" (${!extra.p2p}), historia 2021 → un año después (${extra.story}), logo de Gmail (${extra.gmail}), diferencia destacada en ${extra.highlights} packs`);
    log(!contact.phone && contact.mail, `contacto: sin teléfono (${!contact.phone}), email como botón secundario (${contact.mail})`);
    console.log("secciones:", info.sections.join(" → "));
    console.log("title:", info.title, "| desc:", info.desc);
    await ctx.close();
  }

  // 3) WhatsApp: número, target, rel y logo PNG cargado
  {
    const { ctx, page } = await open(browser);
    await scrollThrough(page);
    const wa = await page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => ({
      href: a.href, target: a.target, rel: a.rel, name: a.getAttribute("aria-label") || a.textContent.trim(),
      img: a.querySelector("img") ? { ok: a.querySelector("img").complete && a.querySelector("img").naturalWidth > 0, src: a.querySelector("img").currentSrc } : null,
    })));
    const bad = wa.filter((w) => !w.href.startsWith("https://wa.me/5491168300606") || w.target !== "_blank" || !/noopener/.test(w.rel));
    log(bad.length === 0, `links WhatsApp (${wa.length}) con número, _blank y noopener ${bad.map((b) => b.name).join(" | ")}`);
    const ctas = wa.filter((w) => w.img);
    log(ctas.length >= 8 && ctas.every((w) => w.img.ok && /whatsapp-logo/.test(w.img.src)), `botones con logo PNG cargado: ${ctas.filter((w) => w.img.ok).length}/${ctas.length}`);
    await ctx.close();
  }

  // 4) Header: nav en desktop, menú en mobile con el mismo material
  {
    const d = await open(browser, { width: 1280 });
    const desk = await d.page.evaluate(() => ({ nav: [...document.querySelectorAll("header nav a")].filter((a) => a.offsetParent).length, toggle: !!document.querySelector('header button[aria-controls="fitness-menu"]')?.offsetParent }));
    log(desk.nav === 6 && !desk.toggle, `header desktop: ${desk.nav} links, botón de menú ${desk.toggle ? "visible" : "oculto"}`);
    await d.ctx.close();
    const m = await open(browser, { width: 375 });
    const btn = m.page.locator('header button[aria-controls="fitness-menu"]');
    await btn.click();
    await m.page.waitForSelector("#fitness-menu a");
    const menu = await m.page.evaluate(() => {
      const nav = document.getElementById("fitness-menu");
      const r = nav.getBoundingClientRect();
      return { links: nav.querySelectorAll("a").length, glass: nav.classList.contains("liquid-glass"), right: r.right, vw: innerWidth, expanded: document.querySelector('header button[aria-controls="fitness-menu"]').getAttribute("aria-expanded") };
    });
    log(menu.links === 6 && menu.glass && menu.right <= menu.vw && menu.expanded === "true", `menú mobile: ${JSON.stringify(menu)}`);
    await m.page.screenshot({ path: path.join(OUT, "menu-375.png") });
    await m.page.keyboard.press("Escape");
    await m.page.waitForSelector("#fitness-menu", { state: "detached" });
    log(true, "menú se cierra con Escape");
    await btn.click();
    await m.page.locator("#fitness-menu a", { hasText: "Planes" }).click();
    await m.page.waitForSelector("#fitness-menu", { state: "detached" });
    const y = await m.page.evaluate(() => Math.round(document.getElementById("planes").getBoundingClientRect().top));
    log(Math.abs(y) < 160, `elegir "Planes" cierra el menú y lleva a la sección (top=${y})`);
    await m.ctx.close();
  }

  // 4b) Menú centrado + marca de dónde estás (píldora, puntos y barra de progreso)
  {
    const { ctx, page } = await open(browser, { width: 1280 });
    const geo = await page.evaluate(() => {
      const pill = document.querySelector("header .liquid-glass").getBoundingClientRect();
      const nav = document.querySelector("header nav").getBoundingClientRect();
      return Math.round(nav.left + nav.width / 2 - (pill.left + pill.width / 2));
    });
    log(Math.abs(geo) <= 2, `menú centrado en el header (desvío ${geo}px)`);
    const spy = async (id) => {
      await page.evaluate((id) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: "instant" }); }, id);
      await page.waitForTimeout(700);
      return page.evaluate(() => {
        const links = [...document.querySelectorAll("header nav a")];
        const bar = document.querySelector("header .liquid-glass > span[aria-hidden='true']");
        return {
          current: links.find((a) => a.getAttribute("aria-current") === "location")?.getAttribute("href"),
          done: links.filter((a) => a.querySelector("span[aria-hidden='true']").className.includes("bg-cyan/70")).length,
          bar: +(new DOMMatrix(getComputedStyle(bar).transform).a).toFixed(2),
        };
      });
    };
    const atMethod = await spy("metodo");
    const atFaq = await spy("preguntas");
    const atContact = await spy("contacto");
    log(atMethod.current === "#metodo" && atMethod.done === 2, `en Método: activo ${atMethod.current}, ${atMethod.done} pasadas, barra ${atMethod.bar}`);
    // Preguntas va después de los precios (pedido de Matías): es el último link y el contacto cuenta como Preguntas
    log(atFaq.current === "#preguntas" && atFaq.done === 5 && atFaq.bar > atMethod.bar, `en Preguntas: activo ${atFaq.current}, ${atFaq.done} pasadas, barra ${atFaq.bar}`);
    log(atContact.current === "#preguntas" && atContact.bar > 0.9, `en Contacto: activo ${atContact.current}, barra ${atContact.bar}`);
    const order = await page.evaluate(() => ["sobre-mi", "resultados", "metodo", "asimilacion", "empezar", "planes", "infoproductos", "afiliados", "preguntas", "contacto"].map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? NaN));
    log(order.every((y, i) => i === 0 || y > order[i - 1]), `orden: quién soy → resultados → método → asimilación → cómo empezar → planes → infoproductos → afiliados → preguntas → contacto (${order.map(Math.round).join(" < ")})`);
    await page.evaluate(() => scrollTo({ top: document.getElementById("resultados").offsetTop, behavior: "instant" }));
    await page.waitForTimeout(600);
    await page.locator("header").screenshot({ path: path.join(OUT, "header-progreso-1280.png") });
    await ctx.close();
  }

  // 5) Planes: pestañas del mismo ancho, tarjetas del mismo ancho, teclado
  {
    const { ctx, page } = await open(browser, { width: 1280 });
    await page.locator("#planes").scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const tabs = await page.evaluate(() => [...document.querySelectorAll('#planes [role="tab"]')].map((t) => Math.round(t.getBoundingClientRect().width)));
    log(tabs.length === 2 && tabs[0] === tabs[1], `pestañas del mismo ancho: ${tabs}`);
    const cards = async () => page.evaluate(() => [...document.querySelectorAll('#planes [role="tabpanel"] article')].map((a) => Math.round(a.getBoundingClientRect().width)));
    const packs = await cards();
    log(packs.length === 3 && new Set(packs).size === 1, `packs: ${packs.length} tarjetas, anchos ${packs}`);
    await page.locator('#planes [role="tab"]').first().focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(600);
    const planes = await cards();
    const sel = await page.evaluate(() => document.activeElement?.getAttribute("aria-selected") === "true" && document.activeElement.textContent);
    log(planes.length === 5 && new Set(planes).size === 1 && /^Planes online/.test(sel || ""), `flecha → Planes: ${planes.length} tarjetas, anchos ${planes}, foco en "${sel}"`);
    await page.locator("#planes").screenshot({ path: path.join(OUT, "planes-1280.png") });
    await ctx.close();
    const mob = await open(browser, { width: 375 });
    await mob.page.locator("#planes").scrollIntoViewIfNeeded();
    await mob.page.waitForTimeout(800);
    const mw = await mob.page.evaluate(() => [...document.querySelectorAll('#planes [role="tabpanel"] article')].map((a) => Math.round(a.getBoundingClientRect().width)));
    log(new Set(mw).size === 1, `planes mobile apilados con el mismo ancho: ${mw}`);
    await mob.ctx.close();
  }

  // 6) Hero (foto -hd, proporción real, tilt) y comparadores antes/después
  {
    const { ctx, page } = await open(browser, { width: 1280 });
    const hero = await page.evaluate(() => {
      const img = document.querySelector("#inicio img[alt]:not([alt=''])");
      const frame = img.closest("[class*='aspect-[4/5]']");
      const r = frame.getBoundingClientRect();
      return { src: decodeURIComponent(img.currentSrc), ratio: +(r.width / r.height).toFixed(3), natural: img.naturalWidth, h: Math.round(r.height), vh: innerHeight };
    });
    log(/portada_fitness_bellido-hd/.test(hero.src) && Math.abs(hero.ratio - 0.8) < 0.01, `hero: ${hero.src.split("url=")[1]?.split("&")[0]} ratio ${hero.ratio} alto ${hero.h}px`);
    const frame = page.locator("#inicio [class*='aspect-[4/5]']");
    const box = await frame.boundingBox();
    // En pasos, como una persona: un salto solo dispara un evento y en el dev a veces no alcanza
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2, { steps: 8 });
    await page.waitForTimeout(600);
    const tilt = await frame.evaluate((el) => getComputedStyle(el).transform);
    log(/matrix3d/.test(tilt), `tilt 3D con el mouse: ${tilt.slice(0, 40)}`);
    await page.mouse.move(5, 5);

    await page.locator("#resultados").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const pos = () => page.evaluate(() => [...document.querySelectorAll('#resultados [role="slider"]')].map((k) => +k.getAttribute("aria-valuenow")));
    const imgs = await page.evaluate(() => [...document.querySelectorAll("#resultados [role='listitem'] img")].map((i) => i.complete && i.naturalWidth > 0));
    log(imgs.length === 6 && imgs.every(Boolean), `fotos de clientes cargadas (3 clientes: 1, 2 y 4; primer juego): ${imgs.filter(Boolean).length}/${imgs.length}`);
    const p1 = await pos();
    await page.waitForTimeout(700);
    const p2 = await pos();
    log(p1.length === 3 && p1.some((v, i) => v !== p2[i]), `la barra se mueve sola: ${p1} → ${p2}`);
    const wrap = await page.$eval(".fit-marquee-wrap", (e) => { const r = e.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), vw: document.documentElement.clientWidth }; });
    log(wrap.left <= 1 && wrap.right >= wrap.vw - 1, `el carrusel va de borde a borde: ${JSON.stringify(wrap)}`);
    // Arrastrar: mientras se sostiene, la barra está donde está el mouse; al soltar vuelve sola al recorrido
    // (el carrusel se mueve, también con el mouse encima: se toma la tarjeta más cerca del centro
    // y se mide de nuevo después de apretar, que es cuando se frena)
    await page.evaluate(() => {
      const frames = [...document.querySelectorAll("#resultados [role='slider']")].map((k) => k.closest("[class*='aspect-[4/5]']"));
      const mid = (f) => Math.abs(f.getBoundingClientRect().left + f.getBoundingClientRect().width / 2 - innerWidth / 2);
      frames.sort((a, b) => mid(a) - mid(b))[0].id = "arrastre";
    });
    const sl = page.locator("#arrastre");
    const barAt = () => sl.evaluate((e) => Math.round(+e.style.getPropertyValue("--pos")));
    const sb0 = await sl.boundingBox();
    await page.mouse.move(sb0.x + sb0.width * 0.5, sb0.y + sb0.height * 0.6);
    await page.mouse.down();
    const sb = await sl.boundingBox();
    await page.mouse.move(sb.x + sb.width * 0.2, sb.y + sb.height * 0.6, { steps: 6 });
    await page.waitForTimeout(600);
    const d1 = await barAt();
    await page.mouse.up();
    await page.waitForTimeout(1200);
    const d2 = await barAt();
    log(Math.abs(d1 - 20) <= 2 && Math.abs(d2 - d1) > 3, `arrastre: barra en ${d1}% mientras se sostiene y al soltar vuelve a moverse sola (${d2}%)`);
    // Teclado: la flecha la mueve 5 y queda ahí hasta que el foco sale; después vuelve al recorrido
    await page.locator("#resultados [role='slider']").first().focus();
    await page.keyboard.press("ArrowRight");
    const k1 = (await pos())[0];
    await page.keyboard.press("ArrowRight");
    const k2 = (await pos())[0];
    await page.waitForTimeout(900);
    const k3 = (await pos())[0];
    log(k2 === Math.min(100, k1 + 5) && k3 === k2, `teclado: flecha derecha ${k1} → ${k2} y queda quieta (${k3})`);
    await page.evaluate(() => document.activeElement.blur());
    await page.waitForTimeout(1200);
    const k4 = (await pos())[0];
    log(k4 !== k3, `teclado: al salir el foco vuelve a moverse sola (${k3} → ${k4})`);
    await page.locator("#resultados").screenshot({ path: path.join(OUT, "resultados-1280.png") });
    await ctx.close();

    const rm = await open(browser, { width: 375, reducedMotion: "reduce" });
    await rm.page.locator("#resultados").scrollIntoViewIfNeeded();
    await rm.page.waitForTimeout(900);
    const still = await rm.page.evaluate(() => [...document.querySelectorAll('#resultados [role="slider"]')].map((k) => +k.getAttribute("aria-valuenow")));
    log(still.every((v) => v === 50), `reducir movimiento: barras quietas en ${still}`);
    await rm.ctx.close();
  }

  // 6b) Carrito y pago con Mercado Pago
  {
    const { ctx, page, errors } = await open(browser, { width: 1280 });
    await page.evaluate(() => localStorage.removeItem("bellido-fitness-cart-v1"));
    const fab = () => page.evaluate(() => { const b = document.querySelector("button[aria-label^='Ver carrito']"); return b ? b.getAttribute("aria-label") : null; });
    const addBtn = (scope) => page.locator(`${scope} button`, { hasText: "🛒 Agregar al carrito" }).first();
    await page.locator("#infoproductos").scrollIntoViewIfNeeded();
    // Infoproductos de mayor a menor precio
    const ipOrder = await page.evaluate(() => [...document.querySelectorAll("#infoproductos h3")].map((h) => `${h.textContent} ${h.closest("li").querySelector("p.font-display")?.textContent.replace(/\s/g, " ")}`));
    log(ipOrder.join("|") === "Anatomía muscular $ 24.700 pago único|Alimentación saludable $ 24.700 pago único|Recetario $ 15.800 pago único", `infoproductos de mayor a menor precio: ${ipOrder.join(" | ")}`);
    await page.locator("#infoproductos li", { has: page.locator("h3", { hasText: "Recetario" }) }).locator("button", { hasText: "🛒 Agregar al carrito" }).click();
    await page.waitForTimeout(300);
    const f1 = await fab();
    log(/1 · \$\s?15\.800/.test(f1 || ""), `agregar Recetario: botón flotante "${f1}"`);
    // El botón tiene que flotar en la esquina (un position del CSS de la ruta ya lo dejó en el flujo)
    const fabPos = await page.evaluate(() => { const e = document.querySelector("button[aria-label^='Ver carrito']"); const r = e.getBoundingClientRect(); return { pos: getComputedStyle(e).position, right: Math.round(innerWidth - r.right), bottom: Math.round(innerHeight - r.bottom) }; });
    log(fabPos.pos === "fixed" && fabPos.right === 16 && fabPos.bottom === 16, `carrito flotante en la esquina: ${JSON.stringify(fabPos)}`);
    await page.locator("#planes").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const prices = await page.evaluate(() => [...document.querySelectorAll("#planes [role='tabpanel'] article")].map((a) => a.querySelector("p.font-display")?.textContent.replace(/\s/g, " ")));
    log(prices.join("|") === "$ 395.700|$ 297.300|$ 181.000", `precios de los packs: ${prices.join(" | ")}`);
    await addBtn("#planes [role='tabpanel'] article").click();
    await page.waitForTimeout(300);
    const inCartLabel = await page.locator("#planes [role='tabpanel'] article").first().locator("button").first().textContent();
    const f2 = await fab();
    log(/2 · \$\s?411\.500/.test(f2 || "") && /En el carrito/.test(inCartLabel), `agregar Intensive Pack: "${f2}", botón "${inCartLabel}"`);
    // Clases presenciales: se suman de a una
    await page.locator("#planes button", { hasText: "🛒 Agregar al carrito" }).last().click();
    await page.locator("#planes button", { hasText: "🛒 Agregar al carrito" }).last().click();
    await page.waitForTimeout(300);
    const f3 = await fab();
    log(/4 · \$\s?460\.900/.test(f3 || ""), `2 clases presenciales a $ 24.700: "${f3}"`);
    // Persistencia
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const f4 = await fab();
    log(f4 === f3, `el carrito sobrevive a una recarga: "${f4}"`);
    // Abrir: stepper en el paso 1, foco que no salta al tocar +
    await page.locator("button[aria-label^='Ver carrito']").click();
    await page.waitForSelector("[role='dialog']");
    const step1 = await page.evaluate(() => document.querySelector("[role='dialog'] [aria-current='step']")?.textContent);
    await page.locator("[role='dialog'] button[aria-label='Una clase menos']").click();
    const focusAfter = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    const total1 = await page.evaluate(() => document.querySelector("[role='dialog'] .border-t span.tabular-nums")?.textContent.replace(/\s/g, " "));
    log(/Carrito/.test(step1) && focusAfter === "Una clase menos" && total1 === "$ 436.200", `paso "${step1}", foco tras − en "${focusAfter}", total ${total1}`);
    const ax1 = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include("[role='dialog']").analyze();
    log(ax1.violations.length === 0, `axe carrito: ${ax1.violations.map((v) => v.id).join(", ") || "sin violaciones"}`);
    await page.locator("[role='dialog']").screenshot({ path: path.join(OUT, "carrito-1280.png") });
    // Paso 2: pago
    await page.locator("[role='dialog'] button", { hasText: "Ir a pagar" }).click();
    await page.waitForTimeout(300);
    const pay = await page.evaluate(() => {
      const d = document.querySelector("[role='dialog']");
      const qr = d.querySelector("img[src*='mercadopago-qr']");
      return { link: d.querySelector("a[href^='https://mpago.la']")?.href, qr: !!qr && qr.complete && qr.naturalWidth > 0, alias: /matibellido/.test(d.textContent), cvu: /0000003100067468547403/.test(d.textContent), step: d.querySelector("[aria-current='step']")?.textContent };
    });
    log(pay.link === "https://mpago.la/1hKUPFy" && pay.qr && pay.alias && pay.cvu && /Pago/.test(pay.step), `paso de pago: ${JSON.stringify(pay)}`);
    const inView = await page.evaluate(() => { const d = document.querySelector("[role='dialog']").getBoundingClientRect(); const b = [...document.querySelectorAll("[role='dialog'] button")].find((x) => /Ya pagu/.test(x.textContent)).getBoundingClientRect(); return d.top >= 0 && d.bottom <= innerHeight && b.bottom <= innerHeight; });
    log(inView, `panel y "Ya pagué" dentro de la pantalla: ${inView}`);
    await page.locator("[role='dialog']").screenshot({ path: path.join(OUT, "pago-1280.png") });
    // Vuelve de Mercado Pago (recarga en el paso de pago): el carrito se abre solo en ese paso
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[role='dialog']", { timeout: 5000 }).catch(() => {});
    const back = await page.evaluate(() => document.querySelector("[role='dialog'] [aria-current='step']")?.textContent);
    log(/Pago/.test(back || ""), `al volver de pagar se abre en "${back}"`);
    // Paso 3: comprobante / formulario
    await page.locator("[role='dialog'] button", { hasText: "Ya pagué" }).click();
    await page.waitForTimeout(300);
    const done = await page.evaluate(() => {
      const d = document.querySelector("[role='dialog']");
      const wa = d.querySelector("a[href*='wa.me']");
      return { step: d.querySelector("[aria-current='step']")?.textContent, wa: wa ? decodeURIComponent(wa.href.split("text=")[1]) : null };
    });
    log(/Formulario/.test(done.step) && /Intensive Pack/.test(done.wa) && /Recetario/.test(done.wa) && /\$\s?436\.200/.test(done.wa), `paso final: ${done.step}; WhatsApp: "${done.wa}"`);
    await page.locator("[role='dialog'] button", { hasText: "Terminar" }).click();
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ fab: !!document.querySelector("button[aria-label^='Ver carrito']"), saved: localStorage.getItem("bellido-fitness-cart-v1") }));
    log(!after.fab && /"lines":\[\]/.test(after.saved || ""), `"Terminar" vacía el carrito: ${JSON.stringify(after)}`);
    log(errors.length === 0, `errores en el flujo de compra: ${errors.join(" || ") || "ninguno"}`);
    await ctx.close();

    // Mobile: el panel entra en 320 px y en claro
    const m = await open(browser, { width: 320, theme: "light", colorScheme: "light" });
    await m.page.locator("#infoproductos").scrollIntoViewIfNeeded();
    await m.page.locator("#infoproductos button", { hasText: "🛒 Agregar al carrito" }).first().click();
    await m.page.locator("button[aria-label^='Ver carrito']").click();
    await m.page.locator("[role='dialog'] button", { hasText: "Ir a pagar" }).click();
    await m.page.waitForTimeout(400);
    const mo = await m.page.evaluate(() => { const r = document.querySelector("[role='dialog']").getBoundingClientRect(); const over = [...document.querySelectorAll("[role='dialog'] *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).length; return { left: Math.round(r.left), right: Math.round(r.right), over }; });
    const ax2 = await new AxeBuilder({ page: m.page }).withTags(["wcag2a", "wcag2aa"]).include("[role='dialog']").analyze();
    log(mo.left >= 0 && mo.right <= 320 && mo.over === 0 && ax2.violations.length === 0, `panel de pago a 320 px en claro: ${JSON.stringify(mo)}, axe ${ax2.violations.map((v) => v.id).join(", ") || "ok"}`);
    await m.page.locator("[role='dialog']").screenshot({ path: path.join(OUT, "pago-320-claro.png") });
    await m.ctx.close();
  }

  // 6c) Contenido de esta vuelta
  {
    const { ctx, page } = await open(browser, { width: 1280 });
    await scrollThrough(page);
    const c = await page.evaluate(() => ({
      trial: /Período de prueba/.test(document.querySelector("main").textContent),
      about: /me obsesioné con ganar músculo/.test(document.getElementById("sobre-mi").textContent),
      faq: /No hay un número fijo/.test(document.getElementById("preguntas").textContent),
      // zoom de las imágenes del primer juego, de a dos por cliente (después, antes): las caras ya están cortadas
      // en los archivos (1, 2, 3 y 4), así que todo va sin zoom salvo el "después" del cliente 4 (1 / 0,7816 = 1,28).
      // Ver FRAMING en FitnessResults.tsx
      crop: JSON.stringify([...document.querySelectorAll("#resultados [role='listitem'] img")].map((i) => { const m = getComputedStyle(i).transform; return m === "none" ? 1 : Math.round(+m.slice(7).split(",")[0] * 100) / 100; })) === JSON.stringify([1, 1, 1, 1, 1.28, 1]),
      // encuadre horizontal: el "antes" del cliente 1 se ve desde el borde izquierdo (ahí está el torso); el resto, centrado
      centerX: JSON.stringify([...document.querySelectorAll("#resultados [role='listitem'] img")].map((i) => getComputedStyle(i).objectPosition)) === JSON.stringify(["50% 100%", "0% 100%", "50% 100%", "50% 100%", "50% 100%", "50% 100%"]),
      withdrawal: !!document.querySelector("footer a[href*='wa.me'][href*='arrepent']"),
    }));
    log(!c.trial && c.about && c.faq && c.crop && c.centerX && c.withdrawal, `contenido: ${JSON.stringify(c)}`);
    await ctx.close();
  }

  // 6c-ter) Botón de email → Gmail directo (pedido de Matías): sin el diálogo de "¿con qué app?" del mailto:
  {
    // Compu: Gmail web en una pestaña nueva; /fitness sigue abierta. (Gmail se intercepta: no se sale a internet)
    const { ctx, page } = await open(browser, { width: 1280 });
    await ctx.route("https://mail.google.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>Gmail (simulado)</title>" }));
    const mail = page.locator("#contacto a", { hasText: "rbellidomatias@gmail.com" });
    await mail.scrollIntoViewIfNeeded();
    const attrs = await mail.evaluate((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel }));
    const [tab] = await Promise.all([ctx.waitForEvent("page"), mail.click()]);
    await tab.waitForLoadState();
    const ok = attrs.href === "https://mail.google.com/mail/?view=cm&fs=1&to=rbellidomatias%40gmail.com" && attrs.target === "_blank" && /noopener/.test(attrs.rel);
    log(ok && /mail\.google\.com\/mail\/\?view=cm/.test(tab.url()) && /\/fitness/.test(page.url()), `email en la compu: Gmail web en otra pestaña (${tab.url().slice(0, 60)}…), /fitness sigue abierta`);
    await ctx.close();
  }
  for (const [name, ua, check] of [
    ["Android", "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
      (h) => h.startsWith("intent:rbellidomatias@gmail.com#Intent;scheme=mailto;package=com.google.android.gm;action=android.intent.action.SENDTO;") && h.includes("S.browser_fallback_url=https%3A%2F%2Fmail.google.com%2Fmail%2F%3Fview%3Dcm") && h.endsWith(";end")],
    ["iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      (h) => h === "googlegmail:///co?to=rbellidomatias%40gmail.com"],
  ]) {
    const { ctx, page } = await open(browser, { width: 390, touch: true, userAgent: ua });
    // el link del celular se pone al montar la página (el HTML del servidor trae el de la compu)
    await page.waitForFunction(() => !document.querySelector("#contacto a.fit-surface")?.getAttribute("href")?.startsWith("https://"), null, { timeout: 8000 }).catch(() => {});
    const href = await page.locator("#contacto a", { hasText: "rbellidomatias@gmail.com" }).getAttribute("href");
    log(check(href || ""), `email en ${name}: abre la app de Gmail (${(href || "").slice(0, 70)}…)`);
    await ctx.close();
  }

  // 6c-bis) Pie de página: centrado en el celular (pedido de Matías), en fila desde md
  for (const width of [320, 375, 768, 1280]) {
    const { ctx, page } = await open(browser, { width });
    await page.locator("footer").last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const f = await page.evaluate(() => {
      const foot = [...document.querySelectorAll("footer")].pop();
      const box = foot.firstElementChild.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      // La marca (logo + nombre) y el link se miden por su caja; los textos, por el texto
      // (un <p> ocupa todo el ancho aunque el texto esté a la izquierda)
      const boxes = [foot.querySelector("img").parentElement, foot.querySelector("a[href='/']")];
      const texts = [...foot.querySelectorAll(":scope > div > p, :scope > div > a[href*='wa.me']")];
      return [...boxes.map((el) => el.getBoundingClientRect()), ...texts.map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect();
      })].map((t) => ({ off: Math.round(t.left + t.width / 2 - mid) }));
    });
    const centered = f.every((x) => Math.abs(x.off) <= 2);
    log(width < 768 ? centered : !centered, `pie a ${width}px: ${width < 768 ? "centrado" : "en fila"} (desvíos ${f.map((x) => x.off).join(", ")})`);
    await ctx.close();
  }

  // 6d) Cómo empezar: los 4 cuadros miden lo mismo en todos los anchos
  for (const width of [1440, 1024, 768, 375, 320]) {
    const { ctx, page } = await open(browser, { width });
    const sizes = await page.$$eval("#empezar ol > li > div", (els) => els.map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; }));
    log(sizes.length === 4 && new Set(sizes).size === 1, `Cómo empezar: 4 cuadros iguales a ${width}px (${sizes.join(" ")})`);
    await ctx.close();
  }

  // 6e) Carrusel de resultados (marquee como el de Vibear): se mueve solo, se frena y se puede pausar
  {
    const { ctx, page, errors } = await open(browser, { width: 1280 });
    await page.locator("#resultados").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const tr = () => page.$eval(".fit-marquee", (e) => getComputedStyle(e).transform);
    const moves = async () => { const a = await tr(); await page.waitForTimeout(1200); return a !== (await tr()); };
    log(await moves(), "carrusel: se mueve solo");
    log((await page.getByRole("slider").count()) === 3, "carrusel: 3 sliders accesibles, uno por cliente (las copias no son controles)");
    log((await page.$$eval(".fit-marquee [aria-hidden='true'] [tabindex], .fit-marquee [aria-hidden='true'][tabindex]", (e) => e.length)) === 0, "carrusel: sin foco dentro de las copias aria-hidden");
    // Velocidad de la pista en px/s (mide 1 s; si justo dio la vuelta, vuelve a medir)
    const speed = async () => {
      const x = () => page.$eval(".fit-marquee", (e) => new DOMMatrix(getComputedStyle(e).transform).m41);
      for (let i = 0; i < 3; i++) {
        const a = await x();
        await page.waitForTimeout(1000);
        const b = await x();
        if (b <= a) return Math.round(a - b);
      }
      return 0;
    };
    const free = await speed();
    log(free >= 45 && free <= 70, `carrusel: va a ~55 px/s (más rápido que antes, 35): ${free} px/s`);
    await page.mouse.move(640, 480);
    await page.waitForTimeout(400);
    const slow = await speed();
    log(slow >= 8 && slow <= free * 0.6, `carrusel: con el mouse encima sigue, más lento: ${slow} px/s (sin mouse ${free})`);
    await page.mouse.down();
    await page.waitForTimeout(200);
    const held = await speed();
    await page.mouse.up();
    await page.waitForTimeout(200);
    const released = await speed();
    log(held <= 1 && released >= 8, `carrusel: apretando una tarjeta con el mouse se frena (${held} px/s) y al soltar sigue (${released} px/s)`);
    await page.mouse.move(640, 40);
    await page.waitForTimeout(300);
    const back = await speed();
    log(back >= free * 0.8, `carrusel: al sacar el mouse vuelve a su velocidad: ${back} px/s`);
    await page.getByRole("button", { name: "Pausar el carrusel" }).click();
    await page.mouse.move(640, 40);
    await page.waitForTimeout(300);
    log(!(await moves()) && (await page.getByRole("button", { name: "Reanudar el carrusel" }).getAttribute("aria-pressed")) === "true", "carrusel: el botón de pausa lo detiene");
    const axc = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include("#resultados").analyze();
    log(axc.violations.length === 0, `carrusel: axe ${axc.violations.map((v) => v.id).join(", ") || "ok"}`);
    log(errors.length === 0, `carrusel: sin errores de consola ${errors.join(" || ")}`);
    await ctx.close();
    const rm = await open(browser, { width: 390, reducedMotion: "reduce" });
    await rm.page.locator("#resultados").scrollIntoViewIfNeeded();
    const st = await rm.page.evaluate(() => ({
      anim: getComputedStyle(document.querySelector(".fit-marquee")).animationName,
      swipe: (() => { const w = document.querySelector(".fit-marquee-wrap"); return w.scrollWidth > w.clientWidth && getComputedStyle(w).overflowX === "auto"; })(),
      dups: [...document.querySelectorAll(".fit-marquee-dup")].every((e) => getComputedStyle(e).display === "none"),
      pause: (() => { const b = [...document.querySelectorAll("#resultados button")].find((x) => /carrusel/.test(x.textContent)); return !!b && getComputedStyle(b).display !== "none" && b.getBoundingClientRect().width > 0; })(),
    }));
    log(st.anim === "none" && st.swipe && st.dups && !st.pause, `reducir movimiento: carrusel quieto y deslizable, sin botón de pausa: ${JSON.stringify(st)}`);
    await rm.ctx.close();
  }

  // 6e-bis) Celular (táctil): tocar y soltar NUNCA deja el carrusel ni la barra quietos para siempre
  // (bug 2026-11-06: el toque le daba foco a la manija, el foco no se iba y el carrusel quedaba en pausa;
  // y la barra dejaba de moverse sola para siempre después del primer toque)
  {
    const { ctx, page, errors } = await open(browser, { width: 390, height: 844, touch: true });
    await page.locator("#resultados").scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const tr = () => page.$eval(".fit-marquee", (e) => getComputedStyle(e).transform);
    const moves = async () => { const a = await tr(); await page.waitForTimeout(1000); return a !== (await tr()); };
    // la manija (accesible) más cerca del centro de la pantalla, con su marco
    const target = () => page.evaluate(() => {
      const knobs = [...document.querySelectorAll("#resultados [role='slider']")].map((k) => ({ k, r: k.getBoundingClientRect() }));
      const { k, r } = knobs.sort((a, b) => Math.abs(a.r.left + a.r.width / 2 - innerWidth / 2) - Math.abs(b.r.left + b.r.width / 2 - innerWidth / 2))[0];
      document.getElementById("tocada")?.removeAttribute("id");
      k.closest("[class*='aspect-[4/5]']").id = "tocada";
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const barPos = () => page.$eval("#tocada", (e) => +e.style.getPropertyValue("--pos"));
    // ¿la barra se mueve sola? Mira 2 s seguidos: el recorrido tiene una pausa en el medio de hasta 1,4 s
    const barMoves = () => page.$eval("#tocada", (e) => new Promise((done) => {
      const seen = [];
      const id = setInterval(() => { seen.push(+e.style.getPropertyValue("--pos")); if (seen.length >= 20) { clearInterval(id); done(Math.max(...seen) - Math.min(...seen) > 0.5); } }, 100);
    }));
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });

    // 1) Un toque corto sobre la manija (le da foco): el carrusel y la barra siguen
    let p = await target();
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(300);
    const focusedKnob = await page.evaluate(() => document.activeElement?.getAttribute("role"));
    const tapMarquee = await moves();
    const tapBar = await barMoves();
    log(tapMarquee && tapBar, `celular: después de tocar la manija (foco en ${focusedKnob}) el carrusel sigue (${tapMarquee}) y la barra sigue sola (${tapBar})`);

    // 2) Apoyar, arrastrar y soltar: con el dedo apoyado se frena todo; al soltar sigue enseguida
    p = await target();
    await touch("touchStart", p.x, p.y);
    await touch("touchMove", p.x - 50, p.y);
    await page.waitForTimeout(250);
    const heldMarquee = await moves();
    const h1 = await barPos();
    await page.waitForTimeout(500);
    const heldBar = Math.abs((await barPos()) - h1) < 0.01;
    await touch("touchEnd");
    await page.waitForTimeout(150);
    const afterMarquee = await moves();
    const afterBar = await barMoves();
    log(!heldMarquee && heldBar, `celular: con el dedo apoyado el carrusel se frena (${!heldMarquee}) y la barra sigue al dedo (${heldBar})`);
    log(afterMarquee && afterBar, `celular: al soltar el carrusel sigue (${afterMarquee}) y la barra vuelve a moverse sola (${afterBar})`);
    log(errors.length === 0, `celular: sin errores de consola ${errors.join(" || ")}`);
    await ctx.close();
  }

  // 6f) Afiliados: código de descuento (se resta solo, sin decir el %) y quién recomendó
  for (const theme of ["dark", "light"]) {
    const { ctx, page, errors } = await open(browser, { width: 1280, theme, colorScheme: theme });
    const t = `[${theme}]`;
    const af = page.locator("#afiliados");
    await af.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const codeInput = af.getByLabel("Tu código");
    const refInput = af.getByLabel("Nombre de quien te recomendó");
    log((await codeInput.count()) === 1 && (await refInput.count()) === 1, `${t} afiliados: bloque de código y bloque de afiliado`);
    await codeInput.fill("PROMO10");
    await af.getByRole("button", { name: "Guardar" }).first().click();
    log((await af.getByRole("alert").filter({ hasText: "no es válido" }).isVisible()) && !(await af.getByText(/Código aplicado/).count()), `${t} código inválido: error y no se guarda`);
    await codeInput.fill("bellido25off");
    await af.getByRole("button", { name: "Guardar" }).first().click();
    await af.getByText(/Código aplicado/).waitFor();
    await refInput.fill("  Ana   García ");
    await af.getByRole("button", { name: "Guardar" }).nth(1).click();
    await af.getByText(/Guardado en tu compra/).waitFor();
    log((await af.getByText("Ana García").count()) > 0, `${t} código (en minúsculas) y afiliado guardados y normalizados`);
    log(!/\d\s?%/.test(await af.locator("form").first().innerText()), `${t} el bloque del código no dice el porcentaje`);
    const axa = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include("#afiliados").analyze();
    log(axa.violations.length === 0, `${t} afiliados: axe ${axa.violations.map((v) => v.id).join(", ") || "ok"}`);

    await page.locator("#planes").scrollIntoViewIfNeeded();
    await page.locator("#planes").getByRole("button", { name: /Agregar al carrito/ }).first().click();
    await page.getByRole("button", { name: /Ver carrito/ }).click();
    const dlg = page.getByRole("dialog");
    await dlg.waitFor();
    await page.waitForTimeout(400);
    const num = (x) => Number(String(x).replace(/[^\d]/g, ""));
    const sub = num(await dlg.locator("dt:text-is('Subtotal') + dd").innerText());
    const disc = num(await dlg.locator("dt", { hasText: "Descuento" }).locator("xpath=following-sibling::dd").innerText());
    const total = num(await dlg.locator("span", { hasText: /^\$/ }).last().innerText());
    const ct = await dlg.innerText();
    log(disc === Math.round(sub * 0.25) && total === sub - disc && /Primer mes con descuento/.test(ct) && !/25\s?%/.test(ct), `${t} carrito: subtotal ${sub} − descuento ${disc} = total ${total}, sin decir el %`);
    log((await dlg.locator("li .line-through").count()) === 1 && num(await dlg.locator("li .text-cyan.font-semibold").first().innerText()) === total, `${t} carrito: la línea muestra el precio original tachado y el final`);
    log(/BELLIDO25OFF/.test(ct) && /Te recomendó: Ana García/.test(ct), `${t} carrito: muestra el código y quién recomendó`);
    const axd = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include("[role='dialog']").analyze();
    log(axd.violations.length === 0, `${t} carrito con descuento: axe ${axd.violations.map((v) => v.id).join(", ") || "ok"}`);
    await dlg.getByRole("button", { name: "Ir a pagar" }).click();
    await page.waitForTimeout(300);
    log(num(await dlg.locator("p.font-display.text-3xl").innerText()) === total, `${t} pago: el total ya tiene el descuento`);
    await dlg.getByRole("button", { name: "Ya pagué" }).click();
    const form = dlg.getByRole("link", { name: "Completar el formulario" });
    log((await form.getAttribute("href")) === "https://docs.google.com/forms/d/e/1FAIpQLScNHvgImZI2YxHBVhbx5Tng0rtq_2B7Yd_5ZKPGPEu4I9Xe9A/viewform" && (await form.getAttribute("target")) === "_blank", `${t} último paso: botón al formulario de Google (link público, pestaña nueva)`);
    const msg = decodeURIComponent((await dlg.getByRole("link", { name: /comprobante por WhatsApp/ }).getAttribute("href")).split("text=")[1]);
    log(/Código de descuento: BELLIDO25OFF/.test(msg) && /Me recomendó: Ana García/.test(msg) && msg.includes(String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ".")), `${t} comprobante: lleva código, afiliado y total`);
    // Quitar el código → vuelve el precio completo; un código inventado en localStorage se descarta; presencial e infoproductos no se descuentan
    const setCart = (v) => page.evaluate((v) => localStorage.setItem("bellido-fitness-cart-v1", JSON.stringify(v)), v);
    const openCart = async () => { await page.reload({ waitUntil: "networkidle" }); await page.getByRole("button", { name: /Ver carrito/ }).click(); await page.getByRole("dialog").waitFor(); return page.getByRole("dialog"); };
    await setCart({ lines: [{ id: "premium", qty: 1 }], step: "cart", code: "BELLIDO25OFF", referrer: "" });
    let d = await openCart();
    await d.getByRole("button", { name: "Quitar: Código de descuento" }).click();
    await page.waitForTimeout(250);
    log(!/Descuento/.test(await d.innerText()), `${t} al quitar el código desaparece el descuento`);
    await setCart({ lines: [{ id: "presencial", qty: 2 }, { id: "recetario", qty: 1 }], step: "cart", code: "BELLIDO25OFF", referrer: "" });
    d = await openCart();
    {
      // Presencial ×2 ($ 24.700 c/u) + recetario: el código también los descuenta, con el precio tachado y el final por línea
      const txt = await d.innerText();
      const struck = await d.locator(".line-through").count();
      const sub2 = num(await d.locator("dt:text-is('Subtotal') + dd").innerText());
      const disc2 = num(await d.locator("dt", { hasText: "Descuento" }).locator("xpath=following-sibling::dd").innerText());
      // el descuento es la suma de lo que baja cada línea (redondeada por línea)
      const rec = sub2 - 2 * 24700;
      const expected = Math.round(2 * 24700 * 0.25) + Math.round(rec * 0.25);
      log(/Descuento ·/.test(txt) && struck === 2 && /Con descuento/.test(txt) && disc2 === expected, `${t} presencial e infoproductos: también con descuento (${disc2}), tachado y precio final en ${struck} líneas`);
    }
    await setCart({ lines: [{ id: "recetario", qty: 1 }], step: "cart", code: "HACK100", referrer: "" });
    d = await openCart();
    log(!/HACK100/.test(await d.innerText()), `${t} un código inventado en localStorage se descarta`);
    log(errors.length === 0, `${t} afiliados y descuento: sin errores de consola ${errors.join(" || ")}`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, { width: 320 });
    await page.locator("#afiliados").scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const over = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const ax320 = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include("#afiliados").analyze();
    log(!over && ax320.violations.length === 0, `afiliados a 320px: sin scroll horizontal, axe ${ax320.violations.map((v) => v.id).join(", ") || "ok"}`);
    await ctx.close();
  }

  // 6g) Home: modal "Mis Asesoramientos" con dos tarjetas y la animación del mismo personaje
  //     en cada una (components/AsesoramientoAnimation.tsx: esqueleto SVG + Framer Motion)
  {
    const home = BASE.replace(/\/fitness\/?$/, "/");
    // La sección de proyectos puede re-renderizar justo después de cargar: se reintenta
    const openServices = async (page) => {
      for (let i = 0; i < 3; i++) {
        try {
          const card = page.locator("article", { hasText: "Asesoramientos" }).last();
          await card.scrollIntoViewIfNeeded({ timeout: 5000 });
          await card.getByRole("button", { name: /Propuesta/ }).click({ timeout: 5000 });
          await page.getByRole("link", { name: /Asesoramientos Fitness/ }).waitFor();
          return;
        } catch (e) { if (i === 2) throw e; await page.waitForTimeout(800); }
      }
    };
    const SVG = ".modal-surface a > div[aria-hidden='true'] > svg"; // la franja de arriba (no los íconos de flecha)
    const poses = (page) => page.$$eval(SVG, (els) => els.map((svg) => [...svg.querySelectorAll("g[transform]")].slice(0, 6).map((g) => g.getAttribute("transform")).join("|")));
    for (const theme of ["dark", "light"]) {
      const { ctx, page, errors } = await open(browser, { width: 1280, url: home, theme, colorScheme: theme });
      const t = `[${theme}]`;
      // La propuesta de Bellido Asesoramientos se distingue de las demás: relleno sólido (no translúcido) y texto blanco
      const btns = await page.$$eval("#projects article", (arts) => arts.map((a) => {
        const b = [...a.querySelectorAll("button")].find((x) => /Propuesta/.test(x.textContent));
        return b ? { card: a.querySelector("h3")?.textContent.trim(), bg: getComputedStyle(b).backgroundColor, color: getComputedStyle(b).color } : null;
      }).filter(Boolean));
      const ases = btns.find((b) => /Asesoramientos/.test(b.card));
      const rest = btns.filter((b) => b !== ases);
      log(!!ases && /^rgb\(/.test(ases.bg) && ases.color === "rgb(255, 255, 255)" && rest.length > 0 && rest.every((b) => /^rgba\(.*0\.2\)$/.test(b.bg)), `${t} botón Propuesta de Asesoramientos destacado (${ases?.bg}, texto ${ases?.color}); las otras ${rest.length} translúcidas`);
      await openServices(page);
      await page.waitForTimeout(600);
      const info = await page.$$eval(SVG, (els) => els.map((svg) => ({
        hidden: svg.getAttribute("aria-hidden"),
        inLink: !!svg.closest("a"),
        head: svg.querySelectorAll("circle[r='10']").length,
        stroke: svg.getAttribute("stroke"),
        bg: getComputedStyle(svg.parentElement).backgroundColor,
        box: (() => { const r = svg.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(),
      })));
      log(info.length === 2 && info.every((x) => x.hidden === "true" && x.inLink), `${t} animación: una por tarjeta, decorativa (aria-hidden) ${JSON.stringify(info.map((x) => x.box))}`);
      log(info.every((x) => x.head === 1 && x.stroke === info[0].stroke) && info.every((x) => x.bg === "rgb(5, 7, 13)"), `${t} animación: el mismo personaje (misma cabeza y trazo) sobre la franja oscura`);
      const seen = [new Set(), new Set()];
      for (let i = 0; i < 8; i++) { (await poses(page)).forEach((v, j) => seen[j].add(v)); await page.waitForTimeout(250); }
      log(seen.every((s) => s.size >= 6), `${t} animación: movimiento continuo (${seen.map((s) => s.size).join(" y ")} poses distintas en 2 s)`);
      const cards = await page.$$eval("a[href='/fitness'], a[href$='Educativo.pdf']", (els) => {
        const m = els[0].closest(".modal-surface").getBoundingClientRect();
        return els.map((e) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left - m.left), r: Math.round(m.right - r.right), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
      });
      log(cards.length === 2 && cards[0].w === cards[1].w && cards[0].h === cards[1].h && cards[0].top === cards[1].top && Math.abs(cards[0].l - cards[1].r) <= 1, `${t} modal: dos tarjetas iguales, lado a lado y centradas ${JSON.stringify(cards)}`);
      log((await page.$$eval(".modal-surface [aria-hidden='true'] [tabindex]", (e) => e.length)) === 0, `${t} animación: sin elementos con foco`);
      const axm = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include(".modal-surface").analyze();
      log(axm.violations.length === 0, `${t} modal: axe ${axm.violations.map((v) => v.id).join(", ") || "ok"}`);
      log(errors.length === 0, `${t} modal: sin errores de consola ${errors.join(" || ")}`);
      await ctx.close();
    }
    for (const width of [375, 320]) {
      const { ctx, page } = await open(browser, { width, url: home });
      await openServices(page);
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => {
        const cards = [...document.querySelectorAll("a[href='/fitness'], a[href$='Educativo.pdf']")].map((e) => e.getBoundingClientRect());
        return { over: document.documentElement.scrollWidth > innerWidth, stacked: cards[1].top >= cards[0].bottom, sameW: Math.round(cards[0].width) === Math.round(cards[1].width) };
      });
      log(!m.over && m.stacked && m.sameW, `modal a ${width}px: tarjetas apiladas, mismo ancho, sin scroll horizontal ${JSON.stringify(m)}`);
      await ctx.close();
    }
    const rm = await open(browser, { width: 1280, reducedMotion: "reduce", url: home });
    await openServices(rm.page);
    await rm.page.waitForTimeout(300);
    const a1 = await poses(rm.page);
    await rm.page.waitForTimeout(1200);
    const a2 = await poses(rm.page);
    log(a1.length === 2 && JSON.stringify(a1) === JSON.stringify(a2), "animación con reducir movimiento: queda quieta (en la pose final)");
    await rm.ctx.close();
  }

  // 7) FAQ: acordeón abre y cierra
  {
    const { ctx, page } = await open(browser, { width: 375 });
    const q = page.locator("#preguntas button[aria-expanded]").first();
    await q.scrollIntoViewIfNeeded();
    await q.click();
    await page.waitForTimeout(350);
    const open1 = await page.evaluate(() => { const b = document.querySelector("#preguntas button[aria-expanded]"); const reg = document.getElementById(b.getAttribute("aria-controls")); return { exp: b.getAttribute("aria-expanded"), h: Math.round(reg.getBoundingClientRect().height) }; });
    await q.click();
    await page.waitForTimeout(350);
    const closed = await page.evaluate(() => { const b = document.querySelector("#preguntas button[aria-expanded]"); const reg = document.getElementById(b.getAttribute("aria-controls")); return Math.round(reg.getBoundingClientRect().height); });
    log(open1.exp === "true" && open1.h > 20 && closed === 0, `acordeón: abierto ${open1.h}px, cerrado ${closed}px (${await page.locator("#preguntas button[aria-expanded]").count()} preguntas)`);
    await ctx.close();
  }

  // 7b) Portfolio en el celular: el scroll vertical no se traba sobre las tarjetas (bug 2026-11-06).
  // Las tarjetas que todavía no entraron (y: 30) hacían que la fila scrolleara en vertical y el gesto
  // se quedaba en la fila. El toque tampoco deja efectos pegados (zoom, brillo).
  {
    const home = BASE.replace(/\/fitness\/?$/, "/");
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { try { localStorage.setItem("lang", "es"); sessionStorage.setItem("intro-seen", "1"); } catch {} });
    const page = await ctx.newPage();
    await page.goto(home, { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelector("#projects article").scrollIntoView({ block: "center", behavior: "instant" }));
    await page.waitForTimeout(1200);
    const rows = await page.evaluate(() => [...document.querySelectorAll("#projects .snap-x, #experience .snap-x")].map((r) => ({ extra: r.scrollHeight - r.clientHeight, y: getComputedStyle(r).overflowY, top: r.scrollTop })));
    log(rows.length === 3 && rows.every((r) => r.extra === 0 && r.y === "hidden" && r.top === 0), `celular: las filas de tarjetas no scrollean en vertical ${JSON.stringify(rows)}`);
    // gesto vertical que empieza sobre una tarjeta ("default": el sintético "touch" no scrollea en headless)
    const cdp = await ctx.newCDPSession(page);
    const b = await page.evaluate(() => { const r = document.querySelector("#projects article").getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.4) }; });
    const y0 = await page.evaluate(() => scrollY);
    await cdp.send("Input.synthesizeScrollGesture", { x: b.x, y: b.y, xDistance: 0, yDistance: -300, speed: 1200, gestureSourceType: "default" });
    await page.waitForTimeout(500);
    const moved = Math.round((await page.evaluate(() => scrollY)) - y0);
    log(moved >= 250, `celular: un gesto vertical sobre una tarjeta baja la página (${moved} px)`);
    const card = page.locator("#projects article", { hasText: "ZIRA" }).first();
    await card.evaluate((a) => a.scrollIntoView({ block: "center", inline: "start", behavior: "instant" }));
    await page.waitForTimeout(600);
    const cb = await card.boundingBox();
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height * 0.7);
    await page.waitForTimeout(900);
    const fx = await card.evaluate((a) => getComputedStyle(a.querySelector("img")).transform);
    log(fx === "none", `celular: tocar una tarjeta no deja el zoom pegado (${fx})`);
    await ctx.close();
  }

  // 8) Tema: /fitness es SIEMPRE oscuro (pedido de Matías), con tema del sistema claro, guardado claro o sin guardar
  for (const [colorScheme, saveTheme, theme] of [["light", false, "dark"], ["dark", false, "dark"], ["light", true, "light"], ["light", true, "dark"]]) {
    const { ctx, page } = await open(browser, { colorScheme, saveTheme, theme, width: 375 });
    const dark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    log(dark, `tema: sistema=${colorScheme}, guardado=${saveTheme ? theme : "no"} → ${dark ? "oscuro" : "CLARO (mal)"}`);
    await ctx.close();
  }
  {
    // Desde el portfolio en claro, entrar a /fitness con el link del modal (<Link>, sin recargar) deja oscuro,
    // y al volver con "Ir al portfolio" se restaura el tema claro guardado
    const home = BASE.replace(/\/fitness\/?$/, "/");
    const { ctx, page } = await open(browser, { width: 1280, url: home, theme: "light", colorScheme: "light" });
    const isDark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
    const homeLight = !(await isDark());
    for (let i = 0; i < 3; i++) {
      try {
        const card = page.locator("article", { hasText: "Asesoramientos" }).last();
        await card.scrollIntoViewIfNeeded({ timeout: 5000 });
        await card.getByRole("button", { name: /Propuesta/ }).click({ timeout: 5000 });
        break;
      } catch (e) { if (i === 2) throw e; await page.waitForTimeout(800); }
    }
    await page.getByRole("link", { name: /Asesoramientos Fitness/ }).click();
    await page.waitForURL(/\/fitness/);
    await page.waitForTimeout(700);
    const fitDark = await isDark();
    await page.getByRole("link", { name: /Ir al portfolio/ }).click();
    await page.waitForURL((u) => !/\/fitness/.test(u.pathname));
    await page.waitForTimeout(900);
    const backLight = !(await isDark());
    log(homeLight && fitDark && backLight, `tema: portfolio claro (${homeLight}) → /fitness oscuro (${fitDark}) → vuelve claro (${backLight})`);
    await ctx.close();
  }

  // 9) Accesibilidad (axe, WCAG AA) en claro y oscuro, con movimiento reducido (sin textos a mitad de fundido)
  for (const theme of ["dark", "light"]) {
    const { ctx, page } = await open(browser, { width: 1280, theme, colorScheme: theme, reducedMotion: "reduce" });
    await scrollThrough(page);
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).include("main").analyze();
    const v = res.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" ; ")}`);
    log(res.violations.length === 0, `axe ${theme}: ${v.join(" || ") || "sin violaciones"}`);
    await ctx.close();
  }

  // 10) Capturas por sección (375 y 1440, oscuro) + blanco y negro + claro
  for (const [width, theme, gray] of [[375, "dark", false], [1440, "dark", false], [1440, "light", false], [1440, "dark", true], [375, "light", true]]) {
    const { ctx, page } = await open(browser, { width, theme, colorScheme: theme });
    if (gray) await page.addStyleTag({ content: "html{filter:grayscale(1)}" });
    await scrollThrough(page);
    const ids = await page.evaluate(() => [...document.querySelectorAll("main section[id]")].map((s) => s.id));
    for (const id of ids) {
      await page.locator(`section#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await page.locator(`section#${id}`).screenshot({ path: path.join(OUT, `${width}-${theme}${gray ? "-bn" : ""}-${id}.png`) });
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${width}-${theme}${gray ? "-bn" : ""}-top.png`) });
    await ctx.close();
  }

  await browser.close();
  console.log(results.join("\n"));
  console.log(`\n${results.filter((r) => r.startsWith("FAIL")).length} fallas de ${results.length}. Capturas en ${OUT}`);
})().catch((e) => { console.error(e); console.log(results.join("\n")); process.exit(1); });
