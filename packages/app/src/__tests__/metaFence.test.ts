import { describe, it, expect, beforeAll } from 'vitest';
import {
    getMarkdownImporter,
    type MarkdownImporter,
} from '../lib/markdownToTiptap';

// The ```meta fence (taxonomy arc Drop 2). What these pin: the fence is a pure
// SIDE CHANNEL (no blocks anywhere), it shares normalizeTags with the drawer's
// chip input rather than re-implementing normalization, and a malformed line
// costs the author a warning — never the body content in the same paste.

let convert: MarkdownImporter;
beforeAll(async () => {
    convert = await getMarkdownImporter();
});

const fence = (body: string) => '```meta\n' + body + '\n```';

describe('```meta fence', () => {
    it('reads every key', () => {
        const r = convert(
            fence(
                'title: Factoring Trinomials\ncourse: Algebra I\nunit: Quadratics\ntags: factoring, vertex form\nrole: lesson',
            ),
        );
        expect(r.meta).toEqual({
            title: 'Factoring Trinomials',
            course: 'Algebra I',
            unit: 'Quadratics',
            tags: ['factoring', 'vertex form'],
            pedagogicalRole: 'lesson',
        });
        expect(r.warnings).toEqual([]);
    });

    it('contributes NO blocks — body, panel, or otherwise', () => {
        const r = convert(fence('course: Algebra I'));
        expect(r.blocks).toEqual([]);
        expect(r.referencePanel).toBeUndefined();
    });

    it('leaves surrounding body content untouched', () => {
        const r = convert(
            `# Warm Up\n\n${fence('tags: factoring')}\n\nSolve for {{x}}.`,
        );
        expect(r.meta).toEqual({ tags: ['factoring'] });
        expect(r.blocks.length).toBeGreaterThan(0);
        expect(r.blocks.some((b) => b.type === 'meta')).toBe(false);
    });

    it('resolves regardless of where the fence sits (pre-pass)', () => {
        const top = convert(`${fence('unit: Quadratics')}\n\nSome text.`);
        const bottom = convert(`Some text.\n\n${fence('unit: Quadratics')}`);
        expect(top.meta).toEqual(bottom.meta);
        expect(bottom.meta?.unit).toBe('Quadratics');
    });

    it('is absent from the result when there is no fence', () => {
        expect(convert('Just a paragraph.').meta).toBeUndefined();
    });

    // The whole reason normalizeTags is a shared module (R5): a second
    // normalization here would fragment the vocabulary between write paths.
    it('normalizes tags through the SAME contract as the chip input', () => {
        const r = convert(fence('tags:  Factoring , WORD   PROBLEMS , factoring'));
        expect(r.meta?.tags).toEqual(['factoring', 'word problems']);
    });

    // Without this key every imported activity lands as "Untitled activity"
    // and is renamed by hand — the dominant cost of importing a catalogue.
    it('reads a title, preserving its case and inner punctuation', () => {
        expect(convert(fence('title: Factoring Trinomials (a > 1)')).meta?.title)
            .toBe('Factoring Trinomials (a > 1)');
    });

    it('trims a title but does not lowercase it', () => {
        expect(convert(fence('title:   Vertex Form   ')).meta?.title).toBe(
            'Vertex Form',
        );
    });

    // D5's unit naming convention is literally "Unit 2: Quadratics" — a colon
    // INSIDE the value. Only the first colon separates key from value.
    it('keeps colons inside a value (the "Unit 2: Quadratics" convention)', () => {
        expect(convert(fence('unit: Unit 2: Quadratics')).meta?.unit).toBe(
            'Unit 2: Quadratics',
        );
        expect(convert(fence('title: Warm-Up: Factoring')).meta?.title).toBe(
            'Warm-Up: Factoring',
        );
    });

    it('preserves unicode in tags', () => {
        expect(convert(fence('tags: Māori')).meta?.tags).toEqual(['māori']);
    });

    it('accumulates tags across repeated lines and repeated fences', () => {
        const r = convert(
            `${fence('tags: factoring')}\n\n${fence('tags: graphing\ntags: algebra')}`,
        );
        expect(r.meta?.tags).toEqual(['factoring', 'graphing', 'algebra']);
    });

    // ---- activity settings -------------------------------------------------

    it('reads every settings key', () => {
        const r = convert(
            fence(
                'type: exit_ticket\nsubmission: locked\nfeedback: on_check\ncalculator: graphing',
            ),
        );
        expect(r.meta).toEqual({
            activityType: 'exit_ticket',
            submissionMode: 'locked',
            answerFeedback: 'on_check',
            calculatorMode: 'graphing',
        });
        expect(r.warnings).toEqual([]);
    });

    // ⚰ R4 (2026-08-24). A file written against the old format gets a sentence
    // that says what happened to its setting — NOT the default arm's "isn't a
    // recognized key", which reads as a typo and sends the author looking for
    // one. Both spellings, both keys.
    it('names the retired revision / grading keys instead of calling them typos', () => {
        for (const line of [
            'revision: locked',
            'revisionmode: locked',
            'grading: manual',
            'gradingmode: manual',
        ]) {
            const r = convert(fence(line));
            const warnings = [...r.warnings];
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain('was removed');
            expect(warnings[0]).not.toContain('isn’t a recognized key');
            expect(r.meta?.submissionMode).toBeUndefined();
        }
    });

    // R3 — `immediate` is RESERVED. Accepted so an old file keeps parsing, but
    // the author is told rather than left to infer it from behaviour.
    it('warns that feedback “immediate” is reserved and not active', () => {
        const r = convert(fence('feedback: immediate'));
        expect(r.meta?.answerFeedback).toBe('immediate');
        expect([...r.warnings].join(' ')).toContain('reserved');
    });

    // T1 — the combination the SERVER cannot enforce, so authoring refuses it.
    // The server sees one check request either way and cannot tell an
    // auto-check from a deliberate press.
    it('refuses feedback “immediate” together with submission “locked”', () => {
        const r = convert(fence('submission: locked\nfeedback: immediate'));
        expect(r.meta?.submissionMode).toBe('locked');
        expect(r.meta?.answerFeedback).toBe('on_check');
        expect([...r.warnings].join(' ')).toContain('cannot be combined');
    });

    // An AI (or a human) writing "Exit Ticket" should land on the enum, not a
    // scolding — spaces and hyphens fold to underscores.
    it('folds spaces and hyphens, and ignores case, in enum values', () => {
        expect(convert(fence('type: Exit Ticket')).meta?.activityType).toBe(
            'exit_ticket',
        );
        expect(convert(fence('type: warm-up')).meta?.activityType).toBe(
            'warm_up',
        );
        expect(convert(fence('feedback: On Check')).meta?.answerFeedback).toBe(
            'on_check',
        );
    });

    it('accepts the long-form key spellings too', () => {
        const r = convert(
            fence(
                'activitytype: review\nsubmissionmode: single\nanswerfeedback: on_check',
            ),
        );
        expect(r.meta?.activityType).toBe('review');
        expect(r.meta?.submissionMode).toBe('single');
        expect(r.meta?.answerFeedback).toBe('on_check');
        expect(r.warnings).toEqual([]);
    });

    it('warns and skips an out-of-range setting rather than guessing', () => {
        const r = convert(fence('submission: whenever'));
        expect(r.meta).toBeUndefined();
        expect(r.warnings.join(' ')).toMatch(/submission mode/);
        expect(r.warnings.join(' ')).toMatch(/single, locked, free/);
    });

    it('reads calculator: off as an explicit value, not an absence', () => {
        expect(convert(fence('calculator: off')).meta?.calculatorMode).toBe(
            'off',
        );
    });

    it('keeps good settings when one is out of range', () => {
        const r = convert(fence('type: exit_ticket\ncalculator: abacus'));
        expect(r.meta?.activityType).toBe('exit_ticket');
        expect(r.meta?.calculatorMode).toBeUndefined();
        expect(r.warnings.join(' ')).toMatch(/calculator/);
    });

    it('accepts role case-insensitively', () => {
        expect(convert(fence('role: LESSON')).meta?.pedagogicalRole).toBe(
            'lesson',
        );
    });

    it('warns and skips an unknown role rather than guessing', () => {
        const r = convert(fence('role: homework'));
        expect(r.meta?.pedagogicalRole).toBeUndefined();
        expect(r.warnings.join(' ')).toMatch(/role/i);
    });

    it('warns and skips an unrecognized key', () => {
        const r = convert(fence('coarse: Algebra I'));
        expect(r.meta).toBeUndefined();
        expect(r.warnings.join(' ')).toMatch(/coarse/);
    });

    it('warns on a key with no value', () => {
        const r = convert(fence('unit:'));
        expect(r.meta).toBeUndefined();
        expect(r.warnings.join(' ')).toMatch(/no value/i);
    });

    it('warns on a line that is not key: value', () => {
        const r = convert(fence('just some prose'));
        expect(r.warnings.join(' ')).toMatch(/isn’t a/);
    });

    // A typo'd key must not cost the author the body content in the same paste.
    it('keeps good keys when a sibling line is malformed', () => {
        const r = convert(fence('course: Algebra I\nnonsense line\nrole: review'));
        expect(r.meta?.course).toBe('Algebra I');
        expect(r.meta?.pedagogicalRole).toBe('review');
        expect(r.warnings.length).toBeGreaterThan(0);
    });

    // Degrade-to-visible: a fence that parsed nothing must not vanish silently.
    it('falls back to plain text when the whole fence is unparseable', () => {
        const r = convert(fence('???'));
        expect(r.meta).toBeUndefined();
        expect(r.blocks.length).toBeGreaterThan(0);
    });

    it('ignores blank lines inside the fence', () => {
        const r = convert(fence('course: Algebra I\n\n\nrole: practice'));
        expect(r.warnings).toEqual([]);
        expect(r.meta?.pedagogicalRole).toBe('practice');
    });
});
