// The popover-vs-dialog gate for definition content. This is a DATA-LOSS guard,
// not a styling choice: DefinitionEditPopover commits its inline-only draft over
// the mark's whole content on every exit path (Done, Escape, outside-click), so
// anything it cannot represent losslessly must never reach it in editable mode.
// See packages/app/src/editor/components/definitionShape.ts and
// docs/design/definition-rich-content.md (D5).
import { describe, it, expect } from 'vitest';
import type { DefinitionBlock } from '@activity/schema';
import {
    isSimpleDefinition,
    simpleDefinitionParts,
    partsToDefinitionContent,
} from '../editor/components/definitionShape';

const para = (text: string): DefinitionBlock => ({
    type: 'paragraph',
    content: [{ type: 'text', text, marks: [] }],
});
const image = (src: string): DefinitionBlock => ({
    type: 'image',
    src,
    alt: '',
});
const mathBlock: DefinitionBlock = { type: 'math_block', latex: 'a^2' };
const heading: DefinitionBlock = {
    type: 'heading',
    level: 3,
    content: [{ type: 'text', text: 'Forms', marks: [] }],
};

describe('isSimpleDefinition — what the popover may edit', () => {
    it('accepts the four representable shapes', () => {
        expect(isSimpleDefinition([])).toBe(true);
        expect(isSimpleDefinition([para('a divisor')])).toBe(true);
        expect(isSimpleDefinition([image('https://x/y.png')])).toBe(true);
        expect(
            isSimpleDefinition([para('a divisor'), image('https://x/y.png')]),
        ).toBe(true);
    });

    it('accepts every shape the schema legacy upgrades produce', () => {
        // This is what keeps existing definitions popover-editable rather than
        // silently turning them read-only: a v1 string upgrades to one
        // paragraph, and a v2 `image` attr to a trailing image block (D7).
        expect(isSimpleDefinition([para('upgraded v1')])).toBe(true);
        expect(
            isSimpleDefinition([para('upgraded v2'), image('https://x/y.png')]),
        ).toBe(true);
    });

    it('rejects anything richer', () => {
        expect(isSimpleDefinition([mathBlock])).toBe(false);
        expect(isSimpleDefinition([heading])).toBe(false);
        expect(isSimpleDefinition([para('a'), para('b')])).toBe(false);
        expect(isSimpleDefinition([para('a'), mathBlock])).toBe(false);
        expect(
            isSimpleDefinition([image('https://x/1.png'), image('https://x/2.png')]),
        ).toBe(false);
        expect(
            isSimpleDefinition([{ type: 'bullet_list', items: [] }]),
        ).toBe(false);
    });

    it('rejects an image BEFORE a paragraph (the popover renders image last)', () => {
        // Order matters: the popover always writes the image after the text, so
        // accepting this shape would silently reorder the author's content.
        expect(isSimpleDefinition([image('https://x/y.png'), para('a')])).toBe(
            false,
        );
    });
});

describe('simpleDefinitionParts / partsToDefinitionContent', () => {
    it('splits and rebuilds losslessly', () => {
        const content = [para('a divisor'), image('https://x/y.png')];
        const parts = simpleDefinitionParts(content);
        expect(parts).not.toBeNull();
        expect(partsToDefinitionContent(parts!)).toEqual(content);
    });

    it('drops an empty paragraph on rebuild', () => {
        expect(
            partsToDefinitionContent({
                paragraph: { type: 'paragraph', content: [] },
                image: null,
            }),
        ).toEqual([]);
    });

    it('returns null parts for rich content, so callers cannot edit it', () => {
        expect(simpleDefinitionParts([para('a'), mathBlock])).toBeNull();
    });
});
