'use client';

import { useState, type FormEvent } from 'react';
import { CVS, PROFILE } from '@/content/chapters';
import { cleanInitials, fmtTime } from '@/lib/scores';
import type { LevelResult } from '@/lib/game/types';
import { DIALOG_TITLE_ID } from './Dialog';
import Leaderboard from './Leaderboard';
import { saveScore } from './useLeaderboard';

interface Props {
  result: LevelResult;
  onRestart: () => void;
}

export default function LevelComplete({ result, onRestart }: Props) {
  const [initials, setInitials] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const stats: [string, string][] = [
    ['TIEMPO', fmtTime(result.time)],
    ['COMMITS', `${result.commits}/${result.totalCommits}`],
    ['STACK', `${result.stack}/${result.totalStack}`],
    ['BUGS ARREGLADOS', String(result.bugs)],
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ini = cleanInitials(initials);
    if (!ini) {
      setStatus('Escribí entre 1 y 3 letras o números.');
      document.getElementById('initials')?.focus();
      return;
    }
    setSaving(true);
    setStatus('Guardando…');
    const outcome = await saveScore({ initials: ini, time: result.time, stack: result.stack, bugs: result.bugs });
    setStatus(outcome.message);
    setSaving(false);
    setSaved(outcome.done);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <span className="tag">¡NIVEL COMPLETO!</span>
      <h2 id={DIALOG_TITLE_ID} className="dialog-title">¿El próximo nivel es con tu equipo?</h2>

      <div className="px grid grid-cols-2 gap-2 text-[10px] leading-[1.7]">
        {stats.map(([k, v]) => (
          <div key={k} className="border-2 border-white p-2.5">
            {k}
            <b className="mt-1 block text-base font-normal text-gold">{v}</b>
          </div>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-2.5" onSubmit={submit} noValidate>
        <label htmlFor="initials" className="px flex flex-col gap-1.5 text-[10px]">
          TUS INICIALES
          <input
            id="initials"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            maxLength={3}
            required
            autoComplete="off"
            pattern="[A-Za-z0-9]{1,3}"
            aria-describedby="saveStatus"
            className="min-h-11 w-[110px] border-[3px] border-white bg-bg px-2.5 font-pixel text-base tracking-[.2em] text-white uppercase"
          />
        </label>
        <button type="submit" className="btn btn-gold" disabled={saving || saved}>GUARDAR RÉCORD</button>
      </form>
      <p id="saveStatus" role="status" className="note">{status}</p>

      <Leaderboard />

      <p className="copy">Gracias por jugar. Si te gustó cómo trabajo, hablemos. ¿Querés intentar mejorar tu tiempo?</p>
      <button type="button" className="btn btn-gold self-start" onClick={onRestart}>↺ REINICIAR JUEGO</button>

      <div className="flex flex-wrap gap-2.5">
        <a className="btn btn-red" href={`mailto:${PROFILE.email}`}>EMAIL</a>
        <a className="btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
        {CVS.map((cv) => (
          <a key={cv.href} className="btn" href={cv.href} download>DESCARGAR {cv.label}</a>
        ))}
      </div>
      <p className="copy">{PROFILE.email}</p>
    </div>
  );
}
