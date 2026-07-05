import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Tailwind v4 ships as a Vite plugin — no PostCSS config, no tailwind.config.js.
// All theme customization (if any) goes in src/index.css via @theme directives.
//
// The @/ alias resolves to src/. Workspace deps (@activity/schema,
// @activity/renderer) resolve via pnpm's symlinks — no Vite config needed
// for those, just package.json dependencies entries with workspace:*.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Default 5173 (the OAuth Site URL); a PORT env var overrides so a second
  // dev server (e.g. an agent-session preview) can run beside a manual one.
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: Boolean(process.env.PORT),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
