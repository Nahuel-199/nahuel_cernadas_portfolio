import { GameAudio, type Sfx } from './audio';
import { createBoss, resetBoss, updateBoss, BOSS_HP } from './boss';
import { Camera } from './camera';
import { CANVAS_H, CANVAS_W, H, MAX_DT, PLAYER_PHYS, PLAYER_SIZE, T } from './constants';
import { addBurst, addPopup, updateParticles, updatePopups } from './effects';
import { createEnemies, updateEnemies } from './enemies';
import { Input, keyToAction, type Action } from './input';
import {
  DOORS, FLAG_X, PLAYER_START, RESPAWN_Y, TECH, TOTAL_CHAPTERS, TOTAL_COMMITS, TOTAL_STACK, Tile,
  buildGrid, createCommits, createMovers,
} from './level';
import { moveBody } from './physics';
import { shrink, spawnNotebook, updateItems } from './powerups';
import { Renderer } from './render';
import { createSprites } from './sprites';
import type {
  Boss, Commit, Enemy, GameEvents, Grid, HudState, Item, Mover, Particle, Player, Popup, Shot, Stats,
} from './types';

export const MAX_LIVES = 3;

type Listener<K extends keyof GameEvents> = (payload: GameEvents[K]) => void;
// Almacenamiento sin tipar por evento; `on`/`emit` garantizan la correspondencia.
type AnyListener = (payload: never) => void;

export interface EngineOptions {
  /** `font-family` de Press Start 2P (de next/font) para los textos del canvas. */
  fontFamily: string;
  /** Sin sacudidas de pantalla (prefers-reduced-motion). */
  reduceMotion?: boolean;
}

function createPlayer(): Player {
  return {
    x: PLAYER_START.x, y: PLAYER_START.y, w: PLAYER_SIZE.small.w, h: PLAYER_SIZE.small.h,
    vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, buf: 0, inv: 0, anim: 0, standing: null, big: false,
  };
}

function createStats(): Stats {
  return { commits: 0, stack: [], bugs: 0, chapters: Array(TOTAL_CHAPTERS).fill(false), deaths: 0, elapsed: 0, boss: false };
}

/**
 * Motor del juego. No toca el DOM fuera del canvas: avisa a la UI con eventos (`on`)
 * y la UI lo controla con `start`, `openOverlay`/`closeOverlay`, `restart`, `enterDoor`, etc.
 */
export class GameEngine {
  // ---- estado del nivel ----
  grid: Grid = buildGrid();
  player: Player = createPlayer();
  enemies: Enemy[] = [];
  items: Item[] = [];
  boss: Boss = createBoss();
  bossFight = false;
  shots: Shot[] = [];
  movers: Mover[] = [];
  commits: Commit[] = [];
  popups: Popup[] = [];
  particles: Particle[] = [];
  stats: Stats = createStats();
  lives = MAX_LIVES;
  checkpointX: number = PLAYER_START.x;
  flagReached = false;
  nearDoor = -1;
  growT = 0;
  /** Reloj para animaciones (sigue corriendo en pausa). */
  time = 0;

  // ---- subsistemas ----
  readonly camera = new Camera();
  readonly input = new Input();
  readonly audio = new GameAudio();
  private readonly renderer: Renderer;

  // ---- control ----
  started = false;
  paused = true;
  private overlayOpen = false;
  private last = 0;
  private raf = 0;
  private destroyed = false;
  private listeners = new Map<keyof GameEvents, Set<AnyListener>>();

  constructor(canvas: HTMLCanvasElement, private readonly opts: EngineOptions) {
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D no disponible');
    ctx.imageSmoothingEnabled = false;
    this.renderer = new Renderer(ctx, createSprites(), opts.fontFamily);
    this.camera.reduceMotion = !!opts.reduceMotion;
    this.reset();
  }

  // ======================= CICLO DE VIDA =======================

  /** Engancha el teclado y arranca el loop cuando la fuente pixel está lista (máx. 2 s). */
  mount(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    const ready = document.fonts?.load ? document.fonts.load(`8px ${this.opts.fontFamily}`) : Promise.resolve();
    Promise.race([ready, new Promise((r) => setTimeout(r, 2000))])
      .catch(() => {})
      .then(() => {
        if (this.destroyed) return;
        this.last = performance.now();
        this.raf = requestAnimationFrame(this.frame);
      });
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.audio.close();
    this.listeners.clear();
  }

  private frame = (now: number): void => {
    if (this.destroyed) return;
    const dt = Math.min(MAX_DT, (now - this.last) / 1000);
    this.last = now;
    if (this.started && !this.paused) this.update(dt);
    else this.time += dt;
    this.renderer.draw(this);
    this.raf = requestAnimationFrame(this.frame);
  };

  // ======================= API PARA LA UI =======================

  on<K extends keyof GameEvents>(type: K, fn: Listener<K>): () => void {
    let set = this.listeners.get(type);
    if (!set) { set = new Set(); this.listeners.set(type, set); }
    const s = set;
    s.add(fn as AnyListener);
    return () => { s.delete(fn as AnyListener); };
  }

  emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]): void {
    this.listeners.get(type)?.forEach((fn) => (fn as Listener<K>)(payload));
  }

  /** Empieza la partida (debe venir de un gesto del usuario por el audio). */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.paused = false;
    this.audio.init();
    this.last = performance.now();
    this.emit('start', null);
  }

  /** Un diálogo se abrió: pausa y suelta las teclas. */
  openOverlay(): void {
    this.overlayOpen = true;
    this.paused = true;
    this.input.clearKeys();
  }

  /** El diálogo se cerró: sigue el juego si ya había empezado. */
  closeOverlay(): void {
    this.overlayOpen = false;
    if (this.started) this.paused = false;
    this.last = performance.now();
  }

  /** Vuelve al inicio del nivel con todo en cero. */
  restart(): void {
    this.reset();
    this.closeOverlay();
    this.emit('toast', 'JUEGO REINICIADO · ¡SUERTE!');
    this.sfx('door');
  }

  /** Entra a la puerta cercana (botón del aviso en pantalla). */
  enterDoor(): void {
    if (this.nearDoor >= 0) this.openChapter(DOORS[this.nearDoor].ch);
  }

  setMuted(muted: boolean): void {
    this.audio.setMuted(muted);
  }

  /** Controles táctiles. */
  press(a: Action): void { this.input.press(a); }
  release(a: Action): void { this.input.release(a); }

  hud(): HudState {
    return {
      lives: this.lives,
      maxLives: MAX_LIVES,
      commits: this.stats.commits,
      totalCommits: TOTAL_COMMITS,
      stack: this.stats.stack.length,
      totalStack: TOTAL_STACK,
      bugs: this.stats.bugs,
      chapters: this.stats.chapters.filter(Boolean).length,
      totalChapters: TOTAL_CHAPTERS,
      senior: this.player.big,
    };
  }

  // ======================= TECLADO =======================

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.overlayOpen) return; // el diálogo maneja sus propias teclas
    if (!this.started) {
      if (e.key === 'Enter') { this.start(); e.preventDefault(); }
      return;
    }
    const a = keyToAction(e.key);
    if (!a) return;
    e.preventDefault();
    this.input.press(a);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const a = keyToAction(e.key);
    if (a) this.input.release(a);
  };

  // ======================= AYUDANTES (usados por los módulos) =======================

  sfx(type: Sfx): void { this.audio.play(type); }
  popup(text: string, x: number, y: number, color?: string): void { addPopup(this.popups, text, x, y, color); }
  burst(x: number, y: number, color: string): void { addBurst(this.particles, x, y, color); }
  emitHud(): void { this.emit('hud', this.hud()); }
  emitBoss(visible: boolean): void { this.emit('boss', { visible, hp: this.boss.hp, maxHp: BOSS_HP }); }

  // ======================= ESTADO =======================

  private reset(): void {
    this.grid = buildGrid();
    this.player = createPlayer();
    this.items = [];
    this.growT = 0;
    this.boss = createBoss(true, 0);
    this.bossFight = false;
    this.shots = [];
    this.emitBoss(false);
    this.enemies = createEnemies();
    this.popups = [];
    this.particles = [];
    this.checkpointX = PLAYER_START.x;
    this.lives = MAX_LIVES;
    this.flagReached = false;
    this.camera.reset();
    this.nearDoor = -1;
    this.emit('door', null);
    this.movers = createMovers();
    this.input.reset();
    this.stats = createStats();
    this.commits = createCommits();
    this.emitHud();
  }

  /** Golpe de cabeza contra un tile. */
  private bump(tx: number, ty: number): void {
    const t = this.grid[ty][tx];
    if (t === Tile.Code) {
      this.grid[ty][tx] = Tile.Used;
      const name = TECH[`${tx},${ty}`];
      if (name && !this.stats.stack.includes(name)) this.stats.stack.push(name);
      this.popup(name || '+1', tx * T + 8, ty * T - 4, '#F7C948');
      this.sfx('block'); this.sfx('coin');
      if (this.stats.stack.length === TOTAL_STACK) this.popup('¡STACK COMPLETO!', tx * T + 8, ty * T - 20, '#7EF0A0');
      this.emitHud();
    } else if (t === Tile.Power) {
      this.grid[ty][tx] = Tile.Used;
      this.sfx('block'); this.sfx('power');
      spawnNotebook(this, tx, ty);
      this.popup('¡NOTEBOOK!', tx * T + 8, ty * T - 6, '#93C5FD');
    } else if (t === Tile.Brick && this.player.big) {
      this.grid[ty][tx] = Tile.Empty;
      this.sfx('break');
      for (let i = 0; i < 6; i++)
        this.particles.push({ x: tx * T + 8, y: ty * T + 8, vx: (i % 2 ? 1 : -1) * (40 + i * 12), vy: -120 - i * 20, t: 0, color: '#C8693A' });
    } else {
      this.sfx('thud');
    }
  }

  hurt(fell: boolean): void {
    const p = this.player;
    if (p.inv > 0 && !fell) return;
    if (!fell && p.big) {
      shrink(this); p.inv = PLAYER_PHYS.invulnerable; this.sfx('hurt');
      this.popup('MODO JR', p.x + 6, p.y - 6, '#E5484D');
      return;
    }
    if (fell) shrink(this);
    this.lives--; this.stats.deaths++; this.sfx('hurt');
    this.popup('-1', p.x + 6, p.y - 6, '#E5484D');
    if (this.lives <= 0) {
      this.lives = MAX_LIVES;
      this.emit('toast', 'GAME OVER · Continuás desde el último capítulo');
    }
    if (fell || this.lives === MAX_LIVES) {
      p.x = this.checkpointX; p.y = RESPAWN_Y; p.vx = 0; p.vy = 0;
      if (this.bossFight) resetBoss(this);
    } else {
      p.vy = -220; p.vx = -p.face * 120;
    }
    p.inv = PLAYER_PHYS.invulnerable;
    this.emitHud();
  }

  private openChapter(ch: number): void {
    this.stats.chapters[ch] = true;
    this.emitHud();
    this.sfx('door');
    this.emit('chapter', ch);
  }

  private levelComplete(): void {
    this.flagReached = true;
    this.sfx('win');
    this.emit('complete', {
      time: Math.round(this.stats.elapsed * 10) / 10,
      commits: this.stats.commits,
      totalCommits: TOTAL_COMMITS,
      stack: this.stats.stack.length,
      totalStack: TOTAL_STACK,
      bugs: this.stats.bugs,
    });
  }

  // ======================= UPDATE =======================

  private update(dt: number): void {
    const P = PLAYER_PHYS;
    const keys = this.input.keys;
    this.time += dt;

    // plataformas móviles
    for (const m of this.movers) {
      m.prevX = m.x;
      m.x += m.dir * m.speed * dt;
      if (m.x > m.x1) { m.x = m.x1; m.dir = -1; }
      if (m.x < m.x0) { m.x = m.x0; m.dir = 1; }
    }

    const p = this.player;
    const accel = p.onGround ? P.accelGround : P.accelAir;
    const max = keys.run ? P.maxRun : P.maxWalk;
    if (keys.left && !keys.right) { p.vx = Math.max(-max, p.vx - accel * dt); p.face = -1; }
    else if (keys.right && !keys.left) { p.vx = Math.min(max, p.vx + accel * dt); p.face = 1; }
    else {
      const fr = (p.onGround ? P.frictionGround : P.frictionAir) * dt;
      p.vx = Math.abs(p.vx) <= fr ? 0 : p.vx - Math.sign(p.vx) * fr;
    }

    // salto con tiempo de gracia (coyote) y buffer
    p.coyote = p.onGround || p.standing ? P.coyote : Math.max(0, p.coyote - dt);
    p.buf = this.input.jumpPressed ? P.jumpBuffer : Math.max(0, p.buf - dt);
    this.input.jumpPressed = false;
    if (p.buf > 0 && p.coyote > 0) { p.vy = P.jumpVel; p.buf = 0; p.coyote = 0; p.standing = null; this.sfx('jump'); }
    if (!keys.jump && p.vy < P.jumpCut) p.vy = P.jumpCut;
    p.vy = Math.min(P.maxFall, p.vy + P.gravity * dt);

    // arrastre de la plataforma móvil
    if (p.standing) p.x += p.standing.x - p.standing.prevX;
    p.standing = null;
    moveBody(p, dt, this.grid, (tx, ty) => this.bump(tx, ty));
    for (const m of this.movers) {
      const pb = p.y + p.h;
      if (p.vy >= 0 && p.x + p.w > m.x && p.x < m.x + m.w && pb >= m.y && pb - p.vy * dt <= m.y + 4) {
        p.y = m.y - p.h; p.vy = 0; p.onGround = true; p.standing = m;
      }
    }
    if (p.x < 0) p.x = 0;

    // caída al vacío
    if (p.y > H * T + 30) this.hurt(true);
    if (p.inv > 0) p.inv -= dt;

    // checkpoint: última puerta pasada
    for (const d of DOORS) if (p.x > d.x * T && d.x * T > this.checkpointX - 1 && p.onGround) this.checkpointX = d.x * T;

    updateEnemies(this, dt);
    updateBoss(this, dt);
    this.camera.tickShake(dt);
    this.stats.elapsed += dt;
    updateItems(this, dt);

    // commits
    for (const c of this.commits) {
      if (c.got) continue;
      if (Math.abs(p.x + p.w / 2 - c.x) < 11 && Math.abs(p.y + p.h / 2 - c.y) < 15) {
        c.got = true; this.stats.commits++; this.sfx('coin'); this.burst(c.x, c.y, '#2EA043'); this.emitHud();
      }
    }

    // puertas
    let nd = -1;
    DOORS.forEach((d, i) => { if (Math.abs(p.x + p.w / 2 - (d.x * T + 8)) < 16 && p.onGround) nd = i; });
    if (nd !== this.nearDoor) {
      this.nearDoor = nd;
      this.emit('door', nd >= 0 ? DOORS[nd].ch : null);
    }
    if (this.input.actPressed && this.nearDoor >= 0) this.openChapter(DOORS[this.nearDoor].ch);
    this.input.actPressed = false;

    // bandera
    if (!this.flagReached && p.x + p.w > FLAG_X * T + 6 && p.x < FLAG_X * T + 10) this.levelComplete();

    // animación
    if (!p.onGround) p.anim = 0;
    else if (Math.abs(p.vx) > 5) p.anim += dt * (Math.abs(p.vx) / 12);
    else p.anim = 0;

    this.popups = updatePopups(this.popups, dt);
    this.particles = updateParticles(this.particles, dt);

    this.camera.follow(p.x, this.bossFight, dt);
  }
}
