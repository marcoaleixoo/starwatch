import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Game } from './game/Game';
import { Chat } from './ui/Chat';
import { MonacoEditor } from './ui/MonacoEditor';
import { HalLLM } from './hal/halLLM';

type Tab = 'chat' | 'scripts' | 'status';
type ViewMode = 'play' | 'sector' | 'galaxy';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [tab, setTab] = useState<Tab>('chat');
  const [viewMode, setViewMode] = useState<ViewMode>('play');
  const [scriptCode, setScriptCode] = useState<string>(() => `// patrol.js\n// Exemplo de patrulha simples entre dois pontos\n// A API disponível no worker: Game.moveTo({x, y, z}), Memory.get/set, sleep(ms)\n(async () => {\n  const A = { x: 500, y: 0, z: 250 };\n  const B = { x: 200, y: 0, z: -200 };\n  while (true) {\n    await Game.moveTo(A);\n    await sleep(3000);\n    await Game.moveTo(B);\n    await sleep(3000);\n  }\n})();\n`);

  // Setup Game
  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current);
    setGame(g);
    return () => g.dispose();
  }, []);

  // Handle view mode transitions (sector map zoom-out and back)
  useEffect(() => {
    if (!game) return;
    if (viewMode === 'sector') game.enterSectorMap();
    else game.exitSectorMap();
  }, [viewMode, game]);

  // ESC closes map views
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewMode('play');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
      getSectorInfo: async () => game?.getSectorInfo() ?? null,
      scanSector: async (filter?: { resource?: 'iron' | 'silicon' | 'uranium'; limit?: number }) => game?.scanSector(filter) ?? [],
      getResources: async () => game?.getResources() ?? { iron: 0, silicon: 0, uranium: 0 },
      startMining: async (resource: 'iron' | 'silicon' | 'uranium') => game?.startMining(resource) ?? { ok: false, error: 'Game not ready' },
      stopMining: async () => game?.stopMining() ?? { ok: false },
      performScan: async () => game?.performScan() ?? [],
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
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', background: '#060a15' }} />
        <TopHUD game={game} viewMode={viewMode} onChangeMap={setViewMode} />
        <RightPanel game={game} />
        {viewMode === 'galaxy' && <GalaxyOverlay game={game} onClose={() => setViewMode('play')} />}
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
      <div>Velocidade: {status ? status.speed.toFixed(2) : '—'} km/s</div>
      <div>Destino: {status?.destination ? `${status.destination.x}, ${status.destination.y}, ${status.destination.z}` : '—'}</div>
      <div>Tick: {tick}</div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button onClick={() => game?.resetSector()} style={panelBtnStyle}>Resetar Setor</button>
      </div>
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

const panelBtnStyle: React.CSSProperties = {
  background: '#1a2a4a',
  color: '#e3ecff',
  border: '1px solid #24345a',
  padding: '8px 12px',
  borderRadius: 6,
  cursor: 'pointer',
};

function switchBtn(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    background: active ? '#121a31' : 'transparent',
    color: active ? '#e3ecff' : '#9bb0d9',
    border: 'none',
    borderRight: '1px solid #1c2541',
    cursor: 'pointer',
  } as React.CSSProperties;
}

function GalaxyOverlay({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  useEffect(() => {
    const info = game?.getSectorInfo();
    setSeed(info?.seed ?? null);
  }, [game]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    function rngFromSeed(s: number) {
      let a = s >>> 0;
      return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const s = seed ?? 1;
    const rnd = rngFromSeed(s);
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    // Background
    ctx.fillStyle = '#060a15'; ctx.fillRect(0,0,W,H);
    // Stars field
    for (let i = 0; i < 800; i++) {
      const x = rnd()*W, y = rnd()*H; const r = rnd()*1.2+0.2;
      ctx.fillStyle = rnd()<0.25 ? 'rgba(200,220,255,0.9)' : 'rgba(240,245,255,0.9)';
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    // Nodes (mock galaxy map)
    const nodes: {x:number;y:number;name:string;current?:boolean}[] = [];
    for (let i=0;i<18;i++){ const x = 80 + rnd()*(W-160); const y = 80 + rnd()*(H-160); nodes.push({x,y,name:`S-${(i+1).toString().padStart(2,'0')}`}); }
    // Current sector highlighted at center-ish
    nodes[0].current = true; nodes[0].x = W*0.5; nodes[0].y = H*0.5; nodes[0].name = 'Atual';
    ctx.strokeStyle = 'rgba(80,120,200,0.3)';
    for (let i=0;i<nodes.length;i++){ for(let j=i+1;j<nodes.length;j++){ if (rnd()<0.08){ ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke(); } } }
    for (const n of nodes){
      ctx.beginPath(); ctx.arc(n.x,n.y,n.current?6:4,0,Math.PI*2); ctx.fillStyle = n.current?'#7eb6ff':'#9fb6ff'; ctx.fill();
      ctx.fillStyle = 'rgba(220,230,255,0.85)'; ctx.font = '12px system-ui'; ctx.fillText(n.name, n.x+8, n.y-8);
    }
  }, [seed]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,12,24,0.86)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        <div style={{ color: '#e3ecff', fontWeight: 700 }}>Galaxy Map</div>
        <button onClick={onClose} style={panelBtnStyle}>Voltar ao Setor</button>
      </div>
      <div style={{ flex: 1, padding: 10 }}>
        <canvas ref={canvasRef} width={900} height={520} style={{ width: '100%', height: '100%', border: '1px solid #1c2541', borderRadius: 8, background: '#060a15' }} />
      </div>
      <div style={{ padding: 10, color: '#9bb0d9', fontSize: 13 }}>Protótipo do mapa galáctico: nós gerados por seed para visualização. Viagens e setores múltiplos virão em próximas versões.</div>
    </div>
  );
}

function TopHUD({ game, viewMode, onChangeMap }: { game: Game | null; viewMode: ViewMode; onChangeMap: (m: ViewMode) => void }) {
  const [hud, setHud] = useState({
    sectorName: '—',
    iron: 0,
    silicon: 0,
    uranium: 0,
    pos: '—',
    speed: '—',
  });

  useEffect(() => {
    const id = setInterval(() => {
      const sec = game?.getSectorInfo();
      const res = game?.getResources();
      const st = game?.getShipStatus();
      setHud({
        sectorName: sec?.name ?? '—',
        iron: Number(res?.iron?.toFixed?.(1) ?? 0),
        silicon: Number(res?.silicon?.toFixed?.(1) ?? 0),
        uranium: Number(res?.uranium?.toFixed?.(1) ?? 0),
        pos: st ? `${st.position.x.toFixed(0)}, ${st.position.y.toFixed(0)}, ${st.position.z.toFixed(0)}` : '—',
        speed: st ? st.speed.toFixed(2) : '—',
      });
    }, 500);
    return () => clearInterval(id);
  }, [game]);

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', zIndex: 5 }}>
      <div style={{ display: 'flex', gap: 14, background: 'rgba(13,19,36,0.7)', border: '1px solid #1c2541', borderRadius: 8, padding: '6px 10px', pointerEvents: 'auto' }}>
        <strong style={{ color: '#e3ecff' }}>Setor: {hud.sectorName}</strong>
        <span style={{ color: '#9bb0d9' }}>Pos: {hud.pos} km</span>
        <span style={{ color: '#9bb0d9' }}>Vel: {hud.speed} km/s</span>
      </div>
      <div style={{ display: 'flex', gap: 0, pointerEvents: 'auto', border: '1px solid #1c2541', borderRadius: 8, overflow: 'hidden', background: '#0d1324' }}>
        <button onClick={() => onChangeMap(viewMode==='sector'?'play':'sector')} style={{ ...switchBtn(viewMode==='sector') }}>Sector Map</button>
        <button onClick={() => onChangeMap(viewMode==='galaxy'?'play':'galaxy')} style={{ ...switchBtn(viewMode==='galaxy') }}>Galaxy Map</button>
      </div>
      <div style={{ display: 'flex', gap: 10, background: 'rgba(13,19,36,0.7)', border: '1px solid #1c2541', borderRadius: 8, padding: '6px 10px', pointerEvents: 'auto' }}>
        <span>Fe: <strong style={{ color: '#e3ecff' }}>{hud.iron}</strong></span>
        <span>Si: <strong style={{ color: '#e3ecff' }}>{hud.silicon}</strong></span>
        <span>U: <strong style={{ color: '#e3ecff' }}>{hud.uranium}</strong></span>
      </div>
    </div>
  );
}

function RightPanel({ game }: { game: Game | null }) {
  const [fleet, setFleet] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [asteroidsByCluster, setAsteroidsByCluster] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setFleet(game?.getFleet() || []);
      setClusters(game?.getClustersOverview(true) || []);
    }, 800);
    return () => clearInterval(id);
  }, [game]);

  const expandCluster = (cid: string) => {
    const open = !expanded[cid];
    setExpanded({ ...expanded, [cid]: open });
    if (open) {
      const list = game?.getAsteroidsInCluster(cid, true) || [];
      setAsteroidsByCluster((m) => ({ ...m, [cid]: list }));
    }
  };

  const smallBtn: React.CSSProperties = { background: '#1a2a4a', color: '#e3ecff', border: '1px solid #24345a', borderRadius: 6, cursor: 'pointer' };

  return (
    <div style={{ position: 'absolute', top: 56, right: 10, width: 300, maxHeight: '60%', overflow: 'auto', background: 'rgba(13,19,36,0.85)', border: '1px solid #1c2541', borderRadius: 8, padding: 10, color: '#d3e0ff', pointerEvents: 'auto', zIndex: 5 }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Naves</div>
      {fleet.map((s) => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #1c2541' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Pos: {s.position.x.toFixed(0)}, {s.position.y.toFixed(0)}, {s.position.z.toFixed(0)} km</div>
          </div>
          <button onClick={() => game?.focusCameraOn && game.focusCameraOn({ x: s.position.x, y: s.position.y, z: s.position.z }, 80)} style={{ ...smallBtn, padding: '6px 8px' }}>Focar</button>
        </div>
      ))}
      <div style={{ marginTop: 10, marginBottom: 6, fontWeight: 700 }}>Asteroid Clusters</div>
      {clusters.map((c) => (
        <div key={c.id} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => expandCluster(c.id)}>
            <div>
              <span style={{ fontWeight: 600 }}>{c.id}</span> <span style={{ opacity: 0.8 }}>({c.type})</span>
            </div>
            <div style={{ opacity: 0.8 }}>Descobertos: {c.discovered}</div>
          </div>
          {expanded[c.id] && (
            <div style={{ marginTop: 4, paddingLeft: 8 }}>
              {(asteroidsByCluster[c.id] || []).map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                  <span>{a.resource} @ ({Math.round(a.position.x)}, {Math.round(a.position.y)}, {Math.round(a.position.z)})</span>
                  <button onClick={() => game?.focusCameraOn && game.focusCameraOn({ x: a.position.x, y: a.position.y, z: a.position.z }, 70)} style={{ ...smallBtn, padding: '2px 6px', fontSize: 12 }}>Ir</button>
                </div>
              ))}
              {(asteroidsByCluster[c.id] || []).length === 0 && (
                <div style={{ fontSize: 12, opacity: 0.75 }}>Nenhum asteroide escaneado neste cluster.</div>
              )}
            </div>
          )}
        </div>
      ))}
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Dica: use o Com‑Link “Escaneie o setor” para revelar asteroides próximos.</div>
    </div>
  );
}
