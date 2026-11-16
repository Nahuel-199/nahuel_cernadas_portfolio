import { ImageResponse } from 'next/og';
import { PixelHead } from '@/lib/pixel-icon';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<PixelHead px={2} />, size);
}
