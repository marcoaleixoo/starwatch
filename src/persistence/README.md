# Persistence

Camada responsável por salvar/carregar o estado do setor. Mantemos uma interface simples
(`PersistenceAdapter`) para permitir trocar o backend sem tocar na lógica do jogo.

## Componentes

- `types.ts`: contratos do snapshot (`SectorSnapshot`, `ConstructionSnapshot`, etc.).
- `adapter.ts`: interface padrão para bibliotecas de storage.
- `local-storage-adapter.ts`: implementação local (browser) usando `localStorage`.
- `snapshot.ts`: captura e reidrata o estado (blocos colocados, dispositivos de energia, hotbar).
- `manager.ts`: orquestra autosave, beforeunload e geração de `playerId`.

## Fluxo Atual

1. **Bootstrap** cria `PersistenceManager` com o `LocalStorageAdapter`.
2. `load()` reidrata o setor (recoloca decks/painéis/baterias/terminais, restaura hotbar e MJ armazenado).
3. Autosave a cada 30 s + `beforeunload` garantem que o snapshot fique fresco.

## Próximos Passos

- Implementar `HttpAdapter` apontando para o backend real.
- Migrar de `localStorage` para storage assíncrono quando rodarmos em Electron/native.
- Validar snapshots com o schema em `data/schemas/sector-snapshot.schema.json` (AJV/Vitest).
