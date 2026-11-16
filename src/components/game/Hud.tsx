import Image from 'next/image';
import avatar from '@/assets/avatar.jpg';
import { PROFILE } from '@/content/chapters';
import type { HudState } from '@/lib/game/types';

const HEART_PATH = 'M1 0h2v1h2V0h2v1h1v3H7v1H6v1H5v1H3V6H2V5H1V4H0V1h1z';

function Heart({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 8 7" aria-hidden="true" shapeRendering="crispEdges" className="size-4">
      <path fill={on ? '#E5484D' : '#3B4260'} d={HEART_PATH} />
    </svg>
  );
}

interface Props {
  hud: HudState;
  muted: boolean;
  onReading: () => void;
  onCv: () => void;
  onBoard: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  /** Menú del HUD compacto (pantallas táctiles). */
  onMenu: () => void;
}

function Hearts({ hud }: { hud: HudState }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`Vidas: ${hud.lives} de ${hud.maxLives}`}>
      {Array.from({ length: hud.maxLives }, (_, i) => <Heart key={i} on={i < hud.lives} />)}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <span>{label} <b className="font-normal text-gold">{value}</b></span>;
}

export default function Hud(props: Props) {
  return (
    <>
      <DesktopHud {...props} />
      <CompactHud {...props} />
    </>
  );
}

/** HUD compacto para pantallas táctiles: una barra (dos filas en vertical) y un botón de menú. */
function CompactHud({ hud, onMenu }: Props) {
  return (
    <div className="box px fixed top-[calc(env(safe-area-inset-top)+8px)] right-2 left-2 z-10 hidden flex-wrap items-center gap-x-3 gap-y-1 py-1 pr-1 pl-2.5 text-[8px] leading-[1.6] pointer-coarse:flex">
      <Hearts hud={hud} />
      <Stat label="MODO" value={hud.senior ? 'SR' : 'JR'} />
      <div aria-live="polite" className="flex flex-1 flex-wrap justify-between gap-x-3 portrait:order-last portrait:basis-full portrait:pb-1">
        <Stat label="COMMITS" value={String(hud.commits).padStart(3, '0')} />
        <Stat label="STACK" value={`${hud.stack}/${hud.totalStack}`} />
        <Stat label="BUGS" value={hud.bugs} />
        <Stat label="CAP" value={`${hud.chapters}/${hud.totalChapters}`} />
      </div>
      <button
        type="button"
        onClick={onMenu}
        aria-haspopup="dialog"
        aria-label="Menú"
        className="ml-auto grid size-11 cursor-pointer place-items-center text-xl text-white"
      >
        ☰
      </button>
    </div>
  );
}

function DesktopHud({ hud, muted, onReading, onCv, onBoard, onRestart, onToggleMute }: Props) {
  return (
    <div className="pointer-events-none fixed top-2.5 right-2.5 left-2.5 z-10 flex flex-wrap items-start justify-between gap-2.5 *:pointer-events-auto pointer-coarse:hidden">
      <div className="box flex items-center gap-2.5 py-1.5 pr-3 pl-1.5">
        <Image src={avatar} alt="" width={44} height={44} className="block size-11 border-[3px] border-white" />
        <div>
          <div className="px text-[11px] leading-[1.6] max-[760px]:text-[9px]">{PROFILE.firstName}</div>
          <div className="mt-1"><Hearts hud={hud} /></div>
        </div>
      </div>

      <div className="box px flex gap-3.5 px-3.5 py-2.5 text-[10px] leading-[1.6] max-[760px]:gap-2 max-[760px]:p-2 max-[760px]:text-[8px]" aria-live="polite">
        <Stat label="COMMITS" value={String(hud.commits).padStart(3, '0')} />
        <Stat label="STACK" value={`${hud.stack}/${hud.totalStack}`} />
        <Stat label="BUGS" value={hud.bugs} />
        <Stat label="CAP" value={`${hud.chapters}/${hud.totalChapters}`} />
        <Stat label="MODO" value={hud.senior ? 'SR' : 'JR'} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={onReading}>MODO LECTURA</button>
        <button type="button" className="btn btn-gold" onClick={onCv}>CV</button>
        <button type="button" className="btn" onClick={onBoard}>RÉCORDS</button>
        <button type="button" className="btn" onClick={onRestart} aria-label="Reiniciar juego">↺</button>
        <button
          type="button"
          className="btn"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {muted ? '✕' : '♪'}
        </button>
      </div>
    </div>
  );
}
