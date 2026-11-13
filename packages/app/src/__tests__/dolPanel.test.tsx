// @vitest-environment jsdom
// =============================================================================
// dolPanel.test.tsx — a DoL marked, edited and removed in the editor (D65; GUI
// amendment 2026-11-12, D-1…D-7). The shared rules agree with the importer,
// the save path re-decides the retake, and the checkbox + panel write the
// `dol` attr only in the shapes the schema stores.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Editor, type JSONContent } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import { ActivityMeta } from '@activity/schema';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { tiptapToActivity } from '../lib/serialize';
import { dolShapeProblems } from '../lib/dolRules';
import { attemptsText, dolSectionSlice, passNote, readDolSection } from '../lib/dolPanelWords';
import { buildEditorExtensions } from '../editor/editorExtensions';
import { SectionBreakView } from '../editor/nodeViews/SectionBreakView';
import DolPanel from '../editor/nodeViews/DolPanel';

vi.mock('../lib/skillLabels', () => ({
    fetchSkillLabels: () =>
        Promise.resolve([
            { id: 's.one', label: 'Adds fractions' },
            { id: 's.two', label: 'Simplifies' },
        ]),
}));

afterEach(cleanup);

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const META = ActivityMeta.parse({ title: 'DoL', course: 'Year 9 Mathematics' });

const SEEDED = ['```meta', 'skill: s.one', 'dol_skills: s.one, s.two', '```',
    '## Check {checkpoint dol}',
    '```seed\na: int 2..9\nc: int 2..9\n```',
    'What is {a} + 1? {{=a+1}}',
    'What is {c} + 2? {{=c+2}}'].join('\n\n');
const REVIEW_ONLY = ['```meta', 'skill: s.one', 'dol_skills: s.one, s.two', '```',
    '## Check {checkpoint dol}',
    '```seed\nc: int 2..9\n```',
    'What is 2 + 2? {{=4}}',
    'What is {c} + 1? {{=c+1}}'].join('\n\n');
const UNSEEDED = ['```meta', 'skill: s.one', 'dol_skills: s.one', '```',
    '## Check {checkpoint dol}',
    'What is 2 + 2? {{=4}}'].join('\n\n');

const importedDol = (md: string) => {
    const blocks = convert(md).blocks;
    return { blocks, dol: blocks.find((b) => b.type === 'sectionBreak')?.attrs?.dol as { retake: boolean } };
};
const savedDol = (blocks: JSONContent[]) =>
    tiptapToActivity(wrapBlocksStrict(blocks), META).sections.find((s) => s.dol)?.dol;

describe('dolShapeProblems (one rule for the importer and the panel)', () => {
    it.each([
        ['fine', ['s.one', 's.two'], 2, 's.one', []],
        ['no skills', [], 1, undefined, ['no-skills']],
        ['first skill is not the activity skill', ['s.two'], 1, 's.one', ['first-skill']],
        ['one skill per item', ['s.one'], 2, undefined, ['item-count']],
    ])('%s', (_n, skills, items, primary, codes) => {
        expect(dolShapeProblems(skills, items, primary).map((p) => p.code)).toEqual(codes);
    });
});

describe('the retake: the importer and the save path agree (D-5)', () => {
    it.each([
        ['seeded primary', SEEDED, true],
        ['seed reaches only the review item', REVIEW_ONLY, false],
        ['unseeded', UNSEEDED, false],
    ])('%s', (_n, md, expected) => {
        const { blocks, dol } = importedDol(md);
        expect(dol.retake).toBe(expected);
        expect(savedDol(blocks)?.retake).toBe(expected);
    });

    it('an edit that takes the numbers out of the primary item drops the retake on save', () => {
        const { blocks, dol } = importedDol(SEEDED);
        expect(dol.retake).toBe(true);
        const breakAt = blocks.findIndex((b) => b.type === 'sectionBreak');
        const primaryAt = blocks.findIndex((b, i) => i > breakAt && JSON.stringify(b).includes('"blank"'));
        const primary = blocks[primaryAt]!;
        const blank = primary.content!.find((n) => n.type === 'blank')!;
        blocks[primaryAt] = {
            ...primary,
            content: [
                { type: 'text', text: 'What is 2 + 2? ' },
                { ...blank, attrs: { ...blank.attrs, answer: '4', acceptableAnswers: [], mistakeFeedback: [] } },
            ],
        };
        expect(savedDol(blocks)?.retake).toBe(false);
        expect(savedDol(blocks)?.seed).toBeDefined();
    });
});

function editorFor(md: string): Editor {
    return new Editor({
        extensions: buildEditorExtensions(),
        content: { type: 'doc', content: wrapBlocksStrict(convert(md).blocks).content },
    });
}
const breakPositions = (editor: Editor) => {
    const out: number[] = [];
    editor.state.doc.forEach((c, offset) => {
        if (c.type.name === 'sectionBreak') out.push(offset);
    });
    return out;
};

describe('the panel’s read of its section', () => {
    it('counts items and computes the retake as a save would', () => {
        const editor = editorFor(SEEDED);
        const read = readDolSection(dolSectionSlice(editor.state.doc, breakPositions(editor)[0]!));
        expect(read).toEqual({ items: 2, retake: true, refs: expect.arrayContaining(['a', 'c']) });
        editor.destroy();
    });

    it('words the attempts and the pass note', () => {
        expect(attemptsText(undefined, false)).toMatch(/One attempt, no retake/);
        expect(attemptsText([{ columns: ['a'], rows: [[1], [2], [3]], total: 3 }, { columns: ['c'], rows: [[1], [2]], total: 2 }], true))
            .toMatch(/6 versions\. Two attempts/);
        expect(passNote(false, 'Adds fractions')).toMatch(/won’t record a pass/);
        expect(passNote(true, 'Adds fractions')).toMatch(/counts toward “Adds fractions”/);
    });
});

function viewProps(editor: Editor, pos: number, updateAttributes = vi.fn()): NodeViewProps {
    return {
        node: editor.state.doc.nodeAt(pos)!,
        editor,
        getPos: () => pos,
        updateAttributes,
        selected: false,
    } as unknown as NodeViewProps;
}

describe('the DoL checkbox (D-1, D-2)', () => {
    const TWO_SECTIONS = ['## One {checkpoint}', 'What is 1 + 1? {{=2}}', '## Two {checkpoint}', 'What is 2 + 2? {{=4}}'].join('\n\n');

    it('ticking it marks the DoL and makes it a checkpoint', () => {
        const editor = editorFor(TWO_SECTIONS);
        const update = vi.fn();
        render(<SectionBreakView {...viewProps(editor, breakPositions(editor)[1]!, update)} />);
        fireEvent.click(screen.getByLabelText('This section is the DoL'));
        expect(update).toHaveBeenCalledWith({ dol: { skills: [], retake: false }, isCheckpoint: true });
        editor.destroy();
    });

    it('a DoL is locked as a checkpoint, and another section can’t be one too', () => {
        const editor = editorFor(SEEDED.replace('## Check {checkpoint dol}', '## Lesson {checkpoint}\n\nHi.\n\n## Check {checkpoint dol}'));
        const [lesson, check] = breakPositions(editor);
        render(<SectionBreakView {...viewProps(editor, check!)} />);
        expect((screen.getByRole('checkbox', { name: /Check here/ }) as HTMLInputElement).disabled).toBe(true);
        cleanup();
        render(<SectionBreakView {...viewProps(editor, lesson!)} />);
        expect((screen.getByLabelText('This section is the DoL') as HTMLInputElement).disabled).toBe(true);
        editor.destroy();
    });

    it('unticking a seeded DoL asks first, then clears it', () => {
        const editor = editorFor(SEEDED);
        const update = vi.fn();
        render(<SectionBreakView {...viewProps(editor, breakPositions(editor)[0]!, update)} />);
        fireEvent.click(screen.getByLabelText('This section is the DoL'));
        expect(update).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Remove the DoL' }));
        expect(update).toHaveBeenCalledWith({ dol: null });
        editor.destroy();
    });
});

describe('DolPanel (D-3, D-6)', () => {
    it('a fresh DoL: pick the first skill, written without blanks', async () => {
        const editor = editorFor(['## Check {checkpoint}', 'What is 2 + 2? {{=4}}'].join('\n\n'));
        const pos = breakPositions(editor)[0]!;
        const onChange = vi.fn();
        render(<DolPanel dol={{ skills: [], retake: false }} editor={editor} getPos={() => pos} onChange={onChange} />);
        expect(document.querySelector('[data-dol-problems]')!.textContent).toMatch(/can’t be published until the DoL has one/);
        await screen.findByRole('option', { name: 'Adds fractions' });
        fireEvent.click(screen.getByRole('button', { name: 'Add a skill' }));
        fireEvent.change(screen.getByLabelText('Skill for item 1'), { target: { value: 's.one' } });
        expect(onChange).toHaveBeenLastCalledWith({ skills: ['s.one'], retake: false });
        expect(document.querySelector('[data-dol-pass]')!.textContent).toMatch(/won’t record a pass/);
        editor.destroy();
    });

    it('says when items and skills don’t match', () => {
        const editor = editorFor(SEEDED);
        const pos = breakPositions(editor)[0]!;
        render(<DolPanel dol={{ skills: ['s.one'], retake: true }} editor={editor} getPos={() => pos} onChange={() => {}} />);
        expect(document.querySelector('[data-dol-problems]')!.textContent).toMatch(/2 items to grade and 1 skill/);
        editor.destroy();
    });

    it('on a Bank copy, its skills are shown by name and not editable', async () => {
        const editor = editorFor(SEEDED);
        (editor.storage as unknown as { sectionBreak: { isCopy: boolean } }).sectionBreak.isCopy = true;
        const pos = breakPositions(editor)[0]!;
        render(<DolPanel dol={{ skills: ['s.one', 's.two'], retake: true }} editor={editor} getPos={() => pos} onChange={() => {}} />);
        await waitFor(() => expect(screen.getByRole('list', { name: 'DoL skills' }).textContent).toMatch(/Adds fractions \(decides the pass\)/));
        expect(screen.queryByRole('combobox')).toBeNull();
        expect(document.querySelector('[data-dol-pass]')!.textContent).toMatch(/counts toward “Adds fractions”/);
        editor.destroy();
    });
});

describe('Fable review 2026-11-12', () => {
    const storageOf = (editor: Editor) =>
        (editor.storage as unknown as { sectionBreak: { isCopy: boolean; seedNames: string[]; listeners: Set<() => void> } })
            .sectionBreak;

    it('P0: an activity-level variable inside the DoL is called out', () => {
        const editor = editorFor(['## Check {checkpoint}', 'What is {a} + 1? {{=a+1}}'].join('\n\n'));
        storageOf(editor).seedNames = ['a', 'b'];
        const pos = breakPositions(editor)[0]!;
        render(<DolPanel dol={{ skills: ['s.one'], retake: false }} editor={editor} getPos={() => pos} onChange={() => {}} />);
        expect(document.querySelector('[data-dol-activity-vars]')!.textContent).toMatch(/^\{a\} is a seeded variable of the whole activity/);
        editor.destroy();
    });

    it('P0: a DoL variable of the same name is the DoL’s own, so no call-out', () => {
        const editor = editorFor(SEEDED);
        storageOf(editor).seedNames = ['a'];
        const pos = breakPositions(editor)[0]!;
        const seed = { tables: [{ columns: ['a'], rows: [[2], [3]], total: 2 }] };
        render(<DolPanel dol={{ skills: ['s.one'], retake: true, seed }} editor={editor} getPos={() => pos} onChange={() => {}} />);
        expect(document.querySelector('[data-dol-activity-vars]')).toBeNull();
        editor.destroy();
    });

    it('P1: a leftover importer marker is written in the stored shape', async () => {
        const editor = editorFor(['## Check {checkpoint}', 'What is 2 + 2? {{=4}}'].join('\n\n'));
        const pos = breakPositions(editor)[0]!;
        const onChange = vi.fn();
        render(<DolPanel dol={{ pending: true }} editor={editor} getPos={() => pos} onChange={onChange} />);
        await screen.findByRole('option', { name: 'Adds fractions' });
        fireEvent.change(screen.getByLabelText('Skill for item 1'), { target: { value: 's.one' } });
        expect(onChange).toHaveBeenLastCalledWith({ skills: ['s.one'], retake: false });
        editor.destroy();
    });

    // Was P1 (2026-11-12): clearing a seeded DoL's only skill kept it, because
    // an empty list dropped the whole DoL on save. Since the 2026-11-13 ruling
    // an empty list is saved, numbers and all, and publishing refuses it.
    it('clearing a seeded DoL’s only skill saves an empty list and keeps its numbers', async () => {
        const editor = editorFor(SEEDED);
        const pos = breakPositions(editor)[0]!;
        const onChange = vi.fn();
        const seed = { tables: [{ columns: ['a'], rows: [[2], [3]], total: 2 }] };
        render(<DolPanel dol={{ skills: ['s.one'], retake: true, seed }} editor={editor} getPos={() => pos} onChange={onChange} />);
        await screen.findByRole('option', { name: 'Adds fractions' });
        fireEvent.change(screen.getByLabelText('Skill for item 1'), { target: { value: '' } });
        expect(onChange).toHaveBeenLastCalledWith({ skills: [], retake: true, seed });
        editor.destroy();
    });

    it('P2: a cleared middle skill closes up, so numbers stay beside their items', async () => {
        const editor = editorFor(SEEDED);
        const pos = breakPositions(editor)[0]!;
        const onChange = vi.fn();
        render(<DolPanel dol={{ skills: ['s.one', 's.two'], retake: true }} editor={editor} getPos={() => pos} onChange={onChange} />);
        await screen.findAllByRole('option', { name: 'Simplifies' });
        fireEvent.click(screen.getByRole('button', { name: 'Add a skill' }));
        fireEvent.change(screen.getByLabelText('Skill for item 3'), { target: { value: 's.one' } });
        fireEvent.change(screen.getByLabelText('Skill for item 2'), { target: { value: '' } });
        expect(onChange).toHaveBeenLastCalledWith({ skills: ['s.one', 's.one'], retake: true });
        expect(screen.queryByLabelText('Skill for item 3')).toBeNull();
        editor.destroy();
    });

    it('P2: a copy learned after the panel opens still locks its skills', () => {
        const editor = editorFor(SEEDED);
        const pos = breakPositions(editor)[0]!;
        render(<DolPanel dol={{ skills: ['s.one', 's.two'], retake: true }} editor={editor} getPos={() => pos} onChange={() => {}} />);
        expect(screen.getAllByRole('combobox')).toHaveLength(2);
        act(() => {
            storageOf(editor).isCopy = true;
            storageOf(editor).listeners.forEach((f) => f());
        });
        expect(screen.queryByRole('combobox')).toBeNull();
        editor.destroy();
    });
});
