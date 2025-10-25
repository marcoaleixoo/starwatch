/**
 * Limites de zoom da câmera FPS. Consumido em `player/index.ts`.
 */
export const CAMERA_ZOOM_LIMITS = {
  min: 0,
  max: 10,
  step: 0.5,
} as const;

/**
 * Ajustes de movimentação básica do jogador (velocidade máxima, força de movimento).
 */
export const PLAYER_MOVEMENT = {
  maxSpeed: 8,
  moveForce: 35,
} as const;
