// =============================================================================
// inline/InlineMathGaps.tsx — blanks inside inline maths (`$k = \gap{4}$`)
// -----------------------------------------------------------------------------
// The grader, the section index and the sanitizer have always handled a
// prompted math_inline. Only the screen didn't: InlineMath handed the raw
// `\placeholder[id]{}` to KaTeX, which printed it in red, and the student had
// nowhere to type. Found on a real phone (walkthrough, 2026-11-09).
//
// Its own chunk, because it reaches MathLive. Until the field arrives, and on
// paper, the equation reads with empty boxes (see squareGaps).
// =============================================================================

import { useContext, useEffect, useRef, useState } from 'react';
import { AnswerKeyContext } from '../answer-key/context.js';
import { mathPromptsSurface } from '../blocks/kitSurfaces.js';
import { StatePill } from '../blocks/StatePill.js';
import { useViewer, useViewerSelector } from '../container/context.js';
import { InlineContent, InlineMath } from './InlineContent.js';

/**
 * KaTeX can't parse a gap marker: an empty box reads, a red error doesn't. On a
 * teacher's key each marker takes its answer, boxed, as MathBlock does. Braced
 * so a following term can't glue onto `\\square`.
 */
const staticLatex = (latex: string, answers: Record<string, string>) =>
  latex.replace(/\\placeholder\[([^\]]*)\]\{[^}]*\}/g, (_m, id: string) =>
    answers[id] ? `\\boxed{${answers[id]}}` : '{\\square}',
  );

export default function InlineMathGaps({ node }: { node: Record<string, unknown> }) {
  const latex = String(node.latex ?? '');
  const promptIds = (node.prompts as { id: string }[]).map((p) => p.id);
  const { store } = useViewer();
  // A key is keyed by block, and this node doesn't know its block. A prompt id
  // is unique in a document, so merging them is safe.
  const keys = useContext(AnswerKeyContext);
  const answers: Record<string, string> = Object.assign(
    {},
    ...Object.values(keys ?? {}).map((k) => k?.mathGaps ?? {}),
  );
  const hasKey = promptIds.some((id) => answers[id]);
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [mounted, setMounted] = useState(false);
  // Read once, at mount: the field owns the value after that.
  const initial = useRef(
    Object.fromEntries(promptIds.map((id) => [id, store.getState().responses.blanks[id] ?? ''])),
  );
  // The gaps' results, as a string so the selector compares by value: each
  // gap's verdict and its feedback (FG-5's built-in line reaches a gap too).
  const resultsKey = useViewerSelector((s) => {
    for (const status of Object.values(s.sections ?? {})) {
      const items = (
        status as { phase?: string; result?: { items?: Record<string, { verdict: string; feedback?: unknown[] }> } }
      ).result?.items;
      if (items && promptIds.some((id) => items[id])) {
        return JSON.stringify(
          promptIds.map((id) => (items[id] ? { v: items[id]!.verdict, f: items[id]!.feedback ?? null } : null)),
        );
      }
    }
    return '[]';
  });
  const results = JSON.parse(resultsKey) as Array<{ v: string; f: unknown[] | null } | null>;

  useEffect(() => {
    const el = hostRef.current;
    // Paper and a key keep the static equation: no field to type in, and
    // MathLive is about 1 MB this page doesn't need.
    if (!el || hasKey || el.closest("[data-viewer-mode='print']")) return;
    let cancelled = false;
    let destroy: (() => void) | null = null;
    const host = document.createElement('span');
    el.appendChild(host);
    void mathPromptsSurface()(host, {
      latex,
      initialValues: initial.current,
      onValue: (id, ascii) => store.setBlank(id, ascii),
    })
      .then((handle) => {
        if (cancelled) {
          handle.destroy();
          return;
        }
        destroy = () => handle.destroy();
        setMounted(true);
      })
      .catch((err: unknown) => {
        // The boxed equation stays on screen, so the student can still read it.
        if (!cancelled) console.error('[viewer] inline math gaps failed to mount', err);
      });
    return () => {
      cancelled = true;
      destroy?.();
      host.remove();
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latex, hasKey]);

  return (
    <span className="viewer-math-gaps" data-math-gaps="true">
      <span ref={hostRef} className="viewer-math-gaps__field" />
      <span className="viewer-math-gaps__static" data-field-mounted={mounted ? 'true' : 'false'}>
        <InlineMath latex={staticLatex(latex, answers)} />
      </span>
      {results.map((r, i) =>
        r ? (
          <span key={i} className="viewer-math-gap-result">
            <StatePill state={r.v === 'correct' ? 'correct' : 'incorrect'} />
            {r.f ? (
              <span className="viewer-blank__feedback" data-feedback="server">
                <InlineContent nodes={r.f as never} />
              </span>
            ) : null}
          </span>
        ) : null,
      )}
    </span>
  );
}
