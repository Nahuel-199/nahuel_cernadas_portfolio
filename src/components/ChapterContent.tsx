import Image from 'next/image';
import retrato from '@/assets/retrato.jpg';
import { PROFILE, type Chapter } from '@/content/chapters';

/** Botones EMAIL / LINKEDIN / GITHUB y el email en texto. */
export function ContactLinks() {
  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        <a className="btn btn-red" href={`mailto:${PROFILE.email}`}>EMAIL</a>
        <a className="btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
        <a className="btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer">GITHUB</a>
      </div>
      <p className="copy">{PROFILE.email}</p>
    </>
  );
}

interface Props {
  chapter: Chapter;
  /** h1 en /lectura (capítulo 1), h2 en el diálogo y en /lectura, h3 en el modo lectura del juego. */
  heading: 'h1' | 'h2' | 'h3';
  titleId?: string;
}

/** Contenido de un capítulo (diálogo, modo lectura y /lectura). */
export default function ChapterContent({ chapter: c, heading: H, titleId }: Props) {
  const body = (
    <div className="flex min-w-0 flex-1 basis-[300px] flex-col gap-3.5">
      <span className="tag">{c.tag}</span>
      <H id={titleId} className={H === 'h3' ? 'reading-title' : 'dialog-title'}>{c.title}</H>
      <p className="copy">{c.text}</p>
      {c.list.length > 0 && (
        <ul className="copy-list">
          {c.list.map((x) => <li key={x}>{x}</li>)}
        </ul>
      )}
      <div className="chips">
        {c.chips.map((x) => <span key={x}>{x}</span>)}
      </div>
      {c.link && (
        <a className="btn btn-gold self-start" href={c.link.href} target="_blank" rel="noopener noreferrer">{c.link.text}</a>
      )}
      {c.contact && <ContactLinks />}
    </div>
  );

  if (!c.portrait) return body;
  return (
    <div className="flex flex-wrap items-start gap-5">
      <Image
        src={retrato}
        alt={PROFILE.portraitAlt}
        width={150}
        className="block border-4 border-white shadow-[5px_5px_0_#000]"
      />
      {body}
    </div>
  );
}
