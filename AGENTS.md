# Repository Guidelines

## Project Structure & Module Organization
The app code lives in `src/`, split into focused modules:
- `src/ui/` hosts React panels such as `Chat.tsx` and `MonacoEditor.tsx`.
- `src/game/` contains Babylon.js gameplay logic (`Game.ts`, `world.ts`).
- `src/hal/` bridges HAL tool calls (`halLLM.ts`).
- `src/App.tsx` and `src/main.tsx` bootstrap the UI; `index.html` configures Vite entry.
Keep build artifacts in `dist/` (ignored), docs in `docs/`, and release notes in `releases/`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (pnpm is the supported package manager).
- `pnpm dev` — start the Vite dev server at http://localhost:5173/.
- `pnpm build` — run TypeScript checks and create a production bundle in `dist/`.
- `pnpm preview` — serve the built bundle locally for smoke testing.
Add `pnpm test` once Vitest suites land so the command stays discoverable.

## Coding Style & Naming Conventions
Use TypeScript with strict types; avoid `any`. Keep indentation at two spaces. Components in `src/ui/` are PascalCase files exporting function components. Favor camelCase for variables and helpers. Keep inline styles minimal and aligned with existing patterns.

## Testing Guidelines
Adopt Vitest with React Testing Library for UI and deterministic unit tests for `src/game/world.ts` and `src/hal/halLLM.ts`. Name specs `*.test.ts` or `*.test.tsx` near their subjects. Run the suite via `pnpm test`; ensure tests complete quickly to support the feedback loop.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`). Scope branches as `feat/<scope>` or `fix/<scope>`. PRs should include a concise summary, linked issues, screenshots or GIFs for UI updates, and manual verification steps (`pnpm dev` or `pnpm preview`).

## Security & Configuration Tips
Never commit real API keys; `.env` is ignored. Provide contributors a sanitized `.env.example` with `OPENAI_API_KEY` and optional `OPENAI_MODEL`. Vite exposes `OPENAI_*` variables via `import.meta.env`, so reference them through that accessor.

## Architecture Overview
The Babylon.js game orchestrates sectors and scanning/mining interactions, the HAL layer translates LLM intents into tool calls, and the React UI hosts the chat, editor, and canvas HUD. Understanding these boundaries keeps changes localized and reviewable.
