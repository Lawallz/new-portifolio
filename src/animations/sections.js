import { gsap, ScrollTrigger, SplitText } from './gsap.js';

/**
 * Animações acionadas por scroll. Todas as funções devem ser chamadas dentro de
 * um gsap.matchMedia()/context para que sejam revertidas automaticamente.
 */

/** Títulos: revelação por linha com máscara. Usa autoSplit (re-divide ao redimensionar). */
export function revealHeadings() {
  gsap.utils.toArray('[data-reveal-lines]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });
}

/** Cards: abertura por clip-path + "zoom out" da prévia + parallax de scroll. */
export function animateProjectCards(cards) {
  if (!cards.length) return;
  const closed = 'inset(100% 0% 0% 0% round 24px)';
  const open = 'inset(0% 0% 0% 0% round 24px)';

  gsap.set(cards, { clipPath: closed });

  ScrollTrigger.batch(cards, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        clipPath: open,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.14,
        clearProps: 'clipPath',
      });
      gsap.fromTo(
        batch.map((card) => card.querySelector('.preview-art')).filter(Boolean),
        { scale: 1.4 },
        { scale: 1.06, duration: 1.8, ease: 'expo.out', stagger: 0.14 },
      );
    },
  });

  cards.forEach((card) => {
    const media = card.querySelector('.preview-media');
    if (!media) return;
    gsap.fromTo(
      media,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

/** Declaração do "Sobre": as palavras acendem (índigo → branco) conforme o scroll. */
export function scrubStatement() {
  const el = document.getElementById('about-statement');
  if (!el) return;
  SplitText.create(el, {
    type: 'words',
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: 0.14, color: '#6366f1' },
        {
          opacity: 1,
          color: '#ffffff',
          ease: 'none',
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true },
        },
      ),
  });
}

/** Contadores dos números. Lê o alvo de forma "preguiçosa" (função) porque
 * githubStats.js pode atualizar data-count depois que esta função já rodou. */
export function countUpStats() {
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const state = { value: 0 };
    gsap.to(state, {
      value: () => Number(el.dataset.count),
      duration: 2,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate: () => (el.textContent = state.value),
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

/** Linhas divisórias das skills "se desenham" quando entram na tela. */
export function drawSkillLines() {
  gsap.utils.toArray('.skill-line').forEach((line) => {
    gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: line, start: 'top 92%', once: true },
      },
    );
  });
}

/** Faixa de tecnologias: desliza em direções opostas conforme o scroll. */
export function scrubMarquee() {
  const section = document.querySelector('.marquee');
  if (!section) return;
  const scrollTrigger = { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
  gsap.fromTo('[data-marquee="left"]', { xPercent: 0 }, { xPercent: -14, ease: 'none', scrollTrigger });
  gsap.fromTo('[data-marquee="right"]', { xPercent: -14 }, { xPercent: 0, ease: 'none', scrollTrigger });
}

/** Hero sai com leve parallax e esmaece ao rolar. */
export function parallaxHero() {
  gsap.to('#hero-content', {
    yPercent: -14,
    opacity: 0.05,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/** Palavra gigante do rodapé sobe suavemente. */
export function parallaxWordmark() {
  const el = document.getElementById('footer-wordmark');
  if (!el) return;
  gsap.fromTo(
    el,
    { yPercent: 35 },
    {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom bottom', scrub: true },
    },
  );
}

/** Nav: esconde ao rolar para baixo, volta ao rolar para cima; ganha fundo após o topo. */
export function initNavBehaviour() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  let hidden = false;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 40);
      const shouldHide = y > 240 && self.direction === 1;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        gsap.to(nav, { yPercent: hidden ? -100 : 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      }
    },
  });
}

/** Revelação genérica de fade-up para blocos de texto fora do hero
 * (o hero tem sua própria sequência orquestrada em hero.js). */
export function revealFadeUps() {
  gsap.utils.toArray('[data-fade-up]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    );
  });
}

/** Mesma abertura por clip-path dos cards do grid, só que para um único
 * elemento maior (o projeto em destaque). */
export function revealFeatured(visualEl) {
  if (!visualEl) return;
  const closed = 'inset(100% 0% 0% 0% round 24px)';
  const open = 'inset(0% 0% 0% 0% round 24px)';

  gsap.set(visualEl, { clipPath: closed });

  ScrollTrigger.create({
    trigger: visualEl,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(visualEl, { clipPath: open, duration: 1.6, ease: 'expo.out', clearProps: 'clipPath' });
      const art = visualEl.querySelector('.preview-art');
      if (art) gsap.fromTo(art, { scale: 1.35 }, { scale: 1.06, duration: 2, ease: 'expo.out' });
    },
  });
}

/** Navegação lateral por seção: acende o ponto da seção visível no momento. */
export function initSectionDots() {
  const dots = gsap.utils.toArray('[data-section-dot]');
  if (!dots.length) return;

  const setActive = (id) => {
    dots.forEach((dot) => dot.classList.toggle('is-active', dot.dataset.sectionDot === id));
  };

  dots.forEach((dot) => {
    const section = document.getElementById(dot.dataset.sectionDot);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => self.isActive && setActive(dot.dataset.sectionDot),
    });
  });
}
