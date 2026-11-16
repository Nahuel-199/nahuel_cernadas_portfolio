import Image from 'next/image';
import retrato from '@/assets/retrato.jpg';
import { INTRO, PROFILE } from '@/content/chapters';

interface Props {
  onPlay: () => void;
  onReading: () => void;
  onBoard: () => void;
  onCv: () => void;
}

/** Pantalla de inicio (se oculta al empezar). */
export default function StartScreen({ onPlay, onReading, onBoard, onCv }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-auto bg-[radial-gradient(circle_at_50%_30%,#1E2A55_0%,#0E1220_70%)] p-3.5">
      <div
        role="dialog"
        aria-labelledby="introTitle"
        className="flex w-[min(820px,100%)] flex-wrap items-center gap-7 border-4 border-white bg-panel p-[30px] shadow-[10px_10px_0_#000] outline-4 outline-black"
      >
        <div className="flex min-w-0 flex-1 basis-[340px] flex-col gap-4">
          <span className="px text-xs leading-[1.7] text-sky">{INTRO.kicker}</span>
          <h1 id="introTitle" className="px m-0 text-[clamp(22px,4vw,38px)] leading-[1.35] font-normal">
            {PROFILE.firstName}<br /><span className="text-gold">{PROFILE.lastName}</span>
          </h1>
          <span className="px text-xs leading-[1.7] text-sky">{PROFILE.role}</span>
          <p className="m-0 text-[17px] leading-[1.55] text-[#E7EAF3]">{INTRO.text}</p>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-gold" onClick={onPlay}>▶ JUGAR</button>
            <button type="button" className="btn" onClick={onReading}>MODO LECTURA</button>
            <button type="button" className="btn" onClick={onBoard}>RÉCORDS</button>
            <button type="button" className="btn" onClick={onCv}>CV</button>
          </div>
          <span className="px text-[9px] leading-loose text-[#BFC6DA]">{INTRO.keys}</span>
          <span className="px blink text-[9px] leading-loose text-[#BFC6DA]">{INTRO.start}</span>
        </div>
        <figure className="m-0 flex-[0_0_200px]">
          <Image
            src={retrato}
            alt={PROFILE.portraitAlt}
            width={200}
            priority
            className="block w-full border-4 border-white shadow-[6px_6px_0_#000]"
          />
        </figure>
      </div>
    </div>
  );
}
