/// <reference types="vite/client" />

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
