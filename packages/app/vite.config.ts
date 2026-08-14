import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// ------------------------------------------------------------------
// MathLive fonts, self-hosted in the app bundle (2026-08-14, D-13 station).
//
// graph-kit's mathlive-setup.ts derives the fonts URL as a SIBLING of its own
// chunk: `new URL('mathlive-fonts/v<ver>/', import.meta.url)`. That logic was
// written for the R2-hosted kit, where the fonts really were uploaded next to
// it. Post-S9 the kit is app-bundled, so on the production origin (https, not
// localhost) the derived path is `<origin>/assets/mathlive-fonts/v<ver>/` —
// which did not exist in dist. Every math field a student opened on the
// deployed app 404'd its glyph fonts and fell back to system glyphs. Dev never
// showed it (localhost takes the CDN branch), and the D-13a r2.dev grep never
// caught it (the bad URL isn't r2.dev).
//
// This plugin makes the derived path true again: it copies the installed
// mathlive's woff2 files to dist/assets/mathlive-fonts/v<version>/ at build
// close. MA-D7's rationale carries over unchanged — no CDN on the student
// path, where a school firewall blocking jsDelivr would leave equations in
// fallback glyphs. The SW's existing /assets/ CacheFirst rule covers the
// fonts automatically; the versioned directory preserves the "name IS the
// version" immutability that rule relies on (font FILEnames aren't hashed,
// but the path is version-pinned).
//
// The version guard below turns mathlive-setup.ts's "MUST stay in step"
// comment into an enforced check (P11): if the installed mathlive's version
// no longer matches the MATHLIVE_VERSION constant, the BUILD fails, instead
// of the copied directory and the derived URL silently diverging.
// ------------------------------------------------------------------
function mathliveFonts(): Plugin {
  return {
    name: 'activity:mathlive-fonts',
    apply: 'build',
    closeBundle() {
      const require = createRequire(
        path.resolve(__dirname, '../graph-kit/package.json'),
      );
      const mathliveDir = path.dirname(require.resolve('mathlive'));
      const installed = (
        JSON.parse(readFileSync(path.join(mathliveDir, 'package.json'), 'utf8')) as {
          version: string;
        }
      ).version;
      const setupSrc = readFileSync(
        path.resolve(__dirname, '../graph-kit/src/mathlive-setup.ts'),
        'utf8',
      );
      const constant = setupSrc.match(/MATHLIVE_VERSION = '([^']+)'/)?.[1];
      if (constant !== installed) {
        throw new Error(
          `mathlive-setup.ts pins MATHLIVE_VERSION '${constant}' but the installed ` +
            `mathlive is ${installed} — bump the constant (and this copy step follows), ` +
            'or the derived fonts URL will point at a directory that does not exist.',
        );
      }
      const fontsSrc = path.join(mathliveDir, 'fonts');
      const fontsDest = path.resolve(
        __dirname,
        `dist/assets/mathlive-fonts/v${installed}`,
      );
      mkdirSync(fontsDest, { recursive: true });
      const files = readdirSync(fontsSrc).filter((f) => f.endsWith('.woff2'));
      if (files.length === 0) {
        throw new Error(`no .woff2 files under ${fontsSrc} — mathlive layout changed?`);
      }
      for (const f of files) {
        copyFileSync(path.join(fontsSrc, f), path.join(fontsDest, f));
      }
      this.info(`copied ${files.length} MathLive fonts -> assets/mathlive-fonts/v${installed}/`);
    },
  };
}

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
    mathliveFonts(),
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
              // THE OFFLINE-REOPEN FIX (S9 Drop 5, D-9). Static hosts send
              // `Vary: Origin` on assets (vite preview does; CDNs can), and
              // Cache.match HONORS Vary — so a parse-time <script type=
              // module>/<link> request, whose Origin-header shape differs
              // from the stored key's, MISSES the cache and goes to the dead
              // network. That was the S6 V9 mystery ("fetch() 200s while
              // parse-time dies with ERR_FAILED"): page-script fetch happens
              // to match the stored shape; parse-time requests don't. These
              // files are content-hashed and immutable — the hash IS the
              // identity — so Vary carries no information here. Proven
              // red→green by the server-stop rows in sw/service-worker.e2e.ts.
              matchOptions: { ignoreVary: true },
            },
          },
        ],
      },
    }),
  ],
  // ------------------------------------------------------------------
  // Build manifest (S8). `scripts/check-perf-budget.mjs` reads
  // dist/.vite/manifest.json to identify the ENTRY chunk and its CSS
  // deterministically, instead of scraping dist/index.html for whatever
  // <script> happens to be there. It also powers the per-chunk attribution
  // in a failed budget's error message: a red budget must say WHAT grew,
  // not merely that something did, or every red becomes an archaeology
  // session and the budget gets raised instead of investigated.
  //
  // The manifest is a build artifact only — it ships in dist/ but nothing
  // at runtime reads it, and the service worker does not precache it.
  // ------------------------------------------------------------------
  build: {
    manifest: true,
  },
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
