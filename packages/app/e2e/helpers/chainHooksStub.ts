// A stand-in for the chain hook view's reads and writes (migration 0057), for
// the stub lanes. The RPC name is the production constant (P2); the payload is
// the shape verify-0057 §C asserts my_chain_hooks returns.
import type { Page } from '@playwright/test';
import { MY_CHAIN_HOOKS_RPC } from '../../src/lib/edgeFunctions';

export const CH_CHAIN = 'chain.geom.parallel-lines';
export const CH_CLASS_ID = 'eeeeeeee-0000-4000-8000-00000000c401';
const ACT_1 = 'aaaaaaaa-0000-4000-8000-00000000c411';
const ACT_2 = 'aaaaaaaa-0000-4000-8000-00000000c412';

export interface ChainHooksStub {
  marks: { hook_id: string; used_on: string }[];
}

export async function stubChainHooksApi(page: Page): Promise<ChainHooksStub> {
  const stub: ChainHooksStub = {
    marks: [{ hook_id: 'hook.angles.squashed-x', used_on: '2027-02-08' }],
  };

  await page.route(`**/rest/v1/rpc/${MY_CHAIN_HOOKS_RPC}**`, (route) =>
    route.fulfill({
      json: {
        activityChains: { [ACT_1]: CH_CHAIN, [ACT_2]: CH_CHAIN },
        chains: {
          [CH_CHAIN]: [
            {
              id: 'hook.angles.squashed-x',
              connects_to: [{ id: 'geom.angles.relationships', label: 'Use supplementary, complementary, vertical and adjacent angle relationships' }],
              prompt: 'Draw two long straight lines that cross, like a squashed X. Kiri says the angle across from the narrowest must be the widest. Is she right?',
              note: 'Sets up vertical-as-supplementary. Answered once activity 01 shows opposite angles are equal.',
            },
            {
              id: 'hook.parallel.exercise-book',
              connects_to: [{ id: 'geom.angles.parallel-transversal', label: 'Find angles on parallel lines cut by a transversal' }],
              prompt: 'Ben rules a slanted line across two lines in his book and measures one sharp angle: 50°. Which of the eight angles are 50°?',
              note: 'Four sharp angles are 50°, four wide ones are 130°. A bag at $4 is still just money here.',
            },
          ],
        },
      },
    }),
  );

  await page.route('**/rest/v1/activities**', (route) =>
    route.fulfill({
      json: [
        { id: ACT_1, title: 'Angle relationships', status: 'published', updated_at: '2027-02-01T00:00:00Z',
          unit: 'Angles and Parallel Lines', draft_unit: null, source_path: '713-chain.geom.parallel-lines/01.md' },
        { id: ACT_2, title: 'Parallel lines and a transversal', status: 'draft', updated_at: '2027-02-02T00:00:00Z',
          unit: 'Angles and Parallel Lines', draft_unit: null, source_path: '713-chain.geom.parallel-lines/02.md' },
      ],
    }),
  );

  await page.route('**/rest/v1/classes**', (route) =>
    route.fulfill({
      json: [{
        id: CH_CLASS_ID, name: '9 Maths B', join_code: 'ABC234', expected_domain: null,
        age_assertion_at: '2027-01-30T00:00:00Z', assertion_text_version: 'e2e',
        created_at: '2027-01-30T00:00:00Z', includes_under_13: false,
      }],
    }),
  );

  await page.route('**/rest/v1/class_hook_use**', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: stub.marks });
    return route.fulfill({ status: 201, json: [] });
  });

  return stub;
}
