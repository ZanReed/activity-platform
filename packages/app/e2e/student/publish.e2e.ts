// =============================================================================
// publish.e2e.ts — the RPC-direct publish flow (S9 Drop 1)
// -----------------------------------------------------------------------------
// The Drop 1 test plan's e2e row: a teacher publishes and the share affordance
// points at the VIEWER — `${origin}/a/${activityId}` — which then actually
// opens. The critical regressions pinned here: publish happy path, republish
// (the UI surfaces the incremented version_num), and PublishStatus rendering
// for a prior publish in a fresh session.
//
// Lives in the signed-in (student-project) lane because publishing needs a
// session, and only this lane's dev server pins the Supabase env the session
// harness derives its storage key from. The persona is a TEACHER — the same
// harness, per the identity rows' precedent.
//
// Server stubs derive from production constants (P2): the RPC path from
// PUBLISH_ACTIVITY_RPC, the viewer document from the shared fixture.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { createEmptyDocument, createInteractiveGraphBlock, createMultipleChoiceBlock, createRow } from '@activity/schema';
import { ACTIVITY_PROGRESS_RPC, PUBLISH_ACTIVITY_RPC } from '../../src/lib/edgeFunctions';
import {
  signInAs,
  stubIdentityApi,
  stubActivityApi,
  E2E_ACTIVITY_ID,
  E2E_VERSION_ID,
} from '../helpers/studentSession';

const TEACHER_ID = 'dddddddd-0000-4000-8000-00000000e2e9';
const VERSION_ID_2 = 'bbbbbbbb-0000-4000-8000-00000000e2e2';

interface PublishStubOptions {
  /** draft_content served on editor load; null = post-publish, no edits. */
  draft?: unknown;
  currentVersionId?: string | null;
}

interface PublishStubControl {
  readonly rpcCalls: number;
}

/**
 * The editor's server surface: the activities row (load + autosave PATCH),
 * the publish RPC (returns a fresh version uuid per call, PostgREST-style:
 * a `returns uuid` function serializes as a JSON string), and the
 * activity_versions read that backs the "Published v{N}" label (version_num
 * increments per publish, as `max + 1` does server-side).
 */
async function stubPublishApi(
  page: Page,
  options: PublishStubOptions = {},
): Promise<PublishStubControl> {
  const draft = options.draft === undefined ? tinyDoc() : options.draft;
  const state = { rpcCalls: 0 };
  const versionIds = [E2E_VERSION_ID, VERSION_ID_2];

  await page.route('**/rest/v1/activities**', async (route) => {
    const request = route.request();
    if (request.method() === 'PATCH') {
      // The editor's save asks for the row back (select=updated_at) and
      // treats an empty answer as "changed elsewhere / gone" (G-8), exactly
      // as PostgREST answers a filtered update that matched nothing.
      await route.fulfill({ json: [{ updated_at: new Date().toISOString() }] });
      return;
    }
    const row = {
      id: E2E_ACTIVITY_ID,
      title: 'Publish flow fixture',
      draft_content: draft,
      current_version_id: options.currentVersionId ?? null,
    };
    const wantsObject = (request.headers()['accept'] ?? '').includes(
      'pgrst.object',
    );
    await route.fulfill({ json: wantsObject ? row : [row] });
  });

  await page.route(`**/rest/v1/rpc/${PUBLISH_ACTIVITY_RPC}`, async (route) => {
    state.rpcCalls += 1;
    await route.fulfill({
      json: versionIds[state.rpcCalls - 1] ?? VERSION_ID_2,
    });
  });

  await page.route('**/rest/v1/activity_versions**', async (route) => {
    const wantsObject = (
      route.request().headers()['accept'] ?? ''
    ).includes('pgrst.object');
    const row = { version_num: state.rpcCalls };
    await route.fulfill({ json: wantsObject ? row : [row] });
  });

  return {
    get rpcCalls() {
      return state.rpcCalls;
    },
  };
}

/** A minimal VALID document — what a real just-created activity persists. */
function tinyDoc(): unknown {
  return createEmptyDocument({ title: 'Publish flow fixture' });
}

test.describe('publish (RPC-direct)', () => {
  // Headless Chromium denies the async clipboard API by default; the Copy
  // affordance needs both halves (write to copy, read to assert what landed).
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('publish → PublishStatus shows the viewer link → the link opens the viewer', async ({
    page,
    baseURL,
  }) => {
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    const api = await stubPublishApi(page);

    await page.goto(`/activity/${E2E_ACTIVITY_ID}`);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();

    // Happy path: the fresh publish surfaces the minted version number.
    await expect(page.getByText('Published v1')).toBeVisible();
    expect(api.rpcCalls).toBe(1);

    // The share affordance IS the viewer URL — never a storage/backend URL.
    const viewerUrl = `${baseURL}/a/${E2E_ACTIVITY_ID}`;
    const open = page.getByRole('link', { name: 'Open' });
    await expect(open).toHaveAttribute('href', viewerUrl);

    // Copy link carries the same URL.
    await page.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      viewerUrl,
    );

    // ...and the URL it hands out actually opens the viewer. (Same-tab
    // navigation rather than the target=_blank popup: page-scoped stubs
    // don't follow a popup, and the assertion is about the URL, not the
    // window it opens in.)
    await stubActivityApi(page);
    await page.goto(viewerUrl);
    await expect(page.locator('[data-section-id]').first()).toBeVisible();
  });

  test('REPUBLISH: a second publish surfaces the incremented version_num', async ({
    page,
  }) => {
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    const api = await stubPublishApi(page);

    // G-3: a republish asks first when students have started (one has).
    await page.route(`**/rest/v1/rpc/${ACTIVITY_PROGRESS_RPC}`, (route) =>
      route.fulfill({
        json: {
          activity: { id: E2E_ACTIVITY_ID, title: 'Publish flow fixture', current_version_id: E2E_VERSION_ID },
          classes: [{ class_id: 'c1', name: '7A', students: [{ student_id: 's1', sections_checked: 1 }] }],
          sections: [],
          last_check_at: null,
        },
      }),
    );

    await page.goto(`/activity/${E2E_ACTIVITY_ID}`);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(page.getByText('Published v1')).toBeVisible();

    // Nothing changed since: the button says so instead of failing in red.
    await expect(page.getByRole('button', { name: 'No changes', exact: true })).toBeDisabled();

    // An edit makes it Republish again; Republish asks, and names the cost.
    await page.getByLabel('Activity title').fill('Publish flow fixture, edited');
    const republish = page.getByRole('button', { name: 'Republish', exact: true });
    await expect(republish).toBeEnabled();
    await republish.click();
    const confirm = page.getByRole('alertdialog', { name: 'Republish for your students?' });
    await expect(confirm).toContainText('1 student has started this.');
    await confirm.getByRole('button', { name: 'Republish', exact: true }).click();
    await expect(page.getByText('Published v2')).toBeVisible();
    expect(api.rpcCalls).toBe(2);
  });

  // B-3: a graph still on its starting answer is a CHECK, not a refusal —
  // listed before publishing, and "Publish anyway" goes through.
  test('a graph on its starting answer asks first; Publish anyway publishes', async ({ page }) => {
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    const doc = createEmptyDocument({ title: 'Publish flow fixture' });
    const row = createRow();
    row.columns[0]!.blocks = [createInteractiveGraphBlock()];
    doc.sections[0]!.rows = [row];
    const api = await stubPublishApi(page, { draft: doc });

    await page.goto(`/activity/${E2E_ACTIVITY_ID}`);
    await expect(page.locator('[data-starting-answer]')).toHaveText('Starting answer — set the real one');
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const check = page.locator('[data-starting-check]');
    await expect(check).toContainText('Check before publishing:');
    await expect(check).toContainText('Q1 graph · the answer is still the one it started with');
    expect(api.rpcCalls).toBe(0);
    await check.getByRole('button', { name: 'Publish anyway' }).click();
    await expect(page.getByText('Published v1')).toBeVisible();
    expect(api.rpcCalls).toBe(1);
  });

  // B-1/B-2: a question no student can get right is refused, listed by
  // number, and Show me selects it.
  test('a multiple choice with no correct choice is refused and listed with Show me', async ({ page }) => {
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    const doc = createEmptyDocument({ title: 'Publish flow fixture' });
    const mc = createMultipleChoiceBlock();
    mc.choices = mc.choices.map((c) => ({ ...c, correct: false }));
    const row = createRow();
    row.columns[0]!.blocks = [mc];
    doc.sections[0]!.rows = [row];
    const api = await stubPublishApi(page, { draft: doc });

    await page.goto(`/activity/${E2E_ACTIVITY_ID}`);
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    const blocked = page.locator('[data-publish-blocked]');
    await expect(blocked).toContainText('Not published. Fix these first:');
    await expect(blocked).toContainText('Q1 · no choice is marked correct');
    expect(api.rpcCalls).toBe(0);
    await blocked.getByRole('button', { name: 'Show me' }).click();
    await expect(page.locator('.ProseMirror-selectednode')).toHaveCount(1);
  });

  test('a PRIOR publish renders the status line in a fresh session (no env, no publish this session)', async ({
    page,
    baseURL,
  }) => {
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    // Post-publish reopen shape: draft cleared, current_version_id set.
    await stubPublishApi(page, {
      draft: null,
      currentVersionId: E2E_VERSION_ID,
    });
    // The load's published-version fallback reads activity_versions.content —
    // the stub above answers version_num only, so widen it here first.
    await page.route('**/rest/v1/activity_versions**', async (route) => {
      const wantsObject = (
        route.request().headers()['accept'] ?? ''
      ).includes('pgrst.object');
      const row = { content: tinyDoc(), version_num: 1 };
      await route.fulfill({ json: wantsObject ? row : [row] });
    });

    await page.goto(`/activity/${E2E_ACTIVITY_ID}`);
    // Version unknown to this session → the label is "Live", but the link is
    // fully functional — the old env-gated implementation hid it entirely.
    await expect(page.getByText('Live')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      `${baseURL}/a/${E2E_ACTIVITY_ID}`,
    );
  });
});
