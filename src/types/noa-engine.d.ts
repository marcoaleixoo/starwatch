declare module 'noa-engine' {
  export interface EngineOptions {
    [key: string]: unknown;
  }

  export interface TargetedBlock {
    position: [number, number, number];
    adjacent: [number, number, number];
  }

  export interface World {
    on(event: 'worldDataNeeded', handler: (id: string, data: any, x: number, y: number, z: number) => void): void;
    setChunkData(id: string, data: any): void;
  }

  export interface Inputs {
    down: {
      on(event: string, handler: (event: any) => void): void;
    };
    bind(action: string, bindings: string | string[]): void;
    pointerLock(): void;
    exitPointerLock(): void;
  }

  export interface Entities {
    names: {
      mesh: string;
    };
    getPositionData(id: number): {
      position: [number, number, number];
      width: number;
      height: number;
    };
    addComponent(id: number, name: string, data: any): void;
  }

  export interface Rendering {
    getScene(): any;
    makeStandardMaterial(options?: Record<string, unknown>): any;
  }

  interface Container {
    canvas: HTMLCanvasElement;
  }

  export class Engine {
    constructor(options?: EngineOptions);
    world: World;
    registry: any;
    rendering: Rendering;
    inputs: Inputs;
    entities: Entities;
    playerEntity: number;
    targetedBlock: TargetedBlock | null;
    container: Container;
    camera: any;
    on(event: string, handler: (dt: number) => void): void;
    setBlock(id: number, x: number, y: number, z: number): void;
  }
}
