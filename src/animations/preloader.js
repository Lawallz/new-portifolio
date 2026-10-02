import { gsap } from './gsap.js';
import { prefersReducedMotion } from '../utils/env.js';

/**
 * Preloader com contador. Resolve a Promise quando a cortina termina de subir.
 * O contador avança até ~90% de forma "falsa" e só chega a 100% quando as
 * dependências reais (fontes, cena 3D) ficaram prontas.
 *
 * @param {Promise<unknown>} ready  promessa das dependências críticas
 */
export function runPreloader(ready) {
  const root = document.getElementById('preloader');
  const counter = document.getElementById('preloader-count');
  const bar = document.getElementById('preloader-bar');
  if (!root) return Promise.resolve();

  const settled = ready.catch(() => {}); // nunca trava o site se algo falhar

  if (prefersReducedMotion()) {
    return settled.then(() => root.remove());
  }

  return new Promise((resolve) => {
    const state = { value: 0 };
    const render = () => {
      counter.textContent = String(Math.round(state.value)).padStart(2, '0');
      bar.style.transform = `scaleX(${state.value / 100})`;
    };

    const fake = gsap.to(state, { value: 90, duration: 1.6, ease: 'power2.out', onUpdate: render });

    settled.then(() => {
      fake.kill();
      gsap
        .timeline({ onComplete: () => { root.remove(); resolve(); } })
        .to(state, { value: 100, duration: 0.5, ease: 'power2.inOut', onUpdate: render })
        .to(counter.parentElement, { yPercent: -30, opacity: 0, duration: 0.5, ease: 'power3.in' }, '+=0.1')
        .to(root, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=0.15');
    });
  });
}
