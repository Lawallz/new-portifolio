import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  Color,
  Vector2,
  Vector3,
  Group,
  IcosahedronGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
  MathUtils,
  LinearSRGBColorSpace,
  DynamicDrawUsage,
} from 'three';
import { particleVertex, particleFragment } from './shaders.js';

const COLORS = {
  indigo: '#6366f1',
  violet: '#a855f7',
  emerald: '#34d399',
  wireA: '#818cf8',
  wireB: '#a855f7',
};

/** Cor "crua" para uniforms de ShaderMaterial (sem conversão sRGB → linear). */
const rawColor = (hex) => new Color().setHex(parseInt(hex.slice(1), 16), LinearSRGBColorSpace);

/**
 * Cena WebGL de fundo: campo de partículas reativo ao mouse + esfera de
 * partículas com poliedros em wireframe.
 *
 * Ciclo de vida:
 *   const scene = new ParticleScene(canvas, { lowPower, reducedMotion });
 *   scene.reveal();        // animação de entrada
 *   scene.setScroll(0..1); // progresso de scroll da página
 *   scene.destroy();       // remove listeners, libera GPU
 */
export class ParticleScene {
  constructor(canvas, { lowPower = false, reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.lowPower = lowPower;
    this.counts = lowPower ? { ambient: 2200, core: 1000 } : { ambient: 6500, core: 2600 };

    // Renderer: sem alpha nem MSAA (pontos não precisam), pixel ratio limitado a 2.
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor('#050505', 1);
    this.dprCap = 2; // reduzido automaticamente se o dispositivo não aguentar
    this.pixelRatio = Math.min(window.devicePixelRatio, this.dprCap);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(55, 1, 0.1, 60);
    this.camera.position.z = 7;

    // Estado
    this.width = 1;
    this.height = 1;
    this.halfW = 1;
    this.halfH = 1;
    this.time = 0;
    this.intro = 0;
    this.introTarget = 0;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.pointer = new Vector2(0, 0);
    this.pointerSmooth = new Vector2(0, 0);
    this.pointerActive = false;
    this.mouseWorld = new Vector2(999, 999); // fora da tela = sem influência
    this.coreBase = { x: 0, y: 0, scale: 1 };

    this.running = false;
    this.raf = 0;
    this.last = 0;
    this.warmup = 180; // frames ignorados antes de avaliar performance
    this.perfFrames = 0;
    this.perfAccum = 0;
    this._resizeTimer = 0;

    // Uniforms compartilhados entre os materiais (mesma referência = atualiza todos)
    this.shared = {
      uTime: { value: 0 },
      uMouse: { value: this.mouseWorld },
      uPixelRatio: { value: this.pixelRatio },
      uRadius: { value: 2.4 },
      uColorA: { value: rawColor(COLORS.indigo) },
      uColorB: { value: rawColor(COLORS.violet) },
      uColorC: { value: rawColor(COLORS.emerald) },
    };

    this.root = new Group();
    this.scene.add(this.root);
    this._buildAmbient();
    this._buildCore();
    this._buildTether();

    this._bindEvents();
    this._applySize();
  }

  /* ------------------------------------------------------------------ */
  /* Construção                                                          */
  /* ------------------------------------------------------------------ */

  _material({ size, flow }) {
    return new ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        ...this.shared,
        uSize: { value: size },
        uFlow: { value: flow },
        uFade: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }

  _geometry(positions, count) {
    const random = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      random[i * 3] = Math.random();
      random[i * 3 + 1] = Math.random();
      random[i * 3 + 2] = Math.random();
      // Poucas partículas grandes, muitas pequenas
      scale[i] = 0.35 + Math.pow(Math.random(), 3) * 1.6;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new Float32BufferAttribute(random, 3));
    geometry.setAttribute('aScale', new Float32BufferAttribute(scale, 1));
    return geometry;
  }

  /** Campo amplo de partículas ao fundo. */
  _buildAmbient() {
    const n = this.counts.ambient;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
    }
    this.ambient = new Points(
      this._geometry(positions, n),
      this._material({ size: 26, flow: 0.35 }),
    );
    this.ambient.frustumCulled = false;
    this.root.add(this.ambient);
  }

  /** Esfera (espiral de Fibonacci) + anel orbital + dois poliedros em wireframe. */
  _buildCore() {
    const n = this.counts.core;
    const ringCount = Math.floor(n * 0.28);
    const sphereCount = n - ringCount;
    const positions = new Float32Array(n * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < sphereCount; i++) {
      const y = 1 - (i / (sphereCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const radius = 2 * (0.94 + Math.random() * 0.12);
      positions[i * 3] = Math.cos(theta) * r * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    }
    for (let j = 0; j < ringCount; j++) {
      const i = sphereCount + j;
      const angle = (j / ringCount) * Math.PI * 2;
      const radius = 3 + (Math.random() - 0.5) * 0.28;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    this.core = new Group();
    this.corePoints = new Points(
      this._geometry(positions, n),
      this._material({ size: 30, flow: 0.05 }),
    );
    this.corePoints.frustumCulled = false;

    this.wireA = this._wire(new IcosahedronGeometry(1.15, 1), COLORS.wireA, 0.55);
    this.wireB = this._wire(new IcosahedronGeometry(1.6, 0), COLORS.wireB, 0.32);

    this.core.add(this.corePoints, this.wireA, this.wireB);
    this.root.add(this.core);
  }

  _wire(sourceGeometry, color, opacity) {
    const geometry = new WireframeGeometry(sourceGeometry);
    sourceGeometry.dispose(); // WireframeGeometry já copiou os dados
    const material = new LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const lines = new LineSegments(geometry, material);
    lines.userData.baseOpacity = opacity;
    lines.frustumCulled = false;
    return lines;
  }

  /**
   * Linhas finas conectando o cursor às partículas ambiente mais próximas —
   * uma "constelação" que reforça visualmente a repulsão que já existe no
   * shader. Fica direto na `scene` (não em `root`) porque as posições que
   * calculamos a cada frame já vêm em espaço de mundo (via `matrixWorld`);
   * se fosse filha de `root`, a transformação de `root` seria aplicada duas
   * vezes e as linhas ficariam desalinhadas das partículas de verdade.
   */
  _buildTether() {
    const K = this.lowPower ? 4 : 6;
    this.tetherK = K;
    this.tetherOpacity = 0;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(K * 2 * 3);
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3).setUsage(DynamicDrawUsage));

    const material = new LineBasicMaterial({
      color: COLORS.emerald,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    this.tether = new LineSegments(geometry, material);
    this.tether.frustumCulled = false;
    this.scene.add(this.tether);

    // Amostra esparsa do campo ambiente: varrer só uma a cada N partículas é
    // barato o bastante para rodar a cada frame e ainda dá candidatos de sobra.
    const step = this.lowPower ? 17 : 9;
    this.tetherCandidates = [];
    for (let i = 0; i < this.counts.ambient; i += step) this.tetherCandidates.push(i);

    this._tetherPoint = new Vector3();
    this._tetherHits = new Array(K).fill(null);
  }

  /* ------------------------------------------------------------------ */
  /* API pública                                                         */
  /* ------------------------------------------------------------------ */

  /** Anima a entrada da cena (partículas surgem e se aproximam). */
  reveal() {
    this.introTarget = 1;
  }

  /** Progresso de scroll da página inteira, de 0 a 1. */
  setScroll(progress) {
    this.scrollTarget = MathUtils.clamp(progress, 0, 1);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    this._unbindEvents();
    clearTimeout(this._resizeTimer);
    this.scene.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  /* ------------------------------------------------------------------ */
  /* Eventos                                                             */
  /* ------------------------------------------------------------------ */

  _bindEvents() {
    // pointermove cobre mouse, caneta e toque (arrastar).
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    window.addEventListener('pointerup', this._onPointerEnd, { passive: true });
    window.addEventListener('pointercancel', this._onPointerEnd, { passive: true });
    document.documentElement.addEventListener('pointerleave', this._onPointerLeave);
    window.addEventListener('resize', this._onResize, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibility);
    this.canvas.addEventListener('webglcontextlost', this._onContextLost);
    this.canvas.addEventListener('webglcontextrestored', this._onContextRestored);
  }

  _unbindEvents() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerEnd);
    window.removeEventListener('pointercancel', this._onPointerEnd);
    document.documentElement.removeEventListener('pointerleave', this._onPointerLeave);
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
  }

  _onPointerMove = (event) => {
    this.pointer.set((event.clientX / this.width) * 2 - 1, -((event.clientY / this.height) * 2 - 1));
    if (!this.pointerActive) {
      this.pointerActive = true;
      this.pointerSmooth.copy(this.pointer); // evita "salto" na primeira entrada
    }
  };

  _onPointerEnd = (event) => {
    if (event.pointerType !== 'mouse') this.pointerActive = false;
  };

  _onPointerLeave = () => {
    this.pointerActive = false;
  };

  _onResize = () => {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => this._applySize(), 100); // debounce
  };

  _onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  _onContextLost = (event) => {
    event.preventDefault();
    this.stop();
  };

  _onContextRestored = () => this.start();

  /* ------------------------------------------------------------------ */
  /* Layout                                                              */
  /* ------------------------------------------------------------------ */

  _applySize() {
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, this.dprCap);

    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height, false); // false = CSS controla o tamanho
    this.shared.uPixelRatio.value = this.pixelRatio;

    const aspect = this.width / this.height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.halfH = Math.tan(MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z;
    this.halfW = this.halfH * aspect;

    // Desktop: esfera à direita. Retrato: menor e mais abaixo.
    const wide = aspect > 1.1;
    this.coreBase.x = wide ? this.halfW * 0.42 : 0;
    this.coreBase.y = wide ? 0 : -this.halfH * 0.28;
    this.coreBase.scale = wide ? 1 : MathUtils.clamp((this.halfW * 0.85) / 3, 0.35, 1);
  }

  /* ------------------------------------------------------------------ */
  /* Loop                                                                */
  /* ------------------------------------------------------------------ */

  _tick = (now) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this._tick);

    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this._monitorPerformance(dt);

    const speed = this.reducedMotion ? 0.15 : 1;
    this.time += dt * speed;
    this.shared.uTime.value = this.time;

    // Suavizações independentes de frame rate
    this.intro = MathUtils.damp(this.intro, this.introTarget, 1.4, dt);
    this.scroll = MathUtils.damp(this.scroll, this.scrollTarget, 4, dt);

    const tx = this.pointerActive && !this.reducedMotion ? this.pointer.x : 0;
    const ty = this.pointerActive && !this.reducedMotion ? this.pointer.y : 0;
    this.pointerSmooth.x = MathUtils.damp(this.pointerSmooth.x, tx, 5, dt);
    this.pointerSmooth.y = MathUtils.damp(this.pointerSmooth.y, ty, 5, dt);

    if (this.pointerActive && !this.reducedMotion) {
      this.mouseWorld.set(this.pointerSmooth.x * this.halfW, this.pointerSmooth.y * this.halfH);
    } else {
      this.mouseWorld.set(999, 999);
    }

    // Entrada: a cena "se aproxima" enquanto aparece
    const intro = this.intro;
    this.root.position.z = -(1 - intro) * 4;

    // Scroll: a esfera recua e escurece, o campo de partículas deriva
    const leave = MathUtils.smoothstep(this.scroll, 0, 0.2);
    const coreFade = 1 - leave * 0.72;

    this.core.position.set(
      this.coreBase.x * (1 - leave * 0.6),
      this.coreBase.y + leave * 1.2,
      -leave * 5,
    );
    this.core.scale.setScalar(this.coreBase.scale * (1 - leave * 0.2));
    this.core.rotation.x = 0.35 - this.pointerSmooth.y * 0.35;
    this.core.rotation.y = this.time * 0.1 + this.pointerSmooth.x * 0.55;
    this.core.rotation.z = 0.2;

    this.wireA.rotation.x = this.time * 0.2;
    this.wireA.rotation.y = this.time * 0.15;
    this.wireB.rotation.x = -this.time * 0.1;
    this.wireB.rotation.z = this.time * 0.12;

    this.ambient.rotation.y = this.scroll * 1.2 + this.time * 0.01;
    this.ambient.position.y = this.scroll * 3;

    // Opacidades
    this.ambient.material.uniforms.uFade.value = intro * 0.9;
    this.corePoints.material.uniforms.uFade.value = intro * coreFade;
    this.wireA.material.opacity = this.wireA.userData.baseOpacity * intro * coreFade;
    this.wireB.material.opacity = this.wireB.userData.baseOpacity * intro * coreFade;

    this._updateTether(dt);

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Atualiza as linhas de constelação: acha os K candidatos mais próximos do
   * cursor (busca linear simples — barata o bastante para algumas centenas
   * de candidatos) e escreve as duas pontas de cada linha no buffer.
   * Sai cedo se a opacidade está zerada, pra não gastar CPU sem nada visível.
   */
  _updateTether(dt) {
    const active = this.pointerActive && !this.reducedMotion;
    const targetOpacity = active ? 0.45 : 0;
    this.tetherOpacity = MathUtils.damp(this.tetherOpacity, targetOpacity, 6, dt);
    this.tether.material.opacity = this.tetherOpacity * this.intro;

    if (this.tetherOpacity < 0.01) return;

    this.ambient.updateWorldMatrix(true, false);
    const posArray = this.ambient.geometry.attributes.position.array;
    const mx = this.mouseWorld.x;
    const my = this.mouseWorld.y;

    const hits = this._tetherHits;
    const K = hits.length;
    hits.fill(null);
    let worstIdx = -1;
    let worstDist = Infinity;
    let filled = 0;

    for (let c = 0; c < this.tetherCandidates.length; c++) {
      const i = this.tetherCandidates[c];
      this._tetherPoint.set(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]);
      this._tetherPoint.applyMatrix4(this.ambient.matrixWorld);
      const dx = this._tetherPoint.x - mx;
      const dy = this._tetherPoint.y - my;
      const dist = dx * dx + dy * dy;

      if (filled < K) {
        hits[filled] = { x: this._tetherPoint.x, y: this._tetherPoint.y, z: this._tetherPoint.z, dist };
        filled++;
        if (filled === K) {
          worstIdx = 0;
          worstDist = hits[0].dist;
          for (let h = 1; h < K; h++) if (hits[h].dist > worstDist) { worstDist = hits[h].dist; worstIdx = h; }
        }
      } else if (dist < worstDist) {
        hits[worstIdx] = { x: this._tetherPoint.x, y: this._tetherPoint.y, z: this._tetherPoint.z, dist };
        worstIdx = 0;
        worstDist = hits[0].dist;
        for (let h = 1; h < K; h++) if (hits[h].dist > worstDist) { worstDist = hits[h].dist; worstIdx = h; }
      }
    }

    const positionAttr = this.tether.geometry.attributes.position;
    const arr = positionAttr.array;
    for (let h = 0; h < K; h++) {
      const hit = hits[h];
      const base = h * 6;
      if (!hit) {
        arr[base] = arr[base + 1] = arr[base + 2] = 0;
        arr[base + 3] = arr[base + 4] = arr[base + 5] = 0;
        continue;
      }
      arr[base] = mx;
      arr[base + 1] = my;
      arr[base + 2] = 0;
      arr[base + 3] = hit.x;
      arr[base + 4] = hit.y;
      arr[base + 5] = hit.z;
    }
    positionAttr.needsUpdate = true;
  }

  /**
   * Se o dispositivo não sustenta ~40 fps, reduz o pixel ratio (uma vez por vez).
   * Ignora o início (compilação de shaders, preloader) para não punir à toa.
   */
  _monitorPerformance(dt) {    if (this.warmup > 0) {
      this.warmup--;
      return;
    }
    this.perfAccum += dt;
    if (++this.perfFrames < 90) return;

    const average = this.perfAccum / this.perfFrames;
    this.perfFrames = 0;
    this.perfAccum = 0;

    if (average > 0.026 && this.pixelRatio > 1) {
      this.dprCap = Math.max(1, this.pixelRatio - 0.5);
      this._applySize();
    }
  }
}
