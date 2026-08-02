// =============================================================================
// typography.test.tsx — the teacher's chosen worksheet font (S5 T4)
// -----------------------------------------------------------------------------
// The viewer ignored meta.typography entirely: tokens.css has carried the
// --activity-font-family seam since S0 and nothing ever set it. That is not a
// cosmetic gap — the font choices on offer are Atkinson Hyperlegible, Andika,
// Lexend and Comic Neue, chosen for low vision, early reading, reading fluency
// and dyslexia. Dropping the setting takes an accessibility decision away from
// the person who made it for a particular student.
//
// The font is asserted by NAME, never by pixels. The two surfaces deliver the
// same families through different pipelines (@fontsource here, R2 @font-face on
// published pages), so a rendered-glyph comparison would be measuring the
// delivery, not the choice.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  activityFontFamily,
  typographyVars,
} from '../../src/typography/fonts.js';
import { ViewerContainer } from '../../src/container/ViewerContainer.js';
import { createViewerStore, createMockCheckService } from '../../src/index.js';
import type { SanitizedActivityDocument } from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

describe('activityFontFamily — the name, and the stack behind it', () => {
  it('names each family the fontsource packages actually declare', () => {
    // These strings must match what @fontsource registers, or the rule resolves
    // to nothing and falls back silently — the failure mode the token guard
    // exists for, one level up.
    expect(activityFontFamily('lexend')).toContain('"Lexend"');
    expect(activityFontFamily('atkinson-hyperlegible')).toContain(
      '"Atkinson Hyperlegible"',
    );
    expect(activityFontFamily('andika')).toContain('"Andika"');
    expect(activityFontFamily('comic-neue')).toContain('"Comic Neue"');
  });

  it('always leaves a fallback stack behind the choice', () => {
    // A font file that fails to arrive must land on a real sans-serif, not on
    // whatever the browser calls a default serif.
    expect(activityFontFamily('lexend')).toContain('sans-serif');
  });

  it('returns null for the default, rather than a stack', () => {
    // Null means "set no property", so the stylesheet's own body token stays
    // in charge. Emitting a stack here would make `default` quietly mean
    // something other than "our font".
    expect(activityFontFamily('default')).toBeNull();
  });
});

describe('typographyVars', () => {
  it('sets family and size when a teacher chose a font', () => {
    expect(typographyVars({ font: 'lexend', fontSize: 18 })).toEqual({
      '--activity-font-family': activityFontFamily('lexend'),
      '--activity-font-size': '18px',
    });
  });

  it('sets only the size for the default font', () => {
    const vars = typographyVars({ font: 'default', fontSize: 16 });
    expect(vars['--activity-font-family']).toBeUndefined();
    expect(vars['--activity-font-size']).toBe('16px');
  });

  it('emits nothing at all when a document has no typography', () => {
    expect(typographyVars(undefined)).toEqual({});
  });
});

describe('the worksheet applies it', () => {
  const renderWith = (typography: unknown) => {
    const doc = structuredClone(sanitizedFixtureDocument()) as never as {
      meta: Record<string, unknown>;
    };
    if (typography === undefined) delete doc.meta.typography;
    else doc.meta.typography = typography;
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
      versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
      checkService: createMockCheckService({}),
    });
    return render(
      <ViewerContainer document={doc as never as SanitizedActivityDocument} store={store} />,
    );
  };

  it('puts the chosen family on the worksheet root', () => {
    const { container } = renderWith({ font: 'atkinson-hyperlegible', fontSize: 18 });
    const root = container.querySelector('.viewer') as HTMLElement;
    expect(root.style.getPropertyValue('--activity-font-family')).toContain(
      'Atkinson Hyperlegible',
    );
    expect(root.style.getPropertyValue('--activity-font-size')).toBe('18px');
  });

  it('records the chosen font id as an attribute', () => {
    // What the parity gate reads: an id is comparable across two surfaces
    // whose font PIPELINES differ, where a computed font-family string is not.
    const { container } = renderWith({ font: 'lexend', fontSize: 16 });
    expect(
      container.querySelector('.viewer')?.getAttribute('data-activity-font'),
    ).toBe('lexend');
  });

  it('leaves the family unset for the default font', () => {
    const { container } = renderWith({ font: 'default', fontSize: 16 });
    const root = container.querySelector('.viewer') as HTMLElement;
    expect(root.style.getPropertyValue('--activity-font-family')).toBe('');
    expect(root.getAttribute('data-activity-font')).toBe('default');
  });

  it('renders a document with no typography at all', () => {
    // Documents stored before the field existed. They must render, not crash.
    const { container } = renderWith(undefined);
    const root = container.querySelector('.viewer') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute('data-activity-font')).toBe('default');
  });
});
