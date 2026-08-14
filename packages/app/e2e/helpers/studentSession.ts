// =============================================================================
// e2e/helpers/studentSession.ts — the signed-in student harness (S6 V5)
// -----------------------------------------------------------------------------
// Every e2e spec in this repo until now drove /playground: the editor, no auth,
// no network. The S6 failure matrix cannot be tested that way — its cases ARE
// "a signed-in student on a dying network", and half of them (sign-out purge,
// user switch, queued checks firing) only mean anything with an identity.
//
// Google SSO cannot run in CI, so the harness fakes the two things a real
// sign-in produces and nothing else:
//
//   1. A SESSION, written into the storage key supabase-js reads at startup.
//      The client then behaves exactly as it does for a real student — the app
//      is not modified, and there is no test-only branch in shipped code.
//   2. THE SERVER, via Playwright route interception on the function endpoints.
//      Matched by PATH, not origin, so the harness does not care what
//      VITE_SUPABASE_URL happens to be.
//
// The storage-key derivation is the one supabase-js internal this leans on, so
// it is pinned by a unit test (src/__tests__/supabaseStorageKey.test.ts) that
// writes a session under the derived key and asserts a real client reads it
// back. If supabase-js ever changes the scheme, that test fails with a clear
// reason instead of every student spec mysteriously landing on the sign-in
// screen.
// =============================================================================

import type { Page, Route } from '@playwright/test';
import { CHECK_WIRE_VERSION } from '@activity/viewer';
import { CHECK_ACTIVITY_FUNCTION } from '../../src/lib/edgeFunctions';
import { servedFixtureDocument } from '@activity/viewer/fixtures';

export const E2E_STUDENT_ID = 'dddddddd-0000-4000-8000-00000000e2e1';
export const E2E_OTHER_STUDENT_ID = 'dddddddd-0000-4000-8000-00000000e2e2';
export const E2E_ACTIVITY_ID = 'aaaaaaaa-0000-4000-8000-00000000e2e1';
export const E2E_VERSION_ID = 'bbbbbbbb-0000-4000-8000-00000000e2e1';

/**
 * supabase-js stores its session under `sb-<ref>-auth-token`, where <ref> is
 * the first label of the API hostname. Derived here rather than hard-coded so
 * the harness follows whatever URL the dev server was configured with.
 */
export function supabaseStorageKey(supabaseUrl: string): string {
  const host = new URL(supabaseUrl).hostname;
  const ref = host.split('.')[0] ?? host;
  return `sb-${ref}-auth-token`;
}

/** A stored session shaped like the one a real sign-in leaves behind. */
export function fakeSession(userId: string, expiresInSec = 60 * 60): unknown {
  const nowSec = Math.floor(Date.now() / 1000);
  return {
    access_token: `e2e-access-${userId}`,
    refresh_token: `e2e-refresh-${userId}`,
    token_type: 'bearer',
    // Far enough out that supabase-js never tries to refresh mid-spec — a
    // refresh would hit the network and make specs depend on timing.
    expires_in: expiresInSec,
    expires_at: nowSec + expiresInSec,
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: `${userId}@e2e.invalid`,
      app_metadata: {},
      user_metadata: {},
      created_at: new Date(0).toISOString(),
    },
  };
}

export interface SignInOptions {
  userId?: string;
  /** The app's configured Supabase URL — must match the dev server's env. */
  supabaseUrl?: string;
}

/**
 * Put a session on the page BEFORE any app code runs. addInitScript is the
 * only correct hook: supabase-js reads storage while the module graph is
 * evaluating, so a post-load write would be seen too late (or not at all).
 */
export async function signInAs(
  page: Page,
  options: SignInOptions = {},
): Promise<void> {
  const userId = options.userId ?? E2E_STUDENT_ID;
  const supabaseUrl = options.supabaseUrl ?? E2E_SUPABASE_URL;
  const key = supabaseStorageKey(supabaseUrl);
  const session = fakeSession(userId);
  await page.addInitScript(
    ([storageKey, value]) => {
      window.localStorage.setItem(storageKey as string, value as string);
    },
    [key, JSON.stringify(session)] as const,
  );
}

/** Wipe every trace of a previous student, the way a fresh device would be. */
export async function signOutCompletely(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

/** Must match packages/app/playwright.config.ts's pinned webServer env. */
export const E2E_SUPABASE_URL = 'http://127.0.0.1:54321';

export interface CheckOutcome {
  /** Verdict per item id; anything omitted comes back 'correct'. */
  verdicts?: Record<string, 'correct' | 'incorrect' | 'recorded'>;
  solutions?: Record<string, unknown>;
}

export interface ActivityApiOptions {
  document?: unknown;
  activityId?: string;
  versionId?: string;
  title?: string;
  check?: CheckOutcome;
}

/** Buffer + document keys this student has on the device, newest scan. */
export async function viewerKeys(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Object.keys(window.localStorage).filter((k) =>
      k.startsWith('activity-viewer:'),
    ),
  );
}

/** Seed a previous student's work, the way a crash without sign-out leaves it. */
export async function seedForeignWork(
  page: Page,
  options: {
    userId?: string;
    activityId?: string;
    versionId?: string;
  } = {},
): Promise<string> {
  const userId = options.userId ?? E2E_OTHER_STUDENT_ID;
  const activityId = options.activityId ?? E2E_ACTIVITY_ID;
  const versionId = options.versionId ?? E2E_VERSION_ID;
  const key = `activity-viewer:buffer:${userId}:${activityId}:${versionId}`;
  const blob = JSON.stringify({
    schemaVersion: 1,
    userId,
    activityId,
    versionId,
    responses: {
      blanks: { 'blank-1': 'THEIR ANSWER' },
      choices: {},
      matches: {},
      orderings: {},
      freeText: {},
      graphs: {},
    },
    checked: {},
    // A queued check, so this also covers "never fires under another session".
    pending: { 'sec-1': { fingerprint: 'theirs' } },
    inFlight: {},
  });
  await page.addInitScript(
    ([k, v]) => {
      window.localStorage.setItem(k as string, v as string);
    },
    [key, blob] as const,
  );
  return key;
}

/**
 * Server control surface for one spec. Everything the viewer talks to goes
 * through here, so a spec can make the network fail exactly where it wants —
 * which is the entire point of a failure-matrix harness.
 */
export interface ActivityApi {
  /** Requests seen, newest last. Lets a spec assert "exactly one attempt". */
  readonly checkRequests: unknown[];
  /** Simulate no network: matched requests are aborted, as a dead Wi-Fi does. */
  setOffline(offline: boolean): void;
  /** Make the next check return this status instead of a verdict. */
  failCheckWith(status: number | null): void;
}

export async function stubActivityApi(
  page: Page,
  options: ActivityApiOptions = {},
): Promise<ActivityApi> {
  const activityId = options.activityId ?? E2E_ACTIVITY_ID;
  const versionId = options.versionId ?? E2E_VERSION_ID;
  const title = options.title ?? 'Systems of Equations';
  const document = options.document ?? servedFixtureDocument();

  const state = {
    offline: false,
    failStatus: null as number | null,
    checkRequests: [] as unknown[],
  };

  const abortIfOffline = async (route: Route): Promise<boolean> => {
    if (!state.offline) return false;
    // `abort` makes fetch REJECT, which is what a real transport failure does
    // — and is what both clients translate into their 'offline' error kind. A
    // 500 would take a different branch entirely and prove nothing.
    await route.abort('internetdisconnected');
    return true;
  };

  // Matched by path so the harness is independent of the configured origin.
  await page.route('**/functions/v1/get-activity*', async (route) => {
    if (await abortIfOffline(route)) return;
    const url = new URL(route.request().url());
    const params = url.searchParams;

    // Behave like the real server for an id we do not serve, rather than
    // handing back this activity under any id — V7's "activity unavailable"
    // row needs a stub that can actually say no.
    if (params.get('activity_id') !== activityId) {
      await route.fulfill({ status: 404, json: { error: 'Not found' } });
      return;
    }

    if (params.get('meta') === '1') {
      await route.fulfill({
        json: { title, teacher_name: 'Ms. Okonkwo' },
      });
      return;
    }

    if (params.get('version_id')) {
      await route.fulfill({
        json: { activity: document, title, version: { id: versionId, num: 1 } },
      });
      return;
    }

    await route.fulfill({
      json: { version_id: versionId, version_num: 1, title },
    });
  });

  // A1/P2: the matched path derives from the production constant — a retyped
  // literal here once matched the app's typo instead of catching it (history
  // in src/lib/edgeFunctions.ts).
  await page.route(`**/functions/v1/${CHECK_ACTIVITY_FUNCTION}`, async (route) => {
    if (await abortIfOffline(route)) return;
    const body = route.request().postDataJSON() as {
      sectionId: string;
      responses?: Record<string, Record<string, unknown>>;
    };
    state.checkRequests.push(body);

    if (state.failStatus !== null) {
      await route.fulfill({
        status: state.failStatus,
        json: { error: 'e2e-induced failure' },
      });
      return;
    }

    // Verdict for every id the client actually sent, so the response keys
    // match the request the way the real grader's do.
    const items: Record<string, { verdict: string }> = {};
    for (const category of Object.values(body.responses ?? {})) {
      for (const itemId of Object.keys(category)) {
        items[itemId] = {
          verdict: options.check?.verdicts?.[itemId] ?? 'correct',
        };
      }
    }
    await route.fulfill({
      json: {
        // Imported, never retyped (A16/P2): a hand-copied wire version makes a
        // future bump fail e2e with a confusing symptom instead of a clear one.
        wireVersion: CHECK_WIRE_VERSION,
        sectionId: body.sectionId,
        items,
        solutions: options.check?.solutions ?? {},
      },
    });
  });

  // No get-feedback stub: the function was deleted at S9 Drop 3 (nothing in
  // the viewer ever calls fetchReleasedFeedback — zero call sites), and a
  // stub for a nonexistent endpoint violates P2 silently (eng ruling Q1).

  return {
    get checkRequests() {
      return state.checkRequests;
    },
    setOffline(offline: boolean) {
      state.offline = offline;
    },
    failCheckWith(status: number | null) {
      state.failStatus = status;
    },
  };
}

/** The student route for an activity. */
export function activityUrl(activityId = E2E_ACTIVITY_ID): string {
  return `/a/${activityId}`;
}

// =============================================================================
// Identity-slice harness (B12/E-7; identity e2e rows). The app now reads the
// role from public.users over PostgREST and joins over rpc/join_class —
// neither passes `**/functions/v1/*`, so they get their own stubs. Shapes
// derive from the production wire contract (P2):
//   * role rows mirror SessionContext's `.select('role').maybeSingle()`
//   * join errors carry authContract.json's EXACT strings — the same file the
//     client matcher and migration 0027 use, never retyped
// =============================================================================
import authContract from '../../src/lib/authContract.json' with { type: 'json' };

export const JOIN_WIRE = authContract.joinClassErrors;

export interface IdentityStubOptions {
  /** The users-row answer for the role select; 'none' = zero rows (E-11). */
  role: 'teacher' | 'student' | 'none';
  /** Active memberships served to listMyClasses. */
  classes?: { classId: string; name: string; joinedAt: string }[];
  /** join_class outcome: 'ok' or the wire-error key to refuse with. */
  join?: 'ok' | keyof typeof JOIN_WIRE;
  /** Joined-class payload for the 'ok' case. */
  joined?: { classId: string; name: string };
  /** Artificial join latency — REQUIRED by the double-submit row: an instant
   * stub has no in-flight window for the disable-while-busy guard to guard. */
  joinDelayMs?: number;
}

export interface IdentityStubControl {
  readonly joinCalls: number;
  setJoin(join: 'ok' | keyof typeof JOIN_WIRE): void;
}

export async function stubIdentityApi(
  page: Page,
  options: IdentityStubOptions,
): Promise<IdentityStubControl> {
  const state = {
    joinCalls: 0,
    join: options.join ?? 'ok',
  };

  await page.route('**/rest/v1/users**', async (route) => {
    const wantsObject = (route.request().headers()['accept'] ?? '').includes(
      'pgrst.object',
    );
    if (options.role === 'none') {
      // maybeSingle over zero rows: the object form 406s with PGRST116,
      // which supabase-js maps to data:null/error:null — the E-11 state.
      if (wantsObject) {
        await route.fulfill({
          status: 406,
          json: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: '0 rows', hint: null },
        });
      } else {
        await route.fulfill({ json: [] });
      }
      return;
    }
    const row = { role: options.role };
    await route.fulfill({ json: wantsObject ? row : [row] });
  });

  await page.route('**/rest/v1/rpc/join_class', async (route) => {
    state.joinCalls += 1;
    if (options.joinDelayMs) {
      await new Promise((r) => setTimeout(r, options.joinDelayMs));
    }
    if (state.join === 'ok') {
      const joined = options.joined ?? { classId: E2E_ACTIVITY_ID, name: 'Algebra I — Period 3' };
      await route.fulfill({
        json: {
          class_id: joined.classId,
          class_name: joined.name,
          joined_at: new Date().toISOString(),
        },
      });
      return;
    }
    // PostgREST surfaces a raised exception as a 400 whose message is the
    // raise text — the wire strings the client classifies on.
    const template = JOIN_WIRE[state.join];
    await route.fulfill({
      status: 400,
      json: {
        code: 'P0001',
        message: template.replace('%', 'school.org'),
        details: null,
        hint: null,
      },
    });
  });

  await page.route('**/rest/v1/class_members**', async (route) => {
    await route.fulfill({
      json: (options.classes ?? []).map((c) => ({
        class_id: c.classId,
        joined_at: c.joinedAt,
        classes: { name: c.name },
      })),
    });
  });

  // S9 Drop 2: the student Home always fetches its activity list; default
  // EMPTY so identity rows render the per-class empty state instead of the
  // list-error line. Specs that need rows use content-surface.e2e.ts's
  // stateful stub instead.
  await page.route('**/rest/v1/rpc/list_class_activities', async (route) => {
    await route.fulfill({ json: [] });
  });

  return {
    get joinCalls() {
      return state.joinCalls;
    },
    setJoin(join) {
      state.join = join;
    },
  };
}

/** The join deep link for a code. */
export function joinUrl(code: string): string {
  return `/join/${code}`;
}
