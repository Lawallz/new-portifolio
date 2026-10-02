# Portfólio de Pedro Lawall Santos — Vite + Three.js + GSAP

Portfólio de desenvolvedor em dark mode, com um campo de partículas em WebGL
reagindo ao mouse no fundo, animações de scroll com GSAP + ScrollTrigger,
cards de projeto com tilt 3D e brilho neon, scroll suave via Lenis, e uma
janela de código no hero que "digita" sozinha ao carregar a página.

Os 6 projetos exibidos são reais, puxados do GitHub
([github.com/Lawallz](https://github.com/Lawallz)) — nada de dado inventado;
o número de repositórios em "Sobre" inclusive é atualizado ao vivo via API
do GitHub sempre que o navegador do visitante conseguir acessá-la.

**Stack:** Vite · JavaScript vanilla (módulos ES) · Tailwind CSS v4 · Three.js
· GSAP (ScrollTrigger + SplitText) · Lenis.

---

## Como rodar

Requer Node 18.19+ (recomendado Node 20 ou 22).

```bash
npm install
npm run dev        # ambiente de desenvolvimento, http://localhost:5173
npm run build       # build de produção -> pasta dist/
npm run preview     # serve a build de produção localmente
```

Não há chaves de API nem variáveis de ambiente — o projeto é 100% estático.

---

## Estrutura de arquivos

```
portfolio/
├── index.html                    Marcação da página inteira (uma única página)
├── vite.config.js                Plugin do Tailwind v4
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.js                   Ponto de entrada: liga dados → DOM → 3D → animações
    ├── styles/
    │   └── main.css              Tokens de design (@theme) + estilos componentizados
    │
    ├── data/                     ★ EDITE AQUI PARA PERSONALIZAR O CONTEÚDO
    │   ├── site.js                Nome, e-mail, redes sociais, skills, números
    │   └── projects.js            Lista de projetos exibidos na seção "Projetos"
    │
    ├── webgl/                    Cena Three.js (isolada, sem depender do resto)
    │   ├── ParticleScene.js       Classe da cena: partículas, esfera, wireframes
    │   └── shaders.js             Vertex/fragment shader (GLSL) das partículas
    │
    ├── animations/                Tudo relacionado a GSAP
    │   ├── gsap.js                 Registro único dos plugins (ScrollTrigger, SplitText)
    │   ├── smoothScroll.js         Integração Lenis ↔ ScrollTrigger
    │   ├── preloader.js            Tela de carregamento com contador 0→100
    │   ├── hero.js                 Entrada do hero + palavras rotativas
    │   ├── sections.js             Reveal de títulos, cards, contadores, skills…
    │   └── index.js                Orquestra tudo, com matchMedia p/ "reduzir movimento"
    │
    ├── components/                Peças de UI reutilizáveis (DOM + interação)
    │   ├── content.js              Injeta os dados de site.js no HTML
    │   ├── ProjectCard.js          Gera o HTML de cada card (+ prévias SVG geradas)
    │   ├── tilt.js                 Tilt 3D dos cards ao mover o mouse
    │   ├── cursor.js                Cursor customizado
    │   ├── magnetic.js              Efeito "magnético" em botões
    │   ├── copyEmail.js             Botão de copiar e-mail com feedback
    │   ├── localTime.js             Relógio do fuso horário no rodapé
    │   ├── scramble.js              Efeito de "decodificar" texto no hover (links, títulos)
    │   └── githubStats.js           Busca ao vivo o nº de repos públicos na API do GitHub
    │
    └── utils/
        ├── env.js                  Detecção de touch/mouse, "reduzir movimento", escapeHTML
        └── icons.js                 Ícones SVG inline (sem dependência externa)
```

---

## Para personalizar

### 1. Seus dados (o essencial)
Edite **`src/data/site.js`**: nome, e-mail, redes sociais, cargos que giram no
hero, tecnologias da faixa animada, números de estatística, skills.

Os três números em "Sobre" (`stats`) e as skills foram escolhidos por serem
verificáveis — nada de "6 anos de experiência" ou "12 clientes" inventados.
Se seu perfil real tiver números melhores pra mostrar (anos de experiência,
projetos em produção, certificações), é só trocar; o importante é manter
essa seção honesta, já que ela é a primeira coisa que alguém confere.

### 2. Seus projetos
Edite **`src/data/projects.js`**. Cada projeto tem:

```js
{
  id: 'meu-projeto',
  title: 'Meu Projeto',
  kind: 'Aplicação web',
  year: 2026,
  description: '...',
  tags: ['React', 'TypeScript'],
  live: 'https://...',   // null esconde o botão "Ver online" — só preencha se existir mesmo
  repo: 'https://...',   // null esconde o botão "Código"
  image: null,             // caminho para um print real, ex.: '/projects/meu-projeto.webp'
  variant: 'chart',         // arte gerada se `image` for null: chart | orbs | waves | mesh | grid | blocks
  accent: 'indigo',         // cor do brilho do card: indigo | violet | emerald
  span: 'md:col-span-7',    // largura no grid (12 colunas)
  aspect: 'aspect-[16/10]', // proporção da prévia
}
```

Os 6 projetos atuais (Litoral Raro, Nails By Ananrs, CA-ADS Nexus, Transporte
Pauliceia, MiniERP API e Aurora Synth) foram puxados do GitHub em
setembro/2026. Se você criar ou atualizar repositórios, é só repetir o
processo: puxar descrição, stack e link de deploy (campo "homepage" do
repositório no GitHub) de cada um e atualizar este arquivo — o site nunca
inventa link de deploy: se o repositório não tiver um configurado, o card
mostra só o botão "Código".

Para usar uma imagem real em vez da arte gerada, coloque o arquivo em
`public/projects/` e aponte `image: '/projects/seu-arquivo.webp'`.

### 3. Textos longos do hero e "Sobre"
Esses ficam direto em `index.html` (headline do hero, frase da seção
"Sobre") — são textos únicos, então não passam por `site.js`.

### 4. Cores e tipografia
Os tokens vivem em `src/styles/main.css`, dentro do bloco `@theme`:

```css
--color-ink: #050505;          /* fundo */
--color-indigo-neon: #6366f1;
--color-violet-neon: #a855f7;
--color-emerald-neon: #34d399;
--font-display: 'Space Grotesk Variable', ...;
--font-sans: 'Inter Variable', ...;
```

Mudar esses valores atualiza automaticamente as classes Tailwind
`bg-ink`, `text-indigo-neon`, `font-display` etc. usadas em todo o site.

---

## Decisões técnicas (e porquês)

- **Three.js roda em um chunk separado**, carregado via `import()` dinâmico em
  `main.js`. Isso mantém o bundle inicial pequeno mesmo com o Three.js sendo
  pesado.
- **`Math.min(window.devicePixelRatio, 2)`** limita o pixel ratio em telas
  Retina/4K (evita renderizar 3-4x mais pixels que o necessário). Além disso,
  `ParticleScene` monitora o tempo médio de frame e reduz o pixel ratio
  automaticamente se detectar quedas de performance sustentadas.
- **Todos os `addEventListener` têm `removeEventListener` correspondente** em
  `ParticleScene.destroy()` e em cada `init*()` dos componentes, que retornam
  uma função de limpeza. `main.js` acumula essas funções e as chama no
  `import.meta.hot.dispose` (recarregamento durante o desenvolvimento).
- **`prefers-reduced-motion`** é respeitado em dois níveis: o CSS zera
  durações/transições globalmente, e o JS (`gsap.matchMedia`) nem registra os
  ScrollTriggers de animação quando o usuário pede menos movimento — o
  conteúdo aparece direto, sem esperar nenhum scroll ou entrada.
- **O cursor customizado e o tilt 3D só ativam em `(hover: hover) and
  (pointer: fine)`**, ou seja, dispositivos com mouse. Em toque, o cursor
  nativo permanece e os cards não tentam calcular tilt a partir de eventos
  de ponteiro que não existem.
- **Todo o movimento das partículas (fluxo orgânico + repulsão do mouse)
  roda no vertex shader**, na GPU. O JavaScript só atualiza alguns uniforms
  por frame (tempo, posição do mouse, progresso do scroll), então o custo
  de CPU não cresce com o número de partículas.
- **Perda de contexto WebGL** (`webglcontextlost`, comum em abas em segundo
  plano por muito tempo ou GPU sobrecarregada) é tratada: o loop para e
  retoma sozinho quando o contexto é restaurado, sem quebrar a página.
- **Constelação no Three.js** (`ParticleScene._updateTether`): linhas finas
  ligam o cursor às 4–6 partículas ambiente mais próximas, reforçando a
  repulsão que já acontece no shader. Varre só uma amostra esparsa das
  partículas (não todas) e sai cedo quando a opacidade chega a zero. As
  linhas ficam direto na `scene`, fora do grupo `root`, porque as posições
  já vêm em espaço de mundo — como filhas de `root` seriam transformadas
  duas vezes e ficariam desalinhadas das partículas.
- **Projeto em destaque**: o 1º item de `projects.js` ganha layout editorial
  (prévia grande + texto à direita) e reaproveita as mesmas classes dos cards
  (`.project-tilt`, `.project-preview`), então tilt, glow e hover funcionam
  sem código duplicado. Os demais entram no grid (`projects.slice(1)`), por
  isso os `span` do grid precisam somar 12 por linha.
- **Tingimento de fundo por scroll**: três camadas (índigo, roxo, esmeralda)
  cuja opacidade segue o progresso do scroll, dentro do mesmo ScrollTrigger
  que já dirige a cena 3D e a barra de progresso — custo extra praticamente zero.
- **Navegação lateral por seção** (desktop), **rastro no cursor**, **scrollbar
  com gradiente** e **scramble** nos links/títulos (só com mouse e sem
  "reduzir movimento"; o logo e os títulos com SplitText ficam de fora porque
  o scramble reescreve `textContent` e destruiria o DOM interno deles).
- **O nº de repositórios em "Sobre" é live** (`githubStats.js`): busca
  `api.github.com/users/Lawallz` no navegador do visitante, cacheia o
  resultado em `sessionStorage` por 30 min e anima o contador até o valor
  real, com um pontinho verde indicando que é dado ao vivo. Como a API do
  GitHub tem limite de requisições por IP e não exige chave, a falha é
  sempre silenciosa — o número estático de `site.js` (que também é real, só
  que fixo) fica exibido normalmente se a chamada não voltar a tempo.
- **A janela de código do hero** (`.ide-window`) "digita" as linhas com
  `clip-path` + easing `steps()`, em vez de width/transform — assim não
  depende de medir a largura do texto em pixels, funciona em qualquer fonte
  e qualquer tamanho de tela. É puramente decorativa (`aria-hidden`), já que
  a mesma informação (nome, stack) já existe em texto normal em outros
  pontos da página.

---

## Compatibilidade

Testado para navegadores modernos com suporte a WebGL2, ES2022 e
`backdrop-filter`. Sem esses recursos, o site ainda funciona (Vite faz
transpile do JS), mas a cena 3D e o desfoque do menu não aparecem.
