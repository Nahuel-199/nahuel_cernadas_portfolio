'use client';

import { useSyncExternalStore } from 'react';
import {
  fmtTime, publicPlayerId, readLocalBoard, saveLocalScore, type ScoreRow, type ScoreSubmission,
} from '@/lib/scores';

// Tabla de récords compartida por todos los componentes que la muestran.
// Fuente principal: /api/scores (Upstash). Si no responde, se usa este navegador (localStorage).

export type BoardSource = 'local' | 'shared';

interface BoardState {
  rows: ScoreRow[];
  loading: boolean;
  source: BoardSource;
  /** Id público del jugador de este navegador (para resaltar su fila). */
  myId: string | null;
}

const SERVER_STATE: BoardState = { rows: [], loading: true, source: 'local', myId: null };
const PLAYER_KEY = 'gamefolio-player';
const TIMEOUT_MS = 10_000;

let state: BoardState | null = null;
const subscribers = new Set<() => void>();

function setState(patch: Partial<BoardState>): void {
  state = { ...(state ?? SERVER_STATE), ...patch };
  subscribers.forEach((fn) => fn());
}

/** Secreto anónimo del jugador, creado la primera vez y guardado en el navegador. */
function playerSecret(): string {
  try {
    let id = localStorage.getItem(PLAYER_KEY);
    if (!id) {
      id = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(PLAYER_KEY, id);
    }
    return id;
  } catch {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  }
}

async function loadMyId(): Promise<void> {
  try {
    setState({ myId: await publicPlayerId(playerSecret()) });
  } catch {
    // crypto.subtle no disponible (contexto inseguro): sin resaltado
  }
}

async function refresh(): Promise<void> {
  try {
    const res = await fetch('/api/scores', { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { scores: ScoreRow[] };
    setState({ rows: data.scores, source: 'shared', loading: false });
  } catch {
    setState({ rows: readLocalBoard(), source: 'local', loading: false });
  }
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  // Cada vez que se vuelve a mostrar una tabla, se actualiza.
  if (subscribers.size === 1) {
    if (state === null) void loadMyId();
    void refresh();
  }
  return () => { subscribers.delete(fn); };
}

function getSnapshot(): BoardState {
  return state ?? SERVER_STATE;
}

export function useLeaderboard(): BoardState {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
}

export interface SaveOutcome {
  message: string;
  /** false si conviene dejar reintentar (límite de pedidos o datos rechazados). */
  done: boolean;
}

/** Guarda un récord en la tabla compartida; si no se puede, en este navegador. */
export async function saveScore(row: Omit<ScoreSubmission, 'player'>): Promise<SaveOutcome> {
  const local = (message: string): SaveOutcome => {
    saveLocalScore(row);
    if (getSnapshot().source !== 'shared') setState({ rows: readLocalBoard() });
    return { message, done: true };
  };

  let res: Response;
  try {
    res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...row, player: playerSecret() }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return local('No se pudo guardar en la tabla compartida: quedó guardado en este navegador.');
  }

  const data = (await res.json().catch(() => ({}))) as { status?: 'saved' | 'kept'; best?: number; error?: string };

  if (res.status === 503) return local('Récord guardado en este navegador.');
  if (res.status === 429 || res.status === 400) {
    return { message: data.error ?? 'No se pudo guardar el récord.', done: false };
  }
  if (!res.ok) return local('No se pudo guardar en la tabla compartida: quedó guardado en este navegador.');

  void refresh();
  if (data.status === 'kept') {
    return { message: `Tu mejor tiempo sigue siendo ${fmtTime(data.best ?? row.time)}. ¡Intentá superarlo!`, done: true };
  }
  return { message: '¡Récord guardado en la tabla!', done: true };
}
