# Building Systems

Este módulo centraliza toda a lógica de colocação e remoção de blocos jogáveis. A arquitetura está dividida em peças pequenas para manter o requisito de modularidade do manual:

- `build-state.ts`: mantém o estado corrente de construção (definição ativa, escala de grid e escalas disponíveis). Expõe um `subscribe` usado pelo HUD para exibir o tamanho ativo e pelos sistemas para aplicar restrições.
- `ghost-renderer.ts`: renderiza o "ghost" de pré-visualização com base na escala corrente. Faz cache de meshes por bloco/escala para evitar recriações.
- `microblock-store.ts`: registra subdivisões de um voxel (microblocos) em memória, atualiza o `blockMetadataStore` e instancia meshes individuais via Babylon.
- `placement-system.ts`: orquestra entradas do jogador, garante que apenas escalas suportadas sejam usadas, delega persistência de orientação, microblocos e integra com energia/terminais.

## Regras de Escala de Grid

As escalas válidas ficam em `src/config/build-options.ts`. Cada definição de bloco declara em `placement.shapes` quais escalas aceita. O placement system consulta essas estruturas para:

1. Calcular o centro da subcélula (`resolvePlacementCenter`).
2. Validar colisão lógica (ocupação de voxel ou microcélula).
3. Renderizar o ghost com o tamanho correto.

Quando o jogador pressiona `Q`, o `BuildState` avança a escala compatível e avisa o HUD através do `buildScale` tracker.

## Microblocos (v0)

- As subdivisões são armazenadas no `blockMetadataStore` usando `setMicroblockCell`.
- A renderização usa instâncias Babylon independentes no `MicroblockStore`. Não há colisão física ainda (a engine continua reportando o voxel como vazio), então o caso de uso atual é puramente visual/iterativo.
- Remoção rápida (`KeyX`) procura a subcélula usando o `resolvePlacementCenter` com o `scaleId` registrado. O hold (`Mouse1`) continua removendo apenas blocos "cheios".
- Se o voxel já possuir um bloco 1×1 do mesmo tipo, selecionar uma escala micro converte o voxel para o bloco host `starwatch:deck-micro-host` e reaproveita o condutor existente.
- Com o host ativo (visual translúcido), o jogador pode mirar tanto o topo quanto as laterais para selecionar subcélulas (o cálculo usa o ponto de impacto do raycast para decidir em qual quadrante posicionar) e as peças aparecem como painéis rasos azuis sobre o deck.
- Quando o último microbloco é removido, o host volta a ser um deck padrão (sem derrubar a rede elétrica).
- A rede elétrica (`EnergyNetworkManager`) trata `starwatch:deck` e `starwatch:deck-micro-host` como o mesmo condutor, então a conectividade permanece estável durante as conversões.

### Pontos em aberto

- Persistência: ainda não serializa microblocos (próxima etapa ao integrar com `PersistenceManager`).
- Colisão física: precisamos analisar se usaremos entidades de física auxiliares ou patch no NOA.
- Conversão micro → bloco cheio: bloqueada enquanto microblocos ocuparem o voxel. Precisamos de fluxo de "limpar todas as microcélulas" + permitir override conforme design.

## HUD

O HUD consome o estado via `buildScale` (veja `BuildScaleIndicator`). A regra é manter o overlay sem acessar `BuildState` diretamente — o placement system publica atualizações.

## Testes/Validação Manual

1. Selecionar `Deck` e pressionar `Q` alterna `1x ↔ 1/2x` (ghost muda de tamanho).
2. Com `1/2x`, apontar para o deck base e clicar com `Mouse3` adiciona um microbloco visível.
3. Pressionar `KeyX` remove o microbloco mais próximo.
4. Tentar posicionar microbloco com voxel ocupado deve mostrar ghost vermelho.

Sempre executar `pnpm exec tsc --noEmit` antes de entregar para garantir que os tipos batem.

## Debug

Execute `VITE_DEBUG_BUILDING=1 pnpm dev` para habilitar logs `[building] placement ...` que mostram base/escala, motivos de bloqueio e transições deck ↔ host durante o fluxo de construção.

## Diário de Aprendizados

- **Microbloco visível ≠ voxel menor:** tentar apenas escalar o cubo padrão não funciona. Mesmo com `size` reduzido, o mesh continuava “fundido” com o deck e sumia por z-fighting. A solução foi gerar uma malha dedicada por célula (um painel fino, ligeiramente acima do deck) e posicioná-la manualmente.
- **Host separado simplifica integração:** manter `starwatch:deck-micro-host` como bloco de gameplay evita mexer no NOA. Ele persiste a colisão e integra com a rede de energia, enquanto o painel azul é só visual.
- **Logs direcionados ajudam:** o modo `VITE_DEBUG_BUILDING` mostrou que o microbloco estava sendo registrado (contador/motivo), então o bug era só visual. Sem esses logs teríamos continuado caçando problema na lógica.
- **Iterar fora da engine é mais seguro:** confirmar comportamento primeiro na camada Starwatch evita refatorações na engine vendorizada. Se no futuro quisermos um mesher nativo de subvoxels, já temos requisitos claros (posicionamento por célula, altura custom, material emissivo, colisão opcional).

Próximos passos imediatos para o "Deck Condutivo Micro" (nome provisório do painel azul): definir textura própria, colisão empilhável e persistência das microcélulas.
