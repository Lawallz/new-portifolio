/** Helpers de ambiente. Avaliados sob demanda para refletir mudanças do sistema. */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** true em mouse/trackpad; false em telas de toque. */
export const hasFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isSmallScreen = () => window.matchMedia('(max-width: 768px)').matches;

/** Escapa texto vindo dos dados antes de interpolar em template strings HTML. */
export const escapeHTML = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
