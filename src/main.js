import './styles/main.css';

import { site } from './data/site.js';
import { projects } from './data/projects.js';
import { prefersReducedMotion, isSmallScreen } from './utils/env.js';

import { renderSiteContent } from './components/content.js';
import { renderProjects, renderFeaturedProject } from './components/ProjectCard.js';
import { initTilt } from './components/tilt.js';
import { initCursor } from './components/cursor.js';
import { initMagnetic } from './components/magnetic.js';
import { initCopyEmail } from './components/copyEmail.js';
import { initLocalTime } from './components/localTime.js';
import { refreshGithubStats } from './components/githubStats.js';
import { initScramble } from './components/scramble.js';

import { runPreloader } from './animations/preloader.js';
import { prepareHero, playHeroIntro } from './animations/hero.js';
import { initAnimations } from './animations/index.js';
import { initSmoothScroll } from './animations/smoothScroll.js';

/** Funções de limpeza acumuladas, chamadas em app.destroy() (útil em HMR). */
const cleanups = [];
const onCleanup = (fn) => fn && cleanups.push(fn);

async function main() {
  const reducedMotion = prefersReducedMotion();

  // 1) Conteúdo primeiro: preenche textos/cards antes de qualquer animação medir o DOM.
  renderSiteContent();
  const featuredVisual = renderFeaturedProject(document.getElementById('featured-project'), projects[0]);
  const cards = renderProjects(document.getElementById('projects'), projects.slice(1));
  prepareHero();

  // 2) Cena 3D, carregada sob demanda (vira um chunk separado do bundle).
  const canvas = document.getElementById('gl-canvas');
  const lowPower =
    isSmallScreen() || (navigator.hardwareConcurrency ?? 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4;

  let scene = null;
  const sceneReady = import('./webgl/ParticleScene.js')
    .then(({ ParticleScene }) => {
      scene = new ParticleScene(canvas, { lowPower, reducedMotion });
      scene.renderer.render(scene.scene, scene.camera); // compila os shaders antes da cortina subir
      return scene;
    })
    .catch((error) => {
      console.error('Não foi possível iniciar a cena 3D:', error);
      canvas?.remove();
      return null;
    });

  // 3) Preloader: some assim que fontes + cena 3D estiverem prontas (com piso e teto de tempo).
  const minimumDelay = new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : 700));
  const ready = Promise.all([document.fonts.ready, sceneReady, minimumDelay]);
  await runPreloader(ready);

  // 4) Scroll suave + progresso ligado ao scroll (funciona mesmo sem a cena 3D).
  const smoothScroll = initSmoothScroll();
  onCleanup(smoothScroll.destroy);

  // 5) Liga a cena e a animação de entrada do hero.
  if (scene) {
    scene.start();
    scene.reveal();
    onCleanup(() => scene.destroy());
  }
  playHeroIntro();

  // 6) Demais animações e interações.
  onCleanup(initAnimations({ scene, cards, featuredVisual }));
  onCleanup(initTilt(featuredVisual ? [...cards, featuredVisual] : cards));
  onCleanup(initCursor());
  onCleanup(initMagnetic(document.querySelectorAll('[data-magnetic]')));
  onCleanup(initCopyEmail(site.email));
  onCleanup(initLocalTime(document.getElementById('local-time'), site.timezone));
  onCleanup(
    initScramble(
      document.querySelectorAll('.nav-link, .nav-cta, .project-title:not([data-reveal-lines])'),
    ),
  );

  // Reforço opcional: nº real de repositórios públicos, direto da API do GitHub.
  // Nunca bloqueia nada — se falhar, o número estático de site.js permanece.
  const githubUsername = site.socials.find((s) => s.label === 'GitHub')?.href.split('/').filter(Boolean).pop();
  if (githubUsername) refreshGithubStats(githubUsername);
}

main().catch((error) => {
  // Falha inesperada: garante que o preloader não fique travado escondendo o site.
  console.error(error);
  document.getElementById('preloader')?.remove();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((fn) => fn()));
}
