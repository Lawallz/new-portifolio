import { gsap, ScrollTrigger } from './gsap.js';
import { initRotator } from './hero.js';
import {
  revealHeadings,
  animateProjectCards,
  revealFeatured,
  revealFadeUps,
  scrubStatement,
  countUpStats,
  drawSkillLines,
  scrubMarquee,
  parallaxHero,
  parallaxWordmark,
  initNavBehaviour,
  initSectionDots,
} from './sections.js';

/** Camadas de cor que acompanham o scroll — ver .scroll-tint no CSS.
 * Cada uma tem um "centro" (0–1, posição na página) e um "raio" de
 * influência; a opacidade cai suavemente à medida que o scroll se afasta
 * do centro, criando uma transição de cor entre as seções. */
const TINT_ZONES = [
  { selector: '.scroll-tint--indigo', center: 0.04, spread: 0.16 },
  { selector: '.scroll-tint--violet', center: 0.45, spread: 0.32 },
  { selector: '.scroll-tint--emerald', center: 0.92, spread: 0.28 },
];

function setupTintLayers() {
  return TINT_ZONES.map(({ selector, center, spread }) => {
    const el = document.querySelector(selector);
    return el ? { center, spread, set: gsap.quickSetter(el, 'opacity') } : null;
  }).filter(Boolean);
}

/**
 * Orquestra todas as animações de scroll.
 *
 * - O que depende de movimento roda dentro de gsap.matchMedia():
 *   com "reduzir movimento" ativo, o conteúdo simplesmente aparece estático.
 * - O elo cena 3D ↔ scroll, a barra de progresso, o tingimento de fundo e os
 *   pontos de navegação funcionam em qualquer caso (não são decoração pura).
 *
 * @param {{ scene: object|null, cards: Element[], featuredVisual: Element|null }} deps
 * @returns {() => void} função de limpeza
 */
export function initAnimations({ scene, cards, featuredVisual }) {
  const progressBar = document.getElementById('progress');
  const setProgress = gsap.quickSetter(progressBar, 'scaleX');
  const tintLayers = setupTintLayers();

  const link = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      scene?.setScroll(self.progress);
      setProgress(self.progress);
      tintLayers.forEach(({ center, spread, set }) => {
        const falloff = Math.max(0, 1 - Math.abs(self.progress - center) / spread);
        set(falloff * 0.16);
      });
    },
  });

  initSectionDots();

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    initRotator(document.querySelector('[data-rotator]'));
    parallaxHero();
    revealHeadings();
    revealFeatured(featuredVisual);
    animateProjectCards(cards);
    revealFadeUps();
    scrubStatement();
    countUpStats();
    drawSkillLines();
    scrubMarquee();
    parallaxWordmark();
    initNavBehaviour();
  });

  // Alturas mudam quando fontes/SVG terminam de carregar
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);

  return () => {
    window.removeEventListener('load', refresh);
    link.kill();
    mm.revert();
  };
}
