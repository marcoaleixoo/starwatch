import { Effect } from '@babylonjs/core/Materials/effect';

let shaderRegistered = false;

/**
 * Registra os shaders usados pelo starfield próximo (instâncias finas).
 */
export function ensureNearStarfieldShader(): void {
  if (shaderRegistered) {
    return;
  }

  Effect.ShadersStore.starwatchNearStarfieldVertexShader = `
    precision highp float;

    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 instanceDirection;
    attribute float instanceSize;
    attribute vec3 instanceColor;
    attribute vec3 instanceTwinkle;

    uniform mat4 view;
    uniform mat4 projection;
    uniform mat4 uRotation;
    uniform vec3 uCameraPosition;
    uniform vec3 uAnchor;
    uniform vec3 uParallaxOffset;
    uniform float uRadius;
    uniform vec2 uIntensityRange;

    varying vec2 vUV;
    varying vec3 vColor;
    varying vec3 vTwinkle;
    varying float vBaseIntensity;

    vec3 computeBillboardRight(vec3 forward) {
      vec3 up = vec3(0.0, 1.0, 0.0);
      if (abs(dot(up, forward)) > 0.99) {
        up = vec3(0.0, 0.0, 1.0);
      }
      return normalize(cross(up, forward));
    }

    void main(void) {
      vUV = uv;
      vColor = instanceColor;
      vTwinkle = instanceTwinkle;
      vBaseIntensity = mix(uIntensityRange.x, uIntensityRange.y, instanceTwinkle.z);

      mat3 rot = mat3(uRotation);
      vec3 parallaxDir = instanceDirection + uParallaxOffset;
      vec3 dir = normalize(rot * parallaxDir);
      vec3 worldPos = uAnchor + dir * uRadius;

      vec3 toCamera = normalize(uCameraPosition - worldPos);
      vec3 right = computeBillboardRight(toCamera);
      vec3 up = cross(toCamera, right);

      vec2 quad = position.xy * instanceSize;
      vec3 billboardPos = worldPos + right * quad.x + up * quad.y;

      gl_Position = projection * view * vec4(billboardPos, 1.0);
    }
  `;

  Effect.ShadersStore.starwatchNearStarfieldFragmentShader = `
    precision highp float;

    varying vec2 vUV;
    varying vec3 vColor;
    varying vec3 vTwinkle;
    varying float vBaseIntensity;

    uniform float uTime;
    uniform float uTwinkleAmplitude;
    uniform float uTwinkleSpeed;

    void main(void) {
      vec2 centered = vUV * 2.0 - 1.0;
      float dist = length(centered);
      float falloff = smoothstep(1.0, 0.0, dist);
      if (falloff <= 0.0) {
        discard;
      }

      float phase = vTwinkle.x;
      float speed = vTwinkle.y;
      float twinkle = 1.0 + uTwinkleAmplitude * sin(uTime * (uTwinkleSpeed * (0.5 + speed)) + phase);
      float intensity = clamp(vBaseIntensity * twinkle, 0.0, 4.0);
      float alpha = falloff * clamp(intensity, 0.0, 1.0);

      gl_FragColor = vec4(vColor * intensity, alpha);
    }
  `;

  shaderRegistered = true;
}
