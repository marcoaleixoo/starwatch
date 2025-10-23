# Repository Guidelines


The MANIFESTO.md is the bible of this project. Always check it to see if the user already defined something there, if not, try to confirm, you are working for a user that's building a game and you are the engineer, the user the the master who know how the game needs to look like/behave.
Feel free to add console.log() so the user can collect the logs for you.


## Project Structure & Module Organization
- `src/core/`: bootstrap entry point, tick loop, shared constants.
- `src/world/`: NOA world wrappers, block definitions, chunk hooks.
- `src/player/`: player mesh, FPS movement, pointer-lock handlers.
- `src/hud/`: crosshair, status panel, toolbar UI and related constants.
- `src/config/`: global configuration (grid size, engine options, defaults).
- `src/systems/`, `src/blocks/`, `src/ai/`, `src/scripts/`, `src/persistence/`, `src/utils/`: reserved for upcoming subsystems—create modules here as roadmap items ship.
- `index.html`, `styles.css`: minimal Babylon/NOA canvas shell.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (NOA, Babylon, Vite, TypeScript).
- `pnpm dev` — start Vite dev server on http://localhost:5173 with hot reload.
- `pnpm build` — run TypeScript check and produce production bundle.
- `pnpm exec tsc --noEmit` — type-check without emitting files; run before commits/PRs.

## Coding Style & Naming Conventions
- Language: TypeScript (ES Modules). Prefer explicit types and exported constants over magic literals.
- Constants live near their module (`hud/constants.ts`) or in `src/config/constants.ts` when global.
- File naming: kebab-case for files (`pointer-lock.ts`), singular directory names (`core`, `world`).
- Indentation: two spaces; trailing commas; single quotes in TS/JS; double quotes only for JSON.

## Testing Guidelines
- Automated tests are pending. When added, mirror src structure under `src/__tests__/`.
- Use `pnpm exec tsc --noEmit` as smoke test. Target future `pnpm test` script (Vitest/Jest) for regression checks.

## Commit & Pull Request Guidelines
- Commit format: `<scope>: <summary>` (e.g., `world: add asteroid chunk gen`). Keep commits focused.
- Include testing notes in commit body/PR description (`pnpm dev`, `pnpm build`, `pnpm exec tsc --noEmit`).
- PRs should link relevant issue/roadmap entry, summarize changes, and attach screenshots/GIFs for UI adjustments.

## NOA Engine Notes
- NOA wraps Babylon.js for voxel rendering, chunk management, and FPS input.
- Register materials via `noa.registry.registerMaterial`, then register blocks by ID.
- Handle chunk generation in the `worldDataNeeded` event, populate the provided ndarray, and call `noa.world.setChunkData`.
- Access Babylon scene (`noa.rendering.getScene()`) for custom lighting, meshes, or post-processing.
- Input bindings: use `noa.inputs.bind('action', ['KeyE'])` and listen with `noa.inputs.down.on('action', cb)`.
- Keep NOA-specific logic encapsulated in `world/` and `player/` so future engine replacements remain feasible.

