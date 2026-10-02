/**
 * Relógio no fuso configurado. Atualiza exatamente na virada do minuto,
 * sem manter um setInterval rodando à toa.
 * @returns {() => void} função de limpeza
 */
export function initLocalTime(element, timeZone) {
  if (!element) return () => {};
  const format = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone });
  let timer = 0;

  const update = () => {
    const now = new Date();
    element.textContent = format.format(now);
    element.dateTime = now.toISOString();
    timer = setTimeout(update, (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50);
  };
  update();

  return () => clearTimeout(timer);
}
