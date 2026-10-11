// =============================================================================
// numberLineTolerance.test.ts — a number line's marking follows its tick step
// -----------------------------------------------------------------------------
// The importer used to set a fixed 0.1 tolerance before the axis was even read,
// so on a tenths line 0.6 was marked RIGHT for 0.7, and on a hundredths line
// anything from 0.30 to 0.40 was right for 0.35 (found 2026-10-12 while
// checking the Y7 number strand; author ruling: a quarter of the step, capped
// at 0.1). Held to the SERVER GRADER's verdict on an imported document — the
// verdict is the output that matters, not the stored number.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { ActivityDocument, ActivityMeta } from '@activity/schema';
import { emptySectionResponses } from '@activity/viewer';
import { gradeSection } from '../../../viewer/src/server/grading/index.js';
import { getMarkdownImporter, numberLineTolerance } from '../lib/markdownToTiptap';
import { tiptapToActivity } from '../lib/serialize';
import { wrapBlocksStrict } from '../lib/batchImportPipeline';

let importMd: Awaited<ReturnType<typeof getMarkdownImporter>>;
beforeAll(async () => {
    importMd = await getMarkdownImporter();
});

function grader(lines: string[]) {
    const r = importMd(['```numberline', ...lines, '```'].join('\n'));
    expect(r.warnings).toEqual([]);
    const doc = ActivityDocument.parse(
        tiptapToActivity(wrapBlocksStrict(r.blocks), ActivityMeta.parse({ title: 't', course: 'c' })),
    );
    const s = JSON.stringify(doc);
    const id = s.match(/"id":"([0-9a-f-]{36})","type":"number_line"/)![1]!;
    const sectionId = (doc as { sections: { id: string }[] }).sections[0]!.id;
    return (work: Record<string, unknown>) =>
        gradeSection({
            document: doc as never,
            sectionId,
            responses: { ...emptySectionResponses(), graphs: { [id]: work as never } },
        }).items[id]?.verdict;
}
const plot = (...xs: number[]) => ({ interaction: 'plot_point', points: xs.map((x) => [x, 0]) });

describe('a number line is marked to its own tick step', () => {
    it('tenths: only 0.7 is right for 0.7 — the neighbouring ticks are wrong', () => {
        const grade = grader(['prompt: Plot 0.7.', 'axis: 0..1 step 0.1', 'answer: 0.7']);
        expect(grade(plot(0.7))).toBe('correct');
        expect(grade(plot(0.6))).toBe('incorrect');
        expect(grade(plot(0.8))).toBe('incorrect');
    });

    it('hundredths: 0.36 and 0.34 are wrong for 0.35', () => {
        const grade = grader(['prompt: Plot 0.35.', 'axis: 0.3..0.4 step 0.01', 'answer: 0.35']);
        expect(grade(plot(0.35))).toBe('correct');
        expect(grade(plot(0.36))).toBe('incorrect');
        expect(grade(plot(0.34))).toBe('incorrect');
    });

    it('integer lines are unchanged: within 0.1 of the answer still counts', () => {
        const grade = grader(['prompt: Plot 3.', 'axis: -10..10 step 1', 'answer: 3']);
        expect(grade(plot(3.05))).toBe('correct');
        expect(grade(plot(4))).toBe('incorrect');
    });

    // 0.45 is a Shift-nudge position (a tenth of a tick): the old fixed 0.1
    // accepted it for 0.4. (0.3 would prove nothing — it fails by float rounding.)
    it('an interval endpoint on a tenths line is held to the step too', () => {
        const grade = grader(['prompt: Graph x >= 0.4.', 'axis: 0..1 step 0.1', 'answer: x >= 0.4']);
        expect(grade({ interaction: 'plot_interval', points: [], domain: { minX: 0.4, minStyle: 'closed' } })).toBe('correct');
        expect(grade({ interaction: 'plot_interval', points: [], domain: { minX: 0.45, minStyle: 'closed' } })).toBe('incorrect');
    });

    it('the rule: a quarter of the step, capped at 0.1', () => {
        expect(numberLineTolerance(1)).toBe(0.1);
        expect(numberLineTolerance(5)).toBe(0.1);
        expect(numberLineTolerance(0.1)).toBeCloseTo(0.025);
        expect(numberLineTolerance(0.01)).toBeCloseTo(0.0025);
    });
});
