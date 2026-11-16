import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { CHAPTERS, PROFILE } from '@/content/chapters';

export const alt = `${PROFILE.name} · ${PROFILE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const portrait = await readFile(join(process.cwd(), 'src/assets/retrato.jpg'));
const src = `data:image/jpeg;base64,${portrait.toString('base64')}`;

/** Imagen para compartir (se hereda en todas las rutas). */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 30%, #1E2A55 0%, #0E1220 70%)', padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 56, width: '100%', height: '100%',
            background: '#13172B', border: '8px solid #fff', boxShadow: '16px 16px 0 #000', padding: 56,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 20 }}>
            <div style={{ display: 'flex', fontSize: 28, color: '#7EC8FF', letterSpacing: 2 }}>PORTFOLIO · NIVEL 1</div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 92, fontWeight: 800, lineHeight: 1.05, color: '#fff' }}>
              <span>{PROFILE.firstName}</span>
              <span style={{ color: '#F7C948' }}>{PROFILE.lastName}</span>
            </div>
            <div style={{ display: 'flex', fontSize: 30, color: '#7EC8FF', letterSpacing: 2 }}>{PROFILE.role}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
              {CHAPTERS[0].chips.map((c) => (
                <div key={c} style={{ display: 'flex', border: '3px solid #fff', padding: '8px 14px', fontSize: 24, color: '#fff' }}>{c}</div>
              ))}
            </div>
          </div>
          <img src={src} alt="" width={300} height={362} style={{ border: '8px solid #fff', boxShadow: '12px 12px 0 #000' }} />
        </div>
      </div>
    ),
    size,
  );
}
