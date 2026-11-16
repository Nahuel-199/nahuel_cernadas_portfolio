import { H, T, W } from './constants';
import type { Commit, Door, Grid, Mover } from './types';

export const Tile = {
  Empty: 0,
  Dirt: 1,
  Brick: 2,
  Code: 3, // bloque </> (suelta una tecnología)
  Used: 4,
  Wood: 5, // plataforma de madera (se atraviesa desde abajo)
  Stone: 6,
  Power: 7, // bloque azul con la notebook
  Gate: 8, // compuerta del jefe
} as const;

/** Bloques </>: "x,y" → tecnología. */
export const TECH: Readonly<Record<string, string>> = {
  '12,10': 'React',
  '47,10': 'Next.js',
  '98,10': 'TypeScript',
  '118,10': 'Node.js',
  '131,9': 'SQL',
  '168,10': 'Docker',
  '188,10': 'GitLab CI',
  '190,10': 'Python',
};
export const TOTAL_STACK = Object.keys(TECH).length;

/** Bloques azules con la notebook (power-up). */
export const POWERS: ReadonlyArray<readonly [number, number]> = [
  [11, 10],
  [119, 10],
  [189, 10],
];

export const DOORS: readonly Door[] = [
  { x: 6, ch: 0, kind: 'kiosk' },
  { x: 53, ch: 1, kind: 'school' },
  { x: 91, ch: 2, kind: 'studio' },
  { x: 126, ch: 3, kind: 'depot' },
  { x: 160, ch: 4, kind: 'shop' },
  { x: 244, ch: 5, kind: 'office' },
];
export const TOTAL_CHAPTERS = DOORS.length;

export const FLAG_X = 236;

/** Arena del jefe: entre la meseta (x 203-204) y la compuerta (x 229). */
export const ARENA = { x0: 205, x1: 228, gate: 229 } as const;

export const ENEMY_X: readonly number[] = [36, 58, 84, 96, 121, 129, 150, 157, 175, 186];

const COMMIT_TILES: ReadonlyArray<readonly [number, number]> = [
  [16, 12], [17, 12], [18, 12], [24, 11], [25, 10], [26, 11], [41, 10], [42, 9], [43, 10], [56, 12],
  [57, 12], [71, 7], [72, 6], [73, 6], [74, 7], [100, 12], [101, 12], [105, 9], [106, 9], [108, 7],
  [109, 7], [122, 12], [123, 12], [137, 10], [139, 9], [141, 10], [155, 9], [156, 9], [170, 5], [171, 5],
  [172, 5], [173, 5], [178, 10], [179, 9], [180, 9], [181, 10], [192, 12], [196, 10], [199, 7], [202, 4],
];
export const TOTAL_COMMITS = COMMIT_TILES.length;

export const PLAYER_START = { x: 3 * T, y: 12 * T - 6 } as const;
export const RESPAWN_Y = 12 * T - 6;

export function createCommits(): Commit[] {
  return COMMIT_TILES.map(([x, y]) => ({ x: x * T + 8, y: y * T + 8, got: false }));
}

export function createMovers(): Mover[] {
  return [{ x0: 136 * T, x1: 141 * T, y: 12 * T, w: 3 * T, x: 136 * T, dir: 1, speed: 38, prevX: 136 * T }];
}

export function setGate(grid: Grid, on: boolean): void {
  for (let gy = 4; gy <= 13; gy++) grid[gy][ARENA.gate] = on ? Tile.Gate : Tile.Empty;
}

/** Arma la grilla del nivel desde cero (estado inicial completo). */
export function buildGrid(): Grid {
  const grid: Grid = [];
  for (let r = 0; r < H; r++) grid.push(new Uint8Array(W));
  const fill = (x0: number, x1: number, y0: number, y1: number, t: number) => {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) if (x >= 0 && x < W && y >= 0 && y < H) grid[y][x] = t;
  };

  fill(0, W - 1, 14, 16, Tile.Dirt);
  for (const [a, b] of [[41, 43], [71, 74], [104, 111], [136, 143], [178, 181]]) fill(a, b, 14, 16, Tile.Empty);
  // zona 1
  fill(10, 11, 10, 10, Tile.Brick); fill(13, 13, 10, 10, Tile.Brick);
  // zona 2
  fill(46, 46, 10, 10, Tile.Brick); fill(48, 48, 10, 10, Tile.Brick);
  fill(66, 66, 13, 13, Tile.Stone); fill(67, 67, 12, 13, Tile.Stone); fill(68, 68, 11, 13, Tile.Stone); fill(69, 70, 10, 13, Tile.Stone);
  fill(75, 76, 10, 13, Tile.Stone); fill(77, 77, 11, 13, Tile.Stone); fill(78, 78, 12, 13, Tile.Stone); fill(79, 79, 13, 13, Tile.Stone);
  // zona 3
  fill(105, 106, 11, 11, Tile.Wood); fill(108, 109, 9, 9, Tile.Wood); fill(97, 97, 10, 10, Tile.Brick); fill(99, 99, 10, 10, Tile.Brick);
  // zona 4
  fill(117, 117, 10, 10, Tile.Brick); fill(119, 119, 10, 10, Tile.Brick); fill(130, 130, 9, 9, Tile.Brick); fill(132, 132, 9, 9, Tile.Brick);
  // zona 5
  fill(165, 171, 10, 10, Tile.Brick); fill(170, 173, 7, 7, Tile.Wood); fill(163, 163, 12, 13, Tile.Stone); fill(152, 152, 13, 13, Tile.Stone); fill(153, 153, 12, 13, Tile.Stone);
  // zona 6
  for (let s = 0; s < 8; s++) fill(195 + s, 195 + s, 13 - s, 13, Tile.Stone);
  fill(203, 204, 6, 13, Tile.Stone);

  for (const k of Object.keys(TECH)) {
    const [x, y] = k.split(',').map(Number);
    grid[y][x] = Tile.Code;
  }
  for (const [x, y] of POWERS) grid[y][x] = Tile.Power;
  setGate(grid, true);
  return grid;
}

/** Fuera del nivel por los costados cuenta como piedra; por arriba/abajo, vacío. */
export function tileAt(grid: Grid, tx: number, ty: number): number {
  if (tx < 0 || tx >= W) return Tile.Stone;
  if (ty < 0 || ty >= H) return Tile.Empty;
  return grid[ty][tx];
}

export function solid(t: number): boolean {
  return (
    t === Tile.Dirt || t === Tile.Brick || t === Tile.Code || t === Tile.Used ||
    t === Tile.Stone || t === Tile.Power || t === Tile.Gate
  );
}
