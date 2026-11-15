// draft-preview.test.ts — "Preview as student" (schema-shortlist.md S8): the
// draft is served the way a student gets it (no keys, hints or solutions;
// orderings shuffled; seeded numbers drawn), and Check grades it for real,
// against the same numbers, without any request leaving the browser.
import { describe, expect, it } from 'vitest';
import { ActivityDocument } from '@activity/schema';
import { buildDraftPreview } from '../src/preview/draftPreview.js';
import { emptySectionResponses } from '../src/index.js';

const t = (text: string) => ({ type: 'text', text, marks: [] });
const uuid = () => crypto.randomUUID();
const C1 = crypto.randomUUID();
const C2 = crypto.randomUUID();
const ITEMS = ['one', 'two', 'three', 'four', 'five', 'six'].map((x) => ({ id: uuid(), content: [t(x)] }));

function draft() {
  const blank = { type: 'blank', id: uuid(), answer: 'a', acceptableAnswers: [], interchangeableWithPrevious: false, answerType: 'numeric', hint: [t('BLANK-HINT')] };
  return ActivityDocument.parse({
    schemaVersion: 2,
    meta: { title: 'P', course: 'Y7', seedVars: [{ name: 'a', spec: { kind: 'int', min: 10, max: 99 } }] },
    sections: [{
      id: uuid(),
      rows: [{ id: uuid(), columns: [{ id: uuid(), blocks: [
        { id: uuid(), type: 'fill_in_blank', content: [t('{a} = '), blank], skills: [] },
        { id: uuid(), type: 'multiple_choice', prompt: [t('Which?')], multiSelect: false, hint: [t('MC-HINT')], skills: [],
          choices: [{ id: C1, content: [t('yes')], correct: true }, { id: C2, content: [t('no')], correct: false }] },
        { id: uuid(), type: 'ordering', prompt: [t('Order')], items: ITEMS, skills: [] },
      ] }] }],
    }],
  });
}

describe('buildDraftPreview', () => {
  it('serves what a student gets: no keys, no hints, numbers drawn, no seed specs', () => {
    const p = buildDraftPreview(draft(), 'student-1');
    const json = JSON.stringify(p.served);
    expect(json).not.toContain('MC-HINT');
    expect(json).not.toContain('"correct"');
    expect(json).not.toContain('"answer"');
    expect(json).not.toContain('seedVars');
    expect(json).not.toContain('{a}');
    expect(json).toMatch(/"text":"\d\d = "/);
  });

  it('an ordering is not served in its answer order', () => {
    const p = buildDraftPreview(draft(), 'student-1');
    const block = JSON.parse(JSON.stringify(p.served)).sections[0].rows[0].columns[0].blocks[2];
    expect(block.items.map((i: { id: string }) => i.id)).not.toEqual(ITEMS.map((i) => i.id));
  });

  it('Check grades for real, against the same drawn number', async () => {
    const d = draft();
    const p = buildDraftPreview(d, 'student-1');
    const served = JSON.parse(JSON.stringify(p.served));
    const drawn = /"text":"(\d\d) = "/.exec(JSON.stringify(p.served))![1]!;
    const blocks = served.sections[0].rows[0].columns[0].blocks;
    const blankId = blocks[0].content[1].id;
    const mcId = blocks[1].id;
    const sectionId = served.sections[0].id;
    const right = await p.checkService.checkSection({
      wireVersion: 1 as never, activityId: 'a', versionId: 'v', sectionId,
      responses: { ...emptySectionResponses(), blanks: { [blankId]: drawn }, choices: { [mcId]: [C1] } },
    });
    expect(right.items[blankId]?.verdict).toBe('correct');
    expect(right.items[mcId]?.verdict).toBe('correct');
    const wrong = await p.checkService.checkSection({
      wireVersion: 1 as never, activityId: 'a', versionId: 'v', sectionId,
      responses: { ...emptySectionResponses(), blanks: { [blankId]: '0' }, choices: { [mcId]: [C2] } },
    });
    expect(wrong.items[blankId]?.verdict).toBe('incorrect');
    expect(JSON.stringify(wrong.items[mcId])).toContain('MC-HINT');
  });

  it('a blank\'s hint IS served (it is a pre-check affordance, unlike a question hint)', () => {
    expect(JSON.stringify(buildDraftPreview(draft(), 'student-1').served)).toContain('BLANK-HINT');
  });

  it('an ordering left as served is unanswered; the authored order is right', async () => {
    const p = buildDraftPreview(draft(), 'student-1');
    const served = JSON.parse(JSON.stringify(p.served));
    const block = served.sections[0].rows[0].columns[0].blocks[2];
    const ask = (order: string[]) =>
      p.checkService.checkSection({
        wireVersion: 1 as never, activityId: 'a', versionId: 'v', sectionId: served.sections[0].id,
        responses: { ...emptySectionResponses(), orderings: { [block.id]: order } },
      });
    expect((await ask(block.items.map((i: { id: string }) => i.id))).items[block.id]).toBeUndefined();
    expect((await ask(ITEMS.map((i) => i.id))).items[block.id]?.verdict).toBe('correct');
  });

  it('another preview student draws other numbers', () => {
    const nums = new Set(
      ['s1', 's2', 's3', 's4', 's5'].map((s) => /"text":"(\d\d) = "/.exec(JSON.stringify(buildDraftPreview(draft(), s).served))![1]),
    );
    expect(nums.size).toBeGreaterThan(1);
  });
});
