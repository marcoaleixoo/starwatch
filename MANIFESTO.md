# STARWATCH — GAME DESIGN BIBLE (V1.0)

> **Fonte da Verdade**: Este documento consolida todas as decisões e anotações de design de StarWatch até o momento. Abrange visão, pilares, loop central, economia, escala, IA (HAL e NPCs), UX, primeiras horas de jogo, progressão, árvore de pesquisa, simulação física/sistêmica, catálogo de módulos, riscos, roadmap e notas de implementação.

---

## 0) Sumário

1. Visão & Fantasia do Jogador
2. Pilares de Design
3. DNA do Gameplay (Loop Central)
4. Métrica & Simulação (Tick/Unidades/Acoplamentos)
5. Energia (Coração do Jogo)
6. Temperatura, O₂, Pressão & Ambiente (Rooms)
7. Escala, Geometria & Velocidades
8. Universo & Setores (Galaxy View → Sector View)
9. Recursos & Economia (Mineração, Refino, Fabricação)
10. Naves, Drones & Frota
11. HAL‑9001 (LLM), Automação & UX de Scripts
12. Jornada do Jogador (1ª hora • 10 horas • 7 dias • 30 horas)
13. Pesquisa & Blueprints (HAL Research Forge)
14. IA de Setor: NPCs (L0 FSM, L1 HAL‑lite) & Combate Limitado
15. UI/UX (Com‑Link, Top/Bottom Bar, Terminais, Monaco)
16. Leaderboard (hoje) & MMO Futuro
17. Catálogo V1 (Módulos, Itens, Softwares)
18. Riscos & Mitigações
19. Roadmap Macro → Concreto (Fases 0–3)
20. Notas de Implementação & Segurança (Workers, LLM, Persistência)
21. Player Runtime Interface & Builder FPS (estado, persistência, controller)
22. Tabelas de Balanceamento Inicial
23. Especificações Técnicas (APIs internas & Pseudo‑código)
24. Glossário

---

## 1) Visão & Fantasia do Jogador

**Tese**: um simulador espacial contemplativo, persistente e lento, onde cada watt e cada parafuso importam. O jogador comanda uma nave viva, orquestra drones e módulos, conversa com o HAL (IA de bordo) e vê o universo progredir enquanto dorme — o mundo é durável e o tempo é absoluto.

**Promessa**: *“Eu não piloto naves; eu as dirijo.”*

**Público‑alvo**: fãs de EVE (sem gank), Factorio (automação), No Man’s Sky (exploração) e Screeps (scripts/IA), que valorizam construção e gerenciamento sobre combate.

**Vibe**: sci‑fi cozy, técnica, silenciosa, com toques de mistério e solidão do espaço profundo.

---

## 2) Pilares de Design

1. **Energia como moeda primária** — tudo consome energia (HAL, sensores, drones, lasers, HVAC).
2. **Tempo real & ritmo lento** — progresso 24/7; metas de semanas (ex.: segunda nave).
3. **Automação por linguagem + scripts** — o jogador comanda; HAL materializa scripts visíveis/editáveis.
4. **Engenharia acessível** — sem fiação/tubulação manual; módulos plug‑and‑play com lógica sistêmica (energia/CPU/calor/O₂/pressão).
5. **Universo durável & social** — setores persistentes; co‑presença e encontros; PvP apenas em zonas isoladas.
6. **Imersão física** — calor, luz, som, pressão e oxigênio “sentidos” no habitat; a nave é um organismo.

---

## 3) DNA do Gameplay (Loop Central)

**Ciclo**: Observar → Comandar HAL → Gerar/Autorizar Script → Executar → Automatizar → Otimizar → Expandir.

* **Observar**: HUD/terminais mostram energia, CPU, calor, O₂/pressão, drones, veios, setores.
* **Comandar HAL**: ordens naturais (ex.: “procure ferro”, “mova a nave”, “inicie mineração com drone”).
* **Gerar/Autorizar**: HAL cria/edita scripts no Monaco; jogador aprova/ajusta.
* **Executar**: scripts rodam em Web Workers, 1 Hz, com custos de CPU/energia e logs.
* **Automatizar**: scheduler (dia/noite), prioridades, rotas e protocolos.
* **Otimizar**: reorganizar módulos, ampliar baterias/geração, instalar radiadores, tunar scripts.
* **Expandir**: novos drones, refinaria, sensores, pesquisa, sidequests, encontros, novos setores.

**Sensação**: calma tensa de sobrevivência sistêmica; cada decisão mexe nos ponteiros (W, °C, %O₂, MJ).

---

## 4) Métrica & Simulação (Tick/Unidades/Acoplamentos)

* **Tick lógico**: 1 Hz (cálculos de energia, calor, O₂/pressão, IA base).
* **FPS visual**: livre (60–120).
* **Unidades**:

  * Energia em **MJ** (1 MJ = 277 Wh) — buffers/baterias.
  * Geração/consumo em **W** — orçamento por tick.
  * Temperatura em **°C**; variação **°C/s**.
  * **CPU %** — carga dos sistemas HAL/scripts.
  * Distância **m/km**; grid base **0,3 m**.
  * Massa **kg**; tempo **real 1:1** (o universo não pausa).

**Acoplamentos**: usar HAL/drones ↑CPU → ↑calor → ↓eficiência (p.ex., solar) → ↑demanda de radiadores/energia.

**Equações de referência**:

* **Energia** por tick: `E(t+1) = clamp(E(t) + (Geração − Consumo) * Δt, 0, Capacidade)`
* **Temperatura** (por room): `dT = (Σheat_output − Σcooling) / heat_capacity`

---

## 5) Energia (Coração do Jogo)

**Princípios**

* Tudo consome energia; déficit reduz eficiência e bloqueia ações; excesso gera calor.
* Baterias (buffers) suavizam picos; carregamento exige **dock/baía** e tempo (15–60 s, escalável).
* **Cloak mode**: ~80 W + 8–10% CPU; limite <200 m/s; ideal para “sono seguro” e pesquisa.

**Módulos (V1, valores de referência)**

| Módulo              |  Geração |       Consumo | Notas                                                              |
| ------------------- | -------: | ------------: | ------------------------------------------------------------------ |
| Painel solar básico |   +120 W |             — | ≈0,12 MJ/min; eficiência cai c/ temperatura e distância da estrela |
| Painel articulado   |   +180 W |         −50 W | Rastreamento ativo da estrela                                      |
| Reator de fissão    | +1.200 W | Combustível U | Calor alto; requer refino/barras                                   |
| Bateria pequena     |     5 MJ |             — | Descarga lenta                                                     |
| Bateria média       |    12 MJ |             — | Pesquisa necessária                                                |
| Carregador rápido   |        — |    300 W pico | Docks de drones                                                    |

**Eficiência solar**: decai ~0,3% por °C acima de 25 °C; **overheat > 80 °C** desliga módulos automaticamente.

---

## 6) Temperatura, O₂, Pressão & Ambiente (Rooms)

* **Rooms**: detectadas via *flood‑fill* (paredes/portas). Cada room tem `temp`, `%O₂`, `pressão`, `saúde`.
* **Vácuo**: −270 °C; radiação solar aquece módulos externos.
* **Radiadores**: passivo (−0,2 °C/s) e ativo (−0,5 °C/s a 50 W).
* **Airlocks/EVA**: ciclo 10 s; HAL bloqueia dupla abertura; *breach* causa perda acelerada de O₂/pressão.

**Faixas Operacionais**

| Parâmetro   | Ideal      | Alerta    | Crítico  |
| ----------- | ---------- | --------- | -------- |
| Temperatura | 22–28 °C   | <15 / >40 | <5 / >60 |
| O₂          | 96–100%    | <90%      | <70%     |
| Pressão     | 98–102 kPa | <90 kPa   | <70 kPa  |

**Sistemas de suporte** (consumo típico): O₂ generator (100 W), CO₂ scrubber (60 W), HVAC (50 W), sensor pack (10 W), iluminação (20 W; +0,02 °C/s).

---

## 7) Escala, Geometria & Velocidades

* **Grid**: bloco base 0,3 m; *chunks* 10×10×10 blocos para renderização.
* **Nave inicial**: ~30 m (≈100 blocos), 3–4 rooms.
* **Asteróides**: 1–3 km, agrupados em *clusters*.
* **Setor**: 30–60 min de travessia a ~800 m/s (≈ 2.880 km/h).
* **Estrela local**: escala 1:1000, papel estético e energético.

---

## 8) Universo & Setores

**Galaxy View**

* Grade procedural de milhares de setores, conectados por rotas de hiperespaço.
* Viagens em **tempo real** (15–60 min, por nave/tecnologia).
* **Fog of War**: revelar por exploração ativa ou scanners longos da nave‑mãe.
* Setores variam em risco, riqueza, anomalias, densidade de asteroides.

**Sector View (Babylon.js)**

* Grandes áreas jogáveis com estrela/planetas decorativos, clusters de asteroides (30–60; 1.000–2.000 corpos), detritos, nebulosas/campos de gelo.
* Setores “escuros” (sem estrela) exigem geração alternativa (reatores).
* Conteúdo emergente: ruínas/estações (3–5), sinais antigos, traders pedindo ajuda, tempestades de partículas.

**Co‑presença (futuro próximo)**: 40–100 jogadores por setor; 100–300 naves (incl. NPCs). PvP restrito a zonas isoladas.

---

## 9) Recursos & Economia

**Minérios (exemplos)**

* **Comuns**: Ferro, Cobre, Carbono (gelo/gás), Água (gelo), Silício.
* **Incomuns**: Alumínio, Níquel, Enxofre, Titânio.
* **Raros**: Urânio, Hélio‑3, Cristais de Quantum, Metais preciosos.

**Cadeia de Valor**

1. **Coleta** (drones/naves) →
2. **Refino** (minerais → lingotes/barras/vidro) →
3. **Componentes** (fios, chips, estruturas) →
4. **Módulos/Naves** (montagem) →
5. **Operação** (consumo/ciclo).

**Instalações**: Refinaria de Minerais; Fábrica de Componentes; Oficina de Montagem; Estação de Recarga; Estação de Mineração; Estação de Comércio (futuro).
**Blueprints**: receitas com recursos/tempo; HAL informa requisitos.

---

## 10) Naves, Drones & Frota

**Tipos de Naves (V0/V1)**

* **Nave‑mãe (USS Odyssey)**: QG móvel; carga inicial; laser básico; hiperdrive; gerador; construção limitada; expansível por módulos.
* **Miner (nave de mineração)**: pequena/rápida, alta carga, laser eficiente; energia limitada; sem hiperdrive.
* **Freighter (transporte)**: alta carga, hiperdrive, sem coleta/construção; logística entre setores.
* **Probe/Scout (exploradora)**: muito rápida, hiperdrive, sensores; sem carga/ferramentas.

**Módulos de Nave**: propulsão (impulso/manobra/hiper), ferramentas (laser/braço), armazenamento (carga/tanques), energia (geradores/baterias), sensores (curto/longo, scanners), defesa futura (escudos/contramedidas).

**Construção de Naves**: baía na nave‑mãe; seleção no menu; HAL lista requisitos/tempos; recursos chegam via scripts/logística; processo automatizado quando suprido.

**Drones (foco V1)**

| Tipo            | Bateria (MJ) | Mineração (kg/min) | CPU % | Papel               |
| --------------- | -----------: | -----------------: | ----: | ------------------- |
| Mk‑A básico     |            3 |                1,2 |     3 | mineração curta     |
| Mk‑B sensor     |            4 |                1,0 |     5 | lê pureza/varredura |
| Mk‑C *hauler*   |            5 |                  — |     6 | transporte          |
| Mk‑U utilitário |            3 |                  — |     4 | reparo/limpeza      |

* Dock: 1 drone por dock; recarga a 300 W; estados `empty/charging/active`.
* Scripts padrão: `mine`, `returnToDock`, `unload`, `onLowBattery`, `onOverheat`.
* Scheduler: turnos (dia/noite); “modo vela” em déficit.
* Upgrades: **dias reais**.

---

## 11) HAL‑9001, Automação & UX de Scripts

**Papel**: LLM do jogador; traduz intenção em ações e **código**.

**Ferramentas internas** (tool‑calls): `scanAsteroids`, `moveShip`, `generateScript`, `assignScript`, `optimizeRoutes`, `predictIrradiance`, `diagnoseEfficiency`, `manageHeat`, `scheduleJobs` etc.

**Monaco Editor**: scripts gerados/editados com metadados (autor, consumo estimado, notas, última execução).
**Terminal de Mineração**: tabela (nome, estado, último loop, CPU, energia); *view/pause/stop*; logs.
**Princípio**: 80–90% jogam sem editar; 10–20% otimizam manualmente.

**Tick de decisão de HAL**: a cada **60 s**, auto‑diagnóstico + avaliação do império; gera **sugestões priorizadas** para confirmação; executa **rotinas de baixo nível** sem consulta (ex.: reotimização de rotas para entidades sem script).

**Context Payload**: estado completo serializado (naves, módulos, inventários, energia, mapa, distâncias, scripts ativos/erros) entregue ao HAL.

---

## 12) Jornada do Jogador

### 12.1) Primeira Hora — “O Despertar e a Crise de Energia”

* Início na **USS Odyssey**, alerta de energia crítica; HAL acolhe e orienta.
* Missão: minerar **Ferro** (~50 un.) em cluster próximo e construir **Estação de Recarga Solar Alpha** (50 Fe, 25 Cu).
* Tutorial: mover nave, acionar mineração (`auto_mine_ferro.js` provisório), posicionar construção, **docking** para recarga (≈30 s).
* Lição: energia/GUI/HAL são o centro.

### 12.2) 1–5 horas — “Base & Exploração”

* Construir **Nave de Mineração**; pedir `mineracao_otimizada_ferro.js` (loop + recarga).
* Explorar Setor Alpha (Fog of War), revelar **Cobre**; usar Monaco para aprovar/rodar scripts.
* Introdução à frota + delegação.

### 12.3) 5–15 horas — “Logística Inter‑Setorial”

* Descobrir **Setor Beta** (rico em **Silício**); viagem ≈45 min (Galaxy View).
* Energia em Beta menos eficiente (estrela fraca) → **Reator de Fissão**.
* Cadeias: Refinarias, Fábricas de Componentes, transporte **Beta → Alpha** (`transportador_recursos.js`).

### 12.4) 15–30 horas — “Otimizar & Enfrentar o Universo”

* Gargalos de transporte; HAL sugere rotas/novas naves.
* Pesquisa (Tecnologia): eficiência de lasers, drones de reparo, reatores de fusão (futuro).
* Eventos ambientais: tempestades de partículas; decisão via HAL; **Leaderboard** como motivador.

### 12.5) 7 dias — “Rotina Estável”

* Dia 1: energia estável; 1 drone; agenda simples.
* Dia 2–3: radiador passivo; rack de baterias; turnos; 2º drone.
* Dia 4–5: refino lento; isolamento térmico; prospecção/pureza de veios; roteador de veios (software).
* Dia 6–7: utilitário; manutenção/desgaste; modo eco; **blueprint real** (bateria média ou radiador ativo).
* *Sono do jogador ≠ boost*: o relógio é universal; **cloak mode** para segurança.

---

## 13) Pesquisa & Blueprints — HAL Research Forge

**Pipeline**: objetivo → geração de candidatos → micro‑simulações → escolha → custo (MJ + materiais) → **tempo absoluto** (3h → 6h → 12h → 24h).
**Primeiros tiers**: variações incrementais (bateria média, radiador ativo, painel articulado).
**Encounters**: ruínas/estações concedem **fragmentos** raros que viram bônus únicos pós decodificação (energia + tempo).
**Determinismo suave**: *seed* setorial + id do jogador para consistência sem repetição óbvia.

---

## 14) IA de Setor: NPCs & Combate Limitado

**Níveis de mente**:

* **L0 FSM/BT (95%)**: miner/transport/scout/trader/maintenance/pirate com regras simples (energy<20%→dock; sob ataque→fugir; alvo claro→atacar).
* **L1 HAL‑lite (5%)**: LLM compartilhada c/ memória curta para traders/piratas “falantes”, blefes e micro‑histórias.

**Combate** (apenas bolsas isoladas/PvP opt‑in):

* Alcance curto (300–800 m), projéteis/lasers lentos, picos de calor/energia ao disparar.
* Classes: *passive*, *defensive*, *aggressive*; `hp<30%` → chance de fuga.

---

## 15) UI/UX

* **Com‑Link (20% esquerda)**: chat HAL, tool‑calls, custos e status; estética de terminal.
* **Visão estratégica (80% direita)**: canvas Babylon 3D do setor.
* **Top Bar**: recursos globais; painel da entidade selecionada; relógio universal; botão Galaxy View.
* **Bottom Bar**: Construções • Frota • Scripts (Monaco) • Tecnologia • Líderes • Config.
* **Seleção**: clique em naves/estações/aglom. → atualiza painel e habilita ações do HAL.
* **Câmera**: *drag* para mover; *scroll* para zoom (vibe *Homeworld/Cosmoteer*).
* **Terminais locais**: p.ex., mineração com tabela de scripts (estado/loop/CPU/MJ) e botões *view/pause/stop* → abre Monaco.

---

## 16) Leaderboard (hoje) & MMO Futuro

**Métricas**: setores revelados/dominados, valor total da frota, produção total de energia (MW/h), minério coletado por tipo, tecnologias desbloqueadas, scripts otimizados, tempo ativo.
**Futuro**: leaderboard global e persistente, sem necessidade de PvP direto.

---

## 17) Catálogo V1 — Itens Principais

**Estrutura (rooms)**: parede/bulkhead, janela, corredor, piso; detecção automática de rooms.
**Energia**: painel básico/articulado, bateria pequena/média, carregador lento/normal/rápido, radiador passivo/ativo, reator de fissão.
**Suporte**: gerador O₂, scrubber CO₂, HVAC, sensor pack, iluminação.
**Produção**: refinaria lenta, fundidora de vidro, impressora estrutural, montadora de drones, oficina.
**Logística**: drone dock, tanques/baús, baliza de veio, sensor de prospecção.
**Drones**: básico, sensor, *hauler*, utilitário.
**Software (HAL tools)**: scheduler noturno; roteador de veios; gestor de calor; planejador de jobs; research forge; preditor de irradiância; logger de telemetria; diagnóstico de eficiência.

---

## 18) Riscos & Mitigações

* **Curva de aprendizado** → HAL didático, *tool‑tips*, *presets* e scripts comentados.
* **Performance** → scripts em Workers; simulação por *rooms*; prevalência de IA L0; *chunks* gráficos.
* **Tédio no early** → sidequests leves, “anomalias HAL”, micro‑metas diárias.
* **Griefing social** → *cloak*, zonas seguras, PvP opt‑in; setores de risco isolados.

---

## 19) Roadmap Macro → Concreto

**Fase 0 — Fundação (2–3 sprints)**

* Builder FPS estável (grid, *colliders*, *gizmos*).
* Simulação 1 Hz (energia/CPU/calor) + rooms (O₂/pressão/temp).
* HAL chat + tool‑calls *stub*; Terminal de Mineração; Monaco *read‑only*.
* 1 painel solar, 1 bateria, 1 radiador, 1 drone básico, 1 dock, 1 refinaria lenta.

**Fase 1 — Automação & Noite (2–3 sprints)**

* Scheduler (dia/noite), **cloak mode**.
* Drone sensor + utilitário; desgaste/manutenção.
* Research Forge v1 (bateria média / radiador ativo); sidequests leves.

**Fase 2 — Setor Vivo (3–4 sprints)**

* Prospecção média; clusters com pureza; ruínas/estação.
* Bots L0 circulando; traders simples; UI de nave interna (painel geral).

**Fase 3 — Social & Zonas Isoladas (3–4 sprints)**

* Co‑presença (mesmo setor/coords), EVA conjunto, troca item‑a‑item.
* Zonas de risco com piratas (FSM) e fugas; raros L1 “falantes”.
* *Blueprint fragments* em encounters.

**Marco “V1 Jogável”**: loop completo de 7 dias com energia/rooms/drones/refino/pesquisa/sidequests/co‑presença; ritmo lento; **segunda nave** como sonho distante.

---

## 20) Notas de Implementação & Segurança

* **Scripts em Web Workers**: isolamento; comunicação via **Task API** (única interface).
* **HAL/LLM no cliente (V0.1)**: API key no `localStorage` (prototipagem). Para público/MMO: backend *proxy* (custos/segurança).
* **Context Payload do HAL**: JSON saneado/compacto; atualização a cada 60 s ou sob demanda.
* **Persistência MMO (futuro)**: backend para estado global, sincronização de setores e DB central.

---

## 21) Player Runtime Interface & Builder FPS

**PlayerStore** (`src/fps/state/playerStore.ts`): padrão imutável, ações de HUD/IA (`setTransform`, `patchMovementIntent`, `patchInput`, registrar/remover módulos, `emit`).
**Estado Serializado** (`playerState.ts`): `transform` (pos/quaternion/vel), `movementIntent`, `input` (locks), módulos. `serializeVector3/Quaternion` para persistência determinística.
**Persistência** (`playerPersistence.ts`): *debounce* em `localStorage` (`starwatch.player-state`), `flush()` em desligues.
**Controller** (`playerController.ts`): câmera FPS; pointer lock; WASD/sprint/crouch/jump; `teleport`, `setCutsceneLock`.
**Módulos baseline** (`playerModules.ts`): placeholders de saúde/energia/fome/inventário com `player.module.ready`.
**Integração**: `ShipBuilderCanvas` instancia/hidrata/cria controller e persistence; cede `playerController.camera` ao *placement solver*.

---

## 22) Tabelas de Balanceamento Inicial

### 22.1) Energia & Calor

| Ação/Sistema             |       W | ΔT (°C/s) | Observações                         |
| ------------------------ | ------: | --------: | ----------------------------------- |
| HAL (idling)             |   30–50 |     +0,01 | varia com contexto payload          |
| Script leve              |   20–80 |     +0,02 | *polling* 1 Hz, I/O baixo           |
| Script pesado            | 120–300 |     +0,05 | path‑finding/mineração multi‑target |
| Laser mineração (básico) |     250 |     +0,06 | eficiência por pureza               |
| Radiador passivo         |       — |     −0,20 | sem energia                         |
| Radiador ativo           |      50 |     −0,50 | controlado por HAL                  |

### 22.2) Drones (reiterado)

| Tipo | Bateria (MJ) | kg/min | CPU % | Notas             |
| ---- | -----------: | -----: | ----: | ----------------- |
| Mk‑A |            3 |    1,2 |     3 | mineração curta   |
| Mk‑B |            4 |    1,0 |     5 | sensor/prospecção |
| Mk‑C |            5 |      — |     6 | *hauler*          |
| Mk‑U |            3 |      — |     4 | reparo/limpeza    |

### 22.3) Construções Básicas

| Item                 | Custo        |    Tempo | Requisitos                        |
| -------------------- | ------------ | -------: | --------------------------------- |
| Estação Solar Básica | 50 Fe, 25 Cu |  2–4 min | star‑exposed, temperatura < 60 °C |
| Dock de Drone        | 30 Fe, 10 Si |  1–2 min | acesso interno + power bus        |
| Refinaria Lenta      | 80 Fe, 30 Si | 6–10 min | calor alto → radiador próximo     |

---

## 23) Especificações Técnicas (APIs Internas & Pseudo‑código)

### 23.1) Task API (Worker)

```ts
interface TaskAPI {
  scanAsteroids(area?: Bounds3D): Promise<AsteroidScanResult[]>;
  moveShip(target: Vector3): Promise<NavResult>;
  assignScript(entityId: Id, scriptId: Id): Promise<void>;
  readEnergy(entityId: Id): Promise<{ storedMJ: number; genW: number; useW: number }>;
  dock(entityId: Id, stationId: Id): Promise<DockResult>;
  mine(targetId: Id, rate?: number): Promise<MineResult>;
  transferCargo(from: Id, to: Id, manifest: CargoSpec): Promise<void>;
  log(msg: string, meta?: Record<string, unknown>): void;
}
```

### 23.2) Exemplo de Script — Mineração Otimizada

```ts
/** mineracao_otimizada_ferro.js */
const LOOP_S = 60; const LOW_BATT = 0.2;
async function loop() {
  const e = await Task.readEnergy($ship.id);
  if (e.storedMJ / $ship.capacityMJ < LOW_BATT) { await Task.dock($ship.id, $station.id); return; }
  const spots = (await Task.scanAsteroids($sector.bounds))
    .filter(s => s.ore === 'Fe')
    .sort((a,b) => b.purity - a.purity || a.dist - b.dist);
  if (!spots.length) { Task.log('Sem Fe, explorando…'); await Task.moveShip($ship.pos.add(randVec())); return; }
  await Task.moveShip(spots[0].pos);
  await Task.mine(spots[0].id, 1.0);
}
setInterval(loop, LOOP_S * 1000);
```

---

## 24) Glossário

* **HAL‑9001**: IA de bordo (LLM) do jogador.
* **Room**: compartimento hermético com variáveis ambientais.
* **Dock**: baía de recarga/acoplamento.
* **Cloak Mode**: modo de baixo perfil/consumo para períodos ociosos.
* **Galaxy/Sector View**: mapas macro/micro do universo.
* **L0/L1**: níveis de IA (FSM simples vs. LLM curta memória).

---

### Apêndice A — Notas de Produção & Repositório

* Organização de código: `src/fps/ShipBuilderCanvas.tsx` (scene); `App.tsx`/`main.tsx` (bootstrap); `src/legacy/` (UI/chat/HAL antigos — *mothballed*).
* *Build/run*: `pnpm i` → `pnpm dev` (Vite); `pnpm build` (TS + bundle); `pnpm preview` (smoke test).
* Padrões: TS estrito; sem `any`; *conventional commits*; PRs com GIFs; `.env.example` p/ HAL.
* Próximos passos: inventário de peças, persistência e undo/redo; reintegrar HAL/automação sobre o novo estado; unificar FPS core com camadas narrativas/chat quando o *builder* estiver sólido.

---

> **Mantra de Design**: *Cada watt conta. Cada módulo respira. O universo não dorme.*
