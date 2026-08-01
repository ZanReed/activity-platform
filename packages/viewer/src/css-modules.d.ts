// =============================================================================
// css-modules.d.ts — side-effect CSS imports are legal here
// -----------------------------------------------------------------------------
// typography/fonts.ts dynamically imports @fontsource stylesheets for their
// side effect (registering @font-face rules). TypeScript has no built-in
// notion of a CSS module, and this package deliberately does not pull in
// vite/client types — the viewer is a library, and its server-side modules are
// bundled for Deno where no Vite globals exist. Declaring exactly the shape we
// use keeps the rest of that ambient surface out.
// =============================================================================

declare module '*.css' {
  const content: unknown;
  export default content;
}
