declare module 'noa-engine' {
  export class Engine {
    constructor(opts?: Record<string, unknown>);
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    setPaused(paused: boolean): void;
    render(dt: number): void;
    tick(dt: number): void;
    getTargetBlock(): unknown;
    setBlock(id: number, x: number, y: number, z: number): void;
    registry: {
      registerMaterial(name: string, options: Record<string, unknown>): number;
      registerBlock(id: number, options: Record<string, unknown>): number;
      getBlockID?(name: string): number | undefined;
    };
    world: {
      on(event: string, handler: (...args: any[]) => void): void;
      setChunkData(requestID: number, voxelData: any, voxelIDs?: any, fillID?: number): void;
      setBlock(id: number, x: number, y: number, z: number): void;
      _chunkSize: number;
      setAddRemoveDistance(addDist: [number, number], removeDist?: [number, number]): void;
    };
    camera: {
      zoomDistance: number;
    };
    container: {
      setPointerLock(lock?: boolean): void;
      on(event: string, handler: (...args: any[]) => void): void;
      canvas: HTMLCanvasElement;
      supportsPointerLock: boolean;
    };
    rendering: {
      getScene(): any;
      light: any;
      camera: any;
    };
    inputs: {
      bind(action: string, bindings: string | string[]): void;
      down: { on(action: string, handler: (...args: any[]) => void): void };
      pointerState: { scrolly: number };
    };
    playerEntity: number;
    entities: {
      getPositionData(id: number): { width: number; height: number };
      getMovement(id: number): { maxSpeed: number; moveForce: number };
      addComponent(id: number, name: string, data: Record<string, unknown>): void;
      names: Record<string, string>;
    };
    version: string;
  }
}
