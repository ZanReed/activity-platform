import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import { SessionProvider } from './lib/SessionContext';
import RequireAuth from './components/RequireAuth';
import ThemeToggle from './components/ThemeToggle';
import Home from './routes/Home';
import StudentViewer from './routes/StudentViewer';
import JoinClass from './routes/JoinClass';

// =============================================================================
// Route loading tiers (S8 ruling D4) — the entry chunk IS the student shell.
// -----------------------------------------------------------------------------
// Students open a link on a school Chromebook over school Wi-Fi and are the
// audience the perf budget exists to protect. So the two routes a student can
// land on — StudentViewer and Home — are imported STATICALLY above, which makes
// the built entry chunk exactly what a student downloads before first paint:
// one JS fetch, no serialized second round-trip for the code that renders the
// worksheet. That equivalence is what `scripts/check-perf-budget.mjs` measures;
// if the viewer were lazy, the shell cap would be guarding a router skeleton no
// real user journey corresponds to.
//
// Everything below is lazy. Teacher surfaces (editor, dashboards, print) carry
// Tiptap and the authoring UI and are reached only after a deliberate,
// authenticated navigation. Dev routes are additionally DEV-gated, so they are
// dead expressions in a production build; being lazy as well means a stray
// side-effectful import can never quietly pin them into the entry chunk.
//
//        entry chunk (student shell)          lazy chunks (on navigation)
//        ┌───────────────────────────┐        ┌──────────────────────────┐
//        │ router · SessionProvider  │        │ ActivityEditor (Tiptap)  │
//        │ StudentViewer · Home      │  ───▶  │ Activities · Classes     │
//        │ viewer eager block tier   │        │ Analytics                │
//        │ ThemeToggle               │        │ ActivityPrint · Privacy  │
//        └───────────────────────────┘        │ /dev/* (DEV only)        │
//                                             └──────────────────────────┘
//
// The registry's own eager|lazy tier (ruling D16) sits INSIDE the entry chunk,
// which is why growing the eager tier shows up against the shell cap
// automatically — no second policy to keep in sync.
// =============================================================================

const Activities = lazy(() => import('./routes/Activities'));
const Classes = lazy(() => import('./routes/Classes'));
const ActivityEditor = lazy(() => import('./routes/ActivityEditor'));
const ActivityPrint = lazy(() => import('./routes/ActivityPrint'));
// The Submissions dashboard died at S9 Drop 3 — Phase 2.6 manual grading is
// RETIRED (OV-5); the parked teacher-grading slice owns any successor UI.
const ActivityAnalytics = lazy(() => import('./routes/ActivityAnalytics'));
// Lazy like its sibling: the teacher grading surface must not weigh on the
// student shell's entry chunk (the S8 budget).
const ActivityResponses = lazy(() => import('./routes/ActivityResponses'));
const Privacy = lazy(() => import('./routes/Privacy'));

const Playground = lazy(() => import('./routes/Playground'));
const DevFoldableColumns = lazy(() => import('./routes/DevFoldableColumns'));
const DevCalculator = lazy(() => import('./routes/DevCalculator'));
const DevGraphQuestion = lazy(() => import('./routes/DevGraphQuestion'));
const DevNumberLine = lazy(() => import('./routes/DevNumberLine'));
const DevDataPlot = lazy(() => import('./routes/DevDataPlot'));
const DevConfigDrawer = lazy(() => import('./routes/DevConfigDrawer'));
const DevViewer = lazy(() => import('./routes/DevViewer'));

/**
 * Shown while a lazy route chunk is in flight.
 *
 * Deliberately the app's existing loading vocabulary ("Loading…" in a
 * `role="status"` region), not a new spinner: on a fast connection this is a
 * flash, and on a slow one it should read like every other wait in the product.
 * A chunk that 404s after a deploy does NOT land here — `installStaleChunkRecovery`
 * (main.tsx) catches that and prompts a reload.
 *
 * `data-route-fallback` exists because the text alone is ambiguous: several
 * routes render their own "Loading…" while fetching data, so a test asserting
 * on the string cannot tell "the chunk is still downloading" from "the chunk
 * mounted fine and the route is waiting on the network". The perf lane's
 * route-mount smoke needs exactly that distinction, and it found this the hard
 * way — ActivityPrint's own loading text failed the smoke on a working chunk.
 */
function RouteFallback() {
    return (
        <div className="p-8 text-muted" role="status" data-route-fallback="">
        Loading…
        </div>
    );
}

export default function App() {
    return (
        <SessionProvider>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/" element={<Home />} />
        {/* Public by design (D7): auth screens and student fineprint link here. */}
        <Route path="/privacy" element={<Privacy />} />
        {/* Student-facing viewer. Deliberately NOT wrapped in RequireAuth: the
            route itself shows the pre-auth screen (ruling 3.2A) so a signed-out
            student sees WHAT they were sent before being asked who they are. */}
        <Route path="/a/:activityId" element={<StudentViewer />} />
        {/* The shareable join deep link (identity slice B12). Static import —
            it is a student first-paint surface like StudentViewer/Home, and
            it shares their chunk anyway (same shell components). Not
            RequireAuth: the route runs its own gate (same 3.2A shape). */}
        <Route path="/join/:code" element={<JoinClass />} />
        <Route
        path="/activities"
        element={
            <RequireAuth>
            <Activities />
            </RequireAuth>
        }
        />
        <Route
        path="/classes"
        element={
            <RequireAuth>
            <Classes />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id"
        element={
            <RequireAuth>
            <ActivityEditor />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id/print"
        element={
            <RequireAuth>
            <ActivityPrint />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id/analytics"
        element={
            <RequireAuth>
            <ActivityAnalytics />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id/responses"
        element={
            <RequireAuth>
            <ActivityResponses />
            </RequireAuth>
        }
        />
        {import.meta.env.DEV && (
            <Route path="/playground" element={<Playground />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/foldable-columns" element={<DevFoldableColumns />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/calculator" element={<DevCalculator />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/graph-question" element={<DevGraphQuestion />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/number-line" element={<DevNumberLine />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/data-plot" element={<DevDataPlot />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/config-drawer" element={<DevConfigDrawer />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/viewer" element={<DevViewer />} />
        )}
        </Routes>
        </Suspense>
        <ThemeToggle />
        </SessionProvider>
    );
}
