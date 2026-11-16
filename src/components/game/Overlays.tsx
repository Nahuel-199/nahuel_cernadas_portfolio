'use client';

import { useEffect, useRef } from 'react';
import type { Action } from '@/lib/game/input';

/** Barra de vida del jefe PROD-500. */
export function BossBar({ visible, hp, maxHp }: { visible: boolean; hp: number; maxHp: number }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="box px fixed top-[76px] left-1/2 z-[11] flex -translate-x-1/2 items-center gap-2.5 px-3 py-2 text-[10px] text-[#FFB4B4]"
    >
      <span>PROD-500</span>
      <div className="h-3 w-[180px] border-2 border-white bg-[#3B4260]">
        <i className="block h-full bg-red transition-[width] duration-300" style={{ width: `${(hp / maxHp) * 100}%` }} />
      </div>
    </div>
  );
}

/** Aviso para entrar a la puerta cercana (también es un botón). */
export function DoorPrompt({ label, onEnter }: { label: string | null; onEnter: () => void }) {
  if (!label) return null;
  return (
    <button
      type="button"
      onClick={onEnter}
      className="btn btn-red fixed bottom-6 left-1/2 z-[11] -translate-x-1/2 pointer-coarse:bottom-24"
    >
      {label}
    </button>
  );
}

const TOUCH_BTN =
  'size-16 touch-none select-none border-[3px] border-white font-pixel text-sm text-white [-webkit-touch-callout:none]';

/** Controles táctiles (solo en pantallas con puntero grueso). */
export function TouchControls({ press, release }: { press: (a: Action) => void; release: (a: Action) => void }) {
  const btn = (a: Action, label: string, extra: string) => {
    const down = (e: React.PointerEvent) => { e.preventDefault(); press(a); };
    const up = (e: React.PointerEvent) => { e.preventDefault(); release(a); };
    return (
      <button
        type="button"
        tabIndex={-1}
        className={`${TOUCH_BTN} ${extra}`}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        onContextMenu={(e) => e.preventDefault()}
      >
        {label}
      </button>
    );
  };
  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-0 bottom-3 left-0 z-[12] hidden justify-between px-3.5 pointer-coarse:flex">
      <div className="pointer-events-auto flex gap-3">
        {btn('left', '◀', 'bg-[rgba(19,23,43,.75)]')}
        {btn('right', '▶', 'bg-[rgba(19,23,43,.75)]')}
      </div>
      <div className="pointer-events-auto flex gap-3">
        {btn('act', 'E', 'bg-[rgba(19,23,43,.75)]')}
        {btn('jump', 'A', 'bg-[rgba(229,72,77,.85)]')}
      </div>
    </div>
  );
}

/** Mensaje corto arriba al centro; desaparece a los 2,6 s. */
export function Toast({ toast, onDone }: { toast: { msg: string; id: number } | null; onDone: () => void }) {
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => doneRef.current(), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div
      role="status"
      className={`px fixed top-[84px] left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 border-[3px] border-white bg-panel px-4 py-3 text-center text-[10px] leading-[1.6] shadow-[4px_4px_0_#000] ${toast ? '' : 'hidden'}`}
    >
      {toast?.msg}
    </div>
  );
}
