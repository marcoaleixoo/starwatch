import { Vector3 } from 'babylonjs';

export type ResourceType = 'iron' | 'silicon' | 'uranium';

export type ClusterDef = {
  id: string;
  type: ResourceType; // dominant resource
  center: { x: number; y: number; z: number };
  radius: number; // cluster radius (km)
};

export type AsteroidDef = {
  id: string;
  position: { x: number; y: number; z: number };
  radius: number; // visual size (km)
  resource: ResourceType;
  amount: number; // resource remaining (tons)
  clusterId?: string;
};

export type Sector = {
  id: string;
  name: string;
  seed: number;
  bounds: number; // roughly the play radius from origin (km)
  clusters: ClusterDef[];
  asteroids: AsteroidDef[];
};

// Simple seeded PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function weightedPick<T>(rng: () => number, items: { v: T; w: number }[]): T {
  const total = items.reduce((a, b) => a + b.w, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it.v;
  }
  return items[items.length - 1]!.v;
}

function nameFromSeed(seed: number): string {
  const prefixes = ['Elysion', 'Kepler', 'Tethys', 'Aquila', 'Cygnus', 'Hydra', 'Vela', 'Altair', 'Draco'];
  const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  const rng = mulberry32(seed);
  const p = pick(rng, prefixes);
  const s = pick(rng, suffixes);
  const n = Math.floor(rng() * 900 + 100);
  return `${p}-${n}-${s}`;
}

export function generateSector(seed = Math.floor(Math.random() * 2 ** 31)): Sector {
  const rng = mulberry32(seed);
  const bounds = 1500; // overall sector radius

  // Generate a few clusters
  const clustersCount = Math.floor(rng() * 3) + 3; // 3..5
  const clusters: ClusterDef[] = [];
  const resourceBias: ResourceType[] = ['iron', 'silicon', 'uranium'];

  for (let i = 0; i < clustersCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = (0.35 + rng() * 0.55) * bounds; // not too close to center
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    // vertical layering by type
    const type = resourceBias[i % resourceBias.length]!;
    let yCenter = 0;
    if (type === 'iron') yCenter = (rng() - 0.5) * 120; // around midplane
    if (type === 'silicon') yCenter = 120 + rng() * 180; // upper layers
    if (type === 'uranium') yCenter = -200 - rng() * 200; // deeper layers
    const r = 180 + rng() * 220; // cluster radius
    clusters.push({ id: `cl-${i}`, type, center: { x, y: yCenter, z }, radius: r });
  }

  const asteroids: AsteroidDef[] = [];

  // Distribute asteroids: background sparse + clusters dense
  const backgroundCount = 40 + Math.floor(rng() * 20); // 40..60
  for (let i = 0; i < backgroundCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * bounds;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = (rng() - 0.5) * 600; // spread in height
    const radius = 2 + rng() * 4;
    const resource = weightedPick(rng, [
      { v: 'iron' as const, w: 6 },
      { v: 'silicon' as const, w: 3 },
      { v: 'uranium' as const, w: 1 },
    ]);
    const amount = Math.round((15 + rng() * 35) * radius); // scaled by size
    asteroids.push({ id: `bg-${i}`, position: { x, y, z }, radius, resource, amount });
  }

  // Clustered asteroids
  let aid = 0;
  for (const c of clusters) {
    const count = 40 + Math.floor(rng() * 40); // 40..80 per cluster
    for (let i = 0; i < count; i++) {
      // random in circle
      const a = rng() * Math.PI * 2;
      const d = Math.sqrt(rng()) * c.radius; // sqrt for uniform distribution within circle
      const x = c.center.x + Math.cos(a) * d;
      const z = c.center.z + Math.sin(a) * d;
      // vertical distribution per type
      let y = c.center.y;
      const thickness = c.type === 'iron' ? 80 : c.type === 'silicon' ? 140 : 200;
      y += (rng() - 0.5) * thickness;
      const radius = 3 + rng() * 7;
      const resource = weightedPick(rng, [
        { v: c.type, w: 8 },
        { v: 'iron' as const, w: c.type === 'iron' ? 4 : 2 },
        { v: 'silicon' as const, w: c.type === 'silicon' ? 4 : 2 },
        { v: 'uranium' as const, w: c.type === 'uranium' ? 3 : 1 },
      ]);
      const amount = Math.round((30 + rng() * 70) * radius);
      asteroids.push({ id: `a-${aid++}`, position: { x, y, z }, radius, resource, amount, clusterId: c.id });
    }
  }

  // Center clearing (some free space at origin)
  const filtered = asteroids.filter((a) => new Vector3(a.position.x, 0, a.position.z).length() > 120);

  return {
    id: `S-${seed.toString(16)}`,
    name: nameFromSeed(seed),
    seed,
    bounds,
    clusters,
    asteroids: filtered,
  };
}
