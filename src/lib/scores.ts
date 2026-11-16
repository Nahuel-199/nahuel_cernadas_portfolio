// Récords: tipos, validación (compartida por cliente y /api/scores) y almacenamiento local.

import { PLAYER_PHYS, T } from './game/constants';
import { ENEMY_X, FLAG_X, PLAYER_START } from './game/level';

export interface ScoreRow {
  initials: string;
  /** Segundos. */
  time: number;
  stack: number;
  bugs: number;
  id?: string;
}

export const MAX_SCORE_TIME = 36000;
export const MAX_STACK = 8;
/** Todos los bugs del nivel más el jefe. */
export const MAX_BUGS = ENEMY_X.length + 1;
/**
 * Tiempo mínimo físicamente posible: ir del inicio a la bandera corriendo siempre a velocidad máxima.
 * (El real es bastante mayor porque además hay que vencer al jefe.)
 */
export const MIN_SCORE_TIME = Math.floor((FLAG_X * T - PLAYER_START.x) / PLAYER_PHYS.maxRun);
export const BOARD_SIZE = 10;

/** Lo que el cliente manda a POST /api/scores. */
export interface ScoreSubmission {
  /** Identificador secreto y anónimo del jugador (se guarda en su navegador). */
  player: string;
  initials: string;
  time: number;
  stack: number;
  bugs: number;
}

const PLAYER_RE = /^[A-Za-z0-9-]{16,64}$/;
const INITIALS_RE = /^[A-Z0-9]{1,3}$/;

/** Validación estricta del envío (el servidor rechaza en vez de corregir). */
export function validateSubmission(d: unknown): { ok: true; value: ScoreSubmission } | { ok: false; error: string } {
  if (!d || typeof d !== 'object') return { ok: false, error: 'Cuerpo inválido.' };
  const r = d as Record<string, unknown>;
  const { player, initials, time, stack, bugs } = r;
  if (typeof player !== 'string' || !PLAYER_RE.test(player)) return { ok: false, error: 'Jugador inválido.' };
  if (typeof initials !== 'string' || !INITIALS_RE.test(initials)) return { ok: false, error: 'Las iniciales tienen que ser de 1 a 3 letras o números.' };
  if (typeof time !== 'number' || !Number.isFinite(time) || time < MIN_SCORE_TIME || time > MAX_SCORE_TIME) return { ok: false, error: 'Tiempo inválido.' };
  if (!Number.isInteger(stack) || (stack as number) < 0 || (stack as number) > MAX_STACK) return { ok: false, error: 'Stack inválido.' };
  if (!Number.isInteger(bugs) || (bugs as number) < 0 || (bugs as number) > MAX_BUGS) return { ok: false, error: 'Bugs inválidos.' };
  return {
    ok: true,
    value: { player, initials, time: Math.round(time * 10) / 10, stack: stack as number, bugs: bugs as number },
  };
}

/** Id público derivado del secreto del jugador (sha-256, 16 hex). Igual en cliente y servidor. */
export async function publicPlayerId(secret: string): Promise<string> {
  const data = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Normaliza una fila; devuelve null si no es válida (mismas reglas que el prototipo). */
export function cleanRow(d: unknown): ScoreRow | null {
  if (!d || typeof d !== 'object') return null;
  const r = d as Record<string, unknown>;
  const t = Number(r.time);
  if (!Number.isFinite(t) || t <= 0 || t > MAX_SCORE_TIME) return null;
  return {
    initials: cleanInitials(String(r.initials ?? '???')) || '???',
    time: t,
    stack: Math.min(MAX_STACK, Math.max(0, Number(r.stack) || 0)),
    bugs: Math.max(0, Math.floor(Number(r.bugs) || 0)),
    id: typeof r.id === 'string' ? r.id : '',
  };
}

export function cleanInitials(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
}

/** m:ss.d */
export function fmtTime(sec: number): string {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r < 10 ? '0' : ''}${r.toFixed(1)}`;
}

// ======================= ALMACENAMIENTO LOCAL =======================

const KEY = 'gamefolio-records';

export function readLocalBoard(): ScoreRow[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.map(cleanRow).filter((r): r is ScoreRow => r !== null) : [];
  } catch {
    return [];
  }
}

export function saveLocalScore(row: ScoreRow): void {
  try {
    const list = readLocalBoard();
    list.push(row);
    list.sort((a, b) => a.time - b.time);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    // sin almacenamiento disponible: no se guarda
  }
}
