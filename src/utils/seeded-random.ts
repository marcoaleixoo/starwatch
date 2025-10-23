const DEFAULT_SEED = 0x6d2b79f5;

function hashStringToInt(seed: string): number {
  let h = DEFAULT_SEED;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 13;
  }
  return h >>> 0;
}

export class SeededRandom {
  private state: number;

  constructor(seed: string | number) {
    const initial = typeof seed === 'number' ? seed : hashStringToInt(seed);
    this.state = initial === 0 ? DEFAULT_SEED : initial >>> 0;
  }

  next(): number {
    // Mulberry32 PRNG
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (maxExclusive <= minInclusive) {
      return minInclusive;
    }
    const span = maxExclusive - minInclusive;
    return minInclusive + Math.floor(this.next() * span);
  }

  nextFloat(min: number, max: number): number {
    if (max <= min) {
      return min;
    }
    return min + (max - min) * this.next();
  }

  nextSigned(): number {
    return this.next() * 2 - 1;
  }

  fork(label: string | number): SeededRandom {
    const seed = typeof label === 'number' ? label : hashStringToInt(label);
    return new SeededRandom(this.state ^ seed);
  }
}

export function pseudoNoise3D(x: number, y: number, z: number, seed: number): number {
  let n = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n & 0x7fffffff) / 0x3fffffff - 1;
}
