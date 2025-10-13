import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export type BridgeTools = {
  moveTo: (v: { x: number; y: number; z: number }) => Promise<{ ok: boolean }>;
  getShipStatus: () => Promise<any>;
  getSectorInfo: () => Promise<any>;
  scanSector: (filter?: { resource?: 'iron' | 'silicon' | 'uranium'; limit?: number }) => Promise<any[]>;
  getResources: () => Promise<{ iron: number; silicon: number; uranium: number }>;
  startMining: (resource: 'iron' | 'silicon' | 'uranium') => Promise<{ ok: boolean; error?: string; targetId?: string }>;
  stopMining: () => Promise<{ ok: boolean }>;
  // Script Library base tools (CRUD + run by name)
  listScripts: () => Promise<Array<{ name: string; description: string; lastModified: string }>>;
  getScriptCode: (name: string) => Promise<string | null>;
  createScriptRaw: (name: string, code: string, description?: string) => Promise<{ ok: boolean; error?: string }>;
  updateScriptRaw: (name: string, newCode: string) => Promise<{ ok: boolean; error?: string }>;
  deleteScript: (name: string) => Promise<{ ok: boolean; error?: string }>;
  runScript: (name: string) => Promise<{ ok: boolean; error?: string }>;
  performScan: () => Promise<string[]>; // returns newly discovered ids
  getMiningStatus: () => Promise<any>;
};

export type ChatMessage = { role: 'user' | 'assistant' | 'tool'; content: string; meta?: any };

export type HalConfig = {
  apiKey?: string;
  model?: string; // e.g., 'gpt-4o-mini' | 'gpt-4o' | 'o3-mini'
};

export class HalLLM {
  private history: ChatMessage[] = [];
  private systemPrompt = `Você é HAL-9001, a IA de bordo. Estilo: calmo, lógico, subserviente, levemente curioso.
Seu objetivo é auxiliar o Comandante a operar a nave e automatizar tarefas.
Interprete o pedido do Comandante e preencha um objeto de intenção com:
- say: sua resposta narrativa em português, como HAL.
- call: apenas se necessário, uma chamada de ação { name, input }.
As ações disponíveis são:
- move { x,y,z }
- ship_status {}
- scan_sector { resource?: 'iron'|'silicon'|'uranium', limit?: number }
- perform_scan {}
- mining_status {}
- get_resources {}
- start_mining { resource: 'iron'|'silicon'|'uranium' }
- stop_mining {}
- Scripts (biblioteca):
  - list_scripts {}
  - get_script_code { name }
  - delete_script { name }
  - run_script { name }
  - create_script { name, goal, description? }  // gere o código internamente
  - update_script { name, goal }                // edite o código internamente
Fluxos recomendados:
  • Criar: create_script -> (opcional) run_script { name } se pedirem para já executar.
  • Editar: get_script_code -> update_script.
  • Executar: se ambíguo, list_scripts; senão run_script { name }.
Regras de scripts: usar somente a API do worker (Game.*, Memory, sleep), sem valores fictícios ou "substitua"; o código deve ser autossuficiente.
Não invente parâmetros; infira apenas o que for pedido. Quando apropriado, explique sucintamente seu plano.`;
// Observação: para "varredura ativa" use a ação perform_scan (não use run_script). Para checar mineração, use mining_status.

  constructor(private tools: BridgeTools, private cfg: HalConfig) {}

  greeting(): ChatMessage {
    return {
      role: 'assistant',
      content:
        'Aqui é HAL-9001. Sistemas online. Suas ordens, Comandante? (Ex.: "Mova a nave para 500, 0, 250" ou "Execute patrol.js")',
    };
  }

  setConfig(cfg: Partial<HalConfig>) {
    this.cfg = { ...this.cfg, ...cfg };
  }

  getConfig(): HalConfig {
    return this.cfg;
  }

  getHistory(): ChatMessage[] {
    return this.history.slice();
  }

  async send(userText: string, defaultScriptName: string, defaultScriptCode: string): Promise<ChatMessage> {
    const provider = createOpenAI({ apiKey: this.cfg.apiKey });
    const modelId = this.cfg.model || 'gpt-4o-mini';

    const historyText = this.history
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'Comandante' : 'HAL'}: ${m.content}`)
      .join('\n');

    const intentSchema = z.object({
      say: z.string().describe('Resposta do HAL ao Comandante, em PT-BR.'),
      call: z
        .union([
          z.object({ name: z.literal('move'), input: z.object({ x: z.number(), y: z.number(), z: z.number() }) }),
          z.object({ name: z.literal('ship_status'), input: z.object({}).optional() }),
          z.object({ name: z.literal('scan_sector'), input: z.object({ resource: z.enum(['iron', 'silicon', 'uranium']).optional(), limit: z.number().optional() }).optional() }),
          z.object({ name: z.literal('perform_scan'), input: z.object({}).optional() }),
          z.object({ name: z.literal('get_resources'), input: z.object({}).optional() }),
          z.object({ name: z.literal('start_mining'), input: z.object({ resource: z.enum(['iron', 'silicon', 'uranium']) }) }),
          z.object({ name: z.literal('stop_mining'), input: z.object({}).optional() }),
          z.object({ name: z.literal('mining_status'), input: z.object({}).optional() }),
          // Library tools
          z.object({ name: z.literal('list_scripts'), input: z.object({}).optional() }),
          z.object({ name: z.literal('get_script_code'), input: z.object({ name: z.string() }) }),
          z.object({ name: z.literal('delete_script'), input: z.object({ name: z.string() }) }),
          z.object({ name: z.literal('run_script'), input: z.object({ name: z.string() }) }),
          z.object({ name: z.literal('create_script'), input: z.object({ name: z.string(), goal: z.string(), description: z.string().optional() }) }),
          z.object({ name: z.literal('update_script'), input: z.object({ name: z.string(), goal: z.string() }) }),
        ])
        .nullish(),
    });

    const prompt = [
      this.systemPrompt,
      historyText ? `Histórico recente:\n${historyText}` : '',
      `Nova entrada do Comandante: ${userText}`,
      'Retorne apenas o objeto: { say, call? }.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const model: any = (provider as any)(modelId);
    const { object } = await generateObject({ model, schema: intentSchema, prompt });

    const logTool = (name: string, input: any, output: any) => {
      this.history.push({ role: 'tool', content: `tool:${name}`, meta: { name, input, output } });
    };

    const getRecentHistory = () =>
      this.history
        .slice(-5)
        .map((m) => `${m.role === 'user' ? 'Comandante' : m.role === 'assistant' ? 'HAL' : 'Tool'}: ${m.content}`)
        .join('\n');

    const generateScript = async (goal: string, currentCode?: string) => {
      const sys = `Você é HAL, gerando código JavaScript para rodar em um Web Worker do jogo.
Use exclusivamente a API exposta no worker:
- Game.moveTo({x,y,z})
- Game.performScan()
- Game.scanSector({ resource?: 'iron'|'silicon'|'uranium', limit?: number })
- Game.startMining(resource)
- Game.getMiningStatus()
- Game.stopMining()
- Game.getShipStatus(), Game.getResources()
- Memory.get/set, sleep(ms)
Sem placeholders ou comentários do tipo "substitua"; escreva lógica real que consulta o ambiente em tempo de execução.
Padrões úteis: escanear, escolher alvos próximos, laços assíncronos com await e intervalos; nunca use recursão para loops; trate erros de forma simples.
Retorne apenas o código executável (sem markdown).`;
      const recent = getRecentHistory();
      const parts = [
        sys,
        recent ? `Contexto recente:\n${recent}` : '',
        `Objetivo do script: ${goal}`,
        currentCode ? `Código atual (para atualizar):\n${currentCode}` : '',
      ].filter(Boolean);
      const t = await generateText({
        model,
        prompt: parts.join('\n\n'),
        maxSteps: 15 as any,
      });
      return t.text.trim();
    };

    if (object.call) {
      const c = object.call as any;
      if (c.name === 'move') {
        const out = await this.tools.moveTo(c.input);
        logTool('move', c.input, out);
      } else if (c.name === 'ship_status') {
        const st = await this.tools.getShipStatus();
        logTool('ship_status', {}, st);
        const extra = st
          ? ` Posição ${st.position.x.toFixed(1)}, ${st.position.y.toFixed(1)}, ${st.position.z.toFixed(1)}. Velocidade ${st.speed.toFixed(2)}.`
          : '';
        object.say = `${object.say}${extra}`.trim();
      } else if (c.name === 'scan_sector') {
        const newly = await this.tools.performScan();
        logTool('perform_scan', {}, newly);
        const list = await this.tools.scanSector(c.input);
        logTool('scan_sector', c.input || {}, list);
        const lines = list
          .map((e: any) => `• ${e.resource} @ (${e.position.x.toFixed(0)}, ${e.position.y.toFixed(0)}, ${e.position.z.toFixed(0)}) [${e.distance.toFixed(0)} km]`)
          .join('\n');
        const discovered = newly?.length ? ` Descobertas: ${newly.length}.` : '';
        if (list.length === 0) {
          const res = c.input?.resource ? ` de ${c.input.resource}` : '';
          object.say = `${object.say}${discovered} Nenhum asteroide${res} escaneado neste raio.`.trim();
        } else {
          object.say = `${object.say}${discovered}\nAlvos próximos (escaneados):\n${lines}`.trim();
        }
      } else if (c.name === 'perform_scan') {
        const newly = await this.tools.performScan();
        logTool('perform_scan', {}, newly);
        object.say = `${object.say} Varredura ativa concluída. Novos objetos: ${newly.length}.`;
      } else if (c.name === 'get_resources') {
        const r = await this.tools.getResources();
        logTool('get_resources', {}, r);
        object.say = `${object.say} Recursos: Fe=${r.iron.toFixed(1)}, Si=${r.silicon.toFixed(1)}, U=${r.uranium.toFixed(1)}.`;
      } else if (c.name === 'start_mining') {
        const res = await this.tools.startMining(c.input.resource);
        logTool('start_mining', c.input, res);
        if (res.ok) object.say = `${object.say} Engajando mineração de ${c.input.resource}. Indo para o alvo.`;
        else object.say = `${object.say} Falha ao iniciar mineração: ${res.error}`;
      } else if (c.name === 'stop_mining') {
        const out = await this.tools.stopMining();
        logTool('stop_mining', {}, out);
        object.say = `${object.say} Mineração pausada.`;
      } else if (c.name === 'mining_status') {
        const s = await this.tools.getMiningStatus();
        logTool('mining_status', {}, s);
        if (s.state === 'idle') {
          const last = s.lastEvent === 'depleted' && s.lastTarget ? ` O último alvo (${s.lastTarget.resource}) foi esgotado.` : '';
          object.say = `${object.say} A mineração não está ativa.${last}`.trim();
        } else if (s.state === 'approaching') {
          object.say = `${object.say} Rumo ao alvo (${s.resource}). Distância ${s.distance?.toFixed?.(0)} km.`;
        } else if (s.state === 'mining') {
          object.say = `${object.say} Extraindo ${s.resource}. Restante ~${s.remaining?.toFixed?.(1)} t a ${s.rate} t/s.`;
        }
      } else if (c.name === 'list_scripts') {
        const out = await this.tools.listScripts();
        logTool('list_scripts', {}, out);
        const names = out.map((s: any) => s.name).join(', ');
        object.say = `${object.say} Scripts disponíveis: ${names || 'nenhum'}.`;
      } else if (c.name === 'get_script_code') {
        const code = await this.tools.getScriptCode(c.input.name);
        logTool('get_script_code', c.input, { hasCode: !!code, length: code?.length ?? 0 });
        if (code) object.say = `${object.say}\nTrecho de ${c.input.name}:\n${code.slice(0, 400)}${code.length > 400 ? '…' : ''}`;
        else object.say = `${object.say} O script ${c.input.name} não existe.`;
      } else if (c.name === 'delete_script') {
        const out = await this.tools.deleteScript(c.input.name);
        logTool('delete_script', c.input, out);
        object.say = out.ok ? `${object.say} Script ${c.input.name} removido.` : `${object.say} Falha: ${out.error}`;
      } else if (c.name === 'run_script') {
        const name = c.input?.name || defaultScriptName;
        const out = await this.tools.runScript(name);
        logTool('run_script', { name }, out);
        if (out.ok) object.say = `${object.say} Executando ${name} agora.`;
        else object.say = `${object.say} Falha ao executar ${name}: ${out.error}`;
      } else if (c.name === 'create_script') {
        const { name, goal, description } = c.input;
        const code = await generateScript(goal);
        const out = await this.tools.createScriptRaw(name, code, description);
        logTool('create_script', { name, goal, description }, out);
        object.say = out.ok ? `${object.say} Criei ${name} na biblioteca.` : `${object.say} Falha ao criar: ${out.error}`;
      } else if (c.name === 'update_script') {
        const { name, goal } = c.input;
        const current = await this.tools.getScriptCode(name);
        if (!current) {
          object.say = `${object.say} O script ${name} não existe.`;
        } else {
          const newCode = await generateScript(goal, current);
          const out = await this.tools.updateScriptRaw(name, newCode);
          logTool('update_script', { name, goal }, out);
          object.say = out.ok ? `${object.say} Atualizei ${name} conforme solicitado.` : `${object.say} Falha ao atualizar: ${out.error}`;
        }
      }
    }

    const reply: ChatMessage = { role: 'assistant', content: object.say || 'Entendido.' };
    this.history.push({ role: 'user', content: userText });
    this.history.push(reply);
    return reply;
  }
}
