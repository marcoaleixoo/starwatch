const SEED = [0.137, 0.273, 0.419];
const LOOKUP_SIZE = 1000;

const noiseValues = Array.from({ length: LOOKUP_SIZE }, (_, i) => {
  const a = Math.cos(Math.PI * 2 * (i / 1000 + SEED[0]));
  const b = 0.5 * Math.cos(Math.PI * 2 * (i / 500 + SEED[1]));
  const c = 0.25 * Math.cos(Math.PI * 2 * (i / 250 + SEED[2]));
  return a + b + c;
});

export function sampleCloudNoise(x: number, scale: number): number {
  const nx = x / scale;
  const ix = nx - Math.floor(nx);
  const lookupIndex = Math.floor(ix * LOOKUP_SIZE) % LOOKUP_SIZE;
  return noiseValues[lookupIndex];
}
