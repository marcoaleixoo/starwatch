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
