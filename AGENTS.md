# Starwatch Field Manual

Welcome aboard the Mad Dash Initiative. We rebuilt the project structure mid-flight to chase a new goal: a first-person ship builder you can live inside, driven by AI automation. This document keeps everyone oriented—especially as we keep the previous stack mothballed for reference.

## Current Timeline
- **2025-10-18** — Operation One Shot: we froze the original chat/editor/game UI in `src/legacy/` and spun up a fresh FPS hangar to stress-test wall placement, rotation, and general feel.
- Earlier commits predate the reset and live entirely inside the legacy tree; treat them as historical artifacts unless you are backporting specific ideas.

## Code Constellation
- `src/` now hosts the new MVP:
  - `App.tsx`, `main.tsx` — minimal bootstrap for the builder prototype.
  - `fps/ShipBuilderCanvas.tsx` — Babylon.js scene for first-person movement, placement tooling, and HUD overlays.
- Placement runtime highlights:
  - `fps/core/sceneContext.ts` builds the hangar hull, registers static meshes, and now publishes a `SurfaceRegistry`.
  - `fps/placement/surfaces/` defines pluggable surface adapters (`WallSurface`, `FloorSurface`, …); every pickable surface registers here with consistent normals, snap grids, and offsets.
  - `fps/placement/placementSolver.ts` takes a tool profile (modes + constraints) and resolves placement frames from ray picks, so tools no longer manage Babylon math directly.
  - Tools (e.g., `lampTool`, `wallTool`) receive the shared solver via `ToolRuntimeContext` and only worry about preview meshes and item lifecycles. Adding a new “crate” that lives on the floor (or multi-surface items) is now a matter of declaring allowed modes in the profile and registering the relevant surfaces.
- `src/legacy/` shelters the previous React panels, HAL wiring, and Babylon scene (`game/`, `ui/`, `hal/`, plus old entry points). Use this when you need to reference assets or revive older features without polluting the new loop.
- `dist/`, `docs/`, and `releases/` retain their original purposes; respect `.gitignore` for generated assets.

## Build & Run Checklist
- `pnpm install` — install dependencies (Babylon.js already bundled; expect large builds).
- `pnpm dev` — Vite dev server for rapid iteration on the FPS builder.
- `pnpm build` — TypeScript check + production bundle (watch for >500 kB chunk warnings due to Babylon; we will code-split later).
- `pnpm preview` — smoke-test the built assets.
- Keep `pnpm test` reserved for the future Vitest suite (no specs yet post-reset).

## Coding Playbook
- Strict TypeScript—no `any`. Use Babylon types (`Mesh`, `PointerInfo`, etc.) to keep editor assistance sharp.
- Two-space indent, camelCase helpers, PascalCase React components.
- Inline styles acceptable for HUD prototypes; migrate to shared styling once components settle.
- Add comments only where Babylon abstractions or math need extra context.

## Testing & Telemetry
- Vitest + React Testing Library remain the plan. For now, favor small utility tests when you introduce deterministic builders or data serializers.
- Record manual repro steps when you tweak input handling (mouse lock, sprint, rotation) so the next agent can verify quickly.

## Collaboration Protocols
- Conventional Commits (`feat:`, `fix:`, `chore:`…). Branch as `feat/builder-controls` or similar.
- PRs: include summary GIFs or short clips showing the builder interactions; list manual verification commands (`pnpm dev`, `pnpm build`).
- Leave the legacy code untouched unless you are extracting assets or documenting behavior; if you do open it, call it out in your PR description.

## Security & Configuration
- `.env` continues to be ignored; share sanitized `.env.example` values for any future HAL/LLM work (`OPENAI_API_KEY`, `OPENAI_MODEL` placeholders).
- Environment variables load through `import.meta.env.OPENAI_*`; validate in both dev and preview builds.

## Mission Ahead
- Short term: expand the builder with inventory selection, persistence, and undo/redo.
- Mid term: bring back HAL control, AI crew, and automation routines on top of the new world state.
- Long term: merge the rebuilt FPS core with narrative/chat layers once the construction loop feels right. Cross-check ideas with `MANIFESTO.md` whenever we plan new systems; that living document still captures the grand strategy and narrative tone we aim to restore.

Document the weird, celebrate the breakthroughs, and keep shipping. The hangar is ours now.
