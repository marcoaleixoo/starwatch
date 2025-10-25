export const PLATFORM_HALF_EXTENT = 5; // 10x10 surface
export const PLATFORM_HEIGHT = 0;

export const CLOUD_LAYER_ALTITUDE = 38;
export const CLOUD_LAYER_THICKNESS = 4;
export const CLOUD_RING_INNER_RADIUS = 40;
export const CLOUD_RING_OUTER_RADIUS = 180;
export const CLOUD_DENSITY_THRESHOLD = 0.72;

export const CAMERA_ZOOM_LIMITS = {
  min: 0,
  max: 10,
  step: 0.5,
} as const;

export const PLAYER_MOVEMENT = {
  maxSpeed: 8,
  moveForce: 35,
} as const;
