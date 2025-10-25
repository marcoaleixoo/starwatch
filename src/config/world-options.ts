import { TARGET_VIEW_DISTANCE_BLOCKS } from './render-options';

/**
 * Tamanho (meia extensão) da plataforma inicial onde o jogador nasce.
 * Consumido em `world/chunk-generator.ts` para definir o platô 10×10.
 */
export const PLATFORM_HALF_EXTENT = 5;

/**
 * Altura absoluta (eixo Y) da plataforma inicial.
 * Utilizado pelo worldgen para colocar o grid no nível correto.
 */
export const PLATFORM_HEIGHT = 0;

/**
 * Posição inicial do jogador (usada pelo engine bootstrap).
 * A altura deve manter o jogador levemente acima da plataforma.
 */
export const PLAYER_SPAWN_POSITION: [number, number, number] = [0.5, 2.5, 0.5];

/**
 * Altura média das nuvens/asteroides do anel distante.
 * Deve manter distância visível do jogador sem interferir na plataforma.
 */
export const CLOUD_LAYER_ALTITUDE = 38;

/**
 * Espessura vertical do cinturão de nuvens (em blocos).
 */
export const CLOUD_LAYER_THICKNESS = 4;

/**
 * Raio interno a partir do qual começam as nuvens/asteroides.
 */
export const CLOUD_RING_INNER_RADIUS = 40;

/**
 * Densidade mínima (0–1) do ruído procedural para instanciar uma nuvem.
 */
export const CLOUD_DENSITY_THRESHOLD = 0.72;

/**
 * Raio externo do cinturão de nuvens, ajustado conforme o target de render.
 * Mantemos margem de 40 blocos para evitar pop-in no limite da draw distance.
 */
export const CLOUD_RING_OUTER_RADIUS = Math.max(
  CLOUD_RING_INNER_RADIUS + 20,
  TARGET_VIEW_DISTANCE_BLOCKS - 40,
);
