// =============================================================================
// blocks/MathBlock.tsx — display equation, optionally with gaps (S3)
// -----------------------------------------------------------------------------
// TWO BLOCKS IN ONE, and the registry says so: `familyOf` resolves a
// promptless math_block to STATIC and a gap-bearing one to auto_gradable. This
// component honours that split rather than always mounting the heavy path:
//
//  - No prompts → a KaTeX display render and nothing else. No MathLive, no
//    store wiring, no state chrome.
//  - Prompts → the same KaTeX render stays as the fallback, and MathLive
//    mounts over it with ONLY the `\placeholder[id]{}` regions editable. If
//    that chunk never arrives, the student still sees the equation.
//
// The gap ids are BLANK ids on the wire: a math gap and a prose blank are the
// same response category (check/wire.ts), so the grader treats "fill in the
// coefficient" identically wherever it was authored. MathLive reports LaTeX;
// the kit converts to ascii-math, which is the form stored and graded (MA-D3)
// — so a value typed here is byte-identical to the same answer typed in a
// prose blank.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import type { MathBlock as MathBlockType } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useBlockAnswerKey } from '../answer-key/context.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';
import { loadMathRenderer, residentMathRenderer } from '../inline/math.js';
import { StatePill } from './StatePill.js';
import { mathPromptsSurface, type MathPromptsSurfaceHandle } from './kitSurfaces.js';

export default function MathBlock({
  block,
  mode = 'screen',
}: BlockComponentProps<MathBlockType>) {
  const { store, state, phaseOf, resultFor, solutionFor } = useViewer();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<MathPromptsSurfaceHandle | null>(null);
  const prompts = block.prompts ?? [];
  const hasGaps = prompts.length > 0;
  const phase = phaseOf(block.id);
  const solution = solutionFor(block.id);

  // KaTeX display render — always present, and the fallback when the gap
  // field never loads.
  const [promptsMounted, setPromptsMounted] = useState(false);
  // KaTeX cannot parse `\placeholder[id]{}` — it renders a red error. The
  // fallback must be a READABLE equation with empty boxes, since its whole job
  // is to be what a student sees when MathLive never arrives (and what they
  // answer on paper). Swap the markers for \square before rendering.
  //
  // With a teacher answer key, each marker takes its ANSWER instead — boxed, so
  // the key shows both the value and where the gap was. This is a deliberate
  // VIEWER-ONLY improvement (recorded in ANSWER_KEY_COVERAGE): the renderer
  // never passed showAnswers down to a math block at all, so a gap-bearing
  // equation — a graded question — printed a key with nothing in it. The stored
  // answer is ascii by MA-D3, which is why it can go straight into KaTeX.
  const answerKey = useBlockAnswerKey(block.id);
  const gapAnswers = answerKey?.mathGaps;
  const fallbackLatex = block.latex.replace(
    /\\placeholder\[([^\]]*)\]\{[^}]*\}/g,
    (_marker, promptId: string) => {
      const answer = gapAnswers?.[promptId];
      return answer ? `\\boxed{${answer}}` : '\\square';
    },
  );
  const [html, setHtml] = useState<string | null>(() => {
    const resident = residentMathRenderer();
    return resident ? resident(fallbackLatex, true) : null;
  });
  useEffect(() => {
    if (html !== null) return;
    let cancelled = false;
    void loadMathRenderer().then((render) => {
      if (!cancelled) setHtml(render(fallbackLatex, true));
    });
    return () => {
      cancelled = true;
    };
  }, [html, fallbackLatex]);

  // Snapshot restored gap values once, at mount.
  const initialRef = useRef(
    Object.fromEntries(
      prompts.map((p) => [p.id, state.responses.blanks[p.id] ?? '']),
    ),
  );

  useEffect(() => {
    // gapAnswers: an answered equation must keep its static render. Mounting
    // the editable field over it would hide the answers behind empty gaps —
    // the key would look blank for the one block type that needed it most.
    if (!hasGaps || mode === 'print' || gapAnswers) return;
    const el = hostRef.current;
    if (!el) return;

    let cancelled = false;
    // Per-mount host, for the same reason the canvas blocks use one: React
    // dev-mode double-mounts, and the kit writes into the element it is given.
    const host = document.createElement('div');
    host.dataset.mathPromptHost = 'true';
    el.appendChild(host);

    void mathPromptsSurface()(host, {
      latex: block.latex,
      initialValues: initialRef.current,
      onValue: (promptId, ascii) => store.setBlank(promptId, ascii),
    })
      .then((handle) => {
        if (cancelled) {
          handle.destroy();
          return;
        }
        handleRef.current = handle;
        // The field is in — hide the static render rather than remove it, so
        // the two never show at once (the runtime's rule; without it a
        // gap-bearing equation renders twice, once as a KaTeX error).
        setPromptsMounted(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Non-fatal by design: the KaTeX render below is still on screen, so
        // the student can read the equation and answer on paper. Logged, not
        // surfaced as a failure banner.
        console.error('[viewer] math prompts failed to mount', {
          blockId: block.id,
          err,
        });
      });

    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
      host.remove();
      setPromptsMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, hasGaps, mode, gapAnswers]);

  return (
    <div
      className="viewer-math-block"
      data-block-type="math_block"
      data-block-id={block.id}
      data-has-gaps={hasGaps ? 'true' : 'false'}
      data-phase={phase}
    >
      {hasGaps ? <div ref={hostRef} data-math-prompts="true" /> : null}

      {promptsMounted ? null : html === null ? (
        <span data-math-pending="true">{fallbackLatex}</span>
      ) : (
        <div
          className="viewer-math-block__render"
          data-math="display"
          data-fallback={hasGaps ? 'true' : 'false'}
          // KaTeX output; safe per inline/math.ts (trust:false).
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {hasGaps ? (
        <>
          {phase === 'checking' ? <StatePill state="pending" label="Checking…" /> : null}
          {prompts.map((prompt) => {
            const result = resultFor(block.id, prompt.id);
            return result ? (
              <StatePill
                key={prompt.id}
                state={result.verdict === 'correct' ? 'correct' : 'incorrect'}
              />
            ) : null;
          })}
        </>
      ) : null}

      {solution ? (
        <details className="viewer-solution">
          <summary>Show solution</summary>
          <div className="viewer-solution__body">
            <InlineContent nodes={solution} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
