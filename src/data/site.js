/**
 * Conteúdo do site. Edite aqui: nome, e-mail, redes, skills e números.
 * Os textos longos (hero, "sobre") ficam no index.html.
 */
export const site = {
  name: 'Pedro Lawall Santos',
  handle: 'lawallz',
  email: 'lawallzin@gmail.com',
  location: 'São Paulo, Brasil',
  timezone: 'America/Sao_Paulo',

  // Palavras que alternam no subtítulo do hero: "Sou {…}"
  roles: [
    'desenvolvedor fullstack',
    'estudante de ADS no IFSP',
    'criador de interfaces imersivas',
    'movido a React e Node.js',
  ],

  // Faixa em movimento entre o hero e os projetos
  marquee: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Supabase', 'Three.js', 'GSAP', 'Tailwind CSS'],

  socials: [
    { label: 'GitHub', href: 'https://github.com/Lawallz' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pedro-lawall-santos-a7331735b/' },
  ],

  // Números verificáveis (nada inventado): reflete o que está no GitHub e nos
  // projetos abaixo. O primeiro é atualizado ao vivo via API do GitHub caso
  // o navegador do visitante consiga acessá-la — ver src/components/githubStats.js.
  stats: [
    { value: 12, suffix: '', label: 'repositórios no GitHub', id: 'repos' },
    { value: 6, suffix: '', label: 'projetos em destaque abaixo' },
    { value: 3, suffix: '', label: 'projetos com deploy ao vivo' },
  ],

  facts: [
    { term: 'Base', description: 'São Paulo, Brasil' },
    { term: 'Foco atual', description: 'ADS no IFSP • fullstack com React, Node.js e PostgreSQL' },
    { term: 'No ar agora', description: '3 projetos publicados na Vercel' },
  ],

  // Só o que dá pra comprovar em algum repositório real (ver README do projeto).
  skills: [
    {
      group: 'Front-end',
      items: ['React', 'TypeScript', 'Angular', 'Tailwind CSS', 'Vite'],
    },
    {
      group: 'Creative dev',
      items: ['Three.js', 'GSAP', 'Web Audio API'],
    },
    {
      group: 'Back-end',
      items: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'JWT'],
    },
    {
      group: 'Cloud & ferramentas',
      items: ['Supabase', 'Google Gemini AI', 'Google Apps Script', 'Git & GitHub'],
    },
  ],
};
