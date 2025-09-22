# ⭐ StarWatch: The Silent Sector ⭐

## O Manifesto do Comando Automatizado (V0)

### Um Chamado à Inteligência Artificial na Estratégia Espacial

StarWatch: The Silent Sector é uma experiência de automação e estratégia espacial que coloca você no assento do Comandante. Diferente de jogos de estratégia tradicionais, seu controle não se dá por cliques frenéticos, mas por duas ferramentas primordiais: o diálogo com sua IA de bordo e a programação de scripts em JavaScript.

Você observa o universo em visão estratégica top‑down, comandando sua nave‑mãe e suas unidades. Sua tripulação é uma única e poderosa Inteligência Artificial, HAL‑9001, seu co‑piloto, conselheiro e a interface para todos os sistemas da nave. O sucesso em StarWatch não depende de reflexos, mas da elegância de seus algoritmos, da clareza de suas ordens e da simbiose que você desenvolve com sua IA. Esta é uma experiência single‑player e offline no espírito — mas conectável a um LLM local ou via API — focada na satisfação de construir um sistema autônomo e vê‑lo prosperar no silêncio do espaço.

---

## I. A Visão

- Comandante Estratégico: visão top‑down renderizada em Babylon.js. 80% da tela é o cosmos; 20% (à esquerda) é o Com‑Link (chat com HAL, editor de scripts, status/logs).
- Automação é Poder: escreva JavaScript para rotinas e protocolos. Criatividade em automação é a chave.
- HAL‑9001 como Co‑Piloto: um LLM traduz intenção em ações via ferramentas (tools) seguras.
- Simulação Local: estado e scripts persistem no navegador.
- Ritmo Contemplativo: pensar, programar, observar.

---

## II. Lore (Adaptado)

Você desperta como Comandante da USS [Nome da Nave], à deriva em um setor desconhecido após o Grande Silêncio. HAL‑9001 está online, porém com protocolos corrompidos. Sobreviver e reconstruir exigirá delegar, automatizar e explorar, um setor por vez.

---

## III. Fundamentos de Gameplay

- Interface de Comando
  - Com‑Link (20%): Chat com HAL, aba de Scripts (Monaco), aba de Status/Logs.
  - Visão Estratégica (80%): cena Babylon.js com nave, asteroides, destroços; câmera por arrasto.
- Task API (segura)
  - Percepção: `Game.getShipStatus()`, etc.
  - Ação: `Game.moveTo({ x, y, z })`, etc.
  - Memória: `Memory.get/set` (em worker isolado).
- Loop V0 (Movimento e Percepção)
  1) HAL dá boas‑vindas. 2) Comando em linguagem natural. 3) LLM escolhe tool. 4) Jogo executa. 5) Feedback no chat. 6) Sugestão de script `patrol.js` e execução via HAL.

---

## IV. O Agente: HAL‑9001

- System Prompt: calmo, lógico, subserviente, curioso. Objetivo: autonomia e exploração.
- Tools (V0): `move`, `ship_status`, `run_script`. Definidas com Vercel AI SDK + Zod.
- Dinâmica (local): mensagem do usuário → AI SDK (modelo + tools) → decisão do LLM (texto/tool) → execução no motor do jogo → resposta narrativa.

---

## V. Tick do Universo

- Game Loop (render/física): `requestAnimationFrame`.
- Logic Tick (scripts/estado): 1 Hz determinístico.

---

## VI. Stack Técnica (Local)

- Render: Babylon.js.
- UI: React + Vite, Monaco Editor.
- IA: Vercel AI SDK (ai) + provider OpenAI (ou LLM local compatível). Execução de ferramentas no cliente, com API key no navegador apenas para prototipagem.
- Persistência: LocalStorage/IndexedDB.

---

## VII. Roadmap V0 (Prova de Conceito)

- Interface Mínima: layout 20/80; Com‑Link funcional; Babylon.js com câmera por arrasto.
- Mundo Básico: nave controlável; campo de asteroides estático.
- IA + Gameplay: HAL via AI SDK; `move` + `ship_status` + `run_script` como tools.
- Automação: Monaco integrado; salvar/executar script simples (patrol.js) usando a mesma Task API.
- Ciclo Validado: mover via chat + executar script de patrulha.

---

## Notas de Segurança (Prototipagem)

Para V0, a API key pode ser digitada no cliente (Status → Configuração de IA). Em produção, use um backend proxy seguro ou um LLM local.

***

