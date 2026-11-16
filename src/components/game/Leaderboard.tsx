'use client';

import { fmtTime, MAX_STACK } from '@/lib/scores';
import { useLeaderboard } from './useLeaderboard';

export default function Leaderboard() {
  const { rows, loading, source, myId } = useLeaderboard();

  if (loading && !rows.length) return <p className="note">Cargando récords…</p>;

  return (
    <div className="flex flex-col gap-2.5">
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="board">
            <thead>
              <tr>
                {['#', 'NOMBRE', 'TIEMPO', 'STACK', 'BUGS'].map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.id || r.initials}-${i}`} className={myId && r.id === myId ? 'me' : undefined}>
                  <td>{i + 1}</td>
                  <td>{r.initials}</td>
                  <td>{fmtTime(r.time)}</td>
                  <td>{r.stack}/{MAX_STACK}</td>
                  <td>{r.bugs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="note">Todavía no hay récords. ¡El primero puede ser el tuyo!</p>
      )}
      <p className="note">
        {source === 'shared' ? 'Tabla compartida entre todos los que juegan.' : 'Récords guardados en este navegador.'}
      </p>
    </div>
  );
}
