# StarWatch: The Silent Sector (V0.0.1)

Single‑player prototype with Babylon.js rendering and a HAL‑9001 LLM agent controlling the ship via tools. Built with Vite + React + TypeScript + Vercel AI SDK.

## Quickstart

- Requirements: Node 18+, pnpm
- Install deps: `pnpm install`
- Start dev server: `pnpm start`
- Open: http://localhost:5173

## HAL Setup (AI)

- Option A (env): create a `.env` with `VITE_OPENAI_API_KEY=sk-...` and optionally `VITE_OPENAI_MODEL=gpt-4o-mini`.
- Option B (UI): go to the Status tab → paste your API key and choose a model.
- In the Com‑Link tab, try:
  - `Mova a nave para 500, 0, 250`
  - `Execute patrol.js`

Notes: For prototyping only, the key is stored in `localStorage` and used client‑side. For production, proxy requests via a backend or use a local LLM.

## Scripts

- `pnpm start` — Run Vite dev server
- `pnpm build` — Type‑check and build
- `pnpm preview` — Preview production build

## Project Structure

- `src/game` — Babylon.js scene + game loop
- `src/ui` — React UI (Com‑Link chat, Monaco editor)
- `src/hal` — HAL‑9001 agent (Vercel AI SDK + tools)
- `MANIFESTO.md` — Vision and scope

## License

Prototype for personal use. No license specified.
