// =============================================================================
// DevViewer — the student-viewer harness route (S3 V7, ruling D10)
// -----------------------------------------------------------------------------
// See a block render, in every state, without a server. Pick a block, drive its
// check verdict, flip print mode — the loop a component author needs while
// building, and the one thing the jsdom conformance suite can't give them
// (layout, tokens, dark mode, real focus rings).
//
// Reuses the app's dev-route pattern (/playground precedent): DEV-only, no
// auth, no data fetch. It renders the GENERATED fixtures through the real
// ViewerContainer against the scriptable mock CheckService — so what shows up
// here is exactly what the container and store do in production, minus the
// network.
//
// ACCEPTANCE CRITERION (outside-voice finding 10, ruled at D10): this route
// MUST boot on a clean clone with no .env.local. It touches no Supabase client
// and no environment variable; if it ever stops booting env-less, that is a
// regression in this file, not a setup problem for the person cloning.
// =============================================================================

import { useMemo, useState } from 'react';
import {
  AnswerKeyProvider,
  ViewerContainer,
  boundBlockTypes,
  createMockCheckService,
  createViewerStore,
  extractAnswerKey,
  registeredBlockTypes,
} from '@activity/viewer';
import { PrintButton } from '@activity/viewer';
import type { ActivityFont } from '@activity/schema';

const FONT_IDS: ActivityFont[] = [
  'default',
  'lexend',
  'atkinson-hyperlegible',
  'andika',
  'comic-neue',
];
import type { BlockType, SanitizedActivityDocument } from '@activity/viewer';
import {
  authoredFixtureDocument,
  sanitizedVariantFixtures,
  servedFixtureDocument,
} from '@activity/viewer/fixtures';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';

type Verdict = 'correct' | 'incorrect' | 'recorded';

const ACTIVITY_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION_ID = 'bbbbbbbb-0000-4000-8000-000000000001';
// The harness route boots env-less and unauthenticated (ruling D10), so there
// is no session to take an id from — a fixed one keeps the store's identity
// requirement honest without pretending a student is signed in.
const DEV_USER_ID = 'dddddddd-0000-4000-8000-00000000dev0';

export default function DevViewer() {
  // Deep-linkable so the print gate can drive ONE fixture at a time:
  // /dev/viewer?type=multiple_choice&variant=1&font=lexend. Read once as the
  // initial state — the controls still work normally afterwards.
  const params = new URLSearchParams(
    typeof window === 'undefined' ? '' : window.location.search,
  );
  const [type, setType] = useState<BlockType | 'ALL'>(
    (params.get('type') as BlockType | 'ALL' | null) ?? 'multiple_choice',
  );
  const [variant, setVariant] = useState(Number(params.get('variant') ?? 0));
  const [verdict, setVerdict] = useState<Verdict>('correct');
  // Deep-linkable like every other switch here, and it matters more than it
  // looks: `mode` is a COMPONENT prop, not a CSS media state, and the two are
  // independently settable. A harness driven with print media but screen mode
  // renders a hybrid — MathBlock mounts its MathLive field (screen behaviour),
  // the component hides the static KaTeX behind it, and the print stylesheet
  // then hides the field, so a gap-bearing equation disappears entirely. The
  // first Linux baseline run captured exactly that and pinned a blank image for
  // math_block. Anything screenshotting this harness must pass mode=print.
  const [mode, setMode] = useState<'screen' | 'print'>(
    params.get('mode') === 'print' ? 'print' : 'screen',
  );
  // The teacher answer key (S5.5). Deep-linkable like the other switches so the
  // parity gate can drive a keyed render, and mounted the same way the teacher
  // print route will: a provider wrapped around the container, extracted from
  // the AUTHORED fixtures while the container still renders the SERVED ones.
  const [showAnswers, setShowAnswers] = useState(params.get('answers') === '1');
  // Printed version (S5.5 T9). Deep-linkable so the gate can assert the sheet
  // carries a label a teacher can match to its answer key.
  const printVersion = Number(params.get('version') ?? '1');
  const answerKey = useMemo(() => extractAnswerKey(authoredFixtureDocument()), []);
  const [failing, setFailing] = useState(false);
  // Typography is a DOCUMENT-level print/render case (documentPrintRoster's
  // `document/typography`), so the harness needs a way to exercise it — the
  // shared fixture stays default-font on purpose, because the T8 visual
  // baselines are taken against it.
  const [font, setFont] = useState<ActivityFont>(
    (params.get('font') as ActivityFont | null) ?? 'default',
  );

  // A fresh store+service per configuration: flipping the scripted verdict
  // should show the new verdict, not a stale checked state.
  const { document: doc, store } = useMemo(() => {
    const template = servedFixtureDocument();
    const document: SanitizedActivityDocument =
      type === 'ALL'
        ? template
        : ({
            ...template,
            sections: [
              {
                ...template.sections[0]!,
                title: `${type} — fixture`,
                rows: sanitizedVariantFixtures(type).map((block, i) => ({
                  id: `row-${i}`,
                  gridLines: 'inherit',
                  columns: [{ id: `col-${i}`, blocks: [block] }],
                })),
              },
            ],
          } as unknown as SanitizedActivityDocument);

    // Every gradable block gets a scripted SOLUTION, so a checked worksheet in
    // the harness carries the full post-check state: verdict pills, feedback,
    // and released solutions. Without solutions here, the print gate's
    // "solutions never print" rule passes vacuously — the element it asserts
    // about is simply never on the page.
    const solutions = Object.fromEntries(
      document.sections
        .flatMap((section) => section.rows)
        .flatMap((row) => row.columns)
        .flatMap((column) => column.blocks)
        .map((block) => [
          (block as { id: string }).id,
          [{ type: 'text', text: 'Worked solution for this problem.' }],
        ]),
    );

    const service = createMockCheckService({
      defaultVerdict: verdict === 'recorded' ? 'correct' : verdict,
      solutions: solutions as never,
      ...(failing ? { failWith: new Error('Simulated check failure') } : {}),
    });
    return {
      document,
      store: createViewerStore({
        userId: DEV_USER_ID,
        activityId: ACTIVITY_ID,
        versionId: VERSION_ID,
        checkService: service,
      }),
    };
  }, [type, verdict, failing]);

  /**
   * Document- and structure-level print features, driven by query params so the
   * print gate can exercise them. These are NOT block features — they
   * are the layer the per-block fixture roster is structurally blind to
   * (rulings S5-OV1 and S5-OV2), so without a way to turn them on the gate's
   * document and structural rosters would have nothing to assert against.
   */
  const docWithFont = useMemo(() => {
    const next = structuredClone(doc) as unknown as {
      meta: Record<string, unknown> & { print: Record<string, unknown> };
      sections: {
        rows: { id: string; columns: { id: string; blocks: unknown[] }[] }[];
      }[];
      referencePanel?: unknown;
    };

    if (font !== 'default') next.meta.typography = { font, fontSize: 16 };

    if (params.get('header') === '1') {
      next.meta.print = {
        ...next.meta.print,
        header: { name: true, date: true, period: true, class: false, score: true, custom: ['Table #'] },
      };
    }
    if (params.get('paper') === 'a4') {
      next.meta.print = { ...next.meta.print, paperSize: 'a4', margin: 1 };
    }
    if (params.get('printvars') === '1') {
      next.meta.print = {
        ...next.meta.print,
        fontSize: 13,
        problemSpacing: 2,
        workSpace: 3,
      };
    }
    if (params.get('glossary') === '1') {
      next.meta.print = { ...next.meta.print, printDefinitionGlossary: true };
    }
    if (params.get('reference') === '1') {
      next.meta.print = { ...next.meta.print, printReferencePanel: true };
      next.referencePanel = {
        title: 'Formula sheet',
        blocks: [structuredClone(next.sections[0]?.rows[0]?.columns[0]?.blocks[0])],
      };
    }

    // A two-column row with authored WEIGHTS, plus a sized block — the layout
    // facts no per-block fixture can express.
    if (params.get('columns') === '1') {
      const allBlocks = next.sections.flatMap((sec) =>
        sec.rows.flatMap((row) => row.columns.flatMap((col) => col.blocks)),
      );
      const left = structuredClone(allBlocks[0]) as Record<string, unknown>;
      const right = structuredClone(allBlocks[1] ?? allBlocks[0]) as Record<string, unknown>;
      left.width = 0.5;
      left.align = 'left';
      next.sections[0]!.rows = [
        {
          id: 'row-structural',
          columns: [
            { id: 'col-wide', width: 2, blocks: [left] } as never,
            { id: 'col-narrow', width: 1, minHeight: 8, blocks: [right] } as never,
          ],
        },
      ];
    }

    // ---- The two 2026-08-21 print fields, each of which arrived in the viewer
    // as a DEAD DECLARATION (schema + editor, no reader on any surface a
    // student or a printer sees). Both fixtures exist so the print lane can
    // assert RENDERED OUTPUT rather than the declaration.
    //
    // `workspace=1` — the PER-PROBLEM override. Deliberately set on ONE block
    // with the activity default left at 0, so a passing assertion cannot come
    // from the activity-wide value (the vacuity that would make this fixture
    // worthless).
    if (params.get('workspace') === '1') {
      const first = next.sections[0]?.rows[0]?.columns[0]?.blocks[0] as
        | Record<string, unknown>
        | undefined;
      if (first) first.workSpace = 4;
    }

    // `ruled=on` — an explicit per-row override. `ruled=inherit` — the row says
    // 'inherit' and the ACTIVITY default turns it on, which is the other half
    // of the tri-state and the half a teacher actually uses (one toggle in ⚙).
    const ruled = params.get('ruled');
    if (ruled === 'on' || ruled === 'inherit') {
      if (ruled === 'inherit') {
        next.meta.print = { ...next.meta.print, gridLines: true };
      }
      const allBlocks = next.sections.flatMap((sec) =>
        sec.rows.flatMap((row) => row.columns.flatMap((col) => col.blocks)),
      );
      next.sections[0]!.rows = [
        {
          id: 'row-ruled',
          gridLines: ruled === 'on' ? 'on' : 'inherit',
          columns: [
            { id: 'col-ruled-a', blocks: [structuredClone(allBlocks[0])] },
            {
              id: 'col-ruled-b',
              blocks: [structuredClone(allBlocks[1] ?? allBlocks[0])],
            },
          ],
        } as never,
      ];
    }

    return next as unknown as SanitizedActivityDocument;
  }, [doc, font]);

  const variants = type === 'ALL' ? [] : sanitizedVariantFixtures(type);
  const boundTypes = boundBlockTypes();

  return (
    <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem' }}>Viewer harness (dev)</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.75 }}>
          Generated fixtures through the real container + a mock check service.
          Bound components: {boundTypes.join(', ') || 'none yet'}.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label>
            Block{' '}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as BlockType | 'ALL');
                setVariant(0);
              }}
            >
              <option value="ALL">— whole fixture worksheet —</option>
              {registeredBlockTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                  {boundTypes.includes(t) ? '' : ' (unbound)'}
                </option>
              ))}
            </select>
          </label>

          {variants.length > 1 ? (
            <label>
              Variant{' '}
              <select
                value={variant}
                onChange={(e) => setVariant(Number(e.target.value))}
              >
                {variants.map((_, i) => (
                  <option key={i} value={i}>
                    {i + 1} of {variants.length}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label>
            Verdict{' '}
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value as Verdict)}
            >
              <option value="correct">correct</option>
              <option value="incorrect">incorrect</option>
            </select>
          </label>

          <label>
            <input
              type="checkbox"
              checked={mode === 'print'}
              onChange={(e) => setMode(e.target.checked ? 'print' : 'screen')}
            />{' '}
            print mode
          </label>

          <label>
            <input
              type="checkbox"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
            />{' '}
            answer key
          </label>

          <label>
            <input
              type="checkbox"
              checked={failing}
              onChange={(e) => setFailing(e.target.checked)}
            />{' '}
            simulate check failure
          </label>

          <label>
            font{' '}
            <select
              value={font}
              onChange={(e) => setFont(e.target.value as ActivityFont)}
            >
              {FONT_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>

          {/* The real print action, so the harness can exercise the readiness
              barrier without auth — and so T7's parity gate has something to
              drive. Same component the student route mounts. */}
          <PrintButton
            onReady={(report) => {
              // Surfaced rather than swallowed: the harness is where you find
              // out that printing routinely runs past its budget.
              console.info('[dev] print ready', report);
            }}
          />
        </div>
      </header>

      <main style={{ borderTop: '1px solid #8884', paddingTop: '1rem' }}>
        {showAnswers ? (
          <AnswerKeyProvider answers={answerKey}>
            <ViewerContainer
              document={docWithFont}
              store={store}
              versionId={VERSION_ID}
              mode={mode}
              {...(printVersion > 1 ? { printVersion } : {})}
            />
          </AnswerKeyProvider>
        ) : (
          <ViewerContainer
            document={docWithFont}
            store={store}
            versionId={VERSION_ID}
            mode={mode}
            {...(printVersion > 1 ? { printVersion } : {})}
          />
        )}
      </main>
    </div>
  );
}
