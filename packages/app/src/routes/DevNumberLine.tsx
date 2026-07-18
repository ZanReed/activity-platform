// Dev-only harness for the @activity/graph-kit number-line WIDGET
// (mountNumberLineQuestion). Mounts it the way the published page's runtime
// sidecar will, across a scenario per interaction — so the draggable handles,
// tick snap, keyboard nav, interval endpoint pills, and scoring are exercisable
// by hand (jsdom can't drive JSXGraph). The renderer→runtime spine is covered
// by unit tests; this route proves the interactive surface.
// Route: /dev/number-line (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import {
  mountNumberLineQuestion,
  type NumberLineQuestionHandle,
  type NumberLineResponseData,
  type NumberLineRestoreExtras,
} from '@activity/graph-kit';

interface Scenario {
  label: string;
  interactionType: 'plot_point' | 'plot_interval';
  config: unknown;
  answerKey: unknown;
  /** Values (+ interval extras) that satisfy the key — the "Restore" seed. */
  restore: { values: number[]; extras?: NumberLineRestoreExtras };
  hint: string;
}

const CONFIG = { min: -10, max: 10, tickStep: 2, minorTicksPerStep: 1, snapToTick: true };
const CONFIG_0_10 = { min: 0, max: 10, tickStep: 1, minorTicksPerStep: 0, snapToTick: true };

const SCENARIOS: Record<string, Scenario> = {
  point: {
    label: 'Plot a point — 3',
    interactionType: 'plot_point',
    config: CONFIG_0_10,
    answerKey: { correctPoints: [3], tolerance: 0.25 },
    restore: { values: [3] },
    hint: 'Drag the handle to 3 (snaps to whole numbers).',
  },
  'point-two': {
    label: 'Plot two points — −4 and 5 (consume-once)',
    interactionType: 'plot_point',
    config: CONFIG,
    answerKey: { correctPoints: [-4, 5], tolerance: 0.25 },
    restore: { values: [-4, 5] },
    hint: 'Plot BOTH −4 and 5; Tab cycles the two handles.',
  },
  'interval-bounded': {
    label: 'Graph −2 ≤ x < 4 (closed / open)',
    interactionType: 'plot_interval',
    config: CONFIG,
    answerKey: {
      correctInterval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
      tolerance: 0.25,
    },
    restore: {
      values: [-2, 4],
      extras: { interval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' } },
    },
    hint: 'Drag the two ends to −2 and 4; set Left ● closed and Right ○ open with the pills.',
  },
  'interval-ray': {
    label: 'Graph x ≥ 3 (ray, closed)',
    interactionType: 'plot_interval',
    config: CONFIG,
    answerKey: {
      correctInterval: { min: 3, minStyle: 'closed' },
      tolerance: 0.25,
    },
    restore: {
      values: [3, 10],
      extras: { interval: { min: 3, minStyle: 'closed' } },
    },
    hint: 'Left end at 3 ● closed; cycle the Right pill to "→ unbounded" so it becomes a ray.',
  },
};

export default function DevNumberLine() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<NumberLineQuestionHandle | null>(null);
  const [resp, setResp] = useState<NumberLineResponseData | null>(null);
  const [checked, setChecked] = useState<NumberLineResponseData | null>(null);
  const [locked, setLocked] = useState(false);
  const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>('point');

  const scenario = SCENARIOS[scenarioKey]!;

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;inset:0;';
    host.appendChild(el);
    let handle: NumberLineQuestionHandle | null = null;
    let disposed = false;
    setChecked(null);
    void mountNumberLineQuestion(
      el,
      {
        interactionType: scenario.interactionType,
        config: scenario.config,
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Number-line question — dev harness</h1>
      <label style={{ display: 'block', margin: '0.5rem 0', color: 'var(--color-muted)' }}>
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
      <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem' }}>{scenario.hint}</p>

      <div
        ref={mountRef}
        data-numberline-canvas="dev"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '34rem',
          aspectRatio: '500 / 90',
          border: '1px solid var(--color-line-strong)',
          borderRadius: 6,
          background: 'var(--color-canvas)',
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
        <button
          type="button"
          onClick={() => handleRef.current?.restore(scenario.restore.values, scenario.restore.extras)}
        >
          Restore to answer
        </button>
      </div>

      <pre data-testid="state" style={{ marginTop: '1rem', color: 'var(--color-ink)' }}>
        {JSON.stringify({ resp, checked }, null, 2)}
      </pre>
    </div>
  );
}
