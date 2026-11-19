---
name: bellido-educativo
description: Cómo editar la landing /educativo de Bellido Asesoramientos (clases particulares; app/educativo, components/educativo, t.educativo en LanguageContext y components/educativo/data.ts) sin alargarla ni volverla genérica, con las reglas de Matías (propuesta corta, slang argentino leve, nada con doble sentido, nada del portfolio, solo datos reales). Usala SIEMPRE que se toque /educativo, "la propuesta educativa", "la página de clases", los packs o precios de clases, los links de la tienda, los palacios de estudio (Macro, Análisis Estadístico), las preguntas frecuentes o el botón educativo del modal de Asesoramientos, aunque el pedido no diga "skill" ni "educativo".
---

# Landing /educativo (Bellido Asesoramientos · clases particulares)

Propuesta de clases particulares de Matías. Tiene un solo objetivo: que la persona entienda la oferta en pocos segundos y escriba por WhatsApp o compre en la tienda. Matías la quiere corta y definida, como la landing de un programa fitness que mandó de referencia (hero con una pregunta y un CTA, tres tarjetas, bio breve, "¿te pasa?", precios, tres pasos, cierre). Cada palabra nueva tiene que ganarse el lugar.

## Antes de empezar
1. Leé en el vault de Matías `proyectos/portfoliobellido.md` (registro) y `aprendizajes/errores-de-claude-code.md`.
2. Si tocás copy, oferta o diseño, aplicá también `reutilizable/visual-design-system.md`, `reutilizable/persuasion-offer-copy-framework.md` y `reutilizable/legal-ux-master-guidelines.md`.
3. El dev de Matías corre en :3000. No hagas `next build` ni levantes otro `next dev` encima: pisan `.next`.

## Mapa de archivos
| Qué | Dónde |
|---|---|
| Ruta y metadata (título, SEO, script que fuerza oscuro) | `app/educativo/layout.tsx`, `app/educativo/page.tsx` |
| Todo el copy (es y en, voseo) | `context/LanguageContext.tsx` → `t.educativo` (tipo `EducativoDict`) |
| Precios, links de la tienda, formulario, links de los palacios, LinkedIn | `components/educativo/data.ts` |
| Carrito (mismo flujo que /fitness) | `components/educativo/cart.tsx` (estado, `AddToCartButton`) y `EducativoCart.tsx` (botón flotante y panel) |
| Secciones | `components/educativo/Educativo*.tsx` |
| Emojis de Apple | `components/educativo/emoji.tsx` (reusa PNG de `public/fitness/emojis/`; los propios en `public/educativo/emojis/`) |
| Material visual compartido con /fitness (no lo edites desde acá) | `app/fitness/fitness.css`, `components/fitness/shared.tsx` |
| Botón del portfolio que lleva acá | `components/Projects.tsx` (modal "Mis Asesoramientos", `<Link href="/educativo">`) |

Orden de la página: hero → método (3 tarjetas) → quién soy → ¿te pasa? + beneficios incluidos → packs → cómo arrancar (3 pasos) → material UBA → preguntas → afiliados → contacto + pie. Si agregás o sacás una sección, actualizá `SECTIONS_BY_LINK` en `EducativoHeader.tsx` y los links de `t.educativo.nav`.

## Copy: las reglas de Matías
Estas salieron de correcciones suyas sobre esta misma página; cada una tiene su porqué.

- **Corta.** Una idea por tarjeta, una línea por idea, máximo tres pasos o tarjetas por bloque. Hoy la página tiene ~900 palabras contando las respuestas cerradas de la FAQ y los temas de los palacios; si un cambio la alarga, sacá algo de otro lado. Matías la rechazó una vez por larga ("acortá muchísimo").
- **Nada genérico.** Sin textos decorativos sobre la foto ("Diagnosticar → Completar → Avanzar"), sin chips de relleno, sin frases de coach ("desbloqueá tu potencial", "aprendé mejor", "resultados garantizados", "éxito académico"). Hablale al dolor concreto: horas sin avanzar, fórmulas de memoria, el parcial.
- **Sin doble sentido.** Leé cada titular buscando lecturas sexuales. "Si estudiás y no te entra…" se rechazó por eso. Expresiones seguras: "no te cierra", "quedó flojo", "te trabás", "ponerte al día".
- **Profesional con un poco de slang argentino** y voseo: "no te cierra", "sin vueltas", "arrancar", "flojo". Sin exagerar.
- **Nada del portfolio.** Ni proyectos, ni hackathons, ni stack técnico: esta página no es otra versión del portfolio. La única vuelta al portfolio es el link del pie ("Ir al portfolio profesional →").
- **Sin "Para padres".** Matías la sacó ("es cualquier cosa"). No la vuelvas a agregar ni metas preguntas dirigidas a padres.
- **Datos personales:** Matías tiene **21 años**, estudia **Actuario** (en inglés, Actuarial Science) en la FCE-UBA y da clases desde 2023. Materias (las dijo él, 2026-11-19; ordenadas de más a menos pedidas, criterio mío): Matemática, Álgebra, Estadística, Economía, Contabilidad, Microeconomía, Macroeconomía, Inglés, Excel, Python, SQL, Inteligencia Artificial, HTML, etc. Clases adaptadas a nivel primario, secundario y universitario. Van en "Quién soy" y en la FAQ.
- **Equipo:** muchas clases las da un profe de su equipo ("alguien de mi equipo"), asignado según la materia, con el mismo método (lo pidió Matías: delega seguido). Está en "Quién soy" y en la FAQ "¿Las clases las das vos?". No escribas nada que prometa que siempre da la clase él.
- **Solo datos reales.** Nada de notas, porcentajes de aprobados, testimonios ni cantidad de alumnos inventados. Lo que no está en el PDF de la propuesta (`public/projects/Imagenes/Bellido-Asesoramientos-Educativo.pdf`, que NO se muestra ni se linkea en la página) ni lo dijo Matías se resuelve con "consultalo por WhatsApp".
- **Beneficios incluidos**: los cinco textos van textuales ("Temario organizacional en pasos", "Asesoramiento personalizado P2P las 24 h", "Videos explicativos personalizados (opcional)", "20 clases de una hora cada una", "Reembolso de no obtener resultados esperados"). Al reembolso no se le inventan condiciones.
- **Afiliados**: solo 25 % del pago inicial y 20 % residual. Sin plazos, topes ni seguimiento.
- **Palacios**: Macro se presenta como "segunda parte de la materia" y Análisis Estadístico II como "primera parte"; nunca "tercer parcial" ni "recuperatorio" (lo pidió Matías), y nada que suene a exámenes filtrados. Se nombran todos los temas.

## Carrito, precios, formulario y tienda
- **Carrito como /fitness** (pedido de Matías): "🛒 Agregar al carrito" es la acción principal de cada pack y "Consultar" (WhatsApp) la tranquila. Botón flotante con cantidad y total; panel con Carrito → Pago → Formulario; pago por transferencia de Mercado Pago a la cuenta de Matías (`MERCADO_PAGO` de `components/fitness/shared.tsx`, importado tal cual); al volver de pagar se reabre en el paso de pago (localStorage `bellido-educativo-cart-v1`). Sin confirmación automática: el último paso pide el formulario o el comprobante por WhatsApp. Packs y planes, uno por compra; la clase suelta, con − / +.
- **Formulario** (`EDU_FORM_URL`): Google Form para después de pagar o para consultas. Vacío = en producción no se muestra y el carrito pide el comprobante; en desarrollo se ve un aviso de que falta el link. Las preguntas que Matías tiene que armar están en su nota de proyecto del vault.
- Precios y precios de lista en `PACKS` de `data.ts`: copian la tienda a mano. Si Matías pasa precios nuevos, cambiá solo ahí.
- Packs y planes se muestran "por mes" (así lo confirmó Matías y lo dice el PDF); la Clase Particular, "por clase". El Tec Pack tiene 10 clases (la tienda), no 15 (el PDF tenía un error).
- Links de la tienda (`STORE_CART_URL`, cada `buyUrl`): opcionales y secundarios ("Ver en la tienda", "Ver tienda completa"). Vacíos = no se muestran; nunca un link a `#`.
- Precios con `formatPrice` (`Intl.NumberFormat`, `es-AR` / `en-US`, código ARS). El descuento contra el precio de lista se calcula solo (`discountPct`).

## Diseño
- Mismo sistema que /fitness: `.liquid-glass` solo en lo que se elige o se toca (header, tarjetas de packs), `.fit-surface` para el resto, `.liquid-cta` y `WhatsAppButton` como única acción. Siempre en oscuro.
- Íconos que ilustran contenido = emojis de Apple como imagen (`Emoji`); lucide solo para controles y los ✓. Mirá un emoji nuevo sobre el tile oscuro antes de usarlo (receta `receta-emojis-de-apple` del vault).
- Logos de apps (Gmail, LinkedIn) en PNG tal cual, sin círculo ni fondo blanco, en pills simétricas del mismo ancho.
- Foto del hero: `public/projects/Imagenes/profile.webp` (1254 × 1254) en marco cuadrado, sin nada escrito encima.
- "Abrir palacio" usa el lenguaje del botón "Propuesta" (brillo, halo, hover 1,03 solo con mouse; todo se apaga con "reducir movimiento"). Si una URL de palacio queda vacía, el botón sale deshabilitado con "Próximamente".

## Verificar antes de entregar
1. `npx tsc --noEmit` (el build ignora errores de TypeScript).
2. Funcional, contra el dev de :3000: `PLAYWRIGHT_DIR=<node_modules con playwright> node .claude/skills/bellido-educativo/scripts/check-educativo.cjs`. Revisa orden de secciones, menú, foto, precios es/en, botones de compra, palacios, FAQ, afiliados, contacto, 21 años, que no haya proyectos ni "Para padres", axe WCAG 2.1 AA, consola limpia y la navegación desde el modal del portfolio. Deja capturas por sección en `OUT` (por defecto, una carpeta temporal). Si cambiás la estructura a propósito, actualizá el script en el mismo cambio.
3. Responsive: `MSYS_NO_PATHCONV=1 PAGES="/educativo" ORIGIN=http://localhost:3000 PLAYWRIGHT_DIR=… node .claude/skills/bellido-fitness/scripts/audit-responsive.cjs` (13 anchos, 320 a 1920 px).
4. Mirá las capturas de 375 y 1440 px una por una. En las capturas por elemento el header `fixed` aparece encima del título: es la captura, no la página.
5. Para commitear: este repo tiene trabajo pendiente de otras sesiones en `LanguageContext.tsx`. Commiteá solo lo tuyo (`git stash create` antes de editar + `git diff <foto> -- archivo | git apply --cached`), con rutas explícitas (nunca `git add -A`) y `git -c user.name="Matías Rodrigo Bellido" commit`. Push solo si Matías lo pide en ese mensaje.
