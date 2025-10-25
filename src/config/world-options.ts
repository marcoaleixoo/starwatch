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
 * Altura média das rochas (asteroides) do anel distante.
 */
export const ASTEROID_LAYER_ALTITUDE = 46;

/**
 * Variação máxima (para cima/baixo) da altura dos asteroides.
 */
export const ASTEROID_HEIGHT_VARIATION = 8;

/**
 * Raio interno a partir do qual começam os asteroides.
 */
export const ASTEROID_RING_INNER_RADIUS = 60;

/**
 * Densidade mínima (0–1) do ruído procedural para instanciar um asteroide.
 */
export const ASTEROID_DENSITY_THRESHOLD = 0.38;

/**
 * Probabilidade de spawn de um asteroide dentro de uma célula candidata.
 */
export const ASTEROID_CENTER_PROBABILITY = 0.42;

/**
 * Tamanho da célula (em blocos) usada para amostrar centros de asteroides.
 */
export const ASTEROID_CELL_SIZE = 18;

/**
 * Margem extra usada ao calcular células vizinhas que podem afetar o chunk.
 */
export const ASTEROID_CELL_MARGIN = 10;

/**
 * Alcance máximo ao longo do eixo principal do asteroide.
 */
export const ASTEROID_MAJOR_RADIUS = 10;

/**
 * Alcance transversal (eixo curto) do asteroide.
 */
export const ASTEROID_MINOR_RADIUS = 6;

/**
 * Alcance vertical (meia altura) do asteroide.
 */
export const ASTEROID_VERTICAL_RADIUS = 7;

/**
 * Número de aglomerados (sub-porções) por asteroide.
 */
export const ASTEROID_CLUMP_COUNT = {
  min: 4,
  max: 6,
} as const;

/**
 * Quantidade total de blocos por asteroide (12–18 blocos, quebrados em clumps).
 */
export const ASTEROID_BLOCK_COUNT = {
  min: 12,
  max: 18,
} as const;

/**
 * Escalas de ruído usadas na decisão de spawn.
 */
export const ASTEROID_NOISE_PROFILE = {
  scaleA: 160,
  weightA: 0.6,
  scaleB: 120,
  weightB: 0.25,
  scaleC: 90,
  weightC: 0.15,
} as const;

/**
 * Raio externo do cinturão de asteroides, ajustado conforme draw distance.
 */
export const ASTEROID_RING_OUTER_RADIUS = Math.max(
  ASTEROID_RING_INNER_RADIUS + ASTEROID_MAJOR_RADIUS,
  TARGET_VIEW_DISTANCE_BLOCKS - 40,
);
