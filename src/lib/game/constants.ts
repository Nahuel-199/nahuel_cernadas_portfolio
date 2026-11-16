// Escala y tamaños (idénticos al prototipo docs/prototipo/plataformas.html)
export const SC = 3; // píxeles reales por píxel lógico
export const T = 16; // tamaño de tile
export const VW = 400; // ancho lógico de la vista
export const VH = 225; // alto lógico de la vista
export const W = 262; // ancho del nivel en tiles
export const H = 17; // alto del nivel en tiles
export const CAMY = H * T - VH; // desplazamiento vertical fijo de la cámara
export const GS = 14 * T - CAMY; // línea del suelo en coordenadas de pantalla (fondo)

export const CANVAS_W = VW * SC; // 1200
export const CANVAS_H = VH * SC; // 675

/** Física del jugador. */
export const PLAYER_PHYS = {
  accelGround: 1500,
  accelAir: 900,
  maxWalk: 125,
  maxRun: 190,
  frictionGround: 1400,
  frictionAir: 300,
  jumpVel: -430,
  jumpCut: -150, // velocidad máxima de subida al soltar el salto
  gravity: 1350,
  maxFall: 560,
  coyote: 0.09,
  jumpBuffer: 0.12,
  invulnerable: 1.4,
} as const;

/** Tamaño del jugador en modo JR y SR. */
export const PLAYER_SIZE = {
  small: { w: 12, h: 22 },
  big: { w: 16, h: 32 },
} as const;

/** Paso máximo de simulación (s). */
export const MAX_DT = 1 / 30;
