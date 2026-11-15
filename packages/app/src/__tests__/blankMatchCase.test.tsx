// @vitest-environment jsdom
// =============================================================================
// blankMatchCase.test.tsx — "Match case" on a text blank (schema-shortlist.md
// S1, author ruling 2026-11-15): text blanks ignore case unless they say so.
// The grader's half is viewer grading-corpus "text: case is ignored…"; this is
// the authoring half — `{{^Mg}}`, the save, and the popover checkbox.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { ActivityMeta } from '@activity/schema';
import BlankEditPopover from '../editor/components/BlankEditPopover';
import { parseBlankSpec } from '../lib/blankSyntax';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';

afterEach(cleanup);
let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});
const META = ActivityMeta.parse({ title: 'T', course: 'Y7' });

function blanksOf(md: string): Record<string, unknown>[] {
    const editor = new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert(md).blocks) });
    const doc = tiptapToActivity(editor.getJSON(), META);
    editor.destroy();
    const out: Record<string, unknown>[] = [];
    const walk = (v: unknown) => {
        if (!v || typeof v !== 'object') return;
        const o = v as Record<string, unknown>;
        if (o.type === 'blank') out.push(o);
        Object.values(o).forEach(walk);
    };
    walk(doc);
    return out;
}

describe('{{^…}}: a text blank that matches case', () => {
    it('parses ^ as Match case, and only on a text blank', () => {
        expect(parseBlankSpec('^Mg', '')).toMatchObject({ canonical: 'Mg', caseSensitive: true });
        expect(parseBlankSpec('Paris', '')?.caseSensitive).toBeUndefined();
        const numeric = parseBlankSpec('^=3', '');
        expect(numeric?.caseSensitive).toBeUndefined();
        expect(numeric?.warnings.join(' ')).toMatch(/text answers only/);
    });

    it('saves caseSensitive only when on, and survives a round trip', () => {
        const [plain, exact] = blanksOf('The capital is {{Paris}}. The symbol is {{^Mg}}.');
        expect(plain).not.toHaveProperty('caseSensitive');
        expect(exact).toMatchObject({ answer: 'Mg', caseSensitive: true });
        const doc = tiptapToActivity(
            new Editor({ extensions: buildEditorExtensions(), content: wrapBlocksStrict(convert('{{^Mg}}').blocks) }).getJSON(),
            META,
        );
        const again = tiptapToActivity(activityToTiptap(doc), META);
        expect(JSON.stringify(again)).toContain('"caseSensitive":true');
    });
});

describe('the popover\'s Match case checkbox', () => {
    function popover(answerType: 'text' | 'numeric', initialCaseSensitive?: boolean) {
        const onChange = vi.fn();
        const anchor = document.createElement('span');
        document.body.appendChild(anchor);
        render(
            <BlankEditPopover
                referenceElement={anchor} isOpen blankId="b1" initialAnswer="Mg" initialAcceptableAnswers={[]}
                initialHint={undefined} initialMistakeFeedback={undefined} initialInterchangeable={false}
                initialAnswerType={answerType} initialTolerance={undefined} initialUnit={undefined}
                initialAcceptableUnits={undefined} initialEquivalence={undefined}
                {...(initialCaseSensitive !== undefined ? { initialCaseSensitive } : {})}
                canGroupWithPrevious={false} onChange={onChange} onClose={() => {}}
            />,
        );
        return onChange;
    }

    it('a text blank offers it, off by default, and says what that means', () => {
        const onChange = popover('text');
        const box = screen.getByLabelText(/Match case/) as HTMLInputElement;
        expect(box.checked).toBe(false);
        expect(screen.getByText(/Paris and paris both count/)).toBeInTheDocument();
        fireEvent.click(box);
        expect(onChange).toHaveBeenCalledWith({ caseSensitive: true });
        fireEvent.click(box);
        expect(onChange).toHaveBeenLastCalledWith({ caseSensitive: undefined });
    });

    it('a numeric blank has no Match case', () => {
        popover('numeric');
        expect(screen.queryByLabelText(/Match case/)).toBeNull();
    });

    it('switching a matched-case text blank to numeric clears it', () => {
        const onChange = popover('text', true);
        fireEvent.click(screen.getByLabelText('Numeric'));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ answerType: 'numeric', caseSensitive: undefined }));
    });
});
