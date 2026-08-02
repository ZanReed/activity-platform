// =============================================================================
// callout-icons.test.tsx — two grayscale-safe channels, not one (S5 follow-up)
// -----------------------------------------------------------------------------
// A worksheet gets photocopied. The published page has always paired a callout's
// tint with an ICON and kept the icon in print deliberately ("belt and
// suspenders", per the renderer's own print CSS); the viewer shipped with
// border STYLE alone, which is one channel where the page it replaces has two.
// The parity gate could not catch it — no rule ever named an icon — and it took
// a human reading the contact sheet.
//
// Inline SVG rather than the renderer's emoji, per ruling 4.1A: an emoji is a
// different drawing on every platform, a COLOUR glyph on a grayscale printer,
// and unsizable beside the text it labels.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Callout from '../../src/blocks/Callout.js';
import { CalloutIcon } from '../../src/icons/index.js';
import type { CalloutVariant } from '@activity/schema';

const VARIANTS: CalloutVariant[] = ['info', 'warning', 'success', 'note'];

const calloutBlock = (variant: CalloutVariant) =>
  ({
    id: `00000000-0000-4000-8000-00000000000${VARIANTS.indexOf(variant) + 1}`,
    type: 'callout',
    variant,
    content: [{ type: 'text', text: 'Watch the sign.' }],
  }) as never;

describe('every callout variant carries an icon', () => {
  for (const variant of VARIANTS) {
    it(`renders one for ${variant}`, () => {
      const { container } = render(
        <Callout block={calloutBlock(variant)} mode="screen" />,
      );
      const icon = container.querySelector('.viewer-callout__icon');
      expect(icon).not.toBeNull();
      expect(icon?.tagName.toLowerCase()).toBe('svg');
    });
  }

  it('gives the four variants FOUR DIFFERENT glyphs', () => {
    // The property that matters. Four identical icons would satisfy every
    // per-variant assertion above and carry no information at all — which is
    // the same failure the border-style rule guards against on its own channel.
    const shapes = VARIANTS.map((variant) => {
      const { container } = render(<CalloutIcon variant={variant} />);
      return container.innerHTML;
    });
    expect(new Set(shapes).size).toBe(4);
  });

  it('draws in currentColor so it prints as ink, never as a colour glyph', () => {
    // The reason these are not emoji: a colour glyph becomes a grey smudge on a
    // photocopier. currentColor means the print layer's ink flatten reaches it.
    const { container } = render(<CalloutIcon variant="warning" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('fill')).toBe('none');
  });

  it('scales with the text it sits beside', () => {
    const { container } = render(<CalloutIcon variant="info" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('1em');
    expect(svg?.getAttribute('height')).toBe('1em');
  });

  it('hides the icon from assistive tech', () => {
    // The sentence beside it already carries the meaning; announcing "warning"
    // before a sentence that says what to watch for is noise.
    const { container } = render(
      <Callout block={calloutBlock('warning')} mode="screen" />,
    );
    expect(
      container.querySelector('.viewer-callout__icon')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('marks the callout as a note for assistive tech', () => {
    const { container } = render(
      <Callout block={calloutBlock('info')} mode="screen" />,
    );
    expect(container.querySelector('.viewer-callout')?.getAttribute('role')).toBe(
      'note',
    );
  });

  it('keeps the authored content readable beside the icon', () => {
    const { container } = render(
      <Callout block={calloutBlock('note')} mode="screen" />,
    );
    expect(container.querySelector('.viewer-callout__body')?.textContent).toBe(
      'Watch the sign.',
    );
  });
});
