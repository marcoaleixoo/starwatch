import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Game } from './game/Game';
import { Chat } from './ui/Chat';
import { ScriptsPanel } from './ui/ScriptsPanel';
import { HalLLM } from './hal/halLLM';

type Tab = 'chat' | 'status';
type ViewMode = 'play' | 'sector';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [tab, setTab] = useState<Tab>('chat');
  const [scriptsOpen, setScriptsOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('play');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [buildHeight, setBuildHeight] = useState<number>(0);
  const [topSpace, setTopSpace] = useState<number>(56);
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
      getMiningStatus: async () => (game as any)?.getMiningStatus?.() ?? { state: 'idle' },
      // Script library tools
      listScripts: async () => game?.listScripts?.() ?? [],
      getScriptCode: async (name: string) => game?.getScriptCode?.(name) ?? null,
      createScriptRaw: async (name: string, code: string, description?: string) => game ? game.createScript(name, code, description) : { ok: false, error: 'Game not ready' },
      updateScriptRaw: async (name: string, newCode: string) => game ? game.updateScript(name, newCode) : { ok: false, error: 'Game not ready' },
      deleteScript: async (name: string) => game ? game.deleteScript(name) : { ok: false, error: 'Game not ready' },
      runScript: async (name: string) => game ? game.runScriptByName(name) : { ok: false, error: 'Game not ready' },
    };
    return new HalLLM(tools, { apiKey, model });
  }, [game, apiKey, model]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ width: '20%', minWidth: 280, maxWidth: 420, borderRight: '1px solid #1c2541', background: '#0d1324', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
        <nav style={{ display: 'flex', borderBottom: '1px solid #1c2541' }}>
          <button onClick={() => setTab('chat')} style={tabBtn(tab === 'chat')}>Com‑Link</button>
          <button onClick={() => setTab('status')} style={tabBtn(tab === 'status')}>Status</button>
        </nav>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <div style={{ display: tab === 'chat' ? 'block' : 'none', height: '100%' }}>
            <Chat hal={hal} defaultScript={scriptCode} />
          </div>
          <div style={{ display: tab === 'status' ? 'block' : 'none', height: '100%' }}>
            <StatusPanel game={game} apiKey={apiKey} setApiKey={setApiKey} model={model} setModel={setModel} />
          </div>
        </div>
      </aside>
      <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
        <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', background: '#060a15' }} />
          <TopHUD game={game} viewMode={viewMode} onChangeMap={setViewMode} onHeightChange={setTopSpace} />
          <ConstructionBar onHeightChange={(h) => setBuildHeight(h)} onOpenScripts={() => setScriptsOpen(true)} />
        </main>
        <RightDrawer game={game} open={drawerOpen} setOpen={setDrawerOpen} bottomSpace={16 + buildHeight} topSpace={topSpace} />
      </div>
      {scriptsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setScriptsOpen(false); }}>
          <div style={{ width: '82%', height: '72%', background: 'rgba(13,19,36,0.96)', border: '1px solid #1c2541', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 10, borderBottom: '1px solid #1c2541', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#e3ecff', fontWeight: 700 }}>Scripts</div>
              <button onClick={() => setScriptsOpen(false)} style={{ ...panelBtnStyle, background: '#102038' }}>Fechar</button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ScriptsPanel game={game} />
            </div>
          </div>
        </div>
      )}
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

function TopHUD({ game, viewMode, onChangeMap, onHeightChange }: { game: Game | null; viewMode: ViewMode; onChangeMap: (m: ViewMode) => void; onHeightChange?: (h: number) => void }) {
  const [hud, setHud] = useState({
    sectorName: '—',
    iron: 0,
    silicon: 0,
    uranium: 0,
  });
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const sec = game?.getSectorInfo();
      const res = game?.getResources();
      setHud({
        sectorName: sec?.name ?? '—',
        iron: Number(res?.iron?.toFixed?.(1) ?? 0),
        silicon: Number(res?.silicon?.toFixed?.(1) ?? 0),
        uranium: Number(res?.uranium?.toFixed?.(1) ?? 0),
      });
    }, 500);
    return () => clearInterval(id);
  }, [game]);

  useEffect(() => {
    function report() {
      const h = barRef.current?.getBoundingClientRect().height || 0;
      onHeightChange && onHeightChange(10 + h); // 10px top gap
    }
    report();
    const ResObs = (window as any).ResizeObserver as any | undefined;
    let ro: any = null;
    if (ResObs) {
      ro = new ResObs(() => report());
      if (barRef.current) ro.observe(barRef.current);
    } else {
      window.addEventListener('resize', report);
    }
    return () => { if (ro) ro.disconnect(); else window.removeEventListener('resize', report); };
  }, [onHeightChange]);

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, right: 10, pointerEvents: 'auto', zIndex: 6 }}>
      <div ref={barRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'rgba(13,19,36,0.72)', border: '1px solid #1c2541', borderRadius: 10, padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: '#9bb0d9', fontSize: 12 }}>Setor</div>
          <div style={{ color: '#e3ecff', fontWeight: 700 }}>{hud.sectorName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1324', border: '1px solid #1c2541', borderRadius: 8, padding: 2 }}>
          <button onClick={() => onChangeMap(viewMode==='sector'?'play':'sector')} style={{ ...switchBtn(viewMode==='sector') }}>Mapa do Setor</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(10,16,30,0.5)', border: '1px solid #1c2541', borderRadius: 8, padding: '6px 10px' }}>
          <span style={{ color: '#9bb0d9' }}>Minérios</span>
          <span title="Ferro (Fe)" style={{ color: '#9bb0d9' }}>Fe <strong style={{ color: '#e3ecff' }}>{hud.iron}</strong></span>
          <span title="Silício (Si)" style={{ color: '#9bb0d9' }}>Si <strong style={{ color: '#e3ecff' }}>{hud.silicon}</strong></span>
          <span title="Urânio (U)" style={{ color: '#9bb0d9' }}>U <strong style={{ color: '#e3ecff' }}>{hud.uranium}</strong></span>
        </div>
      </div>
    </div>
  );
}

function RightDrawer({ game, open, setOpen, bottomSpace, topSpace }: { game: Game | null; open: boolean; setOpen: (v: boolean) => void; bottomSpace: number; topSpace: number }) {
  const [fleet, setFleet] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [asteroidsByCluster, setAsteroidsByCluster] = useState<Record<string, any[]>>({});
  const [following, setFollowing] = useState<boolean>(false);
  const [tab, setTab] = useState<'naves' | 'clusters'>('naves');
  const [shipStatus, setShipStatus] = useState<any | null>(null);
  const [miningStatus, setMiningStatus] = useState<any | null>(null);
  const [workerStatus, setWorkerStatus] = useState<ReturnType<Game['getWorkerStatus']> | null>(null);
  const [resources, setResources] = useState<{ iron: number; silicon: number; uranium: number }>({ iron: 0, silicon: 0, uranium: 0 });

  useEffect(() => {
    if (!game) {
      setFleet([]);
      setClusters([]);
      setExpanded({});
      setAsteroidsByCluster({});
      setFollowing(false);
      setShipStatus(null);
      setMiningStatus(null);
      setWorkerStatus(null);
      setResources({ iron: 0, silicon: 0, uranium: 0 });
      return;
    }
    const id = setInterval(() => {
      setFleet(game.getFleet() || []);
      const all = game.getClustersOverview(true) || [];
      setClusters(all.filter((c: any) => (c.discovered || 0) > 0));
      setFollowing(!!game.isFollowingShip?.());
      setShipStatus(game.getShipStatus());
      setMiningStatus(game.getMiningStatus());
      setWorkerStatus(game.getWorkerStatus());
      const res = game.getResources();
      setResources({
        iron: Number(res.iron?.toFixed?.(1) ?? res.iron ?? 0),
        silicon: Number(res.silicon?.toFixed?.(1) ?? res.silicon ?? 0),
        uranium: Number(res.uranium?.toFixed?.(1) ?? res.uranium ?? 0),
      });
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
  const cardStyle: React.CSSProperties = { background: 'rgba(9,15,28,0.72)', border: '1px solid #1c2541', borderRadius: 12, padding: '10px 12px', marginBottom: 10 };
  const sectionTitle: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8fa2cd', marginBottom: 6 };
  const workerStateColors: Record<string, string> = {
    idle: '#4b5563',
    starting: '#38bdf8',
    running: '#34d399',
    completed: '#a855f7',
    error: '#f87171',
    stopped: '#fbbf24',
  };
  const workerStateLabels: Record<string, string> = {
    idle: 'Parado',
    starting: 'Inicializando',
    running: 'Executando',
    completed: 'Concluído',
    error: 'Erro',
    stopped: 'Interrompido',
  };
  const scriptState = workerStatus?.state ?? 'idle';
  const workerBadgeColor = workerStateColors[scriptState] ?? '#4b5563';
  const workerBadgeLabel = workerStateLabels[scriptState] ?? 'Estado';
  const scriptName = workerStatus?.scriptName ?? 'Nenhum script ativo';
  const runtimeSeconds = (() => {
    if (!workerStatus?.startedAt) return null;
    const endRef = workerStatus.finishedAt && scriptState !== 'running' ? workerStatus.finishedAt : Date.now();
    return Math.max(0, Math.round((endRef - workerStatus.startedAt) / 1000));
  })();
  const logEntries = [...(workerStatus?.logs ?? [])].slice(-8).reverse();
  const miningState = miningStatus?.state ?? 'idle';
  const miningStateLabels: Record<string, string> = {
    idle: 'Ocioso',
    approaching: 'Aproximando',
    mining: 'Extraindo',
  };
  const miningStateColors: Record<string, string> = {
    idle: '#4b5563',
    approaching: '#38bdf8',
    mining: '#fbbf24',
  };
  const miningBadgeColor = miningStateColors[miningState] ?? '#4b5563';
  const miningBadgeLabel = miningStateLabels[miningState] ?? 'Ocioso';

  return (
    <div style={{ position: 'absolute', top: topSpace + 6, right: 10, height: `calc(80vh - ${Math.max(topSpace, 0) + 24}px)`, width: open ? 360 : 44, zIndex: 5, pointerEvents: 'auto' }}>
      <div style={{ position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%)', zIndex: 9 }}>
        <button
          onClick={() => setOpen(!open)}
          title={open ? 'Recolher Scanner' : 'Abrir Scanner'}
          style={{
            ...panelBtnStyle,
            width: 28,
            height: 28,
            padding: 0,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
          }}
        >{open ? '›' : '‹'}</button>
      </div>
      <div style={{ height: '100%', background: 'rgba(13,19,36,0.88)', border: '1px solid #1c2541', borderRadius: 12, padding: 10, color: '#d3e0ff', overflow: 'hidden', transition: 'width 160ms', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
        {open ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 'none', paddingBottom: 4 }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={sectionTitle}>Operação HAL</div>
                  <span style={{ background: workerBadgeColor, color: '#0b1120', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{workerBadgeLabel}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{scriptName}</div>
                <div style={{ fontSize: 12, opacity: 0.8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div>Iniciado: {workerStatus?.startedAt ? new Date(workerStatus.startedAt).toLocaleTimeString() : '—'}</div>
                  <div>Duração: {runtimeSeconds != null ? `${runtimeSeconds}s` : '—'}</div>
                </div>
                {workerStatus?.lastError && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#fca5a5' }}>Erro: {workerStatus.lastError}</div>
                )}
                {workerStatus?.lastMessage && scriptState !== 'error' && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#9bb0d9' }}>Último evento: {workerStatus.lastMessage}</div>
                )}
              </div>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={sectionTitle}>Mineração</div>
                  <span style={{ background: miningBadgeColor, color: '#0b1120', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{miningBadgeLabel}</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, lineHeight: '18px' }}>
                  {miningStatus?.targetId ? (
                    <>
                      <div>Alvo: {miningStatus.targetId} ({miningStatus.resource || 'desconhecido'})</div>
                      <div>Distância: {miningStatus.distance != null ? `${miningStatus.distance.toFixed?.(0)} km` : '—'}</div>
                      <div>Restante: {miningStatus.remaining != null ? `${miningStatus.remaining.toFixed?.(1)} t` : '—'} @ {miningStatus.rate ?? '?'} t/s</div>
                    </>
                  ) : (
                    <div>Nenhum alvo selecionado.</div>
                  )}
                </div>
              </div>
              <div style={cardStyle}>
                <div style={sectionTitle}>Nave Mãe</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{shipStatus ? 'USS [Nome da Nave]' : 'Nave não carregada'}</div>
                <div style={{ fontSize: 12, opacity: 0.85, lineHeight: '18px' }}>
                  <div>Posição: {shipStatus ? `${shipStatus.position.x.toFixed(1)}, ${shipStatus.position.y.toFixed(1)}, ${shipStatus.position.z.toFixed(1)} km` : '—'}</div>
                  <div>Destino: {shipStatus?.destination ? `${shipStatus.destination.x}, ${shipStatus.destination.y}, ${shipStatus.destination.z}` : '—'}</div>
                  <div>Velocidade: {shipStatus ? `${shipStatus.speed.toFixed(2)} km/s` : '—'}</div>
                  <div>Inventário: Fe {resources.iron} · Si {resources.silicon} · U {resources.uranium}</div>
                </div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 12 }}>
                <div style={sectionTitle}>Logs do Script</div>
                <div style={{ background: 'rgba(6,10,20,0.65)', border: '1px solid #1c2541', borderRadius: 8, padding: '6px 8px', maxHeight: 150, overflowY: 'auto', fontSize: 12 }}>
                  {logEntries.length === 0 ? (
                    <div style={{ opacity: 0.6 }}>Sem logs ainda. Console.log do worker aparecerá aqui.</div>
                  ) : (
                    logEntries.map((log) => {
                      const rel = workerStatus?.startedAt ? Math.max(0, Math.round((log.timestamp - workerStatus.startedAt) / 1000)) : null;
                      const label = rel != null ? `+${rel}s` : new Date(log.timestamp).toLocaleTimeString();
                      const color = log.level === 'error' ? '#fca5a5' : log.level === 'warn' ? '#fcd34d' : '#dbeafe';
                      return (
                        <div key={`${log.id}-${log.timestamp}`} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: '#8fa2cd', minWidth: 48 }}>{label}</span>
                          <span style={{ color, flex: 1 }}>{log.message}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <button onClick={() => setTab('naves')} style={{ ...switchBtn(tab==='naves'), border: '1px solid #1c2541', borderRadius: 8, flex: 1 }}>Naves</button>
                <button onClick={() => setTab('clusters')} style={{ ...switchBtn(tab==='clusters'), border: '1px solid #1c2541', borderRadius: 8, flex: 1 }}>Clusters</button>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {tab === 'naves' && (
                  <div>
                    {fleet.map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1c2541' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>Pos: {s.position.x.toFixed(0)}, {s.position.y.toFixed(0)}, {s.position.z.toFixed(0)} km</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => game?.focusCameraOn && game.focusCameraOn({ x: s.position.x, y: s.position.y, z: s.position.z }, 80)} style={{ ...smallBtn, padding: '6px 8px' }}>Focar</button>
                          <button
                            onClick={() => {
                              if (!game?.setFollowShip) return;
                              const next = !following;
                              game.setFollowShip(next);
                              setFollowing(next);
                            }}
                            style={{ ...smallBtn, padding: '6px 8px', background: following ? '#26446e' : '#1a2a4a' }}
                          >{following ? 'Seguindo' : 'Seguir'}</button>
                        </div>
                      </div>
                    ))}
                    {fleet.length === 0 && (
                      <div style={{ fontSize: 12, opacity: 0.75 }}>Nenhuma nave detectada.</div>
                    )}
                  </div>
                )}
                {tab === 'clusters' && (
                  <div>
                    {clusters.length === 0 && (
                      <div style={{ fontSize: 12, opacity: 0.75 }}>Nenhum cluster descoberto ainda. Aproxime-se e use o Com‑Link “Escaneie o setor”.</div>
                    )}
                    {clusters.map((c) => (
                      <div key={c.id} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div onClick={() => expandCluster(c.id)} style={{ cursor: 'pointer' }}>
                            <span style={{ fontWeight: 600 }}>{c.id}</span> <span style={{ opacity: 0.8 }}>({c.type})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ opacity: 0.8 }}>Descobertos: {c.discovered}</div>
                            <button onClick={() => game?.focusCameraOn && game.focusCameraOn(c.center, Math.max(120, Math.min(600, c.radius * 1.5)))} style={{ ...smallBtn, padding: '4px 6px', fontSize: 12 }}>Focar</button>
                            <button onClick={() => game?.moveTo && game.moveTo(c.center)} style={{ ...smallBtn, padding: '4px 6px', fontSize: 12 }}>Ir</button>
                          </div>
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
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Dica: use o Com‑Link “Escaneie o setor”.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#9bb0d9' }}>Operações</div>
        )}
      </div>
    </div>
  );
}

type BuildCategory = 'base' | 'oxygen' | 'power' | 'industry' | 'defense';
type BuildItem = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost?: { Fe?: number; Si?: number; U?: number };
  power?: { delta?: number };
};

function ConstructionBar({ onHeightChange, onOpenScripts }: { onHeightChange: (height: number) => void; onOpenScripts: () => void }) {
  const [activeCat, setActiveCat] = useState<BuildCategory | null>(null);
  const [activeItem, setActiveItem] = useState<BuildItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  const categories: { id: BuildCategory; label: string; icon: string }[] = [
    { id: 'base', label: 'Base', icon: '🏗️' },
    { id: 'oxygen', label: 'Oxigênio', icon: '🫁' },
    { id: 'power', label: 'Energia', icon: '⚡' },
    { id: 'industry', label: 'Indústria', icon: '🧰' },
    { id: 'defense', label: 'Defesa', icon: '🛡️' },
  ];

  const itemsByCat: Record<BuildCategory, BuildItem[]> = {
    base: [
      { id: 'foundation', name: 'Plataforma', icon: '🧱', desc: 'Base para construção de estruturas.', cost: { Fe: 20, Si: 5 } },
    ],
    oxygen: [
      { id: 'o2_generator', name: 'Gerador de O2', icon: '🫧', desc: 'Converte água em oxigênio.', cost: { Fe: 10, Si: 15 }, power: { delta: -4 } },
    ],
    power: [
      { id: 'solar', name: 'Painel Solar', icon: '☀️', desc: 'Gera energia a partir de luz solar.', cost: { Fe: 8, Si: 12 }, power: { delta: +5 } },
      { id: 'battery', name: 'Bateria', icon: '🔋', desc: 'Armazena energia excedente.', cost: { Fe: 6, Si: 8 }, power: { delta: 0 } },
    ],
    industry: [
      { id: 'refinery', name: 'Refinaria', icon: '⚙️', desc: 'Refina minérios para componentes.', cost: { Fe: 25, Si: 15 }, power: { delta: -6 } },
    ],
    defense: [
      { id: 'turret', name: 'Torre', icon: '🛡️', desc: 'Defesa básica do perímetro.', cost: { Fe: 18, Si: 6, U: 2 }, power: { delta: -2 } },
    ],
  };

  function placeSoon(item: BuildItem) {
    setNotice(`${item.name}: colocação em breve (protótipo).`);
    setTimeout(() => setNotice(null), 1800);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeItem) setActiveItem(null); else setActiveCat(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeItem]);

  useEffect(() => {
    function report() {
      const barH = barRef.current?.getBoundingClientRect().height || 0;
      const palH = activeCat ? (paletteRef.current?.getBoundingClientRect().height || 0) + 12 : 0;
      onHeightChange(barH + palH);
    }
    report();
    const ResObs = (window as any).ResizeObserver as any | undefined;
    let ro: any = null;
    if (ResObs) {
      ro = new ResObs(() => report());
      if (paletteRef.current) ro.observe(paletteRef.current);
      if (barRef.current) ro.observe(barRef.current);
    } else {
      window.addEventListener('resize', report);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', report);
    };
  }, [activeCat, activeItem, onHeightChange]);

  const catBarHeight = 56;
  const card: React.CSSProperties = { background: 'rgba(13,19,36,0.72)', border: '1px solid #1c2541', borderRadius: 12, padding: 8 };
  const catBtn = (active: boolean): React.CSSProperties => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 72, padding: 6, borderRadius: 10, border: '1px solid #1c2541', background: active ? '#121a31' : '#0b1120', color: active ? '#e3ecff' : '#9bb0d9', cursor: 'pointer' });
  const itemBtn = (selected: boolean): React.CSSProperties => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 8, borderRadius: 10, border: selected ? '1px solid #3b5591' : '1px solid #1c2541', background: selected ? 'rgba(23,34,63,0.6)' : 'rgba(11,17,32,0.8)', color: '#d3e0ff', cursor: 'pointer', width: 118 });
  const iconBox: React.CSSProperties = { width: 46, height: 46, borderRadius: 8, background: '#122039', border: '1px solid #24345a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9bb0d9', fontSize: 20 };

  const currentItems = activeCat ? itemsByCat[activeCat] : [];

  return (
    <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, pointerEvents: 'auto', zIndex: 8 }}>
      {activeCat && (
        <div ref={paletteRef} style={{ position: 'absolute', left: 0, right: 0, bottom: catBarHeight + 12 }}>
          {activeItem && (
            <div style={{ ...card, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ ...iconBox, fontSize: 26 }}>{activeItem.icon}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{activeItem.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{activeItem.desc}</div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    Custo: Fe {activeItem.cost?.Fe ?? 0} · Si {activeItem.cost?.Si ?? 0} · U {activeItem.cost?.U ?? 0}
                    {typeof activeItem.power?.delta === 'number' && (
                      <span> · Energia {activeItem.power!.delta! >= 0 ? `+${activeItem.power!.delta}` : activeItem.power!.delta}</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => placeSoon(activeItem)} style={panelBtnStyle}>Colocar (em breve)</button>
                <button onClick={() => setActiveItem(null)} style={{ ...panelBtnStyle, background: '#102038' }}>Cancelar</button>
              </div>
            </div>
          )}
          <div style={{ ...card }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {currentItems.map((it) => (
                <div key={it.id} style={itemBtn(activeItem?.id === it.id)} onClick={() => setActiveItem(it)} title={it.name}>
                  <div style={iconBox}>{it.icon}</div>
                  <div style={{ fontSize: 13 }}>{it.name}</div>
                </div>
              ))}
              {currentItems.length === 0 && (
                <div style={{ color: '#9bb0d9', fontSize: 12, opacity: 0.8 }}>Sem itens nesta categoria (WIP).</div>
              )}
            </div>
          </div>
          {notice && <div style={{ marginTop: 6, color: '#d3e0ff', fontSize: 13, opacity: 0.9 }}>{notice}</div>}
        </div>
      )}

      <div ref={barRef} style={{ height: catBarHeight, background: 'rgba(13,19,36,0.82)', border: '1px solid #1c2541', borderRadius: 12, padding: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        {categories.map((c) => (
          <button key={c.id} onClick={() => { const next = activeCat === c.id ? null : c.id; setActiveCat(next); setActiveItem(null); }} style={catBtn(activeCat === c.id)} title={c.label}>
            <div style={{ ...iconBox, width: 36, height: 36, fontSize: 18 }}>{c.icon}</div>
            <div style={{ fontSize: 12 }}>{c.label}</div>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={onOpenScripts} style={{ ...panelBtnStyle }}>Scripts</button>
      </div>
    </div>
  );
}
