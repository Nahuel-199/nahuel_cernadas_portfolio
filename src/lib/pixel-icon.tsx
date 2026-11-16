import { HEAD, PAL } from '@/lib/game/sprites';

/** Cabeza del personaje (pixel art del juego) como grilla de divs para ImageResponse. */
export function PixelHead({ px }: { px: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {HEAD.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {Array.from(row, (ch, x) => (
            <div key={x} style={{ width: px, height: px, background: PAL[ch] ?? 'transparent' }} />
          ))}
        </div>
      ))}
    </div>
  );
}
