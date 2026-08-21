import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// table-authoring.e2e.ts — the table block in a real editor (Q10–Q13)
// ----------------------------------------------------------------------------
// These four cover the seams a unit test cannot reach, and each one sits on a
// hazard this repo has already paid for once:
//
//   Q10 the blank popover opening from INSIDE a cell. Blanks in cells are the
//       whole point of the block, and the popover is a SINGLE HOST at the
//       editor root driven by selection (CLAUDE.md standing constraint — the
//       per-chip mounting attempt broke widespread editor behaviour). A cell is
//       an `isolating` node three levels down; if selection-driven mounting
//       does not survive that, blanks in tables are unauthorable.
//
//   Q11 drag-reorder, in BOTH directions. The `defining: true` bug made later
//       blocks unable to move above earlier ones, and it was asymmetric — a
//       one-direction test passed while the editor was broken.
//
//   Q12 external paste. Teachers build tables in Sheets/Docs and paste them.
//       The hazard is a merged cell: prosemirror-tables would happily render
//       colspan while our schema cannot store it, so the editor would show one
//       document and save another. D7.1 pins the spans to 1 for exactly this.
//
//   Q13 Enter inside a cell. The cell holds EXACTLY ONE tableCellPara, so a
//       keystroke that splits it produces a node the content expression
//       forbids — the kind of thing that throws on the next transaction rather
//       than where the user pressed the key.
// ============================================================================

/** Insert a table at the end of a fresh playground document. */
async function tableEditor(page: Page) {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertActivityTable().run();
    });
    await expect(page.locator('.ProseMirror table')).toBeVisible();
    return page.locator('.ProseMirror table');
}

test('Q10 a blank inside a cell opens the popover from the single host', async ({
    page,
}) => {
    await tableEditor(page);

    // Put the caret in the first cell and type the blank sentinel, which is the
    // same input rule a teacher uses in prose.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let cellPos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, pos: number) => {
            if (cellPos === null && node.type.name === 'tableCellPara') {
                cellPos = pos + 1;
            }
            return cellPos === null;
        });
        ed.chain().focus().setTextSelection(cellPos).run();
    });
    await page.keyboard.type('{{9.00}}');

    // The sentinel became a real blank node, in the cell.
    const blank = page.locator('.ProseMirror table [data-blank-id]');
    await expect(blank).toHaveCount(1);

    // Selecting it opens THE host popover — one instance, at the editor root.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'blank') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
    const popover = page.locator('.blank-edit-popover');
    await expect(popover).toHaveCount(1);
    await expect(popover).toBeVisible();

    // And an edit made there survives an immediate close — the lost-edit bug
    // CLAUDE.md warns about (every close path must flushAll).
    const answer = popover.locator('input').first();
    await answer.fill('13.50');
    await page.keyboard.press('Escape');
    const stored = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let found: string | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'blank') found = node.attrs.answer;
            return found === null;
        });
        return found;
    });
    expect(stored).toBe('13.50');
});

test('Q11 a table drag-reorders in BOTH directions', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );

    // A paragraph, a table, a paragraph — so the table has somewhere to go in
    // each direction.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertContent('<p>ALPHA</p>').run();
        ed.chain().focus('end').insertActivityTable().run();
        ed.chain().focus('end').insertContent('<p>OMEGA</p>').run();
    });

    const order = async () =>
        page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            const names: string[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.descendants((node: any) => {
                if (node.type.name === 'table') {
                    names.push('table');
                    return false;
                }
                // Only OUR two markers: the playground opens with sample
                // content, and a bare "every paragraph" roster would pin the
                // fixture's prose instead of the reorder under test.
                if (
                    node.type.name === 'paragraph' &&
                    (node.textContent === 'ALPHA' || node.textContent === 'OMEGA')
                ) {
                    names.push(node.textContent);
                }
                return true;
            });
            return names;
        });

    expect(await order()).toEqual(['ALPHA', 'table', 'OMEGA']);

    // Move it UP, then DOWN — the asymmetry the defining-flag bug produced
    // means one direction working proves nothing about the other.
    // The REAL gesture: select the block, then the reorder shortcut
    // (BlockReorderShortcuts binds Mod-Shift-Arrow). Driving the keystroke
    // rather than a command keeps this honest — there is no moveBlock command
    // to call, and a test that invoked a non-existent one would pass by doing
    // nothing at all.
    const move = async (direction: 'up' | 'down') => {
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ed = (window as any).__tiptapEditor;
            let pos: number | null = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ed.state.doc.descendants((node: any, p: number) => {
                if (pos === null && node.type.name === 'table') pos = p;
                return pos === null;
            });
            ed.commands.focus();
            ed.commands.setNodeSelection(pos);
        });
        await page.keyboard.press(
            direction === 'up'
                ? 'ControlOrMeta+Shift+ArrowUp'
                : 'ControlOrMeta+Shift+ArrowDown',
        );
    };

    await move('up');
    expect(await order()).toEqual(['table', 'ALPHA', 'OMEGA']);
    await move('down');
    expect(await order()).toEqual(['ALPHA', 'table', 'OMEGA']);
});

test('Q12 a pasted MERGED table arrives unmerged and schema-legal', async ({
    page,
}) => {
    await page.goto('/playground');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );

    // What Google Sheets / Word actually put on the clipboard: a table with a
    // merged header, a header row, and multi-paragraph cell content.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain()
            .focus('end')
            .insertContent(
                '<table><tbody>' +
                    '<tr><th colspan="2">Merged header</th></tr>' +
                    '<tr><td>1</td><td><p>4.50</p><p>second para</p></td></tr>' +
                    '</tbody></table>',
            )
            .run();
    });

    const shape = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const cells: { name: string; colspan: unknown; children: string[] }[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                const children: string[] = [];
                node.forEach((child: { type: { name: string } }) =>
                    children.push(child.type.name),
                );
                cells.push({
                    name: node.type.name,
                    colspan: node.attrs.colspan,
                    children,
                });
            }
            return true;
        });
        return cells;
    });

    expect(shape.length).toBeGreaterThan(0);
    for (const cell of shape) {
        // No tableHeader node exists in this schema (header-ness is a block
        // attr), so a pasted <th> must have landed as an ordinary cell.
        expect(cell.name).toBe('tableCell');
        // Spans are pinned: a merged paste can never render merged and save
        // unmerged, because it never renders merged.
        expect(cell.colspan).toBe(1);
        // And every cell holds exactly one restricted wrapper — the pasted
        // second paragraph was folded away rather than stored as a node the
        // schema has no name for.
        expect(cell.children).toEqual(['tableCellPara']);
    }
});

test('Q13 Enter inside a cell does not split it into two paragraphs', async ({
    page,
}) => {
    await tableEditor(page);

    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let cellPos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, pos: number) => {
            if (cellPos === null && node.type.name === 'tableCellPara') {
                cellPos = pos + 1;
            }
            return cellPos === null;
        });
        ed.chain().focus().setTextSelection(cellPos).run();
    });

    await page.keyboard.type('first');
    await page.keyboard.press('Enter');
    await page.keyboard.type('second');

    const perCell = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        const counts: number[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any) => {
            if (node.type.name === 'tableCell') counts.push(node.childCount);
            return true;
        });
        return counts;
    });

    // Whatever Enter does (nothing, or a hard break), it must never leave a
    // cell holding two blocks — that shape cannot be stored.
    for (const count of perCell) expect(count).toBe(1);
    // The document is still valid and still editable.
    await expect(page.locator('.ProseMirror table')).toBeVisible();
});
