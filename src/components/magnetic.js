import { gsap } from '../animations/gsap.js';
import { hasFinePointer, prefersReducedMotion } from '../utils/env.js';

/**
 * Efeito magnético: o elemento é "puxado" na direção do cursor.
 * @param {Element[]} elements
 * @param {number} strength  0–1
 * @returns {() => void} função de limpeza
 */
export function initMagnetic(elements, strength = 0.3) {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const cleanups = [];

  elements.forEach((el) => {
    const moveX = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    let rect = null;

    const onEnter = () => {
      rect = el.getBoundingClientRect(); // medido antes de qualquer deslocamento
    };
    const onMove = (event) => {
      if (!rect) return;
      moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
      moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const onLeave = () => {
      rect = null;
      moveX(0);
      moveY(0);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
