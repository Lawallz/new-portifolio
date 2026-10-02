import { gsap } from '../animations/gsap.js';
import { prefersReducedMotion } from '../utils/env.js';

/** Copia texto: Clipboard API quando disponível, com fallback para execCommand. */
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* cai no fallback (ex.: página sem permissão ou sem HTTPS) */
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/**
 * Botão de copiar e-mail com feedback visual (troca de rótulo + ícone, cor
 * esmeralda) e anúncio para leitores de tela via #toast (aria-live).
 *
 * Estrutura esperada no HTML:
 *   <button id="copy-email"> [data-icon-copy] [data-icon-check] [data-copy-default] [data-copy-done] </button>
 *
 * @returns {() => void} função de limpeza
 */
export function initCopyEmail(email) {
  const button = document.getElementById('copy-email');
  if (!button) return () => {};

  const iconCopy = button.querySelector('[data-icon-copy]');
  const iconCheck = button.querySelector('[data-icon-check]');
  const labelDefault = button.querySelector('[data-copy-default]');
  const labelDone = button.querySelector('[data-copy-done]');
  const toast = document.getElementById('toast');
  const reduced = prefersReducedMotion();

  const resting = { yPercent: 0, opacity: 1 };
  gsap.set(labelDone, { yPercent: 110, opacity: 0 });
  gsap.set(iconCheck, { scale: 0, rotate: -45 });

  let timer = 0;

  const show = (state, message) => {
    button.dataset.state = state;
    labelDone.textContent = message;
    if (toast) toast.textContent = message;

    const d = reduced ? 0 : 0.5;
    gsap.to(labelDefault, { yPercent: -110, opacity: 0, duration: d, ease: 'expo.out', overwrite: true });
    gsap.to(labelDone, { yPercent: 0, opacity: 1, duration: d, ease: 'expo.out', overwrite: true });
    gsap.to(iconCopy, { scale: 0, rotate: 45, duration: d * 0.7, ease: 'power3.in', overwrite: true });
    if (state === 'copied') {
      gsap.to(iconCheck, { scale: 1, rotate: 0, duration: d * 1.2, delay: d * 0.4, ease: 'back.out(2.2)', overwrite: true });
    }

    clearTimeout(timer);
    timer = setTimeout(reset, 2400);
  };

  const reset = () => {
    delete button.dataset.state;
    if (toast) toast.textContent = '';
    const d = reduced ? 0 : 0.5;
    gsap.to(labelDone, { yPercent: 110, opacity: 0, duration: d, ease: 'expo.inOut', overwrite: true });
    gsap.to(labelDefault, { ...resting, duration: d, ease: 'expo.inOut', overwrite: true });
    gsap.to(iconCheck, { scale: 0, rotate: -45, duration: d * 0.6, ease: 'power3.in', overwrite: true });
    gsap.to(iconCopy, { scale: 1, rotate: 0, duration: d, delay: d * 0.3, ease: 'back.out(2)', overwrite: true });
  };

  const onClick = async () => {
    const ok = await copyText(email);
    if (ok) show('copied', 'E-mail copiado');
    else show('error', 'Não foi possível copiar');
  };

  button.addEventListener('click', onClick);
  return () => {
    clearTimeout(timer);
    button.removeEventListener('click', onClick);
  };
}
