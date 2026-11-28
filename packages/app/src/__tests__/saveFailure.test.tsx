// @vitest-environment jsdom
// =============================================================================
// saveFailure.test.tsx — a save that fails validation says WHERE (review C7)
// -----------------------------------------------------------------------------
// Bound to RENDERED output: a real invalid document goes through the editor's
// own pre-save gate (validateForSave), the real useAutosave, and the notice
// the editor draws, and the row asserts what a teacher reads, plain words
// first and the technical path only under Details.
// =============================================================================

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import {
    createEmptyDocument,
    createMultipleChoiceBlock,
    createParagraphBlock,
    createRow,
    createSection,
    type ActivityDocument,
} from '@activity/schema';
import SaveFailedNotice from '../components/SaveFailedNotice';
import { useAutosave } from '../lib/useAutosave';
import { describeIssuePlace, validateForSave } from '../lib/saveFailure';

beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

/** Section 2 "Warm-up": a multiple choice beside a paragraph, then a row whose
 *  second block is a multiple choice with one choice (the schema needs two).
 *  Down the section that is the 2nd multiple choice. */
function brokenDocument(): ActivityDocument {
    const doc = createEmptyDocument();
    const warmUp = createSection('Warm-up');
    const mc = createMultipleChoiceBlock();
    mc.choices = mc.choices.slice(0, 1);
    const second = createRow();
    second.columns[0]!.blocks = [createParagraphBlock(), mc];
    const first = createRow(2);
    first.columns[1]!.blocks = [createMultipleChoiceBlock()];
    warmUp.rows = [first, second];
    doc.sections = [createSection(), warmUp];
    return doc;
}

function Screen({ k, doc }: { k: string; doc: unknown }) {
    const { status, permanentError, permanentDetail, retry } = useAutosave(k, async () => {
        validateForSave(doc);
    });
    return (
        <div data-status={status}>
            {status === 'error' && (
                <SaveFailedNotice
                    permanentError={permanentError}
                    permanentDetail={permanentDetail}
                    failedText="Not saved. Trying again…"
                    retryText="Retry now"
                    onRetry={retry}
                />
            )}
        </div>
    );
}

describe('a save that fails validation (C7)', () => {
    it('names the section and block a teacher can find, with the path under Details', async () => {
        const doc = brokenDocument();
        const view = render(<Screen k="k0" doc={doc} />);
        view.rerender(<Screen k="k1" doc={doc} />);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        const alert = screen.getByRole('alert');
        expect(alert.textContent).toBe(
            'This activity can’t be saved: something in the 2nd Multiple choice in Section 2 (“Warm-up”) isn’t valid. Fix or remove it and saving starts again.',
        );
        // The technical words are not in the sentence…
        expect(alert.textContent).not.toMatch(/sections\.|choices/);
        // …they are behind Details, closed until opened.
        const details = view.container.querySelector('details');
        expect(details?.open).toBe(false);
        expect(details?.querySelector('summary')?.textContent).toBe('Details');
        expect(details?.querySelector('code')?.textContent).toMatch(/^sections\.1\.rows\.1\.columns\.0\.blocks\.1\.choices: /);
        // A permanent failure offers no Retry: retrying cannot help.
        expect(screen.queryByRole('button', { name: 'Retry now' })).toBeNull();
    });

    it('a valid document passes the gate unchanged', () => {
        const doc = createEmptyDocument();
        expect(validateForSave(doc).sections).toHaveLength(doc.sections.length);
    });

    it('names the other places in the editor’s words', () => {
        const doc = { referencePanel: { blocks: [{ type: 'table' }] } };
        expect(describeIssuePlace(doc, ['referencePanel', 'blocks', 0, 'rows'])).toBe('the Table in the reference panel');
        expect(describeIssuePlace({}, ['teacherGuide', 'blocks'])).toBe('the teacher guide');
        expect(describeIssuePlace({}, ['meta', 'title'])).toBe('the activity’s title');
        expect(describeIssuePlace({}, ['meta', 'print', 'margin'])).toBe('the activity’s settings');
        expect(describeIssuePlace({}, ['calculator', 'mode'])).toBe('the calculator settings');
        expect(describeIssuePlace({ sections: [{ rows: [] }] }, ['sections', 0, 'rows', 2, 'columns'])).toBe('row 3 of Section 1');
        expect(describeIssuePlace({}, [])).toBe('the activity');
        const two = { sections: [{ rows: [{ columns: [{ blocks: [{ type: 'table' }, { type: 'essay' }] }, { blocks: [{ type: 'table' }] }] }] }] };
        expect(describeIssuePlace(two, ['sections', 0, 'rows', 0, 'columns', 1, 'blocks', 0, 'cells'])).toBe('the 2nd Table in Section 1');
        expect(describeIssuePlace(two, ['sections', 0, 'rows', 0, 'columns', 0, 'blocks', 1])).toBe('the Essay in Section 1');
    });

    it('the editor uses this gate and this notice (the wiring the rows above stand in for)', () => {
        const src = readFileSync(resolve(__dirname, '../routes/ActivityEditor.tsx'), 'utf8');
        expect(src).toMatch(/const valid = validateForSave\(doc\);/);
        expect(src).toMatch(/<SaveFailedNotice[\s\S]*?permanentDetail=\{permanentDetail\}/);
        expect(src).not.toMatch(/Document failed validation/);
    });
});
