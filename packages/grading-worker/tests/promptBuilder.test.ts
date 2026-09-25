// E2a's prompt half (design §4 + EH-11): the built prompt is SNAPSHOTTED and
// keyed on the in-repo revs, so any wording change is a reviewed diff that
// forces a PROMPT_REV decision. The structural assertions are the ones the
// security posture rides on: the student response lives ONLY inside the data
// fence, and the anchor/descriptor paths both build (E1's two asserted paths).
import { describe, expect, it } from 'vitest';
import { buildGradingPrompt, renderInline } from '../src/promptBuilder.ts';
import { PROMPT_REV, SCHEMA_REV, DEFAULT_MODEL_ID } from '../src/constants.ts';
import {
  essayBlock,
  registryEntries,
  anchors,
  ADVERSARIAL_RESPONSES,
} from './fixtures.ts';

describe('buildGradingPrompt', () => {
  it('E2a snapshot: descriptors + anchors + registry (keyed on revs)', () => {
    const built = buildGradingPrompt({
      block: essayBlock,
      responseText: 'The slope stays the same because the ratio is constant.',
      anchors,
      registryEntries,
      levelDescriptors: '4: fully justified · 2: asserted without reasons',
    });
    expect({
      promptRev: PROMPT_REV,
      schemaRev: SCHEMA_REV,
      defaultModelId: DEFAULT_MODEL_ID,
      system: built.system,
      user: built.user,
    }).toMatchSnapshot();
  });

  it('anchors path: graded examples render; empty anchors leave no section', () => {
    const withAnchors = buildGradingPrompt({
      block: essayBlock,
      responseText: 'x',
      anchors,
      registryEntries: [],
    });
    expect(withAnchors.user).toContain('## Graded examples');
    expect(withAnchors.user).toContain('unit rates compared correctly');

    const without = buildGradingPrompt({
      block: essayBlock,
      responseText: 'x',
      anchors: [],
      registryEntries: [],
    });
    expect(without.user).not.toContain('## Graded examples');
  });

  it('descriptors path: level descriptors render only when supplied', () => {
    const withDesc = buildGradingPrompt({
      block: essayBlock,
      responseText: 'x',
      anchors: [],
      registryEntries: [],
      levelDescriptors: 'L4: complete',
    });
    expect(withDesc.user).toContain('### Level descriptors');
    const without = buildGradingPrompt({
      block: essayBlock,
      responseText: 'x',
      anchors: [],
      registryEntries: [],
    });
    expect(without.user).not.toContain('### Level descriptors');
  });

  it('EH-11: the student response appears ONLY inside the data fence', () => {
    for (const adversarial of ADVERSARIAL_RESPONSES) {
      const built = buildGradingPrompt({
        block: essayBlock,
        responseText: adversarial.response,
        anchors: [],
        registryEntries,
      });
      const fenceStart = built.user.indexOf('<<<STUDENT_RESPONSE');
      const fenceEnd = built.user.indexOf('STUDENT_RESPONSE>>>');
      expect(fenceStart).toBeGreaterThan(-1);
      expect(fenceEnd).toBeGreaterThan(fenceStart);
      // The adversarial text sits inside the fence and NOWHERE else.
      const inside = built.user.slice(fenceStart, fenceEnd);
      expect(inside).toContain(adversarial.response);
      const outside = built.user.slice(0, fenceStart) + built.user.slice(fenceEnd);
      expect(outside).not.toContain(adversarial.response);
      // And the system prompt names the fence as data, explicitly.
      expect(built.system).toContain('DATA');
    }
  });

  it('EH-12: non-text-renderable prompt content flags lossyRender', () => {
    const built = buildGradingPrompt({
      block: {
        ...essayBlock,
        prompt: [
          { type: 'text', text: 'Grade the graph: ' },
          { type: 'image_ref' },
        ],
      },
      responseText: 'x',
      anchors: [],
      registryEntries: [],
    });
    expect(built.lossyRender).toBe(true);
  });

  it('renderInline: text, inline math and hard breaks; unknown kinds are lossy', () => {
    expect(
      renderInline([
        { type: 'text', text: 'slope is ' },
        { type: 'math_inline', latex: '\\frac{3}{4}' },
        { type: 'hard_break' },
        { type: 'text', text: 'per hour' },
      ]),
    ).toEqual({ text: 'slope is $\\frac{3}{4}$\nper hour', lossy: false });
    expect(renderInline([{ type: 'mystery' }]).lossy).toBe(true);
  });
});
