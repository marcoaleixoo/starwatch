import { Engine, Scene, ArcRotateCamera, UniversalCamera, Vector3, HemisphericLight, MeshBuilder, Color3, StandardMaterial, Mesh, Color4, DynamicTexture, ParticleSystem, Texture, VertexBuffer, GlowLayer, PointLight, Scalar, KeyboardEventTypes } from 'babylonjs';
import type { ResourceType, Sector } from './world';
import { generateSector } from './world';

type Vec3 = { x: number; y: number; z: number };

type ScriptJob = { name: string; code: string };
type ScriptEntry = { code: string; description: string; lastModified: string };
type WorkerLogEntry = { id: string; level: 'info' | 'warn' | 'error'; message: string; timestamp: number };
type WorkerState = 'idle' | 'starting' | 'running' | 'completed' | 'error' | 'stopped';
type WorkerStatus = {
  scriptName: string | null;
  state: WorkerState;
  startedAt?: number;
  finishedAt?: number;
  logs: WorkerLogEntry[];
  lastMessage?: string;
  lastError?: string;
};

export type TerminalId = 'engineering' | 'construction';
export type TerminalInfo = { id: TerminalId; label: string; hint: string; description?: string };

type TerminalInstance = TerminalInfo & {
  mesh: Mesh;
  screen: Mesh;
  interactDistance: number;
  idleColor: Color3;
  activeColor: Color3;
  light?: PointLight | null;
};

type GameOptions = {
  onTerminalProximity?: (info: TerminalInfo | null) => void;
  onTerminalInteract?: (info: TerminalInfo) => void;
  onPointerLockChange?: (locked: boolean) => void;
};

export class Game {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private fpCamera: UniversalCamera;
  private options: GameOptions;
  private inputPaused = false;
  private pointerLocked = false;
  private terminals: TerminalInstance[] = [];
  private nearbyTerminal: TerminalInstance | null = null;
  private activeTerminalId: TerminalId | null = null;
  private canvasClickHandler: (() => void) | null = null;
  private pointerLockHandler: (() => void) | null = null;
  private ship = { mesh: null as unknown as Mesh, velocity: new Vector3(0, 0, 0), maxSpeed: 1.8, destination: null as Vector3 | null };
  private world!: Sector;
  private asteroidMeshes = new Map<string, Mesh>();
  private meshToAsteroidId = new Map<string, string>();
  private selected: { type: 'ship' | 'asteroid' | null; id?: string } = { type: null };
  private selectedPrevEmissive: Color3 | null = null;
  private inventory = { iron: 0, silicon: 0, uranium: 0 };
  private mining = { targetId: null as string | null, active: false, range: 10, rate: 5 };
  private miningLog: { lastEvent: 'none' | 'depleted' | 'stopped'; lastTarget?: { id: string; resource: ResourceType } } = { lastEvent: 'none' };
  private scanned = new Set<string>();
  private scanRadius = 1000; // km (redefinido após carregar o setor)
  private logicTimer: number | null = null;
  private worker: Worker | null = null;
  private workerStatus: WorkerStatus = { scriptName: null, state: 'idle', logs: [] };
  private mode: 'play' | 'sector' = 'play';
  private prevCam: { alpha: number; beta: number; radius: number; target: Vector3; fogMode: number; fogStart?: number; fogEnd?: number; fogDensity?: number; panning?: number; lockedTarget?: any; followingShip?: boolean } | null = null;
  private labelMeshes: Mesh[] = [];
  private sun?: Mesh;
  private starfield?: Mesh;
  private dustEmitter?: Mesh;
  private dustSystem?: ParticleSystem;
  private distantStars: Array<{ material: StandardMaterial; base: number; amplitude: number; speed: number; phase: number; color: Color3 }> = [];
  private followingShip = false;
  // Script Library (persisted)
  private scriptLibrary: Map<string, ScriptEntry> = new Map();

  constructor(private canvas: HTMLCanvasElement, options: GameOptions = {}) {
    this.options = options;
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.02, 0.04, 0.08, 1); // deep space
    // Softer, longer-range fog for melhor visibilidade
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogColor = new Color3(0.03, 0.06, 0.12) as any;
    (this.scene as any).fogStart = 2500;
    (this.scene as any).fogEnd = 9000;

    // Camera: top-down legacy (mantida para automações táticas)
    this.camera = new ArcRotateCamera('camera', Math.PI / 2, 1.2, 120, new Vector3(0, 0, 0), this.scene);
    this.camera.panningSensibility = 50;
    this.camera.lowerRadiusLimit = 40;
    this.camera.upperRadiusLimit = 1000;
    this.camera.minZ = 0.1;

    // First-person camera inside the ship
    this.scene.collisionsEnabled = true;
    this.scene.gravity = new Vector3(0, -0.6, 0);
    this.fpCamera = new UniversalCamera('fpCamera', new Vector3(0, 1.7, 6), this.scene);
    this.fpCamera.minZ = 0.05;
    this.fpCamera.speed = 1.8;
    this.fpCamera.inertia = 0.6;
    this.fpCamera.angularSensibility = 5200;
    this.fpCamera.applyGravity = true;
    this.fpCamera.checkCollisions = true;
    this.fpCamera.ellipsoid = new Vector3(0.5, 0.9, 0.5);
    this.fpCamera.keysUp.push(87, 38); // W / ArrowUp
    this.fpCamera.keysDown.push(83, 40); // S / ArrowDown
    this.fpCamera.keysLeft.push(65, 37); // A / ArrowLeft
    this.fpCamera.keysRight.push(68, 39); // D / ArrowRight
    this.scene.activeCamera = this.fpCamera;
    this.fpCamera.attachControl(canvas, true);
    const fpMouse = (this.fpCamera.inputs.attached as any)?.mouse;
    if (fpMouse) {
      fpMouse.usePointerLock = true;
    }
    this.setupPointerLock();

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
    // Ajustar parâmetros dependentes da escala do setor
    this.configureScaleFromWorld();
    this.spawnSector();

    // Load scripts library (seed with default patrol if empty)
    this.loadScripts();

    // Background: starfield skybox + subtle dust + sun
    this.createStarfield();
    this.createSpaceDust();
    this.createDistantStars();
    this.createSun();
    this.createShipInterior();

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

  private setupPointerLock() {
    if (this.canvasClickHandler) {
      this.canvas.removeEventListener('click', this.canvasClickHandler);
    }
    if (this.pointerLockHandler) {
      document.removeEventListener('pointerlockchange', this.pointerLockHandler);
    }
    this.canvasClickHandler = () => {
      if (this.inputPaused) return;
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    };
    this.pointerLockHandler = () => {
      const locked = document.pointerLockElement === this.canvas;
      this.pointerLocked = locked;
      this.options.onPointerLockChange?.(locked);
    };
    this.canvas.addEventListener('click', this.canvasClickHandler);
    document.addEventListener('pointerlockchange', this.pointerLockHandler);
  }

  dispose() {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
    if (this.canvasClickHandler) {
      this.canvas.removeEventListener('click', this.canvasClickHandler);
      this.canvasClickHandler = null;
    }
    if (this.pointerLockHandler) {
      document.removeEventListener('pointerlockchange', this.pointerLockHandler);
      this.pointerLockHandler = null;
    }
    if (this.logicTimer) window.clearInterval(this.logicTimer);
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.workerStatus = { scriptName: null, state: 'idle', logs: [] };
    this.scene.dispose();
    this.engine.dispose();
  }

  moveTo(v: Vec3) {
    this.ship.destination = new Vector3(v.x, v.y, v.z);
  }

  setFollowShip(on: boolean) {
    this.followingShip = on;
    if (on) {
      // Segue a nave usando lockedTarget
      this.camera.lockedTarget = this.ship.mesh;
    } else {
      this.camera.lockedTarget = null as any;
    }
  }

  isFollowingShip() {
    return this.followingShip;
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
    this.miningLog.lastEvent = 'none';
    return { ok: true as const, targetId: nearest.id, position: nearest.position };
  }

  stopMining() {
    this.mining.targetId = null;
    this.mining.active = false;
    this.miningLog.lastEvent = 'stopped';
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
    this.workerStatus = { scriptName: null, state: 'idle', logs: [] };
    // Respawn
    this.spawnSector();
    // Save immediately
    this.save();
  }

  enterSectorMap() {
    if (this.mode === 'sector') return;
    this.mode = 'sector';
    this.prevCam = {
      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,
      target: this.camera.target.clone(),
      fogMode: this.scene.fogMode!,
      fogStart: (this.scene as any).fogStart,
      fogEnd: (this.scene as any).fogEnd,
      fogDensity: (this.scene as any).fogDensity,
      panning: this.camera.panningSensibility,
      lockedTarget: (this.camera as any).lockedTarget,
      followingShip: this.followingShip,
    };
    // Desliga follow para visão do mapa do setor
    this.setFollowShip(false);
    // Top-down zoomed out
    this.camera.setTarget(new Vector3(0, 0, 0));
    this.camera.alpha = Math.PI / 2;
    this.camera.beta = 0.0001;
    this.camera.radius = this.world.bounds * 1.8;
    this.camera.panningSensibility = 0;
    // Disable fog for clarity
    this.scene.fogMode = Scene.FOGMODE_NONE as any;
    // Create labels
    this.createSectorLabels();
  }

  exitSectorMap() {
    if (this.mode !== 'sector') return;
    this.mode = 'play';
    // Restore camera and fog
    if (this.prevCam) {
      this.camera.setTarget(this.prevCam.target);
      this.camera.alpha = this.prevCam.alpha;
      this.camera.beta = this.prevCam.beta;
      this.camera.radius = this.prevCam.radius;
      if (this.prevCam.panning != null) this.camera.panningSensibility = this.prevCam.panning;
      this.scene.fogMode = this.prevCam.fogMode as any;
      (this.scene as any).fogStart = this.prevCam.fogStart;
      (this.scene as any).fogEnd = this.prevCam.fogEnd;
      (this.scene as any).fogDensity = this.prevCam.fogDensity;
      // Restaura lockTarget/follow ship
      if (this.prevCam.followingShip) this.setFollowShip(true);
      else this.camera.lockedTarget = this.prevCam.lockedTarget ?? null;
    }
    // Dispose labels
    for (const m of this.labelMeshes) m.dispose(false, true);
    this.labelMeshes = [];
  }

  runScript(job: ScriptJob) {
    if (this.worker) {
      this.worker.terminate();
      if (this.workerStatus.state === 'running' || this.workerStatus.state === 'starting') {
        this.workerStatus = {
          ...this.workerStatus,
          state: 'stopped',
          finishedAt: Date.now(),
          lastMessage: 'Script anterior interrompido.',
        };
      }
    }
    this.workerStatus = {
      scriptName: job.name,
      state: 'starting',
      startedAt: Date.now(),
      logs: [],
    };
    const blob = new Blob([
      this.makeWorkerSource(job.code, job.name)
    ], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url, { type: 'module' });
    URL.revokeObjectURL(url);
    this.worker = worker;
    this.workerStatus.state = 'running';

    worker.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg) return;
      if (msg.type === 'tool') {
        (async () => {
          try {
            if (msg.name === 'moveTo') {
              const { x, y, z } = msg.args ?? {};
              this.moveTo({ x, y, z });
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: null });
            } else if (msg.name === 'performScan') {
              const out = this.performScan();
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
            } else if (msg.name === 'scanSector') {
              const out = this.scanSector(msg.args);
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
            } else if (msg.name === 'startMining') {
              const out = this.startMining(msg.args?.resource);
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
            } else if (msg.name === 'stopMining') {
              const out = this.stopMining();
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
            } else if (msg.name === 'getMiningStatus') {
              const out = this.getMiningStatus();
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
            } else if (msg.name === 'getShipStatus') {
              const out = this.getShipStatus();
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
            } else if (msg.name === 'getResources') {
                const out = this.getResources();
                worker.postMessage({ type: 'tool-ack', id: msg.id, ok: true, result: out });
              }
            } catch (e) {
              console.error('Script tool error', e);
              worker.postMessage({ type: 'tool-ack', id: msg.id, ok: false, error: String(e) });
            }
        })();
      } else if (msg.type === 'log') {
        const entry: WorkerLogEntry = {
          id: msg.id || Math.random().toString(36).slice(2),
          level: msg.level === 'error' ? 'error' : msg.level === 'warn' ? 'warn' : 'info',
          message: String(msg.message ?? ''),
          timestamp: msg.timestamp || Date.now(),
        };
        this.workerStatus.logs = [...this.workerStatus.logs.slice(-99), entry];
        this.workerStatus.lastMessage = entry.message;
        if (entry.level === 'error') {
          this.workerStatus.lastError = entry.message;
        }
      } else if (msg.type === 'script-state') {
        if (msg.state === 'completed') {
          this.workerStatus = {
            ...this.workerStatus,
            state: 'completed',
            finishedAt: Date.now(),
            lastMessage: msg.message || 'Script concluído.',
          };
          worker.terminate();
          if (this.worker === worker) this.worker = null;
        } else if (msg.state === 'error') {
          this.workerStatus = {
            ...this.workerStatus,
            state: 'error',
            finishedAt: Date.now(),
            lastError: msg.error || 'Erro desconhecido',
          };
          worker.terminate();
          if (this.worker === worker) this.worker = null;
        }
      }
    };
    worker.onerror = (e) => {
      console.error('Script worker error', e);
      this.workerStatus = {
        ...this.workerStatus,
        state: 'error',
        finishedAt: Date.now(),
        lastError: e.message || String(e),
      };
      if (this.worker === worker) this.worker = null;
    };
  }

  runScriptByName(name: string) {
    const code = this.getScriptCode(name);
    if (!code) {
      console.warn('Script not found:', name);
      return { ok: false as const, error: 'Script not found' };
    }
    this.runScript({ name, code });
    return { ok: true as const };
  }

  private makeWorkerSource(userCode: string, scriptName: string) {
    // Tiny API bridge: Game.moveTo, Memory.get/set, sleep + mining/scan helpers
    return `
      const __postLog = (level, message) => {
        try {
          postMessage({ type: 'log', level, message: message != null ? String(message) : '', timestamp: Date.now(), id: Math.random().toString(36).slice(2) });
        } catch (_) {}
      };
      const __formatArgs = (args) => args.map((v) => {
        if (typeof v === 'string') return v;
        try { return JSON.stringify(v); } catch { return String(v); }
      }).join(' ');
      (() => {
        const originalLog = console.log.bind(console);
        const originalWarn = console.warn ? console.warn.bind(console) : console.log.bind(console);
        const originalError = console.error ? console.error.bind(console) : console.log.bind(console);
        console.log = (...args) => { originalLog(...args); __postLog('info', __formatArgs(args)); };
        console.warn = (...args) => { originalWarn(...args); __postLog('warn', __formatArgs(args)); };
        console.error = (...args) => { originalError(...args); __postLog('error', __formatArgs(args)); };
      })();

      const Memory = new Map();
      function postTool(name, args) {
        return new Promise((resolve) => {
          const id = Math.random().toString(36).slice(2);
          function onAck(ev) {
            const msg = ev.data;
            if (msg && msg.type === 'tool-ack' && msg.id === id) {
              resolve(msg.result);
              self.removeEventListener('message', onAck);
            }
          }
          self.addEventListener('message', onAck);
          postMessage({ type: 'tool', id, name, args });
        });
      }
      const Game = {
        moveTo: async (v) => { await postTool('moveTo', v); },
        performScan: async () => await postTool('performScan'),
        scanSector: async (filter) => await postTool('scanSector', filter),
        startMining: async (resource) => await postTool('startMining', { resource }),
        stopMining: async () => await postTool('stopMining'),
        getMiningStatus: async () => await postTool('getMiningStatus'),
        getShipStatus: async () => await postTool('getShipStatus'),
        getResources: async () => await postTool('getResources'),
      };
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      const MemoryAPI = { set: (k, v) => Memory.set(k, v), get: (k) => Memory.get(k) };
      self.Game = Game; self.Memory = MemoryAPI; self.sleep = sleep;
      // Helpers
      async function patrol() {
        const A = { x: 500, y: 0, z: 250 }; const B = { x: 200, y: 0, z: -200 };
        while (true) { await Game.moveTo(A); await sleep(3000); await Game.moveTo(B); await sleep(3000); }
      }
      async function mineResource(resource) {
        await Game.performScan();
        const res = await Game.startMining(resource);
        if (!res?.ok) return res;
        while (true) {
          const s = await Game.getMiningStatus();
          if (!s || s.state === 'idle') break;
          await sleep(1000);
        }
        return { ok: true };
      }
      postMessage({ type: 'script-state', state: 'ready', scriptName: ${JSON.stringify(scriptName)} });
      (async () => {
        try {
${userCode.split('\n').map((line) => `          ${line}`).join('\n')}
        } catch (e) {
          console.error('Erro no script:', e);
          postMessage({ type: 'script-state', state: 'error', error: e?.stack || e?.message || String(e) });
          return;
        }
        postMessage({ type: 'script-state', state: 'completed', message: 'Execução encerrada.' });
      })();
    `;
  }

  // ===== Script Library API =====
  listScripts() {
    return Array.from(this.scriptLibrary.entries()).map(([name, e]) => ({ name, description: e.description, lastModified: e.lastModified }));
  }

  getScriptCode(name: string): string | null {
    const e = this.scriptLibrary.get(name);
    return e ? e.code : null;
  }

  createScript(name: string, code: string, description: string = '') {
    if (!name || !code) return { ok: false as const, error: 'Missing name or code' };
    if (this.scriptLibrary.has(name)) return { ok: false as const, error: 'Script already exists' };
    const entry: ScriptEntry = { code, description, lastModified: new Date().toISOString() };
    this.scriptLibrary.set(name, entry);
    this.saveScripts();
    return { ok: true as const };
  }

  updateScript(name: string, newCode: string) {
    const e = this.scriptLibrary.get(name);
    if (!e) return { ok: false as const, error: 'Script not found' };
    e.code = newCode;
    e.lastModified = new Date().toISOString();
    this.scriptLibrary.set(name, e);
    this.saveScripts();
    return { ok: true as const };
  }

  deleteScript(name: string) {
    if (!this.scriptLibrary.has(name)) return { ok: false as const, error: 'Script not found' };
    this.scriptLibrary.delete(name);
    this.saveScripts();
    return { ok: true as const };
  }

  private loadScripts() {
    try {
      const raw = localStorage.getItem('starwatch.v030.scripts');
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, ScriptEntry>;
        this.scriptLibrary = new Map<string, ScriptEntry>(Object.entries(obj));
      }
    } catch (e) {
      console.warn('Failed to load scripts', e);
    }
    if (this.scriptLibrary.size === 0) {
      // Seed with a default patrol script
      const code = `// patrol.js\n// Patrulha simples entre dois pontos usando a API do worker\n(async () => {\n  const A = { x: 500, y: 0, z: 250 };\n  const B = { x: 200, y: 0, z: -200 };\n  while (true) {\n    await Game.moveTo(A);\n    await sleep(3000);\n    await Game.moveTo(B);\n    await sleep(3000);\n  }\n})();`;
      this.scriptLibrary.set('patrol.js', { code, description: 'Patrulha entre dois pontos', lastModified: new Date().toISOString() });
      this.saveScripts();
    }
  }

  private saveScripts() {
    try {
      const obj: Record<string, ScriptEntry> = {};
      for (const [k, v] of this.scriptLibrary.entries()) obj[k] = v;
      localStorage.setItem('starwatch.v030.scripts', JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to save scripts', e);
    }
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

    // Se está seguindo a nave e não estamos no mapa de setor, garante lock ativo
    if (this.followingShip && this.mode === 'play') {
      if ((this.camera as any).lockedTarget !== this.ship.mesh) {
        this.camera.lockedTarget = this.ship.mesh;
      }
    }

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
            this.miningLog.lastEvent = 'depleted';
            this.miningLog.lastTarget = { id: a.id, resource: a.resource };
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
          // foco na nave; manter follow se já ativo
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
    // Qualquer foco manual desliga follow
    this.setFollowShip(false);
    this.camera.setTarget(t);
    const maxR = Math.max(1000, this.world?.bounds ? this.world.bounds * 0.25 : 1000);
    this.camera.radius = Math.max(40, Math.min(radius, maxR));
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

  getWorkerStatus(): WorkerStatus {
    return {
      scriptName: this.workerStatus.scriptName,
      state: this.workerStatus.state,
      startedAt: this.workerStatus.startedAt,
      finishedAt: this.workerStatus.finishedAt,
      logs: this.workerStatus.logs.slice(),
      lastMessage: this.workerStatus.lastMessage,
      lastError: this.workerStatus.lastError,
    };
  }

  getMiningStatus() {
    const targetId = this.mining.targetId;
    if (targetId) {
      const a = this.world.asteroids.find((x) => x.id === targetId);
      const pos = this.ship.mesh.position;
      let distance = 0;
      let remaining = 0;
      let resource: ResourceType | undefined = undefined;
      if (a) {
        distance = Vector3.Distance(new Vector3(a.position.x, a.position.y, a.position.z), pos);
        remaining = a.amount;
        resource = a.resource;
      }
      return {
        state: this.mining.active ? 'mining' : 'approaching',
        targetId,
        resource,
        remaining,
        distance,
        inRange: this.mining.active,
        rate: this.mining.rate,
        lastEvent: this.miningLog.lastEvent,
        lastTarget: this.miningLog.lastTarget ?? null,
      } as const;
    }
    return {
      state: 'idle' as const,
      lastEvent: this.miningLog.lastEvent,
      lastTarget: this.miningLog.lastTarget ?? null,
    };
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
    const size = Math.max(8192, this.world.bounds * 4); // escala com o setor
    const sky = MeshBuilder.CreateBox('sky', { size, sideOrientation: Mesh.BACKSIDE }, this.scene);
    const texSize = 2048;
    const dt = new DynamicTexture('stars', { width: texSize, height: texSize }, this.scene, false);
    const ctx = dt.getContext();
    // Fundo com leve gradiente frio
    const gradient = ctx.createRadialGradient(texSize / 2, texSize / 2, texSize * 0.1, texSize / 2, texSize / 2, texSize * 0.7);
    gradient.addColorStop(0, '#060914');
    gradient.addColorStop(1, '#02030a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, texSize, texSize);
    // Nebulosas suaves para volume distante
    const nebulaCount = 12;
    for (let i = 0; i < nebulaCount; i++) {
      const nx = Math.random() * texSize;
      const ny = Math.random() * texSize;
      const radius = (Math.random() * 0.18 + 0.05) * texSize;
      const hue = 200 + Math.random() * 40;
      const nebula = ctx.createRadialGradient(nx, ny, radius * 0.15, nx, ny, radius);
      nebula.addColorStop(0, `hsla(${hue.toFixed(1)}, 70%, ${60 + Math.random() * 15}%, 0.18)`);
      nebula.addColorStop(0.7, `hsla(${hue.toFixed(1)}, 60%, 20%, 0.06)`);
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Estrelas em múltiplas camadas
    const starLayers: Array<{ count: number; size: [number, number]; alpha: [number, number] }> = [
      { count: 800, size: [2.2, 3.6], alpha: [0.7, 1] },
      { count: 2200, size: [0.8, 1.8], alpha: [0.4, 0.8] },
      { count: 1200, size: [0.3, 0.9], alpha: [0.2, 0.5] },
    ];
    for (const layer of starLayers) {
      for (let i = 0; i < layer.count; i++) {
        const x = Math.random() * texSize;
        const y = Math.random() * texSize;
        const r = layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]);
        const alpha = layer.alpha[0] + Math.random() * (layer.alpha[1] - layer.alpha[0]);
        const hueChance = Math.random();
        let color = `rgba(230,235,255,${alpha.toFixed(3)})`;
        if (hueChance < 0.12) {
          const hue = 200 + Math.random() * 30;
          color = `hsla(${hue}, 70%, ${65 + Math.random() * 20}%, ${alpha.toFixed(3)})`;
        } else if (hueChance > 0.94) {
          const warmth = 30 + Math.random() * 10;
          color = `hsla(${warmth}, 80%, ${70 + Math.random() * 15}%, ${alpha.toFixed(3)})`;
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() < 0.1) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
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
    this.starfield = sky as any;
    this.scene.registerBeforeRender(() => {
      if (this.starfield) {
        this.starfield.rotation.y += 0.00001;
      }
    });
  }

  private createSpaceDust() {
    // subtle particles travelling with the camera to sugerir volume ao redor
    this.dustEmitter = MeshBuilder.CreateSphere('dustEmitter', { diameter: 0.1 }, this.scene);
    this.dustEmitter.parent = this.fpCamera;
    this.dustEmitter.position.set(0, 0, 0);
    this.dustEmitter.isPickable = false;
    this.dustEmitter.isVisible = false;
    this.dustEmitter.doNotSyncBoundingInfo = true;

    const ps = new ParticleSystem('spaceDust', 2400, this.scene);
    const size = 32;
    const dot = new DynamicTexture('dustDot', { width: size, height: size }, this.scene, true);
    const ctx = dot.getContext();
    ctx.clearRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.45, 'rgba(200,220,255,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    dot.update(false);

    ps.particleTexture = dot as unknown as Texture;
    ps.emitter = this.dustEmitter;
    ps.minEmitBox = Vector3.Zero();
    ps.maxEmitBox = Vector3.Zero();
    ps.minSize = 0.08;
    ps.maxSize = 0.35;
    ps.minLifeTime = 32;
    ps.maxLifeTime = 56;
    ps.emitRate = 140;
    ps.minEmitPower = 0.006;
    ps.maxEmitPower = 0.02;
    ps.minAngularSpeed = -0.15;
    ps.maxAngularSpeed = 0.15;
    ps.direction1 = new Vector3(-0.02, -0.004, 0.02);
    ps.direction2 = new Vector3(0.02, 0.004, -0.02);
    ps.color1 = new Color4(1, 1, 1, 0.08);
    ps.color2 = new Color4(0.75, 0.85, 1, 0.05);
    ps.colorDead = new Color4(0.45, 0.6, 1, 0.01);
    ps.blendMode = ParticleSystem.BLENDMODE_ADD;
    ps.gravity = Vector3.Zero();
    ps.updateSpeed = 0.004;
    const minRadius = 220;
    const maxRadius = 460;
    const verticalRange = 140;
    ps.startPositionFunction = (_, position) => {
      const theta = Scalar.RandomRange(0, Math.PI * 2);
      const radiusFactor = 1 - Math.pow(Math.random(), 3.2);
      const radius = minRadius + radiusFactor * (maxRadius - minRadius);
      const verticalBias = Scalar.RandomRange(-0.55, 0.55);
      position.copyFromFloats(
        Math.cos(theta) * radius,
        verticalBias * verticalRange * (0.6 + radiusFactor * 0.4),
        Math.sin(theta) * radius
      );
    };
    ps.startDirectionFunction = (_, direction) => {
      direction.copyFromFloats(
        Scalar.RandomRange(-0.012, 0.012),
        Scalar.RandomRange(-0.006, 0.006),
        Scalar.RandomRange(-0.012, 0.012)
      );
    };

    ps.start();
    this.dustSystem = ps;
    let t = 0;
    this.scene.registerBeforeRender(() => {
      if (!this.dustEmitter) return;
      t += this.scene.getEngine().getDeltaTime() * 0.00004;
      const sway = 18;
      this.dustEmitter.position.x = Math.sin(t) * sway;
      this.dustEmitter.position.y = Math.sin(t * 1.6) * 5;
      this.dustEmitter.position.z = Math.cos(t * 1.1) * sway;
    });
  }

  private createShipInterior() {
    const roomHeight = 4.6;
    const roomWidth = 16;
    const roomDepth = 24;
    const wallThickness = 0.5;

    const floor = MeshBuilder.CreateGround('shipFloor', { width: roomWidth, height: roomDepth }, this.scene);
    floor.position.y = 0;
    floor.checkCollisions = true;
    const floorTex = new DynamicTexture('shipFloorTex', { width: 512, height: 512 }, this.scene, true);
    const fctx = floorTex.getContext();
    fctx.fillStyle = '#0a101a';
    fctx.fillRect(0, 0, 512, 512);
    fctx.strokeStyle = 'rgba(60,100,160,0.3)';
    fctx.lineWidth = 2;
    const gridX = 8;
    const gridY = 12;
    for (let i = 0; i <= gridX; i += 1) {
      const x = (512 / gridX) * i;
      fctx.beginPath();
      fctx.moveTo(x, 0);
      fctx.lineTo(x, 512);
      fctx.stroke();
    }
    for (let i = 0; i <= gridY; i += 1) {
      const y = (512 / gridY) * i;
      fctx.beginPath();
      fctx.moveTo(0, y);
      fctx.lineTo(512, y);
      fctx.stroke();
    }
    floorTex.update(false);
    const floorMat = new StandardMaterial('shipFloorMat', this.scene);
    floorMat.diffuseTexture = floorTex as unknown as Texture;
    floorMat.specularColor = new Color3(0.12, 0.16, 0.22);
    floorMat.emissiveColor = new Color3(0.01, 0.015, 0.02);
    floor.material = floorMat;

    const ceiling = MeshBuilder.CreateGround('shipCeiling', { width: roomWidth, height: roomDepth }, this.scene);
    ceiling.position = new Vector3(0, roomHeight, 0);
    ceiling.rotation.x = Math.PI;
    ceiling.checkCollisions = true;
    const ceilingMat = new StandardMaterial('shipCeilingMat', this.scene);
    ceilingMat.diffuseColor = new Color3(0.07, 0.09, 0.14);
    ceilingMat.specularColor = new Color3(0.12, 0.16, 0.2);
    ceilingMat.emissiveColor = new Color3(0.008, 0.012, 0.02);
    ceiling.material = ceilingMat;

    const wallMat = new StandardMaterial('shipWallMat', this.scene);
    wallMat.diffuseColor = new Color3(0.05, 0.07, 0.1);
    wallMat.specularColor = new Color3(0.12, 0.16, 0.22);
    wallMat.emissiveColor = new Color3(0.008, 0.012, 0.018);

    const makeWall = (name: string, opts: { width: number; height: number; depth: number }, position: Vector3) => {
      const wall = MeshBuilder.CreateBox(name, opts, this.scene);
      wall.position = position;
      wall.material = wallMat;
      wall.checkCollisions = true;
      wall.isPickable = false;
      return wall;
    };
    makeWall('wallNorth', { width: roomWidth, height: roomHeight, depth: wallThickness }, new Vector3(0, roomHeight / 2, -roomDepth / 2));
    makeWall('wallEast', { width: wallThickness, height: roomHeight, depth: roomDepth }, new Vector3(roomWidth / 2, roomHeight / 2, 0));
    makeWall('wallWest', { width: wallThickness, height: roomHeight, depth: roomDepth }, new Vector3(-roomWidth / 2, roomHeight / 2, 0));

    const frameColor = new Color3(0.18, 0.28, 0.42);
    const windowWidth = 8;
    const frameSideWidth = (roomWidth - windowWidth) / 2;
    const sillHeight = 1.0;
    const headerHeight = 0.8;
    const glassInset = roomDepth / 2 - 0.12;
    const frameMat = new StandardMaterial('windowFrameMat', this.scene);
    frameMat.diffuseColor = frameColor.clone();
    frameMat.specularColor = new Color3(0.2, 0.28, 0.4);
    frameMat.emissiveColor = frameColor.scale(0.12);

    const makeFrame = (name: string, size: { width: number; height: number; depth: number }, position: Vector3) => {
      const frame = MeshBuilder.CreateBox(name, size, this.scene);
      frame.position = position;
      frame.material = frameMat;
      frame.checkCollisions = true;
      frame.isPickable = false;
      return frame;
    };

    const southZ = roomDepth / 2;
    makeFrame('windowFrameLeft', { width: frameSideWidth, height: roomHeight, depth: wallThickness }, new Vector3(-(windowWidth / 2 + frameSideWidth / 2), roomHeight / 2, southZ));
    makeFrame('windowFrameRight', { width: frameSideWidth, height: roomHeight, depth: wallThickness }, new Vector3(windowWidth / 2 + frameSideWidth / 2, roomHeight / 2, southZ));
    makeFrame('windowHeader', { width: windowWidth, height: headerHeight, depth: wallThickness }, new Vector3(0, roomHeight - headerHeight / 2, southZ));
    makeFrame('windowSill', { width: windowWidth, height: sillHeight, depth: wallThickness }, new Vector3(0, sillHeight / 2, southZ));

    const glassHeight = roomHeight - headerHeight - sillHeight;
    const glass = MeshBuilder.CreatePlane('windowGlass', { width: windowWidth, height: glassHeight, sideOrientation: Mesh.DOUBLESIDE }, this.scene);
    glass.position = new Vector3(0, sillHeight + glassHeight / 2, glassInset);
    const glassMat = new StandardMaterial('windowGlassMat', this.scene);
    glassMat.diffuseColor = new Color3(0.3, 0.55, 0.9);
    glassMat.alpha = 0.32;
    glassMat.specularColor = new Color3(0.5, 0.7, 0.9);
    glassMat.emissiveColor = new Color3(0.18, 0.32, 0.48);
    glassMat.backFaceCulling = false;
    glass.material = glassMat;
    glass.checkCollisions = true;

    const rimLight = new PointLight('windowRimLight', new Vector3(0, roomHeight - 0.4, southZ - 1.2), this.scene);
    rimLight.diffuse = new Color3(0.35, 0.55, 0.9);
    rimLight.specular = rimLight.diffuse.clone();
    rimLight.intensity = 0.55;
    rimLight.range = 12;

    const mezzanine = MeshBuilder.CreateBox('shipDeck', { width: 12, height: 0.4, depth: 8 }, this.scene);
    mezzanine.position = new Vector3(0, 0.2, -7);
    mezzanine.checkCollisions = true;
    const mezzMat = new StandardMaterial('shipDeckMat', this.scene);
    mezzMat.diffuseColor = new Color3(0.08, 0.11, 0.17);
    mezzMat.specularColor = new Color3(0.14, 0.18, 0.24);
    mezzMat.emissiveColor = new Color3(0.015, 0.02, 0.03);
    mezzanine.material = mezzMat;

    const stripMat = new StandardMaterial('shipStrip', this.scene);
    stripMat.diffuseColor = new Color3(0.2, 0.4, 0.8);
    stripMat.emissiveColor = new Color3(0.08, 0.18, 0.35);
    stripMat.specularColor = new Color3(0.1, 0.16, 0.28);
    const stripL = MeshBuilder.CreateBox('stripL', { width: 0.2, height: 0.2, depth: 10 }, this.scene);
    stripL.position = new Vector3(-7.6, 4.2, -2);
    stripL.material = stripMat;
    stripL.isPickable = false;
    const stripR = MeshBuilder.CreateBox('stripR', { width: 0.2, height: 0.2, depth: 10 }, this.scene);
    stripR.position = new Vector3(7.6, 4.2, -2);
    stripR.material = stripMat;
    stripR.isPickable = false;

    this.addTerminal(
      'engineering',
      new Vector3(-4.6, 1.1, -6.5),
      Math.PI / 8,
      {
        label: 'Terminal de Engenharia',
        hint: 'acessar HAL e varrer asteroides',
        description: 'Computador HAL-9001 integrado aos sensores de mineração.',
        color: new Color3(0.35, 0.65, 1),
      }
    );
    this.addTerminal(
      'construction',
      new Vector3(4.6, 1.1, -6.5),
      -Math.PI / 8,
      {
        label: 'Terminal de Construção',
        hint: 'planejar novos módulos',
        description: 'Interface de drones de construção — módulo em atualização.',
        color: new Color3(0.65, 0.45, 1),
      }
    );

    const glow = new GlowLayer('interiorGlow', this.scene);
    glow.intensity = 0.35;

    this.scene.registerBeforeRender(() => {
      this.updateTerminalLogic();
    });

    this.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        const key = kbInfo.event.key.toLowerCase();
        if (key === 'e' && !this.inputPaused && !this.activeTerminalId && this.nearbyTerminal) {
          this.beginTerminalInteraction(this.nearbyTerminal);
        }
      }
    });
  }

  private addTerminal(id: TerminalId, origin: Vector3, rotationY: number, opts: { label: string; hint: string; description?: string; color: Color3 }) {
    const base = MeshBuilder.CreateBox(`terminalBase:${id}`, { width: 1.4, height: 1.4, depth: 0.6 }, this.scene);
    base.position = origin.clone();
    base.rotation.y = rotationY;
    base.checkCollisions = true;
    const baseMat = new StandardMaterial(`terminalBaseMat:${id}`, this.scene);
    baseMat.diffuseColor = new Color3(0.08, 0.12, 0.18);
    baseMat.specularColor = opts.color.scale(0.2);
    baseMat.emissiveColor = opts.color.scale(0.08);
    base.material = baseMat;

    const screen = MeshBuilder.CreatePlane(`terminalScreen:${id}`, { width: 1.1, height: 1 }, this.scene);
    screen.parent = base;
    screen.position = new Vector3(0, 0.35, -0.33);
    screen.rotation.x = 0.08;
    const tex = new DynamicTexture(`terminalTex:${id}`, { width: 512, height: 512 }, this.scene, true);
    const ctx = tex.getContext();
    ctx.fillStyle = 'rgba(10,18,32,0.92)';
    ctx.fillRect(0, 0, 512, 512);
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, `rgba(${(opts.color.r * 255).toFixed(0)},${(opts.color.g * 255).toFixed(0)},${(opts.color.b * 255).toFixed(0)},0.5)`);
    grad.addColorStop(1, `rgba(${(opts.color.r * 255).toFixed(0)},${(opts.color.g * 255).toFixed(0)},${(opts.color.b * 255).toFixed(0)},0.1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#dce9ff';
    ctx.font = 'bold 38px system-ui';
    ctx.fillText(opts.label, 28, 82);
    ctx.font = '22px system-ui';
    ctx.fillText(`• ${opts.hint}`, 28, 150);
    ctx.fillText('Pressione [E] para interagir', 28, 196);
    tex.update(false);
    const screenMat = new StandardMaterial(`terminalScreenMat:${id}`, this.scene);
    screenMat.disableLighting = true;
    screenMat.diffuseTexture = tex as unknown as Texture;
    screenMat.emissiveTexture = tex as unknown as Texture;
    screenMat.opacityTexture = tex as unknown as Texture;
    screenMat.emissiveColor = opts.color.scale(0.8);
    screen.material = screenMat;

    const light = new PointLight(`terminalLight:${id}`, origin.add(new Vector3(0, 1.6, -0.8)), this.scene);
    light.diffuse = opts.color.clone();
    light.specular = opts.color.clone();
    light.intensity = 0.5;
    light.range = 8.5;

    this.terminals.push({
      id,
      label: opts.label,
      hint: opts.hint,
      description: opts.description,
      mesh: base,
      screen,
      interactDistance: 2.8,
      idleColor: opts.color.scale(0.35),
      activeColor: opts.color.scale(1.25),
      light,
    });
  }

  private toTerminalInfo(term: TerminalInstance): TerminalInfo {
    return { id: term.id, label: term.label, hint: term.hint, description: term.description };
  }

  private updateTerminalLogic() {
    for (const term of this.terminals) {
      const screenMat = term.screen.material as StandardMaterial | null;
      if (screenMat) {
        const distance = Vector3.Distance(term.mesh.getAbsolutePosition(), this.fpCamera.position);
        const factor = Math.max(0.2, Math.min(1, 1 - distance / term.interactDistance));
        const emissive = term.idleColor.scale(0.4).add(term.activeColor.scale(factor * 0.6));
        screenMat.emissiveColor = emissive;
      }
      if (term.light) {
        const distance = Vector3.Distance(term.mesh.getAbsolutePosition(), this.fpCamera.position);
        const factor = Math.max(0.25, Math.min(1, 1 - distance / term.interactDistance));
        term.light.intensity = 0.3 + factor * 0.55;
      }
    }

    if (this.inputPaused || this.activeTerminalId) {
      this.setNearbyTerminal(null);
      return;
    }

    let best: TerminalInstance | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    const camPos = this.fpCamera.position;
    for (const term of this.terminals) {
      const distance = Vector3.Distance(term.mesh.getAbsolutePosition(), camPos);
      if (distance < term.interactDistance && distance < bestDistance) {
        best = term;
        bestDistance = distance;
      }
    }
    this.setNearbyTerminal(best);
  }

  private setNearbyTerminal(term: TerminalInstance | null) {
    if (this.nearbyTerminal === term) return;
    if (term) {
      this.options.onTerminalProximity?.(this.toTerminalInfo(term));
    } else if (this.nearbyTerminal) {
      this.options.onTerminalProximity?.(null);
    }
    this.nearbyTerminal = term;
  }

  private beginTerminalInteraction(term: TerminalInstance) {
    if (this.activeTerminalId) return;
    this.activeTerminalId = term.id;
    this.setNearbyTerminal(null);
    this.setInputPaused(true);
    this.options.onTerminalInteract?.(this.toTerminalInfo(term));
  }

  setInputPaused(paused: boolean) {
    this.inputPaused = paused;
    if (paused) {
      this.fpCamera.detachControl();
      if (document.pointerLockElement === this.canvas) {
        document.exitPointerLock();
      }
    } else {
      this.fpCamera.attachControl(this.canvas, true);
      const fpMouse = (this.fpCamera.inputs.attached as any)?.mouse;
      if (fpMouse) fpMouse.usePointerLock = true;
    }
  }

  closeTerminalInteraction() {
    this.activeTerminalId = null;
    this.setNearbyTerminal(null);
    this.setInputPaused(false);
  }

  private createDistantStars() {
    const count = 28;
    const minDistance = Math.max(5400, this.world.bounds * 3.0);
    const maxDistance = Math.max(9000, this.world.bounds * 4.1);
    const baseColor = new Color3(0.55, 0.82, 1.2);
    const spriteSize = 128;
    const starTexture = new DynamicTexture('distantStarSprite', { width: spriteSize, height: spriteSize }, this.scene, true);
    const starCtx = starTexture.getContext();
    starCtx.clearRect(0, 0, spriteSize, spriteSize);
    const starGrad = starCtx.createRadialGradient(spriteSize / 2, spriteSize / 2, 0, spriteSize / 2, spriteSize / 2, spriteSize / 2);
    starGrad.addColorStop(0, 'rgba(255,255,255,1)');
    starGrad.addColorStop(0.35, 'rgba(160,200,255,0.9)');
    starGrad.addColorStop(0.7, 'rgba(90,140,255,0.35)');
    starGrad.addColorStop(1, 'rgba(0,0,0,0)');
    starCtx.fillStyle = starGrad;
    starCtx.fillRect(0, 0, spriteSize, spriteSize);
    starTexture.update(false);
    for (let i = 0; i < count; i += 1) {
      const size = Scalar.RandomRange(28, 56);
      const star = MeshBuilder.CreatePlane(`distantStar:${i}`, { width: size, height: size }, this.scene);
      star.billboardMode = Mesh.BILLBOARDMODE_ALL;
      const dir = new Vector3(Scalar.RandomRange(-1, 1), Scalar.RandomRange(-0.35, 0.5), Scalar.RandomRange(-1, 1));
      if (dir.lengthSquared() < 0.001) {
        dir.set(0.3, 0.25, -0.2);
      }
      dir.normalize();
      const distance = Scalar.RandomRange(minDistance, maxDistance);
      star.position.copyFrom(dir.scale(distance));
      const mat = new StandardMaterial(`distantStarMat:${i}`, this.scene);
      mat.disableLighting = true;
      mat.backFaceCulling = false;
      mat.diffuseTexture = starTexture as unknown as Texture;
      mat.emissiveTexture = starTexture as unknown as Texture;
      mat.opacityTexture = starTexture as unknown as Texture;
      (mat as any).useAlphaFromDiffuseTexture = true;
      mat.alphaMode = Engine.ALPHA_ADD;
      const intensity = Scalar.RandomRange(2.4, 3.8);
      mat.emissiveColor = baseColor.scale(intensity);
      mat.diffuseColor = Color3.Black();
      star.material = mat;
      star.isPickable = false;
      (star as any).applyFog = false;
      (star as any).infiniteDistance = true;
      const amplitude = Scalar.RandomRange(0.35, 0.6);
      const speed = Scalar.RandomRange(0.45, 1.1);
      const phase = Scalar.RandomRange(0, Math.PI * 2);
      this.distantStars.push({
        material: mat,
        base: intensity,
        amplitude,
        speed,
        phase,
        color: baseColor.scale(Scalar.RandomRange(0.95, 1.25)),
      });
    }

    if (this.distantStars.length > 0) {
      let flickerTime = 0;
      this.scene.registerBeforeRender(() => {
        const delta = this.scene.getEngine().getDeltaTime() * 0.001;
        flickerTime += delta;
        for (const star of this.distantStars) {
          const intensity = star.base + Math.sin(flickerTime * star.speed + star.phase) * star.amplitude;
          star.material.emissiveColor = star.color.scale(Math.max(0.2, intensity));
        }
      });
    }
  }

  private createSun() {
    const size = Math.max(600, this.world.bounds * 0.1);
    const sun = MeshBuilder.CreateSphere('sun', { diameter: size }, this.scene);
    const dist = Math.max(3000, this.world.bounds * 2.0);
    sun.position = new Vector3(dist, size, -dist * 0.85);
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
    this.sun = sun;
  }

  private createSectorLabels() {
    // Cluster labels
    for (const c of this.world.clusters) {
      const text = `${c.id} (${c.type})`;
      const m = this.makeLabelMesh(`lbl:${c.id}`, text, new Color3(0.6, 0.8, 1));
      m.position = new Vector3(c.center.x, (c.center.y || 0) + 120, c.center.z);
      this.labelMeshes.push(m);
    }
    // Sun label (if exists)
    if (this.sun) {
      const m = this.makeLabelMesh('lbl:sun', 'Star', new Color3(1, 0.9, 0.6));
      m.position = this.sun.position.add(new Vector3(0, 800, 0));
      this.labelMeshes.push(m);
    }
  }

  private makeLabelMesh(id: string, text: string, color: Color3) {
    const dt = new DynamicTexture(`dt:${id}`, { width: 256, height: 64 }, this.scene, true);
    const ctx = dt.getContext();
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = 'rgba(13,19,36,0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = 'rgba(36,52,90,0.9)';
    ctx.strokeRect(0.5, 0.5, 255, 63);
    ctx.fillStyle = '#d3e0ff';
    ctx.font = 'bold 22px system-ui';
    ctx.fillText(text, 10, 40);
    dt.update(true);
    const plane = MeshBuilder.CreatePlane(id, { width: 22, height: 5.5 }, this.scene);
    const mat = new StandardMaterial(`mat:${id}`, this.scene);
    mat.disableLighting = true;
    mat.emissiveTexture = dt as unknown as Texture;
    mat.backFaceCulling = false;
    plane.material = mat;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    (plane as any).isPickable = false;
    return plane;
  }

  private tryLoad(): boolean {
    try {
      const raw = localStorage.getItem('starwatch.v020.save');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.world = generateSector(data.world.seed);
      this.configureScaleFromWorld();
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
      localStorage.setItem('starwatch.v020.save', JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  private configureScaleFromWorld() {
    // Define velocidade da nave para atravessar o diâmetro do setor em ~30min
    // speed = (2*bounds) / (30*60)
    this.ship.maxSpeed = (2 * this.world.bounds) / 1800;
    // Ajusta limites de câmera e neblina proporcionalmente
    this.camera.upperRadiusLimit = Math.max(1000, this.world.bounds * 2.5);
    (this.scene as any).fogStart = Math.max(2500, this.world.bounds * 0.6);
    (this.scene as any).fogEnd = Math.max(9000, this.world.bounds * 2.0);
    // Raio de scanner relativo ao tamanho
    this.scanRadius = Math.max(800, Math.min(5000, Math.floor(this.world.bounds * 0.18)));
  }
}

declare global {
  // Worker script globals (type-only exposure for TS consumers)
  interface WorkerGlobalScope {
    Game: {
      moveTo(v: Vec3): Promise<void>;
      performScan(): Promise<string[]>;
      scanSector(filter?: { resource?: ResourceType; limit?: number }): Promise<any[]>;
      startMining(resource: ResourceType): Promise<{ ok: boolean; error?: string }>;
      stopMining(): Promise<{ ok: boolean }>;
      getMiningStatus(): Promise<any>;
      getShipStatus(): Promise<any>;
      getResources(): Promise<{ iron: number; silicon: number; uranium: number }>;
    };
    Memory: { set(k: string, v: unknown): void; get(k: string): unknown };
    sleep(ms: number): Promise<void>;
  }
}
