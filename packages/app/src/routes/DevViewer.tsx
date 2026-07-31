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
  ViewerContainer,
  boundBlockTypes,
  createMockCheckService,
  createViewerStore,
  registeredBlockTypes,
} from '@activity/viewer';
import type { BlockType, SanitizedActivityDocument } from '@activity/viewer';
import {
  sanitizedVariantFixtures,
  servedFixtureDocument,
} from '@activity/viewer/fixtures';
import '@activity/viewer/tokens.css';

type Verdict = 'correct' | 'incorrect' | 'recorded';

const ACTIVITY_ID = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION_ID = 'bbbbbbbb-0000-4000-8000-000000000001';

export default function DevViewer() {
  const [type, setType] = useState<BlockType | 'ALL'>('multiple_choice');
  const [variant, setVariant] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>('correct');
  const [mode, setMode] = useState<'screen' | 'print'>('screen');
  const [failing, setFailing] = useState(false);

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

    const service = createMockCheckService({
      defaultVerdict: verdict === 'recorded' ? 'correct' : verdict,
      ...(failing ? { failWith: new Error('Simulated check failure') } : {}),
    });
    return {
      document,
      store: createViewerStore({
        activityId: ACTIVITY_ID,
        versionId: VERSION_ID,
        checkService: service,
      }),
    };
  }, [type, verdict, failing]);

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
              checked={failing}
              onChange={(e) => setFailing(e.target.checked)}
            />{' '}
            simulate check failure
          </label>
        </div>
      </header>

      <main style={{ borderTop: '1px solid #8884', paddingTop: '1rem' }}>
        <ViewerContainer
          document={doc}
          store={store}
          versionId={VERSION_ID}
          mode={mode}
        />
      </main>
    </div>
  );
}
