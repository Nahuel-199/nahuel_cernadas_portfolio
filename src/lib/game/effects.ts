import type { Particle, Popup } from './types';

export function addPopup(list: Popup[], text: string, x: number, y: number, color = '#fff'): void {
  list.push({ text, x, y, t: 0, color });
}

/** Explosión de 8 partículas en círculo. */
export function addBurst(list: Particle[], x: number, y: number, color: string): void {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    list.push({ x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 40, t: 0, color });
  }
}

export function updatePopups(list: Popup[], dt: number): Popup[] {
  for (const u of list) { u.t += dt; u.y -= 26 * dt; }
  return list.filter((u) => u.t < 1.1);
}

export function updateParticles(list: Particle[], dt: number): Particle[] {
  for (const q of list) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 300 * dt; }
  return list.filter((q) => q.t < 0.6);
}
