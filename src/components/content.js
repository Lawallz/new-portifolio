import { site } from '../data/site.js';
import { escapeHTML } from '../utils/env.js';
import { icons } from '../utils/icons.js';

const roll = (text) => `<span class="roll"><span>${text}</span><span aria-hidden="true">${text}</span></span>`;

/** Preenche as partes do HTML que vêm de src/data/site.js. */
export function renderSiteContent() {
  // Textos simples: <span data-site="name"></span>
  document.querySelectorAll('[data-site]').forEach((el) => {
    const value = site[el.dataset.site];
    if (value) el.textContent = value;
  });

  // Ícones declarados no HTML: <span data-icon="arrowUp" data-size="18"></span>
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const draw = icons[el.dataset.icon];
    if (draw) el.innerHTML = draw(el.dataset.size ? Number(el.dataset.size) : undefined);
  });

  // E-mail e ano
  const mailto = document.getElementById('mailto');
  if (mailto) mailto.href = `mailto:${site.email}`;
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Palavras rotativas do hero
  const rotator = document.querySelector('[data-rotator]');
  if (rotator) {
    rotator.innerHTML = site.roles.map((role) => `<span>${escapeHTML(role)}</span>`).join('');
  }

  // Faixa em movimento: duas linhas, cada uma com o conjunto repetido
  const star = `<span class="marquee-star">${icons.star(40)}</span>`;
  const set = site.marquee.map((word) => `<span>${escapeHTML(word)}</span>${star}`).join('');
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    track.innerHTML = set + set;
  });

  // Números
  const stats = document.getElementById('stats');
  if (stats) {
    stats.innerHTML = site.stats
      .map(
        (stat) => `
        <div class="flex flex-col-reverse gap-2"${stat.id ? ` data-stat-id="${escapeHTML(stat.id)}"` : ''}>
          <dt class="flex items-center gap-1.5 text-sm text-white/50">
            ${escapeHTML(stat.label)}
            ${stat.id ? '<span class="stat-live-dot" title="Atualizado ao vivo via API do GitHub" aria-hidden="true"></span>' : ''}
          </dt>
          <dd class="stat-number"><span data-count="${stat.value}">0</span><span class="text-violet-neon">${escapeHTML(stat.suffix)}</span></dd>
        </div>`,
      )
      .join('');
  }

  // Informações rápidas
  const facts = document.getElementById('facts');
  if (facts) {
    facts.innerHTML = site.facts
      .map(
        (fact) => `
        <div class="border-t border-white/10 pt-4">
          <dt class="text-sm text-white/50">${escapeHTML(fact.term)}</dt>
          <dd class="mt-1 text-white/85">${escapeHTML(fact.description)}</dd>
        </div>`,
      )
      .join('');
  }

  // Skills
  const skills = document.getElementById('skills');
  if (skills) {
    skills.innerHTML = site.skills
      .map(
        (group) => `
        <li class="skill-row">
          <span class="skill-line" aria-hidden="true"></span>
          <div class="grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
            <h3 class="font-display text-2xl font-semibold tracking-tight md:col-span-4 md:text-3xl">${escapeHTML(group.group)}</h3>
            <ul class="flex flex-wrap gap-x-6 gap-y-2 text-lg text-white/50 md:col-span-8">
              ${group.items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}
            </ul>
          </div>
        </li>`,
      )
      .join('');
  }

  // Redes sociais
  const socials = document.getElementById('socials');
  if (socials) {
    socials.innerHTML = site.socials
      .map(
        (social) => `
        <li>
          <a class="social-link group" href="${escapeHTML(social.href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(social.label)} (abre em nova aba)">
            ${roll(escapeHTML(social.label))}
            ${icons.arrowUpRight(36)}
          </a>
        </li>`,
      )
      .join('');
  }
}
