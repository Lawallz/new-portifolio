import { gsap } from '../animations/gsap.js';
import { hasFinePointer } from '../utils/env.js';

/**
 * Cursor customizado (só em dispositivos com mouse).
 * - Cresce sobre links e botões.
 * - Mostra um rótulo sobre elementos com data-cursor="Texto".
 * - Puxa um rastro de 3 pontinhos atrás de si, com atraso crescente.
 *
 * @returns {() => void} função de limpeza
 */
export function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || !hasFinePointer()) {
    el?.remove();
    return () => {};
  }

  const label = el.querySelector('[data-cursor-label]');
  document.documentElement.classList.add('has-cursor');

  // Rastro: pontinhos criados em JS (não precisam existir no HTML) que
  // seguem o cursor principal com uma easing cada vez mais lenta.
  const trail = Array.from({ length: 3 }, (_, i) => {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    dot.style.setProperty('--i', String(i));
    document.body.appendChild(dot);
    return dot;
  });

  gsap.set([el, ...trail], { xPercent: -50, yPercent: -50 });
  const moveX = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' });
  const moveY = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' });
  const trailMovers = trail.map((dot, i) => ({
    x: gsap.quickTo(dot, 'x', { duration: 0.32 + i * 0.14, ease: 'power2.out' }),
    y: gsap.quickTo(dot, 'y', { duration: 0.32 + i * 0.14, ease: 'power2.out' }),
  }));

  const onMove = (event) => {
    moveX(event.clientX);
    moveY(event.clientY);
    trailMovers.forEach(({ x, y }) => {
      x(event.clientX);
      y(event.clientY);
    });
    el.classList.add('is-visible');
    trail.forEach((dot) => dot.classList.add('is-visible'));
  };

  const onOver = (event) => {
    const labelled = event.target.closest?.('[data-cursor]');
    const interactive = event.target.closest?.('a, button, [data-magnetic]');
    el.classList.toggle('is-label', Boolean(labelled));
    el.classList.toggle('is-hover', Boolean(interactive) && !labelled);
    if (labelled) label.textContent = labelled.dataset.cursor;
  };

  const onLeaveWindow = () => {
    el.classList.remove('is-visible');
    trail.forEach((dot) => dot.classList.remove('is-visible'));
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', onOver, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeaveWindow);

  return () => {
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
    document.documentElement.classList.remove('has-cursor');
    trail.forEach((dot) => dot.remove());
  };
}
