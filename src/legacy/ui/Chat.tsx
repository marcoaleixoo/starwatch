import React, { useEffect, useRef, useState } from 'react';
import type { HalLLM, ChatMessage } from '../hal/halLLM';

type Props = {
  hal: HalLLM;
  defaultScript: string;
  onRunScript?: (name: string) => void; // kept for compatibility
};

export function Chat({ hal, defaultScript }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) => (prev.length === 0 ? [hal.greeting()] : prev));
  }, [hal]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    // Otimista: mostra já a fala do usuário
    setMessages((m) => [...m, { role: 'user', content: text }]);
    try {
      const reply = await hal.send(text, 'patrol.js', defaultScript);
      // Substitui pelo histórico real do HAL (inclui tool cards)
      setMessages(hal.getHistory());
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Falha na IA (verifique a API key e modelo).' },
      ]);
      console.error(e);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, whiteSpace: 'pre-wrap' }}>
            {m.role !== 'tool' ? (
              <>
                <div style={{ color: m.role === 'user' ? '#9bb0d9' : '#e3ecff' }}>
                  <strong>{m.role === 'user' ? 'Comandante' : 'HAL'}</strong>
                </div>
                <div>{m.content}</div>
              </>
            ) : (
              <div style={toolCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: '#122039', border: '1px solid #24345a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9bb0d9', fontSize: 12 }}>🛠️</div>
                  <div style={{ fontWeight: 700, color: '#e3ecff' }}>{m.meta?.name || 'tool'}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Input</div>
                  <pre style={{ ...preBox, width: '100%' }}>{JSON.stringify(m.meta?.input ?? {}, null, 2)}</pre>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Output</div>
                  <pre style={{ ...preBox, width: '100%' }}>{JSON.stringify(m.meta?.output ?? {}, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1c2541', padding: 8, boxSizing: 'border-box', width: '100%' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Digite um comando para HAL"
          style={{ width: '100%', maxWidth: '100%', display: 'block', height: 70, resize: 'none', background: '#0b1120', color: '#e3ecff', border: '1px solid #1c2541', borderRadius: 6, padding: 8, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', marginTop: 6, gap: 8, width: '100%' }}>
          <button onClick={send} style={btnStyle}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: '#1a2a4a',
  color: '#e3ecff',
  border: '1px solid #24345a',
  padding: '8px 12px',
  borderRadius: 6,
  cursor: 'pointer',
};

const toolCardStyle: React.CSSProperties = {
  background: 'rgba(26,42,74,0.65)',
  border: '1px solid #24345a',
  borderRadius: 10,
  padding: 10,
  overflow: 'hidden',
  boxSizing: 'border-box',
};

const preBox: React.CSSProperties = {
  margin: 0,
  padding: 8,
  background: '#0b1120',
  color: '#d3e0ff',
  border: '1px solid #1c2541',
  borderRadius: 6,
  maxHeight: 160,
  overflow: 'auto',
  fontSize: 12,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  display: 'block',
};
