# Repository Guidelines

This guide captures the essentials for contributing to Starwatch so new and returning agents can get productive quickly.

## Project Structure & Module Organization
- `src/ui/` hosts React panels such as `Chat.tsx` and `MonacoEditor.tsx`.
- `src/game/` contains Babylon.js logic (`Game.ts`, `world.ts`) and related assets.
- `src/hal/` bridges HAL tool calls, including `halLLM.ts`.
- `src/App.tsx` and `src/main.tsx` bootstrap the Vite UI; `index.html` defines the entry point.
- Keep docs in `docs/`, releases in `releases/`, and production bundles in the ignored `dist/`.

## Build, Test, and Development Commands
- `pnpm install` — install all project dependencies.
- `pnpm dev` — start Vite at http://localhost:5173/ for iterative development.
- `pnpm build` — run TypeScript checks and emit the production bundle to `dist/`.
- `pnpm preview` — serve the built bundle locally for smoke testing.
- Reserve `pnpm test` for the Vitest suite once specs land so the command remains discoverable.

## Coding Style & Naming Conventions
- TypeScript everywhere, strict typing, and avoid `any`.
- Two-space indentation, camelCase for helpers, PascalCase for React components in `src/ui/`.
- Keep inline styles minimal; prefer existing styling patterns.
- Use eslint/prettier configs already committed; run `pnpm lint` if added in the future.

## Testing Guidelines
- Adopt Vitest with React Testing Library for UI and deterministic unit tests in `src/game/` and `src/hal/`.
- Name specs `*.test.ts` or `*.test.tsx` alongside their modules.
- Aim for fast, deterministic tests; keep coverage expectations explicit in PRs.

## Commit & Pull Request Guidelines
- Follow Conventional Commits like `feat: add mining scanner HUD` or `fix: stabilize world tick`.
- Branch naming: `feat/<scope>` or `fix/<scope>`.
- PRs need a concise summary, linked issues, relevant screenshots/GIFs for UI work, and manual verification steps (`pnpm dev`, `pnpm preview`).

## Security & Configuration Tips
- Never commit real API keys. `.env` is ignored; ship a sanitized `.env.example` with `OPENAI_API_KEY` and optional `OPENAI_MODEL`.
- Access environment variables via `import.meta.env.OPENAI_*` within the client.

## Architecture Overview
- Babylon.js governs gameplay: sectors, scanning, and mining federation.
- The HAL layer translates LLM intents into tool calls.
- React UI panels host chat, editor, and HUD, coordinating with game and HAL modules without crossing concerns.
