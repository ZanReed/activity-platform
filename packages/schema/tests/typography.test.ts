// =============================================================================
// typography.test.ts — Activity-wide typography schema (meta.typography)
// -----------------------------------------------------------------------------
// The field is ADDITIVE and OPTIONAL: the load-bearing tests here are the
// back-compat ones — a document stored before the field existed parses
// unchanged, and an untouched document carries no typography field at all.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ActivityDocument,
  ActivityMeta,
  Typography,
  createEmptyDocument,
} from '../src/index.js';

describe('Typography', () => {
  it('yields the defaults from an empty object', () => {
    expect(Typography.parse({})).toEqual({ font: 'default', fontSize: 16 });
  });

  it('accepts every menu font', () => {
    for (const font of [
      'default',
      'lexend',
      'atkinson-hyperlegible',
      'andika',
      'comic-neue',
    ] as const) {
      expect(Typography.parse({ font }).font).toBe(font);
    }
  });

  it('rejects an unknown font id', () => {
    expect(() => Typography.parse({ font: 'papyrus' })).toThrow();
  });

  it('rejects a base size outside 12..24', () => {
    expect(() => Typography.parse({ fontSize: 11 })).toThrow();
    expect(() => Typography.parse({ fontSize: 25 })).toThrow();
    expect(Typography.parse({ fontSize: 12 }).fontSize).toBe(12);
    expect(Typography.parse({ fontSize: 24 }).fontSize).toBe(24);
  });
});

describe('ActivityMeta.typography', () => {
  it('is absent when omitted — pre-typography documents parse unchanged', () => {
    const parsed = ActivityMeta.parse({ title: 'Worksheet' });
    expect(parsed.typography).toBeUndefined();
  });

  it('fills sub-defaults from a partial object', () => {
    const parsed = ActivityMeta.parse({
      title: 'Worksheet',
      typography: { font: 'lexend' },
    });
    expect(parsed.typography).toEqual({ font: 'lexend', fontSize: 16 });
  });

  it('is independent of print sizing (meta.print.fontSize untouched)', () => {
    const parsed = ActivityMeta.parse({
      title: 'Worksheet',
      typography: { fontSize: 20 },
    });
    expect(parsed.typography?.fontSize).toBe(20);
    expect(parsed.print.fontSize).toBe(11); // print body pt, its own layer
  });
});

describe('ActivityDocument — typography back-compat', () => {
  it('createEmptyDocument carries no typography field', () => {
    const doc = createEmptyDocument();
    expect(doc.meta.typography).toBeUndefined();
    expect(() => ActivityDocument.parse(doc)).not.toThrow();
  });

  it('a stored document with typography round-trips through parse', () => {
    const doc = createEmptyDocument();
    const withTypography = {
      ...doc,
      meta: {
        ...doc.meta,
        typography: { font: 'andika', fontSize: 18 },
      },
    };
    const parsed = ActivityDocument.parse(withTypography);
    expect(parsed.meta.typography).toEqual({ font: 'andika', fontSize: 18 });
  });
});
