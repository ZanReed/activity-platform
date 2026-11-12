// =============================================================================
// landingRoutes.ts — Home and JoinClass, lazy without a fallback flash (R5)
// -----------------------------------------------------------------------------
// React.lazy suspends on its first render even when the module is already in
// the browser (import() never resolves synchronously), and React then holds
// the Suspense fallback for ~300 ms. So a plain lazy() Home would show
// "Loading…" on every visit to /, warm cache included, where the static Home
// it replaced painted at once.
//
// Two halves close that:
//   1. main.tsx awaits preloadLandingRoute(location.pathname) before the first
//      render. index.html has already started that chunk's download beside the
//      entry (activity:route-preload), so this usually waits for nothing.
//   2. Once loaded, the lazy() constructor returns a thenable that calls back
//      SYNCHRONOUSLY, so React's lazy initializer sees the module resolved and
//      renders it without suspending.
// An in-app navigation to / before the chunk is loaded still suspends normally
// (react-router keeps the old screen during the transition).
// =============================================================================

import { lazy, type ComponentType } from 'react';
import { LANDING_ROUTES } from './landingPaths';

type RouteModule = { default: ComponentType };

function preloadableRoute(load: () => Promise<RouteModule>) {
    let loaded: RouteModule | undefined;
    let pending: Promise<RouteModule> | undefined;
    const preload = (): Promise<RouteModule> => {
        pending ??= load().then(
            (m) => (loaded = m),
            (err: unknown) => {
                pending = undefined;
                throw err;
            },
        );
        return pending;
    };
    const Component = lazy(() =>
        loaded
            ? // A synchronous thenable: React's lazy initializer reads the
              // module during this same call and never suspends.
              ({ then: (resolve: (m: RouteModule) => void) => resolve(loaded!) } as unknown as Promise<RouteModule>)
            : preload(),
    );
    return { Component, preload };
}

const home = preloadableRoute(() => import('../routes/Home'));
const join = preloadableRoute(() => import('../routes/JoinClass'));

export const Home = home.Component;
export const JoinClass = join.Component;

const PRELOADS: Record<(typeof LANDING_ROUTES)[number]['route'], () => Promise<RouteModule>> = {
    'src/routes/Home.tsx': home.preload,
    'src/routes/JoinClass.tsx': join.preload,
};

/** Resolve once the landing route for this URL (if any) is loaded. Never
 *  rejects: a failed load leaves the route to lazy()'s normal path. */
export function preloadLandingRoute(pathname: string): Promise<void> {
    const hit = LANDING_ROUTES.find((r) => new RegExp(r.path).test(pathname));
    if (!hit) return Promise.resolve();
    return PRELOADS[hit.route]().then(
        () => undefined,
        () => undefined,
    );
}
