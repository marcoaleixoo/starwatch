/**
 * Distância alvo de renderização em blocos. Altere este valor para expandir
 * ou reduzir o horizonte visual (chunk distance é recalculada automaticamente).
 */
export const TARGET_VIEW_DISTANCE_BLOCKS = 812;

/**
 * Tamanho base de cada chunk NOA (em blocos). Mantemos 32 como padrão do engine.
 */
export const CHUNK_SIZE = 32;

const horizontalAdd = Math.max(2.5, TARGET_VIEW_DISTANCE_BLOCKS / CHUNK_SIZE);
const verticalAdd = Math.max(2, horizontalAdd * 0.6);

/**
 * Distância de adição de chunks (horizontal, vertical) consumida pelo engine.
 */
export const CHUNK_ADD_DISTANCE: [number, number] = [horizontalAdd, verticalAdd];

/**
 * Distância de remoção (hysterese) para descarregar chunks fora de vista.
 */
export const CHUNK_REMOVE_DISTANCE: [number, number] = [horizontalAdd + 1, verticalAdd + 0.5];
