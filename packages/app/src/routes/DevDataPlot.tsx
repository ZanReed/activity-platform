// Dev-only harness for the @activity/graph-kit data-plot WIDGET
// (mountDataPlotQuestion). Mounts it the way the published page's runtime
// sidecar will — so the click-to-add / click-to-remove dots, keyboard cursor,
// tick snap, and frequency scoring are exercisable by hand (jsdom can't drive
// SVG pointer geometry). The renderer→runtime spine is covered by unit tests;
// this route proves the interactive surface.
// Route: /dev/data-plot (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import {
  mountDataPlotQuestion,
  type DataPlotQuestionHandle,
  type DataPlotResponseData,
} from '@activity/graph-kit';

interface Scenario {
  label: string;
  config: unknown;
  data: number[];
  hint: string;
}

const SCENARIOS: Record<string, Scenario> = {
  basic: {
    label: 'Dot plot of 3, 5, 5, 6, 8 (0–10)',
    config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
    data: [3, 5, 5, 6, 8],
    hint: 'Click above a tick to stack a dot; click a dot to remove it. Match the data exactly.',
  },
  repeats: {
    label: 'Dot plot with repeats: 2, 2, 2, 4, 4, 7 (0–10)',
    config: { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true },
    data: [2, 2, 2, 4, 4, 7],
    hint: 'Three dots on 2, two on 4, one on 7. Arrow keys move the cursor; Enter adds, Backspace removes.',
  },
  halves: {
    label: 'Half-unit ticks: 1, 1.5, 2, 2, 3.5 (0–5, minor ticks)',
    config: { min: 0, max: 5, tickStep: 1, minorTicksPerStep: 1, snapToTick: true },
    data: [1, 1.5, 2, 2, 3.5],
    hint: 'Minor ticks add half-unit columns; a dot can land on 1.5 or 3.5.',
  },
};

export default function DevDataPlot() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<DataPlotQuestionHandle | null>(null);
  const [resp, setResp] = useState<DataPlotResponseData | null>(null);
  const [checked, setChecked] = useState<DataPlotResponseData | null>(null);
  const [locked, setLocked] = useState(false);
  const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>('basic');

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
      { interactionType: 'build_dotplot', config: scenario.config, data: scenario.data },
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Data-plot question — dev harness</h1>
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
        <button type="button" onClick={() => handleRef.current?.restore(scenario.data)}>
          Restore to answer
        </button>
      </div>

      <pre data-testid="state" style={{ marginTop: '1rem', color: '#0f172a' }}>
        {JSON.stringify({ resp, checked }, null, 2)}
      </pre>
    </div>
  );
}
