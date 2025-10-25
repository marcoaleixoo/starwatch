import { TARGET_VIEW_DISTANCE_BLOCKS } from './render-options';

/** Identificador canônico do setor atual (single node do grafo). */
export const DEFAULT_SECTOR_ID = 'sector-lyra-z7';

/**
 * Tamanho (meia extensão) da plataforma inicial onde o jogador nasce.
 * Consumido em `sector/chunk-generator.ts` para definir o platô 10×10.
 */
export const PLATFORM_HALF_EXTENT = 5;

/**
 * Altura absoluta (eixo Y) da plataforma inicial.
 * Utilizado pelo setor generator para colocar o grid no nível correto.
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
export const ASTEROID_LAYER_ALTITUDE = 52;

/**
 * Variação máxima (para cima/baixo) da altura dos asteroides.
 */
export const ASTEROID_HEIGHT_VARIATION = 12;

/**
 * Raio interno a partir do qual começam os asteroides.
 */
export const ASTEROID_RING_INNER_RADIUS = 90;

/**
 * Densidade mínima (0–1) do ruído procedural para instanciar um asteroide.
 */
export const ASTEROID_DENSITY_THRESHOLD = 0.4;

/**
 * Probabilidade base de spawn de um asteroide dentro de uma célula candidata.
 */
export const ASTEROID_CENTER_PROBABILITY = 0.18;

/**
 * Tamanho da célula (em blocos) usada para amostrar centros de asteroides.
 */
export const ASTEROID_CELL_SIZE = 48;

/**
 * Margem extra usada ao calcular células vizinhas que podem afetar o chunk.
 */
export const ASTEROID_CELL_MARGIN = 48;

/**
 * Alcance máximo ao longo do eixo principal do asteroide.
 */
export const ASTEROID_MAJOR_RADIUS = 14;

/**
 * Alcance transversal (eixo curto) do asteroide.
 */
export const ASTEROID_MINOR_RADIUS = 8;

/**
 * Alcance vertical (meia altura) do asteroide.
 */
export const ASTEROID_VERTICAL_RADIUS = 10;

/**
 * Quantidade total de blocos por asteroide (60–120 blocos, formando massas densas).
 */
export const ASTEROID_BLOCK_COUNT = {
  min: 60,
  max: 120,
} as const;

/**
 * Número de asteroides em cada cluster (1–3 massas por centro).
 */
export const ASTEROID_CLUSTER_SIZE = {
  min: 1,
  max: 3,
} as const;

/**
 * Distância (em blocos) para deslocar asteroides dentro do mesmo cluster.
 */
export const ASTEROID_CLUSTER_SPREAD = 24;

/**
 * Variedades de asteroide registradas como materiais/blocos, com pesos para distribuição.
 */
export const ASTEROID_VARIANTS = [
  {
    id: 'basalt',
    color: [0.36, 0.38, 0.42, 1],
    weight: 0.5,
  },
  {
    id: 'nickel',
    color: [0.56, 0.58, 0.62, 1],
    weight: 0.3,
  },
  {
    id: 'ice',
    color: [0.74, 0.8, 0.85, 1],
    weight: 0.2,
  },
] as const;

/**
 * Raio externo do cinturão de asteroides, ajustado conforme draw distance.
 */
export const ASTEROID_RING_OUTER_RADIUS = Math.max(
  ASTEROID_RING_INNER_RADIUS + ASTEROID_MAJOR_RADIUS,
  TARGET_VIEW_DISTANCE_BLOCKS - 40,
);
