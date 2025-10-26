/**
 * Parâmetros globais da estrela central (fonte de luz dominante).
 * Ajuste estes valores para recalibrar render, HUDs e simulação que dependem da luz.
 * Os números usam o mesmo sistema de coordenadas/metragem do NOA (1 = 1 bloco ≈ 1 m).
 */
export const STAR_DIRECTION: [number, number, number] = [0, 1, 0.1];

/**
 * Distância virtual do astro em unidades do mundo. Mantemos muito longe para preservar a
 * sensação de fonte remota sem quebrar paralaxe.
 */
export const STAR_DISTANCE_METERS = 30;

/**
 * Raio visual usado para dimensionar o mesh emissivo do sol. Ajuste para controlar o tamanho
 * aparente na tela (ângulo ≈ 2 * atan(R / distância)).
 */
export const STAR_VISUAL_RADIUS_METERS = 6;

/**
 * Intensidade da luz direcional emitida pelo astro. Valores >1 aumentam brilho especular.
 */
export const STAR_LIGHT_INTENSITY = 2.8;

/**
 * Cor difusa aplicada ao `DirectionalLight` principal (RGB linear 0..1).
 */
export const STAR_DIFFUSE_COLOR: [number, number, number] = [1.2, 1.05, 0.58];

/**
 * Cor especular para highlights metálicos/vidro.
 */
export const STAR_SPECULAR_COLOR: [number, number, number] = [1, 0.98, 0.92];

/**
 * Fator do brilho (GlowLayer) aplicado somente ao mesh do sol.
 */
export const STAR_GLOW_INTENSITY = 1.1;

/**
 * Faixa de projeção para sombras direcionais (near, far). Ajuste conforme escala vertical.
 */
export const STAR_SHADOW_RANGE: [number, number] = [-256, 512];

/**
 * Margem adicionada ao far plane da câmera para garantir que o sol permaneça visível.
 */
export const STAR_CAMERA_FAR_PLANE_PADDING = 200;

/**
 * Intensidade adicional aplicada diretamente à cor emissiva do mesh.
 */
export const STAR_EMISSIVE_INTENSITY = 3.4;
