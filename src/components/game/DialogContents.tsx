import ChapterContent from '@/components/ChapterContent';
import { CHAPTERS, CVS } from '@/content/chapters';
import { DIALOG_TITLE_ID } from './Dialog';
import Leaderboard from './Leaderboard';

export function ChapterDialog({ index }: { index: number }) {
  return <ChapterContent chapter={CHAPTERS[index]} heading="h2" titleId={DIALOG_TITLE_ID} />;
}

/** Todo el portfolio en una sola página, sin jugar. */
export function ReadingDialog() {
  return (
    <div className="flex flex-col gap-3">
      <h2 id={DIALOG_TITLE_ID} className="dialog-title">Modo lectura</h2>
      <p className="copy">Todo el portfolio en una sola página, sin jugar.</p>
      {CHAPTERS.map((c) => (
        <section key={c.tag} className="mt-1 border-t-[3px] border-dashed border-white/40 pt-4">
          <ChapterContent chapter={c} heading="h3" />
        </section>
      ))}
    </div>
  );
}

export function BoardDialog() {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="tag">MEJORES TIEMPOS</span>
      <h2 id={DIALOG_TITLE_ID} className="dialog-title">Tabla de récords</h2>
      <Leaderboard />
    </div>
  );
}

export function RestartDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="tag">REINICIAR</span>
      <h2 id={DIALOG_TITLE_ID} className="dialog-title">¿Querés reiniciar el juego?</h2>
      <p className="copy">Volvés al inicio del nivel y se borran tus commits, stack, bugs y capítulos visitados.</p>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" className="btn btn-gold" onClick={onConfirm}>SÍ, REINICIAR</button>
        <button type="button" className="btn" onClick={onCancel}>SEGUIR JUGANDO</button>
      </div>
    </div>
  );
}

export function CvDialog() {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="tag">CV</span>
      <h2 id={DIALOG_TITLE_ID} className="dialog-title">Descargar CV</h2>
      <div className="flex flex-wrap gap-2.5">
        {CVS.map((cv) => (
          <a key={cv.href} className="btn btn-gold" href={cv.href} download>{cv.label}</a>
        ))}
      </div>
    </div>
  );
}

interface MenuProps {
  started: boolean;
  muted: boolean;
  onReading: () => void;
  onCv: () => void;
  onBoard: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
}

/** Menú del HUD compacto: las mismas acciones que los botones del HUD de escritorio. */
export function MenuDialog({ started, muted, onReading, onCv, onBoard, onRestart, onToggleMute }: MenuProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <h2 id={DIALOG_TITLE_ID} className="dialog-title">Menú</h2>
      <div className="flex flex-col gap-2.5">
        <button type="button" className="btn" onClick={onReading}>MODO LECTURA</button>
        <button type="button" className="btn btn-gold" onClick={onCv}>CV</button>
        <button type="button" className="btn" onClick={onBoard}>RÉCORDS</button>
        {started && <button type="button" className="btn" onClick={onRestart}>↺ REINICIAR JUEGO</button>}
        <button type="button" className="btn" onClick={onToggleMute} aria-pressed={muted}>
          {muted ? '✕ SONIDO DESACTIVADO' : '♪ SONIDO ACTIVADO'}
        </button>
      </div>
    </div>
  );
}
