export type Action = 'left' | 'right' | 'jump' | 'run' | 'act';

export interface HeldKeys {
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
}

/** Teclado → acción (mismo mapeo que el prototipo). */
export function keyToAction(key: string): Action | null {
  switch (key.toLowerCase()) {
    case 'arrowleft': case 'a': return 'left';
    case 'arrowright': case 'd': return 'right';
    case ' ': case 'arrowup': case 'w': case 'z': return 'jump';
    case 'shift': case 'x': return 'run';
    case 'e': case 'arrowdown': case 's': return 'act';
    default: return null;
  }
}

/** Estado de entrada compartido por teclado y controles táctiles. */
export class Input {
  keys: HeldKeys = { left: false, right: false, jump: false, run: false };
  /** Flanco de bajada del salto (se consume en el update). */
  jumpPressed = false;
  /** Pedido de entrar a una puerta (se consume en el update). */
  actPressed = false;

  press(a: Action): void {
    if (a === 'jump') { if (!this.keys.jump) this.jumpPressed = true; this.keys.jump = true; }
    else if (a === 'act') this.actPressed = true;
    else this.keys[a] = true;
  }

  release(a: Action): void {
    if (a === 'act') return;
    this.keys[a] = false;
  }

  /** Suelta las teclas mantenidas (al abrir un diálogo). */
  clearKeys(): void {
    this.keys = { left: false, right: false, jump: false, run: false };
  }

  /** Estado limpio (al reiniciar el nivel). */
  reset(): void {
    this.clearKeys();
    this.jumpPressed = false;
    this.actPressed = false;
  }
}
