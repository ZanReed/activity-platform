// Dev-only harness for the @activity/graph-kit calculator widget. Mounts
// mountCalculator() the same way a published page / the editor preview will, with
// toggles for the restriction flags so the gating is exercisable by hand.
// Route: /dev/calculator (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import { mountCalculator, type CalculatorHandle } from '@activity/graph-kit';

export default function DevCalculator() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<CalculatorHandle | null>(null);
  const [allowTrig, setAllowTrig] = useState(true);
  const [allowLogExp, setAllowLogExp] = useState(true);
  const [openState, setOpenState] = useState(true);

  // Re-mount whenever the restriction flags change (config is read at mount).
  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;
    const handle = mountCalculator(
      mountEl,
      { mode: 'scientific', allowTrig, allowLogExp },
      { onToggle: (open) => setOpenState(open) },
    );
    handleRef.current = handle;
    return () => handle.destroy();
  }, [allowTrig, allowLogExp]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        Calculator widget — dev harness
      </h1>
      <p style={{ color: '#475569', marginTop: '0.25rem' }}>
        The same <code>mountCalculator()</code> a published page lazy-loads and
        the editor preview imports. Try: <code>sin(30)</code> in DEG,{' '}
        <code>2+3×4</code>, <code>√16</code>, <code>5!</code>, <code>2π</code>.
      </p>

      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
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
