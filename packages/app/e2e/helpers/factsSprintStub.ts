// A stand-in for the daily practice's student RPCs (migration 0050), for the
// stub lanes. RPC names are the production constants (P2); payload shapes are
// the ones verify-0050 asserts the real functions return.
import type { Page } from '@playwright/test';
import { FACT_PROBE_RPC } from '../../src/lib/factProbeRpc';

export const SPRINT_CODE = 'ABC234';
export const SPRINT_SESSION_ID = 'aaaaaaaa-0000-4000-8000-00000000e2e5';
const FAMILY = 'fact.mult.to-12';

export const SPRINT_ITEMS = [
  { n: 1, family_id: FAMILY, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
  { n: 2, family_id: FAMILY, display: '9 × 6 = __', spoken: 'nine times six', answer: '54' },
  { n: 3, family_id: FAMILY, display: '6 × 6 = __', spoken: 'six times six', answer: '36' },
  { n: 4, family_id: FAMILY, display: '3 × 4 = __', spoken: 'three times four', answer: '12' },
  { n: 5, family_id: FAMILY, display: '5 × 5 = __', spoken: 'five times five', answer: '25' },
];

const session = {
  session_id: SPRINT_SESSION_ID, minutes: 5, reask_gap: 3, ceiling_s: 15, total: SPRINT_ITEMS.length,
  baselines: { keyboard: 200, keypad: null },
  families: [{
    family_id: FAMILY, name: 'Multiplication to 12 × 12', mode: 'strategy', show_strategy: true,
    strategy: {
      intro: 'Don’t count up. Start from a fact you know.',
      lines: [{ label: '×5', text: 'Half of ×10. 5 × 8 is half of 80, so 40.' }],
      example: null,
    },
  }],
  items: SPRINT_ITEMS, saved: [], best_before: 3,
};
const common = { done_today: 0, best: 3, class_name: '9 Maths B' };

export interface SprintBackend {
  entryCalls: { p_code: string; p_start: boolean }[];
  saves: { p_session_id: string; p_finished: boolean; p_attempts: { n: number; reask: boolean; typed: string; skipped: boolean }[] }[];
}

export async function stubFactsSprintApi(page: Page): Promise<SprintBackend> {
  const state: SprintBackend = { entryCalls: [], saves: [] };
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.entry}`, async (route) => {
    await route.fulfill({ json: { state: 'none_open' } });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.sprintEntry}`, async (route) => {
    const body = route.request().postDataJSON() as SprintBackend['entryCalls'][number];
    state.entryCalls.push(body);
    await route.fulfill({
      json: body.p_start
        ? { ...common, state: 'ready', due: SPRINT_ITEMS.length, session }
        : { ...common, state: 'ready', due: SPRINT_ITEMS.length, minutes: 5 },
    });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.sprintSave}`, async (route) => {
    const body = route.request().postDataJSON() as SprintBackend['saves'][number];
    state.saves.push(body);
    const all = state.saves.flatMap((s) => s.p_attempts);
    await route.fulfill({
      json: {
        state: 'saved', saved: all.length, finished: state.saves.some((s) => s.p_finished),
        quick_right: 4, best_before: 3,
      },
    });
  });
  return state;
}
