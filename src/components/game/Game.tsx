'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pressStart } from '@/app/fonts';
import { CHAPTERS } from '@/content/chapters';
import { fitPortrait, fitScale, portraitViewWidth } from '@/lib/game/camera';
import { CANVAS_H, CANVAS_W, VW } from '@/lib/game/constants';
import { GameEngine, MAX_LIVES } from '@/lib/game/engine';
import type { Action } from '@/lib/game/input';
import { TOTAL_CHAPTERS, TOTAL_COMMITS, TOTAL_STACK } from '@/lib/game/level';
import type { GameEvents, HudState, LevelResult } from '@/lib/game/types';
import Dialog from './Dialog';
import { BoardDialog, ChapterDialog, CvDialog, MenuDialog, ReadingDialog, RestartDialog } from './DialogContents';
import Hud from './Hud';
import LevelComplete from './LevelComplete';
import { BossBar, DoorPrompt, Toast, TouchControls } from './Overlays';
import StartScreen from './StartScreen';
import { getMuted, setMutedPref, useMuted } from './useMuted';

/** Celular en vertical: HUD compacto arriba, juego agrandado y controles abajo. */
const PORTRAIT_MQ = '(pointer: coarse) and (orientation: portrait)';
/** Alto reservado en vertical para el HUD (arriba) y para el aviso de puerta y los controles (abajo). */
const PORTRAIT_RESERVED_H = 84 + 220;

type DialogState =
  | { kind: 'chapter'; index: number }
  | { kind: 'reading' }
  | { kind: 'board' }
  | { kind: 'restart' }
  | { kind: 'cv' }
  | { kind: 'menu' }
  | { kind: 'complete'; result: LevelResult }
  | null;

const INITIAL_HUD: HudState = {
  lives: MAX_LIVES, maxLives: MAX_LIVES, commits: 0, totalCommits: TOTAL_COMMITS, stack: 0, totalStack: TOTAL_STACK,
  bugs: 0, chapters: 0, totalChapters: TOTAL_CHAPTERS, senior: false,
};

/** Juego completo: canvas + HUD + diálogos + controles. */
export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const toastId = useRef(0);

  const [started, setStarted] = useState(false);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [door, setDoor] = useState<number | null>(null);
  const [boss, setBoss] = useState<GameEvents['boss']>({ visible: false, hp: 3, maxHp: 3 });
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const [announce, setAnnounce] = useState('');
  const muted = useMuted();

  const showToast = useCallback((msg: string) => setToast({ msg, id: ++toastId.current }), []);

  /** Abre un diálogo y pausa el juego en el mismo frame. */
  const openDialog = useCallback((d: Exclude<DialogState, null>) => {
    engineRef.current?.openOverlay();
    setDialog(d);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    engineRef.current?.closeOverlay();
  }, []);

  // ---- motor ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas, {
      fontFamily: pressStart.style.fontFamily,
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    engine.setMuted(getMuted());
    engineRef.current = engine;
    let bossVisible = false;

    engine.on('start', () => setStarted(true));
    engine.on('hud', setHud);
    engine.on('boss', (b) => {
      setBoss(b);
      // En vertical, durante la pelea con el jefe la vista vuelve al ancho completo (la arena lo ocupa todo).
      if (b.visible !== bossVisible) { bossVisible = b.visible; fit(); }
    });
    engine.on('toast', showToast);
    engine.on('announce', setAnnounce);
    engine.on('door', (ch) => {
      setDoor(ch);
      if (ch !== null) setAnnounce(`Puerta: ${CHAPTERS[ch].tag}. Apretá E para entrar.`);
    });
    engine.on('chapter', (index) => {
      openDialog({ kind: 'chapter', index });
      setAnnounce(`${CHAPTERS[index].tag}: ${CHAPTERS[index].title}`);
    });
    engine.on('complete', (result) => openDialog({ kind: 'complete', result }));

    const portrait = window.matchMedia(PORTRAIT_MQ);
    function fit() {
      const viewW = portrait.matches ? portraitViewWidth(bossVisible) : VW;
      engine.setViewWidth(viewW);
      const { width, height } = portrait.matches
        ? fitPortrait(window.innerWidth, window.innerHeight - PORTRAIT_RESERVED_H, viewW)
        : fitScale(window.innerWidth, window.innerHeight);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
    }
    fit();
    window.addEventListener('resize', fit);
    portrait.addEventListener('change', fit);
    engine.mount();

    return () => {
      window.removeEventListener('resize', fit);
      portrait.removeEventListener('change', fit);
      engine.destroy();
      engineRef.current = null;
    };
  }, [openDialog, showToast]);

  // ---- acciones de la UI ----
  const play = () => engineRef.current?.start();
  const readFromIntro = () => { engineRef.current?.start(); openDialog({ kind: 'reading' }); };
  const restart = () => { engineRef.current?.restart(); setDialog(null); };
  const askRestart = () => { if (started) openDialog({ kind: 'restart' }); };
  const toggleMute = () => {
    const next = !muted;
    setMutedPref(next);
    engineRef.current?.setMuted(next);
  };
  const press = useCallback((a: Action) => engineRef.current?.press(a), []);
  const release = useCallback((a: Action) => engineRef.current?.release(a), []);

  return (
    <>
      {/* Con un diálogo abierto, todo lo de atrás queda inerte (ni foco ni lector de pantalla). */}
      <div inert={dialog !== null}>
      <div className="fixed inset-0 flex touch-manipulation flex-col items-center justify-center overflow-hidden overscroll-none bg-bg pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pointer-coarse:portrait:justify-start pointer-coarse:portrait:pt-[calc(env(safe-area-inset-top)+84px)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          role="img"
          aria-label="Juego de plataformas del portfolio"
          className="block shrink-0 bg-sky shadow-[0_0_0_4px_#000] transition-[width,height] duration-300 [image-rendering:pixelated] motion-reduce:transition-none"
        />
        <p className="note mt-4 hidden px-4 text-center pointer-coarse:portrait:block">
          Girá el teléfono para jugar en pantalla completa.
        </p>
      </div>

      <Hud
        hud={hud}
        muted={muted}
        onReading={() => openDialog({ kind: 'reading' })}
        onCv={() => openDialog({ kind: 'cv' })}
        onBoard={() => openDialog({ kind: 'board' })}
        onRestart={askRestart}
        onToggleMute={toggleMute}
        onMenu={() => openDialog({ kind: 'menu' })}
      />
      <DoorPrompt
        tag={door !== null ? CHAPTERS[door].tag : null}
        onEnter={() => engineRef.current?.enterDoor()}
      />
      <BossBar {...boss} />

      {!started && (
        <StartScreen
          onPlay={play}
          onReading={readFromIntro}
          onBoard={() => openDialog({ kind: 'board' })}
          onCv={() => openDialog({ kind: 'cv' })}
        />
      )}
      </div>

      {/* Fuera de la capa inerte: un toque que abre un diálogo tiene que poder terminar en el botón. */}
      <TouchControls press={press} release={release} />

      <Dialog
        open={dialog !== null}
        onClose={closeDialog}
        contentKey={dialog ? `${dialog.kind}${dialog.kind === 'chapter' ? dialog.index : ''}` : undefined}
      >
        {dialog?.kind === 'menu' && (
          <MenuDialog
            started={started}
            muted={muted}
            onReading={() => openDialog({ kind: 'reading' })}
            onCv={() => openDialog({ kind: 'cv' })}
            onBoard={() => openDialog({ kind: 'board' })}
            onRestart={askRestart}
            onToggleMute={toggleMute}
          />
        )}
        {dialog?.kind === 'chapter' && <ChapterDialog index={dialog.index} />}
        {dialog?.kind === 'reading' && <ReadingDialog />}
        {dialog?.kind === 'board' && <BoardDialog />}
        {dialog?.kind === 'cv' && <CvDialog />}
        {dialog?.kind === 'restart' && <RestartDialog onConfirm={restart} onCancel={closeDialog} />}
        {dialog?.kind === 'complete' && <LevelComplete result={dialog.result} onRestart={restart} />}
      </Dialog>

      <Toast toast={toast} onDone={() => setToast(null)} />
      <p className="sr-only" aria-live="polite">{announce}</p>
    </>
  );
}
