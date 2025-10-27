# STARWATCH — GAME DESIGN BIBLE (V1.0)

> **Status:** Base consolidada a partir do MANIFESTO.md e Field Manual. Documento vivo. Fonte da verdade para visão, mecânicas, UX, simulação, conteúdo e roadmap.
> **Público:** game design, engenharia, arte/áudio, narrativa, produção.

---

## 0. Sumário

1. Visão & Fantasia do Jogador
2. Pilares de Design
3. Tese do Produto
4. Core Gameplay & Loop Central
5. Métrica & Simulação (tick rate, unidades)
6. Energia (moeda primária)
7. Temperatura, O₂, Pressão & Ambiente
8. Escala, Geometria e World Layout
9. Mundo: Galaxy View, Setores & FOW
10. Geração Procedural & Conteúdo de Setores
11. Economia, Recursos & Crafting
12. Catálogo de Módulos (v1)
13. Naves, Frota & Módulos de Nave
14. Drones (foco v1)
15. HAL-9001 & Automação por Scripts
16. UX de Scripts & Terminais
17. Construção (Building) — Grid 30 cm, Rooms & EVA
18. UI/UX in‑game — HUD, Toolbar “à la Minecraft”, Terminais Físicos
19. Jornada do Jogador (1h • 10h • 30h • 7 dias)
20. Progressão & Ritmo
21. Pesquisa & Árvore (HAL Research Forge)
22. Bots, NPCs e Vida do Setor
23. Combate (Zonas Isoladas)
24. Leaderboard & MMO Futuro
25. Persistência, Segurança & Protótipo (Field Manual)
26. Riscos & Mitigações
27. Roadmap por Fases
28. Tabelas de Referência (parâmetros-chave)
29. Glossário

---

## 1. Visão & Fantasia do Jogador

**Fantasia:** “Eu não piloto naves; eu as dirijo.” Você comanda um organismo mecânico vivo no espaço — uma nave que respira energia, calor e ar. O universo é lento, persistente e contemplativo. Cada watt conta; cada parafuso importa.
**Público:** fãs de construção/automação (Factorio/Satisfactory), exploração contemplativa (No Man’s Sky), logística/estratégia (EVE sem gank), e script/IA (Screeps) — foco em engenharia sistêmica, não em micro‑combate.
**Promessa:** progresso 24/7 em tempo real; automação por linguagem natural + scripts; engenharia acessível sem fiação manual.

---

## 2. Pilares de Design

1. **Energia é moeda primária.** Tudo consome energia (HAL, sensores, drones, mineração, HVAC).
2. **Tempo real & ritmo lento.** Progresso durável; objetivos de semanas (ex.: segunda nave).
3. **Automação por linguagem + scripts.** Jogador fala, HAL materializa em código, sempre visível/editável.
4. **Engenharia acessível.** Sem fios/tubos; módulos plug‑and‑play; lógica sistêmica (energia, CPU, calor, O₂).
5. **Universo durável & social.** Setores persistentes; encontros cooperativos; PvP apenas em zonas isoladas.
6. **Imersão física.** Calor, luz, som, pressão/O₂ “sentidos” no habitat — a nave como organismo.

---

## 3. Tese do Produto

**Simulador espacial sistêmico e contemplativo**, single‑player (v1) com ambição MMO. Loop de engenharia/logística incorporado a um **assistente IA (HAL‑9001)** que transforma intenção em automação revisável. **Sem correria:** o jogo vive enquanto o jogador dorme.

---

## 4. Core Gameplay & Loop Central

**Ciclo DNA:** observar → comandar HAL → gerar/autorizar script → executar → automatizar → otimizar → expandir.

* **Observar:** HUD/terminais exibem energia, CPU, calor, O₂, veios minerais, status de naves/drones.
* **Comandar HAL:** linguagem natural (“procure ferro”; “mova a nave”; “inicie mineração”).
* **Gerar/Autorizar:** HAL propõe script no Monaco; jogador aprova/edita.
* **Executar:** scripts em Web Workers (tick 1 Hz), com custos reais (W/CPU/tempo).
* **Automatizar:** scheduler (dia/noite), prioridades, cloak mode.
* **Otimizar:** re‑arranjar módulos, ampliar energia, radiadores, melhorar scripts.
* **Expandir:** mais drones, refinaria, sensores, sidequests, pesquisa, co‑presença setorial.

**Sensação:** calma tensa de sobrevivência sistêmica. Cada ação mexe os ponteiros (W, °C, %O₂, MJ).

---

## 5. Métrica & Simulação

**Tick lógico:** 1 Hz (estado/IA/energia/ambiente).
**FPS visual:** livre (60–120).
**Unidades padrão:**

* Energia: **MJ** (1 MJ = 277 Wh); geração/consumo em **W**; baterias em **MJ**.
* Temperatura: **°C** (interior alvo 22–28 °C; vácuo −270 °C).
* Calor: variação **°C/s**.
* CPU: **%** (carga do núcleo HAL e scripts).
* Distância: **m/km** (grid 1 m).
* Massa: **kg** (minérios, naves).
* Tempo: **real (1:1)**, sem pausa.

---

## 6. Energia (Moeda Primária)

* **Tudo consome.** HAL, sensores, luzes, drones, HVAC, mineração, pesquisa.
* **Déficit** reduz eficiência, prioriza cargas vitais; **excesso** gera **calor**.
* **Baterias** armazenam MJ; **painéis** e **reatores** geram.
* **Eficiência solar** decai ≈ **0,3 %/°C** acima de 25 °C.
* **Overheat** > **80 °C** → desligamento automático de módulos.
* **Cloak mode:** ≈ **80 W** + **8–10 % CPU**, velocidade < 10 m/s (sono seguro/ocultação).

**Módulos de energia (v1):**

* **Painel Solar Básico:** +120 W (≈ 0,12 MJ/min).
* **Painel Articulado:** +180 W; −50 W (atuador).
* **Reator de Fissão:** +1 200 W; consome barras de U; alto calor.
* **Bateria Pequena/Média:** 5 MJ / 12 MJ.
* **Carregador Rápido:** pico 300 W (dock de drone).

**Recarga:** baías dedicadas (15–60 s; escalável por tech). HAL agenda retornos automáticos.

---

## 7. Temperatura, O₂, Pressão & Ambiente

**Cálculo (1 Hz):**
`dT = (Σ heat_output − Σ cooling) / heat_capacity`

* Perda térmica lenta por paredes; vazamentos rápidos por danos.
* Vácuo externo −270 °C; radiação solar aquece módulos externos.
* Radiadores: passivo (−0,2 °C/s), ativo (−0,5 °C/s; 50 W).

**Faixas alvo (room):**

* Temperatura: **22–28 °C** (alerta < 15/> 40; crítico < 5/> 60).
* O₂: **96–100 %** (alerta < 90 %; crítico < 70 %).
* Pressão: **98–102 kPa** (alerta < 90; crítico < 70).

**Suporte à vida (consumo):** O₂ gen 100 W; scrubber CO₂ 60 W; HVAC 50 W; sensor 10 W; iluminação 20 W (+0,02 °C/s).

---

## 8. Escala, Geometria e World Layout

* **Bloco base:** **1 m** (1m) — unidade de construção.
* **Nave inicial:** ~**30 m** (≈ 100 blocos); 3–4 rooms.
* **Asteroide:** **1–3 km**, agrupado em clusters.
* **Setor:** **30–60 min** de travessia a ~800 m/s (≈ 2 880 km/h).
* **Estrela central:** posição física fixa a ~2 000 km do hub (`[0, 2 000 km, 200 km]`), raio 20 km; renderizada via proxy a 800 m (0,53° de abertura) que acompanha a câmera. A <100 km carregamos o mesh físico e expandimos `camera.maxZ` para permitir aproximações reais sem perder precisão.
* **Firmamento:** base procedural (shader) + camada de estrelas instanciadas a 12 km com cintilância/parallax leve; parâmetros em `src/config/sky-options.ts`.

---

## 9. Mundo: Galaxy View, Setores & FOW

* **Galaxy View:** grade procedural de milhares de setores conectados por rotas de hiperespaço. Viagens **em tempo real** (15–60 min; nave/tech dependente).
* **Spawn padrão:** frota surge em órbita segura (~2 000 km da estrela local), com anéis minerais mapeados pelo HAL.
* **Fog of War:** revelar por exploração ativa (naves) ou sensores de longo alcance.
* **Variedade:** níveis de perigo, riqueza mineral, anomalias, densidade de asteroides.

---

## 10. Geração Procedural & Conteúdo do Setor

### Escala e Zonas

* **Raio útil:** ~2 000 km em torno da estrela; jogador spawna a ≈2 000 km (2 000 000 blocos) do núcleo solar, alinhado com a plataforma inicial no (0,0,0).
* **Zona letal:** raio ≤50 km; aproximação <100 km ativa o mesh físico do astro e ajusta `camera.maxZ`; prolongar voo abaixo de 50 km superaquece a nave (failstate futuro).
* **Faixas de conteúdo:**
  * **Anel interno (100–400 km):** maior densidade de asteroides comuns (ferro, cobre, silício) + infraestrutura inicial.
  * **Anel médio (400–1 200 km):** mistura equilibrada; POIs principais, ruínas, tráfego comercial.
  * **Anel externo (1 200–2 000 km):** clusters raros/grandes, exóticos, eventos temporais.
* **Campo vazio:** >2 000 km reservado para expansão; radar detecta assinaturas antes de renderizar.

### Asteroides e Fenômenos

* **Estrela Central:** cor/tipo/intensidade variam; posição física fixa (`[0, 2 000 km, 200 km]`), raio 20 km. Proxy visual a 800 m mantém o disco pequeno; sistemas (energia, HUD, física) usam a posição real.
* **Planetas (decorativos v1):** gasosos/rochosos/gelados — marcos visuais.
* **Aglomerados Procedurais:** geração determinística por chunk; 30–60 clusters ativos próximos, rehidratados conforme o jogador avança entre anéis.
* **Fenômenos:** nebulosas (interferência/radar), campos de gelo, cinturões de detritos.
* **Pontos de interesse:** ruínas/estações (3–5); traders; sinais antigos; colisões iminentes.

### Sensores & Visibilidade

* **FOV renderizado:** ~20 km (66 667 blocos). Conteúdo fora disso entra como LOD simplificado ou assinatura de radar.
* **Radar:** detecta clusters/anomalias fora do FOV; upgrades ampliam alcance e precisão.
* **LOD:** voxels completos ≤5 km; instâncias simplificadas 5–20 km; apenas telemetria >20 km.

**População recomendada (setor):** 40–100 jogadores (co‑presença futura); 100–300 naves totais com NPCs.

---

## 11. Economia, Recursos & Crafting

**Tipos de minérios:**

* **Comuns:** Ferro, Cobre, Carbono (gás/ice), Água (ice), Silício.
* **Incomuns:** Alumínio, Níquel, Enxofre, Titânio.
* **Raros:** Urânio, Hélio‑3, Cristais Quantum, Metais Preciosos.

**Cadeia:** Minério → **Refinarias** (lingotes/barras) → **Fábricas de Componentes** (fios/chips) → **Oficinas** (módulos complexos).
**Blueprints:** receitas detalhando insumos/tempo; HAL consulta/planeja.

---

## 12. Catálogo de Módulos (v1)

**Energia:** painéis (básico/articulado), baterias (P/M), reator fissão/fusão (later), carregadores.
**Produção:** refinaria de minerais, fábrica de componentes, oficina de montagem.
**Armazenamento:** baús/carga, tanques (gás/líquido).
**Suporte:** radar longo alcance, centro de comando, unidade de reparo.
**Estações:** recarga solar, mineração automatizada, comércio (futuro).
**Ambiente interno:** O₂ gen, scrubber, HVAC, sensores, iluminação, radiador passivo/ativo, portas bulkhead, terminais.

---

## 13. Naves, Frota & Módulos de Nave

**Tipos (v0/v1):**

* **Nave‑Mãe (USS Odyssey):** HQ móvel; carga básica; laser de mineração; hiper‑drive; gerador; constrói módulos; expansível.
* **Miner (Mineração):** pequena/rápida; boa carga; laser eficiente; sem hiper‑drive.
* **Freighter (Transporte):** grande carga; hiper‑drive; sem coleta/construção.
* **Probe/Scout:** muito rápida; hiper‑drive; sensores; sem carga.

**Módulos de nave:** propulsão (impulso/manobra/hiper), ferramentas (laser/braços), armazenamento (carga/tanques), energia (geradores/baterias), sensores (radar/scanner), defesa futura (escudos/contramedidas).
**Construção de naves:** baía na nave‑mãe; seleção no menu; HAL informa custos/tempo; logística automatizada transfere recursos; processo é autônomo após suprimento.

---

## 14. Drones (Foco v1)

**Tipos & parâmetros:**

* **Mk‑A (básico):** 3 MJ; 1,2 kg/min; CPU 3 % (mineração curta).
* **Mk‑B (sensor):** 4 MJ; 1,0 kg/min; CPU 5 % (lê pureza).
* **Mk‑C (hauler):** 5 MJ; —; CPU 6 % (transporte).
* **Mk‑U (utilitário):** 3 MJ; —; CPU 4 % (reparo/limpeza).
  **Dock:** 1 drone por dock; recarga 300 W; estados (empty/charging/active).
  **Scripts built‑in:** `mine`, `returnToDock`, `unload`, `onLowBattery`, `onOverheat`.
  **Scheduler:** turnos dia/noite; **modo vela** (eco) em déficit energético.
  **Progressão lenta:** upgrades em **dias reais**.

---

## 15. HAL‑9001 & Automação por Scripts

**Papel:** co‑piloto consciente. Traduz intenção em planos/sistemas.
**Acesso:** ciência de tudo (estado completo do jogo): posições, módulos, inventários, energia em rede, blueprints, mapa/FOW, distâncias, scripts ativos/estados.
**Ciclo de scripts:**

* Geração sob demanda (prompt do jogador).
* Modificação/otimização (por pureza, rotas, recarga automática).
* Atribuição a entidades (naves/drones/estações).
* Monitoramento/telemetria (loops, erros, energia baixa, tarefa concluída).
  **Tick de decisão (60 s):** auto‑diagnóstico, oportunidade/gargalos, sugestões com confirmação para decisões estratégicas; executa rotinas de manutenção de baixo nível sem perguntar.
  **Custo:** executar HAL/scripts consome CPU/energia e gera calor.

---

## 16. UX de Scripts & Terminais

* **Terminais físicos** distribuídos pelos cômodos (o jogador pode mover): interagem com subsistemas (mineração, energia, pesquisa).
* **Monaco Editor** embutido (read‑only por padrão; modo avançado para edição).
* **Terminal de Mineração:** tabela com nome, estado, último loop, CPU, energia; ações (view/pause/stop).
* **Com‑link HAL (chat):** pedidos, confirmações, tool‑calls, custos (W/CPU/MJ/h).
* **“Ask HAL”** no editor: HAL explica trechos/complexidade.
* **Princípio:** 80–90 % não editam; 10–20 % otimizam profundamente.

---

## 17. Construção (Building) — Grid 30 cm, Rooms & EVA

**Abordagem:** próxima de **Space Engineers**, mas **sem fiação/tubulação manual**. Grid de **0,3 m** com **snap** e **gizmos**.
**Tipos:**

* **Estruturais:** paredes, pisos, janelas, portas/bulkheads (definem rooms via flood‑fill).
* **Funcionais:** thrusters, painéis, radiadores, docks, refinarias.
* **Suporte:** O₂, scrubber, HVAC, sensores.
* **Controle:** HAL core, terminais, consoles.
* **Armazenamento:** tanques, baús, carga.

**Rooms:** cada room é objeto com volume/variáveis (temp, O₂, pressão, saúde). Sensores locais alimentam terminais/HUD.
**EVA & Airlocks:** ciclo ~10 s (pressurizar/depressurizar); HAL bloqueia dupla abertura; breach causa perda O₂ 1–2 %/s por room.

---

## 18. UI/UX In‑game — HUD + Toolbar “Minecraft‑like” + Terminais

* **HUD básico:** energia total/consumo, calor médio, %O₂/pressão, relógio estelar, indicadores de scripts ativos, alerta de gargalos. Dados contextuais surgem via badges “look-at” (≤3 m) ao mirar módulos críticos (painel/bateria/terminal).
* **Toolbar inferior (Minecraft‑like):** slots com **objetos/peças** prontos para colocar no mundo (módulos/estruturas); rolagem rápida; tooltips com W/CPU/heat. Implementação vive num overlay React acima do canvas, mantendo pointer-lock e inputs sincronizados com o NOA.
* **Inventário & Radial:** seleção rápida de módulos; preview “ghost” no builder.
* **Top bar:** recursos globais (Ferro/Silício/Urânio, MJ em rede), naves/drones/estações ativas.
* **Terminais físicos:** UI dedicadas por subsistema (energia, mineração, pesquisa, manutenção) — localização diegética (o jogador caminha até eles). HAL Terminal exibe métricas agregadas por rede (ΔW, MJ armazenado/capacidade, contagem de módulos) numa CRT azul; abre com `E`, fecha com `Esc`.
* **Câmera/Controle:** FPS no builder, pointer lock, sprint/crouch/jump; navegação Homeworld‑like na visão estratégica do setor (futuro).

---

## 19. Jornada do Jogador

### 0–1 h — Despertar & Crise de Energia

Recepção de HAL; mover a Odyssey até veio de Ferro; script `auto_mine_ferro` temporário; construir **Estação Solar Alpha**; recarregar na baía; aprender movimento/mineração/construção/energia/HAL.

### 1–5 h — Base & Exploração

Construir **Miner básica**; pedir a HAL `mineracao_otimizada_ferro`; explorar FOW; descobrir Cobre; atribuir script à Miner01; primeiro uso sistemático do Monaco; entender cadeia de recursos inicial.

### 5–15 h — Logística Inter‑setorial & Cadeias

Descobrir **Setor Beta** (Silício); viagem ~45 min; montar refinaria de Silício + fábrica de componentes; **Freighter** + scripts de transporte; solar menos eficiente → considerar reatores; início de logística entre setores.

### 15–30 h — Expansão & Desafios

Operar 2–3 setores; gargalos de transporte; HAL sugere otimizações/duplicação de rotas; pesquisa inicial (eficiência de lasers, drones de reparo, escudos de energia); **anomalias** (tempestade de partículas) exigem resposta coordenada; leaderboard local.

### 7 dias — Loop Diário

Dia 1: estabilizar energia, 1 drone minerando, agenda noturna;
Dia 2: radiador passivo, rack de baterias;
Dia 3: 2º drone e turnos;
Dia 4: refinaria lenta; isolamento térmico;
Dia 5: prospecção/pureza; roteador de veios (software);
Dia 6: utilitário; desgaste/manutenção; modo eco em painéis;
Dia 7: blueprint “real” via Research Forge; rotina serrote (mineração↔pesquisa).

**Marco simbólico:** **segunda nave** como sonho de semanas.

---

## 20. Progressão & Ritmo

* **Sobrevivência (0–24 h):** energia e O₂ estáveis.
* **Automação básica (1–3 dias):** 2 drones, refino, radiador.
* **Autonomia energética (3–5 dias):** rack de baterias, turnos, roteador.
* **Pesquisa inicial (5–7 dias):** 1 blueprint nova.
* **Expansão setorial (1–2 semanas):** sensores, 3º drone, pequenos trades.
* **Segunda nave (1 mês+):** realização de longo prazo.
  **Ritmo:** meditativo, físico, previsível; nada explode de um dia para outro.

---

## 21. Pesquisa & Árvore (HAL Research Forge)

**Pipeline:** objetivo do jogador → HAL gera candidatos → micro‑simulações → 1 proposta → custo (MJ + materiais + tempo real).
**Durations:** 3 h → 6 h → 12 h → 24 h por tier; **custos:** 5–30 MJ + materiais.
**Exemplos de primeiros tiers:** bateria média; radiador ativo; painel articulado; eficiência laser n2; autonomia de drone n1/n2.
**Encounters (futuro):** ruínas fornecem fragmentos raros (bônus únicos).
**Determinismo suave:** seed setorial + id jogador.

---

## 22. Bots, NPCs e Vida do Setor

**Níveis de mente:**

* **L0 FSM/BT (95 %):** miner/transport/scout/trader/maintenance/pirate; regras simples (energia<20 %→dock; atacado→fugir; alvo vulnerável→atacar).
* **L1 HAL‑lite (5 %):** LLM compartilhada c/ memória curta para diálogos/trocas/blefes.
  **Tráfego:** traders em zonas seguras; piratas em setores anômalos.

---

## 23. Combate (Zonas Isoladas)

* **Escopo v1:** PvE leve em bolsões; PvP opt‑in.
* **Modelagem:** alcance curto (300–800 m), projéteis/lasers lentos, picos de calor/energia ao disparar.
* **Comportamento:** `hp<30 % → fuga`; priorização por proximidade ou “último agressor”.
* **Classes:** passive, defensive, aggressive.

---

## 24. Leaderboard & MMO Futuro

**Métricas:** setores revelados/dominados; valor da frota; produção de energia; minério coletado por tipo; techs desbloqueadas; scripts otimizados; horas ativas.
**Visão:** leaderboard global e persistente em MMO; competição sem PvP obrigatório.

---

## 25. Persistência, Segurança & Protótipo (Field Manual)

* **Web Workers** para scripts (isolamento).
* **HAL/LLM no cliente (v0.1):** API key local (dev); futuro: backend proxy, controle de custos, segurança.
* **Contexto do HAL:** payload (JSON/texto) com estado completo; atualização ~60 s.
* **Arquitetura do protótipo:** FPS builder em Babylon; `ShipBuilderCanvas` (movimento FPS, grid snapping, colocar/remover paredes, ghosts).
* **Stack/Build:** pnpm + Vite; TS estrito; testes futuros (Vitest); guidelines de PR/Conventional Commits.
* **Próximos alvos do MVP:** inventário/toolbar, persistência, undo/redo; reintroduzir HAL/automação sobre novo world state.

---

## 26. Riscos & Mitigações

* **Curva de aprendizado:** HAL didático, tooltips, presets, comentários “humanos” nos scripts.
* **Performance:** workers para scripts; simulação por **rooms** (não por célula); IA L0 prevalente.
* **Tédio no early:** sidequests leves, “anomalias HAL”, micro‑metas diárias (ex.: elevar O₂ médio a 98 %).
* **Griefing:** cloak, zonas seguras, PvP opt‑in; setores com autoridade local.

---

## 27. Roadmap por Fases

**Fase 0 — Fundação (2–3 sprints)**

* Builder FPS estável (grid/coliders/snap/gizmos).
* Simulação 1 Hz (energia/CPU/calor) + rooms (O₂/pressão/temperatura).
* HAL chat + tool‑calls stub; terminal de mineração; Monaco read‑only.
* Conteúdo mínimo: 1 painel, 1 bateria, 1 radiador, 1 drone básico, 1 dock, 1 refinaria lenta.

**Fase 1 — Automação & Noite (2–3 sprints)**

* Scheduler, prioridades dia/noite, cloak mode.
* Drone sensor + utilitário; desgaste/manutenção.
* Research Forge v1; sidequests leves.

**Fase 2 — Setor Vivo (3–4 sprints)**

* Prospecção média; pureza de veios; ruínas/estações.
* Bots L0 (miner/transport/trader); trocas simples.
* UI geral de nave (energia/CPU/rooms/drones/anomalias).

**Fase 3 — Social & Zonas Isoladas (3–4 sprints)**

* Co‑presença (mesmo setor/coords), EVA conjunta, troca item‑a‑item.
* Zonas de risco com piratas (FSM) e fugas; L1 “falantes” raros.
* Blueprint fragments em encounters.

**Marco “v1 jogável” (7 dias de loop completo):** energia/rooms/drones/refino/pesquisa/sidequests/co‑presença; progressão lenta; segunda nave como meta distante.

---

## 28. Tabelas de Referência

### 28.1 Energia (módulos)

| Módulo                |  Geração |     Consumo | Notas            |
| --------------------- | -------: | ----------: | ---------------- |
| Painel Solar (básico) |   +120 W |           — | 0,12 MJ/min      |
| Painel Articulado     |   +180 W |       −50 W | rastreia estrela |
| Reator de Fissão      | +1 200 W | combustível | calor elevado    |
| Bateria Pequena       |        — |           — | 5 MJ             |
| Bateria Média         |        — |           — | 12 MJ            |
| Carregador Rápido     |        — |       300 W | dock de drone    |

### 28.2 Ambiente (limiares)

| Parâmetro   | Ideal      | Alerta     | Crítico   |
| ----------- | ---------- | ---------- | --------- |
| Temperatura | 22–28 °C   | < 15 /> 40 | < 5 /> 60 |
| O₂          | 96–100 %   | < 90 %     | < 70 %    |
| Pressão     | 98–102 kPa | < 90       | < 70      |

### 28.3 Drones

| Tipo              | Bateria (MJ) | Mineração (kg/min) | CPU % | Papel             |
| ----------------- | -----------: | -----------------: | ----: | ----------------- |
| Mk‑A              |            3 |                1,2 |     3 | mineração básica  |
| Mk‑B              |            4 |                1,0 |     5 | leitura de pureza |
| Mk‑C (hauler)     |            5 |                  — |     6 | transporte        |
| Mk‑U (utilitário) |            3 |                  — |     4 | reparo/limpeza    |

---

## 29. Glossário

**Cloak Mode:** modo de baixo consumo/baixa velocidade (limite 10 m/s) para sono seguro e atividades discretas.
**FOW (Fog of War):** névoa de guerra; setores não explorados ocos/ocultos.
**HAL‑9001:** IA de bordo, LLM do jogador; converte intenção em scripts; monitora execução.
**Rooms:** compartimentos fechados detectados por geometria; possuem variáveis de ambiente.
**Research Forge:** pipeline de pesquisa assistido por HAL (candidatos → simulação → blueprint).
**Scheduler:** agenda e prioridade de jobs (dia/noite) sob restrição de energia/CPU.

---

### Apêndice A — Diretrizes Técnicas do Protótipo

* **Estrutura de código:** `ShipBuilderCanvas` (Babylon) para builder FPS; `src/legacy/` preserva UI antiga (chat/editor) para referência.
* **Build:** `pnpm dev/build/preview`; TS estrito; futuros testes com Vitest.
* **Colaboração:** Conventional Commits; PRs com GIFs/steps; evitar tocar no legacy sem motivo.
* **Segurança/Config:** `.env` ignorado; `.env.example` para placeholders de HAL/LLM; validar `import.meta.env` em dev/preview.

### Apêndice B — Princípios de Balanceamento Inicial

* **Energia como gargalo** (sempre): progresso desbloqueia eficiência, nunca “energia infinita”.
* **Calor como freio**: tornar radiadores e layout térmico significativos.
* **Scripts com custo real**: evitar “magia” do HAL; CPU/energia devem pesar.
* **Ritmo absoluto**: tempos longos (viagens/pesquisas) dão sentido a planejamento/logística.

---

> **Notas finais:** Este GDB compõe tudo que já definimos (fantasia, loop, simulação, UX de terminais, toolbar estilo Minecraft, builder grid 30 cm, drones, pesquisa, IA, setores, economia) e serve de base para execução de artefatos: PRDs por feature, tasks de engenharia, e protótipos de UX. Atualizar continuamente conforme sprints avançarem.
