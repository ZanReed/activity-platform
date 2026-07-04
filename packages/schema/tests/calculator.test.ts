// =============================================================================
// calculator.test.ts — Calculator tool schema (CalculatorRestrictions /
// CalculatorTool) and its activity-document wiring.
// -----------------------------------------------------------------------------
// Public-API tests (import from '@activity/schema' via ../src/index.js):
//   - CalculatorRestrictions defaults + partial fill + bounds
//   - CalculatorTool defaults + nested cascade + partial fill
//   - ActivityDocument.calculator is optional (absent on documents w/o it)
//   - createCalculatorTool() yields an enabled, full-capability default
//   - createEmptyDocument leaves the calculator absent
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ActivityDocument,
  CalculatorRestrictions,
  CalculatorTool,
  createCalculatorTool,
  createEmptyDocument,
} from '../src/index.js';

const DEFAULT_RESTRICTIONS = {
  mode: 'scientific',
  allowTrig: true,
  allowLogExp: true,
  allowedRegressionModels: ['linear', 'quadratic', 'exponential'],
};

const DEFAULT_TOOL = {
  enabled: false,
  restrictions: DEFAULT_RESTRICTIONS,
};

describe('CalculatorRestrictions', () => {
  it('applies permissive defaults from an empty object', () => {
    expect(CalculatorRestrictions.parse({})).toEqual(DEFAULT_RESTRICTIONS);
  });

  it('keeps explicit gates and preserves untouched defaults', () => {
    const parsed = CalculatorRestrictions.parse({ allowTrig: false });
    expect(parsed.allowTrig).toBe(false);
    expect(parsed.allowLogExp).toBe(true); // default preserved
    expect(parsed.mode).toBe('scientific'); // default preserved
  });

  it('accepts the graphing capability ceiling', () => {
    expect(CalculatorRestrictions.parse({ mode: 'graphing' }).mode).toBe(
      'graphing',
    );
  });

  it('rejects an unknown mode', () => {
    expect(() => CalculatorRestrictions.parse({ mode: 'rpn' })).toThrow();
  });

  // Stage 3 flag. Additive + defaulted, so documents stored before the field
  // existed parse to the permissive default (all models) — no schemaVersion bump.
  it('defaults allowedRegressionModels to all three models', () => {
    expect(CalculatorRestrictions.parse({}).allowedRegressionModels).toEqual([
      'linear',
      'quadratic',
      'exponential',
    ]);
  });

  it('accepts a subset of regression models', () => {
    const parsed = CalculatorRestrictions.parse({
      allowedRegressionModels: ['linear'],
    });
    expect(parsed.allowedRegressionModels).toEqual(['linear']);
    expect(parsed.allowTrig).toBe(true); // other defaults preserved
  });

  it('accepts an empty array (regression turned off)', () => {
    expect(
      CalculatorRestrictions.parse({ allowedRegressionModels: [] })
        .allowedRegressionModels,
    ).toEqual([]);
  });

  it('rejects an unknown regression model', () => {
    expect(() =>
      CalculatorRestrictions.parse({ allowedRegressionModels: ['cubic'] }),
    ).toThrow();
  });
});

describe('CalculatorTool', () => {
  it('yields a complete, disabled default from an empty object', () => {
    expect(CalculatorTool.parse({})).toEqual(DEFAULT_TOOL);
  });

  it('fills nested restriction defaults when only enabled is given', () => {
    const parsed = CalculatorTool.parse({ enabled: true });
    expect(parsed.enabled).toBe(true);
    expect(parsed.restrictions).toEqual(DEFAULT_RESTRICTIONS); // nested cascade
  });

  it('fills restriction sub-defaults from a partial restrictions object', () => {
    const parsed = CalculatorTool.parse({
      enabled: true,
      restrictions: { allowLogExp: false },
    });
    expect(parsed.restrictions.allowLogExp).toBe(false);
    expect(parsed.restrictions.allowTrig).toBe(true); // default preserved
    expect(parsed.restrictions.mode).toBe('scientific'); // default preserved
  });
});

describe('ActivityDocument.calculator', () => {
  it('is optional — a document without it parses with calculator undefined', () => {
    const doc = createEmptyDocument();
    const parsed = ActivityDocument.parse(doc);
    expect(parsed.calculator).toBeUndefined();
  });

  it('round-trips a configured calculator', () => {
    const doc = {
      ...createEmptyDocument(),
      calculator: { enabled: true, restrictions: { allowTrig: false } },
    };
    const parsed = ActivityDocument.parse(doc);
    expect(parsed.calculator?.enabled).toBe(true);
    expect(parsed.calculator?.restrictions.allowTrig).toBe(false);
    expect(parsed.calculator?.restrictions.allowLogExp).toBe(true); // cascade
  });
});

describe('createCalculatorTool', () => {
  it('produces an enabled, full-capability default tool', () => {
    expect(createCalculatorTool()).toEqual({
      enabled: true,
      restrictions: DEFAULT_RESTRICTIONS,
    });
  });

  it('produces a value that validates on an ActivityDocument', () => {
    const doc = { ...createEmptyDocument(), calculator: createCalculatorTool() };
    expect(() => ActivityDocument.parse(doc)).not.toThrow();
  });
});

describe('createEmptyDocument — calculator', () => {
  it('leaves the calculator absent (no calculator by default)', () => {
    expect(createEmptyDocument().calculator).toBeUndefined();
  });
});
