import { drawBuilding } from './buildings';
import { CAMY, GS, H, SC, T, VH, VW, W } from './constants';
import { drawText } from './draw-utils';
import { DOORS, FLAG_X, Tile } from './level';
import type { GameEngine } from './engine';
import type { Sprites } from './sprites';

export class Renderer {
  private readonly sky: CanvasGradient;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly spr: Sprites,
    private readonly font: string,
  ) {
    this.sky = ctx.createLinearGradient(0, 0, 0, VH);
    this.sky.addColorStop(0, '#5FB1F5');
    this.sky.addColorStop(1, '#BFE6FF');
  }

  draw(g: GameEngine): void {
    const ctx = this.ctx;
    const cam = g.camera.x;
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    const shake = g.camera.shakeOffset();
    if (shake) ctx.translate(shake[0], shake[1]);
    ctx.imageSmoothingEnabled = false;

    this.drawBackground(cam);
    ctx.save();
    ctx.translate(0, -CAMY);
    for (const d of DOORS) drawBuilding(ctx, this.font, d, cam);
    this.drawFlag(g.flagReached, cam);
    this.drawTiles(g, cam);
    this.drawEntities(g, cam);
    ctx.restore();

    if (!g.started) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, VW, VH); }
  }

  private text(t: string, x: number, y: number, size: number, color: string): void {
    drawText(this.ctx, this.font, t, x, y, size, color);
  }

  private cloud(x: number, y: number, s: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y + 6 * s, 40 * s, 8 * s); ctx.fillRect(x + 6 * s, y + 2 * s, 14 * s, 6 * s); ctx.fillRect(x + 16 * s, y, 14 * s, 8 * s);
    ctx.fillStyle = '#D6ECFF'; ctx.fillRect(x, y + 12 * s, 40 * s, 2 * s);
  }

  private drawBackground(cam: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = this.sky; ctx.fillRect(0, 0, VW, VH);

    // nubes
    const span = W * T * 0.3;
    for (let i = 0; i < 12; i++) {
      const cx = (((i * 173 - cam * 0.15) % span) + span) % span - 60;
      this.cloud(Math.round((cx * 1.6) % (VW + 120)) - 60 + (i % 3) * 10, 18 + (i % 4) * 16, 1 + (i % 2) * 0.5);
    }

    // ciudad lejana con el Obelisco
    const off = -cam * 0.3;
    ctx.fillStyle = '#9CC6E8';
    for (let b = 0; b < 60; b++) {
      const bx = Math.round(off + b * 34), bh = 40 + ((b * 53) % 60);
      if (bx > -40 && bx < VW + 40) ctx.fillRect(bx, GS - bh, 28, bh);
    }
    for (let o = 0; o < 4; o++) {
      const ox = Math.round(off + 260 + o * 900);
      if (ox > -30 && ox < VW + 30) {
        ctx.fillStyle = '#86B4DA'; ctx.beginPath();
        ctx.moveTo(ox, GS); ctx.lineTo(ox + 6, GS - 104); ctx.lineTo(ox + 10, GS - 114); ctx.lineTo(ox + 14, GS - 104); ctx.lineTo(ox + 20, GS);
        ctx.fill();
      }
    }

    // colinas
    ctx.fillStyle = '#5DBB63';
    for (let h = 0; h < 30; h++) {
      const hx = Math.round(-cam * 0.55 + h * 140);
      if (hx > -120 && hx < VW + 120) { ctx.beginPath(); ctx.ellipse(hx, GS, 70, 34 + (h % 3) * 8, 0, Math.PI, 0); ctx.fill(); }
    }
  }

  private drawFlag(reached: boolean, cam: number): void {
    const ctx = this.ctx;
    const fx = FLAG_X * T - Math.round(cam);
    if (fx <= -40 || fx >= VW + 40) return;
    ctx.fillStyle = '#111'; ctx.fillRect(fx + 6, 3 * T, 4, 11 * T);
    ctx.fillStyle = '#E9F1F8'; ctx.fillRect(fx + 7, 3 * T, 2, 11 * T);
    ctx.fillStyle = '#F7C948'; ctx.beginPath(); ctx.arc(fx + 8, 3 * T, 4, 0, Math.PI * 2); ctx.fill();
    const fy = reached ? 12 * T : 3 * T + 4;
    ctx.fillStyle = '#2EA043'; ctx.beginPath(); ctx.moveTo(fx + 10, fy); ctx.lineTo(fx + 34, fy + 8); ctx.lineTo(fx + 10, fy + 16); ctx.fill();
    this.text('</>', fx + 19, fy + 8, 5, '#fff');
  }

  private drawTiles(g: GameEngine, cam: number): void {
    const { grid, time } = g;
    const tiles = this.spr.tiles;
    const x0 = Math.floor(cam / T), x1 = Math.min(W - 1, x0 + Math.ceil(VW / T) + 1), ox = Math.round(cam);
    for (let y = 0; y < H; y++)
      for (let x = x0; x <= x1; x++) {
        const t = grid[y][x];
        if (!t) continue;
        let img: HTMLCanvasElement;
        switch (t) {
          case Tile.Dirt: img = y > 0 && grid[y - 1][x] === Tile.Dirt ? tiles.dirt : tiles.grass; break;
          case Tile.Brick: img = tiles.brick; break;
          case Tile.Code: img = tiles.code; break;
          case Tile.Power: img = tiles.power; break;
          case Tile.Gate: img = tiles.gate; break;
          case Tile.Used: img = tiles.used; break;
          case Tile.Wood: img = tiles.wood; break;
          default: img = tiles.stone;
        }
        const bob = t === Tile.Code || t === Tile.Power ? Math.round(Math.sin(time * 4 + x) * 0.6) : 0;
        this.ctx.drawImage(img, x * T - ox, y * T + bob);
      }
  }

  private drawEntities(g: GameEngine, cam: number): void {
    const ctx = this.ctx;
    const spr = this.spr;

    // plataformas móviles
    for (const m of g.movers) {
      const mx = Math.round(m.x - cam);
      for (let i = 0; i < m.w / T; i++) ctx.drawImage(spr.tiles.wood, mx + i * T, m.y);
    }

    // commits
    for (const c of g.commits) {
      if (c.got) continue;
      const cx = Math.round(c.x - cam);
      if (cx < -10 || cx > VW + 10) continue;
      ctx.drawImage(spr.commit, cx - 5, Math.round(c.y - 5 + Math.sin(g.time * 3 + c.x) * 1.5));
    }

    // enemigos
    for (const e of g.enemies) {
      const ex = Math.round(e.x - cam) - 1;
      if (ex < -20 || ex > VW + 20) continue;
      if (!e.alive) { if (e.flat > 0) ctx.drawImage(spr.bugFlat, ex, Math.round(e.y) - 1); continue; }
      const img = Math.floor(e.anim * 6) % 2 ? spr.bug1 : spr.bug2;
      if (e.vx > 0) { ctx.save(); ctx.translate(ex + 16, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, Math.round(e.y) - 1); ctx.restore(); }
      else ctx.drawImage(img, ex, Math.round(e.y) - 1);
    }

    // jefe final y sus ondas
    const boss = g.boss;
    if (boss.alive || boss.dead > 0) {
      const bx = Math.round(boss.x - cam), by = Math.round(boss.y);
      if (boss.alive) {
        if (!(boss.inv > 0 && Math.floor(boss.inv * 14) % 2)) {
          const img = Math.floor(boss.anim * 6) % 2 ? spr.bug1 : spr.bug2;
          if (boss.face > 0) { ctx.save(); ctx.translate(bx + 40, by); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, 40, 30); ctx.restore(); }
          else ctx.drawImage(img, bx, by, 40, 30);
          ctx.fillStyle = '#E5484D'; ctx.fillRect(bx + 12, by - 4, 16, 5);
          ctx.fillStyle = '#111'; ctx.fillRect(bx + 14, by - 6, 2, 2); ctx.fillRect(bx + 19, by - 7, 2, 3); ctx.fillRect(bx + 24, by - 6, 2, 2);
        }
        this.text('PROD-500', bx + 20, by - 12, 5, '#FFB4B4');
      } else {
        ctx.globalAlpha = Math.max(0, boss.dead / 1.2); ctx.drawImage(spr.bugFlat, bx, by, 40, 30); ctx.globalAlpha = 1;
      }
    }
    for (const sh of g.shots) {
      const sx = Math.round(sh.x - cam), sy = Math.round(sh.y);
      ctx.fillStyle = '#111'; ctx.fillRect(sx - 1, sy - 1, sh.w + 2, sh.h + 2);
      ctx.fillStyle = '#E5484D'; ctx.fillRect(sx, sy, sh.w, sh.h);
      ctx.fillStyle = '#fff'; ctx.fillRect(sx + 4, sy + 2, 2, 3); ctx.fillRect(sx + 4, sy + 6, 2, 1);
    }

    // notebooks
    for (const it of g.items) ctx.drawImage(spr.notebook, Math.round(it.x - cam), Math.round(it.y));

    // jugador (modo JR o SR)
    const p = g.player;
    if (!(p.inv > 0 && Math.floor(p.inv * 12) % 2)) {
      const pose = !p.onGround ? 'jump' : Math.abs(p.vx) > 5 ? (Math.floor(p.anim) % 2 ? 'run1' : 'run2') : 'idle';
      const img = p.face > 0 ? spr.player[pose].r : spr.player[pose].l;
      let sc = p.big ? 1.5 : 1;
      if (g.growT > 0) sc = Math.floor(g.growT * 10) % 2 ? 1.5 : 1;
      const dw = img.width * sc, dh = img.height * sc;
      ctx.drawImage(img, Math.round(p.x + p.w / 2 - dw / 2 - cam), Math.round(p.y + p.h - dh), dw, dh);
    }

    // partículas y textos
    for (const q of g.particles) { ctx.fillStyle = q.color; ctx.fillRect(Math.round(q.x - cam), Math.round(q.y), 2, 2); }
    for (const u of g.popups) {
      ctx.globalAlpha = Math.max(0, 1 - u.t / 1.1);
      this.text(u.text, Math.round(u.x - cam), Math.round(u.y), 6, u.color);
      ctx.globalAlpha = 1;
    }
  }
}
