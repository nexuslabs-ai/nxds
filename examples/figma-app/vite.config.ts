import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nxdsAppearance } from './nxds.vite';

export default defineConfig({ plugins: [react(), tailwindcss(), nxdsAppearance()],
  resolve: {
    alias: { '@': '/src' },
  } });
