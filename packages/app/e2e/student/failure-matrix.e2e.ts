// =============================================================================
// student/failure-matrix.e2e.ts — the S6 failure matrix, in a real browser
// -----------------------------------------------------------------------------
// V1-V6 proved these behaviors in jsdom. jsdom is not a browser: it has no Web
// Locks, no real event loop between tabs, and its timing is not Chromium's —
// and a flake in the V2 route tests (found under load, not in isolation) is a
// standing reminder that "passes in jsdom" and "works" are different claims.
//
// So every row here re-proves an S6 promise end to end, against the real route,
// the real store, the real buffer, and a network that genuinely fails:
//
//   work survives an outage · queued checks fire on reconnect · the drift
//   notice tells the truth · a closed lid does not lose the queue · one attempt
//   per piece of work · a second tab cannot clobber the first · a dead session
//   is a banner, not a wall · a shared device does not leak the last student
//
// Every absence-shaped assertion here SEEDS the thing it expects to be gone
// first. An unseeded purge test passes against an empty device and proves
// nothing — the failure mode this repo has already met more than once.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import {
  E2E_OTHER_STUDENT_ID,
  E2E_STUDENT_ID,
  activityUrl,
  seedForeignWork,
  signInAs,
  stubActivityApi,
  viewerKeys,
} from '../helpers/studentSession';

/** The first text answer on the worksheet. */
function firstBlank(page: Page) {
  return page.locator('[data-section-id] input[type="text"]').first();
}

async function openWorksheet(page: Page) {
  await page.goto(activityUrl());
  await firstBlank(page).waitFor();
}

/** The buffer key for the signed-in student, once it exists. */
async function bufferValue(page: Page): Promise<string | null> {
  return page.evaluate((userId) => {
    const key = Object.keys(window.localStorage).find(
      (k) => k.startsWith('activity-viewer:buffer:') && k.includes(userId),
    );
    return key ? window.localStorage.getItem(key) : null;
  }, E2E_STUDENT_ID);
}

test.describe('work survives the network dying', () => {
  test('answers typed offline are still there after a reload', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    await firstBlank(page).fill('42');
    api.setOffline(true);
    await firstBlank(page).fill('42 and then some');

    // The reload a student does when a page "looks stuck". Their work has to
    // come back — that is the entire promise of the local-first buffer.
    api.setOffline(false);
    await page.reload();
    await expect(firstBlank(page)).toHaveValue('42 and then some');
  });

  test('a queued check survives a closed lid and fires on reopen', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    await firstBlank(page).fill('42');
    api.setOffline(true);
    await page.getByRole('button', { name: 'Check' }).first().click();
    await expect(page.locator('[data-section-phase="pending"]').first()).toBeVisible();

    // The lid closes and the tab dies. Nothing in memory survives this.
    api.setOffline(false);
    await page.reload();

    // No click, no 'online' event — the boot fire is what has to catch this,
    // because a tab reopened after the outage never sees the reconnect edge.
    await expect(page.locator('[data-section-phase="checked"]').first()).toBeVisible();
  });
});

test.describe('queued checks', () => {
  test('grade the answers as they are NOW, and say so', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    await firstBlank(page).fill('first answer');
    api.setOffline(true);
    await page.getByRole('button', { name: 'Check' }).first().click();
    await expect(page.locator('[data-section-phase="pending"]').first()).toBeVisible();

    // They keep working during the outage — the whole reason 2.2A exists.
    await firstBlank(page).fill('second answer');

    api.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.locator('[data-section-phase="checked"]').first()).toBeVisible();

    const fired = api.checkRequests.at(-1) as {
      responses: { blanks: Record<string, string> };
    };
    expect(Object.values(fired.responses.blanks)).toContain('second answer');
    // And the student is TOLD, rather than left wondering which answer was
    // graded.
    await expect(page.getByText(/checked your latest answers/i)).toBeVisible();
  });

  test('a reconnect storm still records exactly one attempt', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    await firstBlank(page).fill('42');
    api.setOffline(true);
    await page.getByRole('button', { name: 'Check' }).first().click();
    await expect(page.locator('[data-section-phase="pending"]').first()).toBeVisible();
    const beforeReconnect = api.checkRequests.length;

    // A waking Chromebook fires several of these at once. Each one is a
    // reason to try again; none of them is a reason to grade twice.
    api.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('online'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.locator('[data-section-phase="checked"]').first()).toBeVisible();
    await page.waitForTimeout(250);

    expect(api.checkRequests.length - beforeReconnect).toBe(1);
  });

  test('an offline check is a delay; a server error is a failure', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    await firstBlank(page).fill('42');
    api.failCheckWith(500);
    await page.getByRole('button', { name: 'Check' }).first().click();

    // Reachable but broken: retrying forever would spin, so the student gets
    // an explicit failure instead of a promise we cannot keep.
    await expect(page.locator('[data-section-phase="error"]').first()).toBeVisible();
    await expect(page.locator('[data-section-phase="pending"]')).toHaveCount(0);
  });
});

test.describe('a dead session is a banner, not a wall', () => {
  test('a 401 mid-check offers re-auth and keeps the work', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    await firstBlank(page).fill('42');
    api.failCheckWith(401);
    await page.getByRole('button', { name: 'Check' }).first().click();

    await expect(page.locator('[data-banner="session-expired"]')).toBeVisible();
    // 2.3A: passive. The worksheet is still there and still theirs.
    await expect(firstBlank(page)).toHaveValue('42');
    await expect(page.locator('[data-failure]')).toHaveCount(0);
  });
});

test.describe('two tabs', () => {
  test('exactly one tab is editable, and takeover decides which', async ({
    page,
    context,
  }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    // Same context ⇒ same origin ⇒ the same Web Lock. This is the case jsdom
    // cannot express at all.
    const second = await context.newPage();
    await stubActivityApi(second);
    await second.goto(activityUrl());
    await firstBlank(second).waitFor();

    /** How many of the two tabs currently accept input. */
    const editableCount = async () =>
      (await firstBlank(page).isDisabled() ? 0 : 1) +
      (await firstBlank(second).isDisabled() ? 0 : 1);

    // THE GUARANTEE, stated as the guarantee. Asserting that the SECOND tab
    // specifically loses would be testing an ordering the lock never promised:
    // React StrictMode remounts the effect in dev, which releases and
    // re-requests the lock, so the winner of the initial race is genuinely
    // either tab. What must always hold is that it is exactly one of them.
    await expect.poll(editableCount).toBe(1);

    // Takeover, on the other hand, IS deterministic — that is its whole job.
    const loser = (await firstBlank(page).isDisabled()) ? page : second;
    const winner = loser === page ? second : page;
    await expect(loser.locator('[data-banner="other-tab"]')).toBeVisible();

    await loser.getByRole('button', { name: /use it here/i }).click();

    await expect(firstBlank(loser)).toBeEnabled();
    await expect(firstBlank(winner)).toBeDisabled();
    await expect(winner.locator('[data-banner="other-tab"]')).toBeVisible();
    await expect.poll(editableCount).toBe(1);

    await second.close();
  });

  test('a read-only tab cannot overwrite the live tab’s work', async ({ page, context }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    const second = await context.newPage();
    await stubActivityApi(second);
    await second.goto(activityUrl());
    await firstBlank(second).waitFor();

    // WAIT FOR THE RACE TO SETTLE, THEN FOLLOW IT — do not assume it. The
    // first version of this test typed into `page` and then required `page` to
    // be the live tab; under StrictMode's remount either tab can win, so it
    // failed four runs in five in isolation while passing in the full lane,
    // where different timing hid it. The guarantee under test is about the
    // read-only tab not clobbering the live one, whichever is which.
    // ...and require the winner to be STABLE, not merely momentary. Settling
    // passes through "exactly one enabled" more than once — StrictMode remounts
    // both tabs, so the lock can be released and re-acquired by the OTHER tab
    // right after a sample. The previous version snapshotted the winner the
    // instant the count first hit 1 and then filled it; on a slow runner the
    // lock had moved on by then and fill() sat retrying against a disabled
    // input until timeout. That is the exact shape of the two CI failures
    // (runs 31772779555 and 31787010974). Two consecutive agreeing samples
    // mean the race has actually settled rather than passed through.
    let settledOn: 'page' | 'second' | null = null;
    await expect
      .poll(
        async () => {
          const [pageDisabled, secondDisabled] = [
            await firstBlank(page).isDisabled(),
            await firstBlank(second).isDisabled(),
          ];
          // Both or neither enabled = still contending, not a valid sample.
          const winner =
            pageDisabled === secondDisabled
              ? null
              : pageDisabled
                ? ('second' as const)
                : ('page' as const);
          const agreed = winner !== null && winner === settledOn;
          settledOn = winner;
          return agreed;
        },
        { intervals: [250] },
      )
      .toBe(true);

    const live = settledOn === 'page' ? page : second;
    const stale = live === page ? second : page;

    // Auto-retrying guard: if the lock somehow moves again, this fails naming
    // the real condition instead of a bare fill() timeout.
    await expect(firstBlank(live)).toBeEnabled();
    await firstBlank(live).fill('live tab work');
    await expect.poll(async () => bufferValue(live)).toContain('live tab work');

    // Closing the stale tab flushes its buffer — the clobber this guards.
    await stale.close();
    await live.waitForTimeout(300);

    expect(await bufferValue(live)).toContain('live tab work');
  });

  test('a STOLEN-FROM tab’s late flush never lands (eng review D28)', async ({
    page,
    context,
  }) => {
    // The steal direction of the V7 matrix, previously uncovered: the
    // displaced tab learns it lost ASYNCHRONOUSLY (the steal rejection is the
    // notification), so a debounced write scheduled just before the steal
    // could land after the thief took over. The write gate checks held-ness
    // at write time; this row pins that nothing lands once the notification
    // has arrived. Timing envelope: the debounce is 300ms and the steal
    // notification arrives in tens of ms, so the pending write always fires
    // AFTER the tab knows it lost — which is exactly the case under test.
    await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    const second = await context.newPage();
    await stubActivityApi(second);
    await second.goto(activityUrl());
    await firstBlank(second).waitFor();

    await expect
      .poll(async () =>
        [await firstBlank(page).isDisabled(), await firstBlank(second).isDisabled()]
          .filter((disabled) => !disabled).length,
      )
      .toBe(1);
    const live = (await firstBlank(page).isDisabled()) ? second : page;
    const thief = live === page ? second : page;

    // Dirty state IN the debounce window: type and steal back-to-back, so the
    // displaced tab still owes a write when it loses the lock.
    await firstBlank(live).fill('late-edit-must-not-land');
    await thief.getByRole('button', { name: /use it here/i }).click();
    await expect(firstBlank(live)).toBeDisabled();

    // The thief establishes the truth…
    await firstBlank(thief).fill('thief truth');
    await expect.poll(async () => bufferValue(thief)).toContain('thief truth');

    // …then the displaced tab is given every chance to flush: its debounce
    // timer expires, and we fire the hide events that trigger the synchronous
    // flush path too.
    await live.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('pagehide'));
    });
    await live.waitForTimeout(400);

    const persisted = await bufferValue(thief);
    expect(persisted).toContain('thief truth');
    expect(persisted).not.toContain('late-edit-must-not-land');

    await second.close();
  });

  test('regaining the lock re-hydrates from storage — the handback is honest (eng review D6)', async ({
    page,
    context,
  }) => {
    // "Closing the thief hands the activity back with no reload" is a
    // documented feature — and it used to be the unsafe half: the regaining
    // tab re-gained WRITE AUTHORITY over the in-memory state it had held
    // since boot, clobbering everything the thief wrote on the next
    // keystroke. D6: storage wins — the regainer re-hydrates BEFORE input
    // re-enables, so what the student sees after the handback is what the
    // thief actually did.
    await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    const second = await context.newPage();
    await stubActivityApi(second);
    await second.goto(activityUrl());
    await firstBlank(second).waitFor();

    await expect
      .poll(async () =>
        [await firstBlank(page).isDisabled(), await firstBlank(second).isDisabled()]
          .filter((disabled) => !disabled).length,
      )
      .toBe(1);
    const original = (await firstBlank(page).isDisabled()) ? second : page;
    const thiefTab = original === page ? second : page;

    // The original does some work first, so the regain has stale memory to
    // be tempted by.
    await firstBlank(original).fill('original work');
    await expect.poll(async () => bufferValue(original)).toContain('original work');

    // The thief takes over and moves the work forward.
    await thiefTab.getByRole('button', { name: /use it here/i }).click();
    await expect(firstBlank(original)).toBeDisabled();
    await firstBlank(thiefTab).fill('thief moved the work forward');
    await expect
      .poll(async () => bufferValue(thiefTab))
      .toContain('thief moved the work forward');

    // Handback: the thief closes. The original regains — and must SEE the
    // thief's state, not resurrect its own.
    await thiefTab.close();
    await expect(firstBlank(original)).toBeEnabled();
    await expect(firstBlank(original)).toHaveValue('thief moved the work forward');

    // And the buffer still holds the thief's truth after the regain settles.
    await original.waitForTimeout(400);
    expect(await bufferValue(original)).toContain('thief moved the work forward');
  });
});

test.describe('shared device', () => {
  test('the next student’s session sweeps the last one’s work away', async ({ page }) => {
    await stubActivityApi(page);
    // SEED FIRST: an unseeded version of this test passes against an empty
    // device and proves nothing at all.
    const foreignKey = await seedForeignWork(page);
    await signInAs(page); // a different student sits down

    await page.goto(activityUrl());
    await expect
      .poll(async () => (await viewerKeys(page)).includes(foreignKey))
      .toBe(false);
  });

  test('the previous student’s queued check never fires under this session', async ({
    page,
  }) => {
    const api = await stubActivityApi(page);
    await seedForeignWork(page); // includes a pending check
    await signInAs(page);

    await openWorksheet(page);
    await page.waitForTimeout(400);

    // Their check would have been graded as, and recorded against, the
    // student now sitting at the keyboard.
    expect(api.checkRequests).toHaveLength(0);
    await expect(page.locator('[data-section-phase="pending"]')).toHaveCount(0);
  });

  test('signing out leaves nothing behind', async ({ page }) => {
    await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    // Real work, written through the real buffer — not a hand-placed key.
    await firstBlank(page).fill('my private work');
    await expect.poll(async () => (await viewerKeys(page)).length).toBeGreaterThan(0);

    await page.goto('/');
    await page.getByRole('button', { name: /sign out/i }).click();

    await expect.poll(async () => viewerKeys(page)).toEqual([]);
  });
});

test.describe('a republished activity', () => {
  test('keeps the student on their own version when we still have it', async ({
    page,
  }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);

    // Unsent work on the version they were served.
    await firstBlank(page).fill('42');
    api.setOffline(true);
    await page.getByRole('button', { name: 'Check' }).first().click();
    await expect(page.locator('[data-section-phase="pending"]').first()).toBeVisible();

    // Overnight, the teacher republishes. Every block id changes.
    api.setOffline(false);
    await page.unroute('**/functions/v1/get-activity*');
    await stubActivityApi(page, { versionId: 'republished-version' });
    await page.reload();

    await expect(page.locator('[data-banner="pinned-version"]')).toBeVisible();
    // Their work is on screen, not silently discarded for a newer document.
    await expect(firstBlank(page)).toHaveValue('42');
  });
});

test.describe('offline reopen', () => {
  test('shows the saved copy rather than an error screen', async ({ page }) => {
    const api = await stubActivityApi(page);
    await signInAs(page);
    await openWorksheet(page);
    await firstBlank(page).fill('42');
    // Let the buffer and the cached document land.
    await expect.poll(async () => (await viewerKeys(page)).length).toBeGreaterThan(1);

    api.setOffline(true);
    await page.reload();

    await expect(page.locator('[data-banner="offline-copy"]')).toBeVisible();
    await expect(firstBlank(page)).toHaveValue('42');
    await expect(page.locator('[data-failure]')).toHaveCount(0);
  });
});

test.describe('identity', () => {
  test('two students on one device never share a buffer key', async ({ page }) => {
    await stubActivityApi(page);
    await signInAs(page, { userId: E2E_OTHER_STUDENT_ID });
    await openWorksheet(page);
    await firstBlank(page).fill('student two answer');
    await expect.poll(async () => (await viewerKeys(page)).length).toBeGreaterThan(0);

    const keys = await viewerKeys(page);
    expect(keys.some((k) => k.includes(E2E_OTHER_STUDENT_ID))).toBe(true);
    expect(keys.some((k) => k.includes(E2E_STUDENT_ID))).toBe(false);
  });
});
