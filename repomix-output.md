This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
data/
  schemas/
    sector-snapshot.schema.json
src/
  ai/
    README.md
  blocks/
    metadata-store.ts
    README.md
    register.ts
    types.ts
  config/
    energy-options.ts
    engine-options.ts
    hud-options.ts
    player-options.ts
    README.md
    render-options.ts
    sector-options.ts
    terminal-options.ts
  core/
    bootstrap.ts
  engine/
    components/
      collideEntities.js
      collideTerrain.js
      fadeOnZoom.js
      followsEntity.js
      mesh.js
      movement.js
      physics.js
      position.js
      receivesInputs.js
      shadow.js
      smoothCamera.js
    lib/
      camera.js
      chunk.js
      container.js
      entities.js
      inputs.js
      objectMesher.js
      physics.js
      registry.js
      rendering.js
      sceneOctreeManager.js
      shims.js
      terrainMaterials.js
      terrainMesher.js
      util.js
      world.js
    types/
      aabb-3d/
        index.d.ts
      ent-comp/
        index.d.ts
      events/
        index.d.ts
      gl-vec3/
        index.d.ts
      README.md
    index.js
  hud/
    components/
      crosshair.tsx
      hotbar-hud.tsx
      hotbar-icons.tsx
    overlay/
      index.tsx
      overlay-context.tsx
      overlay-controller.ts
      OverlayApp.tsx
    README.md
    removal-hold-tracker.ts
  persistence/
    adapter.ts
    local-storage-adapter.ts
    manager.ts
    README.md
    snapshot.ts
    types.ts
  player/
    hotbar-controller.ts
    hotbar.ts
    index.ts
  scripts/
    README.md
  sector/
    assets/
      terrain_atlas.png
    generation/
      asteroid-field.ts
      index.ts
      platform.ts
      types.ts
    asteroid-noise.ts
    blocks.ts
    chunk-generator.ts
    index.ts
    materials.ts
    README.md
  systems/
    building/
      placement-system.ts
    energy/
      debug-overlay.ts
      energy-network-manager.ts
      index.ts
    interactions/
      use-system.ts
    terminals/
      battery-terminal-display.ts
      format.ts
      hal-terminal-display.ts
      helpers.ts
      index.ts
      render-helpers.ts
      solar-terminal-display.ts
      terminal-display-manager.ts
      terminal-display.ts
      types.ts
    README.md
  types/
    assets.d.ts
    noa-engine.d.ts
  utils/
    random.ts
    README.md
  main.ts
  README.md
  styles.css
  vite-env.d.ts
.gitignore
.repomixignore
index.html
package.json
tsconfig.json
vite.config.ts
```

# Files

## File: data/schemas/sector-snapshot.schema.json
````json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://starwatch.dev/schemas/sector-snapshot.schema.json",
  "title": "SectorSnapshot",
  "type": "object",
  "required": ["schemaVersion", "player", "sector", "construction", "hotbar"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "player": {
      "type": "object",
      "required": ["id", "lastSeenIso"],
      "properties": {
        "id": { "type": "string" },
        "lastSeenIso": { "type": "string", "format": "date-time" }
      }
    },
    "sector": {
      "type": "object",
      "required": ["id"],
      "properties": {
        "id": { "type": "string" },
        "seed": { "type": "integer" }
      }
    },
    "construction": {
      "type": "object",
      "required": ["decks", "solarPanels", "batteries", "terminals"],
      "properties": {
        "decks": {
          "type": "array",
          "items": { "$ref": "#/definitions/positionEntry" }
        },
        "solarPanels": {
          "type": "array",
          "items": { "$ref": "#/definitions/orientedEntry" }
        },
        "batteries": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["position", "storedMJ", "capacityMJ"],
            "properties": {
              "position": { "$ref": "#/definitions/voxelPosition" },
              "storedMJ": { "type": "number" },
              "capacityMJ": { "type": "number" }
            }
          }
        },
        "terminals": {
          "type": "array",
          "items": { "$ref": "#/definitions/orientedEntry" }
        }
      }
    },
    "hotbar": {
      "type": "object",
      "required": ["activeIndex", "slotItemIds"],
      "properties": {
        "activeIndex": { "type": "integer", "minimum": 0, "maximum": 8 },
        "slotItemIds": {
          "type": "array",
          "items": { "type": ["string", "null"] },
          "minItems": 9,
          "maxItems": 9
        }
      }
    }
  },
  "definitions": {
    "voxelPosition": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 3,
      "maxItems": 3
    },
    "positionEntry": {
      "type": "object",
      "required": ["position"],
      "properties": {
        "position": { "$ref": "#/definitions/voxelPosition" }
      }
    },
    "orientedEntry": {
      "type": "object",
      "required": ["position"],
      "properties": {
        "position": { "$ref": "#/definitions/voxelPosition" },
        "orientation": { "type": "string" }
      }
    }
  }
}
````

## File: src/ai/README.md
````markdown
# AI & Agents

Reserved for HAL-9001 behaviours, drone controllers, finite-state machines and navigation helpers.
Expose pure logic here; wiring into the engine should happen via systems or scripts.
````

## File: src/blocks/types.ts
````typescript
export type BlockKind =
  | 'starwatch:deck'
  | 'starwatch:solar-panel'
  | 'starwatch:battery'
  | 'starwatch:hal-terminal';

export type BlockOrientation = 'north' | 'east' | 'south' | 'west';

export interface BlockDefinition {
  kind: BlockKind;
  id: number;
  orientable: boolean;
  defaultOrientation: BlockOrientation;
}

export interface BlockCatalog {
  deck: BlockDefinition;
  solarPanel: BlockDefinition;
  battery: BlockDefinition;
  halTerminal: BlockDefinition;
  byKind: Map<BlockKind, BlockDefinition>;
  byId: Map<number, BlockDefinition>;
}
````

## File: src/config/energy-options.ts
````typescript
/** Frequência (Hz) do tick global de energia. */
export const ENERGY_TICK_HZ = 1;
export const ENERGY_TICK_INTERVAL_SEC = 1 / ENERGY_TICK_HZ;

/** Potência nominal de um painel sem sombra. */
export const PANEL_BASE_W = 120;

/** Número máximo de raios usados no sombreamento por painel. */
export const PANEL_RAY_COUNT = 8;

/** Distância máxima percorrida pelos raios (em blocos). */
export const PANEL_MAX_RAY_DISTANCE = 64;

/** Passo (em blocos) ao avançar cada raio. */
export const PANEL_RAY_STEP = 0.5;

/**
 * Offsets em relação ao centro do painel para amostrar sombras.
 * A lista pode ser extendida; o sistema usa os primeiros `PANEL_RAY_COUNT` valores.
 */
export const PANEL_SAMPLE_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.25, -0.25],
  [0.25, -0.25],
  [-0.25, 0.25],
  [0.25, 0.25],
  [0, 0],
  [-0.25, 0],
  [0.25, 0],
  [0, 0.25],
];

/** Direção normalizada da luz solar usada no slice (apontando levemente para leste). */
export const SUN_DIRECTION: readonly [number, number, number] = normalize([0.25, 1, 0.15]);

/** Capacidade padrão da bateria pequena (MJ). */
export const BATTERY_SMALL_MJ = 5;

/** Margem para evitar ruído numérico quando acumulando flutuações de energia. */
export const ENERGY_EPSILON = 1e-6;

function normalize(vector: [number, number, number]): [number, number, number] {
  const [x, y, z] = vector;
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}
````

## File: src/config/hud-options.ts
````typescript
export const HOTBAR_SLOT_COUNT = 9;

export interface HotbarItemDefinition {
  id: string;
  label: string;
  description: string;
  icon: 'deck' | 'solar-panel' | 'battery' | 'terminal';
  blockKind: string;
}

export const INITIAL_HOTBAR_ITEMS: HotbarItemDefinition[] = [
  {
    id: 'deck',
    label: 'Deck Condutivo',
    description: 'Chão estruturante e condutor da rede elétrica.',
    icon: 'deck',
    blockKind: 'starwatch:deck',
  },
  {
    id: 'solar-panel',
    label: 'Painel Solar',
    description: 'Gera energia baseada em iluminação solar.',
    icon: 'solar-panel',
    blockKind: 'starwatch:solar-panel',
  },
  {
    id: 'battery',
    label: 'Bateria 5 MJ',
    description: 'Armazena energia excedente da rede.',
    icon: 'battery',
    blockKind: 'starwatch:battery',
  },
  {
    id: 'hal-terminal',
    label: 'Terminal HAL',
    description: 'Console interativo HAL com CRT azul.',
    icon: 'terminal',
    blockKind: 'starwatch:hal-terminal',
  },
];
````

## File: src/config/player-options.ts
````typescript
/**
 * Limites de zoom da câmera FPS. Consumido em `player/index.ts`.
 */
export const CAMERA_ZOOM_LIMITS = {
  min: 0,
  max: 10,
  step: 0.5,
} as const;

/**
 * Ajustes de movimentação básica do jogador (velocidade máxima, força de movimento).
 */
export const PLAYER_MOVEMENT = {
  maxSpeed: 8,
  moveForce: 35,
} as const;
````

## File: src/config/render-options.ts
````typescript
/**
 * Distância alvo de renderização em blocos. Altere este valor para expandir
 * ou reduzir o horizonte visual (chunk distance é recalculada automaticamente).
 */
export const TARGET_VIEW_DISTANCE_BLOCKS = 812;

/**
 * Tamanho base de cada chunk NOA (em blocos). Mantemos 32 como padrão do engine.
 */
export const CHUNK_SIZE = 32;

const horizontalAdd = Math.max(2.5, TARGET_VIEW_DISTANCE_BLOCKS / CHUNK_SIZE);
const verticalAdd = Math.max(2, horizontalAdd * 0.6);

/**
 * Distância de adição de chunks (horizontal, vertical) consumida pelo engine.
 */
export const CHUNK_ADD_DISTANCE: [number, number] = [horizontalAdd, verticalAdd];

/**
 * Distância de remoção (hysterese) para descarregar chunks fora de vista.
 */
export const CHUNK_REMOVE_DISTANCE: [number, number] = [horizontalAdd + 1, verticalAdd + 0.5];
````

## File: src/engine/components/collideEntities.js
````javascript
import boxIntersect from 'box-intersect'



/*
 * 	Every frame, entities with this component will get mutually checked for colliions
 * 
 *   * cylinder: flag for checking collisions as a vertical cylindar (rather than AABB)
 *   * collideBits: category for this entity
 *   * collideMask: categories this entity collides with
 *   * callback: function(other_id) - called when `own.collideBits & other.collideMask` is true
 * 
 * 
 * 		Notes:
 * 	Set collideBits=0 for entities like bullets, which can collide with things 
 * 		but are never the target of a collision.
 * 	Set collideMask=0 for things with no callback - things that get collided with,
 * 		but don't themselves instigate collisions.
 * 
 */



export default function (noa) {

    var intervals = []

    return {

        name: 'collideEntities',

        order: 70,

        state: {
            cylinder: false,
            collideBits: 1 | 0,
            collideMask: 1 | 0,
            callback: null,
        },

        onAdd: null,

        onRemove: null,


        system: function entityCollider(dt, states) {
            var ents = noa.ents

            // data struct that boxIntersect looks for
            // - array of [lo, lo, lo, hi, hi, hi] extents
            for (var i = 0; i < states.length; i++) {
                var id = states[i].__id
                var dat = ents.getPositionData(id)
                intervals[i] = dat._extents
            }
            intervals.length = states.length

            // run the intersect library
            boxIntersect(intervals, function (a, b) {
                var stateA = states[a]
                var stateB = states[b]
                if (!stateA || !stateB) return
                var intervalA = intervals[a]
                var intervalB = intervals[b]
                if (cylindricalHitTest(stateA, stateB, intervalA, intervalB)) {
                    handleCollision(noa, stateA, stateB)
                }
            })

        }
    }



    /*
     * 
     * 		IMPLEMENTATION
     * 
     */


    function handleCollision(noa, stateA, stateB) {
        var idA = stateA.__id
        var idB = stateB.__id

        // entities really do overlap, so check masks and call event handlers
        if (stateA.collideMask & stateB.collideBits) {
            if (stateA.callback) stateA.callback(idB)
        }
        if (stateB.collideMask & stateA.collideBits) {
            if (stateB.callback) stateB.callback(idA)
        }

        // general pairwise handler
        noa.ents.onPairwiseEntityCollision(idA, idB)
    }



    // For entities whose extents overlap, 
    // test if collision still happens when taking cylinder flags into account

    function cylindricalHitTest(stateA, stateB, intervalA, intervalB) {
        if (stateA.cylinder) {
            if (stateB.cylinder) {
                return cylinderCylinderTest(intervalA, intervalB)
            } else {
                return cylinderBoxTest(intervalA, intervalB)
            }
        } else if (stateB.cylinder) {
            return cylinderBoxTest(intervalB, intervalA)
        }
        return true
    }




    // Cylinder-cylinder hit test (AABBs are known to overlap)
    // given their extent arrays [lo, lo, lo, hi, hi, hi]

    function cylinderCylinderTest(a, b) {
        // distance between cylinder centers
        var rada = (a[3] - a[0]) / 2
        var radb = (b[3] - b[0]) / 2
        var dx = a[0] + rada - (b[0] + radb)
        var dz = a[2] + rada - (b[2] + radb)
        // collide if dist <= sum of radii
        var distsq = dx * dx + dz * dz
        var radsum = rada + radb
        return (distsq <= radsum * radsum)
    }




    // Cylinder-Box hit test (AABBs are known to overlap)
    // given their extent arrays [lo, lo, lo, hi, hi, hi]

    function cylinderBoxTest(cyl, cube) {
        // X-z center of cylinder
        var rad = (cyl[3] - cyl[0]) / 2
        var cx = cyl[0] + rad
        var cz = cyl[2] + rad
        // point in X-Z square closest to cylinder
        var px = clamp(cx, cube[0], cube[3])
        var pz = clamp(cz, cube[2], cube[5])
        // collision if distance from that point to circle <= cylinder radius
        var dx = px - cx
        var dz = pz - cz
        var distsq = dx * dx + dz * dz
        return (distsq <= rad * rad)
    }

    function clamp(val, lo, hi) {
        return (val < lo) ? lo : (val > hi) ? hi : val
    }




}
````

## File: src/engine/components/collideTerrain.js
````javascript
export default function (noa) {
    return {

        name: 'collideTerrain',

        order: 0,

        state: {
            callback: null
        },

        onAdd: function (eid, state) {
            // add collide handler for physics engine to call
            var ents = noa.entities
            if (ents.hasPhysics(eid)) {
                var body = ents.getPhysics(eid).body
                body.onCollide = function bodyOnCollide(impulse) {
                    var cb = noa.ents.getCollideTerrain(eid).callback
                    if (cb) cb(impulse, eid)
                }
            }
        },

        onRemove: function (eid, state) {
            var ents = noa.entities
            if (ents.hasPhysics(eid)) {
                ents.getPhysics(eid).body.onCollide = null
            }
        },



    }
}
````

## File: src/engine/components/fadeOnZoom.js
````javascript
/**
 * Component for the player entity, when active hides the player's mesh 
 * when camera zoom is less than a certain amount
 */

export default function (noa) {
    return {

        name: 'fadeOnZoom',

        order: 99,

        state: {
            cutoff: 1.5,
        },

        onAdd: null,

        onRemove: null,

        system: function fadeOnZoomProc(dt, states) {
            var zoom = noa.camera.currentZoom
            for (var i = 0; i < states.length; i++) {
                checkZoom(states[i], zoom, noa)
            }
        }
    }
}


function checkZoom(state, zoom, noa) {
    if (!noa.ents.hasMesh(state.__id)) return
    var mesh = noa.ents.getMeshData(state.__id).mesh
    if (!mesh.metadata) return
    var shouldHide = (zoom < state.cutoff)
    noa.rendering.setMeshVisibility(mesh, !shouldHide)
}
````

## File: src/engine/components/followsEntity.js
````javascript
import vec3 from 'gl-vec3'


/*
 * Indicates that an entity should be moved to another entity's position each tick,
 * possibly by a fixed offset, and the same for renderPositions each render
 */

export default function (noa) {

    return {

        name: 'followsEntity',

        order: 50,

        state: {
            entity: 0 | 0,
            offset: null,
            onTargetMissing: null,
        },

        onAdd: function (eid, state) {
            var off = vec3.create()
            state.offset = (state.offset) ? vec3.copy(off, state.offset) : off
            updatePosition(state)
            updateRenderPosition(state)
        },

        onRemove: null,


        // on tick, copy over regular positions
        system: function followEntity(dt, states) {
            for (var i = 0; i < states.length; i++) {
                updatePosition(states[i])
            }
        },


        // on render, copy over render positions
        renderSystem: function followEntityMesh(dt, states) {
            for (var i = 0; i < states.length; i++) {
                updateRenderPosition(states[i])
            }
        }
    }



    function updatePosition(state) {
        var id = state.__id
        var self = noa.ents.getPositionData(id)
        var other = noa.ents.getPositionData(state.entity)
        if (!other) {
            if (state.onTargetMissing) state.onTargetMissing(id)
            noa.ents.removeComponent(id, noa.ents.names.followsEntity)
        } else {
            vec3.add(self._localPosition, other._localPosition, state.offset)
        }
    }

    function updateRenderPosition(state) {
        var id = state.__id
        var self = noa.ents.getPositionData(id)
        var other = noa.ents.getPositionData(state.entity)
        if (other) {
            vec3.add(self._renderPosition, other._renderPosition, state.offset)
        }
    }

}
````

## File: src/engine/components/mesh.js
````javascript
import vec3 from 'gl-vec3'


export default function (noa) {
    return {

        name: 'mesh',

        order: 100,

        state: {
            mesh: null,
            offset: null
        },


        onAdd: function (eid, state) {
            // implicitly assume there's already a position component
            var posDat = noa.ents.getPositionData(eid)
            if (state.mesh) {
                noa.rendering.addMeshToScene(state.mesh, false, posDat.position)
            } else {
                throw new Error('Mesh component added without a mesh - probably a bug!')
            }
            if (!state.offset) state.offset = vec3.create()

            // set mesh to correct position
            var rpos = posDat._renderPosition
            state.mesh.position.copyFromFloats(
                rpos[0] + state.offset[0],
                rpos[1] + state.offset[1],
                rpos[2] + state.offset[2])
        },


        onRemove: function (eid, state) {
            state.mesh.dispose()
        },



        renderSystem: function (dt, states) {
            // before render move each mesh to its render position, 
            // set by the physics engine or driving logic
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var id = state.__id

                var rpos = noa.ents.getPositionData(id)._renderPosition
                state.mesh.position.copyFromFloats(
                    rpos[0] + state.offset[0],
                    rpos[1] + state.offset[1],
                    rpos[2] + state.offset[2])
            }
        }


    }
}
````

## File: src/engine/components/movement.js
````javascript
import vec3 from 'gl-vec3'





/** 
 * 
 * State object of the `movement` component
 * 
*/
export function MovementState() {
    this.heading = 0 // radians
    this.running = false
    this.jumping = false

    // options
    this.maxSpeed = 10
    this.moveForce = 30
    this.responsiveness = 15
    this.runningFriction = 0
    this.standingFriction = 2

    // jumps
    this.airMoveMult = 0.5
    this.jumpImpulse = 10
    this.jumpForce = 12
    this.jumpTime = 500 // ms
    this.airJumps = 1

    // internal state
    this._jumpCount = 0
    this._currjumptime = 0
    this._isJumping = false
}





/**
 * Movement component. State stores settings like jump height, etc.,
 * as well as current state (running, jumping, heading angle).
 * Processor checks state and applies movement/friction/jump forces
 * to the entity's physics body. 
 * @param {import('..').Engine} noa
*/

export default function (noa) {
    return {

        name: 'movement',

        order: 30,

        state: new MovementState(),

        onAdd: null,

        onRemove: null,


        system: function movementProcessor(dt, states) {
            var ents = noa.entities
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var phys = ents.getPhysics(state.__id)
                if (phys) applyMovementPhysics(dt, state, phys.body)
            }
        }


    }
}


var tempvec = vec3.create()
var tempvec2 = vec3.create()
var zeroVec = vec3.create()


/**
 * @param {number} dt 
 * @param {MovementState} state 
 * @param {*} body 
*/

function applyMovementPhysics(dt, state, body) {
    // move implementation originally written as external module
    //   see https://github.com/fenomas/voxel-fps-controller
    //   for original code

    // jumping
    var onGround = (body.atRestY() < 0)
    var canjump = (onGround || state._jumpCount < state.airJumps)
    if (onGround) {
        state._isJumping = false
        state._jumpCount = 0
    }

    // process jump input
    if (state.jumping) {
        if (state._isJumping) { // continue previous jump
            if (state._currjumptime > 0) {
                var jf = state.jumpForce
                if (state._currjumptime < dt) jf *= state._currjumptime / dt
                body.applyForce([0, jf, 0])
                state._currjumptime -= dt
            }
        } else if (canjump) { // start new jump
            state._isJumping = true
            if (!onGround) state._jumpCount++
            state._currjumptime = state.jumpTime
            body.applyImpulse([0, state.jumpImpulse, 0])
            // clear downward velocity on airjump
            if (!onGround && body.velocity[1] < 0) body.velocity[1] = 0
        }
    } else {
        state._isJumping = false
    }

    // apply movement forces if entity is moving, otherwise just friction
    var m = tempvec
    var push = tempvec2
    if (state.running) {

        var speed = state.maxSpeed
        // todo: add crouch/sprint modifiers if needed
        // if (state.sprint) speed *= state.sprintMoveMult
        // if (state.crouch) speed *= state.crouchMoveMult
        vec3.set(m, 0, 0, speed)

        // rotate move vector to entity's heading
        vec3.rotateY(m, m, zeroVec, state.heading)

        // push vector to achieve desired speed & dir
        // following code to adjust 2D velocity to desired amount is patterned on Quake: 
        // https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L275
        vec3.subtract(push, m, body.velocity)
        push[1] = 0
        var pushLen = vec3.length(push)
        vec3.normalize(push, push)

        if (pushLen > 0) {
            // pushing force vector
            var canPush = state.moveForce
            if (!onGround) canPush *= state.airMoveMult

            // apply final force
            var pushAmt = state.responsiveness * pushLen
            if (canPush > pushAmt) canPush = pushAmt

            vec3.scale(push, push, canPush)
            body.applyForce(push)
        }

        // different friction when not moving
        // idea from Sonic: http://info.sonicretro.org/SPG:Running
        body.friction = state.runningFriction
    } else {
        body.friction = state.standingFriction
    }
}
````

## File: src/engine/components/physics.js
````javascript
/** 
 * @module
 * @internal
 */

import vec3 from 'gl-vec3'


export class PhysicsState {
    constructor() {
        /** @type {import('voxel-physics-engine').RigidBody} */
        this.body = null
    }
}


/**
 * Physics component, stores an entity's physics engbody.
 * @param {import('..').Engine} noa
*/

export default function (noa) {

    return {

        name: 'physics',

        order: 40,

        state: new PhysicsState,

        onAdd: function (entID, state) {
            state.body = noa.physics.addBody()
            // implicitly assume body has a position component, to get size
            var posDat = noa.ents.getPositionData(state.__id)
            setPhysicsFromPosition(state, posDat)
        },


        onRemove: function (entID, state) {
            // update position before removing
            // this lets entity wind up at e.g. the result of a collision
            // even if physics component is removed in collision handler
            if (noa.ents.hasPosition(state.__id)) {
                var pdat = noa.ents.getPositionData(state.__id)
                setPositionFromPhysics(state, pdat)
                backtrackRenderPos(state, pdat, 0, false)
            }
            noa.physics.removeBody(state.body)
        },


        system: function (dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var pdat = noa.ents.getPositionData(state.__id)
                setPositionFromPhysics(state, pdat)
            }
        },


        renderSystem: function (dt, states) {

            var tickPos = noa.positionInCurrentTick
            var tickTime = 1000 / noa.container._shell.tickRate
            tickTime *= noa.timeScale
            var tickMS = tickPos * tickTime

            // tickMS is time since last physics engine tick
            // to avoid temporal aliasing, render the state as if lerping between
            // the last position and the next one 
            // since the entity data is the "next" position this amounts to 
            // offsetting each entity into the past by tickRate - dt
            // http://gafferongames.com/game-physics/fix-your-timestep/

            var backtrackAmt = (tickMS - tickTime) / 1000
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var id = state.__id
                var pdat = noa.ents.getPositionData(id)
                var smoothed = noa.ents.cameraSmoothed(id)
                backtrackRenderPos(state, pdat, backtrackAmt, smoothed)
            }
        }

    }

}



// var offset = vec3.create()
var local = vec3.create()

export function setPhysicsFromPosition(physState, posState) {
    var box = physState.body.aabb
    var ext = posState._extents
    vec3.copy(box.base, ext)
    vec3.set(box.vec, posState.width, posState.height, posState.width)
    vec3.add(box.max, box.base, box.vec)
}


function setPositionFromPhysics(physState, posState) {
    var base = physState.body.aabb.base
    var hw = posState.width / 2
    vec3.set(posState._localPosition, base[0] + hw, base[1], base[2] + hw)
}


function backtrackRenderPos(physState, posState, backtrackAmt, smoothed) {
    // pos = pos + backtrack * body.velocity
    var vel = physState.body.velocity
    vec3.scaleAndAdd(local, posState._localPosition, vel, backtrackAmt)

    // smooth out update if component is present
    // (this is set after sudden movements like auto-stepping)
    if (smoothed) vec3.lerp(local, posState._renderPosition, local, 0.3)

    // copy values over to renderPosition, 
    vec3.copy(posState._renderPosition, local)
}
````

## File: src/engine/components/position.js
````javascript
/** 
 * @module 
 * @internal 
 */

import vec3 from 'gl-vec3'



// definition for this component's state object
export class PositionState {
    constructor() {
        /** Position in global coords (may be low precision) 
         * @type {null | number[]} */
        this.position = null
        this.width = 0.8
        this.height = 0.8

        /** Precise position in local coords
         * @type {null | number[]} */
        this._localPosition = null

        /** [x,y,z] in LOCAL COORDS
         * @type {null | number[]} */
        this._renderPosition = null

        /** [lo,lo,lo, hi,hi,hi] in LOCAL COORDS
         * @type {null | number[]} */
        this._extents = null
    }
}




/**
 * 	Component holding entity's position, width, and height.
 *  By convention, entity's "position" is the bottom center of its AABB
 * 
 *  Of the various properties, _localPosition is the "real", 
 *  single-source-of-truth position. Others are derived.
 *  Local coords are relative to `noa.worldOriginOffset`.
 * @param {import('..').Engine} noa
*/

export default function (noa) {

    return {

        name: 'position',

        order: 60,

        state: new PositionState,

        onAdd: function (eid, state) {
            // copy position into a plain array
            var pos = [0, 0, 0]
            if (state.position) vec3.copy(pos, state.position)
            state.position = pos

            state._localPosition = vec3.create()
            state._renderPosition = vec3.create()
            state._extents = new Float32Array(6)

            // on init only, set local from global
            noa.globalToLocal(state.position, null, state._localPosition)
            vec3.copy(state._renderPosition, state._localPosition)
            updatePositionExtents(state)
        },

        onRemove: null,



        system: function (dt, states) {
            var off = noa.worldOriginOffset
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                vec3.add(state.position, state._localPosition, off)
                updatePositionExtents(state)
            }
        },


    }
}



// update an entity's position state `_extents` 
export function updatePositionExtents(state) {
    var hw = state.width / 2
    var lpos = state._localPosition
    var ext = state._extents
    ext[0] = lpos[0] - hw
    ext[1] = lpos[1]
    ext[2] = lpos[2] - hw
    ext[3] = lpos[0] + hw
    ext[4] = lpos[1] + state.height
    ext[5] = lpos[2] + hw
}
````

## File: src/engine/components/receivesInputs.js
````javascript
/**
 * 
 * Input processing component - gets (key) input state and  
 * applies it to receiving entities by updating their movement 
 * component state (heading, movespeed, jumping, etc.)
 * 
 */

export default function (noa) {
    return {

        name: 'receivesInputs',

        order: 20,

        state: {},

        onAdd: null,

        onRemove: null,

        system: function inputProcessor(dt, states) {
            var ents = noa.entities
            var inputState = noa.inputs.state
            var camHeading = noa.camera.heading

            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var moveState = ents.getMovement(state.__id)
                setMovementState(moveState, inputState, camHeading)
            }
        }

    }
}



/**
 * @param {import('../components/movement').MovementState} state 
 * @param {Object<string, boolean>} inputs 
 * @param {number} camHeading 
*/

function setMovementState(state, inputs, camHeading) {
    state.jumping = !!inputs.jump

    var fb = inputs.forward ? (inputs.backward ? 0 : 1) : (inputs.backward ? -1 : 0)
    var rl = inputs.right ? (inputs.left ? 0 : 1) : (inputs.left ? -1 : 0)

    if ((fb | rl) === 0) {
        state.running = false
    } else {
        state.running = true
        if (fb) {
            if (fb == -1) camHeading += Math.PI
            if (rl) {
                camHeading += Math.PI / 4 * fb * rl // didn't plan this but it works!
            }
        } else {
            camHeading += rl * Math.PI / 2
        }
        state.heading = camHeading
    }

}
````

## File: src/engine/components/shadow.js
````javascript
import vec3 from 'gl-vec3'

import { Color3 } from '@babylonjs/core/Maths/math.color'
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder'
import '@babylonjs/core/Meshes/instancedMesh'


/** @param {import('../index').Engine} noa  */
export default function (noa, distance = 10) {

    var shadowDist = distance

    // create a mesh to re-use for shadows
    var scene = noa.rendering.getScene()
    var disc = CreateDisc('shadow', { radius: 0.75, tessellation: 30 }, scene)
    disc.rotation.x = Math.PI / 2
    var mat = noa.rendering.makeStandardMaterial('shadow_component_mat')
    mat.diffuseColor.set(0, 0, 0)
    mat.ambientColor.set(0, 0, 0)
    mat.alpha = 0.5
    disc.material = mat
    mat.freeze()

    // source mesh needn't be in the scene graph
    noa.rendering.setMeshVisibility(disc, false)


    return {

        name: 'shadow',

        order: 80,

        state: {
            size: 0.5,
            _mesh: null,
        },


        onAdd: function (eid, state) {
            var mesh = disc.createInstance('shadow_instance')
            noa.rendering.addMeshToScene(mesh)
            mesh.setEnabled(false)
            state._mesh = mesh
        },


        onRemove: function (eid, state) {
            state._mesh.dispose()
            state._mesh = null
        },


        system: function shadowSystem(dt, states) {
            var cpos = noa.camera._localGetPosition()
            var dist = shadowDist
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var posState = noa.ents.getPositionData(state.__id)
                var physState = noa.ents.getPhysics(state.__id)
                updateShadowHeight(noa, posState, physState, state._mesh, state.size, dist, cpos)
            }
        },


        renderSystem: function (dt, states) {
            // before render adjust shadow x/z to render positions
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                var rpos = noa.ents.getPositionData(state.__id)._renderPosition
                var spos = state._mesh.position
                spos.x = rpos[0]
                spos.z = rpos[2]
            }
        }




    }
}

var shadowPos = vec3.fromValues(0, 0, 0)
var down = vec3.fromValues(0, -1, 0)

function updateShadowHeight(noa, posDat, physDat, mesh, size, shadowDist, camPos) {

    // local Y ground position - from physics or raycast
    var localY
    if (physDat && physDat.body.resting[1] < 0) {
        localY = posDat._localPosition[1]
    } else {
        var res = noa._localPick(posDat._localPosition, down, shadowDist)
        if (!res) {
            mesh.setEnabled(false)
            return
        }
        localY = res.position[1] - noa.worldOriginOffset[1]
    }

    // round Y pos and offset upwards slightly to avoid z-fighting
    localY = Math.round(localY)
    vec3.copy(shadowPos, posDat._localPosition)
    shadowPos[1] = localY
    var sqdist = vec3.squaredDistance(camPos, shadowPos)
    // offset ~ 0.01 for nearby shadows, up to 0.1 at distance of ~40
    var offset = 0.01 + 0.1 * (sqdist / 1600)
    if (offset > 0.1) offset = 0.1
    mesh.position.y = localY + offset
    // set shadow scale
    var dist = posDat._localPosition[1] - localY
    var scale = size * 0.7 * (1 - dist / shadowDist)
    mesh.scaling.copyFromFloats(scale, scale, scale)
    mesh.setEnabled(true)
}
````

## File: src/engine/components/smoothCamera.js
````javascript
export default function (noa) {

    var compName = 'smoothCamera'

    return {

        name: compName,

        order: 99,

        state: {
            time: 100.1
        },

        onAdd: null,

        onRemove: null,

        system: function (dt, states) {
            // remove self after time elapses
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                state.time -= dt
                if (state.time < 0) noa.ents.removeComponent(state.__id, compName)
            }
        },

    }
}
````

## File: src/engine/lib/camera.js
````javascript
import vec3 from 'gl-vec3'
import aabb from 'aabb-3d'
import sweep from 'voxel-aabb-sweep'



// default options
function CameraDefaults() {
    this.inverseX = false
    this.inverseY = false
    this.sensitivityMult = 1
    this.sensitivityMultOutsidePointerlock = 0
    this.sensitivityX = 10
    this.sensitivityY = 10
    this.initialZoom = 0
    this.zoomSpeed = 0.2
}


// locals
var tempVectors = [
    vec3.create(),
    vec3.create(),
    vec3.create(),
]
var originVector = vec3.create()


/**
 * `noa.camera` - manages the camera, its position and direction, 
 * mouse sensitivity, and so on.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * var defaults = {
 *     inverseX: false,
 *     inverseY: false,
 *     sensitivityX: 10,
 *     sensitivityY: 10,
 *     initialZoom: 0,
 *     zoomSpeed: 0.2,
 * }
 * ```
*/

export class Camera {

    /** 
     * @internal 
     * @param {import('../index').Engine} noa
     * @param {Partial.<CameraDefaults>} opts
    */
    constructor(noa, opts) {
        opts = Object.assign({}, new CameraDefaults, opts)
        this.noa = noa

        /** Horizontal mouse sensitivity. Same scale as Overwatch (typical values around `5..10`) */
        this.sensitivityX = +opts.sensitivityX

        /** Vertical mouse sensitivity. Same scale as Overwatch (typical values around `5..10`) */
        this.sensitivityY = +opts.sensitivityY

        /** Mouse look inverse (horizontal) */
        this.inverseX = !!opts.inverseX

        /** Mouse look inverse (vertical) */
        this.inverseY = !!opts.inverseY

        /** 
         * Multiplier for temporarily altering mouse sensitivity.
         * Set this to `0` to temporarily disable camera controls.
        */
        this.sensitivityMult = opts.sensitivityMult

        /** 
         * Multiplier for altering mouse sensitivity when pointerlock
         * is not active - default of `0` means no camera movement.
         * Note this setting is ignored if pointerLock isn't supported.
         */
        this.sensitivityMultOutsidePointerlock = opts.sensitivityMultOutsidePointerlock

        /** 
         * Camera yaw angle. 
         * Returns the camera's rotation angle around the vertical axis. 
         * Range: `0..2π`  
         * This value is writeable, but it's managed by the engine and 
         * will be overwritten each frame.
        */
        this.heading = 0

        /** Camera pitch angle. 
         * Returns the camera's up/down rotation angle. The pitch angle is 
         * clamped by a small epsilon, such that the camera never quite 
         * points perfectly up or down.  
         * Range: `-π/2..π/2`.  
         * This value is writeable, but it's managed by the engine and 
         * will be overwritten each frame.
        */
        this.pitch = 0

        /** 
         * Entity ID of a special entity that exists for the camera to point at.
         * 
         * By default this entity follows the player entity, so you can 
         * change the player's eye height by changing the `follow` component's offset:
         * ```js
         * var followState = noa.ents.getState(noa.camera.cameraTarget, 'followsEntity')
         * followState.offset[1] = 0.9 * myPlayerHeight
         * ```
         * 
         * For customized camera controls you can change the follow 
         * target to some other entity, or override the behavior entirely:
         * ```js
         * // make cameraTarget stop following the player
         * noa.ents.removeComponent(noa.camera.cameraTarget, 'followsEntity')
         * // control cameraTarget position directly (or whatever..)
         * noa.ents.setPosition(noa.camera.cameraTarget, [x,y,z])
         * ```
        */
        this.cameraTarget = this.noa.ents.createEntity(['position'])

        // make the camera follow the cameraTarget entity
        var eyeOffset = 0.9 * noa.ents.getPositionData(noa.playerEntity).height
        noa.ents.addComponent(this.cameraTarget, 'followsEntity', {
            entity: noa.playerEntity,
            offset: [0, eyeOffset, 0],
        })

        /** How far back the camera should be from the player's eye position */
        this.zoomDistance = opts.initialZoom

        /** How quickly the camera moves to its `zoomDistance` (0..1) */
        this.zoomSpeed = opts.zoomSpeed

        /** Current actual zoom distance. This differs from `zoomDistance` when
         * the camera is in the process of moving towards the desired distance, 
         * or when it's obstructed by solid terrain behind the player.
         * This value will get overwritten each tick, but you may want to write to it
         * when overriding the camera zoom speed.
        */
        this.currentZoom = opts.initialZoom

        /** @internal */
        this._dirVector = vec3.fromValues(0, 0, 1)
    }




    /*
     * 
     * 
     *          API
     * 
     * 
    */


    /*
     *      Local position functions for high precision
    */
    /** @internal */
    _localGetTargetPosition() {
        var pdat = this.noa.ents.getPositionData(this.cameraTarget)
        var pos = tempVectors[0]
        return vec3.copy(pos, pdat._renderPosition)
    }
    /** @internal */
    _localGetPosition() {
        var loc = this._localGetTargetPosition()
        if (this.currentZoom === 0) return loc
        return vec3.scaleAndAdd(loc, loc, this._dirVector, -this.currentZoom)
    }



    /**
     * Returns the camera's current target position - i.e. the player's 
     * eye position. When the camera is zoomed all the way in, 
     * this returns the same location as `camera.getPosition()`.
    */
    getTargetPosition() {
        var loc = this._localGetTargetPosition()
        var globalCamPos = tempVectors[1]
        return this.noa.localToGlobal(loc, globalCamPos)
    }


    /**
     * Returns the current camera position (read only)
    */
    getPosition() {
        var loc = this._localGetPosition()
        var globalCamPos = tempVectors[2]
        return this.noa.localToGlobal(loc, globalCamPos)
    }


    /**
     * Returns the camera direction vector (read only)
    */
    getDirection() {
        return this._dirVector
    }




    /*
     * 
     * 
     * 
     *          internals below
     * 
     * 
     * 
    */



    /**
     * Called before render, if mouseLock etc. is applicable.
     * Applies current mouse x/y inputs to the camera angle and zoom
     * @internal
    */

    applyInputsToCamera() {

        // conditional changes to mouse sensitivity
        var senseMult = this.sensitivityMult
        if (this.noa.container.supportsPointerLock) {
            if (!this.noa.container.hasPointerLock) {
                senseMult *= this.sensitivityMultOutsidePointerlock
            }
        }
        if (senseMult === 0) return

        // dx/dy from input state
        var pointerState = this.noa.inputs.pointerState
        bugFix(pointerState) // TODO: REMOVE EVENTUALLY    

        // convert to rads, using (sens * 0.0066 deg/pixel), like Overwatch
        var conv = 0.0066 * Math.PI / 180
        var dx = pointerState.dx * this.sensitivityX * senseMult * conv
        var dy = pointerState.dy * this.sensitivityY * senseMult * conv
        if (this.inverseX) dx = -dx
        if (this.inverseY) dy = -dy

        // normalize/clamp angles, update direction vector
        var twopi = 2 * Math.PI
        this.heading += (dx < 0) ? dx + twopi : dx
        if (this.heading > twopi) this.heading -= twopi
        var maxPitch = Math.PI / 2 - 0.001
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch + dy))

        vec3.set(this._dirVector, 0, 0, 1)
        var dir = this._dirVector
        var origin = originVector
        vec3.rotateX(dir, dir, origin, this.pitch)
        vec3.rotateY(dir, dir, origin, this.heading)
    }



    /**
     *  Called before all renders, pre- and post- entity render systems
     * @internal
    */
    updateBeforeEntityRenderSystems() {
        // zoom update
        this.currentZoom += (this.zoomDistance - this.currentZoom) * this.zoomSpeed
    }

    /** @internal */
    updateAfterEntityRenderSystems() {
        // clamp camera zoom not to clip into solid terrain
        var maxZoom = cameraObstructionDistance(this)
        if (this.currentZoom > maxZoom) this.currentZoom = maxZoom
    }

}




/*
 *  check for obstructions behind camera by sweeping back an AABB
*/

function cameraObstructionDistance(self) {
    if (!self._sweepBox) {
        self._sweepBox = new aabb([0, 0, 0], [0.2, 0.2, 0.2])
        self._sweepGetVoxel = self.noa.world.getBlockSolidity.bind(self.noa.world)
        self._sweepVec = vec3.create()
        self._sweepHit = () => true
    }
    var pos = vec3.copy(self._sweepVec, self._localGetTargetPosition())
    vec3.add(pos, pos, self.noa.worldOriginOffset)
    for (var i = 0; i < 3; i++) pos[i] -= 0.1
    self._sweepBox.setPosition(pos)
    var dist = Math.max(self.zoomDistance, self.currentZoom) + 0.1
    vec3.scale(self._sweepVec, self.getDirection(), -dist)
    return sweep(self._sweepGetVoxel, self._sweepBox, self._sweepVec, self._sweepHit, true)
}






// workaround for this Chrome 63 + Win10 bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=781182
// later updated to also address: https://github.com/fenomas/noa/issues/153
function bugFix(pointerState) {
    var dx = pointerState.dx
    var dy = pointerState.dy
    var badx = (Math.abs(dx) > 400 && Math.abs(dx / lastx) > 4)
    var bady = (Math.abs(dy) > 400 && Math.abs(dy / lasty) > 4)
    if (badx || bady) {
        pointerState.dx = lastx
        pointerState.dy = lasty
        lastx = (lastx + dx) / 2
        lasty = (lasty + dy) / 2
    } else {
        lastx = dx || 1
        lasty = dy || 1
    }
}

var lastx = 0
var lasty = 0
````

## File: src/engine/lib/chunk.js
````javascript
import { LocationQueue } from './util'
import ndarray from 'ndarray'




/* 
 * 
 *   Chunk
 * 
 *  Stores and manages voxel ids and flags for each voxel within chunk
 * 
 */





/*
 *
 *    Chunk constructor
 *
 */

/** @param {import('../index').Engine} noa */
export function Chunk(noa, requestID, ci, cj, ck, size, dataArray, fillVoxelID = -1) {
    this.noa = noa
    this.isDisposed = false

    // arbitrary data passed in by client when generating world
    this.userData = null

    // voxel data and properties
    this.requestID = requestID     // id sent to game client
    this.voxels = dataArray
    this.i = ci
    this.j = cj
    this.k = ck
    this.size = size
    this.x = ci * size
    this.y = cj * size
    this.z = ck * size
    this.pos = [this.x, this.y, this.z]

    // flags to track if things need re-meshing
    this._terrainDirty = false
    this._objectsDirty = false

    // inits state of terrain / object meshing
    this._terrainMeshes = []
    noa._terrainMesher.initChunk(this)
    noa._objectMesher.initChunk(this)

    this._isFull = false
    this._isEmpty = false

    this._wholeLayerVoxel = Array(size).fill(-1)
    if (fillVoxelID >= 0) {
        this.voxels.data.fill(fillVoxelID, 0, this.voxels.size)
        this._wholeLayerVoxel.fill(fillVoxelID)
    }

    // references to neighboring chunks, if they exist (filled in by `world`)
    var narr = Array.from(Array(27), () => null)
    this._neighbors = ndarray(narr, [3, 3, 3]).lo(1, 1, 1)
    this._neighbors.set(0, 0, 0, this)
    this._neighborCount = 0
    this._timesMeshed = 0

    // location queue of voxels in this chunk with block handlers (assume it's rare)
    /** @internal */
    this._blockHandlerLocs = new LocationQueue()

    // passes through voxel contents, calling block handlers etc.
    scanVoxelData(this)
}


// expose logic internally to create and update the voxel data array
Chunk._createVoxelArray = function (size) {
    var arr = new Uint16Array(size * size * size)
    return ndarray(arr, [size, size, size])
}

Chunk.prototype._updateVoxelArray = function (dataArray, fillVoxelID = -1) {
    // dispose current object blocks
    callAllBlockHandlers(this, 'onUnload')
    this.noa._objectMesher.disposeChunk(this)
    this.noa._terrainMesher.disposeChunk(this)
    this.voxels = dataArray
    this._terrainDirty = false
    this._objectsDirty = false
    this._blockHandlerLocs.empty()
    this.noa._objectMesher.initChunk(this)
    this.noa._terrainMesher.initChunk(this)

    if (fillVoxelID >= 0) {
        this._wholeLayerVoxel.fill(fillVoxelID)
    } else {
        this._wholeLayerVoxel.fill(-1)
    }

    scanVoxelData(this)
}








/*
 *
 *    Chunk API
 *
 */

// get/set deal with block IDs, so that this class acts like an ndarray

Chunk.prototype.get = function (i, j, k) {
    return this.voxels.get(i, j, k)
}

Chunk.prototype.getSolidityAt = function (i, j, k) {
    var solidLookup = this.noa.registry._solidityLookup
    return solidLookup[this.voxels.get(i, j, k)]
}

Chunk.prototype.set = function (i, j, k, newID) {
    var oldID = this.voxels.get(i, j, k)
    if (newID === oldID) return

    // update voxel data
    this.voxels.set(i, j, k, newID)

    // lookup tables from registry, etc
    var solidLookup = this.noa.registry._solidityLookup
    var objectLookup = this.noa.registry._objectLookup
    var opaqueLookup = this.noa.registry._opacityLookup
    var handlerLookup = this.noa.registry._blockHandlerLookup

    // track invariants about chunk data
    if (!opaqueLookup[newID]) this._isFull = false
    if (newID !== 0) this._isEmpty = false
    if (this._wholeLayerVoxel[j] !== newID) this._wholeLayerVoxel[j] = -1

    // voxel lifecycle handling
    var hold = handlerLookup[oldID]
    var hnew = handlerLookup[newID]
    if (hold) callBlockHandler(this, hold, 'onUnset', i, j, k)
    if (hnew) {
        callBlockHandler(this, hnew, 'onSet', i, j, k)
        this._blockHandlerLocs.add(i, j, k)
    } else {
        this._blockHandlerLocs.remove(i, j, k)
    }

    // track object block states
    var objMesher = this.noa._objectMesher
    var objOld = objectLookup[oldID]
    var objNew = objectLookup[newID]
    if (objOld) objMesher.setObjectBlock(this, 0, i, j, k)
    if (objNew) objMesher.setObjectBlock(this, newID, i, j, k)

    // decide dirtiness states
    var solidityChanged = (solidLookup[oldID] !== solidLookup[newID])
    var opacityChanged = (opaqueLookup[oldID] !== opaqueLookup[newID])
    var wasTerrain = !objOld && (oldID !== 0)
    var nowTerrain = !objNew && (newID !== 0)

    if (objOld || objNew) this._objectsDirty = true
    if (solidityChanged || opacityChanged || wasTerrain || nowTerrain) {
        this._terrainDirty = true
    }

    if (this._terrainDirty || this._objectsDirty) {
        this.noa.world._queueChunkForRemesh(this)
    }

    // neighbors only affected if solidity or opacity changed on an edge
    if (solidityChanged || opacityChanged) {
        var edge = this.size - 1
        var imin = (i === 0) ? -1 : 0
        var jmin = (j === 0) ? -1 : 0
        var kmin = (k === 0) ? -1 : 0
        var imax = (i === edge) ? 1 : 0
        var jmax = (j === edge) ? 1 : 0
        var kmax = (k === edge) ? 1 : 0
        for (var ni = imin; ni <= imax; ni++) {
            for (var nj = jmin; nj <= jmax; nj++) {
                for (var nk = kmin; nk <= kmax; nk++) {
                    if ((ni | nj | nk) === 0) continue
                    var nab = this._neighbors.get(ni, nj, nk)
                    if (!nab) continue
                    nab._terrainDirty = true
                    this.noa.world._queueChunkForRemesh(nab)
                }
            }
        }
    }
}



// helper to call handler of a given type at a particular xyz
function callBlockHandler(chunk, handlers, type, i, j, k) {
    var handler = handlers[type]
    if (!handler) return
    handler(chunk.x + i, chunk.y + j, chunk.z + k)
}


// gets called by World when this chunk has been queued for remeshing
Chunk.prototype.updateMeshes = function () {
    if (this._terrainDirty) {
        this.noa._terrainMesher.meshChunk(this)
        this._timesMeshed++
        this._terrainDirty = false
    }
    if (this._objectsDirty) {
        this.noa._objectMesher.buildObjectMeshes()
        this._objectsDirty = false
    }
}












/*
 * 
 *      Init
 * 
 *  Scans voxel data, processing object blocks and setting chunk flags
 * 
*/

function scanVoxelData(chunk) {
    var voxels = chunk.voxels
    var data = voxels.data
    var len = voxels.shape[0]
    var opaqueLookup = chunk.noa.registry._opacityLookup
    var handlerLookup = chunk.noa.registry._blockHandlerLookup
    var objectLookup = chunk.noa.registry._objectLookup
    var plainLookup = chunk.noa.registry._blockIsPlainLookup
    var objMesher = chunk.noa._objectMesher

    // flags for tracking if chunk is entirely opaque or transparent
    var fullyOpaque = true
    var fullyAir = true

    // scan vertically..
    for (var j = 0; j < len; ++j) {

        // fastest case where whole layer is air/dirt/etc
        var layerID = chunk._wholeLayerVoxel[j]
        if (layerID >= 0 && !objMesher[layerID] && !handlerLookup[layerID]) {
            if (!opaqueLookup[layerID]) fullyOpaque = false
            if (layerID !== 0) fullyAir = false
            continue
        }

        var constantID = voxels.get(0, j, 0)

        for (var i = 0; i < len; ++i) {
            var index = voxels.index(i, j, 0)
            for (var k = 0; k < len; ++k, ++index) {
                var id = data[index]

                // detect constant layer ID if there is one
                if (constantID >= 0 && id !== constantID) constantID = -1

                // most common cases: air block...
                if (id === 0) {
                    fullyOpaque = false
                    continue
                }
                // ...or plain boring block (no mesh, handlers, etc)
                if (plainLookup[id]) {
                    fullyAir = false
                    continue
                }
                // otherwise check opacity, object mesh, and handlers
                fullyOpaque = fullyOpaque && opaqueLookup[id]
                fullyAir = false
                if (objectLookup[id]) {
                    objMesher.setObjectBlock(chunk, id, i, j, k)
                    chunk._objectsDirty = true
                }
                var handlers = handlerLookup[id]
                if (handlers) {
                    chunk._blockHandlerLocs.add(i, j, k)
                    callBlockHandler(chunk, handlers, 'onLoad', i, j, k)
                }
            }
        }

        if (constantID >= 0) chunk._wholeLayerVoxel[j] = constantID
    }

    chunk._isFull = fullyOpaque
    chunk._isEmpty = fullyAir
    chunk._terrainDirty = !chunk._isEmpty
}










// dispose function - just clears properties and references

Chunk.prototype.dispose = function () {
    // look through the data for onUnload handlers
    callAllBlockHandlers(this, 'onUnload')
    this._blockHandlerLocs.empty()

    // let meshers dispose their stuff
    this.noa._objectMesher.disposeChunk(this)
    this.noa._terrainMesher.disposeChunk(this)

    // apparently there's no way to dispose typed arrays, so just null everything
    this.voxels.data = null
    this.voxels = null
    this._neighbors.data = null
    this._neighbors = null

    this.isDisposed = true
}



// helper to call a given handler for all blocks in the chunk
function callAllBlockHandlers(chunk, type) {
    var voxels = chunk.voxels
    var handlerLookup = chunk.noa.registry._blockHandlerLookup
    chunk._blockHandlerLocs.arr.forEach(([i, j, k]) => {
        var id = voxels.get(i, j, k)
        callBlockHandler(chunk, handlerLookup[id], type, i, j, k)
    })
}
````

## File: src/engine/lib/container.js
````javascript
import { EventEmitter } from 'events'
import { MicroGameShell } from 'micro-game-shell'





/**
 * `noa.container` - manages the game's HTML container element, canvas, 
 * fullscreen, pointerLock, and so on.
 * 
 * This module wraps `micro-game-shell`, which does most of the implementation.
 * 
 * **Events**
 *  + `DOMready => ()`  
 *    Relays the browser DOMready event, after noa does some initialization
 *  + `gainedPointerLock => ()`  
 *    Fires when the game container gains pointerlock.
 *  + `lostPointerLock => ()`  
 *    Fires when the game container loses pointerlock.
 */

export class Container extends EventEmitter {

    /** @internal */
    constructor(noa, opts) {
        super()
        opts = opts || {}

        /** 
         * @internal
         * @type {import('../index').Engine}
        */
        this.noa = noa

        /** The game's DOM element container */
        var domEl = opts.domElement || null
        if (typeof domEl === 'string') {
            domEl = document.querySelector(domEl)
        }
        this.element = domEl || createContainerDiv()

        /** The `canvas` element that the game will draw into */
        this.canvas = getOrCreateCanvas(this.element)
        doCanvasBugfix(noa, this.canvas) // grumble...


        /** Whether the browser supports pointerLock. @readonly */
        this.supportsPointerLock = false

        /** Whether the user's pointer is within the game area. @readonly */
        this.pointerInGame = false

        /** Whether the game is focused. @readonly */
        this.isFocused = !!document.hasFocus()

        /** Gets the current state of pointerLock. @readonly */
        this.hasPointerLock = false



        // shell manages tick/render rates, and pointerlock/fullscreen
        var pollTime = 10
        /** @internal */
        this._shell = new MicroGameShell(this.element, pollTime)
        this._shell.tickRate = opts.tickRate
        this._shell.maxRenderRate = opts.maxRenderRate
        this._shell.stickyPointerLock = opts.stickyPointerLock
        this._shell.stickyFullscreen = opts.stickyFullscreen
        this._shell.maxTickTime = 50



        // core timing events
        this._shell.onTick = noa.tick.bind(noa)
        this._shell.onRender = noa.render.bind(noa)

        // shell listeners
        this._shell.onPointerLockChanged = (hasPL) => {
            this.hasPointerLock = hasPL
            this.emit((hasPL) ? 'gainedPointerLock' : 'lostPointerLock')
            // this works around a Firefox bug where no mouse-in event 
            // gets issued after starting pointerlock
            if (hasPL) this.pointerInGame = true
        }

        // catch and relay domReady event
        this._shell.onInit = () => {
            this._shell.onResize = noa.rendering.resize.bind(noa.rendering)
            // listeners to track when game has focus / pointer
            detectPointerLock(this)
            this.element.addEventListener('mouseenter', () => { this.pointerInGame = true })
            this.element.addEventListener('mouseleave', () => { this.pointerInGame = false })
            window.addEventListener('focus', () => { this.isFocused = true })
            window.addEventListener('blur', () => { this.isFocused = false })
            // catch edge cases for initial states
            var onFirstMousedown = () => {
                this.pointerInGame = true
                this.isFocused = true
                this.element.removeEventListener('mousedown', onFirstMousedown)
            }
            this.element.addEventListener('mousedown', onFirstMousedown)
            // emit for engine core
            this.emit('DOMready')
            // done and remove listener
            this._shell.onInit = null
        }
    }


    /*
     *
     *
     *              PUBLIC API 
     *
     *
    */

    /** @internal */
    appendTo(htmlElement) {
        this.element.appendChild(htmlElement)
    }

    /** 
     * Sets whether `noa` should try to acquire or release pointerLock
    */
    setPointerLock(lock = false) {
        // not sure if this will work robustly
        this._shell.pointerLock = !!lock
    }
}



/*
 *
 *
 *              INTERNALS
 *
 *
*/


function createContainerDiv() {
    // based on github.com/mikolalysenko/game-shell - makeDefaultContainer()
    var container = document.createElement("div")
    container.tabIndex = 1
    container.style.position = "fixed"
    container.style.left = "0px"
    container.style.right = "0px"
    container.style.top = "0px"
    container.style.bottom = "0px"
    container.style.height = "100%"
    container.style.overflow = "hidden"
    document.body.appendChild(container)
    document.body.style.overflow = "hidden" //Prevent bounce
    document.body.style.height = "100%"
    container.id = 'noa-container'
    return container
}


function getOrCreateCanvas(el) {
    // based on github.com/stackgl/gl-now - default canvas
    var canvas = el.querySelector('canvas')
    if (!canvas) {
        canvas = document.createElement('canvas')
        canvas.style.position = "absolute"
        canvas.style.left = "0px"
        canvas.style.top = "0px"
        canvas.style.height = "100%"
        canvas.style.width = "100%"
        canvas.id = 'noa-canvas'
        el.insertBefore(canvas, el.firstChild)
    }
    return canvas
}


// set up stuff to detect pointer lock support.
// Needlessly complex because Chrome/Android claims to support but doesn't.
// For now, just feature detect, but assume no support if a touch event occurs
// TODO: see if this makes sense on hybrid touch/mouse devices
function detectPointerLock(self) {
    var lockElementExists =
        ('pointerLockElement' in document) ||
        ('mozPointerLockElement' in document) ||
        ('webkitPointerLockElement' in document)
    if (lockElementExists) {
        self.supportsPointerLock = true
        var listener = function (e) {
            self.supportsPointerLock = false
            document.removeEventListener(e.type, listener)
        }
        document.addEventListener('touchmove', listener)
    }
}


/**
 * This works around a weird bug that seems to be chrome/mac only?
 * Without this, the page sometimes initializes with the canva
 * zoomed into its lower left quadrant. 
 * Resizing the canvas fixes the issue (also: resizing page, changing zoom...)
 */
function doCanvasBugfix(noa, canvas) {
    var ct = 0
    var fixCanvas = () => {
        var w = canvas.width
        canvas.width = w + 1
        canvas.width = w
        if (ct++ > 10) noa.off('beforeRender', fixCanvas)
    }
    noa.on('beforeRender', fixCanvas)
}
````

## File: src/engine/lib/entities.js
````javascript
import ECS from 'ent-comp'
import vec3 from 'gl-vec3'
import { updatePositionExtents } from '../components/position'
import { setPhysicsFromPosition } from '../components/physics'


// Component definitions
import collideEntitiesComp from "../components/collideEntities.js"
import collideTerrainComp from "../components/collideTerrain.js"
import fadeOnZoomComp from "../components/fadeOnZoom.js"
import followsEntityComp from "../components/followsEntity.js"
import meshComp from "../components/mesh.js"
import movementComp from "../components/movement.js"
import physicsComp from "../components/physics.js"
import positionComp from "../components/position.js"
import receivesInputsComp from "../components/receivesInputs.js"
import shadowComp from "../components/shadow.js"
import smoothCameraComp from "../components/smoothCamera.js"



var defaultOptions = {
    shadowDistance: 10,
}


/**
 * `noa.entities` - manages entities and components.
 * 
 * This class extends [ent-comp](https://github.com/fenomas/ent-comp), 
 * a general-purpose ECS. It's also decorated with noa-specific helpers and 
 * accessor functions for querying entity positions, etc.
 * 
 * Expects entity definitions in a specific format - see source `components` 
 * folder for examples.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * var defaults = {
 *     shadowDistance: 10,
 * }
 * ```
*/

export class Entities extends ECS {


    /** @internal */
    constructor(noa, opts) {
        super()
        opts = Object.assign({}, defaultOptions, opts)
        // optional arguments to supply to component creation functions
        var componentArgs = {
            'shadow': opts.shadowDistance,
        }

        /** 
         * @internal
         * @type {import('../index').Engine}
        */
        this.noa = noa

        /** Hash containing the component names of built-in components.
         * @type {{ [key:string]: string }} 
        */
        this.names = {}


        // call `createComponent` on all component definitions, and
        // store their names in ents.names
        var compDefs = {
            collideEntities: collideEntitiesComp,
            collideTerrain: collideTerrainComp,
            fadeOnZoom: fadeOnZoomComp,
            followsEntity: followsEntityComp,
            mesh: meshComp,
            movement: movementComp,
            physics: physicsComp,
            position: positionComp,
            receivesInputs: receivesInputsComp,
            shadow: shadowComp,
            smoothCamera: smoothCameraComp,
        }

        Object.keys(compDefs).forEach(bareName => {
            var arg = componentArgs[bareName] || undefined
            var compFn = compDefs[bareName]
            var compDef = compFn(noa, arg)
            this.names[bareName] = this.createComponent(compDef)
        })



        /*
         *
         *
         * 
         *          ENTITY ACCESSORS
         *
         * A whole bunch of getters and such for accessing component state.
         * These are moderately faster than `ents.getState(whatever)`.
         * 
         * 
         * 
        */

        /** @internal */
        this.cameraSmoothed = this.getComponentAccessor(this.names.smoothCamera)


        /**
         * Returns whether the entity has a physics body
         * @type {(id:number) => boolean}
        */
        this.hasPhysics = this.getComponentAccessor(this.names.physics)

        /**
         * Returns whether the entity has a position
         * @type {(id:number) => boolean}
        */
        this.hasPosition = this.getComponentAccessor(this.names.position)

        /**
         * Returns the entity's position component state
         * @type {(id:number) => null | import("../components/position").PositionState} 
        */
        this.getPositionData = this.getStateAccessor(this.names.position)

        /**
         * Returns the entity's position vector.
         * @type {(id:number) => number[]}
        */
        this.getPosition = (id) => {
            var state = this.getPositionData(id)
            return (state) ? state.position : null
        }

        /**
         * Get the entity's `physics` component state.
         * @type {(id:number) => null | import("../components/physics").PhysicsState} 
        */
        this.getPhysics = this.getStateAccessor(this.names.physics)

        /**
         * Returns the entity's physics body
         * Note, will throw if the entity doesn't have the position component!
         * @type {(id:number) => null | import("voxel-physics-engine").RigidBody} 
        */
        this.getPhysicsBody = (id) => {
            var state = this.getPhysics(id)
            return (state) ? state.body : null
        }

        /**
         * Returns whether the entity has a mesh
         * @type {(id:number) => boolean}
        */
        this.hasMesh = this.getComponentAccessor(this.names.mesh)

        /**
         * Returns the entity's `mesh` component state
         * @type {(id:number) => {mesh:any, offset:number[]}}
        */
        this.getMeshData = this.getStateAccessor(this.names.mesh)

        /**
         * Returns the entity's `movement` component state
         * @type {(id:number) => import('../components/movement').MovementState}
        */
        this.getMovement = this.getStateAccessor(this.names.movement)

        /**
         * Returns the entity's `collideTerrain` component state
         * @type {(id:number) => {callback: function}}
        */
        this.getCollideTerrain = this.getStateAccessor(this.names.collideTerrain)

        /**
         * Returns the entity's `collideEntities` component state
         * @type {(id:number) => {
         *      cylinder:boolean, collideBits:number, 
         *      collideMask:number, callback: function}}
        */
        this.getCollideEntities = this.getStateAccessor(this.names.collideEntities)


        /**
         * Pairwise collideEntities event - assign your own function to this 
         * property if you want to handle entity-entity overlap events.
         * @type {(id1:number, id2:number) => void}
         */
        this.onPairwiseEntityCollision = function (id1, id2) { }
    }




    /*
     * 
     * 
     *      PUBLIC ENTITY STATE ACCESSORS
     * 
     * 
    */


    /** Set an entity's position, and update all derived state.
     * 
     * In general, always use this to set an entity's position unless
     * you're familiar with engine internals.
     * 
     * ```js
     * noa.ents.setPosition(playerEntity, [5, 6, 7])
     * noa.ents.setPosition(playerEntity, 5, 6, 7)  // also works
     * ```
     * 
     * @param {number} id
     */
    setPosition(id, pos, y = 0, z = 0) {
        if (typeof pos === 'number') pos = [pos, y, z]
        // convert to local and defer impl
        var loc = this.noa.globalToLocal(pos, null, [])
        this._localSetPosition(id, loc)
    }

    /** Set an entity's size 
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
    */
    setEntitySize(id, xs, ys, zs) {
        var posDat = this.getPositionData(id)
        posDat.width = (xs + zs) / 2
        posDat.height = ys
        this._updateDerivedPositionData(id, posDat)
    }




    /**
     * called when engine rebases its local coords
     * @internal
     */
    _rebaseOrigin(delta) {
        for (var state of this.getStatesList(this.names.position)) {
            var locPos = state._localPosition
            var hw = state.width / 2
            nudgePosition(locPos, 0, -hw, hw, state.__id)
            nudgePosition(locPos, 1, 0, state.height, state.__id)
            nudgePosition(locPos, 2, -hw, hw, state.__id)
            vec3.subtract(locPos, locPos, delta)
            this._updateDerivedPositionData(state.__id, state)
        }
    }

    /** @internal */
    _localGetPosition(id) {
        return this.getPositionData(id)._localPosition
    }

    /** @internal */
    _localSetPosition(id, pos) {
        var posDat = this.getPositionData(id)
        vec3.copy(posDat._localPosition, pos)
        this._updateDerivedPositionData(id, posDat)
    }


    /** 
     * helper to update everything derived from `_localPosition`
     * @internal 
    */
    _updateDerivedPositionData(id, posDat) {
        vec3.copy(posDat._renderPosition, posDat._localPosition)
        var offset = this.noa.worldOriginOffset
        vec3.add(posDat.position, posDat._localPosition, offset)
        updatePositionExtents(posDat)
        var physDat = this.getPhysics(id)
        if (physDat) setPhysicsFromPosition(physDat, posDat)
    }





    /*
     *
     *
     *      OTHER ENTITY MANAGEMENT APIs
     * 
     *      note most APIs are on the original ECS module (ent-comp)
     *      these are some overlaid extras for noa
     *
     *
    */


    /** 
     * Safely add a component - if the entity already had the 
     * component, this will remove and re-add it.
    */
    addComponentAgain(id, name, state) {
        // removes component first if necessary
        if (this.hasComponent(id, name)) this.removeComponent(id, name)
        this.addComponent(id, name, state)
    }


    /** 
     * Checks whether a voxel is obstructed by any entity (with the 
     * `collidesTerrain` component)
    */
    isTerrainBlocked(x, y, z) {
        // checks if terrain location is blocked by entities
        var off = this.noa.worldOriginOffset
        var xlocal = Math.floor(x - off[0])
        var ylocal = Math.floor(y - off[1])
        var zlocal = Math.floor(z - off[2])
        var blockExt = [
            xlocal + 0.001, ylocal + 0.001, zlocal + 0.001,
            xlocal + 0.999, ylocal + 0.999, zlocal + 0.999,
        ]
        var list = this.getStatesList(this.names.collideTerrain)
        for (var i = 0; i < list.length; i++) {
            var id = list[i].__id
            var ext = this.getPositionData(id)._extents
            if (extentsOverlap(blockExt, ext)) return true
        }
        return false
    }



    /** 
     * Gets an array of all entities overlapping the given AABB
    */
    getEntitiesInAABB(box, withComponent) {
        // extents to test against
        var off = this.noa.worldOriginOffset
        var testExtents = [
            box.base[0] - off[0], box.base[1] - off[1], box.base[2] - off[2],
            box.max[0] - off[0], box.max[1] - off[1], box.max[2] - off[2],
        ]
        // entity position state list
        var entStates
        if (withComponent) {
            entStates = []
            for (var compState of this.getStatesList(withComponent)) {
                var pdat = this.getPositionData(compState.__id)
                if (pdat) entStates.push(pdat)
            }
        } else {
            entStates = this.getStatesList(this.names.position)
        }

        // run each test
        var hits = []
        for (var i = 0; i < entStates.length; i++) {
            var state = entStates[i]
            if (extentsOverlap(testExtents, state._extents)) {
                hits.push(state.__id)
            }
        }
        return hits
    }



    /** 
     * Helper to set up a general entity, and populate with some common components depending on arguments.
    */
    add(position = null, width = 1, height = 1,
        mesh = null, meshOffset = null, doPhysics = false, shadow = false) {

        var self = this

        // new entity
        var eid = this.createEntity()

        // position component
        this.addComponent(eid, this.names.position, {
            position: position || vec3.create(),
            width: width,
            height: height,
        })

        // rigid body in physics simulator
        if (doPhysics) {
            // body = this.noa.physics.addBody(box)
            this.addComponent(eid, this.names.physics)
            var body = this.getPhysics(eid).body

            // handler for physics engine to call on auto-step
            var smoothName = this.names.smoothCamera
            body.onStep = function () {
                self.addComponentAgain(eid, smoothName)
            }
        }

        // mesh for the entity
        if (mesh) {
            if (!meshOffset) meshOffset = vec3.create()
            this.addComponent(eid, this.names.mesh, {
                mesh: mesh,
                offset: meshOffset
            })
        }

        // add shadow-drawing component
        if (shadow) {
            this.addComponent(eid, this.names.shadow, { size: width })
        }

        return eid
    }
}


/*
 * 
 * 
 * 
 *          HELPERS
 * 
 * 
 * 
*/

// safety helper - when rebasing, nudge extent away from 
// voxel boudaries, so floating point error doesn't carry us accross
function nudgePosition(pos, index, dmin, dmax, id) {
    var min = pos[index] + dmin
    var max = pos[index] + dmax
    if (Math.abs(min - Math.round(min)) < 0.002) pos[index] += 0.002
    if (Math.abs(max - Math.round(max)) < 0.001) pos[index] -= 0.001
}

// compare extent arrays
function extentsOverlap(extA, extB) {
    if (extA[0] > extB[3]) return false
    if (extA[1] > extB[4]) return false
    if (extA[2] > extB[5]) return false
    if (extA[3] < extB[0]) return false
    if (extA[4] < extB[1]) return false
    if (extA[5] < extB[2]) return false
    return true
}
````

## File: src/engine/lib/inputs.js
````javascript
import { GameInputs } from 'game-inputs'

var defaultOptions = {
    preventDefaults: false,
    stopPropagation: false,
    allowContextMenu: false,
}

var defaultBindings = {
    "forward": ["KeyW", "ArrowUp"],
    "backward": ["KeyS", "ArrowDown"],
    "left": ["KeyA", "ArrowLeft"],
    "right": ["KeyD", "ArrowRight"],
    "fire": "Mouse1",
    "mid-fire": ["Mouse2", "KeyQ"],
    "alt-fire": ["Mouse3", "KeyE"],
    "jump": "Space",
}

/**
 * `noa.inputs` - Handles key and mouse input bindings.
 * 
 * This module extends 
 * [game-inputs](https://github.com/fenomas/game-inputs),
 * so turn on "Inherited" to see its APIs here, or view the base module 
 * for full docs.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 *   defaultBindings: {
 *     "forward":  ["KeyW", "ArrowUp"],
 *     "backward": ["KeyS", "ArrowDown"],
 *     "left":     ["KeyA", "ArrowLeft"],
 *     "right":    ["KeyD", "ArrowRight"],
 *     "fire":     "Mouse1",
 *     "mid-fire": ["Mouse2", "KeyQ"],
 *     "alt-fire": ["Mouse3", "KeyE"],
 *     "jump":     "Space",
 *   }
 * ```
 */

export class Inputs extends GameInputs {

    /** @internal */
    constructor(noa, opts, element) {
        opts = Object.assign({}, defaultOptions, opts)
        super(element, opts)

        var b = opts.bindings || defaultBindings
        for (var name in b) {
            var keys = Array.isArray(b[name]) ? b[name] : [b[name]]
            this.bind(name, ...keys)
        }
    }
}
````

## File: src/engine/lib/objectMesher.js
````javascript
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { makeProfileHook } from './util'
import '@babylonjs/core/Meshes/thinInstanceMesh'


var PROFILE = 0





/*
 *
 *          Object meshing
 * 
 *      Per-chunk handling of the creation/disposal of static meshes
 *      associated with particular voxel IDs
 * 
 * 
*/


/** 
 * @internal
 * @param {import('../index').Engine} noa
*/
export function ObjectMesher(noa) {

    // transform node for all instance meshes to be parented to
    this.rootNode = new TransformNode('objectMeshRoot', noa.rendering.scene)

    // tracking rebase amount inside matrix data
    var rebaseOffset = [0, 0, 0]

    // flag to trigger a rebuild after a chunk is disposed
    var rebuildNextTick = false

    // mock object to pass to customMesh handler, to get transforms
    var transformObj = new TransformNode('')

    // list of known base meshes
    this.allBaseMeshes = []

    // internal storage of instance managers, keyed by ID
    // has check to dedupe by mesh, since babylon chokes on
    // separate sets of instances for the same mesh/clone/geometry
    var managers = {}
    var getManager = (id) => {
        if (managers[id]) return managers[id]
        var mesh = noa.registry._blockMeshLookup[id]
        for (var id2 in managers) {
            var prev = managers[id2].mesh
            if (prev === mesh || (prev.geometry === mesh.geometry)) {
                return managers[id] = managers[id2]
            }
        }
        this.allBaseMeshes.push(mesh)
        if (!mesh.metadata) mesh.metadata = {}
        mesh.metadata[objectMeshFlag] = true
        return managers[id] = new InstanceManager(noa, mesh)
    }
    var objectMeshFlag = 'noa_object_base_mesh'



    /*
     * 
     *      public API
     * 
    */


    // add any properties that will get used for meshing
    this.initChunk = function (chunk) {
        chunk._objectBlocks = {}
    }


    // called by world when an object block is set or cleared
    this.setObjectBlock = function (chunk, blockID, i, j, k) {
        var x = chunk.x + i
        var y = chunk.y + j
        var z = chunk.z + k
        var key = `${x}:${y}:${z}`

        var oldID = chunk._objectBlocks[key] || 0
        if (oldID === blockID) return // should be impossible
        if (oldID > 0) {
            var oldMgr = getManager(oldID)
            oldMgr.removeInstance(chunk, key)
        }

        if (blockID > 0) {
            // if there's a block event handler, call it with
            // a mock object so client can add transforms
            var handlers = noa.registry._blockHandlerLookup[blockID]
            var onCreate = handlers && handlers.onCustomMeshCreate
            if (onCreate) {
                transformObj.position.copyFromFloats(0.5, 0, 0.5)
                transformObj.scaling.setAll(1)
                transformObj.rotation.setAll(0)
                onCreate(transformObj, x, y, z)
            }
            var mgr = getManager(blockID)
            var xform = (onCreate) ? transformObj : null
            mgr.addInstance(chunk, key, i, j, k, xform, rebaseOffset)
        }

        if (oldID > 0 && !blockID) delete chunk._objectBlocks[key]
        if (blockID > 0) chunk._objectBlocks[key] = blockID
    }



    // called by world when it knows that objects have been updated
    this.buildObjectMeshes = function () {
        profile_hook('start')

        for (var id in managers) {
            var mgr = managers[id]
            mgr.updateMatrix()
            if (mgr.count === 0) mgr.dispose()
            if (mgr.disposed) delete managers[id]
        }

        profile_hook('rebuilt')
        profile_hook('end')
    }



    // called by world at end of chunk lifecycle
    this.disposeChunk = function (chunk) {
        for (var key in chunk._objectBlocks) {
            var id = chunk._objectBlocks[key]
            if (id > 0) {
                var mgr = getManager(id)
                mgr.removeInstance(chunk, key)
            }
        }
        chunk._objectBlocks = null

        // since some instance managers will have been updated
        rebuildNextTick = true
    }



    // tick handler catches case where objects are dirty due to disposal
    this.tick = function () {
        if (rebuildNextTick) {
            this.buildObjectMeshes()
            rebuildNextTick = false
        }
    }



    // world rebase handler
    this._rebaseOrigin = function (delta) {
        rebaseOffset[0] += delta[0]
        rebaseOffset[1] += delta[1]
        rebaseOffset[2] += delta[2]

        for (var id1 in managers) managers[id1].rebased = false
        for (var id2 in managers) {
            var mgr = managers[id2]
            if (mgr.rebased) continue
            for (var i = 0; i < mgr.count; i++) {
                var ix = i << 4
                mgr.buffer[ix + 12] -= delta[0]
                mgr.buffer[ix + 13] -= delta[1]
                mgr.buffer[ix + 14] -= delta[2]
            }
            mgr.rebased = true
            mgr.dirty = true
        }
        rebuildNextTick = true
    }

}















/*
 * 
 * 
 *      manager class for thin instances of a given object block ID 
 * 
 * 
*/

/** @param {import('../index').Engine} noa*/
function InstanceManager(noa, mesh) {
    this.noa = noa
    this.mesh = mesh
    this.buffer = null
    this.capacity = 0
    this.count = 0
    this.dirty = false
    this.rebased = true
    this.disposed = false
    // dual struct to map keys (locations) to buffer locations, and back
    this.keyToIndex = {}
    this.locToKey = []
    // prepare mesh for rendering
    this.mesh.position.setAll(0)
    this.mesh.parent = noa._objectMesher.rootNode
    this.noa.rendering.addMeshToScene(this.mesh, false)
    this.noa.emit('addingTerrainMesh', this.mesh)
    this.mesh.isPickable = false
    this.mesh.doNotSyncBoundingInfo = true
    this.mesh.alwaysSelectAsActiveMesh = true
}



InstanceManager.prototype.dispose = function () {
    if (this.disposed) return
    this.mesh.thinInstanceCount = 0
    this.setCapacity(0)
    this.noa.emit('removingTerrainMesh', this.mesh)
    this.noa.rendering.setMeshVisibility(this.mesh, false)
    this.mesh = null
    this.keyToIndex = null
    this.locToKey = null
    this.disposed = true
}


InstanceManager.prototype.addInstance = function (chunk, key, i, j, k, transform, rebaseVec) {
    maybeExpandBuffer(this)
    var ix = this.count << 4
    this.locToKey[this.count] = key
    this.keyToIndex[key] = ix
    if (transform) {
        transform.position.x += (chunk.x - rebaseVec[0]) + i
        transform.position.y += (chunk.y - rebaseVec[1]) + j
        transform.position.z += (chunk.z - rebaseVec[2]) + k
        transform.computeWorldMatrix(true)
        var xformArr = transform._localMatrix._m
        copyMatrixData(xformArr, 0, this.buffer, ix)
    } else {
        var matArray = tempMatrixArray
        matArray[12] = (chunk.x - rebaseVec[0]) + i + 0.5
        matArray[13] = (chunk.y - rebaseVec[1]) + j
        matArray[14] = (chunk.z - rebaseVec[2]) + k + 0.5
        copyMatrixData(matArray, 0, this.buffer, ix)
    }
    this.count++
    this.dirty = true
}


InstanceManager.prototype.removeInstance = function (chunk, key) {
    var remIndex = this.keyToIndex[key]
    if (!(remIndex >= 0)) throw 'tried to remove object instance not in storage'
    delete this.keyToIndex[key]
    var remLoc = remIndex >> 4
    // copy tail instance's data to location of one we're removing
    var tailLoc = this.count - 1
    if (remLoc !== tailLoc) {
        var tailIndex = tailLoc << 4
        copyMatrixData(this.buffer, tailIndex, this.buffer, remIndex)
        // update key/location structs
        var tailKey = this.locToKey[tailLoc]
        this.keyToIndex[tailKey] = remIndex
        this.locToKey[remLoc] = tailKey
    }
    this.count--
    this.dirty = true
    maybeContractBuffer(this)
}


InstanceManager.prototype.updateMatrix = function () {
    if (!this.dirty) return
    this.mesh.thinInstanceCount = this.count
    this.mesh.thinInstanceBufferUpdated('matrix')
    this.mesh.isVisible = (this.count > 0)
    this.dirty = false
}



InstanceManager.prototype.setCapacity = function (size = 4) {
    this.capacity = size
    if (size === 0) {
        this.buffer = null
    } else {
        var newBuff = new Float32Array(this.capacity * 16)
        if (this.buffer) {
            var len = Math.min(this.buffer.length, newBuff.length)
            for (var i = 0; i < len; i++) newBuff[i] = this.buffer[i]
        }
        this.buffer = newBuff
    }
    this.mesh.thinInstanceSetBuffer('matrix', this.buffer)
    this.updateMatrix()
}


function maybeExpandBuffer(mgr) {
    if (mgr.count < mgr.capacity) return
    var size = Math.max(8, mgr.capacity * 2)
    mgr.setCapacity(size)
}

function maybeContractBuffer(mgr) {
    if (mgr.count > mgr.capacity * 0.4) return
    if (mgr.capacity < 100) return
    mgr.setCapacity(Math.round(mgr.capacity / 2))
    mgr.locToKey.length = Math.min(mgr.locToKey.length, mgr.capacity)
}



// helpers

var tempMatrixArray = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]

function copyMatrixData(src, srcOff, dest, destOff) {
    for (var i = 0; i < 16; i++) dest[destOff + i] = src[srcOff + i]
}












var profile_hook = (PROFILE) ?
    makeProfileHook(PROFILE, 'Object meshing') : () => { }
````

## File: src/engine/lib/physics.js
````javascript
import { Physics as VoxelPhysics } from 'voxel-physics-engine'




var defaultOptions = {
    gravity: [0, -10, 0],
    airDrag: 0.1,
}

/**
 * `noa.physics` - Wrapper module for the physics engine.
 * 
 * This module extends 
 * [voxel-physics-engine](https://github.com/fenomas/voxel-physics-engine),
 * so turn on "Inherited" to see its APIs here, or view the base module 
 * for full docs.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * {
 *     gravity: [0, -10, 0],
 *     airDrag: 0.1,
 *     fluidDrag: 0.4,
 *     fluidDensity: 2.0,
 *     minBounceImpulse: .5,      // cutoff for a bounce to occur
 * }
 * ```
*/

export class Physics extends VoxelPhysics {

    /** 
     * @internal 
     * @param {import('../index').Engine} noa
    */
    constructor(noa, opts) {
        opts = Object.assign({}, defaultOptions, opts)
        var world = noa.world
        var solidLookup = noa.registry._solidityLookup
        var fluidLookup = noa.registry._fluidityLookup

        // physics engine runs in offset coords, so voxel getters need to match
        var offset = noa.worldOriginOffset

        var blockGetter = (x, y, z) => {
            var id = world.getBlockID(x + offset[0], y + offset[1], z + offset[2])
            return solidLookup[id]
        }
        var isFluidGetter = (x, y, z) => {
            var id = world.getBlockID(x + offset[0], y + offset[1], z + offset[2])
            return fluidLookup[id]
        }

        super(opts, blockGetter, isFluidGetter)
    }

}
````

## File: src/engine/lib/registry.js
````javascript
var defaults = {
    texturePath: ''
}

// voxel ID now uses the whole Uint16Array element
var MAX_BLOCK_ID = (1 << 16) - 1





/**
 * `noa.registry` - Where you register your voxel types, 
 * materials, properties, and events.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * var defaults = {
 *     texturePath: ''
 * }
 * ```
*/

export class Registry {


    /** 
     * @internal 
     * @param {import('../index').Engine} noa
    */
    constructor(noa, opts) {
        opts = Object.assign({}, defaults, opts)
        /** @internal */
        this.noa = noa

        /** @internal */
        this._texturePath = opts.texturePath

        /** Maps block face material names to matIDs
         * @type {Object.<string, number>} */
        var matIDs = {}

        // lookup arrays for block props and flags - all keyed by blockID
        // fill in first value for the air block with id=0
        var blockSolidity = [false]
        var blockOpacity = [false]
        var blockIsFluid = [false]
        var blockIsObject = [false]
        var blockProps = [null]     // less-often accessed properties
        var blockMeshes = [null]    // custom mesh objects
        var blockHandlers = [null]  // block event handlers
        var blockIsPlain = [false]  // true if voxel is "boring" - solid/opaque, no special props

        // this one is keyed by `blockID*6 + faceNumber`
        var blockMats = [0, 0, 0, 0, 0, 0]

        // and these are keyed by material id
        var matColorLookup = [null]
        var matAtlasIndexLookup = [-1]

        /** 
         * Lookup array of block face material properties - keyed by matID (not blockID)
         * @typedef MatDef
         * @prop {number[]} color
         * @prop {number} alpha
         * @prop {string} texture
         * @prop {boolean} texHasAlpha
         * @prop {number} atlasIndex
         * @prop {*} renderMat
         */
        /** @type {MatDef[]} */
        var matDefs = []


        /* 
         * 
         *      Block registration methods
         * 
        */



        /**
         * Register (by integer ID) a block type and its parameters.
         *  `id` param: integer, currently 1..65535. Generally you should 
         * specify sequential values for blocks, without gaps, but this 
         * isn't technically necessary.
         * 
         * @param {number} id - sequential integer ID (from 1)
         * @param {Partial<BlockOptions>} [options] 
         * @returns the `id` value specified
         */
        this.registerBlock = function (id = 1, options = null) {
            var defaults = new BlockOptions(options && options.fluid)
            var opts = Object.assign({}, defaults, options || {})

            // console.log('register block: ', id, opts)
            if (id < 1 || id > MAX_BLOCK_ID) throw 'Block id out of range: ' + id

            // if block ID is greater than current highest ID, 
            // register fake blocks to avoid holes in lookup arrays
            while (id > blockSolidity.length) {
                this.registerBlock(blockSolidity.length, {})
            }

            // flags default to solid, opaque, nonfluid
            blockSolidity[id] = !!opts.solid
            blockOpacity[id] = !!opts.opaque
            blockIsFluid[id] = !!opts.fluid

            // store any custom mesh
            blockIsObject[id] = !!opts.blockMesh
            blockMeshes[id] = opts.blockMesh || null

            // parse out material parameter
            // always store 6 material IDs per blockID, so material lookup is monomorphic
            var mat = opts.material || null
            var mats
            if (!mat) {
                mats = [null, null, null, null, null, null]
            } else if (typeof mat == 'string') {
                mats = [mat, mat, mat, mat, mat, mat]
            } else if (mat.length && mat.length == 2) {
                // interpret as [top/bottom, sides]
                mats = [mat[1], mat[1], mat[0], mat[0], mat[1], mat[1]]
            } else if (mat.length && mat.length == 3) {
                // interpret as [top, bottom, sides]
                mats = [mat[2], mat[2], mat[0], mat[1], mat[2], mat[2]]
            } else if (mat.length && mat.length == 6) {
                // interpret as [-x, +x, -y, +y, -z, +z]
                mats = mat
            } else throw 'Invalid material parameter: ' + mat

            // argument is material name, but store as material id, allocating one if needed
            for (var i = 0; i < 6; ++i) {
                blockMats[id * 6 + i] = getMaterialId(this, matIDs, mats[i], true)
            }

            // props data object - currently only used for fluid properties
            blockProps[id] = {}

            // if block is fluid, initialize properties if needed
            if (blockIsFluid[id]) {
                blockProps[id].fluidDensity = opts.fluidDensity
                blockProps[id].viscosity = opts.viscosity
            }

            // event callbacks
            var hasHandler = opts.onLoad || opts.onUnload || opts.onSet || opts.onUnset || opts.onCustomMeshCreate
            blockHandlers[id] = (hasHandler) ? new BlockCallbackHolder(opts) : null

            // special lookup for "plain"-ness
            // plain means solid, opaque, not fluid, no mesh or events
            var isPlain = blockSolidity[id] && blockOpacity[id]
                && !hasHandler && !blockIsFluid[id] && !blockIsObject[id]
            blockIsPlain[id] = isPlain

            return id
        }




        /**
         * Register (by name) a material and its parameters.
         * 
         * @param {string} name of this material
         * @param {Partial<MaterialOptions>} [options]
         */

        this.registerMaterial = function (name = '?', options = null) {
            // catch calls to earlier signature
            if (Array.isArray(options)) {
                throw 'This API changed signatures in v0.33, please use: `noa.registry.registerMaterial("name", optionsObj)`'
            }

            var opts = Object.assign(new MaterialOptions(), options || {})
            var matID = matIDs[name] || matDefs.length
            matIDs[name] = matID

            var texURL = opts.textureURL ? this._texturePath + opts.textureURL : ''
            var alpha = 1.0
            var color = opts.color || [1.0, 1.0, 1.0]
            if (color.length === 4) alpha = color.pop()
            if (texURL) color = null

            // populate lookup arrays for terrain meshing
            matColorLookup[matID] = color
            matAtlasIndexLookup[matID] = opts.atlasIndex

            matDefs[matID] = {
                color,
                alpha,
                texture: texURL,
                texHasAlpha: !!opts.texHasAlpha,
                atlasIndex: opts.atlasIndex,
                renderMat: opts.renderMaterial,
            }
            return matID
        }



        /*
         *      quick accessors for querying block ID stuff
         */

        /** 
         * block solidity (as in physics) 
         * @param id
         */
        this.getBlockSolidity = function (id) {
            return blockSolidity[id]
        }

        /**
         * block opacity - whether it obscures the whole voxel (dirt) or 
         * can be partially seen through (like a fencepost, etc)
         * @param id
         */
        this.getBlockOpacity = function (id) {
            return blockOpacity[id]
        }

        /** 
         * block is fluid or not
         * @param id
         */
        this.getBlockFluidity = function (id) {
            return blockIsFluid[id]
        }

        /** 
         * Get block property object passed in at registration
         * @param id
         */
        this.getBlockProps = function (id) {
            return blockProps[id]
        }

        // look up a block ID's face material
        // dir is a value 0..5: [ +x, -x, +y, -y, +z, -z ]
        this.getBlockFaceMaterial = function (blockId, dir) {
            return blockMats[blockId * 6 + dir]
        }


        /**
         * General lookup for all properties of a block material
         * @param {number} matID 
         * @returns {MatDef}
         */
        this.getMaterialData = function (matID) {
            return matDefs[matID]
        }


        /**
         * Given a texture URL, does any material using that 
         * texture need alpha?
         * @internal
         * @returns {boolean}
         */
        this._textureNeedsAlpha = function (tex = '') {
            return matDefs.some(def => {
                if (def.texture !== tex) return false
                return def.texHasAlpha
            })
        }





        /*
         * 
         *   Meant for internal use within the engine
         * 
         */


        // internal access to lookup arrays
        /** @internal */
        this._solidityLookup = blockSolidity
        /** @internal */
        this._opacityLookup = blockOpacity
        /** @internal */
        this._fluidityLookup = blockIsFluid
        /** @internal */
        this._objectLookup = blockIsObject
        /** @internal */
        this._blockMeshLookup = blockMeshes
        /** @internal */
        this._blockHandlerLookup = blockHandlers
        /** @internal */
        this._blockIsPlainLookup = blockIsPlain
        /** @internal */
        this._materialColorLookup = matColorLookup
        /** @internal */
        this._matAtlasIndexLookup = matAtlasIndexLookup



        /*
         * 
         *      default initialization
         * 
         */

        // add a default material and set ID=1 to it
        // this is safe since registering new block data overwrites the old
        this.registerMaterial('dirt', { color: [0.4, 0.3, 0] })
        this.registerBlock(1, { material: 'dirt' })

    }

}

/*
 * 
 *          helpers
 * 
*/



// look up material ID given its name
// if lazy is set, pre-register the name and return an ID
function getMaterialId(reg, matIDs, name, lazyInit) {
    if (!name) return 0
    var id = matIDs[name]
    if (id === undefined && lazyInit) id = reg.registerMaterial(name)
    return id
}



// data class for holding block callback references
function BlockCallbackHolder(opts) {
    this.onLoad = opts.onLoad || null
    this.onUnload = opts.onUnload || null
    this.onSet = opts.onSet || null
    this.onUnset = opts.onUnset || null
    this.onCustomMeshCreate = opts.onCustomMeshCreate || null
}




/**
 * Default options when registering a block type
 */
function BlockOptions(isFluid = false) {
    /** Solidity for physics purposes */
    this.solid = (isFluid) ? false : true
    /** Whether the block fully obscures neighboring blocks */
    this.opaque = (isFluid) ? false : true
    /** whether a nonsolid block is a fluid (buoyant, viscous..) */
    this.fluid = false
    /** The block material(s) for this voxel's faces. May be:
     *   * one (String) material name
     *   * array of 2 names: [top/bottom, sides]
     *   * array of 3 names: [top, bottom, sides]
     *   * array of 6 names: [-x, +x, -y, +y, -z, +z]
     * @type {string|string[]}
    */
    this.material = null
    /** Specifies a custom mesh for this voxel, instead of terrain  */
    this.blockMesh = null
    /** Fluid parameter for fluid blocks */
    this.fluidDensity = 1.0
    /** Fluid parameter for fluid blocks */
    this.viscosity = 0.5
    /** @type {(x:number, y:number, z:number) => void} */
    this.onLoad = null
    /** @type {(x:number, y:number, z:number) => void} */
    this.onUnload = null
    /** @type {(x:number, y:number, z:number) => void} */
    this.onSet = null
    /** @type {(x:number, y:number, z:number) => void} */
    this.onUnset = null
    /** @type {(mesh:TransformNode, x:number, y:number, z:number) => void} */
    this.onCustomMeshCreate = null
}

/** @typedef {import('@babylonjs/core/Meshes').TransformNode} TransformNode */


/**
 * Default options when registering a Block Material
 */
function MaterialOptions() {
    /** An array of 0..1 floats, either [R,G,B] or [R,G,B,A]
     * @type {number[]}
     */
    this.color = null
    /** Filename of texture image, if any
     * @type {string}
     */
    this.textureURL = null
    /** Whether the texture image has alpha */
    this.texHasAlpha = false
    /** Index into a (vertical strip) texture atlas, if applicable */
    this.atlasIndex = -1
    /**
     * An optional Babylon.js `Material`. If specified, terrain for this voxel
     * will be rendered with the supplied material (this can impact performance).
     */
    this.renderMaterial = null
}
````

## File: src/engine/lib/rendering.js
````javascript
import glvec3 from 'gl-vec3'
import { makeProfileHook } from './util'

import { SceneOctreeManager } from './sceneOctreeManager'

import { Scene, ScenePerformancePriority } from '@babylonjs/core/scene'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Engine } from '@babylonjs/core/Engines/engine'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { CreateLines } from '@babylonjs/core/Meshes/Builders/linesBuilder'
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder'




// profiling flag
var PROFILE = 0



var defaults = {
    showFPS: false,
    antiAlias: true,
    clearColor: [0.8, 0.9, 1],
    ambientColor: [0.5, 0.5, 0.5],
    lightDiffuse: [1, 1, 1],
    lightSpecular: [1, 1, 1],
    lightVector: [1, -1, 0.5],
    useAO: true,
    AOmultipliers: [0.93, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    preserveDrawingBuffer: true,
    octreeBlockSize: 2,
    renderOnResize: true,
}



/**
 * `noa.rendering` - 
 * Manages all rendering, and the BABYLON scene, materials, etc.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * {
 *     showFPS: false,
 *     antiAlias: true,
 *     clearColor: [0.8, 0.9, 1],
 *     ambientColor: [0.5, 0.5, 0.5],
 *     lightDiffuse: [1, 1, 1],
 *     lightSpecular: [1, 1, 1],
 *     lightVector: [1, -1, 0.5],
 *     useAO: true,
 *     AOmultipliers: [0.93, 0.8, 0.5],
 *     reverseAOmultiplier: 1.0,
 *     preserveDrawingBuffer: true,
 *     octreeBlockSize: 2,
 *     renderOnResize: true,
 * }
 * ```
*/

export class Rendering {

    /** 
     * @internal 
     * @param {import('../index').Engine} noa  
    */
    constructor(noa, opts, canvas) {
        opts = Object.assign({}, defaults, opts)
        /** @internal */
        this.noa = noa

        // settings
        /** Whether to redraw the screen when the game is resized while paused */
        this.renderOnResize = !!opts.renderOnResize

        // internals
        /** @internal */
        this.useAO = !!opts.useAO
        /** @internal */
        this.aoVals = opts.AOmultipliers
        /** @internal */
        this.revAoVal = opts.reverseAOmultiplier
        /** @internal */
        this.meshingCutoffTime = 6 // ms

        /** the Babylon.js Engine object for the scene */
        this.engine = null
        /** the Babylon.js Scene object for the world */
        this.scene = null
        /** a Babylon.js DirectionalLight that is added to the scene */
        this.light = null
        /** the Babylon.js FreeCamera that renders the scene */
        this.camera = null

        // sets up babylon scene, lights, etc
        this._initScene(canvas, opts)

        // for debugging
        if (opts.showFPS) setUpFPS()
    }




    /**
     * Constructor helper - set up the Babylon.js scene and basic components
     * @internal
     */
    _initScene(canvas, opts) {

        // init internal properties
        this.engine = new Engine(canvas, opts.antiAlias, {
            preserveDrawingBuffer: opts.preserveDrawingBuffer,
        })
        var scene = new Scene(this.engine)
        this.scene = scene
        // remove built-in listeners
        scene.detachControl()

        // this disables a few babylon features that noa doesn't use
        scene.performancePriority = ScenePerformancePriority.Intermediate
        scene.autoClear = true

        // octree manager class
        var blockSize = Math.round(opts.octreeBlockSize)
        /** @internal */
        this._octreeManager = new SceneOctreeManager(this, blockSize)

        // camera, and a node to hold it and accumulate rotations
        /** @internal */
        this._cameraHolder = new TransformNode('camHolder', scene)
        this.camera = new FreeCamera('camera', new Vector3(0, 0, 0), scene)
        this.camera.parent = this._cameraHolder
        this.camera.minZ = .01

        // plane obscuring the camera - for overlaying an effect on the whole view
        /** @internal */
        this._camScreen = CreatePlane('camScreen', { size: 10 }, scene)
        this.addMeshToScene(this._camScreen)
        this._camScreen.position.z = .1
        this._camScreen.parent = this.camera
        /** @internal */
        this._camScreenMat = this.makeStandardMaterial('camera_screen_mat')
        this._camScreen.material = this._camScreenMat
        this._camScreen.setEnabled(false)
        this._camScreenMat.freeze()
        /** @internal */
        this._camLocBlock = 0

        // apply some defaults
        scene.clearColor = Color4.FromArray(opts.clearColor)
        scene.ambientColor = Color3.FromArray(opts.ambientColor)

        var lightVec = Vector3.FromArray(opts.lightVector)
        this.light = new DirectionalLight('light', lightVec, scene)
        this.light.diffuse = Color3.FromArray(opts.lightDiffuse)
        this.light.specular = Color3.FromArray(opts.lightSpecular)

        // scene options
        scene.skipPointerMovePicking = true
    }
}



/*
 *   PUBLIC API 
 */


/** The Babylon `scene` object representing the game world. */
Rendering.prototype.getScene = function () {
    return this.scene
}

// per-tick listener for rendering-related stuff
/** @internal */
Rendering.prototype.tick = function (dt) {
    // nothing here at the moment
}




/** @internal */
Rendering.prototype.render = function () {
    profile_hook('start')
    updateCameraForRender(this)
    profile_hook('updateCamera')
    this.engine.beginFrame()
    profile_hook('beginFrame')
    this.scene.render()
    profile_hook('render')
    fps_hook()
    this.engine.endFrame()
    profile_hook('endFrame')
    profile_hook('end')
}


/** @internal */
Rendering.prototype.postRender = function () {
    // nothing currently
}


/** @internal */
Rendering.prototype.resize = function () {
    this.engine.resize()
    if (this.noa._paused && this.renderOnResize) {
        this.scene.render()
    }
}


/** @internal */
Rendering.prototype.highlightBlockFace = function (show, posArr, normArr) {
    var m = getHighlightMesh(this)
    if (show) {
        // floored local coords for highlight mesh
        this.noa.globalToLocal(posArr, null, hlpos)
        // offset to avoid z-fighting, bigger when camera is far away
        var dist = glvec3.dist(this.noa.camera._localGetPosition(), hlpos)
        var slop = 0.001 + 0.001 * dist
        for (var i = 0; i < 3; i++) {
            if (normArr[i] === 0) {
                hlpos[i] += 0.5
            } else {
                hlpos[i] += (normArr[i] > 0) ? 1 + slop : -slop
            }
        }
        m.position.copyFromFloats(hlpos[0], hlpos[1], hlpos[2])
        m.rotation.x = (normArr[1]) ? Math.PI / 2 : 0
        m.rotation.y = (normArr[0]) ? Math.PI / 2 : 0
    }
    m.setEnabled(show)
}
var hlpos = []




/**
 * Adds a mesh to the engine's selection/octree logic so that it renders.
 * 
 * @param mesh the mesh to add to the scene
 * @param isStatic pass in true if mesh never moves (i.e. never changes chunks)
 * @param pos (optional) global position where the mesh should be
 * @param containingChunk (optional) chunk to which the mesh is statically bound
 */
Rendering.prototype.addMeshToScene = function (mesh, isStatic = false, pos = null, containingChunk = null) {
    if (!mesh.metadata) mesh.metadata = {}

    // if mesh is already added, just make sure it's visisble
    if (mesh.metadata[addedToSceneFlag]) {
        this._octreeManager.setMeshVisibility(mesh, true)
        return
    }
    mesh.metadata[addedToSceneFlag] = true

    // find local position for mesh and move it there (unless it's parented)
    if (!mesh.parent) {
        if (!pos) pos = mesh.position.asArray()
        var lpos = this.noa.globalToLocal(pos, null, [])
        mesh.position.fromArray(lpos)
    }

    // add to the octree, and remove again on disposal
    this._octreeManager.addMesh(mesh, isStatic, pos, containingChunk)
    mesh.onDisposeObservable.add(() => {
        this._octreeManager.removeMesh(mesh)
        mesh.metadata[addedToSceneFlag] = false
    })
}
var addedToSceneFlag = 'noa_added_to_scene'




/**
 * Use this to toggle the visibility of a mesh without disposing it or
 * removing it from the scene.
 * 
 * @param {import('@babylonjs/core/Meshes').Mesh} mesh
 * @param {boolean} visible
 */
Rendering.prototype.setMeshVisibility = function (mesh, visible = false) {
    if (!mesh.metadata) mesh.metadata = {}
    if (mesh.metadata[addedToSceneFlag]) {
        this._octreeManager.setMeshVisibility(mesh, visible)
    } else {
        if (visible) this.addMeshToScene(mesh)
    }
}








/**
 * Create a default standardMaterial:      
 * flat, nonspecular, fully reflects diffuse and ambient light
 * @returns {StandardMaterial}
 */
Rendering.prototype.makeStandardMaterial = function (name) {
    var mat = new StandardMaterial(name, this.scene)
    mat.specularColor.copyFromFloats(0, 0, 0)
    mat.ambientColor.copyFromFloats(1, 1, 1)
    mat.diffuseColor.copyFromFloats(1, 1, 1)
    return mat
}







/*
 *
 *   INTERNALS
 *
 */





/*
 *
 * 
 *   ACCESSORS FOR CHUNK ADD/REMOVAL/MESHING
 *
 * 
 */
/** @internal */
Rendering.prototype.prepareChunkForRendering = function (chunk) {
    // currently no logic needed here, but I may need it again...
}

/** @internal */
Rendering.prototype.disposeChunkForRendering = function (chunk) {
    // nothing currently
}






// change world origin offset, and rebase everything with a position
/** @internal */
Rendering.prototype._rebaseOrigin = function (delta) {
    var dvec = new Vector3(delta[0], delta[1], delta[2])

    this.scene.meshes.forEach(mesh => {
        // parented meshes don't live in the world coord system
        if (mesh.parent) return

        // move each mesh by delta (even though most are managed by components)
        mesh.position.subtractInPlace(dvec)

        if (mesh.isWorldMatrixFrozen) {
            // paradoxically this unfreezes, then re-freezes the matrix
            mesh.freezeWorldMatrix()
        }
    })

    // updates position of all octree blocks
    this._octreeManager.rebase(dvec)
}





// updates camera position/rotation to match settings from noa.camera

function updateCameraForRender(self) {
    var cam = self.noa.camera
    var tgtLoc = cam._localGetTargetPosition()
    self._cameraHolder.position.copyFromFloats(tgtLoc[0], tgtLoc[1], tgtLoc[2])
    self._cameraHolder.rotation.x = cam.pitch
    self._cameraHolder.rotation.y = cam.heading
    self.camera.position.z = -cam.currentZoom

    // applies screen effect when camera is inside a transparent voxel
    var cloc = cam._localGetPosition()
    var off = self.noa.worldOriginOffset
    var cx = Math.floor(cloc[0] + off[0])
    var cy = Math.floor(cloc[1] + off[1])
    var cz = Math.floor(cloc[2] + off[2])
    var id = self.noa.getBlock(cx, cy, cz)
    checkCameraEffect(self, id)
}



//  If camera's current location block id has alpha color (e.g. water), apply/remove an effect

function checkCameraEffect(self, id) {
    if (id === self._camLocBlock) return
    if (id === 0) {
        self._camScreen.setEnabled(false)
    } else {
        var matId = self.noa.registry.getBlockFaceMaterial(id, 0)
        if (matId) {
            var matData = self.noa.registry.getMaterialData(matId)
            var col = matData.color
            var alpha = matData.alpha
            if (col && alpha && alpha < 1) {
                self._camScreenMat.diffuseColor.set(0, 0, 0)
                self._camScreenMat.ambientColor.set(col[0], col[1], col[2])
                self._camScreenMat.alpha = alpha
                self._camScreen.setEnabled(true)
            }
        }
    }
    self._camLocBlock = id
}






// make or get a mesh for highlighting active voxel
function getHighlightMesh(rendering) {
    var mesh = rendering._highlightMesh
    if (!mesh) {
        mesh = CreatePlane("highlight", { size: 1.0 }, rendering.scene)
        var hlm = rendering.makeStandardMaterial('block_highlight_mat')
        hlm.backFaceCulling = false
        hlm.emissiveColor = new Color3(1, 1, 1)
        hlm.alpha = 0.2
        hlm.freeze()
        mesh.material = hlm

        // outline
        var s = 0.5
        var lines = CreateLines("hightlightLines", {
            points: [
                new Vector3(s, s, 0),
                new Vector3(s, -s, 0),
                new Vector3(-s, -s, 0),
                new Vector3(-s, s, 0),
                new Vector3(s, s, 0)
            ]
        }, rendering.scene)
        lines.color = new Color3(1, 1, 1)
        lines.parent = mesh

        rendering.addMeshToScene(mesh)
        rendering.addMeshToScene(lines)
        rendering._highlightMesh = mesh
    }
    return mesh
}










/*
 * 
 *      sanity checks:
 * 
 */
/** @internal */
Rendering.prototype.debug_SceneCheck = function () {
    var meshes = this.scene.meshes
    var octree = this.scene._selectionOctree
    var dyns = octree.dynamicContent
    var octs = []
    var numOcts = 0
    var numSubs = 0
    var mats = this.scene.materials
    var allmats = []
    mats.forEach(mat => {
        // @ts-ignore
        if (mat.subMaterials) mat.subMaterials.forEach(mat => allmats.push(mat))
        else allmats.push(mat)
    })
    octree.blocks.forEach(function (block) {
        numOcts++
        block.entries.forEach(m => octs.push(m))
    })
    meshes.forEach(function (m) {
        if (m.isDisposed()) warn(m, 'disposed mesh in scene')
        if (empty(m)) return
        if (missing(m, dyns, octs)) warn(m, 'non-empty mesh missing from octree')
        if (!m.material) { warn(m, 'non-empty scene mesh with no material'); return }
        numSubs += (m.subMeshes) ? m.subMeshes.length : 1
        // @ts-ignore
        var mats = m.material.subMaterials || [m.material]
        mats.forEach(function (mat) {
            if (missing(mat, mats)) warn(mat, 'mesh material not in scene')
        })
    })
    var unusedMats = []
    allmats.forEach(mat => {
        var used = false
        meshes.forEach(mesh => {
            if (mesh.material === mat) used = true
            if (!mesh.material) return
            // @ts-ignore
            var mats = mesh.material.subMaterials || [mesh.material]
            if (mats.includes(mat)) used = true
        })
        if (!used) unusedMats.push(mat.name)
    })
    if (unusedMats.length) {
        console.warn('Materials unused by any mesh: ', unusedMats.join(', '))
    }
    dyns.forEach(function (m) {
        if (missing(m, meshes)) warn(m, 'octree/dynamic mesh not in scene')
    })
    octs.forEach(function (m) {
        if (missing(m, meshes)) warn(m, 'octree block mesh not in scene')
    })
    var avgPerOct = Math.round(10 * octs.length / numOcts) / 10
    console.log('meshes - octree:', octs.length, '  dynamic:', dyns.length,
        '   subMeshes:', numSubs,
        '   avg meshes/octreeBlock:', avgPerOct)

    function warn(obj, msg) { console.warn(obj.name + ' --- ' + msg) }

    function empty(mesh) { return (mesh.getIndices().length === 0) }

    function missing(obj, list1, list2) {
        if (!obj) return false
        if (list1.includes(obj)) return false
        if (list2 && list2.includes(obj)) return false
        return true
    }
    return 'done.'
}


/** @internal */
Rendering.prototype.debug_MeshCount = function () {
    var ct = {}
    this.scene.meshes.forEach(m => {
        var n = m.name || ''
        n = n.replace(/-\d+.*/, '#')
        n = n.replace(/\d+.*/, '#')
        n = n.replace(/(rotHolder|camHolder|camScreen)/, 'rendering use')
        n = n.replace(/atlas sprite .*/, 'atlas sprites')
        ct[n] = ct[n] || 0
        ct[n]++
    })
    for (var s in ct) console.log('   ' + (ct[s] + '       ').substr(0, 7) + s)
}







var profile_hook = (PROFILE) ?
    makeProfileHook(200, 'render internals') : () => { }



var fps_hook = function () { }

function setUpFPS() {
    var div = document.createElement('div')
    div.id = 'noa_fps'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.right = '0'
    div.style.zIndex = '0'
    div.style.color = 'white'
    div.style.backgroundColor = 'rgba(0,0,0,0.5)'
    div.style.font = '14px monospace'
    div.style.textAlign = 'center'
    div.style.minWidth = '2em'
    div.style.margin = '4px'
    document.body.appendChild(div)
    var every = 1000
    var ct = 0
    var longest = 0
    var start = performance.now()
    var last = start
    fps_hook = function () {
        ct++
        var nt = performance.now()
        if (nt - last > longest) longest = nt - last
        last = nt
        if (nt - start < every) return
        var fps = Math.round(ct / (nt - start) * 1000)
        var min = Math.round(1 / longest * 1000)
        div.innerHTML = fps + '<br>' + min
        ct = 0
        longest = 0
        start = nt
    }
}
````

## File: src/engine/lib/sceneOctreeManager.js
````javascript
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Octree } from '@babylonjs/core/Culling/Octrees/octree'
import { OctreeBlock } from '@babylonjs/core/Culling/Octrees/octreeBlock'
import { OctreeSceneComponent } from '@babylonjs/core/Culling/Octrees/octreeSceneComponent'

import { locationHasher, removeUnorderedListItem } from './util'


/*
 * 
 * 
 * 
 *          simple class to manage scene octree and octreeBlocks
 * 
 * 
 * 
*/

/** @internal */
export class SceneOctreeManager {

    /** @internal */
    constructor(rendering, blockSize) {
        var scene = rendering.scene
        scene._addComponent(new OctreeSceneComponent(scene))

        // mesh metadata flags
        var octreeBlock = 'noa_octree_block'
        var inDynamicList = 'noa_in_dynamic_list'
        var inOctreeBlock = 'noa_in_octree_block'

        // the root octree object
        var octree = new Octree(NOP)
        scene._selectionOctree = octree
        octree.blocks = []
        var octBlocksHash = {}


        /*
         * 
         *          public API
         * 
        */

        this.rebase = (offset) => { recurseRebaseBlocks(octree, offset) }

        this.addMesh = (mesh, isStatic, pos, chunk) => {
            if (!mesh.metadata) mesh.metadata = {}

            // dynamic content is just rendered from a list on the octree
            if (!isStatic) {
                if (mesh.metadata[inDynamicList]) return
                octree.dynamicContent.push(mesh)
                mesh.metadata[inDynamicList] = true
                return
            }

            // octreeBlock-space integer coords of mesh position, and hashed key
            var ci = Math.floor(pos[0] / bs)
            var cj = Math.floor(pos[1] / bs)
            var ck = Math.floor(pos[2] / bs)
            var mapKey = locationHasher(ci, cj, ck)

            // get or create octreeBlock
            var block = octBlocksHash[mapKey]
            if (!block) {
                // lower corner of new octree block position, in global/local
                var gloc = [ci * bs, cj * bs, ck * bs]
                var loc = [0, 0, 0]
                rendering.noa.globalToLocal(gloc, null, loc)
                // make the new octree block and store it
                block = makeOctreeBlock(loc, bs)
                octree.blocks.push(block)
                octBlocksHash[mapKey] = block
                block._noaMapKey = mapKey
            }

            // do the actual adding logic
            block.entries.push(mesh)
            mesh.metadata[octreeBlock] = block
            mesh.metadata[inOctreeBlock] = true

            // rely on octrees for selection, skipping bounds checks
            mesh.alwaysSelectAsActiveMesh = true
        }



        this.removeMesh = (mesh) => {
            if (!mesh.metadata) return

            if (mesh.metadata[inDynamicList]) {
                removeUnorderedListItem(octree.dynamicContent, mesh)
                mesh.metadata[inDynamicList] = false
            }
            if (mesh.metadata[inOctreeBlock]) {
                var block = mesh.metadata[octreeBlock]
                if (block && block.entries) {
                    removeUnorderedListItem(block.entries, mesh)
                    if (block.entries.length === 0) {
                        delete octBlocksHash[block._noaMapKey]
                        removeUnorderedListItem(octree.blocks, block)
                    }
                }
                mesh.metadata[octreeBlock] = null
                mesh.metadata[inOctreeBlock] = false
            }
        }



        // experimental helper
        this.setMeshVisibility = (mesh, visible = false) => {
            if (mesh.metadata[octreeBlock]) {
                // mesh is static
                if (mesh.metadata[inOctreeBlock] === visible) return
                var block = mesh.metadata[octreeBlock]
                if (block && block.entries) {
                    if (visible) {
                        block.entries.push(mesh)
                    } else {
                        removeUnorderedListItem(block.entries, mesh)
                    }
                }
                mesh.metadata[inOctreeBlock] = visible
            } else {
                // mesh is dynamic
                if (mesh.metadata[inDynamicList] === visible) return
                if (visible) {
                    octree.dynamicContent.push(mesh)
                } else {
                    removeUnorderedListItem(octree.dynamicContent, mesh)
                }
                mesh.metadata[inDynamicList] = visible
            }
        }

        /*
         * 
         *          internals
         * 
        */

        var NOP = () => { }
        var bs = blockSize * rendering.noa.world._chunkSize

        var recurseRebaseBlocks = (parent, offset) => {
            parent.blocks.forEach(child => {
                child.minPoint.subtractInPlace(offset)
                child.maxPoint.subtractInPlace(offset)
                child._boundingVectors.forEach(v => v.subtractInPlace(offset))
                if (child.blocks) recurseRebaseBlocks(child, offset)
            })
        }

        var makeOctreeBlock = (minPt, size) => {
            var min = new Vector3(minPt[0], minPt[1], minPt[2])
            var max = new Vector3(minPt[0] + size, minPt[1] + size, minPt[2] + size)
            return new OctreeBlock(min, max, undefined, undefined, undefined, NOP)
        }

    }

}
````

## File: src/engine/lib/shims.js
````javascript
/**
 * This works around some old node-style code in a
 * dependency of box-intersect.
*/
if (window && !window['global']) {
    window['global'] = window.globalThis || {}
}
````

## File: src/engine/lib/terrainMaterials.js
````javascript
import { Engine } from '@babylonjs/core/Engines/engine'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase'
import { RawTexture2DArray } from '@babylonjs/core/Materials/Textures/rawTexture2DArray'

/**
 * 
 * 
 *      This module creates and manages Materials for terrain meshes. 
 *      It tells the terrain mesher which block face materials can share
 *      the same material (and should thus be joined into a single mesh),
 *      and also creates the materials when needed.
 * 
 * @internal
*/

export class TerrainMatManager {

    /** @param {import('../index').Engine} noa  */
    constructor(noa) {
        // make a baseline default material for untextured terrain with no alpha
        this._defaultMat = noa.rendering.makeStandardMaterial('base-terrain')
        this._defaultMat.freeze()

        this.allMaterials = [this._defaultMat]

        // internals
        this.noa = noa
        this._idCounter = 1000
        this._blockMatIDtoTerrainID = {}
        this._terrainIDtoMatObject = {}
        this._texURLtoTerrainID = {}
        this._renderMatToTerrainID = new Map()
    }



    /** 
     * Maps a given `matID` (from noa.registry) to a unique ID of which 
     * terrain material can be used for that block material.
     * This lets the terrain mesher map which blocks can be merged into
     * the same meshes.
     * Internally, this accessor also creates the material for each 
     * terrainMatID as they are first encountered.
     */

    getTerrainMatId(blockMatID) {
        // fast case where matID has been seen before
        if (blockMatID in this._blockMatIDtoTerrainID) {
            return this._blockMatIDtoTerrainID[blockMatID]
        }
        // decide a unique terrainID for this block material
        var terrID = decideTerrainMatID(this, blockMatID)
        // create a mat object for it, if needed
        if (!(terrID in this._terrainIDtoMatObject)) {
            var mat = createTerrainMat(this, blockMatID)
            this.allMaterials.push(mat)
            this._terrainIDtoMatObject[terrID] = mat
        }
        // cache results and done
        this._blockMatIDtoTerrainID[blockMatID] = terrID
        return terrID
    }


    /**
     * Get a Babylon Material object, given a terrainMatID (gotten from this module)
     */
    getMaterial(terrainMatID = 1) {
        return this._terrainIDtoMatObject[terrainMatID]
    }





}




/**
 * 
 * 
 *      Implementations of creating/disambiguating terrain Materials
 * 
 * 
*/

/** 
 * Decide a unique terrainID, based on block material ID properties
 * @param {TerrainMatManager} self 
*/
function decideTerrainMatID(self, blockMatID = 0) {
    var matInfo = self.noa.registry.getMaterialData(blockMatID)

    // custom render materials get one unique terrainID per material
    if (matInfo.renderMat) {
        var mat = matInfo.renderMat
        if (!self._renderMatToTerrainID.has(mat)) {
            self._renderMatToTerrainID.set(mat, self._idCounter++)
        }
        return self._renderMatToTerrainID.get(mat)
    }

    // ditto for textures, unique URL
    if (matInfo.texture) {
        var url = matInfo.texture
        if (!(url in self._texURLtoTerrainID)) {
            self._texURLtoTerrainID[url] = self._idCounter++
        }
        return self._texURLtoTerrainID[url]
    }

    // plain color materials with an alpha value are unique by alpha
    var alpha = matInfo.alpha
    if (alpha > 0 && alpha < 1) return 10 + Math.round(alpha * 100)

    // the only remaining case is the baseline, which always reuses one fixed ID
    return 1
}


/** 
 * Create (choose) a material for a given set of block material properties
 * @param {TerrainMatManager} self 
*/
function createTerrainMat(self, blockMatID = 0) {
    var matInfo = self.noa.registry.getMaterialData(blockMatID)

    // custom render mats are just reused
    if (matInfo.renderMat) return matInfo.renderMat

    // if no texture: use a basic flat material, possibly with alpha
    if (!matInfo.texture) {
        var needsAlpha = (matInfo.alpha > 0 && matInfo.alpha < 1)
        if (!needsAlpha) return self._defaultMat
        var matName = 'terrain-alpha-' + blockMatID
        var plainMat = self.noa.rendering.makeStandardMaterial(matName)
        plainMat.alpha = matInfo.alpha
        plainMat.freeze()
        return plainMat
    }

    // remaining case is a new material with a diffuse texture
    var scene = self.noa.rendering.getScene()
    var mat = self.noa.rendering.makeStandardMaterial('terrain-textured-' + blockMatID)
    var texURL = matInfo.texture
    var sampling = Texture.NEAREST_SAMPLINGMODE
    var tex = new Texture(texURL, scene, true, false, sampling)
    if (matInfo.texHasAlpha) tex.hasAlpha = true
    mat.diffuseTexture = tex

    // it texture is an atlas, apply material plugin
    // and check whether any material for the atlas needs alpha
    if (matInfo.atlasIndex >= 0) {
        new TerrainMaterialPlugin(mat, tex)
        if (self.noa.registry._textureNeedsAlpha(matInfo.texture)) {
            tex.hasAlpha = true
        }
    }

    mat.freeze()
    return mat
}











/**
 * 
 *      Babylon material plugin - twiddles the defines/shaders/etc so that
 *      a standard material can use textures from a 2D texture atlas.
 * 
*/

class TerrainMaterialPlugin extends MaterialPluginBase {
    constructor(material, texture) {
        var priority = 200
        var defines = { 'NOA_TWOD_ARRAY_TEXTURE': false }
        super(material, 'TestPlugin', priority, defines)
        this._enable(true)
        this._atlasTextureArray = null

        texture.onLoadObservable.add((tex) => {
            this.setTextureArrayData(tex)
        })
    }

    setTextureArrayData(texture) {
        var { width, height } = texture.getSize()
        var numLayers = Math.round(height / width)
        height = width
        var data = texture._readPixelsSync()

        var format = Engine.TEXTUREFORMAT_RGBA
        var genMipMaps = true
        var invertY = false
        var mode = Texture.NEAREST_SAMPLINGMODE
        var scene = texture.getScene()

        this._atlasTextureArray = new RawTexture2DArray(
            data, width, height, numLayers,
            format, scene, genMipMaps, invertY, mode,
        )
    }

    prepareDefines(defines, scene, mesh) {
        defines['NOA_TWOD_ARRAY_TEXTURE'] = true
    }

    getClassName() {
        return 'TerrainMaterialPluginName'
    }

    getSamplers(samplers) {
        samplers.push('atlasTexture')
    }

    getAttributes(attributes) {
        attributes.push('texAtlasIndices')
    }

    getUniforms() {
        return { ubo: [] }
    }

    bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
        if (this._atlasTextureArray) {
            uniformBuffer.setTexture('atlasTexture', this._atlasTextureArray)
        }
    }

    getCustomCode(shaderType) {
        if (shaderType === 'vertex') return {
            'CUSTOM_VERTEX_MAIN_BEGIN': `
                texAtlasIndex = texAtlasIndices;
            `,
            'CUSTOM_VERTEX_DEFINITIONS': `
                uniform highp sampler2DArray atlasTexture;
                attribute float texAtlasIndices;
                varying float texAtlasIndex;
            `,
        }
        if (shaderType === 'fragment') return {
            '!baseColor\\=texture2D\\(diffuseSampler,vDiffuseUV\\+uvOffset\\);':
                `baseColor = texture(atlasTexture, vec3(vDiffuseUV, texAtlasIndex));`,
            'CUSTOM_FRAGMENT_DEFINITIONS': `
                uniform highp sampler2DArray atlasTexture;
                varying float texAtlasIndex;
            `,
        }
        return null
    }
}
````

## File: src/engine/lib/terrainMesher.js
````javascript
import ndarray from 'ndarray'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { TerrainMatManager } from './terrainMaterials'
import { makeProfileHook } from './util'



// enable for profiling..
var PROFILE_EVERY = 0




/*
 * 
 *          TERRAIN MESHER!!
 * 
 * 
 *  top-level entry point:
 *      takes a chunk, passes it to the greedy mesher,
 *      gets back an intermediate struct of face data,
 *      passes that to the mesh builder,
 *      gets back an array of Mesh objects,
 *      and finally puts those into the 3D engine
 *      
*/


/** 
 * @internal
 * @param {import('../index').Engine} noa 
*/
export function TerrainMesher(noa) {

    // wrangles which block materials can be merged into the same mesh
    var terrainMatManager = new TerrainMatManager(noa)
    this.allTerrainMaterials = terrainMatManager.allMaterials

    // internally expose the default flat material used for untextured terrain
    this._defaultMaterial = terrainMatManager._defaultMat

    // two-pass implementations for this module
    var greedyMesher = new GreedyMesher(noa, terrainMatManager)
    var meshBuilder = new MeshBuilder(noa, terrainMatManager)


    /*
     * 
     *      API
     * 
    */

    // set or clean up any per-chunk properties needed for terrain meshing
    this.initChunk = function (chunk) {
        chunk._terrainMeshes.length = 0
    }

    this.disposeChunk = function (chunk) {
        chunk._terrainMeshes.forEach(mesh => {
            noa.emit('removingTerrainMesh', mesh)
            mesh.dispose()
        })
        chunk._terrainMeshes.length = 0
    }


    /**
     * meshing entry point and high-level flow
     * @param {import('./chunk').Chunk} chunk 
     */
    this.meshChunk = function (chunk, ignoreMaterials = false) {
        profile_hook('start')

        // remove any previous terrain meshes
        this.disposeChunk(chunk)
        profile_hook('cleanup')

        // greedy mesher generates struct of face data
        var faceDataSet = greedyMesher.mesh(chunk, ignoreMaterials)
        profile_hook('geom')

        // builder generates mesh data (positions, normals, etc)
        var meshes = meshBuilder.buildMesh(chunk, faceDataSet, ignoreMaterials)
        profile_hook('build')

        profile_hook('end')

        // add meshes to scene and finish
        meshes.forEach((mesh) => {
            mesh.cullingStrategy = Mesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY
            noa.rendering.addMeshToScene(mesh, true, chunk.pos, this)
            noa.emit('addingTerrainMesh', mesh)
            mesh.freezeNormals()
            mesh.freezeWorldMatrix()
            chunk._terrainMeshes.push(mesh)
            if (!mesh.metadata) mesh.metadata = {}
            mesh.metadata[terrainMeshFlag] = true
        })
    }
    var terrainMeshFlag = 'noa_chunk_terrain_mesh'

}







/*
 * 
 * 
 * 
 * 
 *      Intermediate struct to hold data for a bunch of merged block faces
 * 
 *      The greedy mesher produces these (one per terrainID), 
 *      and the mesh builder turns each one into a Mesh instance.
 *
 * 
 * 
 * 
 * 
*/

function MeshedFaceData() {
    this.terrainID = 0
    this.numFaces = 0
    // following arrays are all one element per quad
    this.matIDs = []
    this.dirs = []
    this.is = []
    this.js = []
    this.ks = []
    this.wids = []
    this.hts = []
    this.packedAO = []
}















/**
 * 
 * 
 * 
 *      Greedy meshing algorithm
 *      
 *      Originally based on algo by Mikola Lysenko:
 *          http://0fps.net/2012/07/07/meshing-minecraft-part-2/
 *      but probably no code remaining from there anymore.
 *      Ad-hoc AO handling by me, made of cobwebs and dreams
 * 
 *    
 *      Takes in a Chunk instance, and returns an object containing 
 *      GeometryData structs, keyed by terrain material ID, 
 *      which the terrain builder can then make into meshes.
 * 
 * 
 * @param {import('../index').Engine} noa
 * @param {import('./terrainMaterials').TerrainMatManager} terrainMatManager
*/

function GreedyMesher(noa, terrainMatManager) {

    // class-wide cached structs and getters
    var maskCache = new Int16Array(16)
    var aoMaskCache = new Int16Array(16)

    // terrain ID accessor can be overridded for hacky reasons
    var realGetTerrainID = terrainMatManager.getTerrainMatId.bind(terrainMatManager)
    var fakeGetTerrainID = (matID) => 1
    var terrainIDgetter = realGetTerrainID





    /** 
     * Entry point
     * 
     * @param {import('./chunk').Chunk} chunk
     * @returns {Object.<string, MeshedFaceData>} keyed by terrain material ID 
     */
    this.mesh = function (chunk, ignoreMaterials) {
        var cs = chunk.size
        terrainIDgetter = (ignoreMaterials) ? fakeGetTerrainID : realGetTerrainID

        // no internal faces for empty or entirely solid chunks
        var edgesOnly = (chunk._isEmpty || chunk._isFull)

        /** @type {Object.<string, MeshedFaceData>} */
        var faceDataSet = {}
        faceDataPool.reset()

        // Sweep over each axis, mapping axes to [d,u,v]
        for (var d = 0; d < 3; ++d) {
            var u = (d === 2) ? 0 : 2
            var v = (d === 1) ? 0 : 1

            // transposed ndarrays of nearby chunk voxels (self and neighbors)
            var nabVoxelsArr = chunk._neighbors.data.map(c => {
                if (c && c.voxels) return c.voxels.transpose(d, u, v)
                return null
            })

            // ndarray of the previous, similarly transposed
            var nabVoxelsT = ndarray(nabVoxelsArr, [3, 3, 3])
                .lo(1, 1, 1)
                .transpose(d, u, v)

            // embiggen the cached mask arrays if needed
            if (maskCache.length < cs * cs) {
                maskCache = new Int16Array(cs * cs)
                aoMaskCache = new Int16Array(cs * cs)
            }

            // sets up transposed accessor for querying solidity of (i,j,k):
            prepareSolidityLookup(nabVoxelsT, cs)


            // ACTUAL MASK AND GEOMETRY CREATION


            // mesh plane between this chunk and previous neighbor on i axis?
            var prev = nabVoxelsT.get(-1, 0, 0)
            var here = nabVoxelsT.get(0, 0, 0)
            if (prev) {
                // offset version of neighbor to make queries work at i=-1
                var prevOff = prev.lo(cs, 0, 0)
                var nFaces = constructMeshMask(d, prevOff, -1, here, 0)

                if (nFaces > 0) {
                    constructGeometryFromMasks(0, d, u, v, cs, cs, nFaces, faceDataSet)
                }
            }

            // if only doing edges, we're done with this axis
            if (edgesOnly) continue


            // mesh the rest of the planes internal to this chunk
            // note only looping up to (size-1), skipping final coord so as 
            // not to duplicate faces at chunk borders
            for (var i = 0; i < cs - 1; i++) {

                // maybe skip y axis, if both layers are all the same voxel
                if (d === 1) {
                    var v1 = chunk._wholeLayerVoxel[i]
                    if (v1 >= 0 && v1 === chunk._wholeLayerVoxel[i + 1]) {
                        continue
                    }
                }

                // pass in layer array for skip checks, only if not already checked
                var layerVoxRef = (d === 1) ? null : chunk._wholeLayerVoxel

                var nf = constructMeshMask(d, here, i, here, i + 1, layerVoxRef)
                if (nf > 0) {
                    constructGeometryFromMasks(i + 1, d, u, v, cs, cs, nf, faceDataSet)
                }
            }

            // we skip the i-positive neighbor so as not to duplicate edge faces
        }

        // done!
        return faceDataSet
    }






    /**
     * Rigging for a transposed (i,j,k) => boolean solidity lookup, 
     * that knows how to query into neigboring chunks at edges.
     * This sets up the indirection used by `voxelIsSolid` below.
    */
    function prepareSolidityLookup(nabVoxelsT, size) {
        if (solidityLookupInittedSize !== size) {
            solidityLookupInittedSize = size
            voxelIDtoSolidity = noa.registry._solidityLookup

            for (var x = -1; x < size + 1; x++) {
                var loc = (x < 0) ? 0 : (x < size) ? 1 : 2
                coordToLoc[x + 1] = [0, 1, 2][loc]
                edgeCoordLookup[x + 1] = [size - 1, x, 0][loc]
                missingCoordLookup[x + 1] = [0, x, size - 1][loc]
            }
        }

        var centerChunk = nabVoxelsT.get(0, 0, 0)
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    var ix = i * 9 + j * 3 + k
                    var nab = nabVoxelsT.get(i - 1, j - 1, k - 1)
                    var type = 0
                    if (!nab) type = 1
                    if (nab === centerChunk) type = 2
                    voxTypeLookup[ix] = type
                    voxLookup[ix] = nab || centerChunk
                }
            }
        }
    }

    var solidityLookupInittedSize = -1
    var voxelIDtoSolidity = [false, true]
    var voxLookup = Array(27).fill(null)
    var voxTypeLookup = Array(27).fill(0)
    var coordToLoc = [0, 1, 1, 1, 1, 1, 2]
    var edgeCoordLookup = [3, 0, 1, 2, 3, 0]
    var missingCoordLookup = [0, 0, 1, 2, 3, 3]


    function voxelIsSolid(i, j, k) {
        var li = coordToLoc[i + 1]
        var lj = coordToLoc[j + 1]
        var lk = coordToLoc[k + 1]
        var ix = li * 9 + lj * 3 + lk
        var voxArray = voxLookup[ix]
        var type = voxTypeLookup[ix]
        if (type === 2) {
            return voxelIDtoSolidity[voxArray.get(i, j, k)]
        }
        var lookup = [edgeCoordLookup, missingCoordLookup][type]
        var ci = lookup[i + 1]
        var cj = lookup[j + 1]
        var ck = lookup[k + 1]
        return voxelIDtoSolidity[voxArray.get(ci, cj, ck)]
    }








    /**
     * 
     *      Build a 2D array of mask values representing whether a 
     *      mesh face is needed at each position
     * 
     *      Each mask value is a terrain material ID, negative if
     *      the face needs to point in the -i direction (towards voxel arr A)
     * 
     * @returns {number} number of mesh faces found
     */

    function constructMeshMask(d, arrA, iA, arrB, iB, wholeLayerVoxel = null) {
        var len = arrA.shape[1]
        var mask = maskCache
        var aoMask = aoMaskCache
        var doAO = noa.rendering.useAO
        var skipRevAo = (noa.rendering.revAoVal === noa.rendering.aoVals[0])

        var opacityLookup = noa.registry._opacityLookup
        var getMaterial = noa.registry.getBlockFaceMaterial
        var materialDir = d * 2

        // mask is iterated by a simple integer, both here and later when
        // merging meshes, so the j/k order must be the same in both places
        var n = 0

        // set up for quick ndarray traversals
        var indexA = arrA.index(iA, 0, 0)
        var jstrideA = arrA.stride[1]
        var kstrideA = arrA.stride[2]
        var indexB = arrB.index(iB, 0, 0)
        var jstrideB = arrB.stride[1]
        var kstrideB = arrB.stride[2]

        var facesFound = 0

        for (var k = 0; k < len; ++k) {
            var dA = indexA
            var dB = indexB
            indexA += kstrideA
            indexB += kstrideB

            // skip this second axis, if whole layer is same voxel?
            if (wholeLayerVoxel && wholeLayerVoxel[k] >= 0) {
                n += len
                continue
            }

            for (var j = 0; j < len; j++, n++, dA += jstrideA, dB += jstrideB) {

                // mask[n] represents the face needed between the two voxel layers
                // for now, assume we never have two faces in both directions

                // note that mesher zeroes out the mask as it goes, so there's 
                // no need to zero it here when no face is needed

                // IDs at i-1,j,k  and  i,j,k
                var id0 = arrA.data[dA]
                var id1 = arrB.data[dB]

                // most common case: never a face between same voxel IDs, 
                // so skip out early
                if (id0 === id1) continue

                // no face if both blocks are opaque
                var op0 = opacityLookup[id0]
                var op1 = opacityLookup[id1]
                if (op0 && op1) continue

                // also no face if both block faces have the same block material
                var m0 = getMaterial(id0, materialDir)
                var m1 = getMaterial(id1, materialDir + 1)
                if (m0 === m1) continue

                // choose which block face to draw:
                //   * if either block is opaque draw that one
                //   * if either material is missing draw the other one
                if (op0 || m1 === 0) {
                    mask[n] = m0
                    if (doAO) aoMask[n] = packAOMask(voxelIsSolid, iB, iA, j, k, skipRevAo)
                    facesFound++
                } else if (op1 || m0 === 0) {
                    mask[n] = -m1
                    if (doAO) aoMask[n] = packAOMask(voxelIsSolid, iA, iB, j, k, skipRevAo)
                    facesFound++
                } else {
                    // leftover case is two different non-opaque blocks facing each other.
                    // Someday we could try to draw both, but for now we draw neither.
                }
            }
        }
        return facesFound
    }






    // 
    //      Greedy meshing inner loop two
    //
    // construct geometry data from the masks

    function constructGeometryFromMasks(i, d, u, v, len1, len2, numFaces, faceDataSet) {
        var doAO = noa.rendering.useAO
        var mask = maskCache
        var aomask = aoMaskCache

        var n = 0
        var materialDir = d * 2
        var x = [0, 0, 0]
        x[d] = i

        var maskCompareFcn = (doAO) ? maskCompare : maskCompare_noAO

        for (var k = 0; k < len2; ++k) {
            var w = 1
            var h = 1
            for (var j = 0; j < len1; j += w, n += w) {

                var maskVal = mask[n] | 0
                if (!maskVal) {
                    w = 1
                    continue
                }

                var ao = aomask[n] | 0

                // Compute width and height of area with same mask/aomask values
                for (w = 1; w < len1 - j; ++w) {
                    if (!maskCompareFcn(n + w, mask, maskVal, aomask, ao)) break
                }

                OUTER:
                for (h = 1; h < len2 - k; ++h) {
                    for (var m = 0; m < w; ++m) {
                        var ix = n + m + h * len1
                        if (!maskCompareFcn(ix, mask, maskVal, aomask, ao)) break OUTER
                    }
                }

                // for testing: doing the following will disable greediness
                //w=h=1

                //  materialID and terrain ID type for the face
                var matID = Math.abs(maskVal)
                var terrainID = terrainIDgetter(matID)

                // if terrainID not seen before, start a new MeshedFaceData
                // from the extremely naive object pool
                if (!(terrainID in faceDataSet)) {
                    var fdFromPool = faceDataPool.get()
                    fdFromPool.numFaces = 0
                    fdFromPool.terrainID = terrainID
                    faceDataSet[terrainID] = fdFromPool
                }

                // pack one face worth of data into the return struct

                var faceData = faceDataSet[terrainID]
                var nf = faceData.numFaces
                faceData.numFaces++

                faceData.matIDs[nf] = matID
                x[u] = j
                x[v] = k
                faceData.is[nf] = x[0]
                faceData.js[nf] = x[1]
                faceData.ks[nf] = x[2]
                faceData.wids[nf] = w
                faceData.hts[nf] = h
                faceData.packedAO[nf] = ao
                faceData.dirs[nf] = (maskVal > 0) ? materialDir : materialDir + 1


                // Face now finished, zero out the used part of the mask
                for (var hx = 0; hx < h; ++hx) {
                    for (var wx = 0; wx < w; ++wx) {
                        mask[n + wx + hx * len1] = 0
                    }
                }

                // exit condition where no more faces are left to mesh
                numFaces -= w * h
                if (numFaces === 0) return
            }
        }
    }

    function maskCompare(index, mask, maskVal, aomask, aoVal) {
        if (maskVal !== mask[index]) return false
        if (aoVal !== aomask[index]) return false
        return true
    }

    function maskCompare_noAO(index, mask, maskVal, aomask, aoVal) {
        if (maskVal !== mask[index]) return false
        return true
    }

}


/**
 * Extremely naive object pool for MeshedFaceData objects
*/
var faceDataPool = (() => {
    var arr = [], ix = 0
    var get = () => {
        if (ix >= arr.length) arr.push(new MeshedFaceData)
        ix++
        return arr[ix - 1]
    }
    var reset = () => { ix = 0 }
    return { get, reset }
})()
















/**
 * 
 * 
 * 
 * 
 *       Mesh Builder - consumes all the raw data in geomData to build
 *          Babylon.js mesh/submeshes, ready to be added to the scene
 * 
 * 
 * 
 * 
 * 
 */

/** @param {import('../index').Engine} noa  */
function MeshBuilder(noa, terrainMatManager) {

    /** 
     * Consume the intermediate FaceData struct and produce
     * actual mesehes the 3D engine can render
     * @param {Object.<string, MeshedFaceData>} faceDataSet  
    */
    this.buildMesh = function (chunk, faceDataSet, ignoreMaterials) {
        var scene = noa.rendering.getScene()

        var doAO = noa.rendering.useAO
        var aoVals = noa.rendering.aoVals
        var revAoVal = noa.rendering.revAoVal

        var atlasIndexLookup = noa.registry._matAtlasIndexLookup
        var matColorLookup = noa.registry._materialColorLookup
        var white = [1, 1, 1]




        // geometry data is already keyed by terrain type, so build
        // one mesh per geomData object in the hash
        var meshes = []
        for (var key in faceDataSet) {
            var faceData = faceDataSet[key]
            var terrainID = faceData.terrainID

            // will this mesh need texture atlas indexes?
            var usesAtlas = false
            if (!ignoreMaterials) {
                var firstIx = atlasIndexLookup[faceData.matIDs[0]]
                usesAtlas = (firstIx >= 0)
            }

            // build the necessary arrays
            var nf = faceData.numFaces
            var indices = new Uint16Array(nf * 6)
            var positions = new Float32Array(nf * 12)
            var normals = new Float32Array(nf * 12)
            var colors = new Float32Array(nf * 16)
            var uvs = new Float32Array(nf * 8)
            var atlasIndexes
            if (usesAtlas) atlasIndexes = new Float32Array(nf * 4)

            // scan all faces in the struct, creating data for each
            for (var f = 0; f < faceData.numFaces; f++) {

                // basic data from struct
                var matID = faceData.matIDs[f]
                var materialDir = faceData.dirs[f]  // 0..5: x,-x, y,-y, z,-z

                var i = faceData.is[f]
                var j = faceData.js[f]
                var k = faceData.ks[f]
                var w = faceData.wids[f]
                var h = faceData.hts[f]
                var axis = (materialDir / 2) | 0
                var dir = (materialDir % 2) ? -1 : 1


                addPositionValues(positions, f, i, j, k, axis, w, h)
                addUVs(uvs, f, axis, w, h, dir)

                var norms = [0, 0, 0]
                norms[axis] = dir
                addNormalValues(normals, f, norms)

                var ao = faceData.packedAO[f]
                var [A, B, C, D] = unpackAOMask(ao)
                var triDir = decideTriDir(A, B, C, D)

                addIndexValues(indices, f, axis, dir, triDir)

                if (usesAtlas) {
                    var atlasIndex = atlasIndexLookup[matID]
                    addAtlasIndices(atlasIndexes, f, atlasIndex)
                }

                var matColor = matColorLookup[matID] || white
                if (doAO) {
                    pushMeshColors(colors, f, matColor, aoVals, revAoVal, A, B, C, D)
                } else {
                    pushMeshColors_noAO(colors, f, matColor)
                }
            }



            // the mesh and vertexData object
            var name = `chunk_${chunk.requestID}_${terrainID}`
            var mesh = new Mesh(name, scene)
            var vdat = new VertexData()

            // finish the mesh
            vdat.positions = positions
            vdat.indices = indices
            vdat.normals = normals
            vdat.colors = colors
            vdat.uvs = uvs
            vdat.applyToMesh(mesh)

            // meshes using a texture atlas need atlasIndices
            if (usesAtlas) {
                mesh.setVerticesData('texAtlasIndices', atlasIndexes, false, 1)
            }

            // disable some unnecessary bounding checks
            mesh.isPickable = false
            mesh.doNotSyncBoundingInfo = true
            mesh._refreshBoundingInfo = () => mesh

            // materials wrangled by external module
            if (!ignoreMaterials) {
                mesh.material = terrainMatManager.getMaterial(terrainID)
            }

            // done
            meshes.push(mesh)
        }

        return meshes
    }




    // HELPERS ---- these could probably be simplified and less magical

    function addPositionValues(posArr, faceNum, i, j, k, axis, w, h) {
        var offset = faceNum * 12

        var loc = [i, j, k]
        var du = [0, 0, 0]
        var dv = [0, 0, 0]
        du[(axis === 2) ? 0 : 2] = w
        dv[(axis === 1) ? 0 : 1] = h

        for (var ix = 0; ix < 3; ix++) {
            posArr[offset + ix] = loc[ix]
            posArr[offset + 3 + ix] = loc[ix] + du[ix]
            posArr[offset + 6 + ix] = loc[ix] + du[ix] + dv[ix]
            posArr[offset + 9 + ix] = loc[ix] + dv[ix]
        }
    }



    function addUVs(uvArr, faceNum, d, w, h, dir) {
        var offset = faceNum * 8
        var epsilon = 0
        for (var i = 0; i < 8; i++) uvArr[offset + i] = epsilon
        if (d === 0) {
            uvArr[offset + 1] = uvArr[offset + 3] = h - epsilon
            uvArr[offset + 2] = uvArr[offset + 4] = dir * w
        } else if (d === 1) {
            uvArr[offset + 1] = uvArr[offset + 7] = w - epsilon
            uvArr[offset + 4] = uvArr[offset + 6] = dir * h
        } else {
            uvArr[offset + 1] = uvArr[offset + 3] = h - epsilon
            uvArr[offset + 2] = uvArr[offset + 4] = -dir * w
        }
    }

    function addNormalValues(normArr, faceNum, norms) {
        var offset = faceNum * 12
        for (var i = 0; i < 12; i++) {
            normArr[offset + i] = norms[i % 3]
        }
    }

    function addIndexValues(indArr, faceNum, axis, dir, triDir) {
        var offset = faceNum * 6
        var baseIndex = faceNum * 4
        if (axis === 0) dir = -dir
        var ix = (dir < 0) ? 0 : 1
        if (!triDir) ix += 2
        var indexVals = indexLists[ix]
        for (var i = 0; i < 6; i++) {
            indArr[offset + i] = baseIndex + indexVals[i]
        }
    }
    var indexLists = [
        [0, 1, 2, 0, 2, 3], // base
        [0, 2, 1, 0, 3, 2], // flipped
        [1, 2, 3, 1, 3, 0], // opposite triDir
        [1, 3, 2, 1, 0, 3], // opposite triDir
    ]




    function addAtlasIndices(indArr, faceNum, atlasIndex) {
        var offset = faceNum * 4
        for (var i = 0; i < 4; i++) {
            indArr[offset + i] = atlasIndex
        }
    }

    function decideTriDir(A, B, C, D) {
        // this bit is pretty magical..
        // (true means split along the a00-a11 axis)
        if (A === C) {
            return (D === B) ? (D === 2) : true
        } else {
            return (D === B) ? false : (A + C > D + B)
        }
    }

    function pushMeshColors_noAO(colors, faceNum, col) {
        var offset = faceNum * 16
        for (var i = 0; i < 16; i += 4) {
            colors[offset + i] = col[0]
            colors[offset + i + 1] = col[1]
            colors[offset + i + 2] = col[2]
            colors[offset + i + 3] = 1
        }
    }

    function pushMeshColors(colors, faceNum, col, aoVals, revAo, A, B, C, D) {
        var offset = faceNum * 16
        pushAOColor(colors, offset, col, A, aoVals, revAo)
        pushAOColor(colors, offset + 4, col, D, aoVals, revAo)
        pushAOColor(colors, offset + 8, col, C, aoVals, revAo)
        pushAOColor(colors, offset + 12, col, B, aoVals, revAo)
    }

    // premultiply vertex colors by value depending on AO level
    // then push them into color array
    function pushAOColor(colors, ix, baseCol, ao, aoVals, revAoVal) {
        var mult = (ao === 0) ? revAoVal : aoVals[ao - 1]
        colors[ix] = baseCol[0] * mult
        colors[ix + 1] = baseCol[1] * mult
        colors[ix + 2] = baseCol[2] * mult
        colors[ix + 3] = 1
    }

}








/*
 *
 *
 *
 *
 *          SHARED HELPERS - used by both main classes
 *
 *
 *
 *
 *
*/




/**
 *
 *
 *
 *  packAOMask:
 *
 *    For a given face, find occlusion levels for each vertex, then
 *    pack 4 such (2-bit) values into one Uint8 value
 * 
 *  Occlusion levels:
 *    1 is flat ground, 2 is partial occlusion, 3 is max (corners)
 *    0 is "reverse occlusion" - an unoccluded exposed edge 
 *  Packing order var(bit offset):
 * 
 *      B(2)  -  C(6)   ^  K
 *       -        -     +> J
 *      A(0)  -  D(4)
 * 
*/

function packAOMask(isSolid, ipos, ineg, j, k, skipReverse = false) {
    var A = 1
    var B = 1
    var D = 1
    var C = 1

    // inc occlusion of vertex next to obstructed side
    if (isSolid(ipos, j + 1, k)) { ++D; ++C }
    if (isSolid(ipos, j - 1, k)) { ++A; ++B }
    if (isSolid(ipos, j, k + 1)) { ++B; ++C }
    if (isSolid(ipos, j, k - 1)) { ++A; ++D }

    // facing into a solid (non-opaque) block?
    var facingSolid = isSolid(ipos, j, k)
    if (facingSolid) {
        // always 2, or 3 in corners
        C = (C === 3 || isSolid(ipos, j + 1, k + 1)) ? 3 : 2
        B = (B === 3 || isSolid(ipos, j - 1, k + 1)) ? 3 : 2
        D = (D === 3 || isSolid(ipos, j + 1, k - 1)) ? 3 : 2
        A = (A === 3 || isSolid(ipos, j - 1, k - 1)) ? 3 : 2
        return C << 6 | D << 4 | B << 2 | A
    }

    // simpler logic if skipping reverse AO?
    if (skipReverse) {
        // treat corner as occlusion 3 only if not occluded already
        if (C === 1 && (isSolid(ipos, j + 1, k + 1))) { C = 2 }
        if (B === 1 && (isSolid(ipos, j - 1, k + 1))) { B = 2 }
        if (D === 1 && (isSolid(ipos, j + 1, k - 1))) { D = 2 }
        if (A === 1 && (isSolid(ipos, j - 1, k - 1))) { A = 2 }
        return C << 6 | D << 4 | B << 2 | A
    }

    // check each corner, and if not present do reverse AO
    if (C === 1) {
        if (isSolid(ipos, j + 1, k + 1)) {
            C = 2
        } else if (!(isSolid(ineg, j, k + 1)) ||
            !(isSolid(ineg, j + 1, k)) ||
            !(isSolid(ineg, j + 1, k + 1))) {
            C = 0
        }
    }

    if (D === 1) {
        if (isSolid(ipos, j + 1, k - 1)) {
            D = 2
        } else if (!(isSolid(ineg, j, k - 1)) ||
            !(isSolid(ineg, j + 1, k)) ||
            !(isSolid(ineg, j + 1, k - 1))) {
            D = 0
        }
    }

    if (B === 1) {
        if (isSolid(ipos, j - 1, k + 1)) {
            B = 2
        } else if (!(isSolid(ineg, j, k + 1)) ||
            !(isSolid(ineg, j - 1, k)) ||
            !(isSolid(ineg, j - 1, k + 1))) {
            B = 0
        }
    }

    if (A === 1) {
        if (isSolid(ipos, j - 1, k - 1)) {
            A = 2
        } else if (!(isSolid(ineg, j, k - 1)) ||
            !(isSolid(ineg, j - 1, k)) ||
            !(isSolid(ineg, j - 1, k - 1))) {
            A = 0
        }
    }

    return C << 6 | D << 4 | B << 2 | A
}

/**
 * 
 *      Takes in a packed AO value representing a face,
 *      and returns four 2-bit numbers for the AO levels
 *      at the four corners.
 *      
*/
function unpackAOMask(aomask) {
    var A = aomask & 3
    var B = (aomask >> 2) & 3
    var D = (aomask >> 4) & 3
    var C = (aomask >> 6) & 3
    return [A, B, C, D]
}








var profile_hook = (PROFILE_EVERY) ?
    makeProfileHook(PROFILE_EVERY, 'Meshing') : () => { }
````

## File: src/engine/lib/util.js
````javascript
// helper to swap item to end and pop(), instead of splice()ing
export function removeUnorderedListItem(list, item) {
    var i = list.indexOf(item)
    if (i < 0) return
    if (i === list.length - 1) {
        list.pop()
    } else {
        list[i] = list.pop()
    }
}







// ....
export function numberOfVoxelsInSphere(rad) {
    if (rad === prevRad) return prevAnswer
    var ext = Math.ceil(rad), ct = 0, rsq = rad * rad
    for (var i = -ext; i <= ext; ++i) {
        for (var j = -ext; j <= ext; ++j) {
            for (var k = -ext; k <= ext; ++k) {
                var dsq = i * i + j * j + k * k
                if (dsq < rsq) ct++
            }
        }
    }
    prevRad = rad
    prevAnswer = ct
    return ct
}
var prevRad = 0, prevAnswer = 0





// partly "unrolled" loops to copy contents of ndarrays
// when there's no source, zeroes out the array instead
export function copyNdarrayContents(src, tgt, pos, size, tgtPos) {
    if (typeof src === 'number') {
        doNdarrayFill(src, tgt, tgtPos[0], tgtPos[1], tgtPos[2],
            size[0], size[1], size[2])
    } else {
        doNdarrayCopy(src, tgt, pos[0], pos[1], pos[2],
            size[0], size[1], size[2], tgtPos[0], tgtPos[1], tgtPos[2])
    }
}
function doNdarrayCopy(src, tgt, i0, j0, k0, si, sj, sk, ti, tj, tk) {
    var sdx = src.stride[2]
    var tdx = tgt.stride[2]
    for (var i = 0; i < si; i++) {
        for (var j = 0; j < sj; j++) {
            var six = src.index(i0 + i, j0 + j, k0)
            var tix = tgt.index(ti + i, tj + j, tk)
            for (var k = 0; k < sk; k++) {
                tgt.data[tix] = src.data[six]
                six += sdx
                tix += tdx
            }
        }
    }
}

function doNdarrayFill(value, tgt, i0, j0, k0, si, sj, sk) {
    var dx = tgt.stride[2]
    for (var i = 0; i < si; i++) {
        for (var j = 0; j < sj; j++) {
            var ix = tgt.index(i0 + i, j0 + j, k0)
            for (var k = 0; k < sk; k++) {
                tgt.data[ix] = value
                ix += dx
            }
        }
    }
}




// iterates over 3D positions a given manhattan distance from (0,0,0)
// and exit early if the callback returns true
// skips locations beyond a horiz or vertical max distance
export function iterateOverShellAtDistance(d, xmax, ymax, cb) {
    if (d === 0) return cb(0, 0, 0)
    // larger top/bottom planes of current shell
    var dx = Math.min(d, xmax)
    var dy = Math.min(d, ymax)
    if (d <= ymax) {
        for (var x = -dx; x <= dx; x++) {
            for (var z = -dx; z <= dx; z++) {
                if (cb(x, d, z)) return true
                if (cb(x, -d, z)) return true
            }
        }
    }
    // smaller side planes of shell
    if (d <= xmax) {
        for (var i = -d; i < d; i++) {
            for (var y = -dy + 1; y < dy; y++) {
                if (cb(i, y, d)) return true
                if (cb(-i, y, -d)) return true
                if (cb(d, y, -i)) return true
                if (cb(-d, y, i)) return true
            }
        }
    }
    return false
}






// function to hash three indexes (i,j,k) into one integer
// note that hash wraps around every 1024 indexes.
//      i.e.:   hash(1, 1, 1) === hash(1025, 1, -1023)
export function locationHasher(i, j, k) {
    return (i & 1023)
        | ((j & 1023) << 10)
        | ((k & 1023) << 20)
}



/*
 * 
 *      chunkStorage - a Map-backed abstraction for storing/
 *      retrieving chunk objects by their location indexes
 * 
*/

/** @internal */
export class ChunkStorage {
    constructor() {
        this.hash = {}
    }

    /** @returns {import('./chunk').Chunk} */
    getChunkByIndexes(i = 0, j = 0, k = 0) {
        return this.hash[locationHasher(i, j, k)] || null
    }
    /** @param {import('./chunk').Chunk} chunk */
    storeChunkByIndexes(i = 0, j = 0, k = 0, chunk) {
        this.hash[locationHasher(i, j, k)] = chunk
    }
    removeChunkByIndexes(i = 0, j = 0, k = 0) {
        delete this.hash[locationHasher(i, j, k)]
    }
}






/*
 * 
 *      LocationQueue - simple array of [i,j,k] locations, 
 *      backed by a hash for O(1) existence checks.
 *      removals by value are O(n).
 * 
*/

/** @internal */
export class LocationQueue {
    constructor() {
        this.arr = []
        this.hash = {}
    }
    forEach(cb, thisArg) {
        this.arr.forEach(cb, thisArg)
    }
    includes(i, j, k) {
        var id = locationHasher(i, j, k)
        return !!this.hash[id]
    }
    add(i, j, k, toFront = false) {
        var id = locationHasher(i, j, k)
        if (this.hash[id]) return
        if (toFront) {
            this.arr.unshift([i, j, k, id])
        } else {
            this.arr.push([i, j, k, id])
        }
        this.hash[id] = true
    }
    removeByIndex(ix) {
        var el = this.arr[ix]
        delete this.hash[el[3]]
        this.arr.splice(ix, 1)
    }
    remove(i, j, k) {
        var id = locationHasher(i, j, k)
        if (!this.hash[id]) return
        delete this.hash[id]
        for (var ix = 0; ix < this.arr.length; ix++) {
            if (id === this.arr[ix][3]) {
                this.arr.splice(ix, 1)
                return
            }
        }
        throw 'internal bug with location queue - hash value overlapped'
    }
    count() { return this.arr.length }
    isEmpty() { return (this.arr.length === 0) }
    empty() {
        this.arr = []
        this.hash = {}
    }
    pop() {
        var el = this.arr.pop()
        delete this.hash[el[3]]
        return el
    }
    copyFrom(queue) {
        this.arr = queue.arr.slice()
        this.hash = {}
        for (var key in queue.hash) this.hash[key] = true
    }
    sortByDistance(locToDist, reverse = false) {
        sortLocationArrByDistance(this.arr, locToDist, reverse)
    }
}

// internal helper for preceding class
function sortLocationArrByDistance(arr, distFn, reverse) {
    var hash = {}
    for (var loc of arr) {
        hash[loc[3]] = distFn(loc[0], loc[1], loc[2])
    }
    if (reverse) {
        arr.sort((a, b) => hash[a[3]] - hash[b[3]]) // ascending
    } else {
        arr.sort((a, b) => hash[b[3]] - hash[a[3]]) // descending
    }
    hash = null
}











// simple thing for reporting time split up between several activities
export function makeProfileHook(every, title = '', filter) {
    if (!(every > 0)) return () => { }
    var times = {}
    var started = 0, last = 0, iter = 0, total = 0

    var start = () => {
        started = last = performance.now()
        iter++
    }
    var add = (name) => {
        var t = performance.now()
        times[name] = (times[name] || 0) + (t - last)
        last = t
    }
    var report = () => {
        total += performance.now() - started
        if (iter < every) return
        var out = `${title}: ${(total / every).toFixed(2)}ms  --  `
        out += Object.keys(times).map(name => {
            if (filter && (times[name] / total) < 0.05) return ''
            return `${name}: ${(times[name] / iter).toFixed(2)}ms`
        }).join('  ')
        console.log(out + `    (avg over ${every} runs)`)
        times = {}
        iter = total = 0
    }
    return (state) => {
        if (state === 'start') start()
        else if (state === 'end') report()
        else add(state)
    }
}




// simple thing for reporting time actions/sec
export function makeThroughputHook(_every, _title, filter) {
    var title = _title || ''
    var every = _every || 1
    var counts = {}
    var started = performance.now()
    var iter = 0
    return function profile_hook(state) {
        if (state === 'start') return
        if (state === 'end') {
            if (++iter < every) return
            var t = performance.now()
            console.log(title + '   ' + Object.keys(counts).map(k => {
                var through = counts[k] / (t - started) * 1000
                counts[k] = 0
                return k + ':' + through.toFixed(2) + '   '
            }).join(''))
            started = t
            iter = 0
        } else {
            if (!counts[state]) counts[state] = 0
            counts[state]++
        }
    }
}
````

## File: src/engine/lib/world.js
````javascript
import EventEmitter from 'events'
import { Chunk } from './chunk'
import { LocationQueue, ChunkStorage, locationHasher } from './util'

var PROFILE_EVERY = 0               // ticks
var PROFILE_QUEUES_EVERY = 0        // ticks






var defaultOptions = {
    chunkSize: 24,
    chunkAddDistance: [2, 2],           // [horizontal, vertical]
    chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
    worldGenWhilePaused: false,
    manuallyControlChunkLoading: false,
}

/**
 * `noa.world` - manages world data, chunks, voxels.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * var defaultOptions = {
 *   chunkSize: 24,
 *   chunkAddDistance: [2, 2],           // [horizontal, vertical]
 *   chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
 *   worldGenWhilePaused: false,
 *   manuallyControlChunkLoading: false,
 * }
 * ```
 * 
 * **Events:**
 *  + `worldDataNeeded = (requestID, dataArr, x, y, z, worldName)`  
 *    Alerts client that a new chunk of world data is needed.
 *  + `playerEnteredChunk => (i, j, k)`    
 *    Fires when player enters a new chunk
 *  + `chunkAdded => (chunk)`  
 *    Fires after a new chunk object is added to the world
 *  + `chunkBeingRemoved = (requestID, dataArr, userData)`  
 *    Fires before a chunk is removed from world
*/
export class World extends EventEmitter {

    /** @internal */
    constructor(noa, opts) {
        super()
        opts = Object.assign({}, defaultOptions, opts)
        /** @internal */
        this.noa = noa

        /** @internal */
        this.playerChunkLoaded = false

        /** @internal */
        this.Chunk = Chunk // expose this class for ...reasons

        /**
         * Game clients should set this if they need to manually control 
         * which chunks to load and unload. When set, client should call 
         * `noa.world.manuallyLoadChunk` / `manuallyUnloadChunk` as needed.
         */
        this.manuallyControlChunkLoading = !!opts.manuallyControlChunkLoading

        /**
         * Defining this function sets a custom order in which to create chunks.
         * The function should look like:
         * ```js
         *   (i, j, k) => 1 // return a smaller number for chunks to process first
         * ```
         */
        this.chunkSortingDistFn = defaultSortDistance

        /**
         * Set this higher to cause chunks not to mesh until they have some neighbors.
         * Max legal value is 26 (each chunk will mesh only when all neighbors are present)
         */
        this.minNeighborsToMesh = 6

        /** When true, worldgen queues will keep running if engine is paused. */
        this.worldGenWhilePaused = !!opts.worldGenWhilePaused

        /** Limit the size of internal chunk processing queues 
         * @type {number} 
        */
        this.maxChunksPendingCreation = 50

        /** Limit the size of internal chunk processing queues 
         * @type {number} 
        */
        this.maxChunksPendingMeshing = 50

        /** Cutoff (in ms) of time spent each **tick** 
         * @type {number}
        */
        this.maxProcessingPerTick = 5

        /** Cutoff (in ms) of time spent each **render** 
         * @type {number}
        */
        this.maxProcessingPerRender = 3


        // set up internal state


        /** @internal */
        this._chunkSize = opts.chunkSize
        /** @internal */
        this._chunkAddDistance = [2, 2]
        /** @internal */
        this._chunkRemoveDistance = [3, 3]
        /** @internal */
        this._addDistanceFn = null
        /** @internal */
        this._remDistanceFn = null
        /** @internal */
        this._prevWorldName = ''
        /** @internal */
        this._prevPlayerChunkHash = 0
        /** @internal */
        this._chunkAddSearchFrom = 0
        /** @internal */
        this._prevSortingFn = null
        /** @internal */
        this._sortMeshQueueEvery = 0


        // Init internal chunk queues:

        /** @internal All chunks existing in any queue */
        this._chunksKnown = new LocationQueue()

        /** @internal in range but not yet requested from client */
        this._chunksToRequest = new LocationQueue()
        /** @internal known to have invalid data (wrong world, eg) */
        this._chunksInvalidated = new LocationQueue()
        /** @internal out of range, and waiting to be removed */
        this._chunksToRemove = new LocationQueue()

        /** @internal requested, awaiting data event from client */
        this._chunksPending = new LocationQueue()
        /** @internal has data, waiting to be (re-)meshed */
        this._chunksToMesh = new LocationQueue()
        /** @internal priority queue for chunks to re-mesh */
        this._chunksToMeshFirst = new LocationQueue()

        /** 
         * @internal A queue of chunk locations, rather than chunk references.
         * Has only the positive 1/16 quadrant, sorted (reverse order!) */
        this._chunksSortedLocs = new LocationQueue()

        // validate add/remove sizes through a setter that clients can use later
        this.setAddRemoveDistance(opts.chunkAddDistance, opts.chunkRemoveDistance)

        // chunks stored in a data structure for quick lookup
        // note that the hash wraps around every 1024 chunk indexes!!
        // i.e. two chunks that far apart can't be loaded at the same time
        /** @internal */
        this._storage = new ChunkStorage()

        // coordinate converter functions - default versions first:
        var cs = this._chunkSize
        /** @internal */
        this._coordsToChunkIndexes = chunkCoordsToIndexesGeneral
        /** @internal */
        this._coordsToChunkLocals = chunkCoordsToLocalsGeneral

        // when chunk size is a power of two, override with bit-twiddling:
        var powerOfTwo = ((cs & cs - 1) === 0)
        if (powerOfTwo) {
            /** @internal */
            this._coordShiftBits = Math.log2(cs) | 0
            /** @internal */
            this._coordMask = (cs - 1) | 0
            this._coordsToChunkIndexes = chunkCoordsToIndexesPowerOfTwo
            this._coordsToChunkLocals = chunkCoordsToLocalsPowerOfTwo
        }
    }
}





/*
 *
 *
 *
 *
 *                  PUBLIC API 
 *
 *
 *
 *
*/

World.prototype.getBlockID = function (x = 0, y = 0, z = 0) {
    var [ci, cj, ck] = this._coordsToChunkIndexes(x, y, z)
    var chunk = this._storage.getChunkByIndexes(ci, cj, ck)
    if (!chunk) return 0
    var [i, j, k] = this._coordsToChunkLocals(x, y, z)
    return chunk.voxels.get(i, j, k)
}

World.prototype.getBlockSolidity = function (x = 0, y = 0, z = 0) {
    var [ci, cj, ck] = this._coordsToChunkIndexes(x, y, z)
    var chunk = this._storage.getChunkByIndexes(ci, cj, ck)
    if (!chunk) return false
    var [i, j, k] = this._coordsToChunkLocals(x, y, z)
    return !!chunk.getSolidityAt(i, j, k)
}

World.prototype.getBlockOpacity = function (x = 0, y = 0, z = 0) {
    var id = this.getBlockID(x, y, z)
    return this.noa.registry.getBlockOpacity(id)
}

World.prototype.getBlockFluidity = function (x = 0, y = 0, z = 0) {
    var id = this.getBlockID(x, y, z)
    return this.noa.registry.getBlockFluidity(id)
}

World.prototype.getBlockProperties = function (x = 0, y = 0, z = 0) {
    var id = this.getBlockID(x, y, z)
    return this.noa.registry.getBlockProps(id)
}


World.prototype.setBlockID = function (id = 0, x = 0, y = 0, z = 0) {
    var [ci, cj, ck] = this._coordsToChunkIndexes(x, y, z)
    var chunk = this._storage.getChunkByIndexes(ci, cj, ck)
    if (!chunk) return
    var [i, j, k] = this._coordsToChunkLocals(x, y, z)
    return chunk.set(i, j, k, id)
}


/** @param box */
World.prototype.isBoxUnobstructed = function (box) {
    var base = box.base
    var max = box.max
    for (var i = Math.floor(base[0]); i < max[0] + 1; i++) {
        for (var j = Math.floor(base[1]); j < max[1] + 1; j++) {
            for (var k = Math.floor(base[2]); k < max[2] + 1; k++) {
                if (this.getBlockSolidity(i, j, k)) return false
            }
        }
    }
    return true
}


/** 
 * Clients should call this after creating a chunk's worth of data (as an ndarray)  
 * If userData is passed in it will be attached to the chunk
 * @param {string} id - the string specified when the chunk was requested 
 * @param {*} array - an ndarray of voxel data
 * @param {*} userData - an arbitrary value for game client use
 * @param {number} fillVoxelID - specify a voxel ID here if you want to signify that 
 * the entire chunk should be solidly filled with that voxel (e.g. `0` for air). 
 * If you do this, the voxel array data will be overwritten and the engine will 
 * take a fast path through some initialization steps.
 */
World.prototype.setChunkData = function (id, array, userData = null, fillVoxelID = -1) {
    setChunkData(this, id, array, userData, fillVoxelID)
}



/** 
 * Sets the distances within which to load new chunks, and beyond which 
 * to unload them. Generally you want the remove distance to be somewhat
 * farther, so that moving back and forth across the same chunk border doesn't
 * keep loading/unloading the same distant chunks.
 * 
 * Both arguments can be numbers (number of voxels), or arrays like:
 * `[horiz, vert]` specifying different horizontal and vertical distances.
 * @param {number | number[]} addDist
 * @param {number | number[]} remDist
 */
World.prototype.setAddRemoveDistance = function (addDist = 2, remDist = 3) {
    var addArr = Array.isArray(addDist) ? addDist : [addDist, addDist]
    var remArr = Array.isArray(remDist) ? remDist : [remDist, remDist]
    var minGap = 1
    if (remArr[0] < addArr[0] + minGap) remArr[0] = addArr[0] + minGap
    if (remArr[1] < addArr[1] + minGap) remArr[1] = addArr[1] + minGap
    this._chunkAddDistance = addArr
    this._chunkRemoveDistance = remArr
    // rebuild chunk distance functions and add search locations
    this._addDistanceFn = makeDistanceTestFunction(addArr[0], addArr[1])
    this._remDistanceFn = makeDistanceTestFunction(remArr[0], remArr[1])
    this._chunksSortedLocs.empty()
    // this queue holds only 1/16th the search space: i=0..max, j=0..i, k=0..max
    for (var i = 0; i <= addArr[0]; i++) {
        for (var k = 0; k <= i; k++) {
            for (var j = 0; j <= addArr[1]; j++) {
                if (!this._addDistanceFn(i, j, k)) continue
                this._chunksSortedLocs.add(i, j, k)
            }
        }
    }
    // resets state of nearby chunk search
    this._prevSortingFn = null
    this._chunkAddSearchFrom = 0
}






/** 
 * Tells noa to discard voxel data within a given `AABB` (e.g. because 
 * the game client received updated data from a server). 
 * The engine will mark all affected chunks for removal, and will later emit 
 * new `worldDataNeeded` events (if the chunk is still in draw range).
 */
World.prototype.invalidateVoxelsInAABB = function (box) {
    invalidateChunksInBox(this, box)
}


/** When manually controlling chunk loading, tells the engine that the 
 * chunk containing the specified (x,y,z) needs to be created and loaded.
 * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
 * @param x, y, z
 */
World.prototype.manuallyLoadChunk = function (x = 0, y = 0, z = 0) {
    if (!this.manuallyControlChunkLoading) throw manualErr
    var [i, j, k] = this._coordsToChunkIndexes(x, y, z)
    this._chunksKnown.add(i, j, k)
    this._chunksToRequest.add(i, j, k)
}

/** When manually controlling chunk loading, tells the engine that the 
 * chunk containing the specified (x,y,z) needs to be unloaded and disposed.
 * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
 * @param x, y, z
 */
World.prototype.manuallyUnloadChunk = function (x = 0, y = 0, z = 0) {
    if (!this.manuallyControlChunkLoading) throw manualErr
    var [i, j, k] = this._coordsToChunkIndexes(x, y, z)
    this._chunksToRemove.add(i, j, k)
    this._chunksToMesh.remove(i, j, k)
    this._chunksToRequest.remove(i, j, k)
    this._chunksToMeshFirst.remove(i, j, k)
}
var manualErr = 'Set `noa.world.manuallyControlChunkLoading` if you need this API'




/*
 * 
 * 
 * 
 *                  internals:
 * 
 *          tick functions that process queues and trigger events
 * 
 * 
 * 
*/

/** @internal */
World.prototype.tick = function () {
    var tickStartTime = performance.now()

    // get indexes of player's current chunk, and has it changed since last tick?
    var [ci, cj, ck] = getPlayerChunkIndexes(this)
    var chunkLocHash = locationHasher(ci, cj, ck)
    var changedChunks = (chunkLocHash !== this._prevPlayerChunkHash)
    if (changedChunks) {
        this.emit('playerEnteredChunk', ci, cj, ck)
        this._prevPlayerChunkHash = chunkLocHash
        this._chunkAddSearchFrom = 0
    }

    // if world has changed, invalidate everything and ping
    // removals queue so that player's chunk gets loaded back quickly
    if (this._prevWorldName !== this.noa.worldName) {
        if (!this.manuallyControlChunkLoading) {
            markAllChunksInvalid(this)
            this._chunkAddSearchFrom = 0
            processRemoveQueue(this)
        }
        this._prevWorldName = this.noa.worldName
    }

    profile_hook('start')
    profile_queues_hook('start')

    // scan for chunks to add/remove (unless client handles manually)
    if (!this.manuallyControlChunkLoading) {
        findDistantChunksToRemove(this, ci, cj, ck)
        profile_hook('remQueue')
        findChunksToRequest(this, ci, cj, ck)
        profile_hook('addQueue')
    }

    // possibly scan for additions to meshing queue if it's empty
    findChunksToMesh(this)

    // process (create or mesh) some chunks, up to max iteration time
    var t = performance.now()
    var t1 = tickStartTime + (this.maxProcessingPerTick || 0)
    if (t < t1) t1 = t + 1
    var done1 = false
    var done2 = false
    var done3 = false
    while (t < t1) {
        if (!done1) {
            done1 = processRemoveQueue(this)
                || processRemoveQueue(this)
            profile_hook('removes')
        }
        if (!done2) {
            done2 = processRequestQueue(this)
            profile_hook('requests')
        }
        if (!done3) {
            done3 = processMeshingQueue(this, false)
            profile_hook('meshes')
        }
        if (done1 && done2 && done3) break
        t = performance.now()
    }

    // track whether the player's local chunk is loaded and ready or not
    var pChunk = this._storage.getChunkByIndexes(ci, cj, ck)
    this.playerChunkLoaded = !!pChunk

    profile_queues_hook('end', this)
    profile_hook('end')
}


/** @internal */
World.prototype.render = function () {
    // on render, quickly process the high-priority meshing queue
    // to help avoid flashes of background while neighboring chunks update
    var t = performance.now()
    var t1 = t + this.maxProcessingPerRender
    while (t < t1) {
        var done = processMeshingQueue(this, true)
        if (done) break
        t = performance.now()
    }
}


/** @internal */
World.prototype._getChunkByCoords = function (x = 0, y = 0, z = 0) {
    // let internal modules request a chunk object
    var [i, j, k] = this._coordsToChunkIndexes(x, y, z)
    return this._storage.getChunkByIndexes(i, j, k)
}










/*
 * 
 * 
 * 
 *              chunk queues and queue processing
 * 
 * 
 * 
*/

// internal accessor for chunks to queue themeselves for remeshing 
// after their data changes
World.prototype._queueChunkForRemesh = function (chunk) {
    possiblyQueueChunkForMeshing(this, chunk)
}



/** 
 * helper - chunk indexes of where the player is
 * @param {World} world 
*/
function getPlayerChunkIndexes(world) {
    var [x, y, z] = world.noa.entities.getPosition(world.noa.playerEntity)
    return world._coordsToChunkIndexes(x, y, z)
}




/** 
 * Gradually scan neighborhood chunk locs; add missing ones to "toRequest".
 * @param {World} world 
*/
function findChunksToRequest(world, ci, cj, ck) {
    var toRequest = world._chunksToRequest
    var numQueued = toRequest.count()
    var maxQueued = 50
    if (numQueued >= maxQueued) return

    // handle changes to chunk sorting function
    var sortDistFn = world.chunkSortingDistFn || defaultSortDistance
    if (sortDistFn !== world._prevSortingFn) {
        sortQueueByDistanceFrom(world, world._chunksSortedLocs, 0, 0, 0, true)
        world._prevSortingFn = sortDistFn
    }

    // consume the pre-sorted positions array, checking each loc and 
    // its reflections for locations that need to be added to request queue
    var locsArr = world._chunksSortedLocs.arr
    var ix = world._chunkAddSearchFrom
    var maxIter = Math.min(20, locsArr.length / 10)
    for (var ct = 0; ct < maxIter; ct++) {
        var [di, dj, dk] = locsArr[ix++ % locsArr.length]
        checkReflectedLocations(world, ci, cj, ck, di, dj, dk)
        if (toRequest.count() >= maxQueued) break
    }

    // only advance start point if nothing is invalidated, 
    // so that nearyby chunks stay at high priority in that case
    if (world._chunksInvalidated.isEmpty()) {
        world._chunkAddSearchFrom = ix % locsArr.length
    }

    // queue should be mostly sorted, but may not have been empty
    sortQueueByDistanceFrom(world, toRequest, ci, cj, ck, false)
}

// Helpers for checking whether to add a location, and reflections of it
var checkReflectedLocations = (world, ci, cj, ck, i, j, k) => {
    checkOneLocation(world, ci + i, cj + j, ck + k)
    if (i !== k) checkOneLocation(world, ci + k, cj + j, ck + i)
    if (i > 0) checkReflectedLocations(world, ci, cj, ck, -i, j, k)
    if (j > 0) checkReflectedLocations(world, ci, cj, ck, i, -j, k)
    if (k > 0) checkReflectedLocations(world, ci, cj, ck, i, j, -k)
}
// finally, the logic for each reflected location checked
var checkOneLocation = (world, i, j, k) => {
    if (world._chunksKnown.includes(i, j, k)) return
    world._chunksKnown.add(i, j, k)
    world._chunksToRequest.add(i, j, k, true)
}





/** 
 * Incrementally scan known chunks for any that are no longer in range.
 * Assume that the order they're removed in isn't very important.
 * @param {World} world 
*/
function findDistantChunksToRemove(world, ci, cj, ck) {
    var distCheck = world._remDistanceFn
    var toRemove = world._chunksToRemove
    var numQueued = toRemove.count() + world._chunksInvalidated.count()
    var maxQueued = 50
    if (numQueued >= maxQueued) return

    var knownArr = world._chunksKnown.arr
    if (knownArr.length === 0) return
    var maxIter = Math.min(100, knownArr.length / 10)
    var found = false
    for (var ct = 0; ct < maxIter; ct++) {
        var [i, j, k] = knownArr[removeCheckIndex++ % knownArr.length]
        if (toRemove.includes(i, j, k)) continue
        if (distCheck(i - ci, j - cj, k - ck)) continue
        // flag chunk for removal and remove it from work queues
        world._chunksToRemove.add(i, j, k)
        world._chunksToRequest.remove(i, j, k)
        world._chunksToMesh.remove(i, j, k)
        world._chunksToMeshFirst.remove(i, j, k)
        found = true
        numQueued++
        if (numQueued > maxQueued) break
    }
    removeCheckIndex = removeCheckIndex % knownArr.length
    if (found) sortQueueByDistanceFrom(world, toRemove, ci, cj, ck)
}
var removeCheckIndex = 0


/** 
 * Incrementally look for chunks that could be re-meshed
 * @param {World} world 
*/
function findChunksToMesh(world) {
    var maxQueued = 10
    var numQueued = world._chunksToMesh.count() + world._chunksToMeshFirst.count()
    if (numQueued > maxQueued) return
    var knownArr = world._chunksKnown.arr
    var maxIter = Math.min(50, knownArr.length / 10)
    for (var ct = 0; ct < maxIter; ct++) {
        var [i, j, k] = knownArr[meshCheckIndex++ % knownArr.length]
        var chunk = world._storage.getChunkByIndexes(i, j, k)
        if (!chunk) continue
        var res = possiblyQueueChunkForMeshing(world, chunk)
        if (res) numQueued++
        if (numQueued > maxQueued) break
    }
    meshCheckIndex %= knownArr.length
}
var meshCheckIndex = 0






/** 
 * invalidate chunks overlapping the given AABB
 * @param {World} world 
*/
function invalidateChunksInBox(world, box) {
    var min = world._coordsToChunkIndexes(box.base[0], box.base[1], box.base[2])
    var max = world._coordsToChunkIndexes(box.max[0], box.max[1], box.max[2])
    for (var i = 0; i < 3; i++) {
        if (!Number.isFinite(box.base[i])) min[i] = box.base[i]
        if (!Number.isFinite(box.max[i])) max[i] = box.max[i]
    }
    world._chunksKnown.forEach(loc => {
        var [i, j, k] = loc
        if (i < min[0] || i >= max[0]) return
        if (j < min[1] || j >= max[1]) return
        if (k < min[2] || k >= max[2]) return
        world._chunksInvalidated.add(i, j, k)
        world._chunksToRemove.remove(i, j, k)
        world._chunksToRequest.remove(i, j, k)
        world._chunksToMesh.remove(i, j, k)
        world._chunksToMeshFirst.remove(i, j, k)
    })
}



/** 
 * when current world changes - empty work queues and mark all for removal
 * @param {World} world 
*/
function markAllChunksInvalid(world) {
    world._chunksInvalidated.copyFrom(world._chunksKnown)
    world._chunksToRemove.empty()
    world._chunksToRequest.empty()
    world._chunksToMesh.empty()
    world._chunksToMeshFirst.empty()
    sortQueueByDistanceFrom(world, world._chunksInvalidated)
}








/** 
 * Run through chunk tracking queues looking for work to do next
 * @param {World} world 
*/
function processRequestQueue(world) {
    var toRequest = world._chunksToRequest
    if (toRequest.isEmpty()) return true
    // skip if too many outstanding requests, or if meshing queue is full
    var pending = world._chunksPending.count()
    var toMesh = world._chunksToMesh.count()
    if (pending >= world.maxChunksPendingCreation) return true
    if (toMesh >= world.maxChunksPendingMeshing) return true
    var [i, j, k] = toRequest.pop()
    requestNewChunk(world, i, j, k)
    return toRequest.isEmpty()
}


/** @param {World} world */
function processRemoveQueue(world) {
    var queue = world._chunksInvalidated
    if (queue.isEmpty()) queue = world._chunksToRemove
    if (queue.isEmpty()) return true
    var [i, j, k] = queue.pop()
    removeChunk(world, i, j, k)
    return (queue.isEmpty())
}


/** 
 * similar to above but for chunks waiting to be meshed
 * @param {World} world 
*/
function processMeshingQueue(world, firstOnly) {
    var queue = world._chunksToMeshFirst
    if (queue.isEmpty() && !firstOnly) queue = world._chunksToMesh
    if (queue.isEmpty()) return true
    var [i, j, k] = queue.pop()
    if (world._chunksToRemove.includes(i, j, k)) return
    var chunk = world._storage.getChunkByIndexes(i, j, k)
    if (chunk) doChunkRemesh(world, chunk)
}


/** @param {World} world */
function possiblyQueueChunkForMeshing(world, chunk) {
    if (!(chunk._terrainDirty || chunk._objectsDirty)) return false
    if (chunk._neighborCount < chunk.minNeighborsToMesh) return false
    if (world._chunksToMesh.includes(chunk.i, chunk.j, chunk.k)) return false
    if (world._chunksToMeshFirst.includes(chunk.i, chunk.j, chunk.k)) return false
    var queue = (chunk._neighborCount === 26) ?
        world._chunksToMeshFirst : world._chunksToMesh
    queue.add(chunk.i, chunk.j, chunk.k)
    world._sortMeshQueueEvery++
    if (world._sortMeshQueueEvery > 20) {
        sortQueueByDistanceFrom(world, queue)
        world._sortMeshQueueEvery = 0
    }
    return true
}






/*
 * 
 * 
 * 
 *              chunk lifecycle - create / set / remove / modify
 * 
 * 
 * 
*/


/** 
 * create chunk object and request voxel data from client
 * @param {World} world 
*/
function requestNewChunk(world, i, j, k) {
    var size = world._chunkSize
    var dataArr = Chunk._createVoxelArray(world._chunkSize)
    var worldName = world.noa.worldName
    var requestID = [i, j, k, worldName].join('|')
    var x = i * size
    var y = j * size
    var z = k * size
    world._chunksPending.add(i, j, k)
    world.emit('worldDataNeeded', requestID, dataArr, x, y, z, worldName)
    profile_queues_hook('request')
}

/** 
 * called when client sets a chunk's voxel data
 * If userData is passed in it will be attached to the chunk
 * @param {World} world 
*/
function setChunkData(world, reqID, array, userData, fillVoxelID) {
    var arr = reqID.split('|')
    var i = parseInt(arr.shift())
    var j = parseInt(arr.shift())
    var k = parseInt(arr.shift())
    var worldName = arr.join('|')
    world._chunksPending.remove(i, j, k)
    // discard data if it's for a world that's no longer current
    if (worldName !== world.noa.worldName) return
    // discard if chunk is no longer needed
    if (!world._chunksKnown.includes(i, j, k)) return
    if (world._chunksToRemove.includes(i, j, k)) return

    var chunk = world._storage.getChunkByIndexes(i, j, k)
    if (!chunk) {
        // if chunk doesn't exist, create and init
        var size = world._chunkSize
        chunk = new Chunk(world.noa, reqID, i, j, k, size, array, fillVoxelID)
        world._storage.storeChunkByIndexes(i, j, k, chunk)
        chunk.userData = userData
        world.noa.rendering.prepareChunkForRendering(chunk)
        world.emit('chunkAdded', chunk)
    } else {
        // else we're updating data for an existing chunk
        chunk._updateVoxelArray(array, fillVoxelID)
    }
    // chunk can now be meshed, and ping neighbors
    possiblyQueueChunkForMeshing(world, chunk)
    updateNeighborsOfChunk(world, i, j, k, chunk)

    profile_queues_hook('receive')
}



/** 
 * remove a chunk that wound up in the remove queue
 * @param {World} world 
*/
function removeChunk(world, i, j, k) {
    var chunk = world._storage.getChunkByIndexes(i, j, k)

    if (chunk) {
        world.emit('chunkBeingRemoved', chunk.requestID, chunk.voxels, chunk.userData)
        world.noa.rendering.disposeChunkForRendering(chunk)
        chunk.dispose()
        profile_queues_hook('dispose')
        updateNeighborsOfChunk(world, i, j, k, null)
    }

    world._storage.removeChunkByIndexes(i, j, k)
    world._chunksKnown.remove(i, j, k)
    world._chunksToMesh.remove(i, j, k)
    world._chunksToRemove.remove(i, j, k)
    world._chunksToMeshFirst.remove(i, j, k)
}


/** @param {World} world */
function doChunkRemesh(world, chunk) {
    world._chunksToMesh.remove(chunk.i, chunk.j, chunk.k)
    world._chunksToMeshFirst.remove(chunk.i, chunk.j, chunk.k)
    chunk.updateMeshes()
    profile_queues_hook('mesh')
}










/*
 * 
 * 
 *          two different versions of logic to convert
 *          chunk coords to chunk indexes or local scope
 * 
 * 
*/

function chunkCoordsToIndexesGeneral(x, y, z) {
    var cs = this._chunkSize
    return [Math.floor(x / cs) | 0, Math.floor(y / cs) | 0, Math.floor(z / cs) | 0]
}
function chunkCoordsToLocalsGeneral(x, y, z) {
    var cs = this._chunkSize
    var i = (x % cs) | 0; if (i < 0) i += cs
    var j = (y % cs) | 0; if (j < 0) j += cs
    var k = (z % cs) | 0; if (k < 0) k += cs
    return [i, j, k]
}
function chunkCoordsToIndexesPowerOfTwo(x, y, z) {
    var shift = this._coordShiftBits
    return [(x >> shift) | 0, (y >> shift) | 0, (z >> shift) | 0]
}
function chunkCoordsToLocalsPowerOfTwo(x, y, z) {
    var mask = this._coordMask
    return [(x & mask) | 0, (y & mask) | 0, (z & mask) | 0]
}







/*
 * 
 * 
 * 
 *          misc helpers and implementation functions
 * 
 * 
 * 
*/

/** 
 * sorts DESCENDING, unless reversed
 * @param {World} world 
*/
function sortQueueByDistanceFrom(world, queue, pi, pj, pk, reverse = false) {
    var distFn = world.chunkSortingDistFn || defaultSortDistance
    var localDist = (i, j, k) => distFn(pi - i, pj - j, pk - k)
    if (pi === undefined) {
        [pi, pj, pk] = getPlayerChunkIndexes(world)
    }
    queue.sortByDistance(localDist, reverse)
}
var defaultSortDistance = (i, j, k) => (i * i) + (j * j) + (k * k)




/** 
 * keep neighbor data updated when chunk is added or removed
 * @param {World} world 
*/
function updateNeighborsOfChunk(world, ci, cj, ck, chunk) {
    var terrainChanged = (!chunk) || (chunk && !chunk.isEmpty)
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            for (var k = -1; k <= 1; k++) {
                if ((i | j | k) === 0) continue
                var neighbor = world._storage.getChunkByIndexes(ci + i, cj + j, ck + k)
                if (!neighbor) continue
                // flag neighbor, assume terrain needs remeshing
                if (terrainChanged) neighbor._terrainDirty = true
                // update neighbor counts and references, both ways
                if (chunk && !chunk._neighbors.get(i, j, k)) {
                    chunk._neighborCount++
                    chunk._neighbors.set(i, j, k, neighbor)
                }
                var nabRef = neighbor._neighbors.get(-i, -j, -k)
                if (chunk && !nabRef) {
                    neighbor._neighborCount++
                    neighbor._neighbors.set(-i, -j, -k, chunk)
                    // immediately queue neighbor if it's surrounded
                    if (neighbor._neighborCount === 26) {
                        possiblyQueueChunkForMeshing(world, neighbor)
                    }
                }
                if (!chunk && nabRef) {
                    neighbor._neighborCount--
                    neighbor._neighbors.set(-i, -j, -k, null)
                }
            }
        }
    }
}


// make a function to check if an (i,j,k) is within a sphere/ellipse of given size
function makeDistanceTestFunction(xsize, ysize) {
    var asq = xsize * xsize
    var bsq = ysize * ysize
    // spherical case
    if (xsize === ysize) return (i, j, k) => (i * i + j * j + k * k <= asq)
    // otherwise do clipped spheres for now
    if (xsize > ysize) return (i, j, k) => {
        if (Math.abs(j) > ysize) return false
        return (i * i + j * j + k * k <= asq)
    }
    return (i, j, k) => {
        var dxsq = i * i + k * k
        if (dxsq > asq) return false
        return (dxsq + j * j <= bsq)
    }
}










/*
 * 
 * 
 * 
 * 
 *                  debugging
 * 
 * 
 * 
 * 
*/

/** @internal */
World.prototype.report = function () {
    console.log('World report - playerChunkLoaded: ', this.playerChunkLoaded)
    _report(this, '  known:     ', this._chunksKnown.arr, true)
    _report(this, '  to request:', this._chunksToRequest.arr, 0)
    _report(this, '  to remove: ', this._chunksToRemove.arr, 0)
    _report(this, '  invalid:   ', this._chunksInvalidated.arr, 0)
    _report(this, '  creating:  ', this._chunksPending.arr, 0)
    _report(this, '  to mesh:   ', this._chunksToMesh.arr, 0)
    _report(this, '  mesh 1st:  ', this._chunksToMeshFirst.arr, 0)
}

function _report(world, name, arr, ext) {
    var full = 0,
        empty = 0,
        exist = 0,
        surrounded = 0,
        remeshes = []
    arr.forEach(loc => {
        var chunk = world._storage.getChunkByIndexes(loc[0], loc[1], loc[2])
        if (!chunk) return
        exist++
        remeshes.push(chunk._timesMeshed)
        if (chunk._isFull) full++
        if (chunk._isEmpty) empty++
        if (chunk._neighborCount === 26) surrounded++
    })
    var out = arr.length.toString().padEnd(8)
    out += ('exist: ' + exist).padEnd(12)
    out += ('full: ' + full).padEnd(12)
    out += ('empty: ' + empty).padEnd(12)
    out += ('surr: ' + surrounded).padEnd(12)
    if (ext) {
        var sum = remeshes.reduce((acc, val) => acc + val, 0)
        var max = remeshes.reduce((acc, val) => Math.max(acc, val), 0)
        var min = remeshes.reduce((acc, val) => Math.min(acc, val), 0)
        out += 'times meshed: avg ' + (sum / exist).toFixed(2)
        out += '  max ' + max
        out += '  min ' + min
    }
    console.log(name, out)
}


import { makeProfileHook } from './util'
var profile_hook = makeProfileHook(PROFILE_EVERY, 'world ticks:', 1)
var profile_queues_hook = ((every) => {
    if (!(every > 0)) return () => { }
    var iter = 0
    var counts = {}
    var queues = {}
    var started = performance.now()
    return function profile_queues_hook(state, world) {
        if (state === 'start') return
        if (state !== 'end') return counts[state] = (counts[state] || 0) + 1
        queues.toreq = (queues.toreq || 0) + world._chunksToRequest.count()
        queues.toget = (queues.toget || 0) + world._chunksPending.count()
        queues.tomesh = (queues.tomesh || 0) + world._chunksToMesh.count() + world._chunksToMeshFirst.count()
        queues.tomesh1 = (queues.tomesh1 || 0) + world._chunksToMeshFirst.count()
        queues.torem = (queues.torem || 0) + world._chunksToRemove.count()
        if (++iter < every) return
        var t = performance.now(), dt = t - started
        var res = {}
        Object.keys(queues).forEach(k => {
            var num = Math.round((queues[k] || 0) / iter)
            res[k] = `[${num}]`.padStart(5)
        })
        Object.keys(counts).forEach(k => {
            var num = Math.round((counts[k] || 0) * 1000 / dt)
            res[k] = ('' + num).padStart(3)
        })
        console.log('chunk flow: ',
            `${res.toreq}-> ${res.request || 0} req/s  `,
            `${res.toget}-> ${res.receive || 0} got/s  `,
            `${(res.tomesh)}-> ${res.mesh || 0} mesh/s  `,
            `${res.torem}-> ${res.dispose || 0} rem/s  `,
            `(meshFirst: ${res.tomesh1.trim()})`,
        )
        iter = 0
        counts = {}
        queues = {}
        started = performance.now()
    }
})(PROFILE_QUEUES_EVERY)
````

## File: src/engine/types/aabb-3d/index.d.ts
````typescript
declare module "aabb-3d" {
    export = AABB;
    function AABB(pos: any, vec: any): AABB;
    class AABB {
        constructor(pos: any, vec: any);
        base: any;
        vec: any;
        max: any;
        mag: any;
    }
}
````

## File: src/engine/types/ent-comp/index.d.ts
````typescript
declare module "dataStore" {
    export = DataStore;
    class DataStore {
        list: any[];
        hash: {};
        _map: {};
        _pendingRemovals: any[];
        add(id: any, stateObject: any): void;
        remove(id: any): void;
        dispose(): void;
        flush(): void;
    }
}
declare module "ent-comp" {
    export = ECS;
    /*!
     * ent-comp: a light, *fast* Entity Component System in JS
     * @url      github.com/andyhall/ent-comp
     * @author   Andy Hall <andy@fenomas.com>
     * @license  MIT
    */
    /**
     * Constructor for a new entity-component-system manager.
     *
     * ```js
     * var ECS = require('ent-comp')
     * var ecs = new ECS()
     * ```
     * @class
     * @constructor
     * @exports ECS
     * @typicalname ecs
    */
    function ECS(): void;
    class ECS {
        /**
         * Hash of component definitions. Also aliased to `comps`.
         *
         * ```js
         * var comp = { name: 'foo' }
         * ecs.createComponent(comp)
         * ecs.components['foo'] === comp  // true
         * ecs.comps['foo']                // same
         * ```
        */
        components: {};
        comps: {};
        /** @internal */
        _storage: {};
        /** @internal */
        _systems: any[];
        /** @internal */
        _renderSystems: any[];
        /**
         * Creates a new entity id (currently just an incrementing integer).
         *
         * Optionally takes a list of component names to add to the entity (with default state data).
         *
         * ```js
         * var id1 = ecs.createEntity()
         * var id2 = ecs.createEntity([ 'some-component', 'other-component' ])
         * ```
        */
        createEntity: (compList: any) => number;
        /**
         * Deletes an entity, which in practice means removing all its components.
         *
         * ```js
         * ecs.deleteEntity(id)
         * ```
        */
        deleteEntity: (entID: any) => ECS;
        /**
         * Creates a new component from a definition object.
         * The definition must have a `name`; all other properties are optional.
         *
         * Returns the component name, to make it easy to grab when the component
         * is being `require`d from a module.
         *
         * ```js
         * var comp = {
         * 	 name: 'some-unique-string',
         * 	 state: {},
         * 	 order: 99,
         * 	 multi: false,
         * 	 onAdd:        (id, state) => { },
         * 	 onRemove:     (id, state) => { },
         * 	 system:       (dt, states) => { },
         * 	 renderSystem: (dt, states) => { },
         * }
         *
         * var name = ecs.createComponent( comp )
         * // name == 'some-unique-string'
         * ```
         *
         * Note the `multi` flag - for components where this is true, a given
         * entity can have multiple state objects for that component.
         * For multi-components, APIs that would normally return a state object
         * (like `getState`) will instead return an array of them.
        */
        createComponent: (compDefn: any) => string;
        /**
         * Deletes the component definition with the given name.
         * First removes the component from all entities that have it.
         *
         * **Note:** This API shouldn't be necessary in most real-world usage -
         * you should set up all your components during init and then leave them be.
         * But it's useful if, say, you receive an ECS from another library and
         * you need to replace its components.
         *
         * ```js
         * ecs.deleteComponent( 'some-component' )
         * ```
        */
        deleteComponent: (compName: any) => ECS;
        /**
         * Adds a component to an entity, optionally initializing the state object.
         *
         * ```js
         * ecs.createComponent({
         * 	name: 'foo',
         * 	state: { val: 1 }
         * })
         * ecs.addComponent(id1, 'foo')             // use default state
         * ecs.addComponent(id2, 'foo', { val:2 })  // pass in state data
         * ```
        */
        addComponent: (entID: any, compName: any, state: any) => ECS;
        /**
         * Checks if an entity has a component.
         *
         * ```js
         * ecs.addComponent(id, 'foo')
         * ecs.hasComponent(id, 'foo')       // true
         * ```
        */
        hasComponent: (entID: any, compName: any) => boolean;
        /**
         * Removes a component from an entity, triggering the component's
         * `onRemove` handler, and then deleting any state data.
         *
         * ```js
         * ecs.removeComponent(id, 'foo')
         * ecs.hasComponent(id, 'foo')     	 // false
         * ```
        */
        removeComponent: (entID: any, compName: any) => ECS;
        /**
         * Get the component state for a given entity.
         * It will automatically have an `__id` property for the entity id.
         *
         * ```js
         * ecs.createComponent({
         * 	name: 'foo',
         * 	state: { val: 0 }
         * })
         * ecs.addComponent(id, 'foo')
         * ecs.getState(id, 'foo').val       // 0
         * ecs.getState(id, 'foo').__id      // equals id
         * ```
        */
        getState: (entID: any, compName: any) => any;
        /**
         * Get an array of state objects for every entity with the given component.
         * Each one will have an `__id` property for the entity id it refers to.
         * Don't add or remove elements from the returned list!
         *
         * ```js
         * var arr = ecs.getStatesList('foo')
         * // returns something shaped like:
         * //   [
         * //     {__id:0, x:1},
         * //     {__id:7, x:2},
         * //   ]
         * ```
        */
        getStatesList: (compName: any) => any;
        /**
         * Makes a `getState`-like accessor bound to a given component.
         * The accessor is faster than `getState`, so you may want to create
         * an accessor for any component you'll be accessing a lot.
         *
         * ```js
         * ecs.createComponent({
         * 	name: 'size',
         * 	state: { val: 0 }
         * })
         * var getEntitySize = ecs.getStateAccessor('size')
         * // ...
         * ecs.addComponent(id, 'size', { val:123 })
         * getEntitySize(id).val      // 123
         * ```
        */
        getStateAccessor: (compName: any) => (id: any) => any;
        /**
         * Makes a `hasComponent`-like accessor function bound to a given component.
         * The accessor is much faster than `hasComponent`.
         *
         * ```js
         * ecs.createComponent({
         * 	name: 'foo',
         * })
         * var hasFoo = ecs.getComponentAccessor('foo')
         * // ...
         * ecs.addComponent(id, 'foo')
         * hasFoo(id) // true
         * ```
        */
        getComponentAccessor: (compName: any) => (id: any) => boolean;
        /**
         * Tells the ECS that a game tick has occurred, causing component
         * `system` functions to get called.
         *
         * The optional parameter simply gets passed to the system functions.
         * It's meant to be a timestep, but can be used (or not used) as you like.
         *
         * If components have an `order` property, they'll get called in that order
         * (lowest to highest). Component order defaults to `99`.
         * ```js
         * ecs.createComponent({
         * 	name: foo,
         * 	order: 1,
         * 	system: function(dt, states) {
         * 		// states is the same array you'd get from #getStatesList()
         * 		states.forEach(state => {
         * 			console.log('Entity ID: ', state.__id)
         * 		})
         * 	}
         * })
         * ecs.tick(30) // triggers log statements
         * ```
        */
        tick: (dt: any) => ECS;
        /**
         * Functions exactly like `tick`, but calls `renderSystem` functions.
         * this effectively gives you a second set of systems that are
         * called with separate timing, in case you want to
         * [tick and render in separate loops](http://gafferongames.com/game-physics/fix-your-timestep/)
         * (which you should!).
         *
         * ```js
         * ecs.createComponent({
         * 	name: foo,
         * 	order: 5,
         * 	renderSystem: function(dt, states) {
         * 		// states is the same array you'd get from #getStatesList()
         * 	}
         * })
         * ecs.render(1000/60)
         * ```
        */
        render: (dt: any) => ECS;
        /**
         * Removes one particular instance of a multi-component.
         * To avoid breaking loops, the relevant state object will get nulled
         * immediately, and spliced from the states array later when safe
         * (after the current tick/render/animationFrame).
         *
         * ```js
         * // where component 'foo' is a multi-component
         * ecs.getState(id, 'foo')   // [ state1, state2, state3 ]
         * ecs.removeMultiComponent(id, 'foo', 1)
         * ecs.getState(id, 'foo')   // [ state1, null, state3 ]
         * // one JS event loop later...
         * ecs.getState(id, 'foo')   // [ state1, state3 ]
         * ```
         */
        removeMultiComponent: (entID: any, compName: any, index: any) => ECS;
    }
}
````

## File: src/engine/types/events/index.d.ts
````typescript
declare module "events" {
    export = EventEmitter;
    function EventEmitter(): void;
    class EventEmitter {
        /** @internal */
        _events: any;
        /** @internal */
        _eventsCount: number;
        /** @internal */
        _maxListeners: number;
        setMaxListeners(n: any): EventEmitter;
        getMaxListeners(): any;
        emit(type: any, ...args: any[]): boolean;
        addListener(type: any, listener: any): any;
        on: any;
        prependListener(type: any, listener: any): any;
        once(type: any, listener: any): EventEmitter;
        prependOnceListener(type: any, listener: any): EventEmitter;
        removeListener(type: any, listener: any): EventEmitter;
        off: any;
        removeAllListeners(type: any, ...args: any[]): EventEmitter;
        listeners(type: any): any[];
        rawListeners(type: any): any[];
        listenerCount: typeof listenerCount;
        eventNames(): any;
    }
    namespace EventEmitter {
        export { EventEmitter, defaultMaxListeners, init, listenerCount, once };
    }
    function listenerCount(type: any): any;
    var defaultMaxListeners: number;
    function init(): void;
    function listenerCount(emitter: any, type: any): any;
    function once(emitter: any, name: any): Promise<any>;
}
````

## File: src/engine/types/gl-vec3/index.d.ts
````typescript
declare module "epsilon" {
    const _exports: number;
    export = _exports;
}
declare module "create" {
    export = create;
    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */
    function create(): any;
}
declare module "clone" {
    export = clone;
    /**
     * Creates a new vec3 initialized with values from an existing vector
     *
     * @param {vec3} a vector to clone
     * @returns {vec3} a new 3D vector
     */
    function clone(a: any): any;
}
declare module "fromValues" {
    export = fromValues;
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */
    function fromValues(x: number, y: number, z: number): any;
}
declare module "normalize" {
    export = normalize;
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */
    function normalize(out: any, a: any): any;
}
declare module "dot" {
    export = dot;
    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot(a: any, b: any): number;
}
declare module "angle" {
    export = angle;
    /**
     * Get the angle between two 3D vectors
     * @param {vec3} a The first operand
     * @param {vec3} b The second operand
     * @returns {Number} The angle in radians
     */
    function angle(a: any, b: any): number;
}
declare module "copy" {
    export = copy;
    /**
     * Copy the values from one vec3 to another
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the source vector
     * @returns {vec3} out
     */
    function copy(out: any, a: any): any;
}
declare module "set" {
    export = set;
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */
    function set(out: any, x: number, y: number, z: number): any;
}
declare module "equals" {
    export = equals;
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     *
     * @param {vec3} a The first vector.
     * @param {vec3} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function equals(a: any, b: any): boolean;
}
declare module "exactEquals" {
    export = exactEquals;
    /**
     * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
     *
     * @param {vec3} a The first vector.
     * @param {vec3} b The second vector.
     * @returns {Boolean} True if the vectors are equal, false otherwise.
     */
    function exactEquals(a: any, b: any): boolean;
}
declare module "add" {
    export = add;
    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function add(out: any, a: any, b: any): any;
}
declare module "subtract" {
    export = subtract;
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function subtract(out: any, a: any, b: any): any;
}
declare module "sub" {
    const _exports: typeof import("subtract");
    export = _exports;
}
declare module "multiply" {
    export = multiply;
    /**
     * Multiplies two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function multiply(out: any, a: any, b: any): any;
}
declare module "mul" {
    const _exports: typeof import("multiply");
    export = _exports;
}
declare module "divide" {
    export = divide;
    /**
     * Divides two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function divide(out: any, a: any, b: any): any;
}
declare module "div" {
    const _exports: typeof import("divide");
    export = _exports;
}
declare module "min" {
    export = min;
    /**
     * Returns the minimum of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function min(out: any, a: any, b: any): any;
}
declare module "max" {
    export = max;
    /**
     * Returns the maximum of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function max(out: any, a: any, b: any): any;
}
declare module "floor" {
    export = floor;
    /**
     * Math.floor the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to floor
     * @returns {vec3} out
     */
    function floor(out: any, a: any): any;
}
declare module "ceil" {
    export = ceil;
    /**
     * Math.ceil the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to ceil
     * @returns {vec3} out
     */
    function ceil(out: any, a: any): any;
}
declare module "round" {
    export = round;
    /**
     * Math.round the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to round
     * @returns {vec3} out
     */
    function round(out: any, a: any): any;
}
declare module "scale" {
    export = scale;
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */
    function scale(out: any, a: any, b: number): any;
}
declare module "scaleAndAdd" {
    export = scaleAndAdd;
    /**
     * Adds two vec3's after scaling the second operand by a scalar value
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} scale the amount to scale b by before adding
     * @returns {vec3} out
     */
    function scaleAndAdd(out: any, a: any, b: any, scale: number): any;
}
declare module "distance" {
    export = distance;
    /**
     * Calculates the euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} distance between a and b
     */
    function distance(a: any, b: any): number;
}
declare module "dist" {
    const _exports: typeof import("distance");
    export = _exports;
}
declare module "squaredDistance" {
    export = squaredDistance;
    /**
     * Calculates the squared euclidian distance between two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} squared distance between a and b
     */
    function squaredDistance(a: any, b: any): number;
}
declare module "sqrDist" {
    const _exports: typeof import("squaredDistance");
    export = _exports;
}
declare module "length" {
    export = length;
    /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length(a: any): number;
}
declare module "len" {
    const _exports: typeof import("length");
    export = _exports;
}
declare module "squaredLength" {
    export = squaredLength;
    /**
     * Calculates the squared length of a vec3
     *
     * @param {vec3} a vector to calculate squared length of
     * @returns {Number} squared length of a
     */
    function squaredLength(a: any): number;
}
declare module "sqrLen" {
    const _exports: typeof import("squaredLength");
    export = _exports;
}
declare module "negate" {
    export = negate;
    /**
     * Negates the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to negate
     * @returns {vec3} out
     */
    function negate(out: any, a: any): any;
}
declare module "inverse" {
    export = inverse;
    /**
     * Returns the inverse of the components of a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to invert
     * @returns {vec3} out
     */
    function inverse(out: any, a: any): any;
}
declare module "cross" {
    export = cross;
    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function cross(out: any, a: any, b: any): any;
}
declare module "lerp" {
    export = lerp;
    /**
     * Performs a linear interpolation between two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @param {Number} t interpolation amount between the two inputs
     * @returns {vec3} out
     */
    function lerp(out: any, a: any, b: any, t: number): any;
}
declare module "random" {
    export = random;
    /**
     * Generates a random vector with the given scale
     *
     * @param {vec3} out the receiving vector
     * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
     * @returns {vec3} out
     */
    function random(out: any, scale?: number): any;
}
declare module "transformMat4" {
    export = transformMat4;
    /**
     * Transforms the vec3 with a mat4.
     * 4th vector component is implicitly '1'
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m matrix to transform with
     * @returns {vec3} out
     */
    function transformMat4(out: any, a: any, m: any): any;
}
declare module "transformMat3" {
    export = transformMat3;
    /**
     * Transforms the vec3 with a mat3.
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {mat4} m the 3x3 matrix to transform with
     * @returns {vec3} out
     */
    function transformMat3(out: any, a: any, m: any): any;
}
declare module "transformQuat" {
    export = transformQuat;
    /**
     * Transforms the vec3 with a quat
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vec3} out
     */
    function transformQuat(out: any, a: any, q: any): any;
}
declare module "rotateX" {
    export = rotateX;
    /**
     * Rotate a 3D vector around the x-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
    function rotateX(out: any, a: any, b: any, c: number): any;
}
declare module "rotateY" {
    export = rotateY;
    /**
     * Rotate a 3D vector around the y-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
    function rotateY(out: any, a: any, b: any, c: number): any;
}
declare module "rotateZ" {
    export = rotateZ;
    /**
     * Rotate a 3D vector around the z-axis
     * @param {vec3} out The receiving vec3
     * @param {vec3} a The vec3 point to rotate
     * @param {vec3} b The origin of the rotation
     * @param {Number} c The angle of rotation
     * @returns {vec3} out
     */
    function rotateZ(out: any, a: any, b: any, c: number): any;
}
declare module "forEach" {
    export = forEach;
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */
    function forEach(a: any[], stride: number, offset: number, count: number, fn: Function, arg?: any): any[];
}
declare module "gl-vec3" {
    export const EPSILON: number;
    export const create: typeof import("create");
    export const clone: typeof import("clone");
    export const angle: typeof import("angle");
    export const fromValues: typeof import("fromValues");
    export const copy: typeof import("copy");
    export const set: typeof import("set");
    export const equals: typeof import("equals");
    export const exactEquals: typeof import("exactEquals");
    export const add: typeof import("add");
    export const subtract: typeof import("subtract");
    export const sub: typeof import("subtract");
    export const multiply: typeof import("multiply");
    export const mul: typeof import("multiply");
    export const divide: typeof import("divide");
    export const div: typeof import("divide");
    export const min: typeof import("min");
    export const max: typeof import("max");
    export const floor: typeof import("floor");
    export const ceil: typeof import("ceil");
    export const round: typeof import("round");
    export const scale: typeof import("scale");
    export const scaleAndAdd: typeof import("scaleAndAdd");
    export const distance: typeof import("distance");
    export const dist: typeof import("distance");
    export const squaredDistance: typeof import("squaredDistance");
    export const sqrDist: typeof import("squaredDistance");
    export const length: typeof import("length");
    export const len: typeof import("length");
    export const squaredLength: typeof import("squaredLength");
    export const sqrLen: typeof import("squaredLength");
    export const negate: typeof import("negate");
    export const inverse: typeof import("inverse");
    export const normalize: typeof import("normalize");
    export const dot: typeof import("dot");
    export const cross: typeof import("cross");
    export const lerp: typeof import("lerp");
    export const random: typeof import("random");
    export const transformMat4: typeof import("transformMat4");
    export const transformMat3: typeof import("transformMat3");
    export const transformQuat: typeof import("transformQuat");
    export const rotateX: typeof import("rotateX");
    export const rotateY: typeof import("rotateY");
    export const rotateZ: typeof import("rotateZ");
    export const forEach: typeof import("forEach");
}
````

## File: src/engine/types/README.md
````markdown
These ambient definitions shadow upstream packages that ship incomplete or inaccurate types.
Only the modules consumed by `noa-engine` at runtime are copied here:

- `aabb-3d`
- `ent-comp`
- `events`
- `gl-vec3`

If additional dependencies need type patches, add a sibling directory that mirrors the package name
and expose an `index.d.ts` entry point.
````

## File: src/hud/components/crosshair.tsx
````typescript
import { useMemo, useSyncExternalStore } from 'react';
import { useOverlayContext } from '../overlay/overlay-context';

const SVG_SIZE = 40;
const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function useRemovalHoldProgress(): { active: boolean; progress: number } {
  const { removal } = useOverlayContext();
  return useSyncExternalStore(
    (listener) => removal.subscribe(listener),
    () => removal.getState(),
  );
}

export function Crosshair(): JSX.Element {
  const removalState = useRemovalHoldProgress();
  const dashOffset = useMemo(() => {
    const progress = Math.min(1, Math.max(0, removalState.progress));
    return CIRCUMFERENCE * (1 - progress);
  }, [removalState.progress]);
  const hasProgress = removalState.active || removalState.progress > 0.001;

  return (
    <div
      className="crosshair"
      data-removing={removalState.active ? 'true' : 'false'}
      data-progress={hasProgress ? 'true' : 'false'}
    >
      <svg
        className="crosshair__progress"
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="crosshair__progress-bg"
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
        />
        <circle
          className="crosshair__progress-ring"
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="crosshair__reticle" aria-hidden="true">
        <span className="crosshair__line crosshair__line--horizontal" />
        <span className="crosshair__line crosshair__line--vertical" />
        <span className="crosshair__dot" />
      </div>
    </div>
  );
}
````

## File: src/hud/components/hotbar-hud.tsx
````typescript
import { useCallback, useSyncExternalStore } from 'react';
import type { HotbarController, HotbarState } from '../../player/hotbar-controller';
import { HotbarIcon } from './hotbar-icons';

interface HotbarHudProps {
  controller: HotbarController;
}

function useHotbarState(controller: HotbarController): HotbarState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

export function HotbarHud({ controller }: HotbarHudProps): JSX.Element {
  const state = useHotbarState(controller);
  const { slots, activeIndex } = state;
  const activeSlot = slots[activeIndex];

  const handleSlotClick = useCallback(
    (index: number) => {
      controller.setActiveIndex(index);
    },
    [controller],
  );

  return (
    <div className="hotbar-root">
      <div className="hotbar-slots">
        {slots.map((slot) => {
          const isActive = slot.index === activeIndex;
          return (
            <button
              key={slot.index}
              type="button"
              className="hotbar-slot"
              data-active={isActive ? 'true' : 'false'}
              onClick={() => handleSlotClick(slot.index)}
              title={slot.item ? slot.item.label : 'Slot vazio'}
            >
              <span className="hotbar-slot-index">{slot.index + 1}</span>
              <span className="hotbar-slot-icon" data-has-item={slot.item ? 'true' : 'false'}>
                {slot.item ? <HotbarIcon icon={slot.item.icon} /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="hotbar-tooltip" data-visible={activeSlot.item ? 'true' : 'false'}>
        <h2>{activeSlot.item ? activeSlot.item.label : 'Slot vazio'}</h2>
        <p>{activeSlot.item ? activeSlot.item.description : 'Sem item atribuído.'}</p>
      </div>
    </div>
  );
}
````

## File: src/hud/components/hotbar-icons.tsx
````typescript
import type { SVGProps } from 'react';

export type HotbarIconId = 'deck' | 'solar-panel' | 'battery' | 'terminal';

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const iconSizeProps = {
  width: 32,
  height: 32,
  viewBox: '0 0 32 32',
  role: 'img' as const,
  'aria-hidden': true,
};

const DeckIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="2" y="6" width="28" height="20" rx="4" fill="#1f273a" stroke="#4f6fc5" strokeWidth="2" />
    <path d="M6 12h20" stroke="#7a9bff" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 18h20" stroke="#3e58a8" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
  </svg>
);

const SolarPanelIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="4" y="7" width="24" height="18" rx="3" fill="#0b1e3a" stroke="#45d3ff" strokeWidth="2" />
    <path d="M4 13h24M4 19h24M12 7v18M20 7v18" stroke="#72ebff" strokeWidth="1.6" opacity="0.8" />
    <circle cx="26" cy="6" r="3" fill="#ffda5c" opacity="0.85" />
  </svg>
);

const BatteryIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="7" y="6" width="18" height="20" rx="4" fill="#131b2c" stroke="#8ce1ff" strokeWidth="2" />
    <rect x="13" y="2" width="6" height="4" rx="1" fill="#8ce1ff" />
    <path d="M16 10l-3 5h2v5l3-5h-2z" fill="#ffee7d" />
  </svg>
);

const TerminalIcon: IconComponent = (props) => (
  <svg {...iconSizeProps} {...props}>
    <rect x="5" y="5" width="22" height="18" rx="3" fill="#0b1730" stroke="#6fb4ff" strokeWidth="2" />
    <rect x="5" y="23" width="22" height="4" rx="1.5" fill="#1d2d4f" />
    <path d="M10 11l4 3-4 3" stroke="#88f7ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="22" cy="21" r="2" fill="#ff4778" opacity="0.85" />
  </svg>
);

const ICONS: Record<HotbarIconId, IconComponent> = {
  deck: DeckIcon,
  'solar-panel': SolarPanelIcon,
  battery: BatteryIcon,
  terminal: TerminalIcon,
};

export function HotbarIcon({ icon, ...props }: { icon: HotbarIconId } & SVGProps<SVGSVGElement>): JSX.Element {
  const Component = ICONS[icon];
  return <Component {...props} />;
}
````

## File: src/hud/README.md
````markdown
# HUD Module Staging

This directory will host the Babylon/NOA HUD widgets referenced in the manifesto:

- crosshair and selection feedback
- status panel for environment readouts
- toolbar inventory strip

Each widget should live in its own file (e.g. `crosshair.ts`) with shared constants colocated in `constants.ts`.
````

## File: src/hud/removal-hold-tracker.ts
````typescript
export interface RemovalHoldState {
  active: boolean;
  progress: number;
}

type Listener = () => void;

const PROGRESS_EPSILON = 0.001;

export class RemovalHoldTracker {
  private state: RemovalHoldState = {
    active: false,
    progress: 0,
  };

  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): RemovalHoldState {
    return this.state;
  }

  setState(nextState: RemovalHoldState): void {
    const clampedProgress = Math.min(1, Math.max(0, nextState.progress));
    const normalized: RemovalHoldState = {
      active: nextState.active,
      progress: clampedProgress,
    };

    const prev = this.state;
    const progressDelta = Math.abs(prev.progress - normalized.progress);
    const changed = prev.active !== normalized.active || progressDelta > PROGRESS_EPSILON;
    if (!changed) {
      return;
    }

    this.state = normalized;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
````

## File: src/persistence/adapter.ts
````typescript
import type { SectorSnapshot } from './types';

export interface PersistenceAdapter {
  loadSnapshot(playerId: string, sectorId: string): SectorSnapshot | null;
  saveSnapshot(snapshot: SectorSnapshot): void;
  clearSnapshot(playerId: string, sectorId: string): void;
}
````

## File: src/persistence/local-storage-adapter.ts
````typescript
import type { SectorSnapshot } from './types';
import type { PersistenceAdapter } from './adapter';

const STORAGE_PREFIX = 'starwatch/save';

function makeKey(playerId: string, sectorId: string): string {
  return `${STORAGE_PREFIX}/${playerId}/${sectorId}`;
}

export class LocalStorageAdapter implements PersistenceAdapter {
  loadSnapshot(playerId: string, sectorId: string): SectorSnapshot | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(makeKey(playerId, sectorId));
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as SectorSnapshot;
    } catch (error) {
      console.warn('[starwatch:persistence] snapshot inválido, limpando storage', error);
      window.localStorage.removeItem(makeKey(playerId, sectorId));
      return null;
    }
  }

  saveSnapshot(snapshot: SectorSnapshot): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(makeKey(snapshot.player.id, snapshot.sector.id), JSON.stringify(snapshot));
  }

  clearSnapshot(playerId: string, sectorId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(makeKey(playerId, sectorId));
  }
}
````

## File: src/player/hotbar-controller.ts
````typescript
import { HOTBAR_SLOT_COUNT, INITIAL_HOTBAR_ITEMS, type HotbarItemDefinition } from '../config/hud-options';

export interface HotbarSlot {
  index: number;
  item: HotbarItemDefinition | null;
}

export interface HotbarState {
  slots: HotbarSlot[];
  activeIndex: number;
}

type Listener = () => void;

export class HotbarController {
  private state: HotbarState;
  private listeners = new Set<Listener>();

  constructor() {
    const slots: HotbarSlot[] = Array.from({ length: HOTBAR_SLOT_COUNT }, (_, index) => ({
      index,
      item: INITIAL_HOTBAR_ITEMS[index] ?? null,
    }));

    this.state = {
      slots,
      activeIndex: 0,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): HotbarState {
    return this.state;
  }

  setActiveIndex(index: number): void {
    const normalized = this.normalizeIndex(index);
    if (this.state.activeIndex === normalized) {
      return;
    }
    this.updateState({
      ...this.state,
      activeIndex: normalized,
    });
  }

  stepActiveIndex(delta: number): void {
    const target = this.normalizeIndex(this.state.activeIndex + delta);
    this.setActiveIndex(target);
  }

  setSlotItem(index: number, item: HotbarItemDefinition | null): void {
    const normalized = this.normalizeIndex(index);
    const slot = this.state.slots[normalized];
    if (slot.item?.id === item?.id) {
      return;
    }
    const nextSlots = this.state.slots.slice();
    nextSlots[normalized] = {
      ...slot,
      item,
    };
    this.updateState({
      ...this.state,
      slots: nextSlots,
    });
  }

  getActiveSlot(): HotbarSlot {
    return this.state.slots[this.state.activeIndex];
  }

  reset(): void {
    this.listeners.clear();
  }

  private updateState(nextState: HotbarState): void {
    this.state = nextState;
    for (const listener of this.listeners) {
      listener();
    }
  }

  private normalizeIndex(index: number): number {
    const size = HOTBAR_SLOT_COUNT;
    return ((index % size) + size) % size;
  }
}
````

## File: src/player/hotbar.ts
````typescript
import type { OverlayApi } from '../hud/overlay';
import { HotbarController } from './hotbar-controller';

export interface HotbarApi {
  controller: HotbarController;
  attachOverlay(overlay: OverlayApi): void;
  destroy(): void;
}

export function initializeHotbar(initialOverlay?: OverlayApi): HotbarApi {
  const controller = new HotbarController();
  let overlayRef: OverlayApi | null = initialOverlay ?? null;

  const isOverlayCapturing = (): boolean => {
    if (!overlayRef) {
      return false;
    }
    return overlayRef.controller.getState().captureInput;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isOverlayCapturing()) {
      return;
    }

    if (event.code.startsWith('Digit')) {
      const digit = Number.parseInt(event.code.replace('Digit', ''), 10);
      if (Number.isFinite(digit) && digit >= 1 && digit <= 9) {
        controller.setActiveIndex(digit - 1);
        event.preventDefault();
      }
      return;
    }

    if (event.code.startsWith('Numpad')) {
      const digit = Number.parseInt(event.code.replace('Numpad', ''), 10);
      if (Number.isFinite(digit) && digit >= 1 && digit <= 9) {
        controller.setActiveIndex(digit - 1);
        event.preventDefault();
      }
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (isOverlayCapturing()) {
      return;
    }

    if (event.deltaY === 0) {
      return;
    }

    controller.stepActiveIndex(event.deltaY > 0 ? 1 : -1);
    event.preventDefault();
  };

  window.addEventListener('keydown', handleKeyDown, { passive: false, capture: true });
  window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

  const destroy = () => {
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('wheel', handleWheel, true);
    controller.reset();
    overlayRef = null;
  };

  return {
    controller,
    attachOverlay(overlay) {
      overlayRef = overlay;
    },
    destroy,
  };
}
````

## File: src/scripts/README.md
````markdown
# Gameplay Scripts

This directory will host Starwatch user-facing scripts, automation hooks and any tooling around the HAL scripting UX.
Keep runtime bindings thin so we can swap interpreters or sandboxes later.
````

## File: src/sector/generation/asteroid-field.ts
````typescript
import { createSeededRng, hash2D, hash3D, randomInt } from '../../utils/random';
import { sampleAsteroidNoise } from '../asteroid-noise';
import {
  ASTEROID_BLOCK_COUNT,
  ASTEROID_CELL_MARGIN,
  ASTEROID_CELL_SIZE,
  ASTEROID_CENTER_PROBABILITY,
  ASTEROID_CLUSTER_SIZE,
  ASTEROID_CLUSTER_SPREAD,
  ASTEROID_DENSITY_THRESHOLD,
  ASTEROID_HEIGHT_VARIATION,
  ASTEROID_LAYER_ALTITUDE,
  ASTEROID_MAJOR_RADIUS,
  ASTEROID_MINOR_RADIUS,
  ASTEROID_RING_INNER_RADIUS,
  ASTEROID_RING_OUTER_RADIUS,
  ASTEROID_VERTICAL_RADIUS,
} from '../../config/sector-options';
import type { ChunkGenerationContext } from './types';
import type { AsteroidBlockDescriptor } from '../blocks';

export function generateAsteroidField(ctx: ChunkGenerationContext): void {
  if (ctx.bounds.maxY < ASTEROID_LAYER_ALTITUDE - ASTEROID_HEIGHT_VARIATION) return;
  if (ctx.bounds.minY > ASTEROID_LAYER_ALTITUDE + ASTEROID_HEIGHT_VARIATION) return;

  const variants = ctx.blocks.asteroidVariants;
  if (variants.length === 0) return;

  const weightSum = variants.reduce((sum, variant) => sum + variant.weight, 0);
  if (weightSum <= 0) return;

  const minCellX = Math.floor((ctx.bounds.minX - ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const maxCellX = Math.floor((ctx.bounds.maxX + ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const minCellZ = Math.floor((ctx.bounds.minZ - ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);
  const maxCellZ = Math.floor((ctx.bounds.maxZ + ASTEROID_CELL_MARGIN) / ASTEROID_CELL_SIZE);

  for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
    for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ += 1) {
      const baseSeed = hash2D(cellX, cellZ);
      const baseRng = createSeededRng(baseSeed);

      const offsetX = Math.round((baseRng() - 0.5) * (ASTEROID_CELL_SIZE - 1));
      const offsetZ = Math.round((baseRng() - 0.5) * (ASTEROID_CELL_SIZE - 1));

      const baseCenterX = cellX * ASTEROID_CELL_SIZE + offsetX;
      const baseCenterZ = cellZ * ASTEROID_CELL_SIZE + offsetZ;
      const baseRadius = Math.hypot(baseCenterX, baseCenterZ);

      if (baseRadius < ASTEROID_RING_INNER_RADIUS || baseRadius > ASTEROID_RING_OUTER_RADIUS) {
        continue;
      }

      const density = sampleAsteroidDensity(baseCenterX, baseCenterZ);
      const normalizedDensity = (density + 1) * 0.5;
      if (normalizedDensity < ASTEROID_DENSITY_THRESHOLD) {
        continue;
      }

      if (baseRng() > ASTEROID_CENTER_PROBABILITY) {
        continue;
      }

      const clusterCount = randomInt(baseRng, ASTEROID_CLUSTER_SIZE.min, ASTEROID_CLUSTER_SIZE.max);
      for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex += 1) {
        const clusterAngle = baseRng() * Math.PI * 2;
        const clusterDistance = clusterIndex === 0 ? 0 : ASTEROID_CLUSTER_SPREAD * (0.5 + baseRng() * 0.5);

        const clusterCenterX = Math.round(baseCenterX + Math.cos(clusterAngle) * clusterDistance);
        const clusterCenterZ = Math.round(baseCenterZ + Math.sin(clusterAngle) * clusterDistance);
        const clusterCenterY = ASTEROID_LAYER_ALTITUDE + Math.round((baseRng() - 0.5) * 2 * ASTEROID_HEIGHT_VARIATION);

        const clusterRadius = Math.hypot(clusterCenterX, clusterCenterZ);
        if (clusterRadius < ASTEROID_RING_INNER_RADIUS || clusterRadius > ASTEROID_RING_OUTER_RADIUS) {
          continue;
        }

        const clusterSeed = hash3D(cellX, cellZ, clusterIndex);
        const clusterRng = createSeededRng(clusterSeed);
        const variant = pickAsteroidVariant(clusterRng, variants, weightSum);
        if (!variant) continue;

        const offsets = buildAsteroidOffsets(clusterRng);
        for (const [offsetXBlock, offsetYBlock, offsetZBlock] of offsets) {
          const worldX = clusterCenterX + offsetXBlock;
          const worldY = clusterCenterY + offsetYBlock;
          const worldZ = clusterCenterZ + offsetZBlock;

          const radialDistance = Math.hypot(worldX, worldZ);
          if (radialDistance < ASTEROID_RING_INNER_RADIUS || radialDistance > ASTEROID_RING_OUTER_RADIUS + ASTEROID_MAJOR_RADIUS) {
            continue;
          }

          ctx.writeBlock(worldX, worldY, worldZ, variant.blockId);
        }
      }
    }
  }
}

function pickAsteroidVariant(rng: () => number, variants: AsteroidBlockDescriptor[], weightSum: number): AsteroidBlockDescriptor | undefined {
  let r = rng() * weightSum;
  for (const variant of variants) {
    r -= variant.weight;
    if (r <= 0) {
      return variant;
    }
  }
  return variants[variants.length - 1];
}

function buildAsteroidOffsets(rng: () => number): Array<[number, number, number]> {
  const totalBlocks = randomInt(rng, ASTEROID_BLOCK_COUNT.min, ASTEROID_BLOCK_COUNT.max);
  const majorRadius = ASTEROID_MAJOR_RADIUS * (0.8 + rng() * 0.4);
  const minorRadius = ASTEROID_MINOR_RADIUS * (0.8 + rng() * 0.4);
  const verticalRadius = ASTEROID_VERTICAL_RADIUS * (0.8 + rng() * 0.4);
  const orientation = rng() * Math.PI * 2;

  const offsets: Array<[number, number, number]> = [];
  const used = new Set<string>();
  let attempts = 0;
  const maxAttempts = totalBlocks * 30;

  while (offsets.length < totalBlocks && attempts < maxAttempts) {
    attempts += 1;
    const along = (rng() * 2 - 1) * majorRadius;
    const lateral = (rng() * 2 - 1) * minorRadius;
    const vertical = (rng() * 2 - 1) * verticalRadius;

    const norm = (along * along) / (majorRadius * majorRadius)
      + (lateral * lateral) / (minorRadius * minorRadius)
      + (vertical * vertical) / (verticalRadius * verticalRadius);
    if (norm > 1) continue;

    const rotX = Math.round(Math.cos(orientation) * along - Math.sin(orientation) * lateral);
    const rotZ = Math.round(Math.sin(orientation) * along + Math.cos(orientation) * lateral);
    const rotY = Math.round(vertical);

    const key = `${rotX},${rotY},${rotZ}`;
    if (used.has(key)) continue;
    used.add(key);
    offsets.push([rotX, rotY, rotZ]);
  }

  if (offsets.length === 0) {
    offsets.push([0, 0, 0]);
  }

  return offsets;
}

function sampleAsteroidDensity(x: number, z: number): number {
  const a = sampleAsteroidNoise(x, 160) * 0.6;
  const b = sampleAsteroidNoise(z + 51.37, 120) * 0.25;
  const c = sampleAsteroidNoise(x - z - 97.53, 90) * 0.15;
  return a + b + c;
}
````

## File: src/sector/generation/index.ts
````typescript
import type { ChunkGenerationContext } from './types';
import { generateStartingPlatform } from './platform';
import { generateAsteroidField } from './asteroid-field';

export type ChunkGeneratorStage = (context: ChunkGenerationContext) => void;

const DEFAULT_STAGES: ChunkGeneratorStage[] = [generateStartingPlatform, generateAsteroidField];

export function runGenerationPipeline(
  context: ChunkGenerationContext,
  stages: ChunkGeneratorStage[] = DEFAULT_STAGES,
): void {
  for (const stage of stages) {
    stage(context);
  }
}
````

## File: src/sector/asteroid-noise.ts
````typescript
const SEED = [0.137, 0.273, 0.419];
const LOOKUP_SIZE = 100;

const noiseValues = Array.from({ length: LOOKUP_SIZE }, (_, i) => {
  const a = Math.cos(Math.PI * 2 * (i / 1000 + SEED[0]));
  const b = 0.5 * Math.cos(Math.PI * 2 * (i / 500 + SEED[1]));
  const c = 0.25 * Math.cos(Math.PI * 2 * (i / 250 + SEED[2]));
  return a + b + c;
});

export function sampleAsteroidNoise(x: number, scale: number): number {
  const nx = x / scale;
  const ix = nx - Math.floor(nx);
  const lookupIndex = Math.floor(ix * LOOKUP_SIZE) % LOOKUP_SIZE;
  return noiseValues[lookupIndex];
}
````

## File: src/sector/blocks.ts
````typescript
import type { Engine } from 'noa-engine';
import type { SectorMaterials } from './materials';

export interface AsteroidBlockDescriptor {
  id: string;
  weight: number;
  materialName: string;
  blockId: number;
}

export interface SectorBlocks {
  dirt: number;
  asteroidVariants: AsteroidBlockDescriptor[];
  nextBlockId: number;
}

export function registerSectorBlocks(noa: Engine, materials: SectorMaterials): SectorBlocks {
  console.log('[starwatch] registrando blocos do setor');

  const dirt = noa.registry.registerBlock(1, {
    material: materials.dirt.name,
    solid: true,
  });

  let nextBlockId = 2;

  const asteroidVariantBlocks = materials.asteroidVariants.map((variant) => {
    const blockId = noa.registry.registerBlock(nextBlockId, {
      material: variant.material.name,
      solid: true,
      opaque: true,
      blockLight: true,
      hardness: 3,
      displayName: `asteroid-${variant.id}`,
    });
    nextBlockId += 1;
    return {
      id: variant.id,
      weight: variant.weight,
      materialName: variant.material.name,
      blockId,
    };
  });

  return {
    dirt,
    asteroidVariants: asteroidVariantBlocks,
    nextBlockId,
  };
}
````

## File: src/sector/materials.ts
````typescript
import type { Engine } from 'noa-engine';
import terrainAtlasUrl from './assets/terrain_atlas.png';
import { ASTEROID_VARIANTS } from '../config/sector-options';

export interface RegisteredMaterial {
  name: string;
  solarOpacity: number;
}

export interface AsteroidMaterialDescriptor {
  id: string;
  weight: number;
  material: RegisteredMaterial;
}

export interface SectorMaterials {
  dirt: RegisteredMaterial;
  deck: RegisteredMaterial;
  solarPanel: RegisteredMaterial;
  battery: RegisteredMaterial;
  terminal: RegisteredMaterial;
  asteroidVariants: AsteroidMaterialDescriptor[];
}

interface RegisterMaterialOptions {
  color?: [number, number, number];
  textureURL?: string;
  atlasIndex?: number;
  solarOpacity: number;
}

function registerMaterial(noa: Engine, name: string, options: RegisterMaterialOptions): RegisteredMaterial {
  noa.registry.registerMaterial(name, {
    color: options.color,
    textureURL: options.textureURL,
    atlasIndex: options.atlasIndex,
  });

  return {
    name,
    solarOpacity: options.solarOpacity,
  };
}

export function registerSectorMaterials(noa: Engine): SectorMaterials {
  console.log('[starwatch] registrando materiais base do setor');

  const dirt = registerMaterial(noa, 'dirt', {
    textureURL: terrainAtlasUrl,
    atlasIndex: 2,
    solarOpacity: 1,
  });

  const deck = registerMaterial(noa, 'deck-metal', {
    color: [0.22, 0.28, 0.42],
    solarOpacity: 1,
  });

  const solarPanel = registerMaterial(noa, 'solar-panel-block', {
    color: [0.09, 0.21, 0.46],
    solarOpacity: 0.05,
  });

  const battery = registerMaterial(noa, 'battery-block', {
    color: [0.14, 0.18, 0.28],
    solarOpacity: 1,
  });

  const terminal = registerMaterial(noa, 'terminal-block', {
    color: [0.12, 0.2, 0.36],
    solarOpacity: 1,
  });

  const asteroidMaterials = ASTEROID_VARIANTS.map((variant) => {
    const [r, g, b] = variant.color;
    const material = registerMaterial(noa, `asteroid-${variant.id}`, {
      color: [r, g, b],
      solarOpacity: 1,
    });
    return {
      id: variant.id,
      weight: variant.weight,
      material,
    };
  });

  return {
    dirt,
    deck,
    solarPanel,
    battery,
    terminal,
    asteroidVariants: asteroidMaterials,
  };
}
````

## File: src/sector/README.md
````markdown
# Sector Registry

Este diretório concentra o setup do NOA para o setor atual.

- `materials.ts` define todos os materiais registrados no engine e associa `solarOpacity` used
  pelo sistema de energia. Sempre adicione novos materiais aqui antes de referenciá-los em blocos.
- `blocks.ts` cadastra os blocos “terrain” básicos (asteroides, dirt) e retorna `nextBlockId` para
  que `blocks/register.ts` possa atribuir IDs contínuos aos blocos de gameplay.
- `index.ts` é o ponto de entrada: registra materiais, blocos, instala o worldgen e devolve o
  catálogo (`SectorResources`) usado pelo restante da aplicação.

## Como testar

1. Rode `pnpm dev`.
2. Verifique via console (`window.starwatch.sector`) que os catálogos possuem os IDs esperados.
3. Ao adicionar novo material/bloco, execute `pnpm exec tsc --noEmit` para garantir tipos alinhados.

**Single source of truth:** qualquer mudança em textura/constante deve ser refletida aqui e nos
Readmes dos módulos que dependem dela.
````

## File: src/systems/energy/debug-overlay.ts
````typescript
import type { EnergySystem } from './index';

interface DebugOverlayState {
  networks: string[];
  panelOutputs: string[];
  lastEventMs: number;
}

const PRINT_INTERVAL_MS = 5000;

export class EnergyDebugOverlay {
  private visible = false;
  private readonly element: HTMLDivElement;
  private readonly energy: EnergySystem;
  private lastPrint = 0;

  constructor(energy: EnergySystem) {
    this.energy = energy;
    this.element = document.createElement('div');
    this.element.id = 'energy-debug-overlay';
    this.element.setAttribute('hidden', 'true');
    document.body.appendChild(this.element);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) {
      this.element.removeAttribute('hidden');
      this.render();
    } else {
      this.element.setAttribute('hidden', 'true');
    }
  }

  handleTick(dt: number): void {
    if (!this.visible) {
      return;
    }
    this.render();
    this.lastPrint += dt * 1000;
    if (this.lastPrint >= PRINT_INTERVAL_MS) {
      this.lastPrint = 0;
      this.printToConsole();
    }
  }

  dispose(): void {
    this.element.remove();
  }

  private render(): void {
    if (!this.visible) {
      return;
    }
    const state = this.collectState();
    this.element.innerHTML = `
      <div class="energy-debug">
        <h2>Energy Debug</h2>
        <section>
          <h3>Redes (${state.networks.length})</h3>
          <ul>
            ${state.networks.map((line) => `<li>${line}</li>`).join('')}
          </ul>
        </section>
        <section>
          <h3>Painéis (${state.panelOutputs.length})</h3>
          <ul>
            ${state.panelOutputs.map((line) => `<li>${line}</li>`).join('')}
          </ul>
        </section>
      </div>
    `;
  }

  private collectState(): DebugOverlayState {
    const networks = this.energy.networks
      .listNetworks()
      .map((network) => {
        const delta = network.metrics.totalGenW - network.metrics.totalLoadW;
        return `#${network.id} nodes=${network.nodeCount} gen=${network.metrics.totalGenW.toFixed(
          2,
        )}W load=${network.metrics.totalLoadW.toFixed(2)}W Δ=${delta.toFixed(2)}W stored=${network.metrics.totalStoredMJ.toFixed(
          3,
        )}MJ`;
      });

    const panels = this.energy.listSolarPanels().map((panel) => {
      const shadePct = Math.round(panel.shade * 100);
      return `(${panel.position.join(',')}) ${panel.outputW.toFixed(2)}W shade=${shadePct}% net=${
        panel.networkId ?? '—'
      }`;
    });

    return {
      networks,
      panelOutputs: panels,
      lastEventMs: 0,
    };
  }

  private printToConsole(): void {
    const state = this.collectState();
    console.group('[energy/debug] snapshot');
    state.networks.forEach((line) => console.log(line));
    state.panelOutputs.forEach((line) => console.log(line));
    console.groupEnd();
  }
}
````

## File: src/systems/terminals/format.ts
````typescript
export function formatWatts(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const magnitude = Math.abs(value);
  if (magnitude >= 1000) {
    return `${sign}${(magnitude / 1000).toFixed(2)} kW`;
  }
  return `${sign}${magnitude.toFixed(0)} W`;
}

export function formatMegajoules(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2)} GJ`;
  }
  return `${value.toFixed(2)} MJ`;
}

export function formatDelta(deltaW: number): string {
  if (Math.abs(deltaW) < 0.5) {
    return '±0 W';
  }
  return formatWatts(deltaW);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}
````

## File: src/systems/terminals/hal-terminal-display.ts
````typescript
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { HalTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatMegajoules, formatWatts } from './format';
import { orientationToNormal, orientationToYaw } from './helpers';

type HalOptions = BaseTerminalDisplayOptions<HalTerminalData>;

export class HalTerminalDisplay extends BaseTerminalDisplay<HalTerminalData> {
  constructor(options: HalOptions) {
    super(options);
    this.createColumn(options);
  }

  protected drawContent(activeTabId: string | null, data: HalTerminalData): void {
    const { overview } = data;
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM REDE CONECTADA', 'APROXIME UM DECK CONDUTIVO']);
      return;
    }

    switch (activeTabId) {
      case 'overview':
        this.drawOverview(ctx, area, data);
        break;
      case 'power':
        this.drawPower(ctx, area, data);
        break;
      case 'devices':
      default:
        this.drawDevices(ctx, area, data);
        break;
    }
  }

  private drawOverview(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: HalTerminalData): void {
    const { overview, terminal } = data;
    if (!overview || !terminal) {
      drawCenteredMessage(ctx, area, ['HAL-9001', 'AGUARDANDO SINAL']);
      return;
    }

    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'Δ ATUAL', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
      { label: 'GERAÇÃO', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'ARMAZENADO', value: formatMegajoules(overview.metrics.totalStoredMJ) },
      { label: 'CAPACIDADE', value: formatMegajoules(overview.metrics.totalCapMJ) },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawPower(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: HalTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM MÉTRICAS DISPONÍVEIS']);
      return;
    }

    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'RESERVA TOTAL', value: formatMegajoules(overview.metrics.totalStoredMJ) },
      { label: 'CAP MÁXIMA', value: formatMegajoules(overview.metrics.totalCapMJ) },
      { label: 'GERAÇÃO INSTANTÂNEA', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO INSTANTÂNEO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'SALDO', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawDevices(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: HalTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['NENHUM DISPOSITIVO ENCONTRADO']);
      return;
    }
    const rows: MetricRow[] = [
      { label: 'PAINÉIS SOLARES', value: overview.panelCount.toString() },
      { label: 'BATERIAS', value: overview.batteryCount.toString() },
      { label: 'TERMINAIS', value: overview.terminalCount.toString() },
    ];
    drawMetricList(ctx, area, rows);
  }

  private createColumn(options: HalOptions): void {
    const scene = options.scene;
    const column = MeshBuilder.CreateBox(
      `hal-terminal-column-${options.position.join(':')}`,
      {
        width: 0.7,
        depth: 0.7,
        height: 2,
      },
      scene,
    );
    column.isPickable = false;
    column.position = new Vector3(options.position[0] + 0.5, options.position[1] + 1, options.position[2] + 0.5);
    column.renderingGroupId = 1;
    const columnMat = new StandardMaterial(`hal-terminal-column-mat-${options.position.join(':')}`, scene);
    columnMat.diffuseColor = new Color3(0.1, 0.17, 0.28);
    columnMat.emissiveColor = new Color3(0.02, 0.05, 0.12);
    column.material = columnMat;
    this.addDecoration(column);

    const bezel = MeshBuilder.CreateBox(
      `hal-terminal-bezel-${options.position.join(':')}`,
      {
        width: options.physicalWidth + 0.12,
        height: options.physicalHeight + 0.12,
        depth: 0.08,
      },
      scene,
    );
    bezel.isPickable = false;
    const normal = orientationToNormal(options.orientation);
    const screenPos = new Vector3(options.position[0] + 0.5, options.position[1] + options.elevation, options.position[2] + 0.5);
    bezel.position = screenPos.add(normal.scale(options.mountOffset - 0.04));
    bezel.rotation = new Vector3(0, orientationToYaw(options.orientation), 0);
    bezel.renderingGroupId = 2;
    const bezelMat = new StandardMaterial(`hal-terminal-bezel-mat-${options.position.join(':')}`, scene);
    bezelMat.diffuseColor = new Color3(0.07, 0.12, 0.22);
    bezelMat.emissiveColor = new Color3(0.05, 0.08, 0.16);
    bezelMat.disableLighting = true;
    bezel.material = bezelMat;
    this.addDecoration(bezel);
  }

}
````

## File: src/systems/terminals/render-helpers.ts
````typescript
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MetricVariant = 'default' | 'positive' | 'negative' | 'muted' | 'accent';

export interface MetricRow {
  label: string;
  value: string;
  variant?: MetricVariant;
}

export function clearContent(ctx: CanvasRenderingContext2D, area: Rect): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.width, area.height);
  ctx.clip();
  ctx.clearRect(area.x, area.y, area.width, area.height);
  ctx.fillStyle = 'rgba(6, 18, 40, 0.7)';
  ctx.fillRect(area.x, area.y, area.width, area.height);
  ctx.restore();
}

export function drawMetricList(ctx: CanvasRenderingContext2D, area: Rect, rows: MetricRow[]): void {
  ctx.save();
  ctx.font = '24px monospace';
  ctx.textBaseline = 'middle';
  const startY = area.y + 28;
  const spacing = 34;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const centerY = startY + i * spacing;
    ctx.fillStyle = variantToColor(row.variant ?? 'default');
    ctx.textAlign = 'left';
    ctx.fillText(row.label.toUpperCase(), area.x + 18, centerY);
    ctx.textAlign = 'right';
    ctx.fillText(row.value, area.x + area.width - 18, centerY);
  }
  ctx.restore();
}

export function drawCenteredMessage(ctx: CanvasRenderingContext2D, area: Rect, lines: string[]): void {
  ctx.save();
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(180, 210, 255, 0.75)';
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;
  const spacing = 32;
  const totalHeight = spacing * (lines.length - 1);
  lines.forEach((line, index) => {
    const offset = -totalHeight / 2 + index * spacing;
    ctx.fillText(line, centerX, centerY + offset);
  });
  ctx.restore();
}

export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  area: Rect,
  value: number,
  options?: { label?: string; color?: string },
): void {
  const clamped = Math.max(0, Math.min(1, value));
  const height = 28;
  const y = area.y + area.height / 2 - height / 2;
  const padding = 18;
  const width = area.width - padding * 2;
  ctx.save();
  ctx.fillStyle = 'rgba(24, 48, 94, 0.9)';
  ctx.fillRect(area.x + padding, y, width, height);
  const activeWidth = Math.max(4, width * clamped);
  ctx.fillStyle = options?.color ?? 'rgba(120, 200, 255, 0.9)';
  ctx.fillRect(area.x + padding, y, activeWidth, height);
  ctx.strokeStyle = 'rgba(180, 220, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(area.x + padding, y, width, height);
  if (options?.label) {
    ctx.font = '22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#06112a';
    ctx.fillText(options.label, area.x + padding + width / 2, y + height / 2);
  }
  ctx.restore();
}

function variantToColor(variant: MetricVariant): string {
  switch (variant) {
    case 'positive':
      return '#7ef0c6';
    case 'negative':
      return '#ff7b7b';
    case 'muted':
      return 'rgba(160, 200, 255, 0.55)';
    case 'accent':
      return 'rgba(225, 245, 255, 0.95)';
    case 'default':
    default:
      return 'rgba(200, 225, 255, 0.85)';
  }
}
````

## File: src/systems/terminals/types.ts
````typescript
import type { Scene } from '@babylonjs/core/scene';
import type { VoxelPosition } from '../energy/energy-network-manager';
import type { BlockOrientation } from '../../blocks/types';
import type { BatterySnapshot, NetworkOverview, SolarPanelSnapshot, TerminalSnapshot } from '../energy';

export type TerminalDisplayKind = 'hal-terminal' | 'battery' | 'solar-panel';

export interface TerminalDisplayKey {
  kind: TerminalDisplayKind;
  position: VoxelPosition;
}

export interface TerminalTab {
  id: string;
  label: string;
}

export interface TerminalPointerTarget {
  tabIndex: number | null;
}

export interface TerminalPointerEvent {
  uv: { u: number; v: number };
  button: number;
}

export interface TerminalDisplayDependencies {
  scene: Scene;
  position: VoxelPosition;
  orientation: BlockOrientation;
  kind: TerminalDisplayKind;
}

export interface HalTerminalData {
  terminal: TerminalSnapshot | null;
  overview: NetworkOverview | null;
}

export interface BatteryTerminalData {
  snapshot: BatterySnapshot | null;
  overview: NetworkOverview | null;
}

export interface SolarTerminalData {
  snapshot: SolarPanelSnapshot | null;
  overview: NetworkOverview | null;
}

export type TerminalDisplayData = HalTerminalData | BatteryTerminalData | SolarTerminalData;
````

## File: src/types/assets.d.ts
````typescript
declare module '*.png' {
  const url: string;
  export default url;
}
````

## File: src/utils/random.ts
````typescript
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
````

## File: src/utils/README.md
````markdown
# Shared Utilities

Utility helpers shared across modules should live here.
Favor small, pure functions and keep engine-specific code in the module that owns it.
````

## File: src/README.md
````markdown
# Starwatch Source Layout

- `core/` — bootstrap logic (engine instantiation, wiring of systems).
- `config/` — global constants and shared engine options.
- `world/` — NOA world bindings (materials, block registry, chunk generator, assets).
- `player/` — player entity configuration and input bindings.
- `hud/` — reserved for HUD widgets (toolbar, crosshair, status panels).
- `systems/` — reserved for upcoming runtime subsystems (energy, automation, etc.).
- `blocks/` — reserved for bespoke block behaviours/definitions beyond the base set.
- `ai/` — reserved for HAL/drone logic and future agents.
- `scripts/` — reserved for in-game scripting hooks.
- `persistence/` — reserved for save/load and networking glue.
- `utils/` — reserved for shared helpers/utilities.
- `types/` — ambient type declarations and module shims.

This mirrors the structure defined in `AGENTS.md`/`MANIFESTO.md` and keeps features encapsulated for future expansion.
````

## File: src/vite-env.d.ts
````typescript
/// <reference types="vite/client" />
````

## File: .repomixignore
````
MANIFESTO.md
AGENTS.md
````

## File: src/blocks/metadata-store.ts
````typescript
import type { BlockKind, BlockOrientation } from './types';

interface BlockCoordinate {
  x: number;
  y: number;
  z: number;
}

interface OrientationKey extends BlockCoordinate {
  kind: BlockKind;
}

function makeKey(coord: OrientationKey): string {
  return `${coord.kind}:${coord.x}:${coord.y}:${coord.z}`;
}

class BlockMetadataStore {
  private orientations = new Map<string, BlockOrientation>();

  setOrientation(coord: OrientationKey, orientation: BlockOrientation): void {
    this.orientations.set(makeKey(coord), orientation);
  }

  getOrientation(coord: OrientationKey): BlockOrientation | null {
    return this.orientations.get(makeKey(coord)) ?? null;
  }

  deleteOrientation(coord: OrientationKey): void {
    this.orientations.delete(makeKey(coord));
  }

  clear(): void {
    this.orientations.clear();
  }

  listOrientations(): Array<{ kind: BlockKind; position: [number, number, number]; orientation: BlockOrientation }> {
    const entries: Array<{ kind: BlockKind; position: [number, number, number]; orientation: BlockOrientation }> = [];
    for (const [key, orientation] of this.orientations.entries()) {
      const [kind, x, y, z] = key.split(':');
      entries.push({
        kind: kind as BlockKind,
        position: [Number(x), Number(y), Number(z)],
        orientation,
      });
    }
    return entries;
  }
}

export const blockMetadataStore = new BlockMetadataStore();
````

## File: src/config/README.md
````markdown
# Config Options

Todos os parâmetros ajustáveis do jogo vivem em arquivos `*-options.ts` neste diretório. Cada arquivo documenta onde os valores são consumidos:

- `engine-options.ts`: opções passadas diretamente ao `noa-engine` durante o bootstrap (spawn, pointer lock, chunk size, etc.).
- `render-options.ts`: draw distance, tamanho de chunk e distâncias de add/remove.
- `sector-options.ts`: plataforma inicial e cinturão de nuvens/asteroides do setor atual.
- `player-options.ts`: limites de zoom e parâmetros de movimentação do jogador.

Novas features devem introduzir seu próprio arquivo `foo-options.ts` e importar as constantes correspondentes a partir dele.
````

## File: src/config/sector-options.ts
````typescript
import { TARGET_VIEW_DISTANCE_BLOCKS } from './render-options';

/** Identificador canônico do setor atual (single node do grafo). */
export const DEFAULT_SECTOR_ID = 'sector-lyra-z7';

/**
 * Tamanho (meia extensão) da plataforma inicial onde o jogador nasce.
 * Consumido em `sector/chunk-generator.ts` para definir o deck condutivo 10×10.
 */
export const PLATFORM_HALF_EXTENT = 5;

/**
 * Altura absoluta (eixo Y) da plataforma inicial.
 * Utilizado pelo setor generator para colocar o grid no nível correto.
 */
export const PLATFORM_HEIGHT = 0;

/**
 * Posição inicial do jogador (usada pelo engine bootstrap).
 * A altura deve manter o jogador levemente acima da plataforma.
 */
export const PLAYER_SPAWN_POSITION: [number, number, number] = [0.5, 2.5, 0.5];

/**
 * Altura média das rochas (asteroides) do anel distante.
 */
export const ASTEROID_LAYER_ALTITUDE = 52;

/**
 * Variação máxima (para cima/baixo) da altura dos asteroides.
 */
export const ASTEROID_HEIGHT_VARIATION = 12;

/**
 * Raio interno a partir do qual começam os asteroides.
 */
export const ASTEROID_RING_INNER_RADIUS = 90;

/**
 * Densidade mínima (0–1) do ruído procedural para instanciar um asteroide.
 */
export const ASTEROID_DENSITY_THRESHOLD = 0.4;

/**
 * Probabilidade base de spawn de um asteroide dentro de uma célula candidata.
 */
export const ASTEROID_CENTER_PROBABILITY = 0.18;

/**
 * Tamanho da célula (em blocos) usada para amostrar centros de asteroides.
 */
export const ASTEROID_CELL_SIZE = 48;

/**
 * Margem extra usada ao calcular células vizinhas que podem afetar o chunk.
 */
export const ASTEROID_CELL_MARGIN = 48;

/**
 * Alcance máximo ao longo do eixo principal do asteroide.
 */
export const ASTEROID_MAJOR_RADIUS = 14;

/**
 * Alcance transversal (eixo curto) do asteroide.
 */
export const ASTEROID_MINOR_RADIUS = 8;

/**
 * Alcance vertical (meia altura) do asteroide.
 */
export const ASTEROID_VERTICAL_RADIUS = 10;

/**
 * Quantidade total de blocos por asteroide (60–120 blocos, formando massas densas).
 */
export const ASTEROID_BLOCK_COUNT = {
  min: 60,
  max: 120,
} as const;

/**
 * Número de asteroides em cada cluster (1–3 massas por centro).
 */
export const ASTEROID_CLUSTER_SIZE = {
  min: 1,
  max: 3,
} as const;

/**
 * Distância (em blocos) para deslocar asteroides dentro do mesmo cluster.
 */
export const ASTEROID_CLUSTER_SPREAD = 24;

/**
 * Variedades de asteroide registradas como materiais/blocos, com pesos para distribuição.
 */
export const ASTEROID_VARIANTS = [
  {
    id: 'basalt',
    color: [0.36, 0.38, 0.42, 1],
    weight: 0.5,
  },
  {
    id: 'nickel',
    color: [0.56, 0.58, 0.62, 1],
    weight: 0.3,
  },
  {
    id: 'ice',
    color: [0.74, 0.8, 0.85, 1],
    weight: 0.2,
  },
] as const;

/**
 * Raio externo do cinturão de asteroides, ajustado conforme draw distance.
 */
export const ASTEROID_RING_OUTER_RADIUS = Math.max(
  ASTEROID_RING_INNER_RADIUS + ASTEROID_MAJOR_RADIUS,
  TARGET_VIEW_DISTANCE_BLOCKS - 40,
);
````

## File: src/config/terminal-options.ts
````typescript
/** Req: manter thresholds de interação do terminal numa única fonte. */
export interface TerminalInteractionOptions {
  useRange: number;
  proximityRange: number;
  disengageRange: number;
  disengageGraceTicks: number;
}

export const TERMINAL_INTERACTION_OPTIONS: TerminalInteractionOptions = {
  useRange: 3,
  proximityRange: 2.05,
  disengageRange: 2.4,
  disengageGraceTicks: 6,
};
````

## File: src/engine/index.js
````javascript
/*!
 * noa: an experimental voxel game engine.
 * @url      github.com/fenomas/noa
 * @author   Andy Hall <andy@fenomas.com>
 * @license  MIT
 */

import './lib/shims'

import { EventEmitter } from 'events'
import vec3 from 'gl-vec3'
import ndarray from 'ndarray'
import raycast from 'fast-voxel-raycast'

import { Inputs } from './lib/inputs'
import { Container } from './lib/container'
import { Camera } from './lib/camera'
import { Entities } from './lib/entities'
import { ObjectMesher } from './lib/objectMesher'
import { TerrainMesher } from './lib/terrainMesher'
import { Registry } from './lib/registry'
import { Rendering } from './lib/rendering'
import { Physics } from './lib/physics'
import { World } from './lib/world'
import { locationHasher } from './lib/util'
import { makeProfileHook } from './lib/util'


var version = '0.33.0'



// profile every N ticks/renders
var PROFILE = 0
var PROFILE_RENDER = 0


var defaultOptions = {
    debug: false,
    silent: false,
    silentBabylon: false,
    playerHeight: 1.8,
    playerWidth: 0.6,
    playerStart: [0, 10, 0],
    playerAutoStep: false,
    playerShadowComponent: true,
    tickRate: 30,           // ticks per second
    maxRenderRate: 0,       // max FPS, 0 for uncapped 
    blockTestDistance: 100,
    stickyPointerLock: true,
    dragCameraOutsidePointerLock: true,
    stickyFullscreen: false,
    skipDefaultHighlighting: false,
    originRebaseDistance: 25,
}


/**
 * Main engine class.  
 * Takes an object full of optional settings as a parameter.
 * 
 * ```js
 * import { Engine } from 'noa-engine'
 * var noa = new Engine({
 *    debug: false,
 * })
 * ```
 * 
 * Note that the options object is also passed to noa's 
 * child modules ({@link Rendering}, {@link Container}, etc).
 * See docs for each module for their options.
 * 
*/

export class Engine extends EventEmitter {

    /**
     * The core Engine constructor uses the following options:
     * 
     * ```js
     * var defaultOptions = {
     *    debug: false,
     *    silent: false,
     *    playerHeight: 1.8,
     *    playerWidth: 0.6,
     *    playerStart: [0, 10, 0],
     *    playerAutoStep: false,
     *    playerShadowComponent: true,
     *    tickRate: 30,           // ticks per second
     *    maxRenderRate: 0,       // max FPS, 0 for uncapped 
     *    blockTestDistance: 10,
     *    stickyPointerLock: true,
     *    dragCameraOutsidePointerLock: true,
     *    stickyFullscreen: false,
     *    skipDefaultHighlighting: false,
     *    originRebaseDistance: 25,
     * }
     * ```
     * 
     * **Events:**
     *  + `tick => (dt)`  
     *    Tick update, `dt` is (fixed) tick duration in ms
     *  + `beforeRender => (dt)`  
     *    `dt` is the time (in ms) since the most recent tick
     *  + `afterRender => (dt)`  
     *    `dt` is the time (in ms) since the most recent tick
     *  + `targetBlockChanged => (blockInfo)`  
     *    Emitted each time the user's targeted world block changes
     *  + `addingTerrainMesh => (mesh)`  
     *    Alerts client about a terrain mesh being added to the scene
     *  + `removingTerrainMesh => (mesh)`  
     *    Alerts client before a terrain mesh is removed.
    */
    constructor(opts = {}) {
        super()
        opts = Object.assign({}, defaultOptions, opts)

        /** Version string, e.g. `"0.25.4"` */
        this.version = version
        if (!opts.silent) {
            var debugstr = (opts.debug) ? ' (debug)' : ''
            console.log(`noa-engine v${this.version}${debugstr}`)
        }

        /** @internal */
        this._paused = false

        /** @internal */
        this._originRebaseDistance = opts.originRebaseDistance

        // world origin offset, used throughout engine for origin rebasing
        /** @internal */
        this.worldOriginOffset = [0, 0, 0]

        // how far engine is into the current tick. Updated each render.
        /** @internal */
        this.positionInCurrentTick = 0

        /** 
         * String identifier for the current world. 
         * It's safe to ignore this if your game has only one level/world. 
        */
        this.worldName = 'default'

        /**
         * Multiplier for how fast time moves. Setting this to a value other than 
         * `1` will make the game speed up or slow down. This can significantly 
         * affect how core systems behave (particularly physics!).
        */
        this.timeScale = 1

        /** Child module for managing the game's container, canvas, etc. */
        this.container = new Container(this, opts)

        /** The game's tick rate (number of ticks per second) 
         * @type {number}
         * @readonly 
        */
        this.tickRate = this.container._shell.tickRate
        Object.defineProperty(this, 'tickRate', {
            get: () => this.container._shell.tickRate
        })

        /** The game's max framerate (use `0` for uncapped)
         * @type {number}
         */
        this.maxRenderRate = this.container._shell.maxRenderRate
        Object.defineProperty(this, 'maxRenderRate', {
            get: () => this.container._shell.maxRenderRate,
            set: (v) => { this.container._shell.maxRenderRate = v || 0 },
        })


        /** Manages key and mouse input bindings */
        this.inputs = new Inputs(this, opts, this.container.element)

        /** A registry where voxel/material properties are managed */
        this.registry = new Registry(this, opts)

        /** Manages the world, chunks, and all voxel data */
        this.world = new World(this, opts)

        var _consoleLog = console.log
        if (opts.silentBabylon) console.log = () => { }

        /** Rendering manager */
        this.rendering = new Rendering(this, opts, this.container.canvas)

        if (opts.silentBabylon) console.log = _consoleLog

        /** Physics engine - solves collisions, properties, etc. */
        this.physics = new Physics(this, opts)

        /** Entity manager / Entity Component System (ECS) */
        this.entities = new Entities(this, opts)

        /** Alias to `noa.entities` */
        this.ents = this.entities
        var ents = this.entities

        /** Entity id for the player entity */
        this.playerEntity = ents.add(
            opts.playerStart, // starting location
            opts.playerWidth, opts.playerHeight,
            null, null, // no mesh for now, no meshOffset, 
            true, opts.playerShadowComponent,
        )

        // make player entity it collide with terrain and other entities
        ents.addComponent(this.playerEntity, ents.names.collideTerrain)
        ents.addComponent(this.playerEntity, ents.names.collideEntities)

        // adjust default physics parameters
        var body = ents.getPhysics(this.playerEntity).body
        body.gravityMultiplier = 2 // less floaty
        body.autoStep = opts.playerAutoStep // auto step onto blocks

        // input component - sets entity's movement state from key inputs
        ents.addComponent(this.playerEntity, ents.names.receivesInputs)

        // add a component to make player mesh fade out when zooming in
        ents.addComponent(this.playerEntity, ents.names.fadeOnZoom)

        // movement component - applies movement forces
        ents.addComponent(this.playerEntity, ents.names.movement, {
            airJumps: 1
        })

        /** Manages the game's camera, view angle, sensitivity, etc. */
        this.camera = new Camera(this, opts)

        /** How far to check for a solid voxel the player is currently looking at 
         * @type {number}
        */
        this.blockTestDistance = opts.blockTestDistance

        /** 
         * Callback to determine which voxels can be targeted. 
         * Defaults to a solidity check, but can be overridden with arbitrary logic.
         * @type {(blockID: number) => boolean} 
        */
        this.blockTargetIdCheck = this.registry.getBlockSolidity

        /** 
         * Dynamically updated object describing the currently targeted block.
         * @type {null | { 
         *      blockID:number,
         *      position: number[],
         *      normal: number[],
         *      adjacent: number[],
         * }} 
        */
        this.targetedBlock = null

        // add a default block highlighting function
        if (!opts.skipDefaultHighlighting) {
            // the default listener, defined onto noa in case people want to remove it later
            this.defaultBlockHighlightFunction = (tgt) => {
                if (tgt) {
                    this.rendering.highlightBlockFace(true, tgt.position, tgt.normal)
                } else {
                    this.rendering.highlightBlockFace(false)
                }
            }
            this.on('targetBlockChanged', this.defaultBlockHighlightFunction)
        }


        /*
         *
         *      Various internals...
         *
        */

        /** @internal */
        this._terrainMesher = new TerrainMesher(this)

        /** @internal */
        this._objectMesher = new ObjectMesher(this)

        /** @internal */
        this._targetedBlockDat = {
            blockID: 0,
            position: vec3.create(),
            normal: vec3.create(),
            adjacent: vec3.create(),
        }

        /** @internal */
        this._prevTargetHash = 0


        /** @internal */
        this._pickPos = vec3.create()

        /** @internal */
        this._pickResult = {
            _localPosition: vec3.create(),
            position: [0, 0, 0],
            normal: [0, 0, 0],
        }





        // temp hacks for development
        if (opts.debug) {
            // expose often-used classes
            /** @internal */
            this.vec3 = vec3
            /** @internal */
            this.ndarray = ndarray
            // gameplay tweaks
            ents.getMovement(1).airJumps = 999
            // decorate window while making TS happy
            var win = /** @type {any} */ (window)
            win.noa = this
            win.vec3 = vec3
            win.ndarray = ndarray
            win.scene = this.rendering.scene
        }

        // add hooks to throw helpful errors when using deprecated methods
        deprecateStuff(this)
    }



    /*
     *
     *
     *              Core Engine APIs
     *
     *
    */

    /**
     * Tick function, called by container module at a fixed timestep. 
     * Clients should not normally need to call this manually.
     * @internal
    */

    tick(dt) {
        dt *= this.timeScale || 1

        // note dt is a fixed value, not an observed delay
        if (this._paused) {
            if (this.world.worldGenWhilePaused) this.world.tick()
            return
        }
        profile_hook('start')
        checkWorldOffset(this)
        this.world.tick() // chunk creation/removal
        profile_hook('world')
        if (!this.world.playerChunkLoaded) {
            // when waiting on worldgen, just tick the meshing queue and exit
            this.rendering.tick(dt)
            return
        }
        this.physics.tick(dt) // iterates physics
        profile_hook('physics')
        this._objectMesher.tick() // rebuild objects if needed
        this.rendering.tick(dt) // does deferred chunk meshing
        profile_hook('rendering')
        updateBlockTargets(this) // finds targeted blocks, and highlights one if needed
        profile_hook('targets')
        this.entities.tick(dt) // runs all entity systems
        profile_hook('entities')
        this.emit('tick', dt)
        profile_hook('tick event')
        profile_hook('end')
        // clear accumulated scroll inputs (mouseMove is cleared on render)
        var pst = this.inputs.pointerState
        pst.scrollx = pst.scrolly = pst.scrollz = 0
    }




    /**
     * Render function, called every animation frame. Emits #beforeRender(dt), #afterRender(dt) 
     * where dt is the time in ms *since the last tick*.
     * Clients should not normally need to call this manually.
     * @internal
    */
    render(dt, framePart) {
        dt *= this.timeScale || 1

        // note: framePart is how far we are into the current tick
        // dt is the *actual* time (ms) since last render, for
        // animating things that aren't tied to game tick rate

        // frame position - for rendering movement between ticks
        this.positionInCurrentTick = framePart

        // when paused, just optionally ping worldgen, then exit
        if (this._paused) {
            if (this.world.worldGenWhilePaused) this.world.render()
            return
        }

        profile_hook_render('start')

        // rotate camera per user inputs - specific rules for this in `camera`
        this.camera.applyInputsToCamera()
        profile_hook_render('init')

        // brief run through meshing queue
        this.world.render()
        profile_hook_render('meshing')

        // entity render systems
        this.camera.updateBeforeEntityRenderSystems()
        this.entities.render(dt)
        this.camera.updateAfterEntityRenderSystems()
        profile_hook_render('entities')

        // events and render
        this.emit('beforeRender', dt)
        profile_hook_render('before render')

        this.rendering.render()
        this.rendering.postRender()
        profile_hook_render('render')

        this.emit('afterRender', dt)
        profile_hook_render('after render')
        profile_hook_render('end')

        // clear accumulated mouseMove inputs (scroll inputs cleared on render)
        this.inputs.pointerState.dx = this.inputs.pointerState.dy = 0
    }




    /** Pausing the engine will also stop render/tick events, etc. */
    setPaused(paused = false) {
        this._paused = !!paused
        // when unpausing, clear any built-up mouse inputs
        if (!paused) {
            this.inputs.pointerState.dx = this.inputs.pointerState.dy = 0
        }
    }

    /** 
     * Get the voxel ID at the specified position
    */
    getBlock(x, y = 0, z = 0) {
        if (x.length) return this.world.getBlockID(x[0], x[1], x[2])
        return this.world.getBlockID(x, y, z)
    }

    /** 
     * Sets the voxel ID at the specified position. 
     * Does not check whether any entities are in the way! 
     */
    setBlock(id, x, y = 0, z = 0) {
        if (x.length) return this.world.setBlockID(id, x[0], x[1], x[2])
        return this.world.setBlockID(id, x, y, z)
    }

    /**
     * Adds a block, unless there's an entity in the way.
    */
    addBlock(id, x, y = 0, z = 0) {
        // add a new terrain block, if nothing blocks the terrain there
        if (x.length) {
            if (this.entities.isTerrainBlocked(x[0], x[1], x[2])) return
            this.world.setBlockID(id, x[0], x[1], x[2])
            return id
        } else {
            if (this.entities.isTerrainBlocked(x, y, z)) return
            this.world.setBlockID(id, x, y, z)
            return id
        }
    }







    /*
     *              Rebasing local <-> global coords
    */


    /** 
     * Precisely converts a world position to the current internal 
     * local frame of reference.
     * 
     * See `/docs/positions.md` for more info.
     * 
     * Params: 
     *  * `global`: input position in global coords
     *  * `globalPrecise`: (optional) sub-voxel offset to the global position
     *  * `local`: output array which will receive the result
     */
    globalToLocal(global, globalPrecise, local) {
        var off = this.worldOriginOffset
        if (globalPrecise) {
            for (var i = 0; i < 3; i++) {
                var coord = global[i] - off[i]
                coord += globalPrecise[i]
                local[i] = coord
            }
            return local
        } else {
            return vec3.subtract(local, global, off)
        }
    }

    /** 
     * Precisely converts a world position to the current internal 
     * local frame of reference.
     * 
     * See `/docs/positions.md` for more info.
     * 
     * Params: 
     *  * `local`: input array of local coords
     *  * `global`: output array which receives the result
     *  * `globalPrecise`: (optional) sub-voxel offset to the output global position
     * 
     * If both output arrays are passed in, `global` will get int values and 
     * `globalPrecise` will get fractional parts. If only one array is passed in,
     * `global` will get the whole output position.
    */
    localToGlobal(local, global, globalPrecise = null) {
        var off = this.worldOriginOffset
        if (globalPrecise) {
            for (var i = 0; i < 3; i++) {
                var floored = Math.floor(local[i])
                global[i] = floored + off[i]
                globalPrecise[i] = local[i] - floored
            }
            return global
        } else {
            return vec3.add(global, local, off)
        }
    }




    /*
     *              Picking / raycasting
    */

    /**
     * Raycast through the world, returning a result object for any non-air block
     * 
     * See `/docs/positions.md` for info on working with precise positions.
     * 
     * @param {number[]} pos where to pick from (default: player's eye pos)
     * @param {number[]} dir direction to pick along (default: camera vector)
     * @param {number} dist pick distance (default: `noa.blockTestDistance`)
     * @param {(id:number) => boolean} blockTestFunction which voxel IDs can be picked (default: any solid voxel)
    */
    pick(pos = null, dir = null, dist = -1, blockTestFunction = null) {
        if (dist === 0) return null
        // input position to local coords, if any
        var pickPos = this._pickPos
        if (pos) {
            this.globalToLocal(pos, null, pickPos)
            pos = pickPos
        }
        return this._localPick(pos, dir, dist, blockTestFunction)
    }


    /**
     * @internal
     * Do a raycast in local coords. 
     * See `/docs/positions.md` for more info.
     * @param {number[]} pos where to pick from (default: player's eye pos)
     * @param {number[]} dir direction to pick along (default: camera vector)
     * @param {number} dist pick distance (default: `noa.blockTestDistance`)
     * @param {(id:number) => boolean} blockTestFunction which voxel IDs can be picked (default: any solid voxel)
     * @returns { null | {
     *      position: number[],
     *      normal: number[],
     *      _localPosition: number[],
     * }}
     */
    _localPick(pos = null, dir = null, dist = -1, blockTestFunction = null) {
        // do a raycast in local coords - result obj will be in global coords
        if (dist === 0) return null
        var testFn = blockTestFunction || this.registry.getBlockSolidity
        var world = this.world
        var off = this.worldOriginOffset
        var testVoxel = function (x, y, z) {
            var id = world.getBlockID(x + off[0], y + off[1], z + off[2])
            return testFn(id)
        }
        if (!pos) pos = this.camera._localGetTargetPosition()
        dir = dir || this.camera.getDirection()
        dist = dist || -1
        if (dist < 0) dist = this.blockTestDistance
        var result = this._pickResult
        var rpos = result._localPosition
        var rnorm = result.normal
        var hit = raycast(testVoxel, pos, dir, dist, rpos, rnorm)
        if (!hit) return null
        // position is right on a voxel border - adjust it so that flooring works reliably
        // adjust along normal direction, i.e. away from the block struck
        vec3.scaleAndAdd(rpos, rpos, rnorm, 0.01)
        // add global result
        this.localToGlobal(rpos, result.position)
        return result
    }

}



/*
 * 
 * 
 * 
 *                  INTERNAL HELPERS
 * 
 * 
 * 
 * 
*/




/*
 *
 *      rebase world origin offset around the player if necessary
 *
*/
function checkWorldOffset(noa) {
    var lpos = noa.ents.getPositionData(noa.playerEntity)._localPosition
    var cutoff = noa._originRebaseDistance
    if (vec3.sqrLen(lpos) < cutoff * cutoff) return
    var delta = []
    for (var i = 0; i < 3; i++) {
        delta[i] = Math.floor(lpos[i])
        noa.worldOriginOffset[i] += delta[i]
    }
    noa.rendering._rebaseOrigin(delta)
    noa.entities._rebaseOrigin(delta)
    noa._objectMesher._rebaseOrigin(delta)
}





// Each frame, by default pick along the player's view vector 
// and tell rendering to highlight the struck block face
function updateBlockTargets(noa) {
    var newhash = 0
    var blockIdFn = noa.blockTargetIdCheck || noa.registry.getBlockSolidity
    var result = noa._localPick(null, null, null, blockIdFn)
    if (result) {
        var dat = noa._targetedBlockDat
        // pick stops just shy of voxel boundary, so floored pos is the adjacent voxel
        vec3.floor(dat.adjacent, result.position)
        vec3.copy(dat.normal, result.normal)
        vec3.subtract(dat.position, dat.adjacent, dat.normal)
        dat.blockID = noa.world.getBlockID(dat.position[0], dat.position[1], dat.position[2])
        noa.targetedBlock = dat
        // arbitrary hash so we know when the targeted blockID/pos/face changes
        var pos = dat.position, norm = dat.normal
        var x = locationHasher(pos[0] + dat.blockID, pos[1], pos[2])
        x ^= locationHasher(norm[0], norm[1] + dat.blockID, norm[2])
        newhash = x
    } else {
        noa.targetedBlock = null
    }
    if (newhash != noa._prevTargetHash) {
        noa.emit('targetBlockChanged', noa.targetedBlock)
        noa._prevTargetHash = newhash
    }
}



/*
 * 
 *  add some hooks for guidance on removed APIs
 * 
 */

function deprecateStuff(noa) {
    var ver = `0.27`
    var dep = (loc, name, msg) => {
        var throwFn = () => { throw `This property changed in ${ver} - ${msg}` }
        Object.defineProperty(loc, name, { get: throwFn, set: throwFn })
    }
    dep(noa, 'getPlayerEyePosition', 'to get the camera/player offset see API docs for `noa.camera.cameraTarget`')
    dep(noa, 'setPlayerEyePosition', 'to set the camera/player offset see API docs for `noa.camera.cameraTarget`')
    dep(noa, 'getPlayerPosition', 'use `noa.ents.getPosition(noa.playerEntity)` or similar')
    dep(noa, 'getCameraVector', 'use `noa.camera.getDirection`')
    dep(noa, 'getPlayerMesh', 'use `noa.ents.getMeshData(noa.playerEntity).mesh` or similar')
    dep(noa, 'playerBody', 'use `noa.ents.getPhysicsBody(noa.playerEntity)`')
    dep(noa.rendering, 'zoomDistance', 'use `noa.camera.zoomDistance`')
    dep(noa.rendering, '_currentZoom', 'use `noa.camera.currentZoom`')
    dep(noa.rendering, '_cameraZoomSpeed', 'use `noa.camera.zoomSpeed`')
    dep(noa.rendering, 'getCameraVector', 'use `noa.camera.getDirection`')
    dep(noa.rendering, 'getCameraPosition', 'use `noa.camera.getLocalPosition`')
    dep(noa.rendering, 'getCameraRotation', 'use `noa.camera.heading` and `noa.camera.pitch`')
    dep(noa.rendering, 'setCameraRotation', 'to customize camera behavior see API docs for `noa.camera`')
    ver = '0.28'
    dep(noa.rendering, 'makeMeshInstance', 'removed, use Babylon\'s `mesh.createInstance`')
    dep(noa.world, '_maxChunksPendingCreation', 'use `maxChunksPendingCreation` (no "_")')
    dep(noa.world, '_maxChunksPendingMeshing', 'use `maxChunksPendingMeshing` (no "_")')
    dep(noa.world, '_maxProcessingPerTick', 'use `maxProcessingPerTick` (no "_")')
    dep(noa.world, '_maxProcessingPerRender', 'use `maxProcessingPerRender` (no "_")')
    ver = '0.29'
    dep(noa, '_constants', 'removed, voxel IDs are no longer packed with bit flags')
    ver = '0.30'
    dep(noa, '_tickRate', 'tickRate is now at `noa.tickRate`')
    dep(noa.container, '_tickRate', 'tickRate is now at `noa.tickRate`')
    ver = '0.31'
    dep(noa.world, 'chunkSize', 'effectively an internal, so changed to `_chunkSize`')
    dep(noa.world, 'chunkAddDistance', 'set this with `noa.world.setAddRemoveDistance`')
    dep(noa.world, 'chunkRemoveDistance', 'set this with `noa.world.setAddRemoveDistance`')
    ver = '0.33'
    dep(noa.rendering, 'postMaterialCreationHook', 'Removed - use mesh post-creation hook instead`')
}



var profile_hook = (PROFILE > 0) ?
    makeProfileHook(PROFILE, 'tick   ') : () => { }
var profile_hook_render = (PROFILE_RENDER > 0) ?
    makeProfileHook(PROFILE_RENDER, 'render ') : () => { }
````

## File: src/persistence/README.md
````markdown
# Persistence

Camada responsável por salvar/carregar o estado do setor. Mantemos uma interface simples
(`PersistenceAdapter`) para permitir trocar o backend sem tocar na lógica do jogo.

## Componentes

- `types.ts`: contratos do snapshot (`SectorSnapshot`, `ConstructionSnapshot`, etc.).
- `adapter.ts`: interface padrão para bibliotecas de storage.
- `local-storage-adapter.ts`: implementação local (browser) usando `localStorage`.
- `snapshot.ts`: captura e reidrata o estado (blocos colocados, dispositivos de energia, hotbar).
- `manager.ts`: orquestra autosave, beforeunload e geração de `playerId`.

## Fluxo Atual

1. **Bootstrap** cria `PersistenceManager` com o `LocalStorageAdapter`.
2. `load()` reidrata o setor (recoloca decks/painéis/baterias/terminais, restaura hotbar e MJ armazenado).
3. Autosave a cada 30 s + `beforeunload` garantem que o snapshot fique fresco.

## Próximos Passos

- Implementar `HttpAdapter` apontando para o backend real.
- Migrar de `localStorage` para storage assíncrono quando rodarmos em Electron/native.
- Validar snapshots com o schema em `data/schemas/sector-snapshot.schema.json` (AJV/Vitest).
````

## File: src/persistence/snapshot.ts
````typescript
import type { Engine } from 'noa-engine';
import type { HotbarApi } from '../player/hotbar';
import { INITIAL_HOTBAR_ITEMS } from '../config/hud-options';
import type { HotbarItemDefinition } from '../config/hud-options';
import type { SectorResources } from '../sector';
import type { EnergySystem } from '../systems/energy';
import type { TerminalSystem } from '../systems/terminals';
import { blockMetadataStore } from '../blocks/metadata-store';
import type { BlockKind, BlockOrientation } from '../blocks/types';
import type { VoxelPosition } from '../systems/energy/energy-network-manager';
import {
  SNAPSHOT_SCHEMA_VERSION,
  type SectorSnapshot,
  type SnapshotContextMeta,
  type HotbarSnapshot,
  type ConstructionSnapshot,
} from './types';

interface SnapshotContext {
  noa: Engine;
  sector: SectorResources;
  energy: EnergySystem;
  hotbar: HotbarApi;
  terminals: TerminalSystem;
}

const HOTBAR_SLOT_LIMIT = 9;

function clonePosition(position: VoxelPosition): VoxelPosition {
  return [position[0], position[1], position[2]];
}

function captureHotbar(hotbar: HotbarApi): HotbarSnapshot {
  const state = hotbar.controller.getState();
  const slotItemIds = state.slots.map((slot) => slot.item?.id ?? null);
  return {
    activeIndex: state.activeIndex,
    slotItemIds,
  };
}

function captureConstruction(ctx: SnapshotContext): ConstructionSnapshot {
  const decks = ctx.energy.listDecks().map((position) => ({ position: clonePosition(position) }));

  const orientationFor = (kind: BlockKind, position: VoxelPosition): BlockOrientation | undefined => {
    const value = blockMetadataStore.getOrientation({ kind, x: position[0], y: position[1], z: position[2] });
    return value ?? undefined;
  };

  const solarPanels = ctx.energy.listSolarPanels().map((panel) => ({
    position: clonePosition(panel.position),
    orientation: orientationFor(ctx.sector.starwatchBlocks.solarPanel.kind, panel.position),
  }));

  const batteries = ctx.energy.listBatteries().map((battery) => ({
    position: clonePosition(battery.position),
    storedMJ: battery.storedMJ,
    capacityMJ: battery.capacityMJ,
    orientation: orientationFor(ctx.sector.starwatchBlocks.battery.kind, battery.position),
  }));

  const terminals = ctx.energy.listTerminals().map((terminal) => ({
    position: clonePosition(terminal.position),
    orientation: orientationFor(ctx.sector.starwatchBlocks.halTerminal.kind, terminal.position),
  }));

  return {
    decks,
    solarPanels,
    batteries,
    terminals,
  };
}

export function captureSnapshot(ctx: SnapshotContext, meta: SnapshotContextMeta): SectorSnapshot {
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    player: {
      id: meta.playerId,
      lastSeenIso: new Date().toISOString(),
    },
    sector: {
      id: meta.sectorId,
    },
    construction: captureConstruction(ctx),
    hotbar: captureHotbar(ctx.hotbar),
  };
}

function rehydrateHotbar(hotbar: HotbarApi, snapshot: HotbarSnapshot): void {
  const knownItems = new Map<string, HotbarItemDefinition>();
  INITIAL_HOTBAR_ITEMS.forEach((item) => {
    knownItems.set(item.id, item);
  });
  const currentState = hotbar.controller.getState();
  currentState.slots.forEach((slot) => {
    if (slot.item) {
      knownItems.set(slot.item.id, slot.item);
    }
  });

  for (let index = 0; index < HOTBAR_SLOT_LIMIT; index += 1) {
    const itemId = snapshot.slotItemIds[index] ?? null;
    const definition = itemId ? knownItems.get(itemId) ?? null : null;
    hotbar.controller.setSlotItem(index, definition ?? null);
  }

  hotbar.controller.setActiveIndex(Math.max(0, Math.min(HOTBAR_SLOT_LIMIT - 1, snapshot.activeIndex)));
}

function placeBlock(noa: Engine, blockId: number, position: VoxelPosition): void {
  noa.setBlock(blockId, position[0], position[1], position[2]);
}

export function restoreSnapshot(ctx: SnapshotContext, snapshot: SectorSnapshot): void {
  blockMetadataStore.clear();

  for (const deck of snapshot.construction.decks) {
    placeBlock(ctx.noa, ctx.sector.starwatchBlocks.deck.id, deck.position);
    ctx.energy.networks.addDeck(deck.position);
  }

  for (const panel of snapshot.construction.solarPanels) {
    const orientation = panel.orientation ?? ctx.sector.starwatchBlocks.solarPanel.defaultOrientation;
    blockMetadataStore.setOrientation(
      {
        kind: ctx.sector.starwatchBlocks.solarPanel.kind,
        x: panel.position[0],
        y: panel.position[1],
        z: panel.position[2],
      },
      orientation,
    );
    placeBlock(ctx.noa, ctx.sector.starwatchBlocks.solarPanel.id, panel.position);
    ctx.energy.registerSolarPanel(panel.position);
    ctx.terminals.registerBlock(ctx.sector.starwatchBlocks.solarPanel.kind, panel.position);
  }

  for (const battery of snapshot.construction.batteries) {
    const orientation = battery.orientation ?? ctx.sector.starwatchBlocks.battery.defaultOrientation;
    blockMetadataStore.setOrientation(
      {
        kind: ctx.sector.starwatchBlocks.battery.kind,
        x: battery.position[0],
        y: battery.position[1],
        z: battery.position[2],
      },
      orientation,
    );
    placeBlock(ctx.noa, ctx.sector.starwatchBlocks.battery.id, battery.position);
    ctx.energy.registerBattery(battery.position);
    ctx.energy.setBatteryStored(battery.position, battery.storedMJ);
    ctx.terminals.registerBlock(ctx.sector.starwatchBlocks.battery.kind, battery.position);
  }

  for (const terminal of snapshot.construction.terminals) {
    const orientation = terminal.orientation ?? ctx.sector.starwatchBlocks.halTerminal.defaultOrientation;
    blockMetadataStore.setOrientation(
      {
        kind: ctx.sector.starwatchBlocks.halTerminal.kind,
        x: terminal.position[0],
        y: terminal.position[1],
        z: terminal.position[2],
      },
      orientation,
    );
    placeBlock(ctx.noa, ctx.sector.starwatchBlocks.halTerminal.id, terminal.position);
    ctx.energy.registerTerminal(terminal.position);
    ctx.terminals.registerBlock(ctx.sector.starwatchBlocks.halTerminal.kind, terminal.position);
  }

  rehydrateHotbar(ctx.hotbar, snapshot.hotbar);
}
````

## File: src/persistence/types.ts
````typescript
import type { BlockOrientation } from '../blocks/types';
import type { VoxelPosition } from '../systems/energy/energy-network-manager';

export const SNAPSHOT_SCHEMA_VERSION = 1;

export interface SnapshotPlayer {
  id: string;
  lastSeenIso: string;
}

export interface SnapshotSector {
  id: string;
  seed?: number;
}

export interface DeckSnapshotEntry {
  position: VoxelPosition;
}

export interface OrientedBlockSnapshotEntry {
  position: VoxelPosition;
  orientation?: BlockOrientation;
}

export interface BatterySnapshotEntry {
  position: VoxelPosition;
  storedMJ: number;
  capacityMJ: number;
  orientation?: BlockOrientation;
}

export interface ConstructionSnapshot {
  decks: DeckSnapshotEntry[];
  solarPanels: OrientedBlockSnapshotEntry[];
  batteries: BatterySnapshotEntry[];
  terminals: OrientedBlockSnapshotEntry[];
}

export interface HotbarSnapshot {
  activeIndex: number;
  slotItemIds: (string | null)[];
}

export interface SectorSnapshot {
  schemaVersion: number;
  player: SnapshotPlayer;
  sector: SnapshotSector;
  construction: ConstructionSnapshot;
  hotbar: HotbarSnapshot;
}

export interface SnapshotContextMeta {
  playerId: string;
  sectorId: string;
}
````

## File: src/sector/generation/platform.ts
````typescript
import { PLATFORM_HALF_EXTENT, PLATFORM_HEIGHT } from '../../config/sector-options';
import type { ChunkGenerationContext } from './types';

export function generateStartingPlatform(ctx: ChunkGenerationContext): void {
  if (ctx.bounds.maxY < PLATFORM_HEIGHT || ctx.bounds.minY > PLATFORM_HEIGHT) {
    return;
  }

  const deckBlockId = ctx.catalog.deck.id;

  const platformMinX = -PLATFORM_HALF_EXTENT;
  const platformMaxX = PLATFORM_HALF_EXTENT - 1;
  const platformMinZ = -PLATFORM_HALF_EXTENT;
  const platformMaxZ = PLATFORM_HALF_EXTENT - 1;

  for (let localX = 0; localX < ctx.dimensions.sizeX; localX += 1) {
    const worldX = ctx.bounds.minX + localX;
    if (worldX < platformMinX || worldX > platformMaxX) continue;

    for (let localZ = 0; localZ < ctx.dimensions.sizeZ; localZ += 1) {
      const worldZ = ctx.bounds.minZ + localZ;
      if (worldZ < platformMinZ || worldZ > platformMaxZ) continue;

      ctx.writeBlock(worldX, PLATFORM_HEIGHT, worldZ, deckBlockId);
    }
  }
}
````

## File: src/sector/generation/types.ts
````typescript
import type { SectorBlocks } from '../blocks';
import type { BlockCatalog } from '../../blocks/types';

export interface ChunkBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ChunkDimensions {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

export interface ChunkGenerationContext {
  blocks: SectorBlocks;
  catalog: BlockCatalog;
  bounds: ChunkBounds;
  dimensions: ChunkDimensions;
  writeBlock: (worldX: number, worldY: number, worldZ: number, blockId: number) => void;
}
````

## File: src/sector/chunk-generator.ts
````typescript
import type { Engine } from 'noa-engine';
import type { SectorBlocks } from './blocks';
import { runGenerationPipeline } from './generation';
import type { ChunkGenerationContext } from './generation/types';
import type { BlockCatalog } from '../blocks/types';

export function installChunkGenerator(noa: Engine, blocks: SectorBlocks, catalog: BlockCatalog): void {
  console.log('[starwatch] chunk generator habilitado (pipeline modular)');

  noa.world.on('worldDataNeeded', (requestID: number, data: any, x: number, y: number, z: number) => {
    const sizeX = data.shape[0];
    const sizeY = data.shape[1];
    const sizeZ = data.shape[2];

    const bounds = {
      minX: x,
      maxX: x + sizeX - 1,
      minY: y,
      maxY: y + sizeY - 1,
      minZ: z,
      maxZ: z + sizeZ - 1,
    };

    const writeBlock = (worldX: number, worldY: number, worldZ: number, blockId: number) => {
      if (worldY < bounds.minY || worldY > bounds.maxY) return;
      if (worldX < bounds.minX || worldX > bounds.maxX) return;
      if (worldZ < bounds.minZ || worldZ > bounds.maxZ) return;
      const ix = worldX - x;
      const iy = worldY - y;
      const iz = worldZ - z;
      data.set(ix, iy, iz, blockId);
    };

    const context: ChunkGenerationContext = {
      blocks,
      catalog,
      bounds,
      dimensions: {
        sizeX,
        sizeY,
        sizeZ,
      },
      writeBlock,
    };

    runGenerationPipeline(context);

    noa.world.setChunkData(requestID, data);
  });
}
````

## File: src/sector/index.ts
````typescript
import type { Engine } from 'noa-engine';
import { registerSectorMaterials, type SectorMaterials } from './materials';
import { registerSectorBlocks, type SectorBlocks } from './blocks';
import { installChunkGenerator } from './chunk-generator';
import { CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE } from '../config/render-options';
import { registerStarwatchBlocks } from '../blocks/register';
import type { BlockCatalog } from '../blocks/types';

export interface SectorResources {
  materials: SectorMaterials;
  terrainBlocks: SectorBlocks;
  starwatchBlocks: BlockCatalog;
}

export function initializeSector(noa: Engine): SectorResources {
  const materials = registerSectorMaterials(noa);
  const terrainBlocks = registerSectorBlocks(noa, materials);
  const starwatchBlocks = registerStarwatchBlocks(noa, materials, terrainBlocks.nextBlockId);
  installChunkGenerator(noa, terrainBlocks, starwatchBlocks);

  noa.world.setAddRemoveDistance(CHUNK_ADD_DISTANCE, CHUNK_REMOVE_DISTANCE);
  console.log('[starwatch] distâncias de chunk configuradas');

  return {
    materials,
    terrainBlocks,
    starwatchBlocks,
  };
}
````

## File: src/systems/energy/energy-network-manager.ts
````typescript
export type VoxelPosition = [number, number, number];

export interface EnergyNetworkMetrics {
  totalGenW: number;
  totalLoadW: number;
  totalCapMJ: number;
  totalStoredMJ: number;
}

export interface EnergyNetworkSnapshot {
  id: number;
  nodeCount: number;
  metrics: EnergyNetworkMetrics;
}

interface DeckNode {
  key: string;
  position: VoxelPosition;
  neighbors: Set<string>;
  networkId: number;
}

interface EnergyNetwork {
  id: number;
  nodes: Set<string>;
  metrics: EnergyNetworkMetrics;
}

const NEIGHBOR_OFFSETS: ReadonlyArray<VoxelPosition> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function makeKey(position: VoxelPosition): string {
  return `${position[0]}:${position[1]}:${position[2]}`;
}

function clonePosition(position: VoxelPosition): VoxelPosition {
  return [position[0], position[1], position[2]];
}

function createEmptyMetrics(): EnergyNetworkMetrics {
  return {
    totalGenW: 0,
    totalLoadW: 0,
    totalCapMJ: 0,
    totalStoredMJ: 0,
  };
}

function addMetrics(target: EnergyNetworkMetrics, delta: EnergyNetworkMetrics): void {
  target.totalGenW += delta.totalGenW;
  target.totalLoadW += delta.totalLoadW;
  target.totalCapMJ += delta.totalCapMJ;
  target.totalStoredMJ += delta.totalStoredMJ;
}

function subtractMetrics(target: EnergyNetworkMetrics, delta: EnergyNetworkMetrics): void {
  target.totalGenW -= delta.totalGenW;
  target.totalLoadW -= delta.totalLoadW;
  target.totalCapMJ -= delta.totalCapMJ;
  target.totalStoredMJ -= delta.totalStoredMJ;
}

export class EnergyNetworkManager {
  private readonly nodes = new Map<string, DeckNode>();
  private readonly networks = new Map<number, EnergyNetwork>();
  private nextNetworkId = 1;

  getNetworkSnapshot(networkId: number): EnergyNetworkSnapshot | null {
    const network = this.networks.get(networkId);
    if (!network) {
      return null;
    }
    return {
      id: network.id,
      nodeCount: network.nodes.size,
      metrics: { ...network.metrics },
    };
  }

  listNetworks(): EnergyNetworkSnapshot[] {
    return Array.from(this.networks.values()).map((network) => ({
      id: network.id,
      nodeCount: network.nodes.size,
      metrics: { ...network.metrics },
    }));
  }

  getNetworkIdForPosition(position: VoxelPosition): number | null {
    const key = makeKey(position);
    const node = this.nodes.get(key);
    return node ? node.networkId : null;
  }

  listDeckPositions(): VoxelPosition[] {
    return Array.from(this.nodes.values()).map((node) => clonePosition(node.position));
  }

  addDeck(position: VoxelPosition): number {
    const key = makeKey(position);
    if (this.nodes.has(key)) {
      return this.nodes.get(key)!.networkId;
    }

    const node: DeckNode = {
      key,
      position: clonePosition(position),
      neighbors: new Set(),
      networkId: -1,
    };

    const neighbors = this.getNeighborNodes(position);
    const neighborNetworkIds = new Set<number>();

    for (const neighbor of neighbors) {
      neighbor.neighbors.add(key);
      node.neighbors.add(neighbor.key);
      neighborNetworkIds.add(neighbor.networkId);
    }

    this.nodes.set(key, node);

    let assignedNetworkId: number;
    if (neighborNetworkIds.size === 0) {
      assignedNetworkId = this.createNetworkWithNodes([node]);
    } else {
      const [primaryNetworkId] = neighborNetworkIds;
      assignedNetworkId = primaryNetworkId;
      this.attachNodeToNetwork(node, primaryNetworkId);

      for (const networkId of neighborNetworkIds) {
        if (networkId !== primaryNetworkId) {
          this.mergeNetworks(primaryNetworkId, networkId);
        }
      }
    }

    return assignedNetworkId;
  }

  removeDeck(position: VoxelPosition): void {
    const key = makeKey(position);
    const node = this.nodes.get(key);
    if (!node) {
      return;
    }

    const originalNetworkId = node.networkId;

    for (const neighborKey of node.neighbors) {
      const neighbor = this.nodes.get(neighborKey);
      if (neighbor) {
        neighbor.neighbors.delete(key);
      }
    }

    this.nodes.delete(key);

    const network = this.networks.get(originalNetworkId);
    if (!network) {
      return;
    }

    network.nodes.delete(key);

    if (network.nodes.size === 0) {
      this.networks.delete(originalNetworkId);
      return;
    }

    this.rebuildNetwork(originalNetworkId, network.nodes);
  }

  adjustNetworkMetrics(networkId: number, delta: Partial<EnergyNetworkMetrics>): void {
    const network = this.networks.get(networkId);
    if (!network) {
      return;
    }

    if (typeof delta.totalGenW === 'number') {
      network.metrics.totalGenW += delta.totalGenW;
    }
    if (typeof delta.totalLoadW === 'number') {
      network.metrics.totalLoadW += delta.totalLoadW;
    }
    if (typeof delta.totalCapMJ === 'number') {
      network.metrics.totalCapMJ += delta.totalCapMJ;
    }
    if (typeof delta.totalStoredMJ === 'number') {
      network.metrics.totalStoredMJ += delta.totalStoredMJ;
    }
  }

  private createNetworkWithNodes(nodes: DeckNode[]): number {
    const id = this.nextNetworkId++;
    const network: EnergyNetwork = {
      id,
      nodes: new Set(nodes.map((node) => node.key)),
      metrics: createEmptyMetrics(),
    };
    this.networks.set(id, network);

    for (const node of nodes) {
      node.networkId = id;
    }

    return id;
  }

  private attachNodeToNetwork(node: DeckNode, networkId: number): void {
    const network = this.networks.get(networkId);
    if (!network) {
      throw new Error(`Rede ${networkId} inexistente ao anexar deck.`);
    }
    network.nodes.add(node.key);
    node.networkId = networkId;
  }

  private mergeNetworks(targetNetworkId: number, sourceNetworkId: number): void {
    if (targetNetworkId === sourceNetworkId) {
      return;
    }

    const target = this.networks.get(targetNetworkId);
    const source = this.networks.get(sourceNetworkId);
    if (!target || !source) {
      return;
    }

    for (const key of source.nodes) {
      const node = this.nodes.get(key);
      if (!node) {
        continue;
      }
      node.networkId = targetNetworkId;
      target.nodes.add(key);
    }

    addMetrics(target.metrics, source.metrics);

    this.networks.delete(sourceNetworkId);
  }

  private rebuildNetwork(originalNetworkId: number, remainingKeys: Set<string>): void {
    this.networks.delete(originalNetworkId);

    const remaining = new Set(remainingKeys);
    const visited = new Set<string>();

    const queue: string[] = [];

    const flushComponent = (startKey: string) => {
      queue.length = 0;
      queue.push(startKey);
      visited.add(startKey);

      const componentNodes: DeckNode[] = [];

      while (queue.length > 0) {
        const currentKey = queue.shift()!;
        const node = this.nodes.get(currentKey);
        if (!node) {
          continue;
        }
        componentNodes.push(node);

        for (const neighborKey of node.neighbors) {
          if (!remaining.has(neighborKey) || visited.has(neighborKey)) {
            continue;
          }
          visited.add(neighborKey);
          queue.push(neighborKey);
        }
      }

      if (componentNodes.length > 0) {
        this.createNetworkWithNodes(componentNodes);
      }
    };

    for (const key of remaining) {
      if (visited.has(key)) {
        continue;
      }
      flushComponent(key);
    }
  }

  private getNeighborNodes(position: VoxelPosition): DeckNode[] {
    const neighbors: DeckNode[] = [];
    for (const offset of NEIGHBOR_OFFSETS) {
      const neighborPos: VoxelPosition = [
        position[0] + offset[0],
        position[1] + offset[1],
        position[2] + offset[2],
      ];
      const neighbor = this.nodes.get(makeKey(neighborPos));
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
}
````

## File: src/systems/terminals/battery-terminal-display.ts
````typescript
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { BatteryTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, drawProgressBar, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatMegajoules, formatWatts, formatPercent } from './format';

type BatteryOptions = BaseTerminalDisplayOptions<BatteryTerminalData>;

export class BatteryTerminalDisplay extends BaseTerminalDisplay<BatteryTerminalData> {
  constructor(options: BatteryOptions) {
    super(options);
    this.createSupport(options);
  }

  protected drawContent(activeTabId: string | null, data: BatteryTerminalData): void {
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!data.snapshot) {
      drawCenteredMessage(ctx, area, ['BATERIA OFFLINE', 'CONECTE AO DECK']);
      return;
    }

    if (activeTabId === 'network') {
      this.drawNetwork(ctx, area, data);
    } else {
      this.drawStatus(ctx, area, data);
    }
  }

  private drawStatus(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: BatteryTerminalData): void {
    const { snapshot } = data;
    if (!snapshot) {
      drawCenteredMessage(ctx, area, ['SEM DADOS']);
      return;
    }
    const fill = snapshot.storedMJ / snapshot.capacityMJ;
    drawProgressBar(ctx, area, fill, {
      label: `${formatPercent(fill)} (${formatMegajoules(snapshot.storedMJ)} / ${formatMegajoules(snapshot.capacityMJ)})`,
      color: fill > 0.8 ? 'rgba(120, 225, 160, 0.9)' : 'rgba(120, 200, 255, 0.9)',
    });
  }

  private drawNetwork(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: BatteryTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['REDE NÃO DETECTADA']);
      return;
    }
    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'RESERVA TOTAL', value: formatMegajoules(overview.metrics.totalStoredMJ) },
      { label: 'GERAÇÃO', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'Δ', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }

  private createSupport(options: BatteryOptions): void {
    const key = options.position.join(':');
    this.createDecorBox(
      `battery-terminal-frame-${key}`,
      {
        width: options.physicalWidth + 0.14,
        height: options.physicalHeight + 0.14,
        depth: 0.08,
      },
      {
        distance: this.mountOffset - 0.04,
        color: new Color3(0.07, 0.12, 0.22),
        emissive: new Color3(0.05, 0.08, 0.16),
        renderingGroupId: 2,
      },
    );

    this.createDecorBox(
      `battery-terminal-bracket-${key}`,
      {
        width: 0.2,
        height: options.physicalHeight + 0.06,
        depth: 0.18,
      },
      {
        distance: this.mountOffset - 0.16,
        color: new Color3(0.05, 0.09, 0.15),
        emissive: new Color3(0.03, 0.05, 0.09),
        renderingGroupId: 1,
      },
    );

    this.createDecorBox(
      `battery-terminal-backplate-${key}`,
      {
        width: options.physicalWidth + 0.22,
        height: options.physicalHeight + 0.22,
        depth: 0.06,
      },
      {
        distance: this.mountOffset - 0.24,
        color: new Color3(0.04, 0.07, 0.12),
        emissive: new Color3(0.02, 0.04, 0.08),
        renderingGroupId: 1,
      },
    );
  }
}
````

## File: src/systems/terminals/helpers.ts
````typescript
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { BlockOrientation } from '../../blocks/types';

export function orientationToYaw(orientation: BlockOrientation): number {
  switch (orientation) {
    case 'north':
      return Math.PI;
    case 'east':
      return Math.PI / 2;
    case 'south':
      return 0;
    case 'west':
      return -Math.PI / 2;
    default:
      return 0;
  }
}

export function orientationToNormal(orientation: BlockOrientation): Vector3 {
  switch (orientation) {
    case 'north':
      return new Vector3(0, 0, -1);
    case 'east':
      return new Vector3(1, 0, 0);
    case 'south':
      return new Vector3(0, 0, 1);
    case 'west':
      return new Vector3(-1, 0, 0);
    default:
      return new Vector3(0, 0, 1);
  }
}
````

## File: src/systems/terminals/index.ts
````typescript
import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { EnergySystem } from '../energy';
import type { BlockKind } from '../../blocks/types';
import type { VoxelPosition } from '../energy/energy-network-manager';
import { TerminalDisplayManager } from './terminal-display-manager';

export interface TerminalSystem {
  registerBlock(kind: BlockKind, position: VoxelPosition): void;
  unregisterBlock(kind: BlockKind, position: VoxelPosition): void;
  openTerminal(kind: BlockKind, position: VoxelPosition): boolean;
  closeActiveTerminal(): void;
  getActiveTerminal(): { kind: BlockKind; position: VoxelPosition } | null;
  isCapturingInput(): boolean;
  setHighlightedTerminal(target: { kind: BlockKind; position: VoxelPosition } | null): void;
  destroy(): void;
}

interface TerminalSystemOptions {
  noa: Engine;
  overlay: OverlayApi;
  energy: EnergySystem;
}

export function initializeTerminalSystem(options: TerminalSystemOptions): TerminalSystem {
  const manager = new TerminalDisplayManager({
    noa: options.noa,
    energy: options.energy,
    overlay: options.overlay,
  });

  for (const terminal of options.energy.listTerminals()) {
    manager.registerBlock('starwatch:hal-terminal', terminal.position);
  }
  for (const battery of options.energy.listBatteries()) {
    manager.registerBlock('starwatch:battery', battery.position);
  }
  for (const panel of options.energy.listSolarPanels()) {
    manager.registerBlock('starwatch:solar-panel', panel.position);
  }

  return {
    registerBlock(kind, position) {
      manager.registerBlock(kind, position);
    },
    unregisterBlock(kind, position) {
      manager.unregisterBlock(kind, position);
    },
    openTerminal(kind, position) {
      return manager.tryOpenTerminal(position, kind);
    },
    closeActiveTerminal() {
      manager.closeActiveTerminal();
    },
    getActiveTerminal() {
      return manager.getActiveTerminal();
    },
    isCapturingInput() {
      return manager.isCapturingInput();
    },
    setHighlightedTerminal(target) {
      manager.setHighlightedTerminal(target);
    },
    destroy() {
      manager.destroy();
    },
  };
}
````

## File: src/systems/terminals/solar-terminal-display.ts
````typescript
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { BaseTerminalDisplay, type BaseTerminalDisplayOptions } from './terminal-display';
import type { SolarTerminalData } from './types';
import { clearContent, drawCenteredMessage, drawMetricList, type MetricRow, type MetricVariant } from './render-helpers';
import { formatDelta, formatPercent, formatWatts } from './format';

type SolarOptions = BaseTerminalDisplayOptions<SolarTerminalData>;

export class SolarTerminalDisplay extends BaseTerminalDisplay<SolarTerminalData> {
  constructor(options: SolarOptions) {
    super(options);
    this.createSupport(options);
  }

  protected drawContent(activeTabId: string | null, data: SolarTerminalData): void {
    const area = this.contentArea;
    const ctx = this.ctx;
    clearContent(ctx, area);

    if (!data.snapshot) {
      drawCenteredMessage(ctx, area, ['PAINEL INATIVO', 'VERIFIQUE OBSTRUÇÕES']);
      return;
    }

    if (activeTabId === 'network') {
      this.drawNetwork(ctx, area, data);
    } else {
      this.drawStatus(ctx, area, data);
    }
  }

  private drawStatus(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: SolarTerminalData): void {
    const { snapshot } = data;
    if (!snapshot) {
      drawCenteredMessage(ctx, area, ['SEM DADOS DISPONÍVEIS']);
      return;
    }
    const rows: MetricRow[] = [
      { label: 'SAÍDA ATUAL', value: formatWatts(snapshot.outputW), variant: 'accent' },
      { label: 'SOMBREAMENTO', value: formatPercent(snapshot.shade) },
    ];
    drawMetricList(ctx, area, rows);
  }

  private drawNetwork(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }, data: SolarTerminalData): void {
    const { overview } = data;
    if (!overview) {
      drawCenteredMessage(ctx, area, ['SEM REDE']);
      return;
    }
    const deltaVariant: MetricVariant = overview.metrics.deltaW >= 0 ? 'positive' : 'negative';
    const rows: MetricRow[] = [
      { label: 'REDE', value: `#${overview.id.toString().padStart(4, '0')}`, variant: 'accent' },
      { label: 'GERAÇÃO TOTAL', value: formatWatts(overview.metrics.totalGenW) },
      { label: 'CONSUMO', value: formatWatts(overview.metrics.totalLoadW) },
      { label: 'Δ', value: formatDelta(overview.metrics.deltaW), variant: deltaVariant },
    ];
    drawMetricList(ctx, area, rows);
  }

  private createSupport(options: SolarOptions): void {
    const key = options.position.join(':');
    this.createDecorBox(
      `solar-terminal-frame-${key}`,
      {
        width: options.physicalWidth + 0.14,
        height: options.physicalHeight + 0.14,
        depth: 0.08,
      },
      {
        distance: this.mountOffset - 0.04,
        color: new Color3(0.07, 0.12, 0.22),
        emissive: new Color3(0.05, 0.08, 0.16),
        renderingGroupId: 2,
      },
    );

    this.createDecorBox(
      `solar-terminal-bracket-${key}`,
      {
        width: 0.18,
        height: options.physicalHeight + 0.06,
        depth: 0.18,
      },
      {
        distance: this.mountOffset - 0.16,
        color: new Color3(0.05, 0.09, 0.15),
        emissive: new Color3(0.03, 0.05, 0.09),
        renderingGroupId: 1,
      },
    );

    this.createDecorBox(
      `solar-terminal-backplate-${key}`,
      {
        width: options.physicalWidth + 0.22,
        height: options.physicalHeight + 0.22,
        depth: 0.06,
      },
      {
        distance: this.mountOffset - 0.24,
        color: new Color3(0.04, 0.07, 0.12),
        emissive: new Color3(0.02, 0.04, 0.08),
        renderingGroupId: 1,
      },
    );
  }
}
````

## File: src/systems/README.md
````markdown
# Runtime Systems

Cada subsistema fica encapsulado em seu próprio diretório e expõe uma função
`initializeX(noa, context)` consumida pelo bootstrap em `src/core/bootstrap.ts`.

## Energia (`energy/`)

- `index.ts` mantém o passo a 1 Hz, lida com sombreamento (`fast-voxel-raycast`) e agrega
  métricas por rede (geração, consumo, capacidade, armazenamento).
- `energy-network-manager.ts` implementa o DSU de decks (merge/split por adjacência ortogonal).
- `debug-overlay.ts` é ativado quando `VITE_DEBUG_ENERGY=1` e renderiza métricas + log a cada 5 s.

**Como testar**

1. Inicie o jogo (`pnpm dev`).
2. Construa uma malha de `Deck` ligando solares/baterias.
3. Observe o HUD look-at (mirar painel/bateria ≤3 m) e abra o terminal `E` para validar agregados.
4. Para debug, rode `VITE_DEBUG_ENERGY=1 pnpm dev`; o overlay aparece no canto superior direito e
   a cada 5 s é impresso um snapshot em `console.log`.

## Interactions (`interactions/`)

- `use-system.ts` processa a entrada `E` com debounce, verifica alcance (3 m) e abre o overlay React
  com os detalhes do terminal HAL.

Adicione novos sistemas seguindo esse padrão modular, sempre retornando APIs explícitas e sem side
effects globais escondidos.
````

## File: src/blocks/README.md
````markdown
# Custom Blocks

Este diretório consolida todo o registro de blocos “de gameplay” do slice Energia & Terminal.

- `register.ts` expõe `registerStarwatchBlocks()` que recebe a instância do NOA e os materiais
  registrados em `world/materials.ts`. Ali ficam centralizados os IDs dos blocos Deck, Painel,
  Bateria e Terminal.
- `metadata-store.ts` mantém metadados adicionais (ex.: orientação) por voxel usando chaves
  `${kind}:${x}:${y}:${z}`. Sempre use esse helper ao salvar/consultar orientações para evitar
  vazamentos de detalhes na camada de systems.
- `types.ts` define o contrato (`BlockCatalog`) que o mundo expõe para outros módulos.

## Como testar

1. Execute `pnpm dev` e entre no jogo.
2. Use as teclas `1–4` ou scroll para selecionar um bloco da hotbar.
3. Posicione o fantasma onde queira instanciar e clique para colocar.
4. Remover blocos com `Mouse1` (segurar) ou `X` garante que o catálogo limpe as orientações registradas.

Qualquer novo bloco deve ser adicionado aqui, mantendo o registro centralizado e documentado.
````

## File: src/blocks/register.ts
````typescript
import type { Engine } from 'noa-engine';
import type { SectorMaterials } from '../sector/materials';
import type { BlockCatalog, BlockDefinition, BlockKind } from './types';

function registerSimpleBlock(
  noa: Engine,
  blockId: number,
  options: {
    material: string;
    solid?: boolean;
    opaque?: boolean;
  },
  definition: Omit<BlockDefinition, 'id'>,
): BlockDefinition {
  const id = noa.registry.registerBlock(blockId, {
    material: options.material,
    solid: options.solid ?? true,
    opaque: options.opaque ?? true,
  });

  return {
    ...definition,
    id,
  };
}

export function registerStarwatchBlocks(
  noa: Engine,
  materials: SectorMaterials,
  startingBlockId: number,
): BlockCatalog {
  let nextId = startingBlockId;

  const deck = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.deck.name, solid: true, opaque: true },
    {
      kind: 'starwatch:deck',
      orientable: false,
      defaultOrientation: 'north',
    },
  );
  nextId += 1;

  const solarPanel = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.solarPanel.name, solid: true, opaque: false },
    {
      kind: 'starwatch:solar-panel',
      orientable: true,
      defaultOrientation: 'south',
    },
  );
  nextId += 1;

  const battery = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.battery.name, solid: true, opaque: true },
    {
      kind: 'starwatch:battery',
      orientable: true,
      defaultOrientation: 'south',
    },
  );
  nextId += 1;

  const halTerminal = registerSimpleBlock(
    noa,
    nextId,
    { material: materials.terminal.name, solid: true, opaque: true },
    {
      kind: 'starwatch:hal-terminal',
      orientable: true,
      defaultOrientation: 'south',
    },
  );

  const byKind = new Map<BlockKind, BlockDefinition>([
    [deck.kind, deck],
    [solarPanel.kind, solarPanel],
    [battery.kind, battery],
    [halTerminal.kind, halTerminal],
  ]);

  const byId = new Map<number, BlockDefinition>([
    [deck.id, deck],
    [solarPanel.id, solarPanel],
    [battery.id, battery],
    [halTerminal.id, halTerminal],
  ]);

  console.log('[starwatch] blocos de gameplay registrados', {
    deck: deck.id,
    solarPanel: solarPanel.id,
    battery: battery.id,
    halTerminal: halTerminal.id,
  });

  return {
    deck,
    solarPanel,
    battery,
    halTerminal,
    byKind,
    byId,
  };
}
````

## File: src/config/engine-options.ts
````typescript
import type { Engine } from 'noa-engine';
import { CHUNK_ADD_DISTANCE, CHUNK_SIZE } from './render-options';
import { PLAYER_SPAWN_POSITION } from './sector-options';

export type EngineOptions = ConstructorParameters<typeof Engine>[0];

export const ENGINE_OPTIONS: EngineOptions = {
  inverseY: false,
  chunkSize: CHUNK_SIZE,
  chunkAddDistance: CHUNK_ADD_DISTANCE,
  playerStart: PLAYER_SPAWN_POSITION,
  playerAutoStep: true,
  playerShadowComponent: false,
  originRebaseDistance: 32,
  stickyPointerLock: true,
  dragCameraOutsidePointerLock: false,
  maxRenderRate: 0,
  blockTestDistance: 16,
};
````

## File: src/player/index.ts
````typescript
import type { Engine } from 'noa-engine';
import { PLAYER_MOVEMENT } from '../config/player-options';
import type { HotbarApi } from './hotbar';
import type { OverlayApi } from '../hud/overlay';

interface PlayerDependencies {
  hotbar: HotbarApi;
  overlay: OverlayApi;
}

export function initializePlayer(noa: Engine, { hotbar, overlay }: PlayerDependencies): void {
  const movement = noa.entities.getMovement(noa.playerEntity);
  movement.maxSpeed = PLAYER_MOVEMENT.maxSpeed;
  movement.moveForce = PLAYER_MOVEMENT.moveForce;

  noa.inputs.bind('pause', 'KeyP');
  let paused = false;
  noa.inputs.down.on('pause', () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    paused = !paused;
    noa.setPaused(paused);
    console.log('[starwatch] jogo %s', paused ? 'pausado' : 'retomado');
  });

  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).starwatchHotbar = hotbar.controller;
  }
}
````

## File: src/systems/terminals/terminal-display-manager.ts
````typescript
import type { Engine } from 'noa-engine';
import type { Scene } from '@babylonjs/core/scene';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { OverlayApi } from '../../hud/overlay';
import type { EnergySystem } from '../energy';
import type { VoxelPosition } from '../energy/energy-network-manager';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { BlockKind, BlockOrientation } from '../../blocks/types';
import {
  BatteryTerminalDisplay,
} from './battery-terminal-display';
import {
  BaseTerminalDisplay,
  type BaseTerminalDisplayOptions,
} from './terminal-display';
import {
  HalTerminalDisplay,
} from './hal-terminal-display';
import {
  SolarTerminalDisplay,
} from './solar-terminal-display';
import type {
  BatteryTerminalData,
  HalTerminalData,
  SolarTerminalData,
  TerminalDisplayKind,
  TerminalPointerEvent,
} from './types';

type TerminalInstance = BaseTerminalDisplay<HalTerminalData | BatteryTerminalData | SolarTerminalData>;

interface TerminalManagerOptions {
  noa: Engine;
  energy: EnergySystem;
  overlay: OverlayApi;
}

interface DisplayEntry {
  display: TerminalInstance;
  blockKind: BlockKind;
  position: VoxelPosition;
}

const BLOCK_KIND_TO_DISPLAY: Record<BlockKind, TerminalDisplayKind | null> = {
  'starwatch:deck': null,
  'starwatch:solar-panel': 'solar-panel',
  'starwatch:battery': 'battery',
  'starwatch:hal-terminal': 'hal-terminal',
};

function makePositionKey(position: VoxelPosition, kind: TerminalDisplayKind): string {
  return `${kind}:${position[0]}:${position[1]}:${position[2]}`;
}

export class TerminalDisplayManager {
  private readonly noa: Engine;
  private readonly scene: Scene;
  private readonly energy: EnergySystem;
  private readonly overlay: OverlayApi;
  private readonly displays = new Map<string, DisplayEntry>();

  private disposeEnergyListener: (() => void) | null = null;
  private activeKey: string | null = null;
  private activeContext: { blockKind: BlockKind; position: VoxelPosition } | null = null;
  private highlightedKey: string | null = null;

  private readonly handlePointerDown = (event: PointerEvent) => this.onPointerDown(event);
  private readonly handleKeyDown = (event: KeyboardEvent) => this.onKeyDown(event);
  private readonly handleAimUpdate = () => this.updateAimHover();
  private readonly handleFireDown = (event: MouseEvent) => this.onFireDown(event);
  private detachFireListener: (() => void) | null = null;

  constructor(options: TerminalManagerOptions) {
    this.noa = options.noa;
    this.energy = options.energy;
    this.overlay = options.overlay;
    this.scene = options.noa.rendering.getScene();

    this.disposeEnergyListener = this.energy.subscribe(() => {
      this.refreshAll();
    });
    this.noa.on('beforeRender', this.handleAimUpdate);
    const fireDown = this.noa.inputs?.down as { on?: (action: string, handler: (...args: any[]) => void) => void; off?: (action: string, handler: (...args: any[]) => void) => void } | undefined;
    if (fireDown?.on) {
      fireDown.on('fire', this.handleFireDown);
      this.detachFireListener = () => {
        fireDown.off?.('fire', this.handleFireDown);
      };
    }
  }

  destroy(): void {
    this.disposeEnergyListener?.();
    this.disposeEnergyListener = null;
    this.noa.off('beforeRender', this.handleAimUpdate);
    this.detachFireListener?.();
    this.detachFireListener = null;
    this.endSession();
    this.overlay.controller.setPointerPassthrough(false);
    this.setHighlightKey(null);
    for (const entry of this.displays.values()) {
      entry.display.dispose();
    }
    this.displays.clear();
  }

  registerBlock(kind: BlockKind, position: VoxelPosition): void {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return;
    }
    const key = makePositionKey(position, displayKind);
    if (this.displays.has(key)) {
      return;
    }
    const orientation = this.resolveOrientation(kind, position);
    const display = this.createDisplay(displayKind, {
      position,
      orientation,
    });
    if (!display) {
      return;
    }
    for (const mesh of display.getMeshes()) {
      const rendering: any = this.noa.rendering;
      if (rendering && typeof rendering.addMeshToScene === 'function') {
        rendering.addMeshToScene(mesh, false);
      }
    }
    this.displays.set(key, {
      display,
      blockKind: kind,
      position: [position[0], position[1], position[2]] as VoxelPosition,
    });
    if (this.highlightedKey === key) {
      display.setHighlighted(true);
    }
  }

  unregisterBlock(kind: BlockKind, position: VoxelPosition): void {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return;
    }
    const key = makePositionKey(position, displayKind);
    if (this.activeKey === key) {
      this.endSession();
    }
    const entry = this.displays.get(key);
    if (!entry) {
      return;
    }
    entry.display.dispose();
    this.displays.delete(key);
    if (this.highlightedKey === key) {
      this.highlightedKey = null;
    }
  }

  refreshAll(): void {
    for (const entry of this.displays.values()) {
      entry.display.refresh();
    }
  }

  tryOpenTerminal(position: VoxelPosition, kind: BlockKind): boolean {
    const displayKind = BLOCK_KIND_TO_DISPLAY[kind];
    if (!displayKind) {
      return false;
    }
    const key = makePositionKey(position, displayKind);
    const entry = this.displays.get(key);
    if (!entry) {
      return false;
    }
    this.setHighlightKey(key);
    this.beginSession(key, entry);
    return true;
  }

  isCapturingInput(): boolean {
    return this.activeKey !== null;
  }

  closeActiveTerminal(): void {
    this.endSession();
  }

  setHighlightedTerminal(target: { kind: BlockKind; position: VoxelPosition } | null): void {
    if (!target) {
      this.setHighlightKey(null);
      return;
    }
    const displayKind = BLOCK_KIND_TO_DISPLAY[target.kind];
    if (!displayKind) {
      this.setHighlightKey(null);
      return;
    }
    const key = makePositionKey(target.position, displayKind);
    this.setHighlightKey(key);
  }

  getActiveTerminal(): { kind: BlockKind; position: VoxelPosition } | null {
    if (!this.activeContext) {
      return null;
    }
    return {
      kind: this.activeContext.blockKind,
      position: [
        this.activeContext.position[0],
        this.activeContext.position[1],
        this.activeContext.position[2],
      ] as VoxelPosition,
    };
  }

  private beginSession(key: string, entry: DisplayEntry): void {
    if (this.activeKey === key) {
      entry.display.setSessionActive(true);
      this.overlay.controller.setCapture(true);
      this.overlay.controller.setPointerPassthrough(true);
      this.activeContext = {
        blockKind: entry.blockKind,
        position: [
          entry.position[0],
          entry.position[1],
          entry.position[2],
        ] as VoxelPosition,
      };
      this.setHighlightKey(key);
      entry.display.setHoverByUV(this.pickCrosshairUV(entry.display));
      return;
    }
    this.endSession();
    this.activeKey = key;
    entry.display.setSessionActive(true);
    this.overlay.controller.setCapture(true);
    this.overlay.controller.setPointerPassthrough(true);
    this.activeContext = {
      blockKind: entry.blockKind,
      position: [
        entry.position[0],
        entry.position[1],
        entry.position[2],
      ] as VoxelPosition,
    };
    this.setHighlightKey(key);
    entry.display.setHoverByUV(this.pickCrosshairUV(entry.display));
    const canvas = this.noa.container.canvas;
    canvas.addEventListener('pointerdown', this.handlePointerDown, true);
    window.addEventListener('keydown', this.handleKeyDown, true);
  }

  private endSession(): void {
    if (!this.activeKey) {
      return;
    }
    const canvas = this.noa.container.canvas;
    canvas.removeEventListener('pointerdown', this.handlePointerDown, true);
    window.removeEventListener('keydown', this.handleKeyDown, true);

    const entry = this.displays.get(this.activeKey);
    if (entry) {
      entry.display.setHoverByUV(null);
      entry.display.setSessionActive(false);
    }
    this.activeKey = null;
    this.activeContext = null;
    this.overlay.controller.setCapture(false);
    this.overlay.controller.setPointerPassthrough(false);
  }

  private resolveOrientation(kind: BlockKind, position: VoxelPosition): BlockOrientation {
    const stored = blockMetadataStore.getOrientation({ kind, x: position[0], y: position[1], z: position[2] });
    return stored ?? 'south';
  }

  private createDisplay(displayKind: TerminalDisplayKind, params: { position: VoxelPosition; orientation: BlockOrientation }): TerminalInstance | null {
    const { position, orientation } = params;
    const scene = this.scene;
    switch (displayKind) {
      case 'hal-terminal':
        return new HalTerminalDisplay(this.buildHalOptions(scene, position, orientation));
      case 'battery':
        return new BatteryTerminalDisplay(this.buildBatteryOptions(scene, position, orientation));
      case 'solar-panel':
        return new SolarTerminalDisplay(this.buildSolarOptions(scene, position, orientation));
      default:
        return null;
    }
  }

  private buildHalOptions(scene: Scene, position: VoxelPosition, orientation: BlockOrientation): BaseTerminalDisplayOptions<HalTerminalData> {
    return {
      scene,
      position,
      orientation,
      kind: 'hal-terminal',
      physicalWidth: 0.8,
      physicalHeight: 0.58,
      textureWidth: 1024,
      textureHeight: 768,
      elevation: 1.5,
      mountOffset: 0.52,
      title: 'HAL-9001 // CRT',
      accentColor: 'rgba(150, 220, 255, 0.9)',
      dataProvider: () => this.collectHalData(position),
      tabs: [
        { id: 'overview', label: 'Rede' },
        { id: 'power', label: 'Energia' },
        { id: 'devices', label: 'Inventário' },
      ],
    };
  }

  private buildBatteryOptions(scene: Scene, position: VoxelPosition, orientation: BlockOrientation): BaseTerminalDisplayOptions<BatteryTerminalData> {
    return {
      scene,
      position,
      orientation,
      kind: 'battery',
      physicalWidth: 0.48,
      physicalHeight: 0.32,
      textureWidth: 640,
      textureHeight: 420,
      elevation: 0.8,
      mountOffset: 0.51,
      title: 'BTR NODE',
      accentColor: 'rgba(120, 200, 255, 0.85)',
      dataProvider: () => this.collectBatteryData(position),
      tabs: [
        { id: 'status', label: 'Status' },
        { id: 'network', label: 'Rede' },
      ],
    };
  }

  private buildSolarOptions(scene: Scene, position: VoxelPosition, orientation: BlockOrientation): BaseTerminalDisplayOptions<SolarTerminalData> {
    return {
      scene,
      position,
      orientation,
      kind: 'solar-panel',
      physicalWidth: 0.52,
      physicalHeight: 0.34,
      textureWidth: 640,
      textureHeight: 420,
      elevation: 0.9,
      mountOffset: 0.51,
      title: 'SOL-LINK',
      accentColor: 'rgba(120, 205, 255, 0.85)',
      dataProvider: () => this.collectSolarData(position),
      tabs: [
        { id: 'status', label: 'Status' },
        { id: 'network', label: 'Rede' },
      ],
    };
  }

  private collectHalData(position: VoxelPosition): HalTerminalData {
    const terminal = this.energy.getTerminalSnapshot(position);
    const overview = terminal?.networkId != null ? this.energy.getNetworkOverview(terminal.networkId) : null;
    return { terminal, overview };
  }

  private collectBatteryData(position: VoxelPosition): BatteryTerminalData {
    const snapshot = this.energy.getBatterySnapshot(position);
    const overview = snapshot?.networkId != null ? this.energy.getNetworkOverview(snapshot.networkId) : null;
    return { snapshot, overview };
  }

  private collectSolarData(position: VoxelPosition): SolarTerminalData {
    const snapshot = this.energy.getSolarPanelSnapshot(position);
    const overview = snapshot?.networkId != null ? this.energy.getNetworkOverview(snapshot.networkId) : null;
    return { snapshot, overview };
  }

  private onPointerDown(event: PointerEvent): void {
    const activeEntry = this.getActiveEntry();
    if (!activeEntry) {
      return;
    }
    const uv = this.pickCrosshairUV(activeEntry.entry.display);
    if (!uv) {
      activeEntry.entry.display.setHoverByUV(null);
      return;
    }
    const handled = activeEntry.entry.display.handlePointer({
      uv,
      button: event.button,
    });
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    const activeEntry = this.getActiveEntry();
    if (!activeEntry) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.endSession();
      return;
    }
    const handled = activeEntry.entry.display.handleKeyDown(event);
    if (handled) {
      event.preventDefault();
    }
  }

  private getActiveEntry(): { key: string; entry: DisplayEntry } | null {
    if (!this.activeKey) {
      return null;
    }
    const entry = this.displays.get(this.activeKey);
    if (!entry) {
      return null;
    }
    return { key: this.activeKey, entry };
  }

  private pickCrosshairUV(display: TerminalInstance): { u: number; v: number } | null {
    const canvas = this.noa.container.canvas;
    const rect = canvas.getBoundingClientRect();
    const pointerX = rect.width / 2;
    const pointerY = rect.height / 2;
    const pick = this.scene.pick(pointerX, pointerY, (mesh) => mesh === display.getMesh());
    if (!pick || !pick.hit) {
      return null;
    }
    const coords = pick.getTextureCoordinates();
    if (!coords) {
      return null;
    }
    return { u: coords.x, v: coords.y };
  }

  private setHighlightKey(key: string | null): void {
    if (this.highlightedKey === key) {
      if (key) {
        const entry = this.displays.get(key);
        entry?.display.setHighlighted(true);
      }
      return;
    }
    if (this.highlightedKey) {
      const previous = this.displays.get(this.highlightedKey);
      if (previous && this.highlightedKey !== this.activeKey) {
        previous.display.setHighlighted(false);
      } else if (!previous) {
        // nothing to do
      }
    }
    this.highlightedKey = null;
    if (!key) {
      return;
    }
    const entry = this.displays.get(key);
    if (!entry) {
      return;
    }
    entry.display.setHighlighted(true);
    this.highlightedKey = key;
  }

  private updateAimHover(): void {
    if (!this.activeKey) {
      return;
    }
    const entry = this.displays.get(this.activeKey);
    if (!entry) {
      return;
    }
    const uv = this.pickCrosshairUV(entry.display);
    entry.display.setHoverByUV(uv);
  }

  private onFireDown(event: MouseEvent): void {
    if (!this.activeKey) {
      return;
    }
    if (!this.overlay.controller.getState().captureInput) {
      return;
    }
    const entry = this.displays.get(this.activeKey);
    if (!entry) {
      return;
    }
    const uv = this.pickCrosshairUV(entry.display);
    entry.display.setHoverByUV(uv);
    if (!uv) {
      return;
    }
    const handled = entry.display.handlePointer({
      uv,
      button: 0,
    });
    if (handled) {
      event.preventDefault?.();
      event.stopPropagation?.();
    }
  }
}
````

## File: .gitignore
````
node_modules/
dist/
.env
docs/
noa-examples/
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "noa-engine": ["src/engine/index.js"]
    }
  },
  "include": ["src"]
}
````

## File: src/hud/overlay/overlay-context.tsx
````typescript
import { createContext, useContext } from 'react';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { EnergySystem } from '../../systems/energy';
import type { RemovalHoldTracker } from '../removal-hold-tracker';

export interface OverlayContextValue {
  controller: OverlayController;
  state: OverlayState;
  energy: EnergySystem;
  removal: RemovalHoldTracker;
}

export const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlayContext(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('useOverlayContext deve ser usado dentro de OverlayContext.Provider');
  }
  return value;
}
````

## File: src/hud/overlay/overlay-controller.ts
````typescript
export interface OverlayState {
  captureInput: boolean;
  pointerPassthrough: boolean;
}

type Listener = () => void;

export class OverlayController {
  private state: OverlayState = {
    captureInput: false,
    pointerPassthrough: false,
  };

  private listeners = new Set<Listener>();
  private onCaptureChange?: (state: OverlayState) => void;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): OverlayState {
    return this.state;
  }

  setCapture(capture: boolean): void {
    if (this.state.captureInput === capture) {
      return;
    }
    this.setState({
      captureInput: capture,
      pointerPassthrough: this.state.pointerPassthrough,
    });
  }

  registerCaptureHandler(handler: (state: OverlayState) => void): void {
    this.onCaptureChange = handler;
    handler(this.state);
  }

  setPointerPassthrough(pointerPassthrough: boolean): void {
    if (this.state.pointerPassthrough === pointerPassthrough) {
      return;
    }
    this.setState({
      captureInput: this.state.captureInput,
      pointerPassthrough,
    });
  }

  reset(): void {
    this.setState({
      captureInput: false,
      pointerPassthrough: false,
    });
    this.listeners.clear();
  }

  private setState(nextState: OverlayState): void {
    const changedCapture = this.state.captureInput !== nextState.captureInput;
    const changedPointer = this.state.pointerPassthrough !== nextState.pointerPassthrough;

    this.state = nextState;

    if ((changedCapture || changedPointer) && this.onCaptureChange) {
      this.onCaptureChange(this.state);
    }

    if (changedCapture || changedPointer) {
      this.emit();
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
````

## File: src/systems/energy/index.ts
````typescript
import type { Engine } from 'noa-engine';
import type { SectorResources } from '../../sector';
import {
  ENERGY_TICK_INTERVAL_SEC,
  PANEL_BASE_W,
  PANEL_RAY_COUNT,
  PANEL_MAX_RAY_DISTANCE,
  PANEL_RAY_STEP,
  PANEL_SAMPLE_OFFSETS,
  SUN_DIRECTION,
  BATTERY_SMALL_MJ,
  ENERGY_EPSILON,
} from '../../config/energy-options';
import { EnergyNetworkManager, type VoxelPosition } from './energy-network-manager';

interface SolarPanelEntry {
  key: string;
  position: VoxelPosition;
  networkId: number | null;
  outputW: number;
  shade: number;
}

interface BatteryEntry {
  key: string;
  position: VoxelPosition;
  networkId: number | null;
  capacityMJ: number;
  storedMJ: number;
}

interface TerminalEntry {
  key: string;
  position: VoxelPosition;
  networkId: number | null;
}

export interface SolarPanelSnapshot {
  position: VoxelPosition;
  networkId: number | null;
  outputW: number;
  shade: number;
}

export interface BatterySnapshot {
  position: VoxelPosition;
  networkId: number | null;
  capacityMJ: number;
  storedMJ: number;
}

export interface TerminalSnapshot {
  position: VoxelPosition;
  networkId: number | null;
}

export interface NetworkOverview {
  id: number;
  metrics: {
    totalGenW: number;
    totalLoadW: number;
    totalCapMJ: number;
    totalStoredMJ: number;
    deltaW: number;
  };
  panelCount: number;
  batteryCount: number;
  terminalCount: number;
}

export interface EnergySystem {
  networks: EnergyNetworkManager;
  registerSolarPanel(position: VoxelPosition): void;
  unregisterSolarPanel(position: VoxelPosition): void;
  registerBattery(position: VoxelPosition): void;
  unregisterBattery(position: VoxelPosition): void;
  registerTerminal(position: VoxelPosition): void;
  unregisterTerminal(position: VoxelPosition): void;
  getSolarPanelSnapshot(position: VoxelPosition): SolarPanelSnapshot | null;
  getBatterySnapshot(position: VoxelPosition): BatterySnapshot | null;
  getTerminalSnapshot(position: VoxelPosition): TerminalSnapshot | null;
  listSolarPanels(): SolarPanelSnapshot[];
  listBatteries(): BatterySnapshot[];
  listTerminals(): TerminalSnapshot[];
  listDecks(): VoxelPosition[];
  setBatteryStored(position: VoxelPosition, storedMJ: number): void;
  getNetworkOverview(networkId: number): NetworkOverview | null;
  subscribe(listener: () => void): () => void;
  getVersion(): number;
}

const NEIGHBOR_OFFSETS: ReadonlyArray<VoxelPosition> = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function makeKey([x, y, z]: VoxelPosition): string {
  return `${x}:${y}:${z}`;
}

export function initializeEnergySystem(noa: Engine, sector: SectorResources): EnergySystem {
  const networks = new EnergyNetworkManager();
  const solarPanels = new Map<string, SolarPanelEntry>();
  const batteries = new Map<string, BatteryEntry>();
  const terminals = new Map<string, TerminalEntry>();
  const listeners = new Set<() => void>();
  let version = 0;

  const sampleCount = Math.min(PANEL_RAY_COUNT, PANEL_SAMPLE_OFFSETS.length);
  const panelSamples = PANEL_SAMPLE_OFFSETS.slice(0, sampleCount);
  const solarOpacityByBlockId = buildSolarOpacityLookup(sector);
  const deckBlockId = sector.starwatchBlocks.deck.id;

  let tickAccumulator = 0;

  const registerDecksInChunk = (chunk: any) => {
    if (!chunk || typeof chunk.size !== 'number' || !chunk.voxels) {
      return;
    }
    const size = chunk.size;
    const voxels = chunk.voxels;
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        for (let k = 0; k < size; k += 1) {
          if (voxels.get(i, j, k) !== deckBlockId) continue;
          const worldX = chunk.x + i;
          const worldY = chunk.y + j;
          const worldZ = chunk.z + k;
          networks.addDeck([worldX, worldY, worldZ]);
        }
      }
    }
  };

  noa.world.on('chunkAdded', registerDecksInChunk);

  const emitUpdate = () => {
    version += 1;
    for (const listener of listeners) {
      listener();
    }
  };

  const resolveNetworkId = (position: VoxelPosition): number | null => {
    for (const offset of NEIGHBOR_OFFSETS) {
      const nx = position[0] + offset[0];
      const ny = position[1] + offset[1];
      const nz = position[2] + offset[2];
      const blockId = noa.world.getBlockID(nx, ny, nz);
      if (blockId === deckBlockId) {
        const networkId = networks.getNetworkIdForPosition([nx, ny, nz]);
        if (networkId !== null) {
          return networkId;
        }
      }
    }
    return null;
  };

  const getSolarOpacity = (blockId: number): number => solarOpacityByBlockId.get(blockId) ?? 1;

  const setBatteryStoredInternal = (entry: BatteryEntry, storedMJ: number): void => {
    const clamped = Math.max(0, Math.min(entry.capacityMJ, storedMJ));
    const delta = clamped - entry.storedMJ;
    if (Math.abs(delta) < ENERGY_EPSILON) {
      entry.storedMJ = clamped;
      return;
    }
    entry.storedMJ = clamped;
    if (entry.networkId !== null) {
      networks.adjustNetworkMetrics(entry.networkId, { totalStoredMJ: delta });
    }
  };

  const sampleSolarShade = (entry: SolarPanelEntry): number => {
    let totalShade = 0;
    const [baseX, baseY, baseZ] = entry.position;
    const startY = baseY + 1;

    for (const [offsetX, offsetZ] of panelSamples) {
      const origin: [number, number, number] = [
        baseX + 0.5 + offsetX,
        startY + 0.01,
        baseZ + 0.5 + offsetZ,
      ];

      let travelled = 0;
      let transmittance = 1;
      let lastKey: string | null = null;

      while (travelled < PANEL_MAX_RAY_DISTANCE && transmittance > ENERGY_EPSILON) {
        const sampleX = origin[0] + SUN_DIRECTION[0] * travelled;
        const sampleY = origin[1] + SUN_DIRECTION[1] * travelled;
        const sampleZ = origin[2] + SUN_DIRECTION[2] * travelled;

        const voxelX = Math.floor(sampleX);
        const voxelY = Math.floor(sampleY);
        const voxelZ = Math.floor(sampleZ);
        const currentKey = makeKey([voxelX, voxelY, voxelZ]);

        if (currentKey !== lastKey) {
          lastKey = currentKey;
          const blockId = noa.world.getBlockID(voxelX, voxelY, voxelZ);
          if (blockId !== 0) {
            const opacity = getSolarOpacity(blockId);
            transmittance *= 1 - opacity;
            if (transmittance <= ENERGY_EPSILON) {
              transmittance = 0;
              break;
            }
          }
        }

        travelled += PANEL_RAY_STEP;
      }

      totalShade += 1 - transmittance;
    }

    return totalShade / panelSamples.length;
  };

  const updateSolarPanel = (entry: SolarPanelEntry): void => {
    const previousNetworkId = entry.networkId;
    const previousOutput = entry.outputW;

    const networkId = resolveNetworkId(entry.position);
    entry.networkId = networkId;

    const shade = sampleSolarShade(entry);
    entry.shade = shade;
    const outputW = PANEL_BASE_W * Math.max(0, 1 - shade);
    entry.outputW = outputW;

    if (previousNetworkId !== null) {
      networks.adjustNetworkMetrics(previousNetworkId, { totalGenW: -previousOutput });
    }
    if (networkId !== null) {
      networks.adjustNetworkMetrics(networkId, { totalGenW: outputW });
    }
  };

  const updateBatteryNetwork = (entry: BatteryEntry, nextNetworkId: number | null): void => {
    if (entry.networkId === nextNetworkId) {
      return;
    }

    if (entry.networkId !== null) {
      networks.adjustNetworkMetrics(entry.networkId, {
        totalCapMJ: -entry.capacityMJ,
        totalStoredMJ: -entry.storedMJ,
      });
    }

    entry.networkId = nextNetworkId;

    if (entry.networkId !== null) {
      networks.adjustNetworkMetrics(entry.networkId, {
        totalCapMJ: entry.capacityMJ,
        totalStoredMJ: entry.storedMJ,
      });
    }
  };

  const updateTerminalNetwork = (entry: TerminalEntry): void => {
    entry.networkId = resolveNetworkId(entry.position);
  };

  const distributeEnergyToBatteries = (networkId: number, entries: BatteryEntry[], deltaMJ: number): void => {
    if (entries.length === 0 || Math.abs(deltaMJ) < ENERGY_EPSILON) {
      return;
    }

    let remaining = deltaMJ;

    if (deltaMJ > 0) {
      for (const battery of entries) {
        if (remaining <= 0) break;
        const space = battery.capacityMJ - battery.storedMJ;
        if (space <= 0) continue;
        const added = Math.min(space, remaining);
        setBatteryStoredInternal(battery, battery.storedMJ + added);
        remaining -= added;
      }
    } else {
      remaining = Math.abs(deltaMJ);
      for (const battery of entries) {
        if (remaining <= 0) break;
        if (battery.storedMJ <= 0) continue;
        const consumed = Math.min(battery.storedMJ, remaining);
        setBatteryStoredInternal(battery, battery.storedMJ - consumed);
        remaining -= consumed;
      }
    }
  };

  const runEnergyTick = () => {
    for (const entry of solarPanels.values()) {
      updateSolarPanel(entry);
    }

    const batteriesByNetwork = new Map<number, BatteryEntry[]>();

    for (const entry of batteries.values()) {
      const nextNetworkId = resolveNetworkId(entry.position);
      updateBatteryNetwork(entry, nextNetworkId);
      if (entry.networkId !== null) {
        const bucket = batteriesByNetwork.get(entry.networkId) ?? [];
        bucket.push(entry);
        batteriesByNetwork.set(entry.networkId, bucket);
      }
    }

    for (const entry of terminals.values()) {
      updateTerminalNetwork(entry);
    }

    for (const [networkId, batteryEntries] of batteriesByNetwork.entries()) {
      const snapshot = networks.getNetworkSnapshot(networkId);
      if (!snapshot) {
        continue;
      }
      const deltaW = snapshot.metrics.totalGenW - snapshot.metrics.totalLoadW;
      const deltaMJ = deltaW / 1_000_000;
      distributeEnergyToBatteries(networkId, batteryEntries, deltaMJ);
    }

    emitUpdate();
  };

  noa.on('tick', (dt: number) => {
    tickAccumulator += dt;
    if (tickAccumulator >= ENERGY_TICK_INTERVAL_SEC) {
      tickAccumulator -= ENERGY_TICK_INTERVAL_SEC;
      runEnergyTick();
    }
  });

  return {
    networks,
    registerSolarPanel(position) {
      const key = makeKey(position);
      if (solarPanels.has(key)) {
        return;
      }
      const entry: SolarPanelEntry = {
        key,
        position: [...position],
        networkId: null,
        outputW: 0,
        shade: 1,
      };
      solarPanels.set(key, entry);
      updateSolarPanel(entry);
      emitUpdate();
    },
    unregisterSolarPanel(position) {
      const key = makeKey(position);
      const entry = solarPanels.get(key);
      if (!entry) {
        return;
      }
      if (entry.networkId !== null && entry.outputW !== 0) {
        networks.adjustNetworkMetrics(entry.networkId, { totalGenW: -entry.outputW });
      }
      solarPanels.delete(key);
      emitUpdate();
    },
    registerBattery(position) {
      const key = makeKey(position);
      if (batteries.has(key)) {
        return;
      }
      const entry: BatteryEntry = {
        key,
        position: [...position],
        networkId: null,
        capacityMJ: BATTERY_SMALL_MJ,
        storedMJ: 0,
      };
      batteries.set(key, entry);
      updateBatteryNetwork(entry, resolveNetworkId(entry.position));
      emitUpdate();
    },
    unregisterBattery(position) {
      const key = makeKey(position);
      const entry = batteries.get(key);
      if (!entry) {
        return;
      }
      if (entry.networkId !== null) {
        networks.adjustNetworkMetrics(entry.networkId, {
          totalCapMJ: -entry.capacityMJ,
          totalStoredMJ: -entry.storedMJ,
        });
      }
      batteries.delete(key);
      emitUpdate();
    },
    registerTerminal(position) {
      const key = makeKey(position);
      if (terminals.has(key)) {
        return;
      }
      const entry: TerminalEntry = {
        key,
        position: [...position],
        networkId: null,
      };
      terminals.set(key, entry);
      updateTerminalNetwork(entry);
      emitUpdate();
    },
    unregisterTerminal(position) {
      const key = makeKey(position);
      if (!terminals.has(key)) {
        return;
      }
      terminals.delete(key);
      emitUpdate();
    },
    getSolarPanelSnapshot(position) {
      const entry = solarPanels.get(makeKey(position));
      return entry
        ? {
            position: [...entry.position] as VoxelPosition,
            networkId: entry.networkId,
            outputW: entry.outputW,
            shade: entry.shade,
          }
        : null;
    },
    getBatterySnapshot(position) {
      const entry = batteries.get(makeKey(position));
      return entry
        ? {
            position: [...entry.position] as VoxelPosition,
            networkId: entry.networkId,
            capacityMJ: entry.capacityMJ,
            storedMJ: entry.storedMJ,
          }
        : null;
    },
    getTerminalSnapshot(position) {
      const entry = terminals.get(makeKey(position));
      return entry
        ? {
            position: [...entry.position] as VoxelPosition,
            networkId: entry.networkId,
          }
        : null;
    },
    listSolarPanels() {
      return Array.from(solarPanels.values()).map((entry) => ({
        position: [...entry.position] as VoxelPosition,
        networkId: entry.networkId,
        outputW: entry.outputW,
        shade: entry.shade,
      }));
    },
    listBatteries() {
      return Array.from(batteries.values()).map((entry) => ({
        position: [...entry.position] as VoxelPosition,
        networkId: entry.networkId,
        capacityMJ: entry.capacityMJ,
        storedMJ: entry.storedMJ,
      }));
    },
    listTerminals() {
      return Array.from(terminals.values()).map((entry) => ({
        position: [...entry.position] as VoxelPosition,
        networkId: entry.networkId,
      }));
    },
    listDecks() {
      return networks.listDeckPositions().map((position) => [...position] as VoxelPosition);
    },
    setBatteryStored(position, storedMJ) {
      const entry = batteries.get(makeKey(position));
      if (!entry) {
        return;
      }
      setBatteryStoredInternal(entry, storedMJ);
      emitUpdate();
    },
    getNetworkOverview(networkId) {
      const snapshot = networks.getNetworkSnapshot(networkId);
      if (!snapshot) {
        return null;
      }
      let panelCount = 0;
      let batteryCount = 0;
      let terminalCount = 0;

      for (const panel of solarPanels.values()) {
        if (panel.networkId === networkId) panelCount += 1;
      }
      for (const battery of batteries.values()) {
        if (battery.networkId === networkId) batteryCount += 1;
      }
      for (const terminal of terminals.values()) {
        if (terminal.networkId === networkId) terminalCount += 1;
      }

      const deltaW = snapshot.metrics.totalGenW - snapshot.metrics.totalLoadW;

      return {
        id: snapshot.id,
        metrics: {
          totalGenW: snapshot.metrics.totalGenW,
          totalLoadW: snapshot.metrics.totalLoadW,
          totalCapMJ: snapshot.metrics.totalCapMJ,
          totalStoredMJ: snapshot.metrics.totalStoredMJ,
          deltaW,
        },
        panelCount,
        batteryCount,
        terminalCount,
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getVersion() {
      return version;
    },
  };
}

function buildSolarOpacityLookup(sector: SectorResources): Map<number, number> {
  const lookup = new Map<number, number>();
  lookup.set(0, 0);

  lookup.set(sector.terrainBlocks.dirt, sector.materials.dirt.solarOpacity);

  for (const block of sector.terrainBlocks.asteroidVariants) {
    const material = sector.materials.asteroidVariants.find((variant) => variant.id === block.id);
    if (material) {
      lookup.set(block.blockId, material.material.solarOpacity);
    }
  }

  lookup.set(sector.starwatchBlocks.deck.id, sector.materials.deck.solarOpacity);
  lookup.set(sector.starwatchBlocks.solarPanel.id, sector.materials.solarPanel.solarOpacity);
  lookup.set(sector.starwatchBlocks.battery.id, sector.materials.battery.solarOpacity);
  lookup.set(sector.starwatchBlocks.halTerminal.id, sector.materials.terminal.solarOpacity);

  return lookup;
}
````

## File: src/systems/interactions/use-system.ts
````typescript
import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { SectorResources } from '../../sector';
import type { BlockKind } from '../../blocks/types';
import type { TerminalSystem } from '../terminals';
import { TERMINAL_INTERACTION_OPTIONS } from '../../config/terminal-options';

interface UseSystemDependencies {
  noa: Engine;
  overlay: OverlayApi;
  sector: SectorResources;
  terminals: TerminalSystem;
}

const {
  useRange,
  proximityRange,
  disengageRange,
  disengageGraceTicks,
} = TERMINAL_INTERACTION_OPTIONS;
const USE_RANGE_SQ = useRange * useRange;
const PROXIMITY_RANGE_SQ = proximityRange * proximityRange;
const DISENGAGE_RANGE_SQ = disengageRange * disengageRange;

type TargetedBlock = {
  position: number[];
  blockID: number;
};

export function initializeUseSystem({ noa, overlay, sector, terminals }: UseSystemDependencies): void {
  const terminalId = sector.starwatchBlocks.halTerminal.id;
  const batteryId = sector.starwatchBlocks.battery.id;
  const panelId = sector.starwatchBlocks.solarPanel.id;
  const interactiveIds = new Set([terminalId, batteryId, panelId]);
  const interactivePriority = new Map([
    [terminalId, 0],
    [batteryId, 1],
    [panelId, 2],
  ]);

  let highlighted: { position: [number, number, number]; blockID: number; kind: BlockKind } | null = null;
  let disengageBuffer = 0;

  const isInputCaptured = (): boolean => overlay.controller.getState().captureInput || terminals.isCapturingInput();

  const getPlayerPosition = (): number[] | null => {
    const data = noa.entities.getPositionData(noa.playerEntity);
    return data?.position ?? null;
  };

  const distanceSqToBlock = (playerPos: number[], blockPosition: number[]): number => {
    const dx = playerPos[0] - (blockPosition[0] + 0.5);
    const dy = playerPos[1] - (blockPosition[1] + 0.5);
    const dz = playerPos[2] - (blockPosition[2] + 0.5);
    return dx * dx + dy * dy + dz * dz;
  };

  const getTargetedBlock = (): TargetedBlock | null => {
    const targeted = noa.targetedBlock;
    if (!targeted) {
      return null;
    }
    return {
      position: targeted.position,
      blockID: targeted.blockID,
    };
  };

  const findNearestInteractive = (
    playerPos: number[],
    maxDistance: number,
    maxDistanceSq: number,
  ): TargetedBlock | null => {
    let best: { position: [number, number, number]; blockID: number; distanceSq: number; priority: number } | null = null;

    const radius = Math.ceil(maxDistance);
    const baseX = Math.floor(playerPos[0]);
    const baseY = Math.floor(playerPos[1]);
    const baseZ = Math.floor(playerPos[2]);

    const minX = baseX - radius;
    const maxX = baseX + radius;
    const minY = baseY - 1;
    const maxY = baseY + 1;
    const minZ = baseZ - radius;
    const maxZ = baseZ + radius;

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          const blockID = noa.world.getBlockID(x, y, z);
          if (!interactiveIds.has(blockID)) {
            continue;
          }
          const candidatePosition: [number, number, number] = [x, y, z];
          const distanceSq = distanceSqToBlock(playerPos, candidatePosition);
          if (distanceSq > maxDistanceSq) {
            continue;
          }
          const priority = interactivePriority.get(blockID) ?? interactivePriority.size;
          if (
            !best
            || priority < best.priority
            || (priority === best.priority && distanceSq < best.distanceSq)
          ) {
            best = {
              position: candidatePosition,
              blockID,
              distanceSq,
              priority,
            };
          }
        }
      }
    }

    return best
      ? {
          position: best.position,
          blockID: best.blockID,
        }
      : null;
  };

  const sameLocation = (a: [number, number, number], b: [number, number, number]): boolean => (
    a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
  );

  const updateHighlight = (candidate: TargetedBlock | null): void => {
    if (!candidate) {
      if (!highlighted) {
        return;
      }
      highlighted = null;
      terminals.setHighlightedTerminal(null);
      return;
    }
    const definition = sector.starwatchBlocks.byId.get(candidate.blockID);
    if (!definition) {
      if (highlighted) {
        highlighted = null;
        terminals.setHighlightedTerminal(null);
      }
      return;
    }
    const nextPosition: [number, number, number] = [
      candidate.position[0],
      candidate.position[1],
      candidate.position[2],
    ];
    if (
      highlighted
      && highlighted.blockID === candidate.blockID
      && highlighted.kind === definition.kind
      && sameLocation(highlighted.position, nextPosition)
    ) {
      return;
    }
    highlighted = {
      position: nextPosition,
      blockID: candidate.blockID,
      kind: definition.kind,
    };
    terminals.setHighlightedTerminal({
      kind: definition.kind,
      position: nextPosition,
    });
  };

  const handleUse = () => {
    if (isInputCaptured()) {
      return;
    }

    const playerPos = getPlayerPosition();
    if (!playerPos) {
      return;
    }

    let target: TargetedBlock | null = getTargetedBlock();
    if (!target || !interactiveIds.has(target.blockID)) {
      target = highlighted
        ? {
            position: [
              highlighted.position[0],
              highlighted.position[1],
              highlighted.position[2],
            ],
            blockID: highlighted.blockID,
          }
        : null;
    }

    if (!target) {
      const nearest = findNearestInteractive(playerPos, useRange, USE_RANGE_SQ);
      if (nearest) {
        target = nearest;
      }
    }

    if (!target) {
      return;
    }

    if (!interactiveIds.has(target.blockID)) {
      return;
    }

    if (distanceSqToBlock(playerPos, target.position) > USE_RANGE_SQ) {
      return;
    }

    const blockDefinition = sector.starwatchBlocks.byId.get(target.blockID);
    if (!blockDefinition) {
      return;
    }

    const position: [number, number, number] = [
      target.position[0],
      target.position[1],
      target.position[2],
    ];

    terminals.openTerminal(blockDefinition.kind, position);
  };

  const handleCancel = () => {
    if (!terminals.isCapturingInput()) {
      return;
    }
    terminals.closeActiveTerminal();
  };

  const handleProximityTick = () => {
    const playerPos = getPlayerPosition();
    if (!playerPos) {
      if (!terminals.isCapturingInput()) {
        updateHighlight(null);
      }
      return;
    }

    if (terminals.isCapturingInput()) {
      const active = terminals.getActiveTerminal();
      if (!active) {
        disengageBuffer = 0;
        return;
      }
      const distanceSq = distanceSqToBlock(playerPos, active.position);
      if (distanceSq > DISENGAGE_RANGE_SQ) {
        disengageBuffer += 1;
        if (disengageBuffer >= disengageGraceTicks) {
          terminals.closeActiveTerminal();
          disengageBuffer = 0;
        }
      } else {
        disengageBuffer = 0;
      }
      return;
    }

    disengageBuffer = 0;

    if (overlay.controller.getState().captureInput) {
      updateHighlight(null);
      return;
    }

    const nearby = findNearestInteractive(playerPos, proximityRange, PROXIMITY_RANGE_SQ);
    updateHighlight(nearby);

    if (!nearby) {
      return;
    }

    const definition = sector.starwatchBlocks.byId.get(nearby.blockID);
    if (!definition) {
      return;
    }

    terminals.openTerminal(
      definition.kind,
      [
        nearby.position[0],
        nearby.position[1],
        nearby.position[2],
      ] as [number, number, number],
    );
  };

  noa.inputs.bind('use', ['KeyE']);
  noa.inputs.down.on('use', handleUse);
  noa.inputs.bind('terminal-cancel', ['Escape']);
  noa.inputs.down.on('terminal-cancel', handleCancel);
  if (noa.inputs.up && typeof noa.inputs.up.on === 'function') {
    noa.inputs.up.on('use', () => {
      /* noop */
    });
    noa.inputs.up.on('terminal-cancel', () => {
      /* noop */
    });
  }

  noa.on('tick', handleProximityTick);
}
````

## File: vite.config.ts
````typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'noa-engine': resolve(projectRoot, 'src/engine/index.js'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
````

## File: src/hud/overlay/index.tsx
````typescript
import { createRoot, type Root } from 'react-dom/client';
import type { Engine } from 'noa-engine';
import { OverlayController } from './overlay-controller';
import { OverlayApp } from './OverlayApp';
import type { HotbarController } from '../../player/hotbar-controller';
import type { EnergySystem } from '../../systems/energy';
import { RemovalHoldTracker } from '../removal-hold-tracker';

export interface OverlayApi {
  controller: OverlayController;
  removalHold: RemovalHoldTracker;
  destroy(): void;
}

export interface OverlayDependencies {
  hotbarController: HotbarController;
  energy: EnergySystem;
}

export function initializeOverlay(noa: Engine, deps: OverlayDependencies): OverlayApi {
  const mountNode = document.getElementById('starwatch-overlay-root');
  if (!mountNode) {
    throw new Error('Host DOM node #starwatch-overlay-root não encontrado.');
  }

  const controller = new OverlayController();
  const root: Root = createRoot(mountNode);
  const removalHold = new RemovalHoldTracker();

  controller.registerCaptureHandler((capture) => {
    const canvas = noa.container.canvas;
    if (capture) {
      noa.container.setPointerLock(false);
      if (typeof canvas.blur === 'function') {
        canvas.blur();
      }
    } else {
      noa.container.setPointerLock(true);
      if (typeof canvas.focus === 'function') {
        canvas.focus();
      }
    }
  });

  root.render(
    <OverlayApp
      controller={controller}
      hotbarController={deps.hotbarController}
      energy={deps.energy}
      removalHold={removalHold}
    />,
  );

  const api: OverlayApi = {
    controller,
    removalHold,
    destroy() {
      controller.reset();
      root.unmount();
    },
  };

  return api;
}
````

## File: src/hud/overlay/OverlayApp.tsx
````typescript
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { OverlayContext } from './overlay-context';
import type { OverlayController, OverlayState } from './overlay-controller';
import type { HotbarController } from '../../player/hotbar-controller';
import { HotbarHud } from '../components/hotbar-hud';
import type { EnergySystem } from '../../systems/energy';
import type { RemovalHoldTracker } from '../removal-hold-tracker';
import { Crosshair } from '../components/crosshair';

interface OverlayAppProps {
  controller: OverlayController;
  hotbarController: HotbarController;
  energy: EnergySystem;
  removalHold: RemovalHoldTracker;
}

function useOverlayState(controller: OverlayController): OverlayState {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getState(),
  );
}

export function OverlayApp({ controller, hotbarController, energy, removalHold }: OverlayAppProps): JSX.Element {
  const state = useOverlayState(controller);
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = focusRef.current;
    if (!node) {
      return;
    }
    if (state.captureInput) {
      node.focus({ preventScroll: true });
    } else {
      node.blur();
    }
  }, [state.captureInput]);

  const contextValue = useMemo(
    () => ({
      controller,
      state,
      energy,
      removal: removalHold,
    }),
    [controller, state, energy, removalHold],
  );

  return (
    <OverlayContext.Provider value={contextValue}>
      <div
        ref={focusRef}
        className="overlay-root"
        tabIndex={-1}
        data-capture={state.captureInput ? 'true' : 'false'}
        data-pointer-pass={state.pointerPassthrough ? 'true' : 'false'}
      >
        <div className="overlay-hud-layer" data-visible="true">
          <Crosshair />
          <HotbarHud controller={hotbarController} />
        </div>
      </div>
    </OverlayContext.Provider>
  );
}
````

## File: src/persistence/manager.ts
````typescript
import type { Engine } from 'noa-engine';
import type { HotbarApi } from '../player/hotbar';
import type { SectorResources } from '../sector';
import type { EnergySystem } from '../systems/energy';
import type { TerminalSystem } from '../systems/terminals';
import type { PersistenceAdapter } from './adapter';
import type { SectorSnapshot } from './types';
import { captureSnapshot, restoreSnapshot } from './snapshot';
import { SNAPSHOT_SCHEMA_VERSION, type SnapshotContextMeta } from './types';

interface ManagerContext {
  noa: Engine;
  sector: SectorResources;
  energy: EnergySystem;
  hotbar: HotbarApi;
  terminals: TerminalSystem;
}

interface PersistenceManagerOptions {
  adapter: PersistenceAdapter;
  playerId: string;
  sectorId: string;
  context: ManagerContext;
  autosaveIntervalMs?: number;
}

export class PersistenceManager {
  private readonly adapter: PersistenceAdapter;
  private readonly meta: SnapshotContextMeta;
  private readonly ctx: ManagerContext;
  private autosaveHandle: ReturnType<typeof setInterval> | null = null;

  constructor(options: PersistenceManagerOptions) {
    this.adapter = options.adapter;
    this.meta = {
      playerId: options.playerId,
      sectorId: options.sectorId,
    };
    this.ctx = options.context;

    if (options.autosaveIntervalMs && options.autosaveIntervalMs > 0) {
      this.startAutoSave(options.autosaveIntervalMs);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  load(): void {
    const snapshot = this.adapter.loadSnapshot(this.meta.playerId, this.meta.sectorId);
    if (!snapshot) {
      return;
    }
    if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
      console.warn('[starwatch:persistence] versão de snapshot incompatível, ignorando.');
      return;
    }
    restoreSnapshot(
      {
        noa: this.ctx.noa,
        sector: this.ctx.sector,
        energy: this.ctx.energy,
        hotbar: this.ctx.hotbar,
        terminals: this.ctx.terminals,
      },
      snapshot,
    );
  }

  save(): void {
    const snapshot: SectorSnapshot = captureSnapshot(
      {
        noa: this.ctx.noa,
        sector: this.ctx.sector,
        energy: this.ctx.energy,
        hotbar: this.ctx.hotbar,
        terminals: this.ctx.terminals,
      },
      this.meta,
    );
    this.adapter.saveSnapshot(snapshot);
  }

  clear(): void {
    this.adapter.clearSnapshot(this.meta.playerId, this.meta.sectorId);
  }

  startAutoSave(intervalMs: number): void {
    if (this.autosaveHandle) {
      clearInterval(this.autosaveHandle);
    }
    this.autosaveHandle = setInterval(() => {
      try {
        this.save();
      } catch (error) {
        console.warn('[starwatch:persistence] falha no autosave', error);
      }
    }, intervalMs);
  }

  dispose(): void {
    if (this.autosaveHandle) {
      clearInterval(this.autosaveHandle);
      this.autosaveHandle = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private handleBeforeUnload = () => {
    try {
      this.save();
    } catch (error) {
      console.warn('[starwatch:persistence] erro ao salvar no beforeunload', error);
    }
  };
}

export function ensurePlayerId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return generateId();
  }
  const key = 'starwatch/playerId';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const fresh = generateId();
  window.localStorage.setItem(key, fresh);
  return fresh;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `player-${Math.random().toString(36).slice(2, 11)}`;
}
````

## File: src/systems/building/placement-system.ts
````typescript
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Engine } from 'noa-engine';
import type { OverlayApi } from '../../hud/overlay';
import type { HotbarApi } from '../../player/hotbar';
import type { SectorResources } from '../../sector';
import type { BlockCatalog, BlockDefinition, BlockKind, BlockOrientation } from '../../blocks/types';
import { blockMetadataStore } from '../../blocks/metadata-store';
import type { EnergySystem } from '../energy';
import type { TerminalSystem } from '../terminals';

const ORIENTATIONS: BlockOrientation[] = ['north', 'east', 'south', 'west'];
const REMOVE_HOLD_DURATION_MS = 1000;

interface PlacementSystemDependencies {
  noa: Engine;
  overlay: OverlayApi;
  hotbar: HotbarApi;
  sector: SectorResources;
  energy: EnergySystem;
  terminals: TerminalSystem;
}

interface NoaTargetBlock {
  position: number[];
  normal: number[];
  adjacent: number[];
  blockID: number;
}

interface PlacementTarget {
  position: [number, number, number];
  normal: [number, number, number];
  adjacent: [number, number, number];
}

interface GhostResources {
  materialValid: StandardMaterial;
  materialInvalid: StandardMaterial;
  meshes: Map<BlockKind, Mesh>;
}

function createGhostResources(noa: Engine): GhostResources {
  const scene = noa.rendering.getScene();

  const materialValid = new StandardMaterial('placement-ghost-valid', scene);
  materialValid.diffuseColor = Color3.FromHexString('#4ade80').scale(0.6);
  materialValid.alpha = 0.35;
  materialValid.emissiveColor = Color3.FromHexString('#22c55e').scale(0.5);

  const materialInvalid = new StandardMaterial('placement-ghost-invalid', scene);
  materialInvalid.diffuseColor = Color3.FromHexString('#f87171').scale(0.7);
  materialInvalid.alpha = 0.35;
  materialInvalid.emissiveColor = Color3.FromHexString('#dc2626').scale(0.5);

  const meshes = new Map<BlockKind, Mesh>();

  const createBox = (key: BlockKind, height = 1) => {
    const mesh = MeshBuilder.CreateBox(`ghost-${key}`, { width: 1, depth: 1, height }, scene);
    mesh.isVisible = false;
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.rotationQuaternion = null;
    meshes.set(key, mesh);
  };

  createBox('starwatch:deck');
  createBox('starwatch:solar-panel');
  createBox('starwatch:battery');
  createBox('starwatch:hal-terminal');

  return {
    materialValid,
    materialInvalid,
    meshes,
  };
}

function getActiveBlockDefinition(hotbar: HotbarApi, catalog: BlockCatalog): BlockDefinition | null {
  const slot = hotbar.controller.getActiveSlot();
  if (!slot.item) {
    return null;
  }
  return catalog.byKind.get(slot.item.blockKind as BlockKind) ?? null;
}

function getPlacementTarget(noa: Engine): PlacementTarget | null {
  const targeted = noa.targetedBlock as NoaTargetBlock | null;
  if (!targeted) {
    return null;
  }
  return {
    position: [targeted.position[0], targeted.position[1], targeted.position[2]],
    normal: [targeted.normal[0], targeted.normal[1], targeted.normal[2]],
    adjacent: [targeted.adjacent[0], targeted.adjacent[1], targeted.adjacent[2]],
  };
}

function nextOrientation(current: BlockOrientation): BlockOrientation {
  const index = ORIENTATIONS.indexOf(current);
  const nextIndex = (index + 1) % ORIENTATIONS.length;
  return ORIENTATIONS[nextIndex];
}

function orientationToRadians(orientation: BlockOrientation): number {
  switch (orientation) {
    case 'north':
      return 0;
    case 'east':
      return Math.PI / 2;
    case 'south':
      return Math.PI;
    case 'west':
      return (3 * Math.PI) / 2;
    default:
      return 0;
  }
}

function setGhostTransform(mesh: Mesh, target: PlacementTarget, orientation: BlockOrientation): void {
  mesh.position.x = target.adjacent[0] + 0.5;
  mesh.position.y = target.adjacent[1] + 0.5;
  mesh.position.z = target.adjacent[2] + 0.5;
  mesh.rotation.y = orientationToRadians(orientation);
}

export function initializePlacementSystem({ noa, overlay, hotbar, sector, energy, terminals }: PlacementSystemDependencies): void {
  const ghost = createGhostResources(noa);
  let activeGhost: Mesh | null = null;
  let currentDefinition: BlockDefinition | null = null;
  const orientationByKind = new Map<BlockKind, BlockOrientation>();
  let lastHotbarIndex = hotbar.controller.getState().activeIndex;
  let removeHoldTarget: PlacementTarget | null = null;
  let removeHoldTriggered = false;
  let removeHoldActive = false;
  let removeHoldElapsed = 0;
  let removalHoldResetTimeout: ReturnType<typeof setTimeout> | null = null;

  const removalHold = overlay.removalHold;

  const updateActiveDefinition = () => {
    currentDefinition = getActiveBlockDefinition(hotbar, sector.starwatchBlocks);
    if (currentDefinition && !orientationByKind.has(currentDefinition.kind)) {
      orientationByKind.set(currentDefinition.kind, currentDefinition.defaultOrientation);
    }
  };

  hotbar.controller.subscribe(() => {
    const state = hotbar.controller.getState();
    if (state.activeIndex !== lastHotbarIndex) {
      lastHotbarIndex = state.activeIndex;
      updateActiveDefinition();
    }
  });

  updateActiveDefinition();

  const hideGhost = () => {
    if (activeGhost) {
      activeGhost.isVisible = false;
    }
    activeGhost = null;
  };

  const canPlaceAt = (position: [number, number, number]): boolean => {
    const blockId = noa.world.getBlockID(position[0], position[1], position[2]);
    return blockId === 0;
  };

  const placeBlock = (target: PlacementTarget, definition: BlockDefinition, orientation: BlockOrientation) => {
    const [x, y, z] = target.adjacent;
    noa.setBlock(definition.id, x, y, z);
    if (definition.orientable) {
      blockMetadataStore.setOrientation({ kind: definition.kind, x, y, z }, orientation);
    }
    if (definition.kind === 'starwatch:deck') {
      energy.networks.addDeck([x, y, z]);
    } else if (definition.kind === 'starwatch:solar-panel') {
      energy.registerSolarPanel([x, y, z]);
    } else if (definition.kind === 'starwatch:battery') {
      energy.registerBattery([x, y, z]);
    } else if (definition.kind === 'starwatch:hal-terminal') {
      energy.registerTerminal([x, y, z]);
    }
    terminals.registerBlock(definition.kind, [x, y, z]);
  };

  const removeBlock = (target: PlacementTarget) => {
    const [x, y, z] = target.position;
    const existingId = noa.world.getBlockID(x, y, z);
    if (existingId !== 0) {
      const def = sector.starwatchBlocks.byId.get(existingId);
      noa.setBlock(0, x, y, z);
      if (def?.orientable) {
        blockMetadataStore.deleteOrientation({ kind: def.kind, x, y, z });
      }
      if (def?.kind === 'starwatch:deck') {
        energy.networks.removeDeck([x, y, z]);
      } else if (def?.kind === 'starwatch:solar-panel') {
        energy.unregisterSolarPanel([x, y, z]);
      } else if (def?.kind === 'starwatch:battery') {
        energy.unregisterBattery([x, y, z]);
      } else if (def?.kind === 'starwatch:hal-terminal') {
        energy.unregisterTerminal([x, y, z]);
      }
      if (def) {
        terminals.unregisterBlock(def.kind, [x, y, z]);
      }
    }
  };

  const clearRemovalHoldReset = () => {
    if (removalHoldResetTimeout !== null) {
      clearTimeout(removalHoldResetTimeout);
      removalHoldResetTimeout = null;
    }
  };

  const cancelRemoveHold = (preserveTriggered = false, emitIdle = true) => {
    removeHoldActive = false;
    removeHoldElapsed = 0;
    removeHoldTarget = null;
    if (!preserveTriggered) {
      removeHoldTriggered = false;
    }
    clearRemovalHoldReset();
    if (emitIdle) {
      removalHold.setState({ active: false, progress: 0 });
    }
  };

  const scheduleRemoveHold = (target: PlacementTarget) => {
    removeHoldTarget = {
      position: [...target.position],
      normal: [...target.normal],
      adjacent: [...target.adjacent],
    };
    removeHoldTriggered = false;
    removeHoldActive = true;
    removeHoldElapsed = 0;
    clearRemovalHoldReset();
    removalHold.setState({ active: true, progress: 0 });
  };

  const handleRemoveHoldStart = () => {
    cancelRemoveHold();
    if (overlay.controller.getState().captureInput) {
      return;
    }
    const target = getPlacementTarget(noa);
    if (!target) {
      return;
    }
    scheduleRemoveHold(target);
  };

  const handleRemoveHoldEnd = () => {
    const wasTriggered = removeHoldTriggered;
    cancelRemoveHold();
    if (!wasTriggered) {
      return;
    }
  };

  const handlePlace = () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    if (!currentDefinition) {
      return;
    }
    const target = getPlacementTarget(noa);
    if (!target) {
      return;
    }
    const orientation = orientationByKind.get(currentDefinition.kind) ?? currentDefinition.defaultOrientation;
    if (!canPlaceAt(target.adjacent)) {
      return;
    }
    placeBlock(target, currentDefinition, orientation);
  };

  const handleRemove = () => {
    cancelRemoveHold();
    if (overlay.controller.getState().captureInput) {
      return;
    }
    const target = getPlacementTarget(noa);
    if (!target) {
      return;
    }
    removeBlock(target);
  };

  noa.inputs.bind('build-place', ['Mouse3']);
  noa.inputs.bind('build-place-alt', ['Enter']);
  noa.inputs.bind('build-remove-hold', ['Mouse1']);
  noa.inputs.bind('build-remove-alt', ['KeyX']);
  noa.inputs.bind('build-rotate', ['KeyR']);

  noa.inputs.down.on('build-place', handlePlace);
  noa.inputs.down.on('build-place-alt', handlePlace);
  noa.inputs.down.on('build-remove-alt', handleRemove);
  noa.inputs.down.on('build-remove-hold', handleRemoveHoldStart);
  noa.inputs.up.on('build-remove-hold', handleRemoveHoldEnd);

  noa.inputs.down.on('build-rotate', () => {
    if (overlay.controller.getState().captureInput) {
      return;
    }
    if (!currentDefinition || !currentDefinition.orientable) {
      return;
    }
    const next = nextOrientation(orientationByKind.get(currentDefinition.kind) ?? currentDefinition.defaultOrientation);
    orientationByKind.set(currentDefinition.kind, next);
  });

  noa.on('beforeRender', () => {
    if (overlay.controller.getState().captureInput) {
      hideGhost();
      return;
    }

    const definition = getActiveBlockDefinition(hotbar, sector.starwatchBlocks);
    if (!definition) {
      hideGhost();
      return;
    }

    const target = getPlacementTarget(noa);
    if (!target) {
      hideGhost();
      return;
    }

    const orientation = orientationByKind.get(definition.kind) ?? definition.defaultOrientation;
    const available = canPlaceAt(target.adjacent);

    const mesh = ghost.meshes.get(definition.kind) ?? null;
    if (!mesh) {
      hideGhost();
      return;
    }

    if (activeGhost && activeGhost !== mesh) {
      activeGhost.isVisible = false;
    }
    activeGhost = mesh;
    mesh.isVisible = true;
    mesh.material = available ? ghost.materialValid : ghost.materialInvalid;
    setGhostTransform(mesh, target, orientation);
  });

  noa.on('tick', (dt: number) => {
    // `dt` is provided in milliseconds by MicroGameShell's fixed tick loop.
    if (!removeHoldActive || !removeHoldTarget) {
      return;
    }
    if (overlay.controller.getState().captureInput) {
      cancelRemoveHold();
      return;
    }
    const [x, y, z] = removeHoldTarget.position;
    if (noa.world.getBlockID(x, y, z) === 0) {
      cancelRemoveHold();
      return;
    }
    removeHoldElapsed += dt;
    const progress = Math.min(1, removeHoldElapsed / REMOVE_HOLD_DURATION_MS);
    removalHold.setState({ active: true, progress });
    if (removeHoldElapsed < REMOVE_HOLD_DURATION_MS) {
      return;
    }
    removeBlock(removeHoldTarget);
    removeHoldTriggered = true;
    cancelRemoveHold(true, false);
    removalHold.setState({ active: false, progress: 1 });
    removalHoldResetTimeout = setTimeout(() => {
      removalHold.setState({ active: false, progress: 0 });
      removalHoldResetTimeout = null;
    }, 160);
  });
}
````

## File: src/systems/terminals/terminal-display.ts
````typescript
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { VoxelPosition } from '../energy/energy-network-manager';
import type { BlockOrientation } from '../../blocks/types';
import { orientationToNormal, orientationToYaw } from './helpers';
import type {
  TerminalDisplayKind,
  TerminalPointerEvent,
  TerminalTab,
} from './types';

const BORDER = 32;
const HEADER_HEIGHT = 64;
const TAB_BAR_HEIGHT = 80;
const FOOTER_HEIGHT = 64;
const SCREEN_SURFACE_BIAS = 0.002;

export interface BaseTerminalDisplayOptions<TData> {
  scene: Scene;
  position: VoxelPosition;
  orientation: BlockOrientation;
  kind: TerminalDisplayKind;
  physicalWidth: number;
  physicalHeight: number;
  textureWidth: number;
  textureHeight: number;
  elevation: number;
  mountOffset: number;
  title: string;
  accentColor: string;
  dataProvider: () => TData;
  tabs: TerminalTab[];
}

interface TabRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class BaseTerminalDisplay<TData> {
  readonly kind: TerminalDisplayKind;
  readonly position: VoxelPosition;

  protected readonly dataProvider: () => TData;
  protected readonly tabs: TerminalTab[];
  protected readonly scene: Scene;
  protected readonly orientation: BlockOrientation;
  protected readonly textureWidth: number;
  protected readonly textureHeight: number;
  protected readonly accentColor: string;
  protected readonly title: string;
  protected readonly mesh: Mesh;
  protected readonly texture: DynamicTexture;
  protected readonly ctx: CanvasRenderingContext2D;
  protected readonly contentArea: { x: number; y: number; width: number; height: number };
  protected readonly baseCenter: Vector3;
  protected readonly mountOffset: number;

  private readonly surfaceNormal: Vector3;
  private readonly material: StandardMaterial;
  private readonly tabRects: TabRect[] = [];
  private readonly decorations: Mesh[] = [];
  private readonly allMeshes: Mesh[] = [];

  private sessionActive = false;
  private highlighted = false;
  private hoverTabIndex: number | null = null;
  private activeTabIndex = 0;

  constructor(options: BaseTerminalDisplayOptions<TData>) {
    this.scene = options.scene;
    this.kind = options.kind;
    this.position = options.position;
    this.orientation = options.orientation;
    this.dataProvider = options.dataProvider;
    this.tabs = options.tabs;
    this.textureWidth = options.textureWidth;
    this.textureHeight = options.textureHeight;
    this.accentColor = options.accentColor;
    this.title = options.title;

    this.baseCenter = new Vector3(
      options.position[0] + 0.5,
      options.position[1] + options.elevation,
      options.position[2] + 0.5,
    );
    this.surfaceNormal = orientationToNormal(options.orientation);
    this.mountOffset = options.mountOffset;

    this.mesh = MeshBuilder.CreatePlane(
      `terminal-screen-${options.position.join(':')}`,
      {
        width: options.physicalWidth,
        height: options.physicalHeight,
      },
      this.scene,
    );
    this.mesh.alwaysSelectAsActiveMesh = true;
    this.mesh.isPickable = true;
    this.mesh.metadata = { terminalScreen: true, key: this.makeKey() };
    this.allMeshes.push(this.mesh);

    const anchor = this.getSurfacePosition(this.mountOffset + SCREEN_SURFACE_BIAS);
    this.mesh.position = anchor;
    this.mesh.lookAt(anchor.add(this.surfaceNormal));
    this.mesh.rotate(Vector3.Up(), Math.PI);

    this.texture = new DynamicTexture(
      `terminal-texture-${options.position.join(':')}`,
      { width: options.textureWidth, height: options.textureHeight },
      this.scene,
      false,
    );
    this.texture.hasAlpha = true;
    const context = this.texture.getContext() as CanvasRenderingContext2D;
    context.imageSmoothingEnabled = false;
    this.ctx = context;

    this.material = new StandardMaterial(`terminal-material-${options.position.join(':')}`, this.scene);
    this.material.diffuseColor = Color3.White();
    this.material.emissiveColor = new Color3(0.32, 0.38, 0.52);
    this.material.specularColor = Color3.Black();
    this.material.backFaceCulling = true;
    this.material.disableLighting = true;
    this.material.diffuseTexture = this.texture;
    this.material.emissiveTexture = this.texture;
    this.mesh.material = this.material;
    this.mesh.renderingGroupId = 2;

    this.contentArea = {
      x: BORDER,
      y: BORDER + HEADER_HEIGHT + TAB_BAR_HEIGHT,
      width: this.textureWidth - BORDER * 2,
      height: this.textureHeight - BORDER * 2 - HEADER_HEIGHT - TAB_BAR_HEIGHT - FOOTER_HEIGHT,
    };

    this.updateMaterialGlow();
    this.refresh();
  }

  dispose(): void {
    this.mesh.dispose(false, true);
    this.texture.dispose();
    for (const mesh of this.decorations) {
      mesh.dispose(false, true);
    }
  }

  getMesh(): Mesh {
    return this.mesh;
  }

  protected addDecoration(mesh: Mesh): void {
    this.decorations.push(mesh);
    this.allMeshes.push(mesh);
  }

  getMeshes(): Mesh[] {
    return this.allMeshes;
  }

  protected getSurfaceNormal(): Vector3 {
    return this.surfaceNormal.clone();
  }

  protected getSurfacePosition(offset = this.mountOffset): Vector3 {
    const displacement = this.surfaceNormal.clone().scaleInPlace(offset);
    return this.baseCenter.add(displacement);
  }

  protected createDecorBox(
    name: string,
    size: { width: number; height: number; depth: number },
    options?: {
      distance?: number;
      verticalOffset?: number;
      color?: Color3;
      emissive?: Color3;
      renderingGroupId?: number;
    },
  ): Mesh {
    const mesh = MeshBuilder.CreateBox(name, size, this.scene);
    mesh.isPickable = false;
    const anchor = this.getSurfacePosition(options?.distance ?? this.mountOffset - 0.04);
    mesh.position = new Vector3(anchor.x, anchor.y + (options?.verticalOffset ?? 0), anchor.z);
    mesh.rotation = new Vector3(0, orientationToYaw(this.orientation), 0);
    mesh.renderingGroupId = options?.renderingGroupId ?? 2;

    const material = new StandardMaterial(`${name}-mat`, this.scene);
    const diffuse = options?.color ?? new Color3(0.07, 0.12, 0.22);
    const emissive = options?.emissive ?? diffuse.scale(0.6);
    material.diffuseColor = diffuse;
    material.emissiveColor = emissive;
    material.disableLighting = true;
    mesh.material = material;

    this.addDecoration(mesh);
    return mesh;
  }

  refresh(): void {
    const data = this.dataProvider();
    this.drawBase();
    this.drawHeader();
    this.drawTabs();
    this.drawContent(this.tabs[this.activeTabIndex]?.id ?? null, data);
    this.drawFooter();
    this.texture.update();
  }

  setSessionActive(active: boolean): void {
    if (this.sessionActive === active) {
      return;
    }
    this.sessionActive = active;
    if (active) {
      this.highlighted = true;
    } else {
      if (this.hoverTabIndex !== null) {
        this.hoverTabIndex = null;
      }
    }
    this.updateMaterialGlow();
    this.refresh();
  }

  setHighlighted(highlighted: boolean): void {
    if (this.highlighted === highlighted) {
      return;
    }
    this.highlighted = highlighted;
    if (!this.sessionActive) {
      this.updateMaterialGlow();
    }
    this.refresh();
  }

  setHoverByUV(uv: { u: number; v: number } | null): void {
    const next = uv ? this.tabIndexFromUV(uv) : null;
    if (this.hoverTabIndex === next) {
      return;
    }
    this.hoverTabIndex = next;
    this.refresh();
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    return this.onKeyDown(event);
  }

  handlePointer(event: TerminalPointerEvent): boolean {
    this.setHoverByUV(event.uv);
    const tabIndex = this.tabIndexFromUV(event.uv);
    if (tabIndex !== null) {
      this.setActiveTab(tabIndex);
      return true;
    }
    return this.onPointer(event);
  }

  protected onPointer(_event: TerminalPointerEvent): boolean {
    return false;
  }

  protected onKeyDown(_event: KeyboardEvent): boolean {
    return false;
  }

  protected abstract drawContent(activeTabId: string | null, data: TData): void;

  protected setActiveTab(index: number): void {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }
    if (this.activeTabIndex === index) {
      return;
    }
    this.activeTabIndex = index;
    this.refresh();
  }

  private makeKey(): string {
    return `${this.kind}:${this.position.join(':')}`;
  }

  private shiftTab(delta: number): void {
    if (this.tabs.length === 0) {
      return;
    }
    const next = (this.activeTabIndex + delta + this.tabs.length) % this.tabs.length;
    this.setActiveTab(next);
  }

  private drawBase(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.textureWidth, this.textureHeight);
    ctx.fillStyle = '#050f2a';
    ctx.fillRect(0, 0, this.textureWidth, this.textureHeight);

    const innerX = BORDER;
    const innerY = BORDER;
    const innerW = this.textureWidth - BORDER * 2;
    const innerH = this.textureHeight - BORDER * 2;

    const gradient = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    if (this.sessionActive) {
      gradient.addColorStop(0, 'rgba(55, 140, 255, 0.32)');
      gradient.addColorStop(1, 'rgba(14, 38, 88, 0.92)');
    } else if (this.highlighted) {
      gradient.addColorStop(0, 'rgba(40, 110, 230, 0.24)');
      gradient.addColorStop(1, 'rgba(12, 30, 64, 0.9)');
    } else {
      gradient.addColorStop(0, 'rgba(26, 62, 150, 0.16)');
      gradient.addColorStop(1, 'rgba(10, 24, 54, 0.9)');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(innerX, innerY, innerW, innerH);

    if (this.sessionActive) {
      ctx.strokeStyle = 'rgba(155, 215, 255, 0.95)';
    } else if (this.highlighted) {
      ctx.strokeStyle = 'rgba(120, 185, 250, 0.85)';
    } else {
      ctx.strokeStyle = 'rgba(80, 125, 200, 0.7)';
    }
    ctx.lineWidth = 6;
    ctx.strokeRect(innerX, innerY, innerW, innerH);

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#5a7bcf';
    for (let y = innerY; y < innerY + innerH; y += 4) {
      ctx.fillRect(innerX, y, innerW, 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private tabIndexFromUV(uv: { u: number; v: number }): number | null {
    if (this.tabRects.length === 0) {
      return null;
    }
    const x = uv.u * this.textureWidth;
    const y = (1 - uv.v) * this.textureHeight;
    for (let i = 0; i < this.tabRects.length; i += 1) {
      const rect = this.tabRects[i];
      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return i;
      }
    }
    return null;
  }

  private drawHeader(): void {
    const ctx = this.ctx;
    const headerY = BORDER + 42;
    ctx.save();
    ctx.font = '32px monospace';
    ctx.fillStyle = 'rgba(185, 216, 255, 0.9)';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.title.toUpperCase(), BORDER + 8, headerY);
    ctx.font = '20px monospace';
    ctx.textAlign = 'right';
    if (this.sessionActive) {
      ctx.fillStyle = 'rgba(144, 220, 255, 0.9)';
      ctx.fillText('SESSION ONLINE', this.textureWidth - BORDER - 8, headerY);
    } else if (this.highlighted) {
      ctx.fillStyle = 'rgba(136, 200, 255, 0.85)';
      ctx.fillText('PRESSIONE [E] PARA ACESSAR', this.textureWidth - BORDER - 8, headerY);
    } else {
      ctx.fillStyle = 'rgba(120, 160, 220, 0.7)';
      ctx.fillText('STANDBY', this.textureWidth - BORDER - 8, headerY);
    }
    ctx.restore();
  }

  private drawTabs(): void {
    const ctx = this.ctx;
    const tabCount = this.tabs.length;
    const originX = BORDER + 8;
    const top = BORDER + HEADER_HEIGHT + 12;
    const height = TAB_BAR_HEIGHT - 24;
    const spacing = 14;
    const available = this.textureWidth - BORDER * 2 - 16;
    const tabWidth = tabCount > 0 ? (available - (tabCount - 1) * spacing) / tabCount : available;

    this.tabRects.length = 0;

    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.font = '24px monospace';

    for (let i = 0; i < tabCount; i += 1) {
      const tab = this.tabs[i];
      const x = originX + i * (tabWidth + spacing);
      const isActive = i === this.activeTabIndex;
      const isHover = i === this.hoverTabIndex;
      const idleColor = this.highlighted ? 'rgba(45, 90, 170, 0.6)' : 'rgba(40, 70, 110, 0.55)';
      const hoverColor = this.highlighted ? 'rgba(70, 130, 230, 0.7)' : 'rgba(70, 120, 220, 0.6)';
      const baseColor = isActive
        ? this.accentColor
        : isHover
          ? hoverColor
          : idleColor;
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, top, tabWidth, height);

      ctx.strokeStyle = isActive ? 'rgba(180, 230, 255, 0.8)' : 'rgba(80, 120, 190, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, top, tabWidth, height);

      ctx.fillStyle = isActive ? '#06112a' : 'rgba(200, 220, 255, 0.82)';
      ctx.textAlign = 'center';
      ctx.fillText(tab.label.toUpperCase(), x + tabWidth / 2, top + height / 2);

      this.tabRects.push({ x, y: top, width: tabWidth, height });
    }
    ctx.restore();
  }

  private drawFooter(): void {
    const ctx = this.ctx;
    const baseY = this.textureHeight - BORDER - FOOTER_HEIGHT / 2;
    ctx.save();
    ctx.font = '20px monospace';
    ctx.fillStyle = this.sessionActive ? 'rgba(140, 205, 255, 0.85)' : 'rgba(130, 170, 240, 0.75)';
    ctx.textBaseline = 'middle';
    if (this.sessionActive) {
      ctx.textAlign = 'left';
      ctx.fillText('[ESC] FECHAR', BORDER + 8, baseY);
      ctx.textAlign = 'center';
      ctx.fillText('CLIQUE NAS ABAS PARA MUDAR', this.textureWidth / 2, baseY);
      ctx.textAlign = 'right';
      ctx.fillText('CLIQUE NOS PAINÉIS PARA INTERAGIR', this.textureWidth - BORDER - 8, baseY);
    } else if (this.highlighted) {
      ctx.textAlign = 'center';
      ctx.fillText('PRESSIONE [E] PARA ACESSAR', this.textureWidth / 2, baseY);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText('APROXIME-SE PARA ACESSAR', this.textureWidth / 2, baseY);
    }
    ctx.restore();
  }

  private updateMaterialGlow(): void {
    if (this.sessionActive) {
      this.material.emissiveColor.set(0.55, 0.7, 1);
    } else if (this.highlighted) {
      this.material.emissiveColor.set(0.4, 0.55, 0.85);
    } else {
      this.material.emissiveColor.set(0.26, 0.32, 0.48);
    }
  }
}
````

## File: src/main.ts
````typescript
import './styles.css';
import { bootstrapStarwatch } from './core/bootstrap';

type BootstrapResult = ReturnType<typeof bootstrapStarwatch>;

declare global {
  interface Window {
    starwatch?: BootstrapResult;
  }
}

const context = bootstrapStarwatch();
window.starwatch = context;

console.log('[starwatch] bootstrap concluído');
````

## File: src/types/noa-engine.d.ts
````typescript
declare module 'noa-engine' {
  export class Engine {
    constructor(opts?: Record<string, unknown>);
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    setPaused(paused: boolean): void;
    render(dt: number): void;
    tick(dt: number): void;
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
````

## File: src/styles.css
````css
:root {
  color-scheme: dark;
  font-family: 'Inter', system-ui, sans-serif;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background: #05070a;
  overflow: hidden;
}

#app-root {
  position: relative;
  width: 100%;
  height: 100%;
}

#starwatch-overlay-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

#boot-status {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  color: #cbd5f5;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.overlay-root {
  position: absolute;
  inset: 0;
  outline: none;
  pointer-events: none;
  font-family: 'Inter', system-ui, sans-serif;
}

.overlay-root[data-capture='true'][data-pointer-pass='false'] {
  pointer-events: auto;
}

.overlay-root[data-pointer-pass='true'] {
  pointer-events: none;
}

.overlay-hud-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hotbar-root {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  font-family: 'Inter', system-ui, sans-serif;
}

.hotbar-slots {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  padding: 10px;
  background: rgba(8, 12, 22, 0.65);
  border: 1px solid rgba(102, 140, 255, 0.35);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.hotbar-slot {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(96, 124, 201, 0.5);
  border-radius: 8px;
  background: rgba(10, 18, 34, 0.9);
  color: #d6e4ff;
  cursor: pointer;
  transition: transform 80ms ease-out, border-color 80ms ease-out, box-shadow 80ms ease-out;
}

.hotbar-slot[data-active='true'] {
  border-color: rgba(130, 188, 255, 0.95);
  box-shadow: 0 0 12px rgba(102, 179, 255, 0.65);
  transform: translateY(-4px);
}

.hotbar-slot:hover {
  border-color: rgba(130, 188, 255, 0.6);
}

.hotbar-slot:focus {
  outline: none;
  border-color: rgba(148, 208, 255, 0.85);
}

.hotbar-slot-index {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  opacity: 0.6;
}

.hotbar-slot-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  opacity: 0.15;
}

.hotbar-slot-icon[data-has-item='true'] {
  opacity: 1;
}

.hotbar-tooltip {
  min-width: 260px;
  padding: 12px 16px;
  background: rgba(9, 13, 24, 0.8);
  border: 1px solid rgba(90, 130, 210, 0.45);
  border-radius: 8px;
  color: #e0ecff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 120ms ease-out, transform 120ms ease-out;
  pointer-events: none;
}

.hotbar-tooltip[data-visible='true'] {
  opacity: 1;
  transform: translateY(0);
}

.hotbar-tooltip h2 {
  margin: 0 0 6px;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hotbar-tooltip p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(205, 224, 255, 0.85);
}

.lookat-badge {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  min-width: 240px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid rgba(102, 140, 255, 0.4);
  background: rgba(9, 13, 24, 0.82);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  color: #e3edff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease;
  font-family: 'Inter', system-ui, sans-serif;
}

.lookat-badge[data-visible='true'] {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.lookat-badge__title {
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: rgba(166, 207, 255, 0.95);
}

.lookat-badge__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.lookat-badge .label {
  color: rgba(170, 192, 230, 0.75);
  letter-spacing: 0.05em;
}

.lookat-badge .value {
  font-weight: 600;
  color: rgba(226, 240, 255, 0.95);
}

.lookat-badge .value.is-positive {
  color: #7ef0c6;
}

.lookat-badge .value.is-negative {
  color: #ff7b7b;
}

.lookat-badge__hint {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.7rem;
  color: rgba(168, 196, 238, 0.7);
}

.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  mix-blend-mode: screen;
}

.crosshair__progress {
  position: absolute;
  width: 48px;
  height: 48px;
}

.crosshair__progress-bg {
  stroke: rgba(100, 140, 210, 0.25);
  stroke-width: 2;
  fill: none;
}

.crosshair__progress-ring {
  stroke: rgba(122, 172, 255, 0.85);
  stroke-width: 3;
  stroke-linecap: round;
  fill: none;
  opacity: 0;
  transition: opacity 120ms ease, stroke 120ms ease;
}

.crosshair[data-progress='true'] .crosshair__progress-ring {
  opacity: 1;
}

.crosshair[data-removing='true'] .crosshair__progress-ring {
  stroke: rgba(255, 125, 125, 0.95);
}

.crosshair__reticle {
  position: absolute;
  width: 28px;
  height: 28px;
}

.crosshair__line {
  position: absolute;
  background: rgba(173, 199, 255, 0.6);
  transition: background 120ms ease;
}

.crosshair__line--horizontal {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

.crosshair__line--vertical {
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}

.crosshair__dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(205, 220, 255, 0.8);
  transform: translate(-50%, -50%);
  transition: background 120ms ease, transform 120ms ease;
}

.crosshair[data-removing='true'] .crosshair__line,
.crosshair[data-removing='true'] .crosshair__dot {
  background: rgba(255, 140, 140, 0.9);
}

.crosshair[data-removing='true'] .crosshair__dot {
  transform: translate(-50%, -50%) scale(1.15);
}

#energy-debug-overlay {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 320px;
  max-height: 70vh;
  overflow: auto;
  z-index: 9999;
  font-family: 'IBM Plex Mono', monospace;
}

.energy-debug {
  background: rgba(10, 16, 28, 0.92);
  border: 1px solid rgba(120, 180, 255, 0.45);
  padding: 12px 16px;
  border-radius: 8px;
  color: #d8efff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.energy-debug h2 {
  margin: 0 0 8px;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.energy-debug h3 {
  margin: 10px 0 6px;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(180, 210, 255, 0.85);
}

.energy-debug ul {
  margin: 0;
  padding-left: 16px;
  font-size: 0.7rem;
  line-height: 1.4;
}
````

## File: index.html
````html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Starwatch — Grid Prototype</title>
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <main id="app-root">
      <div id="starwatch-canvas-host"></div>
      <div id="starwatch-overlay-root"></div>
      <section id="boot-status" hidden>
        <p>Inicializando Starwatch…</p>
      </section>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
````

## File: package.json
````json
{
  "name": "starwatch",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "vite",
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "check": "tsc --noEmit && vite build --emptyOutDir false"
  },
  "dependencies": {
    "@babylonjs/core": "^6.49.0",
    "aabb-3d": "github:fenomas/aabb-3d",
    "box-intersect": "github:fenomas/box-intersect",
    "ent-comp": "^0.11.0",
    "events": "^3.3.0",
    "fast-voxel-raycast": "^0.1.1",
    "game-inputs": "^0.8.0",
    "gl-vec3": "^1.2.0",
    "micro-game-shell": "^0.9.0",
    "ndarray": "^1.0.19",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "repomix": "^1.8.0",
    "voxel-aabb-sweep": "^0.5.0",
    "voxel-physics-engine": "^0.13.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.26",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^4.7.0",
    "typescript": "^5.9.3",
    "vite": "^5.4.21"
  }
}
````

## File: src/core/bootstrap.ts
````typescript
import { Engine } from 'noa-engine';
import { initializeSector, type SectorResources } from '../sector';
import { initializePlayer } from '../player';
import { ENGINE_OPTIONS } from '../config/engine-options';
import { initializeOverlay, type OverlayApi } from '../hud/overlay';
import { initializeHotbar, type HotbarApi } from '../player/hotbar';
import { initializePlacementSystem } from '../systems/building/placement-system';
import { initializeEnergySystem, type EnergySystem } from '../systems/energy';
import { initializeUseSystem } from '../systems/interactions/use-system';
import { initializeTerminalSystem, type TerminalSystem } from '../systems/terminals';
import { EnergyDebugOverlay } from '../systems/energy/debug-overlay';
import { LocalStorageAdapter } from '../persistence/local-storage-adapter';
import { ensurePlayerId, PersistenceManager } from '../persistence/manager';
import { DEFAULT_SECTOR_ID } from '../config/sector-options';

export interface StarwatchContext {
  noa: Engine;
  sector: SectorResources;
  world: SectorResources; // @deprecated manter até migrarmos tooling externo
  energy: EnergySystem;
  terminals: TerminalSystem;
  overlay: OverlayApi;
  hotbar: HotbarApi;
  debug?: {
    energyOverlay?: EnergyDebugOverlay;
  };
  persistence?: PersistenceManager;
}

export function bootstrapStarwatch(): StarwatchContext {
  const mountElement = document.getElementById('starwatch-canvas-host');
  if (!mountElement) {
    throw new Error('Host DOM node #starwatch-canvas-host não encontrado.');
  }

  const noa = new Engine({
    ...ENGINE_OPTIONS,
    domElement: mountElement,
    debug: import.meta.env.DEV,
    showFPS: import.meta.env.DEV,
  });

  const sector = initializeSector(noa);
  const energy = initializeEnergySystem(noa, sector);

  const hotbar = initializeHotbar();
  const overlay = initializeOverlay(noa, { hotbarController: hotbar.controller, energy });
  const terminals = initializeTerminalSystem({ noa, overlay, energy });
  hotbar.attachOverlay(overlay);

  initializePlayer(noa, { hotbar, overlay });
  initializePlacementSystem({ noa, overlay, hotbar, sector, energy, terminals });
  initializeUseSystem({ noa, overlay, sector, terminals });

  const playerId = ensurePlayerId();
  const persistence = new PersistenceManager({
    adapter: new LocalStorageAdapter(),
    playerId,
    sectorId: DEFAULT_SECTOR_ID,
    context: { noa, sector, energy, hotbar, terminals },
    autosaveIntervalMs: 30000,
  });
  persistence.load();

  let energyDebug: EnergyDebugOverlay | undefined;
  if (import.meta.env.VITE_DEBUG_ENERGY === '1') {
    energyDebug = new EnergyDebugOverlay(energy);
    energyDebug.setVisible(true);
    noa.on('tick', (dt: number) => {
      energyDebug?.handleTick(dt);
    });
  }

  noa.container.setPointerLock(true);
  noa.container.on('DOMready', () => {
    document.getElementById('boot-status')?.setAttribute('hidden', 'true');
    console.log('[starwatch] DOM pronto, pointer lock disponível?', noa.container.supportsPointerLock);
  });

  console.log(`[starwatch] noa-engine inicializada v${noa.version}`);

  if (typeof window !== 'undefined') {
    // Expor para debug manual.
    (window as any).starwatchPersistence = persistence;
  }

  return {
    noa,
    sector,
    world: sector,
    energy,
    terminals,
    overlay,
    hotbar,
    debug: {
      energyOverlay: energyDebug,
    },
    persistence,
  };
}
````
