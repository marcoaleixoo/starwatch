/**
 * Parâmetros globais da estrela central (fonte de luz dominante).
 * Use estes valores para manter coerência entre o lore (escala astronômica),
 * a renderização (proxy visual perto da câmera) e as simulações (energia, calor).
 * O sistema de coordenadas segue a convenção NOA: 1 unidade = 1 bloco ≈ 1 m.
 */

/**
 * Posição física fixa do centro da estrela. Ancoramos o astro ~2 000 km acima do hub
 * com leve inclinação no eixo Z para gerar sombras diagonais.
 */
export const STAR_PHYSICAL_POSITION_METERS: [number, number, number] = [0, 2_000_000, 200_000];

/**
 * Raio físico do astro. Usado quando carregamos o mesh real durante aproximações.
 */
export const STAR_PHYSICAL_RADIUS_METERS = 20_000;

/**
 * Distância física até o centro da estrela (derivada da posição). Útil para HUD e sistemas.
 */
export const STAR_PHYSICAL_DISTANCE_METERS = Math.hypot(
  STAR_PHYSICAL_POSITION_METERS[0],
  STAR_PHYSICAL_POSITION_METERS[1],
  STAR_PHYSICAL_POSITION_METERS[2],
);

/**
 * Limite em que trocamos o proxy visual pelo mesh físico (100 km do astro).
 * Mantém o z-buffer saudável enquanto o jogador está longe.
 */
export const STAR_APPROACH_DISTANCE_METERS = 100_000;

/**
 * Distância virtual usada para posicionar o proxy visual (billboard) do sol.
 * Mantemos dentro de 1 km para não degradar a precisão do depth buffer.
 */
export const STAR_VISUAL_DISTANCE_METERS = 800;

/**
 * Ângulo aparente alvo em graus (0.53° ≈ Sol visto da Terra). Ajuste para alterar o tamanho
 * observado no céu sem mexer na distância visual.
 */
export const STAR_VISUAL_APERTURE_DEGREES = 0.53;

/**
 * Raio visual do proxy. Calculado a partir do ângulo aparente e da distância visual.
 */
export const STAR_VISUAL_RADIUS_METERS =
  Math.tan((STAR_VISUAL_APERTURE_DEGREES * Math.PI) / 360) * STAR_VISUAL_DISTANCE_METERS;

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
 * Margem adicionada ao far plane da câmera para garantir que o proxy permaneça visível.
 */
export const STAR_CAMERA_FAR_PLANE_PADDING = 400;

/**
 * Margem adicional aplicada quando exibimos o mesh físico (aproximação real).
 */
export const STAR_CAMERA_PHYSICAL_PADDING = 25_000;

/**
 * Intensidade adicional aplicada diretamente à cor emissiva do mesh.
 */
export const STAR_EMISSIVE_INTENSITY = 3.4;
