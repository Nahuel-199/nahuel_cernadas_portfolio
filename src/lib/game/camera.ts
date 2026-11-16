import { T, VH, VW, W } from './constants';
import { ARENA } from './level';

export class Camera {
  x = 0;
  shakeT = 0;

  reset(): void {
    this.x = 0;
    this.shakeT = 0;
  }

  shake(seconds: number): void {
    this.shakeT = seconds;
  }

  /** Sigue al jugador (o se fija en la arena durante la pelea con el jefe). */
  follow(playerX: number, bossFight: boolean, dt: number): void {
    const target = bossFight ? ARENA.x0 * T - 8 : Math.max(0, Math.min(W * T - VW, playerX - VW * 0.38));
    this.x += (target - this.x) * Math.min(1, dt * 6);
  }

  tickShake(dt: number): void {
    if (this.shakeT > 0) this.shakeT -= dt;
  }

  /** Desplazamiento aleatorio de la sacudida, o null si no hay. */
  shakeOffset(): [number, number] | null {
    if (this.shakeT <= 0) return null;
    return [Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 3)];
  }
}

/** Tamaño CSS del canvas para una ventana dada (escala entera a media unidad cuando entra ≥2×). */
export function fitScale(screenW: number, screenH: number): { width: number; height: number } {
  let s = Math.min(screenW / VW, screenH / VH);
  if (s >= 2) s = Math.floor(s * 2) / 2;
  return { width: Math.floor(VW * s), height: Math.floor(VH * s) };
}
