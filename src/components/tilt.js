import { gsap } from '../animations/gsap.js';
import { hasFinePointer } from '../utils/env.js';

/**
 * Tilt 3D nos cards + brilho que segue o cursor + parallax da prévia.
 * Só ativa com mouse/trackpad (em telas de toque não faz sentido).
 *
 * O cálculo usa o retângulo do <article> (que não gira), e a rotação é aplicada
 * no filho `.project-tilt`. Assim a medição não "treme" com a própria inclinação.
 *
 * @returns {() => void} função de limpeza
 */
export function initTilt(cards, { max = 7 } = {}) {
  const cleanups = [];
  const canHover = hasFinePointer();

  cards.forEach((card) => {
    const tilt = card.querySelector('.project-tilt');
    const art = card.querySelector('.preview-art');
    if (art) gsap.set(art, { scale: 1.06 }); // folga para o parallax não mostrar bordas
    if (!canHover || !tilt) return;

    gsap.set(tilt, { transformPerspective: 1000 });
    const rotX = gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rotY = gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const artX = art ? gsap.quickTo(art, 'x', { duration: 0.9, ease: 'power3.out' }) : null;
    const artY = art ? gsap.quickTo(art, 'y', { duration: 0.9, ease: 'power3.out' }) : null;

    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width; // 0–1
      const py = (event.clientY - rect.top) / rect.height;

      rotY((px - 0.5) * 2 * max);
      rotX(-(py - 0.5) * 2 * max);
      artX?.(-(px - 0.5) * 26);
      artY?.(-(py - 0.5) * 18);

      tilt.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      tilt.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };

    const onLeave = () => {
      rotX(0);
      rotY(0);
      artX?.(0);
      artY?.(0);
    };

    card.addEventListener('pointermove', onMove, { passive: true });
    card.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
