import {
  createEmptyPlayerState,
  PLAYER_STATE_VERSION,
  type PlayerInputState,
  type PlayerMovementIntent,
  type PlayerModuleSnapshot,
  type PlayerState,
  type PlayerTransformState,
} from "./playerState";

type PlayerStateListener = (state: PlayerState) => void;

export interface PlayerEvent<TPayload = unknown> {
  type: string;
  payload?: TPayload;
}

type PlayerEventListener = (event: PlayerEvent) => void;

export interface PlayerModuleDefinition<TState extends Record<string, unknown>> {
  id: string;
  version: number;
  createInitialState(): TState;
  onRegister?(context: PlayerModuleContext<TState>): void;
  onDispose?(context: PlayerModuleContext<TState>): void;
}

export interface PlayerModuleContext<TState extends Record<string, unknown>> {
  read(): TState;
  set(next: TState): void;
  patch(patch: Partial<TState>): void;
  emit(event: PlayerEvent): void;
  actions(): PlayerActionContext;
}

export interface PlayerStoreActions {
  setTransform(transform: PlayerTransformState): void;
  patchMovementIntent(intent: Partial<PlayerMovementIntent>): void;
  setMovementIntent(intent: PlayerMovementIntent): void;
  patchInput(input: Partial<PlayerInputState>): void;
  registerModule<TState extends Record<string, unknown>>(
    definition: PlayerModuleDefinition<TState>,
  ): void;
  unregisterModule(moduleId: string): void;
  emit(event: PlayerEvent): void;
}

export interface PlayerActionContext {
  readState(): PlayerState;
  readTransform(): PlayerTransformState;
  setTransform(transform: PlayerTransformState): void;
  patchMovementIntent(intent: Partial<PlayerMovementIntent>): void;
  updateModule<TState extends Record<string, unknown>>(
    moduleId: string,
    updater: (current: TState) => TState,
  ): void;
  emit(event: PlayerEvent): void;
}

interface PlayerModuleRegistration<TState extends Record<string, unknown>> {
  definition: PlayerModuleDefinition<TState>;
  context: PlayerModuleContext<TState>;
}

export class PlayerStore {
  private state: PlayerState;
  private listeners: Set<PlayerStateListener>;
  private eventListeners: Set<PlayerEventListener>;
  private modules: Map<string, PlayerModuleRegistration<Record<string, unknown>>>;

  constructor(initialState?: PlayerState) {
    this.state = normalizePlayerState(initialState);
    this.listeners = new Set();
    this.eventListeners = new Set();
    this.modules = new Map();
  }

  getSnapshot(): PlayerState {
    return clonePlayerState(this.state);
  }

  getActions(): PlayerStoreActions {
    return {
      setTransform: (transform) => {
        this.setTransform(transform);
      },
      patchMovementIntent: (intent) => {
        this.patchMovementIntent(intent);
      },
      setMovementIntent: (intent) => {
        this.setMovementIntent(intent);
      },
      patchInput: (input) => {
        this.patchInput(input);
      },
      registerModule: (definition) => {
        this.registerModule(definition);
      },
      unregisterModule: (moduleId) => {
        this.unregisterModule(moduleId);
      },
      emit: (event) => {
        this.emit(event);
      },
    };
  }

  getActionContext(): PlayerActionContext {
    return {
      readState: () => this.getSnapshot(),
      readTransform: () => cloneTransform(this.state.transform),
      setTransform: (transform) => this.setTransform(transform),
      patchMovementIntent: (intent) => this.patchMovementIntent(intent),
      updateModule: (moduleId, updater) => {
        this.updateModule(moduleId, updater as (current: Record<string, unknown>) => Record<string, unknown>);
      },
      emit: (event) => this.emit(event),
    };
  }

  subscribe(listener: PlayerStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeEvents(listener: PlayerEventListener): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  replace(nextState: PlayerState) {
    this.state = normalizePlayerState(nextState);
    this.notify();
  }

  setTransform(transform: PlayerTransformState) {
    if (transformsEqual(this.state.transform, transform)) {
      return;
    }
    this.state = {
      ...this.state,
      transform: cloneTransform(transform),
    };
    this.notify();
  }

  setMovementIntent(intent: PlayerMovementIntent) {
    if (movementIntentEqual(this.state.movementIntent, intent)) {
      return;
    }
    this.state = {
      ...this.state,
      movementIntent: cloneMovementIntent(intent),
    };
    this.notify();
  }

  patchMovementIntent(intent: Partial<PlayerMovementIntent>) {
    const next = { ...this.state.movementIntent, ...intent };
    this.setMovementIntent(next);
  }

  patchInput(input: Partial<PlayerInputState>) {
    const next = { ...this.state.input, ...input };
    if (inputStateEqual(this.state.input, next)) {
      return;
    }
    this.state = {
      ...this.state,
      input: next,
    };
    this.notify();
  }

  registerModule<TState extends Record<string, unknown>>(
    definition: PlayerModuleDefinition<TState>,
  ) {
    if (this.modules.has(definition.id)) {
      return;
    }

    const persisted = this.state.modules[definition.id];
    const moduleState =
      persisted && persisted.version === definition.version
        ? (persisted.state as TState)
        : definition.createInitialState();

    this.state = {
      ...this.state,
      modules: {
        ...this.state.modules,
        [definition.id]: {
          id: definition.id,
          version: definition.version,
          state: cloneRecord(moduleState),
        },
      },
    };

    const context: PlayerModuleContext<TState> = {
      read: () => cloneRecord(this.state.modules[definition.id].state as TState),
      set: (next) => {
        this.state = {
          ...this.state,
          modules: {
            ...this.state.modules,
            [definition.id]: {
              id: definition.id,
              version: definition.version,
              state: cloneRecord(next),
            },
          },
        };
        this.notify();
        this.emit({ type: "player.module.updated", payload: { moduleId: definition.id } });
      },
      patch: (patch) => {
        const previous = this.state.modules[definition.id].state as TState;
        const next = { ...previous, ...patch };
        context.set(next);
      },
      emit: (event) => {
        this.emit(event);
      },
      actions: () => this.getActionContext(),
    };

    this.modules.set(definition.id, {
      definition,
      context,
    });

    definition.onRegister?.(context);
    this.emit({ type: "player.module.registered", payload: { moduleId: definition.id } });
    this.notify();
  }

  unregisterModule(moduleId: string) {
    const registration = this.modules.get(moduleId);
    if (!registration) {
      return;
    }

    registration.definition.onDispose?.(registration.context);
    this.modules.delete(moduleId);
    const nextModules = { ...this.state.modules };
    delete nextModules[moduleId];
    this.state = {
      ...this.state,
      modules: nextModules,
    };
    this.emit({ type: "player.module.unregistered", payload: { moduleId } });
    this.notify();
  }

  emit(event: PlayerEvent) {
    this.eventListeners.forEach((listener) => {
      listener(event);
    });
  }

  private updateModule(
    moduleId: string,
    updater: (current: Record<string, unknown>) => Record<string, unknown>,
  ) {
    const moduleSnapshot = this.state.modules[moduleId];
    if (!moduleSnapshot) {
      return;
    }
    const current = moduleSnapshot.state;
    const next = updater(current);
    if (shallowEqual(current, next)) {
      return;
    }
    this.state = {
      ...this.state,
      modules: {
        ...this.state.modules,
        [moduleId]: {
          id: moduleSnapshot.id,
          version: moduleSnapshot.version,
          state: cloneRecord(next),
        },
      },
    };
    this.notify();
    this.emit({ type: "player.module.updated", payload: { moduleId } });
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => {
      listener(snapshot);
    });
  }
}

function normalizePlayerState(state?: PlayerState): PlayerState {
  if (!state || state.version !== PLAYER_STATE_VERSION) {
    return createEmptyPlayerState();
  }
  const snapshot = createEmptyPlayerState();
  snapshot.transform = cloneTransform(state.transform);
  snapshot.movementIntent = cloneMovementIntent(state.movementIntent);
  snapshot.input = { ...state.input };
  snapshot.modules = {};
  Object.values(state.modules ?? {}).forEach((module) => {
    if (!module) {
      return;
    }
    snapshot.modules[module.id] = {
      id: module.id,
      version: module.version,
      state: cloneRecord(module.state),
    };
  });
  return snapshot;
}

function clonePlayerState(state: PlayerState): PlayerState {
  return {
    version: state.version,
    transform: cloneTransform(state.transform),
    movementIntent: cloneMovementIntent(state.movementIntent),
    input: { ...state.input },
    modules: cloneModules(state.modules),
  };
}

function cloneTransform(transform: PlayerTransformState): PlayerTransformState {
  return {
    position: { ...transform.position },
    orientation: { ...transform.orientation },
    velocity: { ...transform.velocity },
  };
}

function cloneMovementIntent(intent: PlayerMovementIntent): PlayerMovementIntent {
  return {
    move: { ...intent.move },
    sprint: intent.sprint,
    jump: intent.jump,
    crouch: intent.crouch,
  };
}

function cloneModules(
  modules: Record<string, PlayerModuleSnapshot<Record<string, unknown>>>,
): Record<string, PlayerModuleSnapshot<Record<string, unknown>>> {
  const copy: Record<string, PlayerModuleSnapshot<Record<string, unknown>>> = {};
  Object.values(modules).forEach((module) => {
    if (!module) {
      return;
    }
    copy[module.id] = {
      id: module.id,
      version: module.version,
      state: cloneRecord(module.state),
    };
  });
  return copy;
}

function cloneRecord<T extends Record<string, unknown>>(record: T): T {
  return { ...record };
}

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key) => Object.is(a[key], b[key]));
}

function transformsEqual(a: PlayerTransformState, b: PlayerTransformState) {
  return (
    almostEqual(a.position.x, b.position.x) &&
    almostEqual(a.position.y, b.position.y) &&
    almostEqual(a.position.z, b.position.z) &&
    almostEqual(a.velocity.x, b.velocity.x) &&
    almostEqual(a.velocity.y, b.velocity.y) &&
    almostEqual(a.velocity.z, b.velocity.z) &&
    almostEqual(a.orientation.x, b.orientation.x) &&
    almostEqual(a.orientation.y, b.orientation.y) &&
    almostEqual(a.orientation.z, b.orientation.z) &&
    almostEqual(a.orientation.w, b.orientation.w)
  );
}

function movementIntentEqual(a: PlayerMovementIntent, b: PlayerMovementIntent) {
  return (
    almostEqual(a.move.x, b.move.x) &&
    almostEqual(a.move.z, b.move.z) &&
    a.sprint === b.sprint &&
    a.jump === b.jump &&
    a.crouch === b.crouch
  );
}

function inputStateEqual(a: PlayerInputState, b: PlayerInputState) {
  return (
    a.pointerLocked === b.pointerLocked &&
    a.movementLocked === b.movementLocked &&
    a.cameraLocked === b.cameraLocked
  );
}

function almostEqual(a: number, b: number) {
  return Math.abs(a - b) <= 1e-5;
}
