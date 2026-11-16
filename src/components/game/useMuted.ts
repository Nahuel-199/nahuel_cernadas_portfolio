'use client';

import { useSyncExternalStore } from 'react';

// Preferencia de sonido guardada en el navegador (se recuerda entre visitas).

const KEY = 'gamefolio-muted';
const subscribers = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

let muted: boolean | null = null;

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

function getSnapshot(): boolean {
  if (muted === null) muted = read();
  return muted;
}

export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function getMuted(): boolean {
  return getSnapshot();
}

export function setMutedPref(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    // sin almacenamiento: vale solo para esta visita
  }
  subscribers.forEach((fn) => fn());
}
