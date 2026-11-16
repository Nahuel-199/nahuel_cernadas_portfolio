import { H, PLAYER_SIZE, T } from './constants';
import { moveBody, overlaps } from './physics';
import type { GameEngine } from './engine';

/** La notebook sale del bloque azul subiendo, y después camina. */
export function spawnNotebook(g: GameEngine, tx: number, ty: number): void {
  g.items.push({ x: tx * T + 1, y: ty * T, w: 14, h: 10, vx: 0, vy: 0, onGround: false, rise: 0.45 });
}

export function updateItems(g: GameEngine, dt: number): void {
  const p = g.player;
  for (const it of g.items) {
    if (it.rise > 0) {
      it.rise -= dt; it.y -= 24 * dt;
      if (it.rise <= 0) it.vx = 55;
    } else {
      it.vy = Math.min(500, it.vy + 1200 * dt);
      it.hitWall = false;
      const vx = it.vx;
      moveBody(it, dt, g.grid);
      it.vx = it.hitWall ? -vx : vx;
    }
    if (it.y > H * T) it.gone = true;
    if (!it.gone && overlaps(p, it)) { it.gone = true; grow(g); }
  }
  g.items = g.items.filter((it) => !it.gone);
  if (g.growT > 0) g.growT -= dt;
}

/** Modo Senior: el jugador crece y puede romper ladrillos. */
export function grow(g: GameEngine): void {
  const p = g.player;
  if (p.big) return;
  const oh = p.h;
  p.big = true; p.w = PLAYER_SIZE.big.w; p.h = PLAYER_SIZE.big.h; p.x -= 2; p.y -= p.h - oh;
  g.growT = 0.6;
  g.sfx('power');
  g.popup('¡MODO SENIOR!', p.x + p.w / 2, p.y - 6, '#93C5FD');
  g.emitHud();
}

export function shrink(g: GameEngine): void {
  const p = g.player;
  if (!p.big) return;
  const oh = p.h;
  p.big = false; p.w = PLAYER_SIZE.small.w; p.h = PLAYER_SIZE.small.h; p.x += 2; p.y += oh - p.h;
  g.growT = 0.6;
  g.emitHud();
}
