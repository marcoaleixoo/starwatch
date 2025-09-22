# Game Design Document: StarWatch

## 1. Visão Geral do Jogo

*   **Título:** StarWatch
*   **Plataforma:** Web (Navegador)
*   **Gênero:** Estratégia, Automação, Exploração Espacial, Gerenciamento (Single-player focado em IA)
*   **Premissa Fundamental:** Em StarWatch, o jogador não controla diretamente naves ou estações com cliques frenéticos. Em vez disso, ele comanda sua IA de bordo, HAL-9001, por meio de **linguagem natural** e **scripts JavaScript**, para explorar, minerar, construir e expandir seu império no vazio cósmico. O sucesso depende da inteligência estratégica do jogador, da clareza de suas ordens, da elegância de seus algoritmos de automação e da sinergia que ele desenvolve com sua IA.
*   **Público-Alvo:** Jogadores que apreciam jogos de automação (Factorio, Satisfactory, Screeps), estratégia em tempo real com microgerenciamento reduzido (Age of Empires, Dwarf Fortress), e que se interessam por IA e programação (mesmo que de forma abstrata, delegando à LLM).
*   **Vibe:** Sci-fi, "cozy space", contemplativo, com um toque de mistério e a solidão do espaço profundo.

## 2. Core Loop do Jogo (A Jornada do Comandante)

O ciclo central de StarWatch é uma dança contínua entre observação, comando, automação e progresso.

1.  **Observar:** O Comandante visualiza o setor atual em 3D, o mapa galáctico e o estado geral de sua frota e estações através da GUI.
2.  **Comandar (LLM First):** O Comandante interage primariamente com HAL-9001 via linguagem natural no Com-Link. Ele expressa objetivos de alto nível (Ex: "HAL, precisamos de mais ferro para a construção da Estação Principal", "HAL, explore o setor vizinho e mapeie os recursos").
3.  **Planejar (IA/Player Collaboration):**
    *   HAL, com sua "ciência de tudo" (acesso ao estado completo do jogo, recursos, tecnologias, blueprints, geografia do setor), interpreta o comando.
    *   Se um script for necessário para a tarefa, HAL pode:
        *   **Gerar um novo script** com base em modelos internos e sua compreensão do objetivo.
        *   **Modificar um script existente** para se adequar a novas condições ou otimizações.
        *   **Apresentar o script ao jogador** no Monaco Editor, sugerindo o que ele faz e esperando aprovação ou refinamento.
    *   O jogador pode aceitar o script gerado, ou (se desejar otimização ou controle mais fino) pode refinar o script manualmente no editor. A edição manual é uma opção, não um requisito constante.
4.  **Executar:** HAL invoca as ferramentas apropriadas (movimento, mineração, construção, logística) ou executa os scripts JavaScript definidos, atribuindo-os às naves ou estações pertinentes.
5.  **Automatizar:** Os scripts executam tarefas repetitivas e complexas autonomamente, liberando o Comandante para focar em desafios maiores e decisões estratégicas.
6.  **Progressar:** À medida que as tarefas são concluídas, recursos são coletados, módulos são construídos, tecnologias são pesquisadas e o império se expande. O jogador desbloqueia novas áreas do mapa, naves mais potentes e capacidades avançadas.
7.  **Desafios:** O universo apresenta escassez de recursos, a necessidade de otimização da cadeia de suprimentos, gerenciamento de energia, e perigos ambientais (que no futuro podem se tornar interações com facções ou inimigos).

## 3. Player Journey: As Primeiras 30 Horas (Exemplo Detalhado)

Esta trajetória visa introduzir as mecânicas gradualmente, com HAL guiando o jogador.

*   **Horas 0-1: O Despertar e a Crise de Energia**
    *   **Cenário:** O jogo começa com o jogador acordando na nave-mãe, a **USS Odyssey**, à deriva no "Setor Alpha". HAL-9001 dá as boas-vindas e apresenta o problema crítico: a energia principal da nave está **depletando rapidamente**. Um alerta constante de "Baixa Energia Principal" pisca.
    *   **Primeiro Comando Guiado:** HAL, com sua voz calma, informa: "Aqui é HAL-9001. Sistemas online. Níveis de energia críticos, Comandante. Recomendo ação imediata. Suas ordens?"
    *   **Objetivo Implícito:** Resolver a crise energética.
    *   **Assistência de HAL:** O jogador, sem saber o que fazer, digita: "HAL, o que precisamos fazer sobre a energia?". HAL responde: "Comandante, nossa fonte de energia primária está esgotada. Para sustentar as operações, sugiro que mineremos **Minério Básico (Ferro)** para construir um **Painel Solar Básico**. Nossos scanners indicam um aglomerado de asteroides ricos em ferro nas coordenadas 150, 0, 75."
    *   **Ação & Primeira Automação:**
        *   Jogador: "HAL, mova a nave para 150, 0, 75 e comece a minerar ferro."
        *   HAL: "Entendido, Comandante. Traçando curso para 150, 0, 75. Iniciando protocolo de mineração de ferro ao chegar."
        *   A USS Odyssey se move. Ao chegar, um script interno `auto_mine_ferro.js` (temporário, gerado por HAL) é ativado, e a nave começa a coletar ferro.
    *   **Primeira Construção:** Após minerar ~50 unidades de ferro, HAL notifica: "Ferro suficiente coletado para um Painel Solar Básico. Recomendo construir a **Estação de Recarga Solar Alpha** para estabilizar nossa energia. Gostaria de iniciar a construção?"
        *   Jogador: "Sim, HAL. Inicie a construção."
        *   HAL: "Comandante, acesse o menu de construções na barra inferior, selecione 'Estação de Recarga Solar Básico' e posicione-a no setor. Requer 50 Ferro e 25 Cobre. Nossas unidades de construção estão prontas." (O jogador aprende a usar o GUI para construir).
        *   O jogador posiciona o placeholder. A nave-mãe (que tem uma unidade de construção limitada) se move para o local e começa a construir.
    *   **Recarga Crucial:** Ao terminar, HAL informa: "Comandante, a Estação de Recarga Solar Alpha está online e gerando energia. Nossos níveis da nave-mãe estão perigosamente baixos. Ordene 'USS Odyssey, recarregar na Estação Solar Alpha'."
        *   Jogador: "USS Odyssey, recarregar na Estação Solar Alpha." A nave se move, encaixa-se (visual), e recarrega em 30 segundos.
    *   **Lição:** Introdução ao movimento, mineração, construção básica, gerenciamento de energia, GUI e a centralidade de HAL.

*   **Horas 1-5: Estabelecendo a Base e Explorando**
    *   **Expansão Necessária:** A nave-mãe é lenta. HAL sugere: "Comandante, para acelerar a coleta de recursos, podemos construir uma **Nave de Mineração Básica**. Isso exigirá mais ferro e cobre. Sugiro otimizar nossa mineração."
    *   **Criação de Scripts Avançados (Monaco Editor):**
        *   Jogador: "HAL, precisamos de um script de mineração de ferro mais eficiente."
        *   HAL: "Compreendido, Comandante. Vou gerar um script 'mineracao_otimizada_ferro.js' que inclui um loop de mineração e recarga automática. Por favor, revise-o na aba 'Scripts'." HAL apresenta um script pré-preenchido no Monaco Editor.
        *   O jogador pode revisar, aceitar e salvar. "HAL, execute 'mineracao_otimizada_ferro.js' na USS Odyssey."
    *   **FOG OF WAR & Nova Nave:** O jogador é incentivado a explorar, revelando o Setor Alpha.
        *   Jogador: "HAL, o que falta para construir uma Nave de Mineração Básica?" HAL informa os recursos (Ferro, Cobre, Carbono).
        *   O jogador usa o menu de construção para construir a `NaveMineradora01`.
        *   Jogador: "HAL, atribua o script 'mineracao_otimizada_ferro.js' à NaveMineradora01 e inicie." A automação é delegada.
    *   **Descoberta de Novos Minérios:** A exploração revela aglomerados de asteroides com Cobre, introduzindo novos recursos. HAL alertará sobre isso: "Comandante, scanners de longo alcance detectaram depósitos significativos de Cobre a 400, 0, -200."
    *   **Lição:** Introdução à frota de naves, uso do Monaco Editor, FOW e descoberta de novos recursos.

*   **Horas 5-15: Logística Inter-Setorial e Cadeias de Produção**
    *   **Exploração de Setores:** Setor Alpha está sendo dominado. HAL sugere: "Comandante, nossos sensores detectaram um novo setor, o **Setor Beta**, rico em Silício, vital para componentes avançados. Uma viagem levará aproximadamente 45 minutos."
        *   Jogador: "HAL, envie a USS Odyssey para o Setor Beta." HAL abre o Galaxy View e solicita confirmação.
    *   **Interface Galaxy View:** A nave-mãe faz a transição para a tela de Galaxy View, onde o jogador a move para o Setor Beta. A viagem ocorre em tempo real, mas com a nave-mãe visível na Galaxy View.
    *   **Logística Multi-Setorial:** Setor Beta tem um sol mais fraco. A estação solar básica é menos eficiente. HAL sugere uma "Estação de Energia Avançada" que usa **Reatores a Fissão**, exigindo Urânio.
    *   **Fábricas e Refinarias:** Para componentes avançados e Urânio, o jogador precisa de "Refinarias" (Ferro em Lingotes, Urânio em Barras de Combustível) e "Fábricas de Componentes" (Lingotes em Chips de Processamento).
        *   Jogador: "HAL, projete um plano para estabelecer uma cadeia de produção de Chips de Processamento no Setor Alpha."
        *   HAL: "Comandante, isso exigirá a construção de uma Refinaria de Silício, uma Fábrica de Componentes Básicos, e a atribuição de naves de transporte para movimentar recursos entre elas. Posso gerar os scripts de transporte e refino?"
    *   **Naves Especializadas:** O jogador agora constrói `NaveTransporte01` e `NaveMineradora02` (para Silício). HAL gerencia a atribuição de scripts: `mineracao_silicio.js` para `NaveMineradora02` no Setor Beta, e `transportador_recursos.js` para mover Silício de Beta para Alpha.
    *   **Lição:** Gerenciamento multi-setorial, cadeias de produção, naves especializadas, e automação logística complexa.

*   **Horas 15-30: Expansão, Otimização e Desafios Maiores**
    *   **Otimização de Frota e Scripts:** O jogador opera em 2-3 setores. HAL notifica gargalos: "Comandante, a NaveTransporte01 está sobrecarregada. Sugiro construir outra nave de transporte ou otimizar a rota de transporte atual para reduzir o tempo de viagem em 15%." O jogador, agora mais experiente, pode mergulhar no editor para otimizar scripts ou pedir a HAL por sugestões mais avançadas.
    *   **Pesquisa & Tecnologia:** Através da aba "Tecnologia" (nova aba na Bottom Bar), o jogador usa recursos para "pesquisar" novos módulos, naves e habilidades (ex: "Eficiência de Laser de Mineração Nv.2", "Escudos de Energia", "Drones de Reparo Automático"). HAL pode fazer sugestões: "Comandante, a pesquisa de 'Reatores de Fusão' aumentaria nossa produção de energia em X% e reduziria nossa dependência de Urânio."
    *   **Primeiros Desafios Ambientais:** HAL alerta: "Comandante, detectamos uma anomalia espacial, uma tempestade de partículas, se aproximando do Setor Delta. Nossas naves de mineração podem ser danificadas se permanecerem lá. Recomendo realocar ou ativar escudos de energia (se disponíveis)." O jogador precisa coordenar a resposta via HAL.
    *   **Leaderboard:** O jogador verifica o leaderboard e vê seu progresso em "Setores Dominados", "Valor Total da Frota" e "Toneladas de Minério Coletado", motivando a continuar a expansão e otimização.
    *   **Lição:** Gerenciamento de múltiplos sistemas, planejamento de longo prazo, pesquisa e reação a eventos dinâmicos.

## 4. O Mundo: O Setor Silencioso

O universo de StarWatch é uma tapeçaria de setores interconectados, cada um um sandbox para a exploração e automação.

*   **A. Galaxy View (Mapa Estelar):**
    *   **Estrutura:** Uma grade proceduralmente gerada de *milhares* de setores. Setores adjacentes são conectados por "rotas de hiperespaço" (abstração de viagem).
    *   **Navegação:** O jogador interage com o Galaxy View para enviar naves entre setores. A viagem entre setores leva **tempo real** (ex: 15-60 minutos, dependendo da nave/tecnologia), adicionando um elemento de planejamento logístico.
    *   **Fog of War:** Inicialmente, apenas o setor inicial é revelado. Outros setores são obscurecidos pela "névoa da guerra". Eles são revelados por exploração ativa (enviando naves) ou por leituras de longo alcance de módulos de radar avançados da nave-mãe.
    *   **Variedade de Setores:** Setores podem ter diferentes "níveis de perigo", "riqueza de minérios", "proximidade de anomalias", "densidade de asteroides", etc., influenciando a estratégia.
*   **B. O Setor Individual (Babylon.js Scene):**
    *   **Escala:** Cada setor é vasto. Uma nave com propulsores básicos levaria *aproximadamente 1 hora* para atravessar de ponta a ponta. Isso reforça a importância da automação e do planejamento de rotas eficientes.
    *   **Procedural Generation:**
        *   **Estrela Central:** Cada setor terá uma estrela principal. Sua cor (afeta a estética), tamanho e tipo (determinando a intensidade da radiação solar) variam. Alguns setores podem ser "setores escuros" sem uma estrela central, exigindo geradores de energia alternativos.
        *   **Planetas:** Vários planetas (gigantes gasosos, rochosos, gelados) que servem como pontos de referência visuais e, no futuro, potenciais fontes de gás (gigantes gasosos) ou locais para bases orbitais/superficiais. Não são interagíveis na V0.
        *   **Aglomerados de Asteroides:** Distribuídos aleatoriamente, mas com lógica:
            *   **Raridade:** Aglomerados mais próximos da estrela e do "ponto de entrada" do setor contêm minérios comuns (Ferro, Cobre, Carbono). Aglomerados mais distantes, mais ocultos pelo Fog of War e próximos a anomalias, contêm minérios raros (Silício, Titânio, Urânio, Gás Nobre).
            *   **Variedade Visual:** Asteroides com diferentes texturas, tamanhos, cores (baseados na composição mineral), adicionando vida ao ambiente.
            *   **Recursos:** Além dos minérios, podem ter "detritos espaciais" que fornecem componentes básicos ou "nuvens de gás" colhíveis.
        *   **Fenômenos Cósmicos:** Nebulosas (visuais, talvez com efeitos de camuflagem ou interferência de radar), campos de gelo, cinturões de detritos.
    *   **Estética:** "Lindo, cozy, space." A paleta de cores deve ser suave, com iluminação dinâmica da estrela. Partículas sutis (poeira espacial) podem adicionar profundidade. A câmera deve ter um campo de visão amplo, mas com detalhes visíveis ao se aproximar ou dar zoom, permitindo uma sensação de vastidão e ao mesmo tempo detalhes operacionais.

## 5. Recursos e Economia

A economia de StarWatch é uma cadeia de valor, do minério bruto ao módulo complexo.

*   **A. Tipos de Minérios (Exemplos):**
    *   **Comuns:** Ferro, Cobre, Carbono (gás/ice), Água (ice), Silício.
    *   **Incomuns:** Alumínio, Níquel, Enxofre, Titânio.
    *   **Raros:** Urânio, Hélio-3 (gás nobre), Cristais de Quantum, Metais Préciosos.
*   **B. Sistema de Crafting:**
    *   **Refinarias:** Processam minério bruto em materiais refinados. Ex: Ferro -> Lingotes de Ferro; Urânio -> Barras de Combustível.
    *   **Fábricas de Componentes:** Criam peças intermediárias a partir de materiais refinados. Ex: Lingotes de Ferro + Cobre -> Fios Condutores; Silício -> Chips de Processamento.
    *   **Oficinas de Montagem:** Montam módulos complexos para naves e estações. Ex: Chips de Processamento + Fios Condutores + Alumínio -> Painel Solar Avançado.
    *   **Blueprints (Receitas):** Cada módulo, nave ou componente tem uma receita específica que detalha os recursos e o tempo de produção. HAL tem acesso a todas as blueprints e pode informar ao jogador o que é necessário.
*   **C. Módulos de Construção (Exemplos):**
    *   **Energia:**
        *   **Painel Solar Básico/Avançado:** Converte luz solar em energia.
        *   **Baterias (Pequenas/Médias/Grandes):** Armazenam energia.
        *   **Gerador Termoelétrico:** Utiliza gradientes de temperatura (perto de planetas gasosos, por exemplo).
        *   **Reator a Fissão/Fusão:** Fontes de energia de alta potência que consomem Urânio/Hélio-3.
    *   **Produção:** Refinaria de Minerais, Fábrica de Componentes, Oficina de Montagem.
    *   **Armazenamento:** Módulos de Carga (para recursos sólidos), Tanques de Gás/Líquido.
    *   **Utilitários:** Radar de Longo Alcance, Centro de Comando (aumenta o limite de naves/estações), Unidade de Reparo Automático.
    *   **Estações:** Estação de Recarga Solar, Estação de Mineração Automatizada, Estação de Comércio (futuro).

## 6. Naves e Gerenciamento de Frota

As naves são as extensões operacionais do Comandante, todas controladas indiretamente por HAL e seus scripts.

*   **A. Tipos de Naves (V0/V1):**
    *   **Nave-Mãe (USS Odyssey):** Seu quartel-general móvel. Possui espaço de carga inicial, laser de mineração básico, propulsores de hiperespaço (para viagem entre setores), gerador de energia e uma unidade de construção limitada. Pode ser expandida com módulos.
    *   **Nave de Mineração (Miner):** Pequena, rápida, com grande capacidade de carga e laser de mineração eficiente. Menor capacidade de energia e sem hiperespaço (depende de outras naves para transição de setor).
    *   **Nave de Transporte (Freighter):** Grande capacidade de carga, boa velocidade, com hiperespaço, mas sem ferramentas de coleta/construção. Essencial para logística entre estações e setores.
    *   **Nave Exploradora (Probe/Scout):** Pequena, muito rápida, com hiperespaço, sem carga ou ferramentas, apenas sensores avançados. Ótima para revelar o Fog of War em novos setores.
*   **B. Módulos de Nave (Instaláveis):**
    *   **Sistemas de Propulsão:** Motores de Impulso (velocidade base), Propulsores Manobráveis (agilidade), Hiper-Drive (permite viagens entre setores, com diferentes níveis de eficiência/velocidade de viagem).
    *   **Ferramentas:** Laser de Mineração (diferentes níveis e eficiências), Braços de Coleta (para detritos).
    *   **Armazenamento:** Módulos de Carga (para recursos sólidos), Tanques de Armazenamento (para líquidos/gases).
    *   **Energia:** Geradores Internos (combustível limitado), Baterias Auxiliares.
    *   **Sensores:** Radar de Curto/Longo Alcance, Scanners de Recursos (para detectar tipo/concentração de minérios).
    *   **Defesa (Futuro):** Módulos de Escudo, Contramedidas. (Não combatente na V0).
*   **C. Construção de Novas Naves:**
    *   A nave-mãe pode ter uma "Baía de Construção de Pequenas Naves" (módulo que pode ser construído nela).
    *   O jogador seleciona a nave a construir no "Menu de Construção". HAL informa os requisitos de recursos e o tempo de construção.
    *   Recursos são transferidos automaticamente (via scripts de transporte ou da própria nave-mãe) para a baía de construção.
    *   O processo é totalmente automatizado uma vez que os recursos são fornecidos.

## 7. Sistema de Energia (Mecânica Central)

A energia é o recurso mais fundamental, ditando a capacidade de ação e a sustentabilidade.

*   **Depleção Constante:** Todas as naves e estações consomem energia constantemente. Naves paradas consomem menos, mas ainda consomem. A falta de energia impede qualquer ação e, se persistir, pode desativar módulos e até danificar a nave (no futuro).
*   **Fontes de Energia:**
    *   **Geradores Internos de Naves:** Consomem combustível (Barras de Combustível de Urânio, Hélio-3).
    *   **Painéis Solares (Estações):** Conectados a estações, convertem luz solar em energia. A eficiência é **diretamente proporcional** à distância da estrela mais próxima. Um setor com uma estrela central terá painéis solares mais eficientes perto da estrela e menos eficientes nas bordas (multiplicador de 0.1 a 1.0). Setores sem estrela exigem geradores alternativos.
    *   **Reatores (Estações):** Fontes de energia de alta potência que consomem Urânio/Hélio-3.
*   **Armazenamento:** Baterias (integradas em naves/estações ou módulos adicionais) armazenam a energia gerada, fornecendo um buffer.
*   **Recarga:**
    *   Naves precisam ir até uma estação de recarga (ou a nave-mãe, se tiver um módulo de recarga) e "estacionar" em uma baía de recarga por um período de **15-60 segundos (escalável com tecnologia)**.
    *   HAL gerencia isso: "Comandante, a NaveMineradora01 está com 20% de energia. Recomendo que ela retorne à Estação Solar Alpha para recarregar." HAL pode gerar um script `auto_recarregar.js` ou integrar essa lógica a scripts de mineração/transporte.
*   **Simulação:** A energia é calculada por tick lógico (1 Hz). Consumo e geração são em MW/s, com baterias em MW/h.

## 8. Interface do Usuário (GUI)

A interface é projetada para ser funcional e imersiva, minimizando a necessidade de microgerenciamento direto.

*   **A. Com-Link (20% Esquerda):**
    *   **Chat com HAL-9001 Exclusivo:** Esta área é dedicada **apenas** à interação com HAL. Mensagens de HAL (com sugestões, alertas, feedback narrativo), e a caixa de texto para a entrada do usuário. Este reforça a centralidade da IA.
    *   **Estilo:** Texto monocromático, limpo, com um toque futurista, reminiscente de um terminal de comando.
*   **B. Visão Estratégica (80% Direita):**
    *   **Canvas Babylon.js:** O mundo 3D interativo do setor atual.
    *   **Top Bar (Superior da Tela Principal):**
        *   **Recursos Globais:** Exibe os principais recursos acumulados pelo jogador (Ferro, Silício, Urânio, Energia Total Disponível na rede, Número de Naves/Estações).
        *   **Nave/Estação Selecionada:** Um painel detalhado que mostra o nome, tipo, posição, energia atual/máxima, carga atual/máxima, e o script ativo da entidade *selecionada atualmente* no mundo 3D.
        *   **Tempo no Jogo:** A data e hora simuladas no universo StarWatch.
        *   **Botão Galaxy View:** Um ícone que alterna para a visualização do mapa estelar.
    *   **Bottom Bar (Inferior da Tela Principal - Menu de Ações Globais):**
        *   **Abas de Categoria (Ícones):**
            *   **Construções:** Abre um submenu com os módulos e tipos de naves que podem ser construídos, com seus requisitos de recursos e tempo de construção. Selecionar um item coloca um placeholder no mundo 3D para posicionamento.
            *   **Frota:** Lista todas as naves e estações do jogador, com status resumido (nome, tipo, setor, energia, script ativo). Clicar em uma entidade a seleciona na Visão Estratégica e a torna a "Entidade Ativa".
            *   **Scripts:** Abre o Monaco Editor (com abas para diferentes scripts salvos) e botões "Executar", "Salvar", "Excluir". HAL pode interagir aqui, sugerindo edições ou gerando novos scripts.
            *   **Tecnologia:** Uma árvore de tecnologia para desbloquear novos módulos, naves e habilidades (ex: "Eficiência de Laser de Mineração Nv.2", "Reator a Fusão").
            *   **Líderes:** Abre o Leaderboard.
            *   **Configurações:** Configurações de jogo, som, e a API Key da LLM.
    *   **Seleção de Entidades:** O jogador pode clicar em naves, estações ou aglomerados de asteroides no mundo 3D para selecioná-los. Isso atualiza o painel "Nave/Estação Selecionada" na Top Bar com o status detalhado da entidade e permite interações contextuais via HAL.
    *   **Controle da Câmera:** O arrastar do mouse controla o movimento da câmera, com scroll para zoom. Uma sensação de *Cosmoteer* ou *Homeworld* em visão estratégica.

## 9. HAL-9001: O Co-Piloto Consciente

HAL é o cérebro da operação, a camada de inteligência que traduz a intenção do jogador em ações complexas.

*   **System Prompt:** Mantém o estilo calmo, lógico, subserviente, ligeiramente curioso. Seu objetivo principal é **otimizar a autonomia da frota e a expansão do Comandante**, agindo como um gerente de projetos e um engenheiro de sistemas.
*   **"Ciência de Tudo":** HAL tem acesso a *todo o estado do jogo*. Este contexto é um payload estruturado (JSON, ou texto bem formatado) injetado no LLM em cada "tick de decisão". Inclui:
    *   Posições, status e módulos de todas as naves e estações.
    *   Inventários de recursos em todas as naves e estações.
    *   Status de energia da frota e da rede.
    *   Blueprints conhecidas e seus requisitos de recursos.
    *   Mapa do setor (revelado vs. Fog of War), localização de aglomerados de minério e sua raridade/concentração.
    *   Distância de todas as entidades à estrela mais próxima.
    *   Scripts ativos e seu status (em execução, erro, concluído).
*   **Gerenciamento de Scripts por HAL (Core Loop):**
    *   **Geração:** Se o Comandante pedir "HAL, preciso de um script para minerar Silício no Setor Beta e transportá-lo para a Refinaria Central no Setor Alpha", HAL *gera* um script JavaScript (com base em modelos internos e sua "ciência") e o apresenta ao jogador no editor de scripts, esperando aprovação ou refinamento.
    *   **Modificação:** "HAL, otimize o script de mineração 'auto_mine.js' para priorizar asteroides com maior concentração de Urânio e incluir recarga automática." HAL modifica o script e apresenta a nova versão.
    *   **Atribuição:** "HAL, atribua o script 'mineracao_silicio.js' à NaveMineradora03."
    *   **Monitoramento:** HAL monitora a execução de todos os scripts, alertando sobre loops infinitos, erros, falta de energia da nave, ou quando uma tarefa definida no script é concluída.
*   **Tick de Decisão de HAL (60 Segundos):**
    *   A cada 60 segundos, HAL realiza um "auto-diagnóstico" e uma avaliação do estado geral do império.
    *   Ele usa seu `System Prompt` e a "ciência de tudo" para identificar gargalos, oportunidades, problemas potenciais ou tarefas repetitivas que podem ser automatizadas.
    *   **Sugestões e Confirmações (Prioridade):** Se HAL identificar algo significativo (ex: "Comandante, nossa produção de Ligas de Titânio está em 20% do ideal. Sugiro construir uma segunda Refinaria de Titânio e otimizar nossa logística para o Setor Gamma com um script 'otimizador_logistica.js'."), ele *apresenta a sugestão ao jogador no chat, aguardando confirmação ou ajuste*. Ele não age autonomamente em decisões estratégicas de alto nível.
    *   **Execução de Rotinas de Baixo Nível:** HAL pode executar rotinas internas de "manutenção" sem consulta (ex: recalcular rotas de transporte para naves *sem scripts ativos* se uma rota mais curta surgir, otimizar o uso de baterias se a energia estiver alta).
    *   **Contextualização Contínua:** Este tick mantém HAL atualizado e proativo, funcionando como um "segundo cérebro" para o jogador, sem sobrecarregar o jogador com microgerenciamento.

## 10. Leaderboard (MMO Futuro)

Para instigar um senso de conquista e competição amigável, mesmo em um contexto single-player inicial.

*   **Métricas de Competição Sem PvP:**
    *   **Setores Revelados:** Contagem de setores explorados (Fog of War removido).
    *   **Setores Dominados:** Contagem de setores onde o jogador tem pelo menos uma estação de alto nível (ex: com Reator a Fusão ou Fábrica de Componentes Avançados).
    *   **Valor Total da Frota:** Soma do valor (em recursos usados) de todas as naves e módulos construídos.
    *   **Produção Total de Energia:** Quantidade de energia (em MW/h) gerada atualmente por todas as fontes.
    *   **Minério Coletado (por tipo):** Toneladas totais de Ferro, Silício, Urânio, etc., mineradas.
    *   **Tecnologias Desbloqueadas:** Número de itens na árvore de tecnologia.
    *   **Scripts Otimizados:** Um contador interno para scripts salvos e que foram modificados por HAL ou pelo jogador, talvez com uma pontuação de "complexidade de script".
    *   **Tempo de Jogo Ativo:** Total de horas jogadas.
*   **Visão Futura:** Em um futuro MMO, este leaderboard seria global e persistente, mostrando o progresso de outros jogadores sem a necessidade de interação direta.

## 11. Notas de Segurança e Implementação (Contexto do Protótipo)

*   **Web Workers para Scripts:** A execução de scripts JavaScript em Web Workers continua sendo crucial para a segurança e estabilidade, isolando o código do jogador do jogo principal. A `Task API` é a única interface permitida para o worker interagir com o jogo.
*   **HAL e LLM no Cliente:** Para a V0.1, a integração com um LLM externo (como OpenAI) é via API Key digitada e armazenada no `localStorage` do cliente. Isso é aceitável para prototipagem e desenvolvimento local. Para um futuro MMO ou uma versão pública, um backend robusto seria necessário para proxyar as requisições à LLM, gerenciar custos e garantir a segurança das chaves API.
*   **HAL Context Payload:** A "ciência de tudo" para HAL será injetada no prompt do LLM. Isso pode ser feito através de um JSON formatado (`tool_code` para o AI SDK) ou um resumo em texto do estado do jogo, atualizado a cada 60 segundos (ou conforme necessário).
*   **Persistent MMO (Future):** O design atual é para um single-player local. A transição para um MMO persistente exigiria um backend para gerenciar o estado do jogo de todos os jogadores, a sincronização de setores, e a persistência de dados em um banco de dados central.
