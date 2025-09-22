import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Game } from './game/Game';
import { Chat } from './ui/Chat';
import { MonacoEditor } from './ui/MonacoEditor';
import { HalLLM } from './hal/halLLM';

type Tab = 'chat' | 'scripts' | 'status';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [tab, setTab] = useState<Tab>('chat');
  const [scriptCode, setScriptCode] = useState<string>(() => `// patrol.js\n// Exemplo de patrulha simples entre dois pontos\n// A API disponível no worker: Game.moveTo({x, y, z}), Memory.get/set, sleep(ms)\n(async () => {\n  const A = { x: 500, y: 0, z: 250 };\n  const B = { x: 200, y: 0, z: -200 };\n  while (true) {\n    await Game.moveTo(A);\n    await sleep(3000);\n    await Game.moveTo(B);\n    await sleep(3000);\n  }\n})();\n`);

  // Setup Game
  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current);
    setGame(g);
    return () => g.dispose();
  }, []);

  // Settings for AI
  const envKey = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
  const envModel = (import.meta as any).env?.VITE_OPENAI_MODEL as string | undefined;
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('OPENAI_API_KEY') || envKey || '');
  const [model, setModel] = useState<string>(() => localStorage.getItem('OPENAI_MODEL') || envModel || 'gpt-4o-mini');

  useEffect(() => { localStorage.setItem('OPENAI_API_KEY', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('OPENAI_MODEL', model); }, [model]);

  const hal = useMemo(() => {
    const tools = {
      moveTo: async ({ x, y, z }: { x: number; y: number; z: number }) => {
        game?.moveTo({ x, y, z });
        return { ok: true } as const;
      },
      getShipStatus: async () => game?.getShipStatus() ?? null,
      runScript: async (name: string, code: string) => {
        if (!game) return { ok: false, error: 'Game not ready' } as const;
        game.runScript({ name, code });
        return { ok: true } as const;
      },
    };
    return new HalLLM(tools, { apiKey, model });
  }, [game, apiKey, model]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ width: '20%', minWidth: 280, maxWidth: 420, borderRight: '1px solid #1c2541', background: '#0d1324', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ display: 'flex', borderBottom: '1px solid #1c2541' }}>
          <button onClick={() => setTab('chat')} style={tabBtn(tab === 'chat')}>Com‑Link</button>
          <button onClick={() => setTab('scripts')} style={tabBtn(tab === 'scripts')}>Scripts</button>
          <button onClick={() => setTab('status')} style={tabBtn(tab === 'status')}>Status</button>
        </nav>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <div style={{ display: tab === 'chat' ? 'block' : 'none', height: '100%' }}>
            <Chat hal={hal} defaultScript={scriptCode} />
          </div>
          <div style={{ display: tab === 'scripts' ? 'block' : 'none', height: '100%' }}>
            <MonacoEditor value={scriptCode} language="javascript" onChange={setScriptCode} />
          </div>
          <div style={{ display: tab === 'status' ? 'block' : 'none', height: '100%' }}>
            <StatusPanel game={game} apiKey={apiKey} setApiKey={setApiKey} model={model} setModel={setModel} />
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </main>
    </div>
  );
}

function StatusPanel({ game, apiKey, setApiKey, model, setModel }: { game: Game | null; apiKey: string; setApiKey: (v: string) => void; model: string; setModel: (v: string) => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const status = game?.getShipStatus();
  return (
    <div style={{ padding: 12, fontSize: 14 }}>
      <div style={{ opacity: 0.7 }}>USS [Nome da Nave]</div>
      <div>Posição: {status ? `${status.position.x.toFixed(1)}, ${status.position.y.toFixed(1)}, ${status.position.z.toFixed(1)}` : '—'}</div>
      <div>Velocidade: {status ? status.speed.toFixed(2) : '—'}</div>
      <div>Destino: {status?.destination ? `${status.destination.x}, ${status.destination.y}, ${status.destination.z}` : '—'}</div>
      <div>Tick: {tick}</div>
      <div style={{ borderTop: '1px solid #1c2541', marginTop: 10, paddingTop: 10 }}>
        <div style={{ marginBottom: 6, opacity: 0.8 }}>Configuração de IA</div>
        <label style={{ display: 'block', fontSize: 12, opacity: 0.8 }}>OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          style={{ width: '100%', padding: 6, background: '#0b1120', color: '#e3ecff', border: '1px solid #1c2541', borderRadius: 6 }}
        />
        <label style={{ display: 'block', marginTop: 8, fontSize: 12, opacity: 0.8 }}>Modelo</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="gpt-4o-mini"
          style={{ width: '100%', padding: 6, background: '#0b1120', color: '#e3ecff', border: '1px solid #1c2541', borderRadius: 6 }}
        />
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Use gpt-4o-mini (rápido) ou gpt-4o (mais capaz). Para raciocínio, o3-mini.</div>
      </div>
    </div>
  );
}

function tabBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '10px 12px',
    background: active ? '#121a31' : 'transparent',
    color: active ? '#e3ecff' : '#9bb0d9',
    border: 'none',
    borderRight: '1px solid #1c2541',
    cursor: 'pointer',
  } as React.CSSProperties;
}
