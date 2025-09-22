import { generateObject } from 'ai';
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
  runScript: (name: string, code: string) => Promise<{ ok: boolean; error?: string }>;
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
- run_script { name?: string, code?: string }
Não invente parâmetros; infira apenas o que for pedido. Quando apropriado, explique sucintamente seu plano.
Se pedirem para executar um script sem fornecer código, use o código padrão disponível.`;
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
          z.object({ name: z.literal('run_script'), input: z.object({ name: z.string().optional(), code: z.string().optional() }).optional() }),
        ])
        .nullish(),
    });

    const prompt = [
      this.systemPrompt,
      historyText ? `Histórico recente:\n${historyText}` : '',
      `Nova entrada do Comandante: ${userText}`,
      `Código padrão do editor: ${defaultScriptName}`,
      'Retorne apenas o objeto: { say, call? }.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const model: any = (provider as any)(modelId);
    const { object } = await generateObject({ model, schema: intentSchema, prompt });

    const logTool = (name: string, input: any, output: any) => {
      this.history.push({ role: 'tool', content: `tool:${name}`, meta: { name, input, output } });
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
      } else if (c.name === 'run_script') {
        const name = c.input?.name || defaultScriptName;
        const code = c.input?.code ?? defaultScriptCode;
        const out = await this.tools.runScript(name, code);
        logTool('run_script', { name }, out);
      }
    }

    const reply: ChatMessage = { role: 'assistant', content: object.say || 'Entendido.' };
    this.history.push({ role: 'user', content: userText });
    this.history.push(reply);
    return reply;
  }
}
