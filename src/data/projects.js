/**
 * Projetos reais, puxados do GitHub (github.com/Lawallz).
 *
 * - accent:  'indigo' | 'violet' | 'emerald'  (cor do brilho do card)
 * - variant: arte gerada quando não há imagem ('chart' | 'orbs' | 'waves' | 'mesh' | 'grid' | 'blocks')
 * - image:   caminho de uma imagem/print real (ex.: '/projects/nebula.webp').
 *            Se preenchido, substitui a arte gerada.
 * - span / aspect: classes Tailwind que definem o tamanho do card no grid (md+)
 * - live: só preenchido quando o repositório tem um deploy real (campo "homepage" no GitHub).
 *   Nada aqui é inventado — se não há link ao vivo, o card mostra só "Código".
 */
export const projects = [
  {
    id: 'litoral-raro',
    title: 'Litoral Raro',
    kind: 'E-commerce',
    year: 2026,
    description:
      'Loja de curadoria de sneakers raros e edições limitadas. Catálogo dinâmico, carrinho persistente e um painel administrativo com autenticação e regras de segurança via Supabase.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase'],
    live: 'https://litoral-raro.vercel.app',
    repo: 'https://github.com/Lawallz/litoral-raro',
    image: null,
    variant: 'blocks',
    accent: 'violet',
    span: 'md:col-span-7',
    aspect: 'aspect-[16/10]',
  },
  {
    id: 'nails-by-ananrs',
    title: 'Nails By Ananrs',
    kind: 'SaaS',
    year: 2026,
    description:
      'Plataforma de agendamento para um studio de nail design, com sincronização em tempo real para evitar conflito de horários e um consultor de estilo com IA que sugere looks via Gemini.',
    tags: ['React', 'TypeScript', 'Supabase', 'Google Gemini AI', 'Tailwind CSS'],
    live: 'https://nails-by-ananrs.vercel.app',
    repo: 'https://github.com/Lawallz/Nails-By-Ananrs',
    image: null,
    variant: 'orbs',
    accent: 'emerald',
    span: 'md:col-span-6',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'ca-ads-nexus',
    title: 'CA-ADS Nexus',
    kind: 'Site institucional',
    year: 2026,
    description:
      'Site oficial do Centro Acadêmico de ADS do IFSP: fundo 3D em Three.js com otimização por hardware, animações GSAP, grade de horários interativa e mapa vetorial do campus. Funciona como PWA.',
    tags: ['React', 'TypeScript', 'Three.js', 'GSAP', 'Tailwind CSS', 'PWA'],
    live: null,
    repo: 'https://github.com/Lawallz/future-ca-hub',
    image: null,
    variant: 'mesh',
    accent: 'indigo',
    span: 'md:col-span-6',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'transporte-pauliceia',
    title: 'Transporte Pauliceia',
    kind: 'Aplicação web',
    year: 2026,
    description:
      'Portal para uma empresa de transporte escolar com simulador de contratos em tempo real: calcula valores por rota, bairro e descontos, gera a minuta em PDF e envia os dados pro Google Sheets.',
    tags: ['JavaScript', 'jsPDF', 'html2canvas', 'Google Apps Script'],
    live: 'https://transporte-escolar-pauliceia.vercel.app',
    repo: 'https://github.com/Lawallz/TRANSPORTE-ESCOLAR-PAULICEIA',
    image: null,
    variant: 'chart',
    accent: 'emerald',
    span: 'md:col-span-7',
    aspect: 'aspect-[16/10]',
  },
  {
    id: 'system-erp',
    title: 'MiniERP API',
    kind: 'API / Backend',
    year: 2026,
    description:
      'API REST para gestão de pequenos comércios: autenticação com JWT, controle de acesso por papéis e permissões, movimentação de estoque com transações Prisma e auditoria das operações.',
    tags: ['Node.js', 'TypeScript', 'Express', 'PostgreSQL', 'Prisma'],
    live: null,
    repo: 'https://github.com/Lawallz/system-erp',
    image: null,
    variant: 'grid',
    accent: 'violet',
    span: 'md:col-span-5',
    aspect: 'aspect-[16/10]',
  },
  {
    id: 'aurora-synth',
    title: 'Aurora Synth',
    kind: 'Experimento',
    year: 2026,
    description:
      'Sintetizador de áudio que roda inteiro no navegador, sem servidor. Biblioteca de instrumentos e um rack de efeitos com reverb, chorus e delay, processados em tempo real com a Web Audio API.',
    tags: ['TypeScript', 'Web Audio API', 'Vite'],
    live: null,
    repo: 'https://github.com/Lawallz/aurora-synth',
    image: null,
    variant: 'waves',
    accent: 'indigo',
    span: 'md:col-span-12',
    aspect: 'aspect-[21/9]',
  },
];
