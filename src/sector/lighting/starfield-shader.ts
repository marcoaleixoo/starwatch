import { Effect } from '@babylonjs/core/Materials/effect';

let shaderRegistered = false;

/**
 * Garante que os shaders do starfield estejam registrados no Effect registry do Babylon.
 */
export function ensureStarfieldShader(): void {
  if (shaderRegistered) {
    return;
  }

  Effect.ShadersStore.starwatchStarfieldVertexShader = `
    precision highp float;

    attribute vec3 position;

    uniform mat4 worldViewProjection;

    varying vec3 vDirection;

    void main(void) {
      vDirection = position;
      gl_Position = worldViewProjection * vec4(position, 1.0);
    }
  `;

  Effect.ShadersStore.starwatchStarfieldFragmentShader = `
    precision highp float;

    varying vec3 vDirection;

    uniform float uTime;
    uniform float uDensity;
    uniform float uIntensity;
    uniform float uBaseSpeed;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uThresholdLow;
    uniform float uThresholdHigh;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    void main(void) {
      vec3 dir = normalize(vDirection);

      // Determina uma célula pseudo-aleatória na esfera.
      vec3 cell = floor(dir * uDensity + vec3(750.0, 620.0, 840.0));
      float starSeed = hash(cell);

      // Só mantém as amostras mais brilhantes para evitar ruído.
      float baseBrightness = smoothstep(uThresholdLow, uThresholdHigh, starSeed);
      if (baseBrightness <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
      }

      float flickerSeed = hash(cell + 17.0);
      float flicker = 0.55 + 0.45 * sin(uTime * (uBaseSpeed + flickerSeed * 6.0) + flickerSeed * 23.0);

      float paletteSeed = hash(cell + 3.0);
      vec3 starColor = mix(uColorA, uColorB, paletteSeed);

      float intensity = baseBrightness * flicker * uIntensity;
      gl_FragColor = vec4(starColor * intensity, intensity);
    }
  `;

  shaderRegistered = true;
}
