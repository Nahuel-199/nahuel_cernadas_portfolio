// Textos del portfolio (copiados del prototipo docs/prototipo/plataformas.html).
// El índice de cada capítulo coincide con `DOORS[].ch` en src/lib/game/level.ts.

export interface Chapter {
  tag: string;
  title: string;
  text: string;
  list: string[];
  chips: string[];
  /** Muestra el retrato al lado del texto. */
  portrait?: boolean;
  link?: { href: string; text: string };
  /** Muestra los botones de contacto. */
  contact?: boolean;
}

export const PROFILE = {
  name: 'Nahuel Cernadas',
  firstName: 'NAHUEL',
  lastName: 'CERNADAS',
  role: 'FULL STACK DEVELOPER',
  email: 'gabrielnahuel96@gmail.com',
  linkedin: 'https://www.linkedin.com/in/nahuel-cernadas-3b111a1b7/',
  github: 'https://github.com/Nahuel-199',
  portraitAlt: 'Retrato ilustrado de Nahuel Cernadas',
} as const;

export const CVS = [
  { label: 'CV FRONTEND', href: '/cv/Nahuel_Cernadas_CV_Frontend.pdf' },
  { label: 'CV BACKEND', href: '/cv/Nahuel_Cernadas_CV_Backend.pdf' },
] as const;

export const INTRO = {
  kicker: 'PORTFOLIO · NIVEL 1',
  text:
    'Mi carrera convertida en un nivel de plataformas. Cada puerta es un capítulo. Aplastá bugs, golpeá los bloques </> para juntar mi stack, buscá la notebook en los bloques azules para pasar a modo Senior, vencé al jefe final y llegá a la bandera lo más rápido que puedas.',
  keys: '← → MOVERSE · ESPACIO SALTAR · SHIFT CORRER · E / ↓ ENTRAR',
  /** Equivalente táctil de `keys` (mismos controles, con los botones de pantalla). */
  touchKeys: '◀ ▶ MOVERSE · A SALTAR · E ENTRAR',
  start: 'PRESIONÁ ENTER PARA EMPEZAR',
} as const;

export const CHAPTERS: readonly Chapter[] = [
  {
    tag: 'CAPÍTULO 1 · INICIO', title: 'Nahuel Cernadas', portrait: true,
    text: 'Full Stack Developer con 5 años construyendo productos web de punta a punta con React, Next.js, TypeScript y Node.js. Hoy desarrollo portales para usuarios externos en MailAmericas y tengo mi propio e-commerce en producción.',
    list: [], chips: ['React', 'Next.js', 'TypeScript', 'Node.js'],
  },
  {
    tag: 'CAPÍTULO 2 · LA ESCUELA', title: 'El comienzo',
    text: 'Fui repositor mientras estudiaba programación por mi cuenta. En 2021 hice el bootcamp Full Stack de Henry: más de 1.000 horas de JavaScript, React, Node.js y SQL.',
    list: [], chips: ['Henry 2021', 'JavaScript', 'React', 'SQL'],
  },
  {
    tag: 'CAPÍTULO 3 · EL ESTUDIO', title: 'Wodeva · Backend Developer',
    text: 'Mayo 2022 – abril 2023.',
    list: [
      'Backend de un e-commerce para Estados Unidos con transmisiones en vivo integradas a la compra.',
      'APIs REST con Node.js, Express y TypeScript, sobre SQL y MongoDB.',
    ],
    chips: ['Node.js', 'Express', 'TypeScript', 'MongoDB'],
  },
  {
    tag: 'CAPÍTULO 4 · EL DEPÓSITO', title: 'MailAmericas · El portal de los 360',
    text: 'Mayo 2023 – hoy. Frontend Web Developer SSR, con rol full stack.',
    list: [
      'Portal de autogestión que hoy usan 360 usuarios externos, con login mediante WorkOS.',
      'Portal de facturación para proveedores externos y la web corporativa.',
      'Todo a producción con Docker, GitLab CI, entornos de QA y Nginx.',
    ],
    chips: ['Next.js', 'Prisma', 'SQL', 'WorkOS', 'GitLab CI'],
  },
  {
    tag: 'CAPÍTULO 5 · LA TIENDA', title: 'Nakama Club',
    text: 'Mi e-commerce propio de indumentaria anime, hecho en solitario y en producción.',
    list: [
      'Next.js 16 con Cache Components, TypeScript, Tailwind v4 y MongoDB.',
      'Pagos con Mercado Pago y webhooks, cuentas con Better Auth (email y Google).',
      'Web Workers que generan el pliego de impresión DTF a 300 dpi sin trabar la interfaz.',
    ],
    chips: ['Next.js 16', 'MongoDB', 'Mercado Pago', 'Web Workers'],
    link: { href: 'https://www.nakamaclub.com.ar/', text: 'VER NAKAMACLUB.COM.AR' },
  },
  {
    tag: 'CAPÍTULO 6 · TU EQUIPO', title: '¿El próximo nivel es con tu equipo?',
    text: 'Escribime a gabrielnahuel96@gmail.com o por LinkedIn.',
    list: [], chips: ['Frontend', 'Full Stack', 'Backend'], contact: true,
  },
];
