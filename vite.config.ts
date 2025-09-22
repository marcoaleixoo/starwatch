import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || ''),
      'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(env.VITE_OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-4o-mini'),
    },
  };
});
