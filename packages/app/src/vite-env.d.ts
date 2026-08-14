/// <reference types="vite/client" />
// The `virtual:pwa-register` module the SW registration imports (S6 V8), and
// the `vite:preloadError` event the stale-chunk recovery listens for.
/// <reference types="vite-plugin-pwa/client" />

// Augment Vite's ImportMetaEnv with the project-specific variables so
// `import.meta.env.VITE_SUPABASE_URL` is typed `string` instead of
// `string | undefined`. Add new VITE_-prefixed variables here as they
// land.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
