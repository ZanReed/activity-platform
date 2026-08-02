import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import './index.css';
import {
  installStaleChunkRecovery,
  registerServiceWorker,
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
if (import.meta.env.PROD) installStaleChunkRecovery();
void registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <BrowserRouter>
  <App />
  </BrowserRouter>
  </StrictMode>,
);
