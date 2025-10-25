/**
 * Coleção de utilitários determinísticos para geração procedural.
 * Mantém um PRNG barato e hashes estáveis que evitam dependências extras.
 */
export function createSeededRng(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822519) + 0x9e3779b9;
    state >>>= 0;
    return state / 0x100000000;
  };
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function hash2D(x: number, z: number): number {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h ^= h >> 16;
  return h >>> 0;
}

export function hash3D(x: number, y: number, z: number): number {
  let h = x * 374761393 + y * 668265263 + z * 144305901;
  h = (h ^ (h >> 13)) * 1274126177;
  h ^= h >> 16;
  return h >>> 0;
}
