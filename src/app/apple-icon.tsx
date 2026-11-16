import { ImageResponse } from 'next/og';
import { PixelHead } from '@/lib/pixel-icon';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#7EC8FF' }}>
        <PixelHead px={9} />
      </div>
    ),
    size,
  );
}
