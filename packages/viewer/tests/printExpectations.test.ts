// =============================================================================
// printExpectations.test.ts — the print-contract guard suite (S5/T6)
// -----------------------------------------------------------------------------
// These guards keep the print table honest. They deliberately do NOT assert
// rendered DOM: the browser-side assertions are the T7 Playwright gate, which
// consumes this module. What is provable here — and worth proving before a
// browser is involved — is that the table is COMPLETE (no block type, treatment
// or roster class can be silently uncovered), COHERENT with the registry it
// claims to derive from, and free of the accidental-skip failure mode where a
// surface quietly stops being checked.
//
// The failure mode being guarded: a gate that is green because it asserts
// nothing. S4's E2E found a bug every unit test missed because a test double
// diverged from the real thing; the analogue here is a fixture roster that
// drifts from the registry, so a new block type ships unprinted and nothing
// goes red.
// =============================================================================

import { describe, expect, it } from 'vitest';
// Deep import, not the barrel: this is an internal helper with no consumer
// outside these guards, and export-reachability (policy P1) is right to
// refuse a barrel export that nothing in the product calls.
import { resolveBreakInside } from '../src/registry/printExpectations.js';
import {
  blockRegistry,
  registeredBlockTypes,
  printExpectations,
  suppressedChecksFor,
  targetFor,
  blockPrintRoster,
  variantPrintRoster,
  structuralPrintRoster,
  documentPrintRoster,
  BLOCK_ROOT,
} from '../src/index.js';
import type { BlockType, PrintCheck,  } from '../src/index.js';


const allChecksFor = (type: BlockType): readonly PrintCheck[] => printExpectations(type);

describe('printExpectations — roster completeness', () => {
  it('covers every registered block type (a new type cannot skip the gate)', () => {
    expect([...blockPrintRoster].sort()).toEqual([...registeredBlockTypes].sort());
  });

  it('produces at least one check for every registered type', () => {
    for (const type of registeredBlockTypes) {
      expect(allChecksFor(type).length, `${type} has no print checks`).toBeGreaterThan(0);
    }
  });

  it('names only registered types in the variant roster', () => {
    for (const entry of variantPrintRoster) {
      expect(registeredBlockTypes, `${entry.type} is not a registered block type`).toContain(
        entry.type,
      );
    }
  });

  it('gives every variant-roster entry a reason (an unexplained fixture is one nobody can prune)', () => {
    for (const entry of variantPrintRoster) {
      expect(entry.why.length, `${entry.type} variant entry has no reason`).toBeGreaterThan(10);
    }
  });

  it('keeps the structural and document rosters non-empty and self-describing', () => {
    // Non-emptiness is the load-bearing assertion: these two classes exist
    // because the per-block roster is structurally blind to layout and to the
    // document print layer. An empty roster would restore that blindness.
    expect(structuralPrintRoster.length).toBeGreaterThan(0);
    expect(documentPrintRoster.length).toBeGreaterThan(0);
    for (const entry of [...structuralPrintRoster, ...documentPrintRoster]) {
      expect(entry.rule.length, `${entry.id} has no stated rule`).toBeGreaterThan(20);
    }
  });

  it('holds the document roster to the student-facing print features it was created for', () => {
    // Outside-voice finding #1: these reach STUDENTS today via Ctrl+P on a
    // published page, and none of them is a block. If one is ever dropped from
    // the roster, it silently stops being gated — so the set is pinned.
    expect(structuralPrintRoster.map((entry) => entry.id)).toContain(
      'structure/multi-column-row',
    );
    for (const required of [
      'document/print-header',
      'document/reference-panel',
      'document/definition-glossary',
      'document/page-size',
      'document/print-vars',
    ]) {
      expect(documentPrintRoster.map((entry) => entry.id)).toContain(required);
    }
  });

  it('uses unique ids across the structural and document rosters', () => {
    const ids = [...structuralPrintRoster, ...documentPrintRoster].map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('printExpectations — coherence with the registry', () => {
  it('derives the break-inside check from PrintSpec for every type', () => {
    for (const type of registeredBlockTypes) {
      const check = allChecksFor(type).find((c) => c.id === 'spec/break-inside');
      expect(check, `${type} has no break-inside check`).toBeDefined();
      expect(
        check?.expect,
        `${type} break-inside check disagrees with its PrintSpec`,
      ).toEqual({
        kind: 'computed',
        property: 'break-inside',
        // Resolved through the same helper the builder uses, so a conditional
        // spec is checked against the branch it actually resolves to rather
        // than against a string that is not a CSS value.
        oneOf: [resolveBreakInside(blockRegistry[type].print.breakInside, {})],
      });
    }
  });

  it('emits a keep-with-next check exactly for the types that declare it', () => {
    for (const type of registeredBlockTypes) {
      const hasCheck = allChecksFor(type).some((c) => c.id === 'spec/keep-with-next');
      expect(hasCheck, `${type} keep-with-next check disagrees with its PrintSpec`).toBe(
        blockRegistry[type].print.keepWithNext === true,
      );
    }
  });

  it('records the S5-OV6 break-inside fixes so a revert is a deliberate act', () => {
    // The three former "faithful oddities". They were carried unchanged from
    // the baseline print layer specifically so that fixing them would be a
    // ruling rather than a side effect (S5-OV6 is that ruling). Pinned here so
    // a future edit that reverts one has to argue with a named test.
    expect(blockRegistry.math_block.print.breakInside).toBe('avoid');
    expect(blockRegistry.data_plot.print.breakInside).toBe('avoid');
    expect(blockRegistry.self_explanation.print.breakInside).toBe('avoid');
  });
});

describe('printExpectations — every check can actually fail', () => {
  // This used to police a two-surface selector map: a rule could be asserted on
  // the viewer and excused on the retiring renderer, and the danger was a rule
  // quietly excused on BOTH — a check that can never fail. With the
  // cross-surface half retired (S5-abs) there is one selector per check, so the
  // remaining risk is simply an empty one.
  it('resolves every check to a non-empty selector', () => {
    for (const type of registeredBlockTypes) {
      for (const check of allChecksFor(type)) {
        const selector = targetFor(check);
        expect(
          selector.length,
          `${type}/${check.id} has an empty selector — it can never fail`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe('printExpectations — exemptions are declared, not silent', () => {
  it('justifies every suppressed check', () => {
    // A treatment describes the usual shape of a paper affordance; a type can
    // realise it differently (math gaps are rendered MATH, not inputs). When
    // that happens the rule is dropped by NAME with a reason, so the gate
    // cannot quietly lose a rule and look complete.
    for (const type of registeredBlockTypes) {
      for (const [id, reason] of Object.entries(suppressedChecksFor(type))) {
        expect(reason.length, `${type}/${id} is suppressed without a reason`).toBeGreaterThan(
          30,
        );
        // And the suppressed check must be one this type would otherwise run,
        // or the exemption is stale and hiding nothing.
        expect(
          printExpectations(type).some((c) => c.id === id),
          `${type} suppresses ${id}, which it never emits`,
        ).toBe(false);
      }
    }
  });

  it('leaves every type with something still asserted', () => {
    // Suppression must never empty a block out.
    for (const type of registeredBlockTypes) {
      expect(printExpectations(type).length).toBeGreaterThan(2);
    }
  });
});

describe('printExpectations — the clean-worksheet floor (7.3A)', () => {
  const universalIds = ['chrome/state-pill', 'chrome/server-feedback', 'chrome/solutions'];

  it('strips check chrome, server feedback and solutions on EVERY block type', () => {
    for (const type of registeredBlockTypes) {
      const ids = allChecksFor(type).map((c) => c.id);
      for (const required of universalIds) {
        expect(ids, `${type} does not strip ${required} in print`).toContain(required);
      }
    }
  });

  it('guards printed ink against the screen theme on every block type (S5-9)', () => {
    // The dark-mode bug this exists for: viewer print colours resolve from
    // theme tokens, so without forcing light values a dark-mode student prints
    // white ink on white paper — invisible, and silent until someone holds the
    // page.
    for (const type of registeredBlockTypes) {
      const inkCheck = allChecksFor(type).find((c) => c.id === 'ink/not-paper');
      expect(inkCheck, `${type} has no printed-ink guard`).toBeDefined();
      expect(inkCheck?.expect).toEqual({ kind: 'ink-not-paper' });
      expect(inkCheck?.target).toBe(BLOCK_ROOT);
    }
  });
});

describe('printExpectations — per-instance rules', () => {
  it('encodes each callout variant as a distinct border style (grayscale survival)', () => {
    const styleFor = (variant: string) =>
      printExpectations('callout', { variant }).find((c) =>
        c.id.startsWith('callout/border-style/'),
      )?.expect;

    expect(styleFor('info')).toEqual({
      kind: 'computed',
      property: 'border-left-style',
      oneOf: ['solid'],
    });
    expect(styleFor('warning')).toEqual({
      kind: 'computed',
      property: 'border-left-style',
      oneOf: ['dashed'],
    });
    expect(styleFor('success')).toEqual({
      kind: 'computed',
      property: 'border-left-style',
      oneOf: ['double'],
    });
    expect(styleFor('note')).toEqual({
      kind: 'computed',
      property: 'border-left-style',
      oneOf: ['dotted'],
    });
  });

  it('gives the four callout variants four DIFFERENT styles', () => {
    // The whole point of the rule: in black and white, style is the only
    // channel left. Two variants sharing a style would be indistinguishable on
    // paper while every individual assertion still passed.
    const styles = ['info', 'warning', 'success', 'note'].map((variant) => {
      const check = printExpectations('callout', { variant }).find((c) =>
        c.id.startsWith('callout/border-style/'),
      );
      return check?.expect.kind === 'computed' ? check.expect.oneOf[0] : undefined;
    });
    expect(new Set(styles).size).toBe(4);
  });

  it('prints EMPTY axes for a graph question and AUTHORED drawables for a display figure (S5-1 as amended by OV4)', () => {
    const question = printExpectations('interactive_graph', {
      interaction: 'plot_point',
    }).find((c) => c.expect.kind === 'drawable-count');
    const display = printExpectations('interactive_graph', { interaction: 'display' }).find(
      (c) => c.expect.kind === 'drawable-count',
    );

    expect(question?.expect).toEqual({ kind: 'drawable-count', zero: true });
    // The bug this pins: an empty-axes twin for a DISPLAY figure would delete
    // the authored content the block exists to show, and no treatment-level
    // assertion would notice.
    expect(display?.expect).toEqual({ kind: 'drawable-count', zero: false });
  });

  it('applies the same display-vs-question rule across the whole kit-backed family', () => {
    for (const type of ['interactive_graph', 'number_line', 'data_plot'] as const) {
      const checks = printExpectations(type, { interaction: 'display' });
      expect(
        checks.some((c) => c.expect.kind === 'drawable-count' && c.expect.zero === false),
        `${type} display variant does not keep its drawables`,
      ).toBe(true);
    }
  });

  it('hides the live interactive board on the viewer surface for every kit-backed type', () => {
    // Ruling S5-1: printing the live board would put the student's in-progress
    // work on a worksheet the clean-print default is supposed to strip, and
    // would depend on a lazily-loaded kit having mounted before Ctrl+P.
    for (const type of ['interactive_graph', 'number_line', 'data_plot'] as const) {
      const check = printExpectations(type).find((c) => c.id === 'canvas/live-board-hidden');
      expect(check, `${type} does not hide its live board in print`).toBeDefined();
      expect(check?.expect).toEqual({ kind: 'hidden' });
      expect(targetFor(check as PrintCheck)).not.toBeNull();
    }
  });

  it('caps the graph grid and the number line at DIFFERENT hand-working widths', () => {
    // Same treatment, different rules — the concrete case behind S5-5's honest
    // naming: a per-treatment-only table could not express this.
    const graph = printExpectations('interactive_graph').find(
      (c) => c.id === 'graph/hand-plottable-cap',
    );
    const line = printExpectations('number_line').find(
      (c) => c.id === 'number-line/hand-markable-cap',
    );
    expect(graph).toBeDefined();
    expect(line).toBeDefined();
    expect(graph?.rule).not.toEqual(line?.rule);
  });

  it('distinguishes the worked example from the faded example by border style', () => {
    const borderStyle = (type: BlockType) => {
      const check = printExpectations(type).find((c) => c.expect.kind === 'boxed');
      return check?.expect.kind === 'boxed' ? check.expect.style : undefined;
    };
    expect(borderStyle('worked_example')).toBe('solid');
    expect(borderStyle('faded_worked_example')).toBe('dashed');
  });

  it('gives an essay more writing room than a short answer', () => {
    const minEm = (type: BlockType, id: string) => {
      const check = printExpectations(type).find((c) => c.id === id);
      return check?.expect.kind === 'writing-space' ? check.expect.minEm : undefined;
    };
    const essay = minEm('essay', 'essay/taller-writing-space');
    const shortAnswer = minEm('short_answer', 'freetext/writing-area');
    expect(essay).toBeGreaterThan(shortAnswer as number);
  });
});

describe('printExpectations — treatment coverage', () => {
  /**
   * Treatments that legitimately add no rules beyond the universal floor, each
   * with the reason. Same forced-justification shape as S4's CORPUS_COVERAGE:
   * a treatment is either exercised or explicitly excused, never silently
   * uncovered. `prose` is the honest empty case — plain flowing text has
   * nothing to assert past break-inside and the clean-worksheet chrome rules.
   */
  const TREATMENTS_WITHOUT_OWN_RULES: Readonly<Record<string, string>> = {
    prose: 'Plain flowing text: break-inside plus the universal chrome and ink rules are the whole contract.',
  };

  it('exercises every treatment the registry declares, or excuses it by name', () => {
    // If a registry entry adopted a treatment with no checks behind it and no
    // stated reason, that block would pass the gate on break-inside alone.
    const declared = new Set(registeredBlockTypes.map((t) => blockRegistry[t].print.treatment));
    for (const treatment of declared) {
      const excuse = TREATMENTS_WITHOUT_OWN_RULES[treatment];
      if (excuse !== undefined) {
        expect(excuse.length).toBeGreaterThan(20);
        continue;
      }
      // Checked across EVERY type declaring the treatment, not just the first
      // one: a type may justifiably suppress the treatment's checks (math gaps
      // are rendered math, not inputs), and picking the first type alphabetically
      // would then report the whole treatment as uncovered when it is fully
      // covered elsewhere.
      const types = registeredBlockTypes.filter(
        (t) => blockRegistry[t].print.treatment === treatment,
      );
      const exercised = types.some((t) =>
        allChecksFor(t).some(
          (c) =>
            !c.id.startsWith('chrome/') &&
            !c.id.startsWith('ink/') &&
            !c.id.startsWith('spec/'),
        ),
      );
      expect(
        exercised,
        `treatment "${treatment}" has no rules of its own on ANY of ${types.join(', ')}. Add checks, or excuse it by name in TREATMENTS_WITHOUT_OWN_RULES with a reason.`,
      ).toBe(true);
    }
  });

  it('keeps the excuse list from growing stale (an excused treatment nobody declares is dead)', () => {
    const declared = new Set(registeredBlockTypes.map((t) => blockRegistry[t].print.treatment));
    for (const treatment of Object.keys(TREATMENTS_WITHOUT_OWN_RULES)) {
      expect(declared, `"${treatment}" is excused but no block declares it`).toContain(treatment);
    }
  });
});
