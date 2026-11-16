/** Texto pixel con sombra negra de 1px. */
export function drawText(
  ctx: CanvasRenderingContext2D, font: string, t: string, x: number, y: number,
  size: number, color: string, align: CanvasTextAlign = 'center',
): void {
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000'; ctx.fillText(t, x + 1, y + 1);
  ctx.fillStyle = color; ctx.fillText(t, x, y);
}

/** Cartel con borde negro. */
export function drawSign(
  ctx: CanvasRenderingContext2D, font: string, text: string, x: number, y: number, w: number, bg: string, fg: string,
): void {
  ctx.fillStyle = '#111'; ctx.fillRect(x - 1, y - 1, w + 2, 16);
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, 14);
  drawText(ctx, font, text, x + w / 2, y + 7.5, 7, fg);
}

/** Puerta de 16×32 con picaporte. */
export function drawDoor(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = '#111'; ctx.fillRect(x - 1, y - 1, 18, 33);
  ctx.fillStyle = color; ctx.fillRect(x, y, 16, 32);
  ctx.fillStyle = '#F7C948'; ctx.fillRect(x + 12, y + 16, 2, 2);
}
