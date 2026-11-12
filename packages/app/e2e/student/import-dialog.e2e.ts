// =============================================================================
// import-dialog.e2e.ts — the editor's Import dialog loads on demand
// (shell-size review TR4, 2026-11-13)
// -----------------------------------------------------------------------------
// The dialog left the editor's static imports (~40 KiB gz). Two rows:
//   1. it still opens from the Import button and closes on Escape;
//   2. when its chunk cannot load (the case after a deploy, when an open tab
//      asks for an old hashed file), the editor stays up and says what to do,
//      and says to refresh. React.lazy would have blanked the editor here:
//      this app has no error boundary. (A retry cannot help: Chromium keeps
//      a failed module load for the life of the page; this spec measured it.)
// Signed-in lane for the same reason as publish.e2e.ts (it needs a session).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { createEmptyDocument } from '@activity/schema';
import { signInAs, stubIdentityApi, E2E_ACTIVITY_ID } from '../helpers/studentSession';

const TEACHER_ID = 'dddddddd-0000-4000-8000-00000000e2e9';

async function openEditor(page: Page) {
  await signInAs(page, { userId: TEACHER_ID });
  await stubIdentityApi(page, { role: 'teacher' });
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
      title: 'Import dialog fixture',
      draft_content: createEmptyDocument({ title: 'Import dialog fixture' }),
      current_version_id: null,
    };
    const wantsObject = (request.headers()['accept'] ?? '').includes('pgrst.object');
    await route.fulfill({ json: wantsObject ? row : [row] });
  });
  await page.goto(`/activity/${E2E_ACTIVITY_ID}`);
  await expect(page.locator('.ProseMirror').first()).toBeVisible();
}

// The built chunk (assets/ImportMarkdownDialog-<hash>.js) or, on this lane's
// dev server, the module itself.
const DIALOG_MODULE = /\/(assets\/ImportMarkdownDialog-[^/]*\.js|src\/components\/ImportMarkdownDialog\.tsx)/;

const importButton = (page: Page) => page.getByRole('button', { name: 'Import', exact: true });

test('the Import button opens the dialog, and Escape closes it', async ({ page }) => {
  await openEditor(page);
  await expect(importButton(page)).toBeEnabled();
  await importButton(page).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Markdown to import' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('a dialog chunk that will not load leaves the editor up and says to refresh', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await openEditor(page);

  await page.route(DIALOG_MODULE, (route) => route.abort());
  await expect(importButton(page)).toBeEnabled();
  await importButton(page).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Import couldn’t load' })).toBeVisible();
  await expect(page.locator('.ProseMirror').first()).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: 'refresh the page' })).toBeVisible();
  expect(errors).toEqual([]);
});
