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
    uniform float uNebulaIntensity;
    uniform float uNebulaContrast;
    uniform sampler2D uNebulaTexture;
    uniform float uStarProbability;
    uniform float uStarRadiusMin;
    uniform float uStarRadiusMax;
    uniform float uBackgroundIntensity;

    const vec3 STAR_OFFSET = vec3(750.0, 620.0, 840.0);

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    vec2 projectToPlane(vec3 local, vec3 dir) {
      vec3 up = abs(dir.y) > 0.95 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
      vec3 tangent = normalize(cross(up, dir));
      vec3 bitangent = normalize(cross(dir, tangent));
      return vec2(dot(local, tangent), dot(local, bitangent));
    }

    void main(void) {
      vec3 dir = normalize(vDirection);
      vec3 samplePos = dir * uDensity + STAR_OFFSET;
      vec3 cell = floor(samplePos);
      float chance = hash(cell);

      float horizonMix = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
      vec3 background = mix(uColorA, uColorB, pow(horizonMix, 1.3)) * uBackgroundIntensity;

      float twoPi = 6.2831853;
      float v = clamp(dir.y, -1.0, 1.0);
      vec2 nebulaUV = vec2(0.5 + atan(dir.z, dir.x) / twoPi, 0.5 - asin(v) / 3.1415927);
      vec3 nebulaSample = texture(uNebulaTexture, nebulaUV).rgb;
      float contrast = max(uNebulaContrast, 0.001);
      vec3 nebula = pow(max(nebulaSample, vec3(0.0001)), vec3(1.0 / contrast)) * uNebulaIntensity;

      vec3 baseColor = background + nebula;

      if (chance > uStarProbability) {
        gl_FragColor = vec4(baseColor, 1.0);
        return;
      }

      vec3 local = fract(samplePos) - 0.5;
      vec2 plane = projectToPlane(local, dir);

      float radiusSeed = hash(cell + 11.0);
      float radius = mix(uStarRadiusMin, uStarRadiusMax, radiusSeed);

      float dist = length(plane);
      float gaussian = exp(-dist * dist / (radius * radius * 0.6));

      float flickerSeed = hash(cell + 17.0);
      float flickerPhase = hash(cell + 29.0) * twoPi;
      float flicker = 0.7 + 0.3 * sin(uTime * (uBaseSpeed + flickerSeed * 3.0) + flickerPhase);

      vec3 starColor = mix(uColorA, uColorB, hash(cell + 5.0));

      vec3 color = baseColor + starColor * gaussian * flicker * uIntensity;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  shaderRegistered = true;
}
