import { Archivo, Press_Start_2P } from 'next/font/google';

/** Fuente pixel: títulos, HUD y textos dentro del canvas. */
export const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
});

/** Fuente de lectura: párrafos de los capítulos. */
export const archivo = Archivo({
  weight: ['400', '600', '800'],
  subsets: ['latin'],
  variable: '--font-archivo',
});
