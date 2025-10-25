const noiseSeed = [0.137, 0.273, 0.419];
const noiseValues = Array.from({ length: 1000 }, (_, i) => {
  const a = Math.cos(Math.PI * 2 * (i / 1000 + noiseSeed[0]));
  const b = 0.5 * Math.cos(Math.PI * 2 * (i / 500 + noiseSeed[1]));
  const c = 0.25 * Math.cos(Math.PI * 2 * (i / 250 + noiseSeed[2]));
  return a + b + c;
});

export function sampleNoise(x: number, scale: number): number {
  const nx = x / scale;
  const ix = nx - Math.floor(nx);
  const lookupIndex = Math.floor(ix * noiseValues.length) % noiseValues.length;
  return noiseValues[lookupIndex];
}
