import React, { useEffect, useRef } from 'react';
// ESM API + workers for Vite
import * as monacoNs from 'monaco-editor/esm/vs/editor/editor.api';
// Workers mapping for Vite
// @ts-ignore
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// @ts-ignore
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// @ts-ignore
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// @ts-ignore
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') return new (JsonWorker as any)();
    if (label === 'css') return new (CssWorker as any)();
    if (label === 'html') return new (HtmlWorker as any)();
    if (label === 'typescript' || label === 'javascript') return new (TsWorker as any)();
    return new (EditorWorker as any)();
  },
};

type Props = {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
};

export function MonacoEditor({ value, language = 'javascript', onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monacoNs.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const editor = monacoNs.editor.create(containerRef.current, {
      value,
      language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
    });
    editorRef.current = editor;
    const sub = editor.onDidChangeModelContent(() => {
      const val = editor.getValue();
      onChange?.(val);
    });
    return () => {
      sub.dispose();
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
