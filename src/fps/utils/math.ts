export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
