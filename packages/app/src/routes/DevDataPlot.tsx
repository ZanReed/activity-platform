// Dev-only harness for the @activity/graph-kit data-plot WIDGETS
// (mountDataPlotQuestion). Mounts each graded build the way the published page's
// runtime sidecar will — dot plot (click/stack dots), histogram (set bar
// heights), box plot (drag five clamped handles) — so the interactions + scoring
// are exercisable by hand (jsdom can't drive SVG pointer geometry). The
// renderer→runtime spine is covered by unit tests; this route proves the
// interactive surface.
// Route: /dev/data-plot (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import {
  mountDataPlotQuestion,
  type DataPlotQuestionHandle,
  type DataPlotResponseData,
} from '@activity/graph-kit';

interface Scenario {
  label: string;
  interactionType: 'build_dotplot' | 'build_histogram' | 'build_boxplot';
  config: unknown;
  data: number[];
  answerKey?: unknown;
  hint: string;
  /** A payload that satisfies the key — the "Restore" seed. */
  restore: {
    studentValues?: number[];
    studentBins?: number[];
    studentFive?: { min: number; q1: number; median: number; q3: number; max: number };
  };
}

const AXIS = { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true };

const SCENARIOS: Record<string, Scenario> = {
  dotplot: {
    label: 'Dot plot of 3, 5, 5, 6, 8',
    interactionType: 'build_dotplot',
    config: AXIS,
    data: [3, 5, 5, 6, 8],
    hint: 'Click above a tick to stack a dot; click a dot to remove it.',
    restore: { studentValues: [3, 5, 5, 6, 8] },
  },
  histogram: {
    label: 'Histogram of 0,4,5,9,10 (bin width 5 → [2, 3])',
    interactionType: 'build_histogram',
    config: { ...AXIS, binWidth: 5, maxFrequency: 5 },
    data: [0, 4, 5, 9, 10],
    hint: 'Click at a height in a bin to set its bar; or Tab to a bin and use ↑/↓. Target: 2 then 3.',
    restore: { studentBins: [2, 3] },
  },
  boxplot: {
    label: 'Box plot of 1,2,3,4,5,6,7 (→ 1 · 2 · 4 · 6 · 7)',
    interactionType: 'build_boxplot',
    config: AXIS,
    answerKey: { tolerance: 0.5 },
    data: [1, 2, 3, 4, 5, 6, 7],
    hint: 'Drag the five handles to min 1, Q1 2, median 4, Q3 6, max 7 (Tab + ←/→ also works).',
    restore: { studentFive: { min: 1, q1: 2, median: 4, q3: 6, max: 7 } },
  },
};

export default function DevDataPlot() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<DataPlotQuestionHandle | null>(null);
  const [resp, setResp] = useState<DataPlotResponseData | null>(null);
  const [checked, setChecked] = useState<DataPlotResponseData | null>(null);
  const [locked, setLocked] = useState(false);
  const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>('dotplot');

  const scenario = SCENARIOS[scenarioKey]!;

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;inset:0;';
    el.setAttribute('role', 'application');
    el.tabIndex = 0;
    host.appendChild(el);
    let handle: DataPlotQuestionHandle | null = null;
    let disposed = false;
    setChecked(null);
    void mountDataPlotQuestion(
      el,
      {
        interactionType: scenario.interactionType,
        config: scenario.config,
        data: scenario.data,
        answerKey: scenario.answerKey,
      },
      { onChange: (r) => setResp(r) },
    ).then((h) => {
      if (disposed) {
        h.destroy();
        return;
      }
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Data-plot builds — dev harness</h1>
      <label style={{ display: 'block', margin: '0.5rem 0', color: '#475569' }}>
        Scenario:{' '}
        <select
          value={scenarioKey}
          onChange={(e) => setScenarioKey(e.target.value as keyof typeof SCENARIOS)}
        >
          {Object.entries(SCENARIOS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <p style={{ color: '#475569', marginTop: '0.25rem' }}>{scenario.hint}</p>

      <div
        ref={mountRef}
        data-dataplot-canvas="dev"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '34rem',
          aspectRatio: '500 / 200',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          background: '#fff',
          touchAction: 'none',
          marginTop: '1rem',
        }}
      />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button type="button" onClick={() => setChecked(handleRef.current?.getResponse() ?? null)}>
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
        <button type="button" onClick={() => handleRef.current?.restore(scenario.restore)}>
          Restore to answer
        </button>
      </div>

      <pre data-testid="state" style={{ marginTop: '1rem', color: '#0f172a' }}>
        {JSON.stringify({ resp, checked }, null, 2)}
      </pre>
    </div>
  );
}
