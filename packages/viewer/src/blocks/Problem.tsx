// =============================================================================
// blocks/Problem.tsx — numbered static content (S3)
// -----------------------------------------------------------------------------
// A schema oddity worth stating: `problem` is NUMBERED and carries a solution,
// yet emits no gradable response — so its family is STATIC and it shows no ✓/✗
// chrome (checked-state spec, "static: including problem"). Its solution
// disclosure is the 7.4A surface, not state chrome, which is why it can appear
// without a verdict ever existing.
//
// Its solution is NOT authored-and-rendered, though I assumed it would be
// until the compiler said otherwise: the sanitizer strips `problem.solution`
// like every other, so the served block does not carry it and the type will
// not let this file name it. It arrives the same way every other solution
// does — released by the server after the section check, via
// SectionCheckResult.solutions.
//
// ⚠ S4 CONTRACT NOTE: that map is keyed by BLOCK id, not by responding item,
// so no wire change is needed — but the grading RPC must remember to include
// solutions for STATIC blocks in a checked section. A grader that only walks
// the blocks that submitted responses would silently never unlock a problem's
// solution, and the failure would look like a content bug, not a grader bug.
// =============================================================================

import type { ProblemBlock } from '@activity/schema';
import { InlineContent } from '../inline/InlineContent.js';
import { useViewer } from '../container/context.js';
import type { BlockComponentProps } from '../registry/types.js';

export default function Problem({ block }: BlockComponentProps<ProblemBlock>) {
  const { solutionFor } = useViewer();
  const solution = solutionFor(block.id);
  return (
    <div className="viewer-problem" data-block-type="problem" data-block-id={block.id}>
      <div className="viewer-problem__body">
        <InlineContent nodes={block.content} />
      </div>
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
