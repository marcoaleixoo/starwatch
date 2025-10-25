# AGENTS FIELD MANUAL — ENGINEERING PLAYBOOK

Este documento descreve o comportamento esperado de todo agente técnico que tocar no repositório **Starwatch**. Leia integralmente antes de iniciar qualquer tarefa. O MANIFESTO continua sendo a bíblia de produto, narrativa e sistema; este manual codifica o “como” da execução diária. Ignorar estas diretrizes gera retrabalho, ruído e perda de confiança.

---

## 1. Princípios Gerais

1. **Visão acima de tudo.** Cada alteração deve ser rastreável para um item do MANIFESTO. Se algo estiver ambíguo, procure primeiro no MANIFESTO e depois confirme com o usuário. Não assuma.
2. **Engineers are servants of the vision.** Somos responsáveis por viabilizar o jogo exato que o usuário imagina. Nunca imponha preferências pessoais sem alinhamento explícito.
3. **Transparência radical.** Documente decisões, trade-offs e limitações diretamente no código com comentários curtos ou em READMEs locais. Logs (`console.log`) são encorajados quando ajudam a diagnosticar comportamentos ou dar visibilidade ao usuário.
4. **Trabalho incremental, sempre funcional.** Após cada alteração relevante, o jogo deve executar (`pnpm dev`) e compilar (`pnpm exec tsc --noEmit`). Evite “big bang refactors”.
5. **Single source of truth.** O repositório deve ser autoexplicativo: nenhum conhecimento deve ficar preso na cabeça do engenheiro. Atualize READMEs, GUIs internas e comentários sempre que mudar comportamento.

---

## 2. Estrutura do Projeto e Áreas de Responsabilidade

A árvore `src/` reflete o roadmap definido no MANIFESTO. Diretórios vazios possuem README descrevendo expectativas futuras; use-os como guia para novos módulos.

- `src/core/`: ponto de entrada. Responsável por instanciar o engine, orquestrar inicializações, lidar com lifecycle e dependências globais. Qualquer novo sistema deve expor uma função `initializeX()` e ser registrado aqui.
- `src/config/`: constantes, opções de engine, dicionários e enums compartilhados. **Nunca** esconda literais mágicos no código; promova-os para este diretório. Subdivida por temática quando escalar (p. ex. `energy.ts`, `hud.ts`).
- `src/world/`: adaptadores NOA. Contém registro de materiais, blocos, hooks de geração de chunk, assets de mundo (atlas, shaders) e funções auxiliares. Regras:
  - Qualquer asset deve viver em `src/world/assets/`.
  - Geradores de chunk devem ser determinísticos, idempotentes e facilmente parametrizáveis via constantes em `src/config/`.
  - APIs externas não devem “vazar” para outros domínios (ex.: Babylon specifics ficam encapsulados aqui).
- `src/player/`: lida com mesh, física, inputs e estados do jogador. Padrão: `initializePlayer(noa)` que registra binds e configura componentes. Qualquer UI/câmera adicional vira módulo separado (ex.: `camera-effects.ts`).
- `src/hud/`: UI in-game baseada em DOM ou Babylon GUI. Seguir pattern modular: cada componente expõe `mount(container)` e `unmount()`. Documentar dependências (CSS, assets).
- `src/systems/`: simulações persistentes (energia, temperatura, scripts HAL). Cada sistema expõe `initializeSystem(noa, context)` e registra seus próprios ticks. Sem side-effects globais não declarados.
- `src/blocks/`: comportamentos específicos de blocos (handlers, meshes personalizados). Estrutura sugerida: uma pasta por tipo de bloco com `register.ts`.
- `src/ai/`: HAL-9001, drones, NPCs. Manter regras de IA puras; integrações com engine devem acontecer via adapters em `systems/` ou `scripts/`.
- `src/scripts/`: runtime de automação do jogador. Organize scripts por domínio (mineração, navegação, base building). Entrelaçar com HAL apenas via APIs tipadas.
- `src/persistence/`: serialização, storage local, sync com backends. APIs devem ser assíncronas e retornarem POJOs para facilitar testes.
- `src/utils/`: utilidades compartilhadas. Prefira funções puras, sem dependência de engine.
- `src/types/`: declarações globais (`*.d.ts`). Toda biblioteca sem tipagem deve ser registrada aqui.

Arquivos na raiz:
- `index.html` e `src/styles.css` são a casca mínima da aplicação. Alterações visuais devem ser justificadas no MANIFESTO ou registradas no HUD roadmap.
- `tsconfig.json` define o escopo de compilação (apenas `src/`). **Não** mover código para fora deste diretório.
- `vite.config.ts` contém aliased paths e ajustes de build. Qualquer nova ferramenta deve ser configurada aqui (ex: plugins de shader).

---

## 3. Convenções de Código

1. **Idioma:** TypeScript com módulos ES. Scripts auxiliares podem usar Node ES modules.
2. **Lint implícito:** Dois espaços, trailing commas, aspas simples em TS/JS, aspas duplas apenas em JSON. Use comentários JSDoc quando necessário (`/** */`).
3. **Nomenclatura:** diretórios em singular (`core`, `system` não), arquivos em kebab-case (`chunk-generator.ts`). Classes em PascalCase, funções/constantes em camelCase, constantes globais em `UPPER_SNAKE_CASE`.
4. **Exportação explícita:** exporte funções nomeadas em vez de `default`. Favoreça APIs pequenas e coesas.
5. **Side-effects controlados:** módulos não devem executar lógica ao importar; exponha funções e deixe `core` decidir quando rodar.
6. **Logs:** prefixar com `[starwatch]` ou `[system-name]`. Remova logs de debug temporários antes de finalizar a feature, exceto se o usuário solicitar.

---

## 4. Fluxo de Trabalho Recomendado

1. **Planejar:** leia MANIFESTO + tickets; atualize o plano com passos curtos (no máximo 5 etapas).
2. **Implementar:** Edite usando `apply_patch` ou ferramentas cuidadosas. Preserve comentários relevantes.
3. **Sincronizar com engine NOA:** se precisar modificar arquivos vendorizados (`src/engine/`), documente o motivo no README do diretório e mantenha compatibilidade com upstream.
4. **Testar:** execute sempre `pnpm exec tsc --noEmit`. Quando necessário, `pnpm dev` para validar visualmente. Documente qualquer teste adicional (ex.: screenshot, inspeção no console).
5. **Revisar:** cheque `git status -sb`. Nenhum arquivo alheio deve permanecer modificado.
6. **Comunicar:** informe claramente o que mudou, onde e por quê. Se algo permanecer pendente, sinalize junto com riscos.

---

## 5. Build, Ferramentas e Scripts

- `pnpm install`: instala dependências. Rodar em ambientes limpos ou após atualizar `package.json`.
- `pnpm dev`: inicia Vite em `http://localhost:5173`. Usar para validações rápidas e smoke tests visuais.
- `pnpm build`: executa `tsc` e `vite build`. Usar antes de releases ou sempre que mexer em bundling.
- `pnpm exec tsc --noEmit`: verificação rápida (obrigatória antes de qualquer PR/entrega).
- Futuras tasks (`pnpm test`, `pnpm lint`) serão documentadas aqui quando surgirem.

Ferramentas externas:
- **Babylon.js**: manipulação via `noa.rendering`. Qualquer shader custom deve ir em `src/world/shaders`.
- **NOA**: interaja somente através das APIs expostas pelo motor vendorizado. Quaisquer patches devem ser isolados e descritos em `src/engine/README.md`.
- **Vite**: para adicionar plugins (GLSL, WASM), atualize `vite.config.ts` e documente.

---

## 6. Diretrizes de Assets

1. Atlas de terreno, ícones HUD e texturas do jogador residem em subpastas `assets/` dentro de seus módulos.
2. Nomenclatura consistente (`terrain_atlas.png`, `crosshair.svg`). Manter metadata (dimensões, autor) no README do módulo.
3. Evitar assets gigantes sem compressão. Prefira PNG/WEBP. Documente se usar licenças externas.
4. Scripts de conversão (ex.: gerar normal maps) devem ir para `scripts/` com instruções no README.

---

## 7. Integração com NOA Engine

1. Registre materiais antes de blocos (`noa.registry.registerMaterial`). IDs devem iniciar em 1 e nunca se sobrepor manualmente sem razão clara.
2. Hooks de worldgen (`noa.world.on('worldDataNeeded')`) devem preencher a ndarray completamente e chamar `noa.world.setChunkData` uma única vez por chunk.
3. Use `noa.rendering.getScene()` para ajustes de iluminação/shadow apenas se necessário; encapsule em helpers (`world/shadows.ts`).
4. Inputs: `noa.inputs.bind('acao', ['KeyX'])` e `noa.inputs.down.on('acao', handler)`. Sempre mantenha um mecanismo de toggle/pause.
5. Player: acesse componentes via `noa.entities` e respeite offsets (meio da caixa).
6. Performance: `chunkAddDistance` e `maxRenderRate` devem ser tunados em `src/config/engine-options.ts`. Documente benchmarks quando alterar.

---

## 8. Qualidade, Logs e Observabilidade

- Logs permanentes devem ser humanamente legíveis e contextualizados (ex.: `[energy] tick=42 delta=-12W`).
- Se precisar de profiling, crie funções utilitárias em `src/utils/debug.ts` com toggles via `import.meta.env`.
- Coletar métricas (FPS, chunks) deve ser responsabilidade de `src/hud/` ou `src/systems/performance-monitor`.
- Nunca commit variantes temporárias de assets ou configs (`.DS_Store`, snapshots). O `.gitignore` principal já cobre o essencial; atualize se necessário.

---

## 9. Revisões e Colaboração

- Toda alteração deve vir acompanhada de um resumo objetivo: foco em comportamento e riscos.
- Se detectar incoerências em instruções passadas, questione imediatamente. Não siga ordens conflitantes sem clarificar.
- Para features grandes, proponha um plano (lista numerada) e espere aprovação antes de mergulhar 100%.
- Interface com designers ou funcionários? Documente os requisitos no topo do arquivo relevante em formato comentário `/** Req: ... */`.

---

## 10. Checklist de Saída para Cada Tarefa

1. Plano executado e atualizado no chat (se aplicável).
2. Código organizado por domínio (sem arquivos temporários).
3. `pnpm exec tsc --noEmit` sem erros.
4. Logs úteis mantidos, logs de debug removidos.
5. READMEs/comentários ajustados.
6. Resumo entregue com caminhos e passos de teste.

---

## 11. Futuro Próximo (Guia de Implementação)

- **HUD**: preparar mock de crosshair e painel de status seguindo padrão modular.
- **Sistemas**: energia + temperatura compartilham tick de 1 Hz; preparar esqueleto em `src/systems`.
- **Scripts**: planejar API de automação (provavelmente Web Worker). Definir contrato em README antes de codar.
- **Persistência**: decidir formato (provável JSON com compressão leve). Documentar handshake esperado com backend.
- **AI**: HAL-9001 terá bindings com LLMs; isolar tipos e mocks para desenvolvimento offline.

Documentaremos cada etapa aqui conforme evoluirmos. Até lá, siga este field manual ao pé da letra: consistência agora evita retrabalhos massivos quando o projeto escalar.

---

## 12. Apêndice — Obrigações do Agente

- **Responsabilidade pessoal:** se detectar bug crítico, comunique imediatamente mesmo que fora do escopo da tarefa.
- **Atualização contínua:** ao aprender novo contexto (decisão de design, parâmetro de balanceamento), adicione ao MANIFESTO ou a este manual.
- **Versionamento consciente:** mantenha histórico de mudanças sensível em READMEs ou CHANGELOGS locais para facilitar retomada futura.
- **Segurança e compliance:** nenhum dado sensível deve ser commitado. Se precisar de credenciais temporárias, use `.env` e atualize `.env.example`.
- **Foco em performance:** toda nova feature deve considerar impacto em FPS/tick. Colete métricas quando alterar chunk distance, densidade de entidades ou shaders.

Seguir estas diretrizes é pré-requisito para colaborar no ecossistema Starwatch. Em caso de dúvida, pergunte primeiro, implemente depois.
