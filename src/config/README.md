# Config Options

Todos os parâmetros ajustáveis do jogo vivem em arquivos `*-options.ts` neste diretório. Cada arquivo documenta onde os valores são consumidos:

- `engine-options.ts`: opções passadas diretamente ao `noa-engine` durante o bootstrap (spawn, pointer lock, chunk size, etc.).
- `render-options.ts`: draw distance, tamanho de chunk e distâncias de add/remove.
- `world-options.ts`: plataforma inicial e cinturão de nuvens/asteroides.
- `player-options.ts`: limites de zoom e parâmetros de movimentação do jogador.

Novas features devem introduzir seu próprio arquivo `foo-options.ts` e importar as constantes correspondentes a partir dele.
