// Dev-only harness for the @activity/graph-kit interactive-graph WIDGET
// (mountGraphQuestion). Mounts the widget the same way the published page's
// runtime sidecar will, across a scenario per interaction/family — so the
// draggable handles + keyboard nav + narration + live curve fit + scoring are
// exercisable by hand for every graded family (the 2026-07-10 families pass
// added quadratic/exponential/logarithmic + a quadratic inequality).
// The full renderer→runtime spine is covered by unit tests; this route proves
// the interactive surface JSXGraph draws (which jsdom can't).
// Route: /dev/graph-question (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import { mountGraphQuestion, type GraphQuestionHandle, type GraphResponseData } from '@activity/graph-kit';

interface Scenario {
  label: string;
  interactionType: string;
  answerKey: unknown;
  /** Handle positions that satisfy the key — the "Restore to answer" seed. */
  restorePoints: [number, number][];
  hint: string;
}

const SCENARIOS: Record<string, Scenario> = {
  point: {
    label: 'Plot a point (3, 4)',
    interactionType: 'plot_point',
    answerKey: { correctPoints: [[3, 4]], tolerance: 0.1 },
    restorePoints: [[3, 4]],
    hint: 'Drag the handle to (3, 4).',
  },
  'point-two': {
    label: 'Plot two points (consume-once)',
    interactionType: 'plot_point',
    answerKey: { correctPoints: [[3, 4], [-3, -2]], tolerance: 0.1 },
    restorePoints: [[3, 4], [-3, -2]],
    hint: 'Plot BOTH (3, 4) and (−3, −2); Tab cycles handles.',
  },
  linear: {
    label: 'Plot a function — linear y = 2x + 3',
    interactionType: 'plot_function',
    answerKey: {
      models: [{ family: 'linear', slope: 2, intercept: 3, slopeTolerance: 0.2, interceptTolerance: 0.2 }],
    },
    restorePoints: [[0, 3], [1, 5]],
    hint: 'Two handles; the fitted line follows them.',
  },
  quadratic: {
    label: 'Plot a function — quadratic y = x² − 4',
    interactionType: 'plot_function',
    answerKey: {
      models: [{ family: 'quadratic', a: 1, b: 0, c: -4, aTolerance: 0.2, bTolerance: 0.2, cTolerance: 0.2 }],
    },
    restorePoints: [[0, -4], [1, -3], [-2, 0]],
    hint: 'THREE handles; the fitted parabola follows them.',
  },
  exponential: {
    label: 'Plot a function — exponential y = 2ˣ',
    interactionType: 'plot_function',
    answerKey: {
      models: [{ family: 'exponential', a: 1, b: 2, aTolerance: 0.2, bTolerance: 0.2 }],
    },
    restorePoints: [[0, 1], [2, 4]],
    hint: 'Handles seed at POSITIVE y (y ≤ 0 cannot define an exponential — drag one to the axis and the curve vanishes).',
  },
  logarithmic: {
    label: 'Plot a function — logarithmic y = ln(x)',
    interactionType: 'plot_function',
    answerKey: {
      models: [{ family: 'logarithmic', a: 0, b: 1, aTolerance: 0.2, bTolerance: 0.2 }],
    },
    restorePoints: [[1, 0], [7.39, 2]],
    hint: 'Handles seed at POSITIVE x (x ≤ 0 cannot define a logarithm).',
  },
  'quad-inequality': {
    label: 'Graph an inequality — y > x² − 4',
    interactionType: 'graph_inequality',
    answerKey: {
      inequalities: [{
        boundary: { family: 'quadratic', a: 1, b: 0, c: -4, aTolerance: 0.2, bTolerance: 0.2, cTolerance: 0.2 },
        strict: true,
        shadeSide: 'above',
      }],
    },
    restorePoints: [[0, -4], [1, -3], [-2, 0]],
    hint: 'Place the parabola boundary, toggle dotted (strict), click/pick the side above it.',
  },
};

export default function DevGraphQuestion() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GraphQuestionHandle | null>(null);
  const [resp, setResp] = useState<GraphResponseData | null>(null);
  const [narration, setNarration] = useState('');
  const [checked, setChecked] = useState<GraphResponseData | null>(null);
  const [locked, setLocked] = useState(false);
  const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>('point');

  const scenario = SCENARIOS[scenarioKey]!;

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    // A fresh inner container per effect run so React StrictMode's double-invoke
    // (mount → cleanup → mount) can't race two async JSXGraph boards onto the
    // same node. The published-page runtime mounts once and needs none of this.
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;inset:0;';
    host.appendChild(el);
    let handle: GraphQuestionHandle | null = null;
    let disposed = false;
    setChecked(null);
    void mountGraphQuestion(
      el,
      {
        interactionType: scenario.interactionType,
        axisConfig: {
          xMin: -10, xMax: 10, yMin: -10, yMax: 10,
          xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true,
        },
        answerKey: scenario.answerKey,
      },
      {
        onChange: (r) => {
          setResp(r);
          setNarration(
            r.studentPoints.map((p, i) => `#${i + 1} (${p[0]}, ${p[1]})`).join('  '),
          );
        },
      },
    ).then((h) => {
      if (disposed) { h.destroy(); return; }
      handle = h;
      handleRef.current = h;
      setResp(h.getResponse());
    });
    return () => {
      disposed = true;
      handle?.destroy();
      el.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioKey]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        Interactive graph question — dev harness
      </h1>
      <label style={{ display: 'block', margin: '0.5rem 0', color: '#475569' }}>
        Scenario:{' '}
        <select
          value={scenarioKey}
          onChange={(e) => setScenarioKey(e.target.value as keyof typeof SCENARIOS)}
        >
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
      </label>
      <p style={{ color: '#475569', marginTop: '0.25rem' }}>{scenario.hint}</p>

      {/* Host is a sized container only; the inner board element (created in
          the effect) owns role=application + tabindex + the keyboard handler.
          Setting them here too would shadow the real focusable surface. */}
      <div
        ref={mountRef}
        data-graph-canvas="dev"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          aspectRatio: '1 / 1',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          background: '#fff',
          touchAction: 'none',
          marginTop: '1rem',
        }}
      />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            const r = handleRef.current?.getResponse() ?? null;
            setChecked(r);
          }}
        >
          Check
        </button>
        <button
          type="button"
          onClick={() => {
            const next = !locked;
            setLocked(next);
            handleRef.current?.setLocked(next);
          }}
        >
          {locked ? 'Unlock' : 'Lock'}
        </button>
        <button type="button" onClick={() => handleRef.current?.restore(scenario.restorePoints)}>
          Restore to answer
        </button>
      </div>

      <pre data-testid="state" style={{ marginTop: '1rem', color: '#0f172a' }}>
        {JSON.stringify({ narration, resp, checked }, null, 2)}
      </pre>
    </div>
  );
}
