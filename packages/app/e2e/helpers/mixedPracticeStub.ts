// A stand-in for mixed practice's student backend (0066 + check-activity's
// practice modes, slice 2), for the stub lanes. Names are the production
// constants (P2); the payloads are the shapes verify-0066 and
// practice-handler.test.ts assert; the questions are the shared fixtures
// (src/test/practiceFixtures.ts), served through the real sanitizer.
import type { Page, Route } from '@playwright/test';
import { CHECK_WIRE_VERSION } from '@activity/viewer';
import { CHECK_ACTIVITY_FUNCTION } from '../../src/lib/edgeFunctions';
import { FACT_PROBE_RPC } from '../../src/lib/factProbeRpc';
import { MIXED_PRACTICE_RPC } from '../../src/lib/mixedPracticeRpc';
import {
  PX_BLANK_ID,
  PX_CLASS_ID,
  PX_CODE,
  pxCheckResult,
  pxSession,
} from '../../src/test/practiceFixtures';

export { PX_CODE };

export interface MixedBackend {
  previews: number;
  starts: number;
  checks: { seq: number; skip?: boolean; responses: { blanks: Record<string, string> } }[];
  /** Every check-activity request is refused at the transport while true. */
  offline: boolean;
  /** Requests refused while offline. */
  refused: number;
  /** What the next preview returns after the first session is finished. */
  graded: boolean;
}

export async function stubMixedPracticeApi(
  page: Page,
  options: { graded?: boolean } = {},
): Promise<MixedBackend> {
  const state: MixedBackend = { previews: 0, starts: 0, checks: [], offline: false, refused: 0, graded: options.graded ?? false };
  const tried = new Map<number, ReturnType<typeof pxCheckResult>>();

  // No number-facts check open, no number-facts practice: mixed practice alone.
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.entry}`, (route) => route.fulfill({ json: { state: 'none_open' } }));
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.sprintEntry}`, (route) => route.fulfill({ json: { state: 'off' } }));
  await page.route('**/rest/v1/classes?**', (route) =>
    route.fulfill({ json: [{ id: PX_CLASS_ID, mixed_on_at: '2027-02-10T00:00:00Z' }] }),
  );
  await page.route(`**/rest/v1/rpc/${MIXED_PRACTICE_RPC.start}`, async (route) => {
    state.previews += 1;
    const body = route.request().postDataJSON() as { p_class_id: string; p_start: boolean };
    // The app only ever previews over PostgREST; Start goes through the function.
    if (body.p_start !== false || body.p_class_id !== PX_CLASS_ID) {
      await route.fulfill({ status: 400, json: { message: 'e2e: unexpected start_mixed_session call' } });
      return;
    }
    const done = tried.size >= 2;
    await route.fulfill({
      json: done
        ? { state: 'done_today', done_today: 1, graded: state.graded, items_per_session: 2 }
        : { state: 'ready', done_today: 0, graded: state.graded, items_per_session: 2, planned: 2 },
    });
  });

  await page.route(
    (url) => url.pathname.endsWith(`/functions/v1/${CHECK_ACTIVITY_FUNCTION}`),
    async (route: Route) => {
      if (state.offline) {
        state.refused += 1;
        await route.abort('internetdisconnected');
        return;
      }
      const body = route.request().postDataJSON() as {
        wireVersion: number;
        mode: string;
        classId?: string;
        sessionId?: string;
        seq?: number;
        skip?: boolean;
        responses?: { blanks: Record<string, string> };
      };
      if (body.mode === 'practice-start') {
        state.starts += 1;
        const session = pxSession({ graded: state.graded });
        await route.fulfill({
          json: {
            wireVersion: CHECK_WIRE_VERSION, state: 'started', doneToday: 0, graded: state.graded,
            itemsPerSession: 2, session,
          },
        });
        return;
      }
      if (body.mode === 'practice' && (body.seq === 1 || body.seq === 2)) {
        state.checks.push({ seq: body.seq, ...(body.skip ? { skip: true } : {}), responses: body.responses ?? { blanks: {} } });
        const seq = body.seq;
        const before = tried.get(seq);
        if (before) {
          await route.fulfill({ json: { ...before, replayed: true } });
          return;
        }
        const outcome = body.skip
          ? 'skipped'
          : seq === 1
            ? body.responses?.blanks?.[PX_BLANK_ID] === '5' ? 'right' : 'wrong'
            : 'wrong';
        const result = pxCheckResult(seq, outcome);
        tried.set(seq, result);
        await route.fulfill({ json: result });
        return;
      }
      await route.fulfill({ status: 400, json: { error: 'e2e: unexpected request' } });
    },
  );
  return state;
}
