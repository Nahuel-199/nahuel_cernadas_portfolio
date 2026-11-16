# Nahuel Cernadas — Portfolio: el juego

Mi portfolio como un juego de plataformas: cada puerta es un capítulo de mi carrera.
También hay una versión de solo texto en `/lectura`.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Upstash Redis (tabla de récords) · Vercel.

## Desarrollo
```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm lint
pnpm build
```

Variables de entorno en `.env` (opcional en local; sin ellas los récords se guardan en el navegador):

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://nahuelcernadas.vercel.app
```

## Estructura
- `src/lib/game/`: motor del juego (TypeScript puro, sin React).
- `src/components/game/`: HUD, diálogos, controles táctiles y pantalla de inicio.
- `src/content/chapters.ts`: todos los textos.
- `src/app/api/scores/`: API de récords (top 10, mejor tiempo por jugador, validación y límite de pedidos).
