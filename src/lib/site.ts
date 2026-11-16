import { CHAPTERS, PROFILE } from '@/content/chapters';

/**
 * URL pública del sitio. Orden: NEXT_PUBLIC_SITE_URL → dominio de producción de Vercel → placeholder.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://nahuelcernadas.vercel.app';

export const SITE_NAME = `${PROFILE.name} — Portfolio`;

/** Descripción para buscadores: el texto del capítulo 1, tal cual. */
export const SITE_DESCRIPTION = CHAPTERS[0].text;

/** Base de Open Graph compartida (la metadata de cada página reemplaza `openGraph` entero, no lo mezcla). */
export const OG_BASE = {
  type: 'website',
  locale: 'es_AR',
  siteName: SITE_NAME,
} as const;

/** Imagen generada por src/app/opengraph-image.tsx, para páginas que redefinen `openGraph`. */
export const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${PROFILE.name} · ${PROFILE.role}`,
} as const;
