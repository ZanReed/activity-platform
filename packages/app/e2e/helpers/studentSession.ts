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

  await page.route('**/functions/v1/check-section', async (route) => {
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
        wireVersion: 2,
        sectionId: body.sectionId,
        items,
        solutions: options.check?.solutions ?? {},
      },
    });
  });

  // Released feedback is not what these specs are about, but the viewer may
  // ask; answer honestly rather than letting it 404 into a failure state.
  await page.route('**/functions/v1/get-feedback', async (route) => {
    if (await abortIfOffline(route)) return;
    await route.fulfill({ json: { graded: false, blocks: {} } });
  });

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
