import { T } from './constants';

// Todo el pixel art se dibuja en canvases fuera de pantalla al iniciar el juego
// (requiere `document`, así que solo se llama del lado del cliente).

type Palette = Readonly<Record<string, string>>;
export type PlayerPose = 'idle' | 'run1' | 'run2' | 'jump';

export const PAL: Palette = {
  H: '#2B1C14', h: '#4A3324', S: '#F2C9A6', s: '#D9A47F', G: '#B9C7D6', E: '#1A1A1A', W: '#FFFFFF', B: '#5E4334', m: '#9A4F45',
  T: '#1C1C1C', t: '#3B3B3B', Y: '#F7C948', J: '#2F4E85', j: '#223A63', K: '#101010', R: '#E5484D',
};
export const HEAD = [
  '.....HHHHHH.....',
  '...HHHhHHHHHH...',
  '..HHHHHHHhHHHH..',
  '.HHhHHHHHHHHHHH.',
  '.HHHHHHhHHHHhHH.',
  '.HHSHHHSSHHHSHH.',
  '.HSSSSSSSSSSSSH.',
  '.SGGGGSSSSGGGGs.',
  '.SGEWGGSSGGEWGs.',
  '.SGEEGSSSSGEEGs.',
  '.SGGGGSSSSGGGGs.',
  '..SSSSSssSSSSS..',
  '..BSSBBBBBBSSB..',
  '..BBSSSmmSSSBB..',
  '...BBBBBBBBBB...',
  '.....SSSSSS.....',
];
const BODY = [
  '..TTTTTTTTTTTT..',
  '.TTTTTTTTTTYTTT.',
  'STTtTTTTTTTTtTTS',
  'STTtTTTTTTTTtTTS',
  'S.TTTTTTTTTTTT.S',
];
const LEGS: Record<PlayerPose, string[]> = {
  idle: ['..JJJJJJJJJJJ...', '..JJJJj..jJJJ...', '..JJJJ....JJJ...', '.KKKKK....KKKK..'],
  run1: ['..JJJJJJJJJJ....', '..JJJJ...jJJJ...', '.JJJJ......JJJ..', '.KKKK......KKKK.'],
  run2: ['...JJJJJJJJJ....', '....JJJJJJJ.....', '....JJJJJJ......', '....KKKKKK......'],
  jump: ['..JJJJJJJJJJJ...', '..JJJJJ.JJJJJ...', '..KKKK...KKKK...', '................'],
};

const BUG_PAL: Palette = { g: '#3FA34D', d: '#226B30', W: '#FFFFFF', E: '#111111', L: '#111111', R: '#E5484D' };
const BUG_TOP = [
  '....dddddddd....',
  '..ddggggggggdd..',
  '.dggWWggggWWggd.',
  '.dggWEggggWEggd.',
  'dggggggddggggggd',
  'dgggggdggdgggggd',
  'dggggggddggggggd',
  '.dggggggggggggd.',
  '..dddddddddddd..',
];
const BUG1_LEGS = ['.L..L..L..L..L..', 'L..L..L..L..L...', '................'];
const BUG2_LEGS = ['..L..L..L..L..L.', '...L..L..L..L..L', '................'];
const BUG_FLAT = [
  '................', '................', '................', '................', '................', '................', '................',
  '..dddddddddddd..',
  '.dggEggggggEggd.',
  'dggggggggggggggd',
  '.dddddddddddddd.',
  '................',
];
const NOTEBOOK = [
  '..KKKKKKKKKK..',
  '..KBBBBBBBBK..',
  '..KBWWBBBBBK..',
  '..KBBBWWWBBK..',
  '..KBWWBBBBBK..',
  '..KKKKKKKKKK..',
  '.GGGGGGGGGGGG.',
  'GgGgGgGgGgGgGG',
  'GGGGGGGGGGGGGG',
  '.KKKKKKKKKKKK.',
];
const NOTEBOOK_PAL: Palette = { K: '#111111', B: '#3B82F6', W: '#E8F1FF', G: '#C3CBD8', g: '#8A93A3' };

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (!g) throw new Error('Canvas 2D no disponible');
  return [c, g];
}

function pixelCanvas(rows: string[], pal: Palette): HTMLCanvasElement {
  const [c, g] = makeCanvas(rows[0].length, rows.length);
  for (let y = 0; y < rows.length; y++)
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch && ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); }
    }
  return c;
}

function flipCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const [c, g] = makeCanvas(src.width, src.height);
  g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
  return c;
}

function px(g: CanvasRenderingContext2D, c: string, x: number, y: number, w = 1, h = 1): void {
  g.fillStyle = c; g.fillRect(x, y, w, h);
}

function tileCanvas(draw: (g: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const [c, g] = makeCanvas(T, T);
  draw(g);
  return c;
}

function createTiles() {
  return {
    grass: tileCanvas((g) => {
      px(g, '#8A5A34', 0, 0, 16, 16); px(g, '#3FB34F', 0, 0, 16, 5); px(g, '#76D46F', 0, 0, 16, 2);
      for (let i = 0; i < 16; i += 3) px(g, '#2E8A3C', i, 5, 2, 1);
      for (const [x, y] of [[3, 9], [11, 8], [7, 12], [13, 13], [1, 14]]) px(g, '#6B4226', x, y, 2, 2);
    }),
    dirt: tileCanvas((g) => {
      px(g, '#8A5A34', 0, 0, 16, 16);
      for (const [x, y] of [[2, 3], [10, 2], [6, 7], [13, 9], [3, 12], [9, 13]]) px(g, '#6B4226', x, y, 2, 2);
    }),
    brick: tileCanvas((g) => {
      px(g, '#C8693A', 0, 0, 16, 16); px(g, '#5A2A12', 0, 0, 16, 1); px(g, '#5A2A12', 0, 7, 16, 1); px(g, '#5A2A12', 0, 15, 16, 1);
      px(g, '#5A2A12', 7, 0, 1, 7); px(g, '#5A2A12', 3, 8, 1, 7); px(g, '#5A2A12', 11, 8, 1, 7); px(g, '#E8956A', 1, 1, 5, 1); px(g, '#E8956A', 9, 1, 5, 1);
    }),
    code: tileCanvas((g) => {
      px(g, '#F7C948', 0, 0, 16, 16); px(g, '#111', 0, 0, 16, 1); px(g, '#111', 0, 15, 16, 1); px(g, '#111', 0, 0, 1, 16); px(g, '#111', 15, 0, 1, 16);
      px(g, '#FFE59A', 1, 1, 14, 1); px(g, '#B8860B', 1, 14, 14, 1);
      // </>
      px(g, '#111', 3, 7, 1, 2); px(g, '#111', 4, 6, 1, 1); px(g, '#111', 4, 9, 1, 1); px(g, '#111', 5, 5, 1, 1); px(g, '#111', 5, 10, 1, 1);
      px(g, '#111', 9, 4, 1, 2); px(g, '#111', 8, 6, 1, 2); px(g, '#111', 7, 8, 1, 2); px(g, '#111', 6, 10, 1, 2);
      px(g, '#111', 12, 7, 1, 2); px(g, '#111', 11, 6, 1, 1); px(g, '#111', 11, 9, 1, 1); px(g, '#111', 10, 5, 1, 1); px(g, '#111', 10, 10, 1, 1);
    }),
    used: tileCanvas((g) => {
      px(g, '#8E7A5A', 0, 0, 16, 16); px(g, '#3A2E1E', 0, 0, 16, 1); px(g, '#3A2E1E', 0, 15, 16, 1); px(g, '#3A2E1E', 0, 0, 1, 16); px(g, '#3A2E1E', 15, 0, 1, 16); px(g, '#A8936E', 1, 1, 14, 1);
    }),
    wood: tileCanvas((g) => {
      px(g, '#B9773E', 0, 0, 16, 6); px(g, '#5A3416', 0, 0, 16, 1); px(g, '#5A3416', 0, 5, 16, 1); px(g, '#D89A5B', 0, 1, 16, 1); px(g, '#5A3416', 5, 1, 1, 4); px(g, '#5A3416', 12, 1, 1, 4);
    }),
    power: tileCanvas((g) => {
      px(g, '#3B82F6', 0, 0, 16, 16); px(g, '#0B2A66', 0, 0, 16, 1); px(g, '#0B2A66', 0, 15, 16, 1); px(g, '#0B2A66', 0, 0, 1, 16); px(g, '#0B2A66', 15, 0, 1, 16);
      px(g, '#93C5FD', 1, 1, 14, 1); px(g, '#1E4FB0', 1, 14, 14, 1);
      px(g, '#111', 4, 4, 8, 6); px(g, '#E8F1FF', 5, 5, 6, 4); px(g, '#3B82F6', 6, 6, 2, 1); px(g, '#3B82F6', 7, 7, 3, 1); px(g, '#D5DBE6', 3, 10, 10, 2); px(g, '#111', 3, 12, 10, 1);
    }),
    gate: tileCanvas((g) => {
      px(g, '#111', 0, 0, 16, 16);
      for (let i = -16; i < 16; i += 6) {
        g.fillStyle = '#F7C948'; g.beginPath(); g.moveTo(i, 16); g.lineTo(i + 3, 16); g.lineTo(i + 19, 0); g.lineTo(i + 16, 0); g.fill();
      }
      px(g, '#E5484D', 6, 6, 4, 4);
    }),
    stone: tileCanvas((g) => {
      px(g, '#9AA3B5', 0, 0, 16, 16); px(g, '#D5DBE6', 0, 0, 16, 2); px(g, '#D5DBE6', 0, 0, 2, 16); px(g, '#5B6478', 0, 14, 16, 2); px(g, '#5B6478', 14, 0, 2, 16); px(g, '#7C869A', 5, 5, 6, 6);
    }),
  };
}

function createCommit(): HTMLCanvasElement {
  const [c, g] = makeCanvas(10, 10);
  px(g, '#2EA043', 0, 4, 10, 2); px(g, '#111', 2, 1, 6, 8); px(g, '#2EA043', 3, 2, 4, 6); px(g, '#B7F5C4', 4, 3, 1, 1);
  return c;
}

function createPlayer(): Record<PlayerPose, { r: HTMLCanvasElement; l: HTMLCanvasElement }> {
  const out = {} as Record<PlayerPose, { r: HTMLCanvasElement; l: HTMLCanvasElement }>;
  for (const k of ['idle', 'run1', 'run2', 'jump'] as const) {
    const rows = [...HEAD, ...BODY, ...LEGS[k]];
    if (k === 'jump') { rows[17] = 'TTTtTTTTTTTTtTTT'; rows[18] = 'S.TtTTTTTTTTtT.S'; }
    const c = pixelCanvas(rows, PAL);
    out[k] = { r: c, l: flipCanvas(c) };
  }
  return out;
}

export function createSprites() {
  return {
    player: createPlayer(),
    bug1: pixelCanvas([...BUG_TOP, ...BUG1_LEGS], BUG_PAL),
    bug2: pixelCanvas([...BUG_TOP, ...BUG2_LEGS], BUG_PAL),
    bugFlat: pixelCanvas(BUG_FLAT, BUG_PAL),
    tiles: createTiles(),
    notebook: pixelCanvas(NOTEBOOK, NOTEBOOK_PAL),
    commit: createCommit(),
  };
}

export type Sprites = ReturnType<typeof createSprites>;
export type TileSprites = Sprites['tiles'];
