import { T, VH, VW, W } from './constants';
import { ARENA } from './level';

export class Camera {
  x = 0;
  shakeT = 0;
  /** prefers-reduced-motion: la sacudida no se dibuja (la lógica no cambia). */
  reduceMotion = false;
  /** Ancho lógico de la vista (400; más angosto en celular vertical). Solo afecta a la cámara y al dibujo. */
  viewW: number = VW;

  reset(): void {
    this.x = 0;
    this.shakeT = 0;
  }

  shake(seconds: number): void {
    this.shakeT = seconds;
  }

  /** Sigue al jugador (o se fija en la arena durante la pelea con el jefe). */
  follow(playerX: number, bossFight: boolean, dt: number): void {
    const vw = this.viewW;
    const target = bossFight ? ARENA.x0 * T - 8 : Math.max(0, Math.min(W * T - vw, playerX - vw * 0.38));
    this.x += (target - this.x) * Math.min(1, dt * 6);
  }

  tickShake(dt: number): void {
    if (this.shakeT > 0) this.shakeT -= dt;
  }

  /** Desplazamiento aleatorio de la sacudida, o null si no hay. */
  shakeOffset(): [number, number] | null {
    if (this.shakeT <= 0 || this.reduceMotion) return null;
    return [Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 3)];
  }
}

/** Tamaño CSS del canvas para una ventana dada (escala entera a media unidad cuando entra ≥2×). */
export function fitScale(screenW: number, screenH: number): { width: number; height: number } {
  let s = Math.min(screenW / VW, screenH / VH);
  if (s >= 2) s = Math.floor(s * 2) / 2;
  return { width: Math.floor(VW * s), height: Math.floor(VH * s) };
}

/** Ancho lógico de la vista en celular vertical: más angosta para que el juego se vea más grande. */
export const PORTRAIT_VIEW_W = 270;

/** Ancho de vista para celular vertical. Con `bossFight` vuelve al completo: la arena ocupa los 400 px. */
export function portraitViewWidth(bossFight: boolean): number {
  return bossFight ? VW : PORTRAIT_VIEW_W;
}

/** Tamaño CSS del canvas en celular vertical para una vista de `viewW` px lógicos, sin pasarse de `maxH`. */
export function fitPortrait(screenW: number, maxH: number, viewW: number): { width: number; height: number } {
  const s = Math.max(0.5, Math.min(screenW / viewW, maxH / VH));
  return { width: Math.floor(viewW * s), height: Math.floor(VH * s) };
}
