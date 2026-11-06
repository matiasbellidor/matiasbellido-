# CLAUDE.md — portfoliobellido

Portfolio de Matías Bellido (Next.js 14 App Router, TypeScript, Tailwind, Framer Motion) y la landing `/fitness` de Bellido Asesoramientos.

## Memoria del proyecto: el vault de Obsidian
El vault de Matías es la memoria persistente de este repo (su ubicación está en el CLAUDE.md global de Matías). Antes de trabajar acá, leé:
- `proyectos/portfoliobellido.md`: decisiones, convenciones, próximos pasos y el registro del repo. Al terminar algo relevante, agregá una entrada fechada en "🗒️ Registro" (nunca borres las anteriores).
- `aprendizajes/buenas-practicas.md` y `aprendizajes/errores-de-claude-code.md`: cómo quiere que trabajes y errores que no hay que repetir.
- Reglas web obligatorias: `reutilizable/legal-ux-master-guidelines.md`, `reutilizable/visual-design-system.md`, `reutilizable/persuasion-offer-copy-framework.md` y `reutilizable/ecommerce-conversion-tactics.md`.
- Recetas de este repo: `reutilizable/receta-fotos-autodetectadas-next.md` (copia del código en `reutilizable/codigo/fitness-landing/`).

## Landing /fitness
Para cualquier cambio en `/fitness` (textos, planes, fotos, diseño, secciones) usá la skill `bellido-fitness` (`.claude/skills/bellido-fitness/SKILL.md`): tiene el mapa de archivos, las reglas de diseño y copy, cómo actualizar fotos y cómo verificar.

## Comandos
- `npm run dev` (puerto 3000). No corras `npm run build` ni otro `next dev` con ese servidor vivo: pisan `.next` y lo rompen.
- `npx tsc --noEmit`: el build ignora los errores de TypeScript (`next.config.js`), así que hay que correrlo a mano.
- `node scripts/fitness-photos.mjs`: regenera las copias `-hd` de las fotos de `/fitness`.

## Convenciones
- Todo el copy vive en `context/LanguageContext.tsx`, bloques `es` y `en`, con voseo. Si cambiás uno, cambiá el otro.
- En el portfolio, el título de Matías es siempre "Data Analyst" (nunca "Data Scientist").
- Un cambio en `tailwind.config.ts` no lo toma el `next dev` que ya está corriendo: reinicialo o usá CSS de la ruta.
- El repo es público: nada de rutas personales, tokens ni datos de terceros en código o comentarios.
