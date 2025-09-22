import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, Color3, StandardMaterial, Mesh, Color4, DynamicTexture, ParticleSystem, Texture, VertexBuffer, GlowLayer, PointLight } from 'babylonjs';
import type { ResourceType, Sector } from './world';
import { generateSector } from './world';

type Vec3 = { x: number; y: number; z: number };

type ScriptJob = { name: string; code: string };

export class Game {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private ship = { mesh: null as unknown as Mesh, velocity: new Vector3(0, 0, 0), maxSpeed: 1.8, destination: null as Vector3 | null };
  private world!: Sector;
  private asteroidMeshes = new Map<string, Mesh>();
  private meshToAsteroidId = new Map<string, string>();
  private selected: { type: 'ship' | 'asteroid' | null; id?: string } = { type: null };
  private selectedPrevEmissive: Color3 | null = null;
  private inventory = { iron: 0, silicon: 0, uranium: 0 };
  private mining = { targetId: null as string | null, active: false, range: 10, rate: 5 }; // tons per second
  private scanned = new Set<string>();
  private scanRadius = 1000; // km
  private logicTimer: number | null = null;
  private worker: Worker | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.02, 0.04, 0.08, 1); // deep space
    // Softer, longer-range fog for melhor visibilidade
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogColor = new Color3(0.03, 0.06, 0.12) as any;
    (this.scene as any).fogStart = 2500;
    (this.scene as any).fogEnd = 9000;

    // Camera: top-down, small angle
    this.camera = new ArcRotateCamera('camera', Math.PI / 2, 1.2, 120, new Vector3(0, 0, 0), this.scene);
    this.camera.attachControl(canvas, true);
    this.camera.panningSensibility = 50;
    this.camera.lowerRadiusLimit = 40;
    this.camera.upperRadiusLimit = 1000;
    this.camera.minZ = 0.1;

    new HemisphericLight('light1', new Vector3(1, 1, 0), this.scene);

    // Ship mesh
    const ship = MeshBuilder.CreateBox('ship', { width: 2.2, depth: 5, height: 1.2 }, this.scene);
    const sm = new StandardMaterial('shipMat', this.scene);
    sm.diffuseColor = new Color3(0.5, 0.7, 1);
    ship.material = sm;
    this.ship.mesh = ship as any;

    // Load or generate sector and spawn bodies
    const loaded = this.tryLoad();
    if (!loaded) {
      this.world = generateSector();
    }
    this.spawnSector();

    // Background: starfield skybox + subtle dust + sun
    this.createStarfield();
    this.createSpaceDust();
    this.createSun();

    // Input: selection picking
    this.setupPicking();

    // Render loop
    this.engine.runRenderLoop(() => {
      this.updatePhysics();
      this.scene.render();
    });

    // Logic tick at 1 Hz
    this.logicTimer = window.setInterval(() => this.logicTick(), 1000);

    // Resize
    window.addEventListener('resize', () => this.engine.resize());
  }

  dispose() {
    if (this.logicTimer) window.clearInterval(this.logicTimer);
    this.worker?.terminate();
    this.scene.dispose();
    this.engine.dispose();
  }

  moveTo(v: Vec3) {
    this.ship.destination = new Vector3(v.x, v.y, v.z);
  }

  getShipStatus() {
    return {
      position: this.ship.mesh.position.clone(),
      speed: this.ship.velocity.length(),
      destination: this.ship.destination ? { x: this.ship.destination.x, y: this.ship.destination.y, z: this.ship.destination.z } : null,
    };
  }

  getSectorInfo() {
    const counts = this.world.asteroids.reduce(
      (acc, a) => {
        acc[a.resource] += a.amount > 0 ? 1 : 0;
        return acc;
      },
      { iron: 0, silicon: 0, uranium: 0 } as Record<ResourceType, number>
    );
    return {
      id: this.world.id,
      name: this.world.name,
      seed: this.world.seed,
      bounds: this.world.bounds,
      asteroidCounts: counts,
    };
  }

  getResources() {
    return { ...this.inventory };
  }

  performScan() {
    // Reveal asteroides dentro do raio de varredura a partir da nave
    const pos = this.ship.mesh.position;
    const newly: string[] = [];
    for (const a of this.world.asteroids) {
      if (a.amount <= 0) continue;
      if (this.scanned.has(a.id)) continue;
      const d = new Vector3(a.position.x, a.position.y, a.position.z).subtract(pos).length();
      if (d <= this.scanRadius) {
        this.scanned.add(a.id);
        newly.push(a.id);
      }
    }
    return newly;
  }

  scanSector(filter?: { resource?: ResourceType; limit?: number }) {
    const pos = this.ship.mesh.position;
    const entries = this.world.asteroids
      .filter((a) => this.scanned.has(a.id) && a.amount > 0 && (!filter?.resource || a.resource === filter.resource))
      .map((a) => {
        const d = new Vector3(a.position.x, a.position.y, a.position.z).subtract(pos).length();
        return { id: a.id, resource: a.resource, amount: a.amount, position: a.position, distance: d, clusterId: a.clusterId };
      })
      .sort((a, b) => a.distance - b.distance);
    const limit = filter?.limit ?? 10;
    return entries.slice(0, limit);
  }

  startMining(resource: ResourceType) {
    // Prefer scanned targets; if none scanned, try performScan first
    let nearest = this.scanSector({ resource, limit: 1 })[0];
    if (!nearest) {
      this.performScan();
      nearest = this.scanSector({ resource, limit: 1 })[0];
    }
    if (!nearest) return { ok: false as const, error: 'No asteroid found for resource' };
    this.mining.targetId = nearest.id;
    this.mining.active = false; // will activate when in range
    this.ship.destination = new Vector3(nearest.position.x, nearest.position.y, nearest.position.z);
    return { ok: true as const, targetId: nearest.id, position: nearest.position };
  }

  stopMining() {
    this.mining.targetId = null;
    this.mining.active = false;
    return { ok: true as const };
  }

  resetSector() {
    // Clear persistence and regenerate
    try { localStorage.removeItem('starwatch.v010.save'); } catch {}
    // Dispose asteroid meshes
    for (const [, m] of this.asteroidMeshes) m.dispose(false, true);
    this.asteroidMeshes.clear();
    this.meshToAsteroidId.clear();
    // Reset state
    this.world = generateSector();
    this.scanned.clear();
    this.inventory = { iron: 0, silicon: 0, uranium: 0 };
    this.mining = { targetId: null, active: false, range: 10, rate: 5 };
    this.ship.destination = null;
    this.ship.mesh.position.set(0, 0, 0);
    this.worker?.terminate();
    this.worker = null;
    // Respawn
    this.spawnSector();
    // Save immediately
    this.save();
  }

  runScript(job: ScriptJob) {
    // Terminate old worker
    this.worker?.terminate();
    const blob = new Blob([
      this.makeWorkerSource(job.code)
    ], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url, { type: 'module' });
    URL.revokeObjectURL(url);

    worker.onmessage = (ev) => {
      const msg = ev.data;
      if (msg?.type === 'tool') {
        if (msg.name === 'moveTo') {
          const { x, y, z } = msg.args ?? {};
          this.moveTo({ x, y, z });
          worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true });
        }
      }
    };
    worker.onerror = (e) => {
      console.error('Script worker error', e);
    };
    this.worker = worker;
  }

  private makeWorkerSource(userCode: string) {
    // Tiny API bridge: Game.moveTo, Memory.get/set, sleep
    return `
      const Memory = new Map();
      function postTool(name, args) {
        return new Promise((resolve) => {
          const id = Math.random().toString(36).slice(2);
          function onAck(ev) {
            const msg = ev.data;
            if (msg && msg.type === 'tool-ack' && msg.id === id) {
              resolve(msg);
              self.removeEventListener('message', onAck);
            }
          }
          self.addEventListener('message', onAck);
          postMessage({ type: 'tool', id, name, args });
        });
      }
      const Game = {
        moveTo: async (v) => {
          await postTool('moveTo', v);
        }
      };
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      // Provide Memory API (string keys only for simplicity)
      const MemoryAPI = {
        set: (k, v) => Memory.set(k, v),
        get: (k) => Memory.get(k)
      };
      // Expose globals
      self.Game = Game;
      self.Memory = MemoryAPI;
      self.sleep = sleep;
      // Built-in helpers for convenience (so LLM can call patrol())
      async function patrol() {
        const A = { x: 500, y: 0, z: 250 };
        const B = { x: 200, y: 0, z: -200 };
        while (true) {
          await Game.moveTo(A);
          await sleep(3000);
          await Game.moveTo(B);
          await sleep(3000);
        }
      }
      (async () => { try {\n${userCode}\n } catch (e) { console.error('User script error:', e); } })();
    `;
  }

  private updatePhysics() {
    const dt = this.engine.getDeltaTime() / 1000; // seconds
    const pos = this.ship.mesh.position;
    if (this.ship.destination) {
      const to = this.ship.destination.subtract(pos);
      const dist = to.length();
      if (dist < 0.5) {
        this.ship.velocity.setAll(0);
      } else {
        const dir = to.normalize();
        this.ship.velocity = dir.scale(this.ship.maxSpeed);
      }
    } else {
      this.ship.velocity.setAll(0);
    }
    pos.addInPlace(this.ship.velocity.scale(dt));

    // Mining auto-activation and extraction
    if (this.mining.targetId) {
      const a = this.world.asteroids.find((x) => x.id === this.mining.targetId);
      if (a && a.amount > 0) {
        const d = new Vector3(a.position.x, a.position.y, a.position.z).subtract(pos).length();
        if (!this.mining.active && d <= this.mining.range) {
          this.mining.active = true;
        }
        if (this.mining.active && d <= this.mining.range + 2) {
          // Extract resources
          const mined = Math.min(this.mining.rate * dt, a.amount);
          a.amount -= mined;
          // Update inventory
          if (a.resource === 'iron') this.inventory.iron += mined;
          if (a.resource === 'silicon') this.inventory.silicon += mined;
          if (a.resource === 'uranium') this.inventory.uranium += mined;
          // Visual feedback: shrink slightly
          const mesh = this.asteroidMeshes.get(a.id);
          if (mesh) {
            const base = Math.max(0.5, a.radius * 0.5);
            const factor = Math.max(0.2, a.amount / (a.radius * 100));
            mesh.scaling.setAll(Math.max(base * factor, 0.2));
          }
          if (a.amount <= 0.0001) {
            // Depleted: remove visually
            const m = this.asteroidMeshes.get(a.id);
            if (m) {
              m.dispose(false, true);
              this.asteroidMeshes.delete(a.id);
            }
            this.mining.targetId = null;
            this.mining.active = false;
          }
        }
      } else {
        // Target disappeared
        this.mining.targetId = null;
        this.mining.active = false;
      }
    }
  }

  private logicTick() {
    // Persist state periodically
    this.save();
  }

  private spawnSector() {
    // remove any previous
    for (const [, m] of this.asteroidMeshes) m.dispose(false, true);
    this.asteroidMeshes.clear();
    this.meshToAsteroidId.clear();

    for (const a of this.world.asteroids) {
      if (a.amount <= 0) continue;
      const mesh = this.createAsteroidMesh(a.id, a.resource, a.radius);
      const mat = new StandardMaterial(`mat:${a.id}`, this.scene);
      // Consistent color by type (iron=green, silicon=bluish, uranium=amber)
      if (a.resource === 'iron') mat.diffuseColor = new Color3(0.3, 0.75, 0.35);
      if (a.resource === 'silicon') mat.diffuseColor = new Color3(0.65, 0.7, 0.85);
      if (a.resource === 'uranium') mat.diffuseColor = new Color3(0.85, 0.75, 0.35);
      mesh.material = mat;
      mesh.position = new Vector3(a.position.x, a.position.y, a.position.z);
      this.asteroidMeshes.set(a.id, mesh);
      this.meshToAsteroidId.set(mesh.id, a.id);
    }
  }

  private setupPicking() {
    this.scene.onPointerDown = (_evt, pickInfo) => {
      // Cleanup previous highlight
      if (this.selected.type === 'asteroid' && this.selected.id) {
        const m = this.asteroidMeshes.get(this.selected.id);
        if (m && m.material instanceof StandardMaterial && this.selectedPrevEmissive) {
          (m.material as StandardMaterial).emissiveColor = this.selectedPrevEmissive;
        }
      }
      this.selected = { type: null };
      this.selectedPrevEmissive = null;

      if (pickInfo?.hit && pickInfo.pickedMesh) {
        const mesh = pickInfo.pickedMesh as Mesh;
        if (mesh.id === this.ship.mesh.id) {
          this.selected = { type: 'ship' };
          this.focusCameraOn(this.ship.mesh.position);
        } else if (mesh.id.startsWith('ast:')) {
          const aId = this.meshToAsteroidId.get(mesh.id);
          if (aId) {
            this.selected = { type: 'asteroid', id: aId };
            if (mesh.material instanceof StandardMaterial) {
              const sm = mesh.material as StandardMaterial;
              this.selectedPrevEmissive = sm.emissiveColor.clone();
              sm.emissiveColor = new Color3(0.3, 0.5, 0.9);
            }
            this.focusCameraOn((this.asteroidMeshes.get(aId) as Mesh).position, 80);
          }
        }
      }
    };
  }

  private rndFromId(id: string) {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) h = (h ^ id.charCodeAt(i)) * 16777619;
    const seed = h >>> 0;
    return function () {
      // mulberry32
      let t = (seed + 0x6d2b79f5) >>> 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private createAsteroidMesh(id: string, resource: ResourceType, radius: number): Mesh {
    // Base meshes vary by type
    let mesh: Mesh;
    const name = `ast:${id}`;
    if (resource === 'silicon') {
      // sharp crystal-like
      mesh = MeshBuilder.CreatePolyhedron(name, { type: 1, size: radius }, this.scene); // Tetrahedron
    } else if (resource === 'uranium') {
      // elongated body
      mesh = MeshBuilder.CreateIcoSphere(name, { radius, subdivisions: 2 }, this.scene);
      mesh.scaling = new Vector3(1.0, 0.7, 1.3);
    } else {
      // iron: chunky rock
      mesh = MeshBuilder.CreateIcoSphere(name, { radius, subdivisions: 3 }, this.scene);
    }

    // Perturb vertices deterministically for id
    const rng = this.rndFromId(id);
    const pos = mesh.getVerticesData(VertexBuffer.PositionKind) as number[];
    if (pos) {
      const amp = resource === 'silicon' ? 0.12 : resource === 'uranium' ? 0.18 : 0.22;
      for (let i = 0; i < pos.length; i += 3) {
        const nx = (rng() - 0.5) * 2;
        const ny = (rng() - 0.5) * 2;
        const nz = (rng() - 0.5) * 2;
        pos[i] += nx * amp * radius;
        pos[i + 1] += ny * amp * radius;
        pos[i + 2] += nz * amp * radius;
      }
      mesh.updateVerticesData(VertexBuffer.PositionKind, pos);
      mesh.refreshBoundingInfo();
    }
    return mesh;
  }

  focusCameraOn(target: Vector3 | { x: number; y: number; z: number }, radius: number = 100) {
    const t = target instanceof Vector3 ? target : new Vector3(target.x, target.y, target.z);
    // Smoothly move camera target and radius
    this.camera.setTarget(t);
    this.camera.radius = Math.max(40, Math.min(radius, 1000));
  }

  getFleet() {
    return [
      {
        id: 'mothership',
        name: 'USS [Nome da Nave]',
        type: 'mothership',
        position: { x: this.ship.mesh.position.x, y: this.ship.mesh.position.y, z: this.ship.mesh.position.z },
        speed: this.ship.velocity.length(),
        script: this.worker ? 'custom' : null,
      },
    ];
  }

  getClustersOverview(onlyScanned = true) {
    const clusters = this.world.clusters.map((c) => ({ id: c.id, type: c.type, center: c.center, radius: c.radius }));
    const astByCluster = new Map<string, any[]>();
    for (const a of this.world.asteroids) {
      if (onlyScanned && !this.scanned.has(a.id)) continue;
      if (!a.clusterId) continue;
      const arr = astByCluster.get(a.clusterId) || [];
      arr.push({ id: a.id, resource: a.resource, amount: a.amount, position: a.position });
      astByCluster.set(a.clusterId, arr);
    }
    return clusters.map((c) => ({
      ...c,
      discovered: (astByCluster.get(c.id) || []).length,
    }));
  }

  getAsteroidsInCluster(clusterId: string, onlyScanned = true) {
    const pos = this.ship.mesh.position;
    return this.world.asteroids
      .filter((a) => a.clusterId === clusterId && (!onlyScanned || this.scanned.has(a.id)))
      .map((a) => ({ id: a.id, resource: a.resource, amount: a.amount, position: a.position, distance: Vector3.Distance(new Vector3(a.position.x, a.position.y, a.position.z), pos) }))
      .sort((a, b) => a.distance - b.distance);
  }

  private createStarfield() {
    const size = 8192; // big box
    const sky = MeshBuilder.CreateBox('sky', { size, sideOrientation: Mesh.BACKSIDE }, this.scene);
    const texSize = 1024;
    const dt = new DynamicTexture('stars', { width: texSize, height: texSize }, this.scene, false);
    const ctx = dt.getContext();
    // Fill background
    ctx.fillStyle = '#070a14';
    ctx.fillRect(0, 0, texSize, texSize);
    // draw stars
    const stars = 2000;
    for (let i = 0; i < stars; i++) {
      const x = Math.random() * texSize;
      const y = Math.random() * texSize;
      const r = Math.random() * 1.6 + 0.2;
      const hue = Math.random() < 0.3 ? 220 + Math.random() * 20 : 0; // blueish sometimes
      const col = hue ? `hsl(${hue},70%,${70 + Math.random() * 20}%)` : `rgb(230,235,255)`;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (Math.random() < 0.1) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    dt.update(false);
    const mat = new StandardMaterial('skyMat', this.scene);
    mat.backFaceCulling = false;
    mat.disableLighting = true;
    // Use both diffuse and emissive to guarantee visibility
    (mat as any).diffuseTexture = dt as unknown as Texture;
    mat.emissiveTexture = dt as unknown as Texture;
    mat.specularColor = new Color3(0, 0, 0);
    mat.ambientColor = new Color3(0, 0, 0);
    (sky as any).material = mat;
    (sky as any).isPickable = false;
    (sky as any).applyFog = false;
    (sky as any).infiniteDistance = true;
  }

  private createSpaceDust() {
    // subtle particles across a big box volume
    const ps = new ParticleSystem('spaceDust', 2000, this.scene);
    const dot = new DynamicTexture('dustDot', { width: 16, height: 16 }, this.scene, true);
    const c = dot.getContext();
    c.clearRect(0, 0, 16, 16);
    c.fillStyle = 'white';
    c.beginPath();
    c.arc(8, 8, 3, 0, Math.PI * 2);
    c.fill();
    dot.update(false);
    ps.particleTexture = dot as unknown as Texture;
    ps.minSize = 0.15;
    ps.maxSize = 0.8;
    ps.minLifeTime = 12;
    ps.maxLifeTime = 24;
    ps.emitRate = 120;
    ps.color1 = new Color4(1, 1, 1, 0.08);
    ps.color2 = new Color4(0.6, 0.7, 1, 0.06);
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.direction1 = new Vector3(-0.2, 0, 0.2);
    ps.direction2 = new Vector3(0.2, 0, -0.2);
    ps.minEmitBox = new Vector3(-3000, -3000, -3000);
    ps.maxEmitBox = new Vector3(3000, 3000, 3000);
    ps.gravity = new Vector3(0, 0, 0);
    ps.start();
  }

  private createSun() {
    const sun = MeshBuilder.CreateSphere('sun', { diameter: 600 }, this.scene);
    sun.position = new Vector3(3000, 500, -2500);
    const mat = new StandardMaterial('sunMat', this.scene);
    mat.emissiveColor = new Color3(1.0, 0.9, 0.7);
    mat.disableLighting = true;
    sun.material = mat;
    const glow = new GlowLayer('glow', this.scene);
    glow.intensity = 0.6;
    const light = new PointLight('sunLight', sun.position, this.scene);
    light.intensity = 0.7;
    light.range = 10000;
    (sun as any).applyFog = false;
  }

  private tryLoad(): boolean {
    try {
      const raw = localStorage.getItem('starwatch.v010.save');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.world = generateSector(data.world.seed);
      // restore asteroid amounts
      const byId = new Map<string, number>(Object.entries(data.world.asteroidAmounts || {}));
      for (const a of this.world.asteroids) {
        const amt = byId.get(a.id);
        if (typeof amt === 'number') a.amount = amt;
      }
      // scanned
      this.scanned = new Set<string>(data.scanned || []);
      // inventory
      this.inventory = data.inventory || this.inventory;
      // ship
      if (data.ship?.position) {
        this.ship.mesh = this.ship.mesh || ({} as any);
        const p = data.ship.position;
        // ship mesh may not be created yet; we set after spawn by returning true
        setTimeout(() => {
          this.ship.mesh.position.set(p.x, p.y, p.z);
        }, 0);
      }
      if (data.ship?.destination) this.ship.destination = new Vector3(data.ship.destination.x, data.ship.destination.y, data.ship.destination.z);
      return true;
    } catch (e) {
      console.warn('Load failed, starting new', e);
      return false;
    }
  }

  private save() {
    try {
      const asteroidAmounts: Record<string, number> = {};
      for (const a of this.world.asteroids) asteroidAmounts[a.id] = a.amount;
      const data = {
        world: { seed: this.world.seed, asteroidAmounts },
        scanned: Array.from(this.scanned),
        inventory: this.inventory,
        ship: {
          position: { x: this.ship.mesh.position.x, y: this.ship.mesh.position.y, z: this.ship.mesh.position.z },
          destination: this.ship.destination ? { x: this.ship.destination.x, y: this.ship.destination.y, z: this.ship.destination.z } : null,
        },
      };
      localStorage.setItem('starwatch.v010.save', JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed', e);
    }
  }
}

declare global {
  // Worker script globals (type-only exposure for TS consumers)
  interface WorkerGlobalScope {
    Game: { moveTo(v: Vec3): Promise<void> };
    Memory: { set(k: string, v: unknown): void; get(k: string): unknown };
    sleep(ms: number): Promise<void>;
  }
}
