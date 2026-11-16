'use client';

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

export const DIALOG_TITLE_ID = 'dTitle';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled])';

/** Diálogo modal: foco en "Cerrar" al abrir, Escape y clic afuera cierran, Tab queda atrapado, y el foco vuelve al cerrar. */
export default function Dialog({ open, onClose, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    const lastFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lastFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const f = e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,7,14,.72)] p-3.5"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={trapTab}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={DIALOG_TITLE_ID}
        className="relative flex max-h-[92vh] w-[min(760px,100%)] flex-col gap-3.5 overflow-auto border-4 border-white bg-panel p-[26px] shadow-[8px_8px_0_#000] outline-4 outline-black"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-2.5 right-2.5 grid size-11 cursor-pointer place-items-center border-[3px] border-white bg-red text-white shadow-[3px_3px_0_#000]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
