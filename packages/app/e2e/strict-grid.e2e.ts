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

test('split-into-columns works on a node-selected atom block (image)', async ({
    page,
}) => {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const svg =
            "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'40'%20height%3D'20'%3E%3C%2Fsvg%3E";
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
                                    { type: 'paragraph', content: [{ type: 'text', text: 'before' }] },
                                    { type: 'image', attrs: { id: 'im1', src: svg, alt: 'x' } },
                                    { type: 'paragraph', content: [{ type: 'text', text: 'after' }] },
                                ],
                            },
                        ],
                    },
                ],
            })
            .run();
        let imgPos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (imgPos === null && n.type.name === 'image') imgPos = p;
            return imgPos === null;
        });
        ed.chain().focus().setNodeSelection(imgPos).wrapInColumns(2).run();
    });
    // before | [image + empty col] | after — the atom lands in column 1.
    expect(await docShape(page)).toBe(
        'doc[row[column[paragraph[text]]],' +
            'row[column[image],column[paragraph]],' +
            'row[column[paragraph[text]]]]',
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

// --- Slice 2: seam affordances (T7) ------------------------------------------

// A doc with a multi-col row between two stack rows (the multi-col prevents the
// stacks from coalescing, so the seams are stable).
async function seedSeamDoc(page: Page) {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const row = (cols: string[][]) => ({
            type: 'row',
            attrs: { gridLines: 'inherit' },
            content: cols.map((paras) => ({
                type: 'column',
                content: paras.map((t) => ({
                    type: 'paragraph',
                    content: [{ type: 'text', text: t }],
                })),
            })),
        });
        ed.chain()
            .setContent({
                type: 'doc',
                content: [row([['AAA']]), row([['x'], ['y']]), row([['BBB']])],
            })
            .run();
    });
}

// Set a collapsed caret by locating a paragraph's text and offset in the doc.
async function caretInText(page: Page, text: string, offset: number) {
    await page.evaluate(
        ({ text, offset }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            let target = -1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.descendants((n: any, pos: number) => {
                if (target === -1 && n.isText && n.text === text) target = pos;
            });
            ed.chain().focus().setTextSelection(target + offset).run();
        },
        { text, offset },
    );
}

function selectionInfo(page: Page) {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const sel = ed.state.selection;
        return {
            type: sel.constructor.name,
            nodeType: sel.node ? sel.node.type.name : null,
            nodeCols: sel.node ? sel.node.childCount : null,
            parentText: sel.$from.parent.textContent as string,
        };
    });
}

test('dissolveRow merges a multi-col row into one full-width stack (content preserved)', async ({
    page,
}) => {
    await seedSeamDoc(page);
    await caretInText(page, 'x', 0); // caret inside the multi-col row
    await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus().dissolveRow().run(),
    );
    // The 2-col row became a 1-col stack; the normalizer then coalesced ALL
    // three now-adjacent stacks into ONE (a section is one stack row).
    expect(await docShape(page)).toBe(
        'doc[row[column[paragraph[text],paragraph[text],paragraph[text],paragraph[text]]]]',
    );
    expect(await docText(page)).toBe('AAAxyBBB');
});

test('addRowBelow inserts a full-width stack row after a multi-col row', async ({
    page,
}) => {
    await seedSeamDoc(page);
    await caretInText(page, 'x', 0); // in the multi-col row
    await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus().addRowBelow().run(),
    );
    // A fresh empty stack row lands right after the multi-col row, before BBB:
    // [stack AAA, multi-col, EMPTY stack, stack BBB].
    expect(await docShape(page)).toBe(
        'doc[row[column[paragraph[text]]],' + // AAA
            'row[column[paragraph[text]],column[paragraph[text]]],' + // multi-col x|y
            'row[column[paragraph]],' + // the new empty stack row
            'row[column[paragraph[text]]]]', // BBB
    );
    // The caret is in the new empty row (a text home below the columns).
    const info = await selectionInfo(page);
    expect(info.type).toContain('TextSelection');
    expect(info.parentText).toBe('');
});

test('boundary Backspace SELECTS the seam node — never a frozen no-op', async ({
    page,
}) => {
    await seedSeamDoc(page);
    await caretInText(page, 'BBB', 0); // start of the last stack row's block
    await page.locator('.ProseMirror').press('Backspace');
    const info = await selectionInfo(page);
    // The previous top-level node (the multi-col row) is now selected.
    expect(info.type).toContain('NodeSelection');
    expect(info.nodeType).toBe('row');
    expect(info.nodeCols).toBe(2);
    // Nothing was deleted.
    expect(await docText(page)).toBe('AAAxyBBB');
});

test('ArrowDown at a row end steps the caret into the next row', async ({
    page,
}) => {
    await seedSeamDoc(page);
    await caretInText(page, 'AAA', 3); // end of the first stack row
    await page.locator('.ProseMirror').press('ArrowDown');
    const info = await selectionInfo(page);
    expect(info.type).toContain('TextSelection');
    // Into the next (multi-col) row's first column text.
    expect(info.parentText).toBe('x');
});

test('ArrowUp at a row start steps the caret into the previous row', async ({
    page,
}) => {
    await seedSeamDoc(page);
    await caretInText(page, 'BBB', 0); // start of the last stack row
    await page.locator('.ProseMirror').press('ArrowUp');
    const info = await selectionInfo(page);
    expect(info.type).toContain('TextSelection');
    // Into the previous (multi-col) row's nearest text.
    expect(['x', 'y']).toContain(info.parentText);
});

test('the toolbar column cluster shows for a multi-col row, hides for a stack', async ({
    page,
}) => {
    const toolbar = page.locator('.editor-toolbar');
    const addColumn = toolbar.getByRole('button', { name: '+ Column' });
    const merge = toolbar.getByRole('button', { name: 'Merge', exact: true });

    // A plain stack: the column controls are absent (not just disabled).
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('plain');
    await expect(addColumn).toHaveCount(0);
    await expect(merge).toHaveCount(0);

    // Insert a 2-col row + land the caret in it → the cluster + escape hatches.
    await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus().insertColumns(2).run(),
    );
    await expect(addColumn).toBeVisible();
    await expect(merge).toBeVisible();
    await expect(
        toolbar.getByRole('button', { name: 'Row below' }),
    ).toBeVisible();
});

test('the toolbar Merge button dissolves the multi-col row', async ({ page }) => {
    await page.evaluate(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus().insertColumns(2).run(),
    );
    await page
        .locator('.editor-toolbar')
        .getByRole('button', { name: 'Merge', exact: true })
        .click();
    // The active row is now a 1-col stack (no multi-col row remains).
    const shape = await docShape(page);
    expect(shape).not.toContain('column,column');
});
