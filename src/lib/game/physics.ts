import { T } from './constants';
import { Tile, solid, tileAt } from './level';
import type { Body, Box, Grid } from './types';

/**
 * Mueve un cuerpo contra la grilla: primero en X, después en Y.
 * Las plataformas de madera solo frenan si el cuerpo venía desde arriba.
 * `onHeadBump` recibe el tile golpeado con la cabeza (prioriza el del medio).
 */
export function moveBody(b: Body, dt: number, grid: Grid, onHeadBump?: (tx: number, ty: number) => void): void {
  // Horizontal
  b.x += b.vx * dt;
  const top = Math.floor(b.y / T);
  const bot = Math.floor((b.y + b.h - 0.01) / T);
  if (b.vx > 0) {
    const cx = Math.floor((b.x + b.w - 0.01) / T);
    for (let ty = top; ty <= bot; ty++)
      if (solid(tileAt(grid, cx, ty))) { b.x = cx * T - b.w; b.vx = 0; b.hitWall = true; break; }
  } else if (b.vx < 0) {
    const cx = Math.floor(b.x / T);
    for (let ty = top; ty <= bot; ty++)
      if (solid(tileAt(grid, cx, ty))) { b.x = (cx + 1) * T; b.vx = 0; b.hitWall = true; break; }
  }

  // Vertical
  const prevBottom = b.y + b.h;
  b.y += b.vy * dt;
  b.onGround = false;
  const l = Math.floor(b.x / T);
  const r = Math.floor((b.x + b.w - 0.01) / T);
  if (b.vy >= 0) {
    const by = Math.floor((b.y + b.h) / T);
    for (let tx = l; tx <= r; tx++) {
      const t = tileAt(grid, tx, by);
      if (solid(t) || (t === Tile.Wood && prevBottom <= by * T + 1)) {
        b.y = by * T - b.h; b.vy = 0; b.onGround = true; break;
      }
    }
  } else {
    const ty = Math.floor(b.y / T);
    let hit = -1;
    for (let tx = l; tx <= r; tx++) if (solid(tileAt(grid, tx, ty))) hit = tx;
    if (hit >= 0) {
      const mid = Math.floor((b.x + b.w / 2) / T);
      if (solid(tileAt(grid, mid, ty))) hit = mid;
      b.y = (ty + 1) * T; b.vy = 0;
      onHeadBump?.(hit, ty);
    }
  }
}

export function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
