// =============================================================================
// landingPaths.ts — the lazy landing routes and the URLs that land on them
// (shell-size review R5, 2026-11-13)
// -----------------------------------------------------------------------------
// ONE list, read in three places, so they cannot disagree:
//   - vite.config.ts → activity:route-preload writes index.html's preload
//     script from it (the route chunk downloads beside the entry);
//   - lib/landingRoutes.ts waits for the matching route before the first
//     render, so React.lazy never shows its fallback on a landing URL;
//   - scripts/check-perf-budget.mjs reads it (as text) to check the built map.
// Pure data, no imports: vite.config.ts loads this file in Node.
// =============================================================================

export const LANDING_ROUTES = [
  { route: 'src/routes/Home.tsx', path: '^/$' },
  { route: 'src/routes/JoinClass.tsx', path: '^/join/' },
] as const;
