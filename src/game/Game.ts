import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, Color3, StandardMaterial, Mesh } from 'babylonjs';

type Vec3 = { x: number; y: number; z: number };

type ScriptJob = { name: string; code: string };

export class Game {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private ship = { mesh: null as unknown as Mesh, velocity: new Vector3(0, 0, 0), maxSpeed: 1.8, destination: null as Vector3 | null };
  private logicTimer: number | null = null;
  private worker: Worker | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);

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

    // Asteroids
    this.spawnAsteroids();

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
  }

  private logicTick() {
    // Placeholder for future deterministic updates
  }

  private spawnAsteroids() {
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 1200;
      const z = (Math.random() - 0.5) * 1200;
      const s = 2 + Math.random() * 6;
      const asteroid = MeshBuilder.CreateSphere('ast' + i, { diameter: s }, this.scene);
      const mat = new StandardMaterial('astM' + i, this.scene);
      mat.diffuseColor = new Color3(0.4 + Math.random() * 0.2, 0.4, 0.45);
      asteroid.material = mat;
      asteroid.position = new Vector3(x, 0, z);
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
