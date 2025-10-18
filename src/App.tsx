import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Game, type TerminalInfo } from './game/Game';
import { Chat } from './ui/Chat';
import { HalLLM } from './hal/halLLM';

type ShipSnapshot = ReturnType<Game['getShipStatus']>;

const DEFAULT_SCRIPT = `// patrol.js
// Exemplo de patrulha simples entre dois pontos
// A API disponível no worker: Game.moveTo({x, y, z}), Memory.get/set, sleep(ms)
(async () => {
  const A = { x: 500, y: 0, z: 250 };
  const B = { x: 200, y: 0, z: -200 };
  while (true) {
    await Game.moveTo(A);
    await sleep(3000);
    await Game.moveTo(B);
    await sleep(3000);
  }
})();`;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [pointerLocked, setPointerLocked] = useState<boolean>(false);
  const [nearTerminal, setNearTerminal] = useState<TerminalInfo | null>(null);
  const [activeTerminal, setActiveTerminal] = useState<TerminalInfo | null>(null);
  const [resources, setResources] = useState({ iron: 0, silicon: 0, uranium: 0 });
  const [shipStatus, setShipStatus] = useState<ShipSnapshot | null>(null);
  const [scriptCode] = useState<string>(() => DEFAULT_SCRIPT);

  const envKey = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
  const envModel = (import.meta as any).env?.VITE_OPENAI_MODEL as string | undefined;
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('OPENAI_API_KEY') || envKey || '');
  const [model, setModel] = useState<string>(() => localStorage.getItem('OPENAI_MODEL') || envModel || 'gpt-4o-mini');

  useEffect(() => { localStorage.setItem('OPENAI_API_KEY', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('OPENAI_MODEL', model); }, [model]);

  const closeTerminal = useCallback(() => {
    if (!game) return;
    game.closeTerminalInteraction();
    setActiveTerminal(null);
    setNearTerminal(null);
  }, [game]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current, {
      onPointerLockChange: (locked) => setPointerLocked(locked),
      onTerminalProximity: (info) => setNearTerminal(info),
      onTerminalInteract: (info) => {
        setActiveTerminal(info);
        setNearTerminal(info);
      },
    });
    setGame(g);
    return () => g.dispose();
  }, []);

  const hal = useMemo(() => {
    if (!game) return null;
    const tools = {
      moveTo: async ({ x, y, z }: { x: number; y: number; z: number }) => {
        game.moveTo({ x, y, z });
        return { ok: true } as const;
      },
      getShipStatus: async () => game.getShipStatus(),
      getSectorInfo: async () => game.getSectorInfo(),
      scanSector: async (filter?: { resource?: 'iron' | 'silicon' | 'uranium'; limit?: number }) => game.scanSector(filter),
      getResources: async () => game.getResources(),
      startMining: async (resource: 'iron' | 'silicon' | 'uranium') => game.startMining(resource),
      stopMining: async () => game.stopMining(),
      listScripts: async () => game.listScripts(),
      getScriptCode: async (name: string) => game.getScriptCode(name),
      createScriptRaw: async (name: string, code: string, description?: string) => game.createScript(name, code, description),
      updateScriptRaw: async (name: string, newCode: string) => game.updateScript(name, newCode),
      deleteScript: async (name: string) => game.deleteScript(name),
      runScript: async (name: string) => game.runScriptByName(name),
      performScan: async () => game.performScan(),
      getMiningStatus: async () => game.getMiningStatus(),
    };
    return new HalLLM(tools, { apiKey, model });
  }, [game, apiKey, model]);

  useEffect(() => {
    if (!game) return;
    const id = window.setInterval(() => {
      const res = game.getResources();
      setResources({
        iron: Number(res.iron?.toFixed?.(1) ?? res.iron ?? 0),
        silicon: Number(res.silicon?.toFixed?.(1) ?? res.silicon ?? 0),
        uranium: Number(res.uranium?.toFixed?.(1) ?? res.uranium ?? 0),
      });
      setShipStatus(game.getShipStatus());
    }, 600);
    return () => window.clearInterval(id);
  }, [game]);

  useEffect(() => {
    const onKey = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape' && activeTerminal) {
        evt.stopPropagation();
        closeTerminal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTerminal, closeTerminal]);

  const pointerHintVisible = !pointerLocked && !activeTerminal;

  return (
    <div style={rootStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />

      <TopLeftHUD resources={resources} shipStatus={shipStatus} />

      {pointerHintVisible && (
        <div style={pointerHintStyle}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e3ecff' }}>Clique para assumir o controle</div>
          <div style={{ fontSize: 13, color: '#9bb0d9', marginTop: 6 }}>WASD para caminhar, mouse para olhar. Esc libera o cursor.</div>
        </div>
      )}

      {nearTerminal && !activeTerminal && (
        <div style={terminalPromptStyle}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e3ecff' }}>{nearTerminal.label}</div>
          <div style={{ fontSize: 13, color: '#9bb0d9', marginTop: 6 }}>{nearTerminal.hint}</div>
          <div style={{ fontSize: 12, color: '#7c90bd', marginTop: 4 }}>Pressione E para interagir</div>
        </div>
      )}

      {activeTerminal?.id === 'engineering' && hal && (
        <TerminalOverlay title={activeTerminal.label} onClose={closeTerminal}>
          <div style={{ display: 'flex', gap: 18, flex: 1, minHeight: 0 }}>
            <div style={{ flex: 2, minWidth: 0, height: '100%' }}>
              <Chat hal={hal} defaultScript={scriptCode} />
            </div>
            <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <StatusCard title="Sensores">
                <div>Posição: {formatPosition(shipStatus)}</div>
                <div>Velocidade: {shipStatus ? `${shipStatus.speed.toFixed(2)} km/s` : '—'}</div>
                <div style={{ marginTop: 6 }}>Recursos a bordo:</div>
                <ul style={resourceListStyle}>
                  <li>Fe: {resources.iron.toFixed(1)} t</li>
                  <li>Si: {resources.silicon.toFixed(1)} t</li>
                  <li>U: {resources.uranium.toFixed(1)} t</li>
                </ul>
              </StatusCard>
              <StatusCard title="Configuração HAL">
                <label style={formLabelStyle}>OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={inputStyle}
                />
                <label style={{ ...formLabelStyle, marginTop: 10 }}>Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  style={inputStyle}
                />
                <div style={{ fontSize: 12, color: '#7c90bd', marginTop: 8 }}>
                  Recomendações: gpt-4o-mini (rápido), gpt-4o (mais capaz), o3-mini (raciocínio).
                </div>
              </StatusCard>
            </div>
          </div>
        </TerminalOverlay>
      )}

      {activeTerminal?.id === 'construction' && (
        <TerminalOverlay title={activeTerminal.label} onClose={closeTerminal}>
          <div style={{ padding: 18, color: '#dbe5ff', fontSize: 15, lineHeight: '22px' }}>
            <p style={{ marginTop: 0 }}>
              O terminal de construção ainda está em atualização. Os drones de montagem retornam ao berço às 18h UTC para
              aplicar o patch de firmware. Enquanto isso, mapear novos asteroides na estação de engenharia ajudará a
              priorizar upgrades estruturais.
            </p>
            <p>
              Planeje o layout da nave, defina slots para módulos (propulsão, habitação, docas) e prepare listas de
              materiais conforme a equipe de engenharia descobre depósitos viáveis com HAL.
            </p>
          </div>
        </TerminalOverlay>
      )}
    </div>
  );
}

function TopLeftHUD({ resources, shipStatus }: { resources: { iron: number; silicon: number; uranium: number }; shipStatus: ShipSnapshot | null }) {
  return (
    <div style={hudPanelStyle}>
      <div style={{ fontSize: 14, color: '#9bb0d9' }}>USS Starwatch</div>
      <div style={{ fontSize: 20, color: '#e3ecff', fontWeight: 600 }}>Modo Primeira Pessoa</div>
      <div style={hudLineStyle}>Posição: {formatPosition(shipStatus)}</div>
      <div style={hudLineStyle}>Velocidade: {shipStatus ? `${shipStatus.speed.toFixed(2)} km/s` : '—'}</div>
      <div style={{ ...hudLineStyle, marginTop: 6 }}>Carga</div>
      <div style={hudLineStyle}>Fe {resources.iron.toFixed(1)} t · Si {resources.silicon.toFixed(1)} t · U {resources.uranium.toFixed(1)} t</div>
    </div>
  );
}

function TerminalOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={overlayBackdropStyle}>
      <div style={overlayPanelStyle}>
        <div style={overlayHeaderStyle}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={closeButtonStyle}>Fechar</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={statusCardStyle}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#d3defd', lineHeight: '20px' }}>{children}</div>
    </div>
  );
}

function formatPosition(status: ShipSnapshot | null) {
  if (!status || !status.position) return '—';
  const { x, y, z } = status.position;
  return `${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`;
}

const rootStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: '#02040a',
  overflow: 'hidden',
};

const canvasStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

const pointerHintStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(9,14,26,0.82)',
  border: '1px solid #1c2541',
  borderRadius: 12,
  padding: '14px 26px',
  textAlign: 'center',
  pointerEvents: 'none',
  boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
};

const terminalPromptStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 80,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(13,19,36,0.85)',
  border: '1px solid #24345a',
  borderRadius: 14,
  padding: '14px 24px',
  textAlign: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
  pointerEvents: 'none',
};

const overlayBackdropStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(4,6,12,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
};

const overlayPanelStyle: React.CSSProperties = {
  width: 'min(960px, 92vw)',
  maxHeight: '88vh',
  background: 'rgba(9,14,24,0.96)',
  border: '1px solid #25345a',
  borderRadius: 14,
  boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

const overlayHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '#e3ecff',
};

const closeButtonStyle: React.CSSProperties = {
  background: '#1a2a4a',
  color: '#e3ecff',
  border: '1px solid #264072',
  padding: '6px 12px',
  borderRadius: 8,
  cursor: 'pointer',
};

const statusCardStyle: React.CSSProperties = {
  background: 'rgba(12,18,32,0.75)',
  border: '1px solid #24345a',
  borderRadius: 12,
  padding: 14,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
};

const hudPanelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 18,
  left: 18,
  background: 'rgba(12,18,32,0.72)',
  border: '1px solid #1c2541',
  borderRadius: 12,
  padding: '14px 18px',
  color: '#d3defd',
  pointerEvents: 'none',
  boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
  maxWidth: 320,
  fontSize: 13,
  lineHeight: '20px',
};

const hudLineStyle: React.CSSProperties = {
  color: '#c0d1ff',
};

const resourceListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '6px 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const formLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9bb0d9',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #24345a',
  background: '#0b1120',
  color: '#e3ecff',
};
