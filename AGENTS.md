# Repository Guidelines

## Project Structure & Module Organization
- `src/` – application code
  - `src/ui/` React views (`Chat.tsx`, `MonacoEditor.tsx`)
  - `src/game/` Babylon.js gameplay (`Game.ts`, `world.ts`)
  - `src/hal/` LLM bridge (`halLLM.ts`)
  - `src/main.tsx`, `src/App.tsx` app entry
- `index.html` Vite HTML entry
- `vite.config.ts`, `tsconfig.json` build/config
- `dist/` build output (ignored)
- `docs/` reference docs
- `releases/` release notes

## Build, Run & Environment
- Install: `pnpm install` (pnpm is preferred; lockfile present)
- Dev server: `pnpm dev` (Vite at http://localhost:5173)
- Build: `pnpm build` (TypeScript compile + Vite bundle)
- Preview build: `pnpm preview`
- Node 18+ recommended. Environment: set `OPENAI_API_KEY` (or `VITE_OPENAI_API_KEY`) and optional `OPENAI_MODEL` (default `gpt-4o-mini`). Example `.env`:
  
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4o-mini

## Coding Style & Naming Conventions
- TypeScript strict; avoid `any`. Two-space indentation.
- React function components; components PascalCase (`App.tsx`), files in `ui/` follow this pattern.
- Variables/functions camelCase; folders lowercase.
- Keep inline styles consistent with existing code; prefer local, focused modules and explicit types.

## Testing Guidelines
- No automated tests yet. If adding:
  - Use Vitest; React Testing Library for UI.
  - Name tests `*.test.ts`/`*.test.tsx` near sources or in `src/__tests__/`.
  - Prioritize fast unit tests for `world.ts` (determinism) and `halLLM.ts` (intent handling).

## Commit & Pull Request Guidelines
- Follow Conventional Commits (seen in history): `feat: ...`, `fix: ...`, `chore: ...`.
- Branch naming: `feat/<scope>`, `fix/<scope>`.
- PRs include: clear description, linked issues, screenshots/GIFs for UI, and manual test steps (dev server or preview).
- Keep PRs focused; update docs or release notes when relevant.

## Security & Configuration Tips
- Do not commit real secrets. `.env` is git-ignored.
- Vite maps `OPENAI_*` → `import.meta.env.VITE_OPENAI_*`; verify in `vite.config.ts`.
- For contributors, consider adding a sanitized `.env.example` with required keys.

## Architecture Overview
- Game: Babylon.js scene, sector generation, mining and scanning (`src/game/*`).
- HAL: LLM intent → game tool calls (`src/hal/halLLM.ts`).
- UI: Chat/Editor panels + canvas HUD (`src/ui/*`, `App.tsx`).
