import { escapeHTML } from '../utils/env.js';
import { icons } from '../utils/icons.js';

/** Cor do brilho de cada card + cor secundária usada nas prévias geradas. */
const ACCENTS = {
  indigo: { hex: '#6366f1', rgb: '99 102 241', second: '#a855f7' },
  violet: { hex: '#a855f7', rgb: '168 85 247', second: '#6366f1' },
  emerald: { hex: '#34d399', rgb: '52 211 153', second: '#6366f1' },
};

/* ---------------------------------------------------------------------- */
/* Prévias geradas (usadas quando o projeto não tem `image`)               */
/* Cada uma é um SVG 640×400 com ids únicos por projeto.                   */
/* ---------------------------------------------------------------------- */

const blob = (id, color) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity=".9"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

const wrap = (body) =>
  `<svg class="preview-art" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect width="640" height="400" fill="#07070b"/>${body}</svg>`;

const ART = {
  chart(u, a, b) {
    const bars = [90, 140, 110, 180, 150, 230, 190, 270, 220, 300];
    const rects = bars
      .map((h, i) => `<rect x="${52 + i * 50}" y="${360 - h}" width="28" height="${h}" rx="8" fill="url(#${u}-bar)"/>`)
      .join('');
    const line = bars.map((h, i) => `${66 + i * 50},${340 - h * 0.9 - (i % 3) * 8}`).join(' ');
    const grid = [110, 170, 230, 290, 350]
      .map((y) => `<line x1="36" x2="604" y1="${y}" y2="${y}" stroke="#fff" stroke-opacity=".06"/>`)
      .join('');
    return wrap(`
      <defs>${blob(`${u}-a`, a)}${blob(`${u}-b`, b)}
        <linearGradient id="${u}-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${a}" stop-opacity=".04"/></linearGradient>
      </defs>
      <circle cx="120" cy="40" r="280" fill="url(#${u}-a)" opacity=".45"/>
      <circle cx="580" cy="400" r="260" fill="url(#${u}-b)" opacity=".4"/>
      ${grid}${rects}
      <polyline points="${line}" fill="none" stroke="${b}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="400" y="64" width="196" height="84" rx="16" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".14"/>
      <rect x="420" y="84" width="70" height="8" rx="4" fill="#fff" fill-opacity=".35"/>
      <rect x="420" y="106" width="110" height="22" rx="7" fill="${a}"/>`);
  },

  orbs(u, a, b) {
    return wrap(`
      <defs>${blob(`${u}-a`, a)}${blob(`${u}-b`, b)}
        <radialGradient id="${u}-p" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="${b}" stop-opacity=".7"/></radialGradient>
      </defs>
      <circle cx="320" cy="200" r="300" fill="url(#${u}-a)" opacity=".4"/>
      <g fill="none" stroke="#fff" stroke-opacity=".16" transform="rotate(-18 320 200)">
        <ellipse cx="320" cy="200" rx="170" ry="52"/><ellipse cx="320" cy="200" rx="235" ry="76"/><ellipse cx="320" cy="200" rx="300" ry="100"/>
      </g>
      <circle cx="320" cy="200" r="66" fill="url(#${u}-p)"/>
      <circle cx="98" cy="262" r="10" fill="${b}"/><circle cx="530" cy="130" r="7" fill="#fff" fill-opacity=".8"/><circle cx="470" cy="286" r="5" fill="${a}"/>`);
  },

  waves(u, a, b) {
    const path = (k) => {
      const pts = [];
      for (let x = 0; x <= 640; x += 16) {
        const y = 200 + Math.sin(x * 0.016 + k * 0.55) * (34 + k * 8) * Math.sin(x * 0.004 + k * 0.3 + 1);
        pts.push(`${x},${y.toFixed(1)}`);
      }
      return `<path d="M${pts.join(' L')}" fill="none" stroke="url(#${u}-s)" stroke-width="${1.2 + k * 0.12}" stroke-opacity="${(0.16 + k * 0.09).toFixed(2)}"/>`;
    };
    const eq = Array.from({ length: 32 }, (_, i) => {
      const h = 14 + Math.abs(Math.sin(i * 0.7) * 46) + (i % 5) * 4;
      return `<rect x="${24 + i * 19}" y="${386 - h}" width="8" height="${h}" rx="4" fill="${a}" fill-opacity=".35"/>`;
    }).join('');
    return wrap(`
      <defs>${blob(`${u}-a`, a)}
        <linearGradient id="${u}-s" x1="0" x2="1"><stop offset="0" stop-color="${b}"/><stop offset=".5" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      </defs>
      <ellipse cx="320" cy="200" rx="360" ry="170" fill="url(#${u}-a)" opacity=".38"/>
      ${Array.from({ length: 9 }, (_, k) => path(k)).join('')}${eq}`);
  },

  mesh(u, a, b) {
    return wrap(`
      <defs>${blob(`${u}-a`, a)}${blob(`${u}-b`, b)}</defs>
      <circle cx="170" cy="120" r="260" fill="url(#${u}-a)" opacity=".55"/>
      <circle cx="500" cy="300" r="270" fill="url(#${u}-b)" opacity=".5"/>
      <g stroke="#fff" stroke-opacity=".14" fill="#fff" fill-opacity=".05">
        <rect x="70" y="86" width="270" height="170" rx="20"/>
        <rect x="250" y="150" width="270" height="170" rx="20" fill-opacity=".08"/>
      </g>
      <circle cx="108" cy="126" r="16" fill="${a}"/>
      <rect x="136" y="116" width="96" height="8" rx="4" fill="#fff" fill-opacity=".5"/>
      <rect x="136" y="132" width="60" height="6" rx="3" fill="#fff" fill-opacity=".25"/>
      <rect x="94" y="170" width="200" height="8" rx="4" fill="#fff" fill-opacity=".22"/>
      <rect x="94" y="192" width="160" height="8" rx="4" fill="#fff" fill-opacity=".16"/>
      <rect x="278" y="188" width="90" height="10" rx="5" fill="#fff" fill-opacity=".55"/>
      <rect x="278" y="214" width="210" height="8" rx="4" fill="#fff" fill-opacity=".2"/>
      <rect x="278" y="236" width="170" height="8" rx="4" fill="#fff" fill-opacity=".14"/>
      <rect x="430" y="270" width="72" height="30" rx="15" fill="${b}"/>`);
  },

  grid(u, a, b) {
    const horizon = 170;
    const verticals = Array.from({ length: 21 }, (_, i) => {
      const x2 = 320 + (i - 10) * 90;
      return `<line x1="320" y1="${horizon}" x2="${x2}" y2="400" stroke="${a}" stroke-opacity=".32"/>`;
    }).join('');
    const horizontals = Array.from({ length: 10 }, (_, i) => {
      const y = horizon + 230 * Math.pow((i + 1) / 10, 2.2);
      return `<line x1="0" x2="640" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${a}" stroke-opacity="${(0.12 + i * 0.03).toFixed(2)}"/>`;
    }).join('');
    return wrap(`
      <defs>${blob(`${u}-a`, b)}
        <linearGradient id="${u}-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07070b"/><stop offset="1" stop-color="#07070b" stop-opacity="0"/></linearGradient>
      </defs>
      <circle cx="320" cy="${horizon}" r="230" fill="url(#${u}-a)" opacity=".7"/>
      ${verticals}${horizontals}
      <rect y="0" width="640" height="${horizon}" fill="url(#${u}-f)" opacity=".55"/>
      <circle cx="320" cy="${horizon}" r="44" fill="${b}"/>
      <g fill="#fff" fill-opacity=".8"><rect x="64" y="70" width="110" height="10" rx="5"/><rect x="64" y="92" width="70" height="8" rx="4" fill-opacity=".4"/></g>`);
  },

  blocks(u, a, b) {
    const pattern = [1, 0, 2, 0, 1, 0, 0, 2, 0, 1, 2, 0, 1, 0, 0, 0, 1, 2, 0, 1, 0, 2, 0, 1];
    const tiles = pattern
      .map((t, i) => {
        const x = 52 + (i % 6) * 92;
        const y = 56 + Math.floor(i / 6) * 76;
        if (t === 1) return `<rect x="${x}" y="${y}" width="80" height="64" rx="14" fill="url(#${u}-f)"/>`;
        if (t === 2) return `<rect x="${x}" y="${y}" width="80" height="64" rx="14" fill="none" stroke="${b}" stroke-opacity=".7" stroke-width="1.5"/>`;
        return `<rect x="${x}" y="${y}" width="80" height="64" rx="14" fill="#fff" fill-opacity=".05" stroke="#fff" stroke-opacity=".1"/>`;
      })
      .join('');
    return wrap(`
      <defs>${blob(`${u}-a`, a)}
        <linearGradient id="${u}-f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      </defs>
      <circle cx="320" cy="200" r="320" fill="url(#${u}-a)" opacity=".28"/>${tiles}`);
  },
};

/* ---------------------------------------------------------------------- */
/* Template do card                                                        */
/* ---------------------------------------------------------------------- */

function renderPreview(project, accent) {
  const target = project.live || project.repo || '#';
  const media = project.image
    ? `<img class="preview-art" src="${escapeHTML(project.image)}" alt="Prévia do projeto ${escapeHTML(project.title)}" loading="lazy" decoding="async" />`
    : (ART[project.variant] ?? ART.mesh)(project.id, accent.hex, accent.second);

  return `
    <a class="project-preview ${escapeHTML(project.aspect || 'aspect-[16/10]')}" href="${escapeHTML(target)}" target="_blank" rel="noopener noreferrer"
       aria-label="Abrir ${escapeHTML(project.title)} em nova aba" data-cursor="Abrir">
      <div class="preview-media">${media}</div>
      <div class="preview-chrome" aria-hidden="true"><i></i><i></i><i></i><span></span></div>
      <span class="preview-cta" aria-hidden="true">Ver projeto ${icons.arrowUpRight(13)}</span>
    </a>`;
}

function renderTags(project) {
  return project.tags
    .map((tag) => `<li class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">${escapeHTML(tag)}</li>`)
    .join('');
}

function renderLinks(project, title) {
  const liveLink = project.live
    ? `<a class="project-link" href="${escapeHTML(project.live)}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${title} online">
         <span class="project-link__dot" aria-hidden="true"></span>Ver online
       </a>`
    : '';
  const repoLink = project.repo
    ? `<a class="project-link" href="${escapeHTML(project.repo)}" target="_blank" rel="noopener noreferrer" aria-label="Ver código de ${title} no GitHub">
         ${icons.github(16)}Código
       </a>`
    : '';
  return liveLink + repoLink;
}

function renderCard(project) {
  const accent = ACCENTS[project.accent] ?? ACCENTS.indigo;
  const title = escapeHTML(project.title);

  return `
    <article class="project-card ${escapeHTML(project.span || 'md:col-span-6')}" style="--accent-rgb: ${accent.rgb}" data-project="${escapeHTML(project.id)}">
      <div class="project-tilt">
        <div class="project-glow" aria-hidden="true"></div>
        ${renderPreview(project, accent)}
        <div class="px-3 pb-4 pt-6 md:px-4">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 class="project-title font-display text-3xl font-semibold tracking-tight md:text-4xl">${title}</h3>
            <p class="text-sm text-white/45">${escapeHTML(project.kind)}, ${escapeHTML(project.year)}</p>
          </div>
          <p class="mt-3 max-w-[52ch] leading-relaxed text-white/60">${escapeHTML(project.description)}</p>
          <ul class="mt-5 flex flex-wrap gap-2" aria-label="Tecnologias usadas">${renderTags(project)}</ul>
          <div class="mt-6 flex flex-wrap items-center gap-3">${renderLinks(project, title)}</div>
        </div>
      </div>
    </article>`;
}

/**
 * Tratamento maior para o primeiro projeto da lista: prévia grande à
 * esquerda (reaproveitando o mesmo `.project-tilt`, então tilt/glow/hover
 * funcionam de graça) e texto maior à direita. Devolve o elemento que serve
 * de "card" pra o tilt.js — só a moldura da prévia, não o bloco inteiro,
 * pra inclinar em resposta ao mouse só quando o cursor está sobre a imagem.
 */
function renderFeatured(project) {
  const accent = ACCENTS[project.accent] ?? ACCENTS.indigo;
  const title = escapeHTML(project.title);

  return `
    <div class="featured-project" style="--accent-rgb: ${accent.rgb}" data-project="${escapeHTML(project.id)}">
      <div class="grid gap-8 md:grid-cols-12 md:items-center md:gap-10">
        <div class="featured-project__visual md:col-span-7">
          <div class="project-tilt">
            <div class="project-glow" aria-hidden="true"></div>
            ${renderPreview(project, accent)}
          </div>
        </div>
        <div class="md:col-span-5">
          <p class="eyebrow mb-4" data-fade-up>Projeto em destaque</p>
          <h3 data-reveal-lines class="project-title font-display text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">${title}</h3>
          <div data-fade-up>
            <p class="mt-5 max-w-md text-lg leading-relaxed text-white/60">${escapeHTML(project.description)}</p>
            <ul class="mt-6 flex flex-wrap gap-2" aria-label="Tecnologias usadas">${renderTags(project)}</ul>
            <div class="mt-8 flex flex-wrap items-center gap-4">${renderLinks(project, title)}</div>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * Renderiza o projeto em destaque dentro do container e devolve o elemento
 * que deve ser passado pro initTilt (a moldura da prévia, não a section toda).
 * @param {HTMLElement} container
 * @param {object} project
 */
export function renderFeaturedProject(container, project) {
  if (!container || !project) return null;
  container.innerHTML = renderFeatured(project);
  return container.querySelector('.featured-project__visual');
}

/**
 * Renderiza os cards dentro do container e devolve os elementos <article>.
 * @param {HTMLElement} container
 * @param {Array} projects
 */
export function renderProjects(container, projects) {
  container.innerHTML = projects.map(renderCard).join('');
  return Array.from(container.querySelectorAll('.project-card'));
}
