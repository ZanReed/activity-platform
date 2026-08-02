import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Tailwind v4 ships as a Vite plugin — no PostCSS config, no tailwind.config.js.
// All theme customization (if any) goes in src/index.css via @theme directives.
//
// The @/ alias resolves to src/. Workspace deps (@activity/schema,
// @activity/renderer) resolve via pnpm's symlinks — no Vite config needed
// for those, just package.json dependencies entries with workspace:*.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // ------------------------------------------------------------------
    // Service worker (S6 V8, rulings S6-5 / S6-11).
    //
    // PRECACHE IS THE NAVIGATION DOCUMENT AND NOTHING ELSE. The obvious
    // reading of "shell-only precache" is a glob over the entry chunks, but
    // this app's entry is ~3 MB (the editor and the viewer share one bundle
    // today), and a glob wide enough to catch it also catches sibling chunks
    // nobody on a given route needs. Every asset filename is content-hashed
    // and therefore immutable, so CacheFirst at runtime gives the same offline
    // result while downloading exactly what the student actually opened —
    // which is what S6-11 was protecting. A student who has used the viewer
    // once can reopen it offline; nobody pays for the editor they never see.
    //
    // THE API IS DELIBERATELY NOT CACHED HERE. The Cache API keys by URL and
    // ignores auth, and this platform serves a per-student SHUFFLED document
    // from one URL — a cached response is the wrong student's paper. The
    // document a student needs offline is kept by the page instead, per user,
    // in the store's document cache (documentCache.ts), where the sign-out
    // purge and the boot sweep already reach it.
    // ------------------------------------------------------------------
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registered explicitly in main.tsx
      // A worker in dev diverges from the generated one, so specs that pass
      // against it prove nothing about what ships (V9 runs the preview build).
      devOptions: { enabled: false },
      manifest: false, // not an installable PWA; this is offline resilience
      workbox: {
        globPatterns: ['index.html'],
        navigateFallback: 'index.html',
        // Never answer a function call from the cache — see the note above.
        navigateFallbackDenylist: [/^\/functions\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Hashed build assets: the name IS the version, so a hit can never
            // be stale and a miss is a genuinely new file.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin === true && url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'activity-viewer:cache:shell',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
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
