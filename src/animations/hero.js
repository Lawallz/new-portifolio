import { gsap } from './gsap.js';
import { prefersReducedMotion } from '../utils/env.js';

const LINES = '[data-hero-line] > span';
const FADES = '[data-hero-fade]';
const NAV = '.site-nav';
const IDE_LINES = '.ide-line';
const IDE_CARET = '[data-ide-caret]';

/** Esconde os elementos do hero antes do preloader terminar (evita "flash"). */
export function prepareHero() {
  if (prefersReducedMotion()) return;
  gsap.set(LINES, { yPercent: 115 });
  gsap.set(FADES, { opacity: 0, y: 24 });
  gsap.set(NAV, { opacity: 0, y: -16 });
}

/** A única sequência de entrada "orquestrada" da página. */
export function playHeroIntro() {
  if (prefersReducedMotion()) return null;
  return gsap
    .timeline()
    .to(LINES, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.12 })
    .to(FADES, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, '-=1.05')
    .to(NAV, { opacity: 1, y: 0, duration: 1 }, '<')
    // "Digita" o snippet de código linha a linha, feito o cursor de um editor.
    .to(IDE_LINES, { clipPath: 'inset(0 0% 0 0)', duration: 0.45, ease: 'steps(10)', stagger: 0.2 }, '+=0.1')
    .to(IDE_CARET, { opacity: 1, duration: 0.01 }, '-=0.1')
    .call(() => document.querySelector(IDE_CARET)?.classList.add('is-blinking'));
}

/**
 * Palavras que alternam no subtítulo ("Sou …").
 * As palavras ficam empilhadas na mesma célula do grid (a largura é a da maior).
 */
export function initRotator(container) {
  if (!container) return;
  const words = gsap.utils.toArray(container.children);
  if (words.length < 2) return;

  // O CSS deixa só a 1ª palavra visível (fallback p/ "reduzir movimento").
  gsap.set(words, { yPercent: 110, opacity: 1 });
  gsap.set(words[0], { yPercent: 0 });

  const tl = gsap.timeline({ repeat: -1, delay: 3 });
  words.forEach((word, i) => {
    const next = words[(i + 1) % words.length];
    tl.to(word, { yPercent: -110, duration: 0.8, ease: 'expo.inOut' }, '+=1.9').fromTo(
      next,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.8, ease: 'expo.inOut' },
      '<',
    );
  });
}
