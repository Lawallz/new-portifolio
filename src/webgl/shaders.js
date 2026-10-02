/**
 * Shaders das partículas.
 *
 * Todo o movimento (fluxo orgânico + repulsão do mouse) roda na GPU:
 * a CPU só atualiza uns poucos uniforms por frame, então dá para ter
 * milhares de partículas sem custo de JavaScript.
 */

export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;      // posição do mouse no plano z = 0 (unidades de mundo)
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uFlow;       // amplitude do movimento orgânico
  uniform float uFade;       // opacidade global (0–1)
  uniform float uRadius;     // raio de influência do mouse
  uniform vec3  uColorA;     // índigo
  uniform vec3  uColorB;     // roxo
  uniform vec3  uColorC;     // esmeralda (realce perto do mouse)

  attribute float aScale;
  attribute vec3  aRandom;

  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Fluxo orgânico barato (senoides defasadas por partícula)
    float t = uTime * 0.25;
    pos.x += sin(t        + pos.y * 0.6 + aRandom.x * 6.2831) * uFlow;
    pos.y += cos(t * 0.9  + pos.z * 0.6 + aRandom.y * 6.2831) * uFlow;
    pos.z += sin(t * 1.1  + pos.x * 0.6 + aRandom.z * 6.2831) * uFlow;

    vec4 world = modelMatrix * vec4(pos, 1.0);

    // Repulsão do mouse
    vec2  diff      = world.xy - uMouse;
    float dist      = length(diff);
    float influence = smoothstep(uRadius, 0.0, dist);
    world.xy += (diff / max(dist, 0.0001)) * influence * 0.9;
    world.z  += influence * 1.1;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float size = uSize * aScale * (1.0 + influence * 1.4) * uPixelRatio / -mv.z;
    gl_PointSize = clamp(size, 1.0, 46.0 * uPixelRatio);

    vec3 base = mix(uColorA, uColorB, smoothstep(0.25, 0.75, aRandom.x));
    vColor = mix(base, uColorC, influence * 0.9);
    vAlpha = (0.30 + 0.70 * aRandom.y) * uFade * (0.65 + influence);
  }
`;

export const particleFragment = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    // Ponto com núcleo brilhante e halo suave
    float glow  = smoothstep(0.5, 0.0, d);
    float alpha = pow(glow, 1.8) * vAlpha;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
