'use client';

import { useEffect, useRef } from 'react';
import { pressStart } from '@/app/fonts';
import { fitScale } from '@/lib/game/camera';
import { CANVAS_H, CANVAS_W } from '@/lib/game/constants';
import { GameEngine } from '@/lib/game/engine';

/** Monta el canvas del juego y crea/destruye el motor con el componente. */
export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, { fontFamily: pressStart.style.fontFamily });

    const fit = () => {
      const { width, height } = fitScale(window.innerWidth, window.innerHeight);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    engine.mount();

    return () => {
      window.removeEventListener('resize', fit);
      engine.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0E1220] pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        role="img"
        aria-label="Juego de plataformas del portfolio"
        className="block bg-[#7EC8FF] shadow-[0_0_0_4px_#000] [image-rendering:pixelated]"
      />
    </div>
  );
}
