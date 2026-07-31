// =============================================================================
// familyConformance.tsx — the checked-state family conformance factory (V6/D4)
// -----------------------------------------------------------------------------
// Bind a component in the registry and a behavior suite you never wrote starts
// testing it. That is the whole idea: docs/design/checked-state-families.md
// (ruling 7.2A) is a spec a human must remember to honor in ~25 components;
// this file turns it into a spec that EXECUTES against each of them.
//
// How it drives any block without per-type knowledge: indexDocument (the same
// walk the container uses at check time) reports which response category and
// item ids a block owns, so the factory can answer a question, fire a check,
// and script a verdict for a block type it knows nothing about. A new block
// type is drivable the day its fixture exists.
//
// What it CANNOT prove, honestly stated: jsdom asserts aria attributes, not
// what a screen reader announces, and it has no layout, so contrast, focus
// visibility, and touch-target size are out of scope here — those belong to
// the Playwright pass that lands with the viewer route (and S8's a11y CI).
// Everything below is DOM-observable behavior.
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  bindingFor,
  blockRegistry,
  createMockCheckService,
  createViewerStore,
  familyOf,
  indexDocument,
  setGraphSurface,
  setMathRenderer,
} from '../../src/index.js';
import type {
  BlockType,
  MockCheckScript,
  SanitizedActivityDocument,
  SanitizedBlock,
  ViewerStore,
} from '../../src/index.js';
import {
  sanitizedBlockFixture,
  sanitizedFixtureDocument,
} from '../../src/fixtures/index.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'conformance-section';

const template = sanitizedFixtureDocument();

function docOf(block: SanitizedBlock): SanitizedActivityDocument {
  return {
    ...template,
    sections: [
      {
        ...template.sections[0]!,
        id: SECTION,
        rows: [
          {
            id: 'row-1',
            gridLines: 'inherit',
            columns: [{ id: 'col-1', blocks: [block] }],
          },
        ],
      },
    ],
  } as unknown as SanitizedActivityDocument;
}

/** Put SOME answer into every response slot this block owns, so a check has
 * something to grade. Generic: driven by the index, not by block type. */
function answerEverything(store: ViewerStore, block: SanitizedBlock) {
  const section = indexDocument(docOf(block)).sections[0]!;
  const raw = block as unknown as Record<string, unknown>;

  for (const id of section.items.blanks ?? []) store.setBlank(id, '3');
  for (const id of section.items.freeText ?? []) store.setFreeText(id, 'my answer');
  for (const id of section.items.choices ?? []) {
    const choices = raw.choices as Array<{ id: string }> | undefined;
    if (choices?.[0]) store.setChoices(id, [choices[0].id]);
  }
  for (const id of section.items.orderings ?? []) {
    const items = raw.items as Array<{ id: string }> | undefined;
    if (items) store.setOrdering(id, items.map((i) => i.id));
  }
  for (const id of section.items.graphs ?? []) {
    const interaction = (raw.interaction as { type?: string } | undefined)?.type;
    store.setGraphWork(id, {
      interaction: interaction ?? 'plot_point',
      points: [[1, 1]],
    });
  }
  for (const id of section.items.matches ?? []) {
    const items = raw.items as Array<{ id: string }> | undefined;
    const targets = raw.targets as Array<{ id: string }> | undefined;
    if (items?.[0] && targets?.[0]) store.setMatch(id, items[0].id, targets[0].id);
  }
  return section;
}

type AnyBlockComponent = React.ComponentType<{
  block: unknown;
  mode: 'screen' | 'print';
}>;

/** Resolve either binding tier to a component. Lazy bindings (the graph
 * family) are awaited once in beforeAll — the factory covers BOTH tiers, so a
 * block cannot dodge its family contract by being expensive. */
async function resolveBinding(type: BlockType): Promise<AnyBlockComponent> {
  const binding = bindingFor(type);
  if (!binding) throw new Error(`${type} has no component binding`);
  if (binding.loading === 'eager') return binding.component as AnyBlockComponent;
  const mod = await binding.load();
  return mod.default as AnyBlockComponent;
}

function mount(
  Component: AnyBlockComponent,
  block: SanitizedBlock,
  script: MockCheckScript = {},
) {
  const service = createMockCheckService(script);
  const store = createViewerStore({
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  const utils = render(
    <ViewerProvider store={store} defaultSectionId={SECTION}>
      <Component block={block} mode="screen" />
    </ViewerProvider>,
  );
  return { ...utils, store, service };
}

const pills = () => Array.from(document.querySelectorAll('[data-state]'));
const statesShown = () => pills().map((el) => el.getAttribute('data-state'));

/** Failure messages point at the RULE, not just the assertion — a conformance
 * failure should teach the contract to whoever just broke it (ruling D8). */
const SPEC = 'docs/design/checked-state-families.md';
const because = (rule: string) => `${rule}\n  → the rule lives in ${SPEC}`;

/**
 * Register the family conformance suite for one block type. Called for every
 * bound registry entry by conformance.test.tsx — no manual list to forget.
 */
export function registerFamilyConformance(type: BlockType): void {
  const entry = blockRegistry[type];
  const block = sanitizedBlockFixture(type);
  const family = familyOf(block as never);

  describe(`${type} — ${family} conformance (docs/design/checked-state-families.md)`, () => {
    let Component: AnyBlockComponent;

    beforeAll(async () => {
      Component = await resolveBinding(type);
      // Kit-backed blocks mount an imperative widget that needs a real
      // browser. The conformance suite is about FAMILY behavior, not the
      // board, so it installs an inert surface; the board itself is verified
      // in /dev/viewer. Harmless for every other block (nothing calls it).
      setGraphSurface(async () => ({
        getResponse: () => ({ points: [], answered: false }),
        restore: () => {},
        setLocked: () => {},
        destroy: () => {},
      }));
    });
    it('renders its fixture without throwing', () => {
      expect(() => mount(Component, block)).not.toThrow();
    });

    it('shows no state chrome before any check', () => {
      mount(Component, block);
      expect(statesShown()).toEqual([]);
    });

    if (family === 'static') {
      it('NEVER shows state chrome, even after its section is checked', async () => {
        const { store } = mount(Component, block);
        const section = answerEverything(store, block);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(store.getState().sections[SECTION]?.phase).toBe('checked'));
        expect(
          statesShown(),
          because(
            `${type} is STATIC: it must never render state chrome, but it ` +
              `rendered ${JSON.stringify(statesShown())} after a check.`,
          ),
        ).toEqual([]);
      });
    }

    if (family === 'auto_gradable') {
      it('shows ✓ only from a server CORRECT verdict', async () => {
        const { store } = mount(Component, block, { defaultVerdict: 'correct' });
        const section = answerEverything(store, block);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(statesShown()).toContain('correct'));
        expect(
          statesShown(),
          because(
            `${type} showed an incorrect mark for a CORRECT server verdict. ` +
              'Verdicts come only from the check result.',
          ),
        ).not.toContain('incorrect');
      });

      it('shows ✗ from a server INCORRECT verdict, and never invents feedback', async () => {
        const { store } = mount(Component, block, { defaultVerdict: 'incorrect' });
        const section = answerEverything(store, block);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(statesShown()).toContain('incorrect'));
        // Hintless ✗ is mark-only (ruling 2.1A) — no feedback element unless
        // the server sent one.
        expect(
          document.querySelector('[data-feedback="server"]'),
          because(
            `${type} rendered feedback the server did not send. A hintless ` +
              'wrong answer is mark-only (ruling 2.1A) — never invent copy.',
          ),
        ).toBeNull();
      });

      it('the mark never molests the work — responses survive an incorrect verdict', async () => {
        const { store } = mount(Component, block, { defaultVerdict: 'incorrect' });
        const section = answerEverything(store, block);
        const before = JSON.stringify(store.getState().responses);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(statesShown()).toContain('incorrect'));
        expect(
          JSON.stringify(store.getState().responses),
          because(
            `${type} changed the student's responses when it was marked ` +
              'incorrect. The mark never molests the work.',
          ),
        ).toBe(before);
      });

      it('announces its verdict transition through aria-live (6.1A)', async () => {
        const { store } = mount(Component, block, { defaultVerdict: 'correct' });
        const section = answerEverything(store, block);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(pills().length).toBeGreaterThan(0));
        for (const pill of pills()) {
          expect(pill).toHaveAttribute('aria-live', 'polite');
        }
      });
    }

    if (family === 'recorded') {
      it('shows the recorded receipt after a check — and NEVER a verdict', async () => {
        // Scripted judgment: proves the component refuses it, not just that
        // the mock withholds it.
        const { store } = mount(Component, block, { defaultVerdict: 'incorrect' });
        const section = answerEverything(store, block);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(statesShown()).toContain('recorded'));
        const judged = statesShown().filter(
          (s) => s === 'correct' || s === 'incorrect',
        );
        expect(
          judged,
          because(
            `${type} is RECORDED: free text captured for the teacher must ` +
              'never show a verdict glyph, score, or anything a student ' +
              'could read as auto-grading.',
          ),
        ).toEqual([]);
      });

      it('never renders a score or points', async () => {
        const { container, store } = mount(Component, block, { defaultVerdict: 'correct' });
        const section = answerEverything(store, block);
        await store.checkSection(SECTION, section.items);
        await waitFor(() => expect(statesShown()).toContain('recorded'));
        expect(container.textContent).not.toMatch(/\d+\s*\/\s*\d+|points?\b/i);
      });
    }

    if (entry.interactivity === 'interactive') {
      it('exposes a focusable control in tab order (its a11y story)', () => {
        // Kit-backed blocks (the lazy tier) get their control from a widget
        // that needs a real browser — MathLive's field, JSXGraph's board — so
        // jsdom cannot see it. Those are verified in /dev/viewer instead; this
        // assertion covers the blocks whose controls are plain DOM.
        if (bindingFor(type)?.loading === 'lazy') return;
        const { container } = mount(Component, block);
        const focusable = container.querySelectorAll(
          'input:not([disabled]), textarea:not([disabled]), select, button, [tabindex]:not([tabindex="-1"])',
        );
        expect(focusable.length).toBeGreaterThan(0);
      });

      it('every control has an accessible name', () => {
        mount(Component, block);
        for (const role of ['radio', 'checkbox', 'textbox'] as const) {
          for (const el of screen.queryAllByRole(role)) {
            expect(el).toHaveAccessibleName();
          }
        }
      });

      it('accepts input without a check having happened', () => {
        const { store } = mount(Component, block);
        const section = answerEverything(store, block);
        const responses = store.getState().responses;
        const recorded =
          Object.keys(responses.blanks).length +
          Object.keys(responses.choices).length +
          Object.keys(responses.matches).length +
          Object.keys(responses.orderings).length +
          Object.keys(responses.freeText).length +
          Object.keys(responses.graphs).length;
        expect(recorded, `${type} owns no response slot`).toBeGreaterThan(0);
        expect(section.items).not.toEqual({});
      });
    }

    if (entry.interactivity !== 'interactive') {
      it('records nothing under its OWN id (children may still answer)', () => {
        // A container is not an input, but its CHILDREN can be: a faded worked
        // example's steps carry blanks. So the invariant is not "records
        // nothing" — it is that the container itself never becomes a response
        // key. Asserting the stronger thing would have forced a real container
        // to look broken.
        const { store } = mount(Component, block);
        answerEverything(store, block);
        const responses = store.getState().responses;
        const ownId = (block as { id: string }).id;
        for (const category of Object.values(responses)) {
          expect(
            Object.keys(category as Record<string, unknown>),
            `${type} recorded a response under its own block id`,
          ).not.toContain(ownId);
        }
      });
    }

    it('renders in print mode without check chrome', () => {
      setMathRenderer((latex) => `<span>${latex}</span>`);
      const service = createMockCheckService();
      const store = createViewerStore({
        activityId: ACTIVITY,
        versionId: VERSION,
        checkService: service,
      });
      const { container } = render(
        <ViewerProvider store={store} defaultSectionId={SECTION}>
          <Component block={block} mode="print" />
        </ViewerProvider>,
      );
      expect(container.firstChild).not.toBeNull();
      expect(container.querySelectorAll('[data-state]')).toHaveLength(0);
      setMathRenderer(null);
    });
  });
}

export { boundBlockTypes } from '../../src/index.js';

// Keep fireEvent imported for driver use in future non-store-driven blocks.
void fireEvent;
