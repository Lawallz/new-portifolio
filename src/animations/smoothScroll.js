import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './gsap.js';
import { prefersReducedMotion } from '../utils/env.js';

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Scroll suave (Lenis) sincronizado com o ScrollTrigger.
 * Com "reduzir movimento" ativo no sistema, usa o scroll nativo.
 */
export function initSmoothScroll() {
  const reduced = prefersReducedMotion();
  const lenis = reduced ? null : new Lenis({ lerp: 0.1, smoothWheel: true });

  let tick = null;
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    tick = (time) => lenis.raf(time * 1000); // GSAP usa segundos, Lenis usa ms
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  const scrollTo = (target, options = {}) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: easeOutExpo, ...options });
    else if (target === 0) window.scrollTo({ top: 0 });
    else document.querySelector(target)?.scrollIntoView();
  };

  /** Intercepta âncoras internas (#projects etc.) para usar o scroll suave. */
  const onAnchorClick = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    scrollTo(target);
    history.replaceState(null, '', hash);
  };
  document.addEventListener('click', onAnchorClick);

  return {
    lenis,
    scrollTo,
    stop: () => lenis?.stop(),
    start: () => lenis?.start(),
    destroy() {
      document.removeEventListener('click', onAnchorClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    },
  };
}
