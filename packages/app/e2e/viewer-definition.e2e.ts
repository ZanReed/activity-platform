import { test, expect } from '@playwright/test';

// ============================================================================
// Viewer definition disclosure — a RICH definition must show its content.
// ----------------------------------------------------------------------------
// A definition mark is either simple (`definition: string`) or rich
// (`content: DefinitionBlock[]`). Every catalogue import is rich — the
// definitions fence admits math and formatting — but until 2026-09-26 the
// on-screen disclosure rendered only the simple form and showed the bare word
// "Definition" for everything else. The print glossary rendered rich content
// all along, which is why no print gate caught it.
//
// Bound to rendered output: opens the fixture's rich "slope" definition and
// reads the text a student sees. Mutation-tested the day it was written
// (reverting the rich branch in InlineContent.tsx turns it red).
// ============================================================================

test('opening a rich definition shows its content, not a placeholder', async ({ page }) => {
    await page.goto('/dev/viewer?type=paragraph');
    const term = page.locator('.viewer-definition__term', { hasText: 'slope' });
    await term.click();
    await expect(term).toHaveAttribute('aria-expanded', 'true');
    const body = page.locator('.viewer-definition__body');
    await expect(body).toContainText('How steep the line is: rise over run.');
    await expect(body).not.toHaveText('Definition');
});
