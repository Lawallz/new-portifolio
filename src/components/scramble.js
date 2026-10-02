import { hasFinePointer, prefersReducedMotion } from '../utils/env.js';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const STEP_MS = 28;

/** "Decodifica" o texto de `el` a partir de caracteres aleatórios, da
 * esquerda pra direita, até chegar no texto original. */
function scramble(el, duration = 500) {
  const original = el.dataset.scrambleText ?? el.textContent;
  el.dataset.scrambleText = original; // guarda o texto real, mesmo se o hover pegar no meio de uma passada anterior

  const steps = Math.max(1, Math.round(duration / STEP_MS));
  let frame = 0;

  clearInterval(el._scrambleTimer);
  el._scrambleTimer = setInterval(() => {
    frame++;
    el.textContent = original
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        const lockAt = (i / original.length) * steps;
        if (frame >= lockAt + steps * 0.4) return char;
        return CHARS[(Math.random() * CHARS.length) | 0];
      })
      .join('');

    if (frame >= steps) {
      clearInterval(el._scrambleTimer);
      el.textContent = original;
    }
  }, STEP_MS);
}

/**
 * Efeito de "decodificação" no hover — só para quem tem mouse e não pediu
 * pra reduzir movimento (mesmo critério de tilt.js/magnetic.js).
 * @returns {() => void} função de limpeza
 */
export function initScramble(elements, duration) {
  if (!hasFinePointer() || prefersReducedMotion()) return () => {};

  const cleanups = [];
  elements.forEach((el) => {
    const onEnter = () => scramble(el, duration);
    el.addEventListener('pointerenter', onEnter);
    cleanups.push(() => {
      el.removeEventListener('pointerenter', onEnter);
      clearInterval(el._scrambleTimer);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
