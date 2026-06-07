/// <reference types="vite/client" />

// Augment Vite's ImportMetaEnv with the project-specific variables so
// `import.meta.env.VITE_SUPABASE_URL` is typed `string` instead of
// `string | undefined`. Add new VITE_-prefixed variables here as they
// land.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Public base for published activity pages (Cloudflare R2 r2.dev URL or
  // custom domain, no trailing slash). Must match the publish-activity Edge
  // Function's R2_PUBLIC_URL_BASE. Optional: when unset, the editor hides the
  // "View published page" link rather than producing a broken URL.
  readonly VITE_PUBLISHED_URL_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
