// Dev-only harness for the @activity/graph-kit calculator widget. Mounts
// mountCalculator() the same way a published page / the editor preview will, with
// toggles for the restriction flags so the gating is exercisable by hand.
// Route: /dev/calculator (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import { mountCalculator, type CalculatorHandle } from '@activity/graph-kit';

const ALL_MODELS = ['linear', 'quadratic', 'exponential'] as const;
type Model = (typeof ALL_MODELS)[number];

export default function DevCalculator() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<CalculatorHandle | null>(null);
  const [allowTrig, setAllowTrig] = useState(true);
  const [allowLogExp, setAllowLogExp] = useState(true);
  const [mode, setMode] = useState<'scientific' | 'graphing'>('scientific');
  const [models, setModels] = useState<Model[]>([...ALL_MODELS]);
  const [maxExpr, setMaxExpr] = useState<number | undefined>(undefined);
  const [openState, setOpenState] = useState(true);

  // Re-mount whenever the config changes (it's read at mount).
  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;
    const handle = mountCalculator(
      mountEl,
      {
        mode,
        allowTrig,
        allowLogExp,
        allowedRegressionModels: models,
        maxExpressions: maxExpr,
      },
      { onToggle: (open) => setOpenState(open), floating: true },
    );
    handleRef.current = handle;
    return () => handle.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, allowTrig, allowLogExp, models.join(','), maxExpr]);

  const toggleModel = (m: Model, on: boolean): void =>
    setModels(ALL_MODELS.filter((x) => (x === m ? on : models.includes(x))));

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        Calculator widget — dev harness
      </h1>
      <p style={{ color: '#475569', marginTop: '0.25rem' }}>
        The same <code>mountCalculator()</code> a published page lazy-loads and
        the editor preview imports. Try: <code>sin(30)</code> in DEG,{' '}
        <code>2+3×4</code>, <code>√16</code>, <code>5!</code>, <code>2π</code>.
        In graphing mode, the Data button opens the table + regression panel
        (try (1,4) (2,7) (3,12) (4,21) with Exponential).
      </p>

      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          mode{' '}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'scientific' | 'graphing')}
          >
            <option value="scientific">scientific</option>
            <option value="graphing">graphing</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={allowTrig}
            onChange={(e) => setAllowTrig(e.target.checked)}
          />{' '}
          allowTrig
        </label>
        <label>
          <input
            type="checkbox"
            checked={allowLogExp}
            onChange={(e) => setAllowLogExp(e.target.checked)}
          />{' '}
          allowLogExp
        </label>
        {ALL_MODELS.map((m) => (
          <label key={m}>
            <input
              type="checkbox"
              checked={models.includes(m)}
              onChange={(e) => toggleModel(m, e.target.checked)}
            />{' '}
            {m}
          </label>
        ))}
        <label>
          maxExpressions{' '}
          <input
            type="number"
            min={1}
            style={{ width: '4rem' }}
            value={maxExpr ?? ''}
            placeholder="∞"
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              setMaxExpr(Number.isInteger(n) && n >= 1 ? n : undefined);
            }}
          />
        </label>
        <button type="button" onClick={() => handleRef.current?.toggle()}>
          toggle ({openState ? 'open' : 'closed'})
        </button>
      </div>

      {/* The widget mounts its own floating panel here. */}
      <div
        ref={mountRef}
        style={{ position: 'relative', minHeight: '420px' }}
      />
    </div>
  );
}
