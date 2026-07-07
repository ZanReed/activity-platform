// Dev-only harness for the @activity/graph-kit interactive-graph WIDGET
// (mountGraphQuestion). Mounts the widget the same way the published page's
// runtime sidecar will, with a seeded plot_point config, so the draggable
// point + keyboard nav + narration + tolerance scoring are exercisable by hand.
// The full renderer→runtime spine is covered by unit tests; this route proves
// the interactive surface JSXGraph draws (which jsdom can't).
// Route: /dev/graph-question (DEV builds only — see App.tsx).
import { useEffect, useRef, useState } from 'react';
import { mountGraphQuestion, type GraphQuestionHandle, type GraphResponseData } from '@activity/graph-kit';

export default function DevGraphQuestion() {
  const mountRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GraphQuestionHandle | null>(null);
  const [resp, setResp] = useState<GraphResponseData | null>(null);
  const [narration, setNarration] = useState('');
  const [checked, setChecked] = useState<GraphResponseData | null>(null);
  const [locked, setLocked] = useState(false);
  const [two, setTwo] = useState(false);

  const correctPoints: [number, number][] = two ? [[3, 4], [-3, -2]] : [[3, 4]];

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
    void mountGraphQuestion(
      el,
      {
        interactionType: 'plot_point',
        axisConfig: {
          xMin: -10, xMax: 10, yMin: -10, yMax: 10,
          xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true,
        },
        answerKey: { correctPoints, tolerance: 0.1 },
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
  }, [two]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        Interactive graph question — dev harness
      </h1>
      <p style={{ color: '#475569', marginTop: '0.25rem' }}>
        Target: plot <code>{JSON.stringify(correctPoints)}</code>, tolerance 0.1.
        Drag a handle, or focus the canvas and use arrow keys (Shift = fine step;
        Tab cycles handles when there are two).
      </p>
      <label style={{ display: 'block', margin: '0.5rem 0', color: '#475569' }}>
        <input type="checkbox" checked={two} onChange={(e) => setTwo(e.target.checked)} />{' '}
        two points (plot both — consume-once scoring)
      </label>

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
        <button type="button" onClick={() => handleRef.current?.restore(correctPoints)}>
          Restore to answer
        </button>
      </div>

      <pre data-testid="state" style={{ marginTop: '1rem', color: '#0f172a' }}>
        {JSON.stringify({ narration, resp, checked }, null, 2)}
      </pre>
    </div>
  );
}
