// =============================================================================
// print-config.test.ts — Print feature schema (PrintHeader / PrintConfig)
// -----------------------------------------------------------------------------
// Public-API tests (import from '@activity/schema' via ../src/index.js):
//   - PrintHeader defaults + partial fill
//   - PrintConfig defaults + partial fill + bounds
//   - ActivityMeta.print default cascade (the .default({}) re-parse) + partials
//   - FillInBlankBlock.workSpace (optional, no default, non-negative)
//   - createEmptyDocument populates a full default print config
// gridLines-through-createEmptyDocument round-trips live in document.test.ts.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ActivityDocument,
  ActivityMeta,
  PrintConfig,
  PrintHeader,
  FillInBlankBlock,
  createEmptyDocument,
  createFillInBlankBlock,
} from '../src/index.js';

const DEFAULT_HEADER = {
  name: true,
  date: true,
  period: false,
  class: false,
  score: false,
  custom: [],
};

const DEFAULT_PRINT = {
  paperSize: 'letter',
  columns: 1,
  workSpace: 0,
  fontSize: 11,
  problemSpacing: 1,
  margin: 0.5,
  gridLines: false,
  printReferencePanel: true,
  header: DEFAULT_HEADER,
};

describe('PrintHeader', () => {
  it('applies defaults from an empty object', () => {
    expect(PrintHeader.parse({})).toEqual(DEFAULT_HEADER);
  });

  it('keeps explicit toggles and custom labels', () => {
    const parsed = PrintHeader.parse({
      name: false,
      period: true,
      custom: ['Block', 'Teacher'],
    });
    expect(parsed.name).toBe(false);
    expect(parsed.period).toBe(true);
    expect(parsed.date).toBe(true); // default preserved
    expect(parsed.custom).toEqual(['Block', 'Teacher']);
  });
});

describe('PrintConfig', () => {
  it('yields a complete default config from an empty object', () => {
    expect(PrintConfig.parse({})).toEqual(DEFAULT_PRINT);
  });

  it('fills nested header defaults when only top-level fields are given', () => {
    const parsed = PrintConfig.parse({ columns: 2, paperSize: 'a4' });
    expect(parsed.columns).toBe(2);
    expect(parsed.paperSize).toBe('a4');
    expect(parsed.margin).toBe(0.5); // default preserved
    expect(parsed.header).toEqual(DEFAULT_HEADER); // nested cascade
  });

  it('rejects columns outside 1..3', () => {
    expect(() => PrintConfig.parse({ columns: 0 })).toThrow();
    expect(() => PrintConfig.parse({ columns: 4 })).toThrow();
  });

  it('rejects a non-integer column count', () => {
    expect(() => PrintConfig.parse({ columns: 1.5 })).toThrow();
  });

  it('rejects an unknown paper size', () => {
    expect(() => PrintConfig.parse({ paperSize: 'legal' })).toThrow();
  });

  it('rejects negative work space and margin', () => {
    expect(() => PrintConfig.parse({ workSpace: -1 })).toThrow();
    expect(() => PrintConfig.parse({ margin: -0.25 })).toThrow();
  });
});

describe('ActivityMeta.print', () => {
  it('defaults to a complete print config when omitted (default cascade)', () => {
    const parsed = ActivityMeta.parse({ title: 'Worksheet' });
    expect(parsed.print).toEqual(DEFAULT_PRINT);
  });

  it('fills print sub-defaults from a partial print object', () => {
    const parsed = ActivityMeta.parse({
      title: 'Worksheet',
      print: { columns: 3, header: { score: true } },
    });
    expect(parsed.print.columns).toBe(3);
    expect(parsed.print.fontSize).toBe(11); // default preserved
    expect(parsed.print.header.score).toBe(true);
    expect(parsed.print.header.name).toBe(true); // nested default preserved
  });
});

describe('FillInBlankBlock.workSpace', () => {
  it('is absent by default', () => {
    const parsed = FillInBlankBlock.parse(createFillInBlankBlock());
    expect(parsed.workSpace).toBeUndefined();
  });

  it('accepts a non-negative override', () => {
    const parsed = FillInBlankBlock.parse({
      ...createFillInBlankBlock(),
      workSpace: 3,
    });
    expect(parsed.workSpace).toBe(3);
  });

  it('rejects a negative override', () => {
    expect(() =>
      FillInBlankBlock.parse({ ...createFillInBlankBlock(), workSpace: -2 }),
    ).toThrow();
  });
});

describe('createEmptyDocument — print', () => {
  it('populates a full default print config', () => {
    const doc = createEmptyDocument();
    expect(doc.meta.print).toEqual(DEFAULT_PRINT);
    expect(() => ActivityDocument.parse(doc)).not.toThrow();
  });
});
