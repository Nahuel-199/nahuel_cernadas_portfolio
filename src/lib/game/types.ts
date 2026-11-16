export type Grid = Uint8Array[];

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Body extends Box {
  vx: number;
  vy: number;
  onGround: boolean;
  hitWall?: boolean;
}

export type Facing = 1 | -1;

export interface Mover {
  x0: number;
  x1: number;
  y: number;
  w: number;
  x: number;
  dir: Facing;
  speed: number;
  prevX: number;
}

export interface Player extends Body {
  face: Facing;
  coyote: number;
  buf: number;
  inv: number;
  anim: number;
  standing: Mover | null;
  big: boolean;
}

export interface Enemy extends Body {
  alive: boolean;
  flat: number;
  anim: number;
}

export interface Boss extends Body {
  hp: number;
  inv: number;
  jumpT: number;
  jumping: boolean;
  alive: boolean;
  dead: number;
  face: Facing;
  anim: number;
}

/** Notebook que sale de un bloque azul. */
export interface Item extends Body {
  rise: number;
  gone?: boolean;
}

/** Onda de error que lanza el jefe al caer. */
export interface Shot extends Box {
  vx: number;
  gone?: boolean;
}

export interface Commit {
  x: number;
  y: number;
  got: boolean;
}

export interface Popup {
  text: string;
  x: number;
  y: number;
  t: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  color: string;
}

export type BuildingKind = 'kiosk' | 'school' | 'studio' | 'depot' | 'shop' | 'office';

export interface Door {
  /** Posición en tiles. */
  x: number;
  /** Índice del capítulo (src/content/chapters.ts). */
  ch: number;
  kind: BuildingKind;
}

export interface Stats {
  commits: number;
  stack: string[];
  bugs: number;
  chapters: boolean[];
  deaths: number;
  elapsed: number;
  boss: boolean;
}

// ======================= EVENTOS HACIA LA UI =======================

export interface HudState {
  lives: number;
  maxLives: number;
  commits: number;
  totalCommits: number;
  stack: number;
  totalStack: number;
  bugs: number;
  chapters: number;
  totalChapters: number;
  senior: boolean;
}

export interface LevelResult {
  /** Segundos, redondeado a 0.1. */
  time: number;
  commits: number;
  totalCommits: number;
  stack: number;
  totalStack: number;
  bugs: number;
}

export interface GameEvents {
  /** La partida empezó (botón JUGAR o Enter). */
  start: null;
  hud: HudState;
  /** Capítulo de la puerta cercana, o null si no hay ninguna. */
  door: number | null;
  /** Se entró a la puerta de un capítulo. */
  chapter: number;
  boss: { visible: boolean; hp: number; maxHp: number };
  /** Mensaje corto en pantalla. */
  toast: string;
  /** Texto para lectores de pantalla. */
  announce: string;
  complete: LevelResult;
}
