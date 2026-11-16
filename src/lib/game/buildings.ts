import { T, VW } from './constants';
import { drawDoor, drawSign, drawText } from './draw-utils';
import type { Door } from './types';

/** Edificio de cada capítulo, con su puerta en d.x. */
export function drawBuilding(ctx: CanvasRenderingContext2D, font: string, d: Door, cam: number): void {
  const dx = d.x * T - Math.round(cam);
  const gy = 14 * T;
  if (dx < -160 || dx > VW + 160) return;
  const text = (t: string, x: number, y: number, size: number, color: string) => drawText(ctx, font, t, x, y, size, color);
  const sign = (t: string, x: number, y: number, w: number, bg: string, fg: string) => drawSign(ctx, font, t, x, y, w, bg, fg);

  ctx.save();
  switch (d.kind) {
    case 'kiosk': {
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 17, gy - 63, 50, 63); ctx.fillStyle = '#E5484D'; ctx.fillRect(dx - 16, gy - 62, 48, 14); ctx.fillStyle = '#FFF4E0'; ctx.fillRect(dx - 16, gy - 48, 48, 48);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#fff' : '#E5484D'; ctx.fillRect(dx - 16 + k * 8, gy - 50, 8, 4); }
      drawDoor(ctx, dx, gy - 32, '#2F4E85'); sign('INICIO', dx - 16, gy - 62, 48, '#E5484D', '#fff');
      break;
    }
    case 'school': {
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 41, gy - 73, 98, 73); ctx.fillStyle = '#F7C948'; ctx.fillRect(dx - 40, gy - 72, 96, 72);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(dx - 48, gy - 71); ctx.lineTo(dx + 8, gy - 104); ctx.lineTo(dx + 64, gy - 71); ctx.fill();
      ctx.fillStyle = '#C93A2E'; ctx.beginPath(); ctx.moveTo(dx - 44, gy - 72); ctx.lineTo(dx + 8, gy - 102); ctx.lineTo(dx + 60, gy - 72); ctx.fill();
      for (const [wx, wy] of [[-32, -58], [24, -58], [-32, -30], [24, -30]]) {
        ctx.fillStyle = '#111'; ctx.fillRect(dx + wx - 1, gy + wy - 1, 18, 16); ctx.fillStyle = '#9ED8FF'; ctx.fillRect(dx + wx, gy + wy, 16, 14);
      }
      drawDoor(ctx, dx, gy - 32, '#2F4E85'); sign('HENRY 2021', dx - 32, gy - 66, 80, '#fff', '#111');
      break;
    }
    case 'studio': {
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 49, gy - 81, 114, 81); ctx.fillStyle = '#2F4E85'; ctx.fillRect(dx - 48, gy - 80, 112, 80);
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 41, gy - 73, 98, 36); ctx.fillStyle = '#fff'; ctx.fillRect(dx - 40, gy - 72, 96, 34);
      ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.moveTo(dx + 2, gy - 64); ctx.lineTo(dx + 16, gy - 55); ctx.lineTo(dx + 2, gy - 46); ctx.fill();
      ctx.fillStyle = '#E5484D'; ctx.fillRect(dx - 36, gy - 68, 24, 9); text('LIVE', dx - 24, gy - 63, 6, '#fff');
      for (let s = 0; s < 3; s++) {
        ctx.fillStyle = '#111'; ctx.fillRect(dx + 70 + s * 14, gy - 48 - s * 8, 12, 48 + s * 8);
        ctx.fillStyle = '#F7C948'; ctx.fillRect(dx + 73 + s * 14, gy - 42 - s * 8, 3, 3);
      }
      drawDoor(ctx, dx, gy - 32, '#111');
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 14, gy - 84, 3, 6); ctx.fillRect(dx + 27, gy - 84, 3, 6);
      sign('WODEVA', dx - 24, gy - 98, 64, '#F7C948', '#111');
      break;
    }
    case 'depot': {
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 65, gy - 89, 146, 89); ctx.fillStyle = '#F2EBDD'; ctx.fillRect(dx - 64, gy - 88, 144, 88);
      ctx.fillStyle = '#E5484D'; ctx.fillRect(dx - 64, gy - 88, 144, 14);
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 57, gy - 49, 50, 49); ctx.fillStyle = '#8C93A3'; ctx.fillRect(dx - 56, gy - 48, 48, 48);
      for (let rl = 0; rl < 8; rl++) { ctx.fillStyle = '#6E7586'; ctx.fillRect(dx - 56, gy - 46 + rl * 6, 48, 1); }
      for (let pk = 0; pk < 4; pk++) {
        const ox = (pk % 2) * 18, oy = Math.floor(pk / 2) * 16;
        ctx.fillStyle = '#111'; ctx.fillRect(dx + 28 + ox, gy - 16 - oy, 16, 16);
        ctx.fillStyle = '#D9A066'; ctx.fillRect(dx + 29 + ox, gy - 15 - oy, 14, 14);
        ctx.fillStyle = '#8A5A34'; ctx.fillRect(dx + 35 + ox, gy - 15 - oy, 2, 14);
      }
      drawDoor(ctx, dx, gy - 32, '#2F4E85'); sign('MAILAMERICAS', dx - 62, gy - 88, 96, '#E5484D', '#fff');
      ctx.fillStyle = '#111'; ctx.fillRect(dx + 33, gy - 73, 42, 22); ctx.fillStyle = '#F7C948'; ctx.fillRect(dx + 34, gy - 72, 40, 20);
      text('360', dx + 54, gy - 62, 8, '#2F4E85');
      break;
    }
    case 'shop': {
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 41, gy - 77, 98, 77); ctx.fillStyle = '#C93A2E'; ctx.fillRect(dx - 40, gy - 76, 96, 76);
      for (let aw = 0; aw < 12; aw++) { ctx.fillStyle = aw % 2 ? '#fff' : '#E5484D'; ctx.fillRect(dx - 44 + aw * 9, gy - 52, 9, 10); }
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 44, gy - 42, 108, 2);
      ctx.fillStyle = '#111'; ctx.fillRect(dx + 21, gy - 35, 30, 28); ctx.fillStyle = '#9ED8FF'; ctx.fillRect(dx + 22, gy - 34, 28, 26);
      ctx.fillStyle = '#111'; ctx.fillRect(dx + 29, gy - 30, 14, 16); ctx.fillRect(dx + 26, gy - 30, 20, 5); ctx.fillStyle = '#F7C948'; ctx.fillRect(dx + 34, gy - 24, 4, 4);
      drawDoor(ctx, dx, gy - 32, '#111'); sign('NAKAMA CLUB', dx - 38, gy - 74, 92, '#111', '#fff');
      break;
    }
    case 'office': {
      ctx.fillStyle = '#111'; ctx.fillRect(dx - 49, gy - 153, 114, 153); ctx.fillStyle = '#3E4A6B'; ctx.fillRect(dx - 48, gy - 152, 112, 152);
      for (let wy = 0; wy < 6; wy++)
        for (let wx = 0; wx < 5; wx++) { ctx.fillStyle = (wx + wy) % 3 ? '#9ED8FF' : '#F7C948'; ctx.fillRect(dx - 40 + wx * 21, gy - 142 + wy * 18, 14, 11); }
      drawDoor(ctx, dx, gy - 32, '#F7C948'); sign('TU EQUIPO', dx - 30, gy - 50, 76, '#2EA043', '#fff');
      break;
    }
  }
  ctx.restore();
}
