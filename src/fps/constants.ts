import { Color3 } from "babylonjs";

export const GRID_SIZE = 2;

export const WALL_DIMENSIONS = {
  width: 2,
  height: 3,
  thickness: 0.3,
} as const;

export const HULL_DIMENSIONS = {
  width: 18,
  length: 26,
  height: 6,
} as const;

export const LAMP_DIMENSIONS = {
  height: 2.4,
  radius: 0.35,
  stemRadius: 0.08,
} as const;

export const CAMERA_SETTINGS = {
  speed: 0.45,
  sprintMultiplier: 2.1,
  minZ: 0.05,
  maxZ: 250,
  angularSensibility: 2600,
  inertia: 0.06,
  ellipsoid: { x: 0.4, y: 0.9, z: 0.4 },
  ellipsoidOffset: { x: 0, y: 0.9, z: 0 },
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
