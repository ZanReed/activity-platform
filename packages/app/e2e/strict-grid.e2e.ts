import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Strict-grid migration (slice 1) — the CRITICAL structural guards.
// ----------------------------------------------------------------------------
// The editor tree IS the stored rows-of-columns model: doc = (row |
// sectionBreak)+, every block inside a `column`. These pin the two hazards the
// eng review flagged as SILENT DATA LOSS if untested — paste-into-column and
// undo-vs-normalization — plus the normalizer's empty-state / trailing-line /
// re-coalesce rules and the split-into-columns gesture. Playwright (real
// chromium) is authoritative; the in-app Browser pane suppresses the
// position-measured hosts, so structural facts are read from editor state.
// ============================================================================

async function waitForEditor(page: Page) {
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
}

// A compact shape string, e.g. doc[row[column[paragraph]]].
function docShape(page: Page): Promise<string> {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shape = (n: any, d = 0): string => {
            let s = n.type.name;
            if (d < 7 && n.childCount) {
                const kids = [];
                for (let i = 0; i < n.childCount; i++) kids.push(shape(n.child(i), d + 1));
                s += '[' + kids.join(',') + ']';
            }
            return s;
        };
        return shape(ed.state.doc);
    });
}

function docText(page: Page): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return page.evaluate(() => (window as any).__tiptapEditor.state.doc.textContent);
}

function docValid(page: Page): Promise<boolean> {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        try {
            ed.state.doc.check();
            return true;
        } catch {
            return false;
        }
    });
}

test.beforeEach(async ({ page }) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
});

test('empty doc is one row > column > empty paragraph', async ({ page }) => {
    expect(await docShape(page)).toBe('doc[row[column[paragraph]]]');
});

test('CRITICAL: pasting a multi-col region into a column flattens to blocks (no data loss)', async ({
    page,
}) => {
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('here');
    // A paste event carrying the HTML the editor emits for a 2-col row.
    const valid = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        const html =
            '<div data-columns class="editor-columns">' +
            '<div data-column class="editor-column"><p>Left1</p><p>Left2</p></div>' +
            '<div data-column class="editor-column"><p>Right1</p></div>' +
            '</div>';
        const dt = new DataTransfer();
        dt.setData('text/html', html);
        ed.view.dom.dispatchEvent(
            new ClipboardEvent('paste', {
                clipboardData: dt,
                bubbles: true,
                cancelable: true,
            }),
        );
        try {
            ed.state.doc.check();
            return true;
        } catch {
            return false;
        }
    });
    expect(valid).toBe(true);
    // Every cell's text survived (nothing silently dropped).
    const text = await docText(page);
    expect(text).toContain('Left1');
    expect(text).toContain('Left2');
    expect(text).toContain('Right1');
    // No `row` leaked inside the stack column (the paste flattened).
    const shape = await docShape(page);
    expect(shape).not.toContain('row[column[paragraph,paragraph,paragraph,row');
});

test('CRITICAL: pasting content with a section break drops the break, keeps blocks', async ({
    page,
}) => {
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('x');
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.commands.focus('end');
        const html =
            '<p>Before</p><div data-section-break></div><p>After</p>';
        const dt = new DataTransfer();
        dt.setData('text/html', html);
        ed.view.dom.dispatchEvent(
            new ClipboardEvent('paste', {
                clipboardData: dt,
                bubbles: true,
                cancelable: true,
            }),
        );
    });
    expect(await docValid(page)).toBe(true);
    const text = await docText(page);
    expect(text).toContain('Before');
    expect(text).toContain('After');
    // The whole doc is still a single stack row (no sectionBreak pasted in).
    expect(await docShape(page)).not.toContain('sectionBreak');
});

test('CRITICAL: undo reverts an insert AND its normalization together (no dead undo)', async ({
    page,
}) => {
    // Insert an image as the last block — the normalizer appends a trailing
    // stack paragraph so there is a caret home below it.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const svg =
            "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'40'%20height%3D'20'%3E%3C%2Fsvg%3E";
        ed.chain().focus('end').insertImage({ src: svg, alt: 'x' }).run();
    });
    expect(await docShape(page)).toBe(
        'doc[row[column[image]],row[column[paragraph]]]',
    );
    // ONE undo returns to the empty doc — the appended trailing paragraph is in
    // the same history entry, so undo isn't swallowed by re-normalization.
    await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands.undo(),
    );
    expect(await docShape(page)).toBe('doc[row[column[paragraph]]]');
    // A second undo is a no-op (nothing left) — not a flip-flop.
    await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.commands.undo(),
    );
    expect(await docShape(page)).toBe('doc[row[column[paragraph]]]');
});

test('deleting everything leaves a clean empty stack (cursor home)', async ({
    page,
}) => {
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('gone soon');
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    expect(await docShape(page)).toBe('doc[row[column[paragraph]]]');
    // The caret has a home (a text selection, not a stranded node selection).
    const selType = await page.evaluate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => (window as any).__tiptapEditor.state.selection.constructor.name,
    );
    expect(selType).toContain('TextSelection');
});

test('split-into-columns partitions the stack into before | multi | after', async ({
    page,
}) => {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain()
            .setContent({
                type: 'doc',
                content: [
                    {
                        type: 'row',
                        attrs: { gridLines: 'inherit' },
                        content: [
                            {
                                type: 'column',
                                content: [
                                    { type: 'paragraph', content: [{ type: 'text', text: 'one' }] },
                                    { type: 'paragraph', content: [{ type: 'text', text: 'two' }] },
                                    { type: 'paragraph', content: [{ type: 'text', text: 'three' }] },
                                ],
                            },
                        ],
                    },
                ],
            })
            .run();
        // Caret in 'two' (into row +1, column +1, past 'one' para of size 5 → 9).
        ed.chain().focus().setTextSelection(9).run();
        ed.chain().focus().wrapInColumns(2).run();
    });
    // before(one) | multi(two + empty) | after(three), all top-level rows.
    expect(await docShape(page)).toBe(
        'doc[row[column[paragraph[text]]],row[column[paragraph[text]],column[paragraph]],row[column[paragraph[text]]]]',
    );
    expect(await docValid(page)).toBe(true);
});

test('adjacent 1-col stack rows re-coalesce into one', async ({ page }) => {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain()
            .setContent({
                type: 'doc',
                content: [
                    {
                        type: 'row',
                        attrs: { gridLines: 'inherit' },
                        content: [{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] }],
                    },
                    {
                        type: 'row',
                        attrs: { gridLines: 'inherit' },
                        content: [{ type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }] }],
                    },
                ],
            })
            .run();
    });
    // The normalizer coalesces the two stacks into ONE row with both paragraphs.
    expect(await docShape(page)).toBe(
        'doc[row[column[paragraph[text],paragraph[text]]]]',
    );
    expect(await docText(page)).toBe('AB');
});
