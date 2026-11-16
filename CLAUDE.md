@AGENTS.md

# Portfolio de Nahuel Cernadas — juego de plataformas

## Stack
Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript estricto · Tailwind v4 · pnpm.
Etapa 4: `@upstash/redis` para `/api/scores`. Deploy en Vercel.

## Comandos
- `pnpm dev`: servidor de desarrollo
- `pnpm build`: build de producción (incluye chequeo de tipos)
- `pnpm lint`: ESLint
- `npx tsc --noEmit`: solo tipos

## Estructura
- `docs/prototipo/plataformas.html`: **referencia exacta** de comportamiento, nivel, física, sprites y textos.
- `src/lib/game/`: motor en TS puro, sin React. `engine.ts` (clase `GameEngine`) orquesta; avisa a la UI por eventos tipados (`GameEvents` en `types.ts`) y no toca el DOM fuera del canvas.
- `src/components/game/Game.tsx`: componente cliente que monta el canvas y el motor.
- Mobile (`pointer: coarse`): HUD compacto con menú ☰. En vertical la cámara usa una vista de 270 px lógicos (`PORTRAIT_VIEW_W`) y vuelve a 400 durante el jefe; la física siempre usa `VW`.
- `src/content/chapters.ts`: textos de los capítulos (etapa 2).
- `src/app/fonts.ts`: Press Start 2P y Archivo con `next/font/google`.
- `src/app/lectura/`: versión de solo texto (SEO). `src/lib/site.ts`: URL del sitio y metadata compartida.
- `src/app/api/scores/route.ts`: GET top 10 / POST récord. Validación en `src/lib/scores.ts` (compartida con el cliente), Redis en `src/lib/scores-server.ts`. Un jugador = secreto anónimo en localStorage; en Redis se guarda solo su hash.

## Variables de entorno (`.env`, ignorado por git)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: tabla compartida. Sin ellas la API responde 503 y el juego guarda récords en el navegador.
- `NEXT_PUBLIC_SITE_URL` (opcional): URL pública; si falta usa `VERCEL_PROJECT_PRODUCTION_URL` o `https://nahuelcernadas.vercel.app`.

## Reglas
- No agregar dependencias sin preguntar.
- No inventar datos: todo texto/dato sale del prototipo, de `docs/cv/` o del usuario.
- Mantener el comportamiento idéntico al prototipo: mismos números de física y mismo orden de update.
- Trabajo por etapas: frenar al terminar cada una para revisión. No commitear hasta que el usuario lo pida (al final de todo).
- UI y textos en español rioplatense.
