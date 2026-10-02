import { gsap } from '../animations/gsap.js';

const CACHE_TTL = 1000 * 60 * 30; // 30 min — evita bater na API a cada navegação da SPA

/**
 * Busca, no navegador do visitante, o nº de repositórios públicos do GitHub
 * e substitui o número estático de `site.js` pelo valor real — com um
 * contador animado e um pontinho verde indicando "ao vivo".
 *
 * É só um reforço: a API do GitHub tem limite de requisições por IP, então
 * se a chamada falhar (rede, limite atingido, bloqueio de conteúdo) o
 * número estático definido em `site.stats` continua exibido normalmente.
 * Não há loading state nem retry — é progressive enhancement puro.
 */
export async function refreshGithubStats(username) {
  const wrapper = document.querySelector('[data-stat-id="repos"]');
  const target = wrapper?.querySelector('[data-count]');
  if (!wrapper || !target) return;

  try {
    const publicRepos = await getPublicRepoCount(username);
    if (!publicRepos) return;

    target.dataset.count = String(publicRepos); // garante que o count-up por scroll (se ainda não disparou) mire no valor certo

    const current = Number(target.textContent) || 0;
    if (publicRepos === current) {
      wrapper.classList.add('is-live');
      return;
    }

    const state = { value: current };
    gsap.to(state, {
      value: publicRepos,
      duration: 1.1,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate: () => (target.textContent = String(state.value)),
      onComplete: () => wrapper.classList.add('is-live'),
    });
  } catch {
    // Sem rede, CSP bloqueando, ou limite de requisições da API — mantém o número estático.
  }
}

async function getPublicRepoCount(username) {
  const cacheKey = `gh-public-repos:${username}`;
  const cached = readCache(cacheKey);
  if (cached != null) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const count = Number(data.public_repos);
    if (!Number.isFinite(count)) return null;
    writeCache(cacheKey, count);
    return count;
  } finally {
    clearTimeout(timeout);
  }
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, at } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL) return null;
    return value;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // Storage indisponível (modo privado etc.) — sem problema, só não cacheia.
  }
}
