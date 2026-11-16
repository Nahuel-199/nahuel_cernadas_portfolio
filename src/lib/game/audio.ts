export type Sfx = 'break' | 'jump' | 'coin' | 'stomp' | 'hurt' | 'block' | 'thud' | 'door' | 'power' | 'win';

/** [frecuencia inicial, frecuencia final, duración] */
const SWEEPS: Partial<Record<Sfx, [number, number, number]>> = {
  break: [180, 60, 0.15],
  jump: [330, 660, 0.12],
  coin: [988, 1319, 0.1],
  stomp: [220, 110, 0.12],
  hurt: [200, 80, 0.3],
  block: [160, 160, 0.06],
  thud: [110, 90, 0.05],
  door: [523, 784, 0.15],
};

/** Arpegios: [notas, separación, duración de cada nota, volumen] */
const ARPEGGIOS: Partial<Record<Sfx, [number[], number, number, number]>> = {
  power: [[392, 523, 659, 784, 1047], 0.06, 0.06, 0.05],
  win: [[523, 659, 784, 1047], 0.12, 0.11, 0.06],
};

type AudioContextCtor = typeof AudioContext;

/** Efectos de sonido sintetizados con onda cuadrada (sin archivos). */
export class GameAudio {
  private ctx: AudioContext | null = null;
  muted = false;

  /** Debe llamarse desde un gesto del usuario. */
  init(): void {
    if (this.ctx) return;
    try {
      const w = window as Window & { webkitAudioContext?: AudioContextCtor };
      const Ctor = window.AudioContext || w.webkitAudioContext;
      this.ctx = Ctor ? new Ctor() : null;
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  play(type: Sfx): void {
    const ac = this.ctx;
    if (this.muted || !ac) return;
    // Los navegadores suspenden el contexto al pasar a segundo plano (y iOS al bloquear la pantalla).
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    const now = ac.currentTime;

    const arp = ARPEGGIOS[type];
    if (arp) {
      const [notes, step, len, vol] = arp;
      notes.forEach((fr, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'square'; o.frequency.value = fr; g.gain.value = vol;
        o.connect(g); g.connect(ac.destination);
        o.start(now + i * step); o.stop(now + i * step + len);
      });
      return;
    }

    const f = SWEEPS[type];
    if (!f) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination); o.type = 'square'; g.gain.value = 0.06;
    o.frequency.setValueAtTime(f[0], now); o.frequency.exponentialRampToValueAtTime(f[1], now + f[2]);
    g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.001, now + f[2]);
    o.start(now); o.stop(now + f[2] + 0.02);
  }

  close(): void {
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
