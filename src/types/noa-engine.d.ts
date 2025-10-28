declare module 'noa-engine' {
  export class Engine {
    constructor(opts?: Record<string, unknown>);
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    setPaused(paused: boolean): void;
    render(dt: number): void;
    tick(dt: number): void;
    pick(
      pos?: [number, number, number] | null,
      dir?: [number, number, number] | null,
      dist?: number | null,
      blockTestFunction?: ((id: number) => boolean) | null,
    ): {
      position: number[];
      normal: number[];
      _localPosition: number[];
    } | null;
    targetedBlock: {
      position: number[];
      normal: number[];
      adjacent: number[];
      blockID: number;
    } | null;
    setBlock(id: number, x: number, y: number, z: number): void;
    registry: {
      registerMaterial(name: string, options: Record<string, unknown>): number;
      registerBlock(id: number, options: Record<string, unknown>): number;
      getBlockID?(name: string): number | undefined;
    };
    globalToLocal(global: [number, number, number], precise: [number, number, number] | null, local: [number, number, number]): [number, number, number];
    world: {
      on(event: string, handler: (...args: any[]) => void): void;
      setChunkData(requestID: number, voxelData: any, voxelIDs?: any, fillID?: number): void;
      setBlock(id: number, x: number, y: number, z: number): void;
      getBlockID(x: number, y: number, z: number): number;
      _chunkSize: number;
      setAddRemoveDistance(addDist: [number, number], removeDist?: [number, number]): void;
    };
    camera: {
      zoomDistance: number;
      getPosition(): [number, number, number];
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
      addMeshToScene(mesh: any, isStatic?: boolean, pos?: [number, number, number], containingChunk?: any): void;
    };
    inputs: {
      bind(action: string, bindings: string | string[]): void;
      down: { on(action: string, handler: (...args: any[]) => void): void };
      up: { on(action: string, handler: (...args: any[]) => void): void };
      pointerState: { scrolly: number };
    };
    playerEntity: number;
    entities: {
      getPositionData(id: number): { width: number; height: number; position: [number, number, number] };
      getMovement(id: number): { maxSpeed: number; moveForce: number };
      addComponent(id: number, name: string, data: Record<string, unknown>): void;
      names: Record<string, string>;
    };
    version: string;
  }
}
