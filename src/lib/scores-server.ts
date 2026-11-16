// Acceso a Upstash Redis para /api/scores. Solo se importa desde el servidor.
//
// Claves:
//   scores:board            sorted set  idPúblico → mejor tiempo (menor es mejor)
//   scores:rows             hash        idPúblico → { initials, time, stack, bugs, at }
//   rl:scores:<ip>:<ventana> contador de pedidos por IP y minuto

import { Redis } from '@upstash/redis';
import { BOARD_SIZE, cleanRow, publicPlayerId, type ScoreRow, type ScoreSubmission } from './scores';

const BOARD_KEY = 'scores:board';
const ROWS_KEY = 'scores:rows';

export const RATE_LIMIT = { max: 5, windowSec: 60 } as const;

let client: Redis | null | undefined;

/** Cliente de Redis, o null si faltan las variables de entorno. */
export function getRedis(): Redis | null {
  if (client === undefined) {
    client = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;
  }
  return client;
}

/** Top 10 (2 comandos: ZRANGE + HMGET). */
export async function getTopScores(redis: Redis): Promise<ScoreRow[]> {
  const ids = await redis.zrange<string[]>(BOARD_KEY, 0, BOARD_SIZE - 1);
  if (!ids.length) return [];
  const rows = await redis.hmget<Record<string, unknown>>(ROWS_KEY, ...ids);
  if (!rows) return [];
  const out: ScoreRow[] = [];
  for (const id of ids) {
    const r = cleanRow(rows[id]);
    if (r) out.push({ ...r, id });
  }
  return out;
}

/**
 * Límite de pedidos por IP con ventana fija.
 * Devuelve los segundos a esperar si se pasó del límite, o 0 si puede seguir.
 */
export async function rateLimit(redis: Redis, ip: string): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  const win = Math.floor(now / RATE_LIMIT.windowSec);
  const key = `rl:scores:${ip}:${win}`;
  const [count] = await redis.pipeline().incr(key).expire(key, RATE_LIMIT.windowSec).exec<[number, number]>();
  return count > RATE_LIMIT.max ? (win + 1) * RATE_LIMIT.windowSec - now : 0;
}

export type SaveResult = { status: 'saved'; best: number; id: string } | { status: 'kept'; best: number; id: string };

/** Guarda solo si mejora el tiempo del jugador (ZADD LT es atómico). */
export async function saveBestScore(redis: Redis, s: ScoreSubmission): Promise<SaveResult> {
  const id = await publicPlayerId(s.player);
  const changed = await redis.zadd(BOARD_KEY, { lt: true, ch: true }, { score: s.time, member: id });
  if (changed) {
    await redis.hset(ROWS_KEY, { [id]: { initials: s.initials, time: s.time, stack: s.stack, bugs: s.bugs, at: Date.now() } });
    return { status: 'saved', best: s.time, id };
  }
  const best = await redis.zscore(BOARD_KEY, id);
  return { status: 'kept', best: best ?? s.time, id };
}
