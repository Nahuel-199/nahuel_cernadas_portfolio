import { connection, type NextRequest } from 'next/server';
import { getRedis, getTopScores, rateLimit, saveBestScore } from '@/lib/scores-server';
import { validateSubmission } from '@/lib/scores';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;
const MAX_BODY_BYTES = 1024;

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon';
}

/** Top 10 de la tabla compartida. */
export async function GET() {
  await connection(); // siempre en el momento del pedido, nunca prerenderizado
  const redis = getRedis();
  if (!redis) return json({ error: 'La tabla compartida no está configurada.' }, 503);
  try {
    return json({ scores: await getTopScores(redis) });
  } catch (e) {
    console.error('[api/scores] GET', e);
    return json({ error: 'No se pudo leer la tabla.' }, 502);
  }
}

/** Guarda el récord de un jugador si mejora su mejor tiempo. */
export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) return json({ error: 'La tabla compartida no está configurada.' }, 503);

  const type = req.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return json({ error: 'Se espera JSON.' }, 415);

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: 'Cuerpo demasiado grande.' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'JSON inválido.' }, 400);
  }
  const parsed = validateSubmission(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  try {
    const wait = await rateLimit(redis, clientIp(req));
    if (wait > 0) {
      return json({ error: 'Demasiados intentos. Esperá un minuto y probá de nuevo.' }, 429, { 'Retry-After': String(wait) });
    }
    const result = await saveBestScore(redis, parsed.value);
    return json(result, result.status === 'saved' ? 201 : 200);
  } catch (e) {
    console.error('[api/scores] POST', e);
    return json({ error: 'No se pudo guardar el récord.' }, 502);
  }
}
