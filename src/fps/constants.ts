import { Color3 } from "babylonjs";

// Core metric references keep the scene grounded in human scale (meters, kilograms, seconds).
export const HUMAN_DIMENSIONS = {
  height: 1.8,
  eyeLevel: 1.72,
} as const;

export const SHIP_INTERIOR_DIMENSIONS = {
  deckClearance: 2.1,
  doorHeight: 1.85,
} as const;

export const GRID_SIZE = 0.5;

export const WALL_DIMENSIONS = {
  width: 1,
  height: SHIP_INTERIOR_DIMENSIONS.deckClearance,
  thickness: 0.18,
} as const;

export const HULL_DIMENSIONS = {
  width: 4.2,
  length: 9.6,
  height: SHIP_INTERIOR_DIMENSIONS.deckClearance,
} as const;

export const LAMP_DIMENSIONS = {
  height: 1.6,
  radius: 0.2,
  stemRadius: 0.05,
} as const;

export const CAMERA_SETTINGS = {
  speed: 1.6,
  sprintMultiplier: 1.75,
  minZ: 0.05,
  maxZ: 250,
  angularSensibility: 2600,
  inertia: 0.05,
  ellipsoid: { x: 0.35, y: 0.9, z: 0.35 },
  ellipsoidOffset: { x: 0, y: 0.9, z: 0 },
  eyeLevel: HUMAN_DIMENSIONS.eyeLevel,
} as const;

export const WALL_LIGHT_STRIP = {
  count: 6,
  height: 1.95,
  inset: 0.28,
  tilt: -0.18,
  cone: Math.PI / 3.1,
  range: 14,
  warm: {
    color: new Color3(1, 0.83, 0.58),
    intensity: 1.25,
  },
  cool: {
    color: new Color3(0.58, 0.8, 1),
    intensity: 1.15,
  },
} as const;

export const INPUT_KEYS = {
  move: {
    forward: 87, // W
    left: 65, // A
    backward: 83, // S
    right: 68, // D
  },
  rotate: "KeyR",
  sprint: ["ShiftLeft", "ShiftRight"],
  wallMode: "Digit1",
  lampMode: "Digit2",
} as const;

export const LAMP_COLOR_PALETTE = [
  new Color3(0.98, 0.82, 0.62),
  new Color3(0.72, 0.84, 1),
] as const;
