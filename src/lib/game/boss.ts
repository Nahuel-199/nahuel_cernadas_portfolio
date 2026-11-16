import { T } from './constants';
import { ARENA, setGate } from './level';
import { moveBody, overlaps } from './physics';
import type { GameEngine } from './engine';
import type { Boss } from './types';

export const BOSS_HP = 3;

export function createBoss(alive = true, dead = 0): Boss {
  return {
    x: 224 * T, y: 14 * T - 30, w: 40, h: 30, vx: 0, vy: 0, onGround: false,
    hp: BOSS_HP, inv: 0, jumpT: 1.6, jumping: false, alive, dead, face: -1, anim: 0,
  };
}

/** Vuelve al jefe a su posición y vida inicial, conservando si ya fue derrotado. */
export function resetBoss(g: GameEngine): void {
  g.boss = createBoss(g.boss.alive, g.boss.dead);
  g.bossFight = false;
  g.shots = [];
  g.emitBoss(false);
}

/** PROD-500: persigue, salta, y al caer lanza dos ondas de error. */
export function updateBoss(g: GameEngine, dt: number): void {
  const p = g.player;
  const b = g.boss;
  if (!b.alive) { if (b.dead > 0) b.dead -= dt; return; }

  if (!g.bossFight) {
    if (p.x > (ARENA.x0 + 3) * T && p.onGround) {
      g.bossFight = true;
      g.checkpointX = (ARENA.x0 + 2) * T;
      g.emitBoss(true);
      g.sfx('hurt');
      g.popup('¡PROD-500 ATACA!', b.x + 20, b.y - 16, '#E5484D');
      g.emit('announce', 'Jefe final: PROD-500. Saltale encima tres veces.');
    }
    return;
  }

  const rage = BOSS_HP - b.hp;
  b.anim += dt;
  if (b.inv > 0) b.inv -= dt;
  if (b.onGround) {
    b.face = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;
    b.vx = b.face * (45 + rage * 30);
    b.jumpT -= dt;
    if (b.jumpT <= 0) { b.vy = -340 - rage * 25; b.jumping = true; b.jumpT = 2.3 - rage * 0.45; }
  }
  b.vy = Math.min(600, b.vy + 1200 * dt);
  moveBody(b, dt, g.grid);
  if (b.x < ARENA.x0 * T) b.x = ARENA.x0 * T;
  if (b.x + b.w > ARENA.gate * T) b.x = ARENA.gate * T - b.w;

  if (b.onGround && b.jumping) {
    b.jumping = false;
    g.camera.shake(0.25);
    g.sfx('thud');
    const sp = 120 + rage * 35;
    g.shots.push({ x: b.x - 8, y: 14 * T - 9, w: 10, h: 9, vx: -sp });
    g.shots.push({ x: b.x + b.w - 2, y: 14 * T - 9, w: 10, h: 9, vx: sp });
  }

  // contacto con el jugador
  if (overlaps(p, b)) {
    if (p.vy > 40 && p.y + p.h - b.y < 16) {
      if (b.inv <= 0) {
        b.hp--; b.inv = 1.0; p.vy = -420;
        g.sfx('stomp'); g.camera.shake(0.2); g.burst(b.x + 20, b.y + 6, '#3FA34D');
        g.popup(b.hp > 0 ? '-1 HP' : '¡BUG GIGANTE ARREGLADO!', b.x + 20, b.y - 10, '#7EF0A0');
        g.emitBoss(true);
        if (b.hp <= 0) defeatBoss(g);
      } else {
        p.vy = -300;
      }
    } else if (b.inv <= 0) {
      g.hurt(false);
    }
  }

  // ondas de error
  for (const sh of g.shots) {
    sh.x += sh.vx * dt;
    if (sh.x < ARENA.x0 * T - 10 || sh.x > ARENA.gate * T) sh.gone = true;
    if (!sh.gone && overlaps(p, sh)) { sh.gone = true; g.hurt(false); }
  }
  g.shots = g.shots.filter((sh) => !sh.gone);
}

function defeatBoss(g: GameEngine): void {
  const b = g.boss;
  b.alive = false; b.dead = 1.2;
  g.bossFight = false; g.shots = [];
  g.stats.boss = true; g.stats.bugs++;
  for (let i = 0; i < 4; i++) g.burst(b.x + 8 + i * 8, b.y + 10, i % 2 ? '#3FA34D' : '#F7C948');
  setGate(g.grid, false);
  for (let gy = 4; gy <= 13; gy++) g.particles.push({ x: ARENA.gate * T + 8, y: gy * T + 8, vx: 60, vy: -80, t: 0, color: '#F7C948' });
  g.sfx('win');
  g.emitBoss(false);
  g.emitHud();
  g.emit('toast', '¡JEFE DERROTADO! LA COMPUERTA SE ABRIÓ');
  g.emit('announce', 'Jefe derrotado. La compuerta se abrió.');
}
