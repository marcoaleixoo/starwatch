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
4. Remover blocos com `Mouse2`/`X` garante que o catálogo limpe as orientações registradas.

Qualquer novo bloco deve ser adicionado aqui, mantendo o registro centralizado e documentado.
