import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export type BridgeTools = {
  moveTo: (v: { x: number; y: number; z: number }) => Promise<{ ok: boolean }>;
  getShipStatus: () => Promise<any>;
  runScript: (name: string, code: string) => Promise<{ ok: boolean; error?: string }>;
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

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
As ações disponíveis são: move, ship_status, run_script.
Não invente parâmetros; infira apenas o que for pedido.
Se pedirem para executar um script sem fornecer código, use o código padrão disponível.`;

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

    if (object.call) {
      const c = object.call as any;
      if (c.name === 'move') {
        await this.tools.moveTo(c.input);
      } else if (c.name === 'ship_status') {
        const st = await this.tools.getShipStatus();
        const extra = st
          ? ` Posição ${st.position.x.toFixed(1)}, ${st.position.y.toFixed(1)}, ${st.position.z.toFixed(1)}. Velocidade ${st.speed.toFixed(2)}.`
          : '';
        object.say = `${object.say}${extra}`.trim();
      } else if (c.name === 'run_script') {
        const name = c.input?.name || defaultScriptName;
        const code = c.input?.code ?? defaultScriptCode;
        await this.tools.runScript(name, code);
      }
    }

    const reply: ChatMessage = { role: 'assistant', content: object.say || 'Entendido.' };
    this.history.push({ role: 'user', content: userText });
    this.history.push(reply);
    return reply;
  }
}
