import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import './index.css';
import { VIEWER_SHELL_CACHE } from '@activity/viewer';
import {
  installStaleChunkRecovery,
  registerServiceWorker,
  warmAssetCache,
} from './lib/swRegistration';

// Before render: a chunk that 404s after a deploy can fire during the very
// first lazy import, and the listener has to already be attached.
//
// PRODUCTION ONLY, deliberately. The failure it recovers from is a deploy
// artifact — content-hashed filenames replaced under an open tab — and neither
// half of that exists in dev, where modules are served unbundled and unhashed.
// Left ungated it turned a transient dev-server import hiccup into a page
// reload, which is invisible in normal use and looked like "execution context
// destroyed" in the e2e suite.
if (import.meta.env.PROD) {
  installStaleChunkRecovery();
  // The cache name is the viewer's constant, not a fourth copy of the string:
  // vite.config.ts names the same cache for the worker's runtime route, and
  // the SW e2e asserts against this constant, so a drift between them fails
  // the lane instead of silently splitting the cache in two.
  warmAssetCache(VIEWER_SHELL_CACHE);
}
void registerServiceWorker();

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </StrictMode>,
  );
}

// The no-sign-in playtest: `pnpm playtest` (--mode playtest, the LOCAL stack,
// with recording) and `pnpm playtest:replay` (--mode replay, no backend). Its
// boot runs BEFORE the first render so its network wrapper sees the app's first
// request. Every term of the condition is a compile-time constant, so a
// production build folds it to `false`, drops the import and keeps only the
// plain render() — keep the gate in exactly this form
// (scripts/tests/playtest-guards.test.mjs pins it and the built chunks).
if (import.meta.env.DEV && (import.meta.env.MODE === 'playtest' || import.meta.env.MODE === 'replay')) {
  void import('./dev/mountPlaytest')
    .then((m) => m.bootPlaytest())
    .catch((err: unknown) => console.error('[playtest] boot failed', err))
    .finally(render);
} else {
  render();
}
