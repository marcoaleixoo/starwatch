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
