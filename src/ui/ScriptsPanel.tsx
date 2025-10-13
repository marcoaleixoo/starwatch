import React, { useEffect, useMemo, useState } from 'react';
import { MonacoEditor } from './MonacoEditor';
import type { Game } from '../game/Game';

type Props = { game: Game | null };

type ScriptMeta = { name: string; description: string; lastModified: string };

export function ScriptsPanel({ game }: Props) {
  const [scripts, setScripts] = useState<ScriptMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const refresh = async (keepSelection = true) => {
    const list = game ? game.listScripts() : [];
    setScripts(list);
    if (keepSelection && selected) {
      const still = list.find((s: ScriptMeta) => s.name === selected);
      if (!still) {
        setSelected(null);
        setCode('');
      }
    }
  };

  useEffect(() => {
    refresh(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  useEffect(() => {
    (async () => {
      if (!selected) return;
      const c = game ? game.getScriptCode(selected) : null;
      setCode(c || '');
      const meta = scripts.find((s) => s.name === selected);
      setDesc(meta?.description || '');
    })();
  }, [selected, game, scripts]);

  const newScript = async () => {
    const base = 'script';
    let i = 1;
    let name = `${base}_${i}.js`;
    const names = new Set(scripts.map((s) => s.name));
    while (names.has(name)) { i++; name = `${base}_${i}.js`; }
    setSelected(name);
    setCode(`// ${name}\n// Novo script\n(async () => {\n  // Escreva seu código aqui\n})();\n`);
    setDesc('');
  };

  const saveScript = async () => {
    if (!selected) return;
    const exists = scripts.some((s) => s.name === selected);
    const out = exists
      ? game?.updateScript(selected, code)
      : game?.createScript(selected, code, desc);
    if (out?.ok) {
      setStatus('Salvo');
      await refresh(true);
      setTimeout(() => setStatus(''), 1000);
    } else {
      setStatus(`Erro: ${out?.error || 'desconhecido'}`);
    }
  };

  const runScript = async () => {
    if (!selected) return;
    // Save before run to ensure latest code
    await saveScript();
    const out = game?.runScriptByName(selected);
    setStatus(out?.ok ? 'Executando…' : `Erro ao executar: ${out?.error}`);
    setTimeout(() => setStatus(''), 1200);
  };

  const deleteScript = async (name: string) => {
    const ok = confirm(`Excluir ${name}?`);
    if (!ok) return;
    const out = game?.deleteScript(name);
    if (out?.ok) {
      if (selected === name) { setSelected(null); setCode(''); }
      await refresh(false);
    } else {
      setStatus(`Erro ao excluir: ${out?.error}`);
      setTimeout(() => setStatus(''), 1400);
    }
  };

  const sidebar: React.CSSProperties = { width: 180, borderRight: '1px solid #1c2541', background: '#0d1324' };
  const btn: React.CSSProperties = { background: '#1a2a4a', color: '#e3ecff', border: '1px solid #24345a', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' };
  const input: React.CSSProperties = { width: '100%', padding: 6, background: '#0b1120', color: '#e3ecff', border: '1px solid #1c2541', borderRadius: 6 };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ ...sidebar, padding: 8 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button style={btn} onClick={newScript}>Novo</button>
          <button style={{ ...btn, background: '#102038' }} onClick={refresh}>Atualizar</button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Biblioteca</div>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100% - 64px)' }}>
          {scripts.map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '6px 8px', borderRadius: 8, border: '1px solid #1c2541', marginBottom: 6, background: selected === s.name ? '#121a31' : 'transparent', cursor: 'pointer' }}>
              <div style={{ flex: 1 }} onClick={() => setSelected(s.name)}>
                <div style={{ color: '#e3ecff' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#9bb0d9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.description}</div>
              </div>
              <button style={{ ...btn, padding: '4px 8px', background: '#3b1a1a', borderColor: '#5a2424' }} onClick={() => deleteScript(s.name)}>Del</button>
            </div>
          ))}
          {scripts.length === 0 && (
            <div style={{ color: '#9bb0d9', fontSize: 12, opacity: 0.8 }}>Nenhum script ainda.</div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: 8, borderBottom: '1px solid #1c2541', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            value={selected || ''}
            onChange={(e) => setSelected(e.target.value)}
            placeholder="nome do script (ex: patrol.js)"
            style={{ ...input, maxWidth: 260 }}
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="descrição"
            style={{ ...input, flex: 1 }}
          />
          <button style={btn} onClick={saveScript}>Salvar</button>
          <button style={{ ...btn, background: '#274a1a' }} onClick={runScript}>Executar</button>
          {status && <span style={{ color: '#9bb0d9', marginLeft: 8, fontSize: 12 }}>{status}</span>}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <MonacoEditor value={code} language="javascript" onChange={setCode} />
        </div>
      </div>
    </div>
  );
}
