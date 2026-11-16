import { H, T, VW } from './constants';
import { ENEMY_X, solid, tileAt } from './level';
import { moveBody, overlaps } from './physics';
import type { GameEngine } from './engine';
import type { Enemy } from './types';

export function createEnemies(): Enemy[] {
  return ENEMY_X.map((x) => ({
    x: x * T, y: 13 * T - 8, w: 14, h: 10, vx: -28, vy: 0, onGround: false, alive: true, flat: 0, anim: 0,
  }));
}

/** Bugs que caminan, giran en bordes y paredes, y se aplastan desde arriba. */
export function updateEnemies(g: GameEngine, dt: number): void {
  const p = g.player;
  for (const e of g.enemies) {
    if (!e.alive) { e.flat -= dt; continue; }
    if (Math.abs(e.x - p.x) > VW) continue; // solo se activan cerca del jugador
    e.anim += dt;
    e.vy = Math.min(500, e.vy + 1200 * dt);
    e.hitWall = false;

    // da la vuelta en bordes
    const aheadX = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
    if (e.onGround && !solid(tileAt(g.grid, Math.floor(aheadX / T), Math.floor((e.y + e.h + 2) / T)))) e.vx = -e.vx;
    const vx = e.vx;
    moveBody(e, dt, g.grid);
    e.vx = e.hitWall ? -vx : vx;
    if (e.y > H * T) e.alive = false;

    // contacto con el jugador
    if (overlaps(p, e)) {
      if (p.vy > 60 && p.y + p.h - e.y < 12) {
        e.alive = false; e.flat = 0.6;
        p.vy = g.input.keys.jump ? -360 : -240;
        g.stats.bugs++;
        g.sfx('stomp');
        g.popup('BUG FIXED!', e.x + 7, e.y - 6, '#7EF0A0');
        g.burst(e.x + 7, e.y + 5, '#3FA34D');
        g.emitHud();
      } else {
        g.hurt(false);
      }
    }
  }
}
