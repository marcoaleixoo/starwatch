# World Registry

Este diretório concentra o setup do NOA para o slice atual.

- `materials.ts` define todos os materiais registrados no engine e associa `solarOpacity` used
  pelo sistema de energia. Sempre adicione novos materiais aqui antes de referenciá-los em blocos.
- `blocks.ts` cadastra os blocos “terrain” básicos (asteroides, dirt) e retorna `nextBlockId` para
  que `blocks/register.ts` possa atribuir IDs contínuos aos blocos de gameplay.
- `index.ts` é o ponto de entrada: registra materiais, blocos, instala o worldgen e devolve o
  catálogo (`WorldResources`) usado pelo restante da aplicação.

## Como testar

1. Rode `pnpm dev`.
2. Verifique via console (`window.starwatch.world`) que os catálogos possuem os IDs esperados.
3. Ao adicionar novo material/bloco, execute `pnpm exec tsc --noEmit` para garantir tipos alinhados.

**Single source of truth:** qualquer mudança em textura/constante deve ser refletida aqui e nos
Readmes dos módulos que dependem dela.
