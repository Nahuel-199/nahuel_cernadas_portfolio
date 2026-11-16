import type { Metadata } from 'next';
import Link from 'next/link';
import ChapterContent from '@/components/ChapterContent';
import { CHAPTERS, CVS, PROFILE } from '@/content/chapters';
import { OG_BASE, OG_IMAGE, SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

const TITLE = `${PROFILE.name} · Full Stack Developer`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/lectura' },
  openGraph: { ...OG_BASE, url: '/lectura', title: TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
};

/** Datos estructurados (schema.org/Person), solo con datos del contenido. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PROFILE.name,
  jobTitle: 'Full Stack Developer',
  url: `${SITE_URL}/lectura`,
  email: `mailto:${PROFILE.email}`,
  sameAs: [PROFILE.linkedin, PROFILE.github],
  worksFor: { '@type': 'Organization', name: 'MailAmericas' },
  knowsAbout: ['React', 'Next.js', 'TypeScript', 'Node.js', 'SQL', 'MongoDB'],
};

/** Versión simple del portfolio: todo el contenido, sin el juego. */
export default function LecturaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <a
        href="#contenido"
        className="btn btn-gold sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        SALTAR AL CONTENIDO
      </a>

      <header className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 py-6">
        <Link href="/" className="btn btn-gold">▶ JUGAR</Link>
        <nav aria-label="Descargar CV" className="flex flex-wrap gap-2.5">
          {CVS.map((cv) => (
            <a key={cv.href} className="btn" href={cv.href} download>
              {cv.label} <span className="sr-only">(PDF)</span>
            </a>
          ))}
        </nav>
      </header>

      <main id="contenido" tabIndex={-1} className="mx-auto flex max-w-[860px] flex-col gap-10 px-4 pb-16 focus:outline-none">
        {CHAPTERS.map((c, i) => (
          <section
            key={c.tag}
            aria-labelledby={`cap-${i + 1}`}
            className={i > 0 ? 'border-t-[3px] border-dashed border-white/40 pt-10' : undefined}
          >
            <ChapterContent chapter={c} heading={i === 0 ? 'h1' : 'h2'} titleId={`cap-${i + 1}`} />
          </section>
        ))}
      </main>
    </>
  );
}
