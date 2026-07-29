// =============================================================================
// check/mock.ts — the scriptable CheckService (S3 ruling D11)
// -----------------------------------------------------------------------------
// Deterministic stand-in for S4's grading RPC so every S3 component, the
// conformance factory, and the /dev/viewer harness exercise the full
// check flow — pending → verdicts → feedback → solution unlock — before the
// server exists. Implements the SAME `CheckService` port S4 will (wire.ts is
// the frozen contract), and records every request so tests can assert the
// id-keyed wire shape.
//
// Scripting model:
//   - `verdicts`: explicit per-item-id verdicts. Unscripted gradable items
//     fall back to `defaultVerdict` ('correct').
//   - freeText responses ALWAYS grade 'recorded' (family spec — the mock
//     refuses to script a judgment verdict onto the recorded family).
//   - `feedback` / `solutions`: per-id content to return.
//   - `failWith`: reject every check (offline / RPC-down states).
//   - `gate()`: hold responses un-resolved until `release()` — how tests
//     freeze the pending state deterministically (no timers).
// =============================================================================

import {
  CHECK_WIRE_VERSION,
  type CheckItemResult,
  type CheckRequest,
  type CheckService,
  type ItemVerdict,
  type ReleasedFeedbackResult,
  type SectionCheckResult,
} from './wire.js';
import type { SanitizedInlineNode } from '../sanitize/sanitized-types.js';

export interface MockCheckScript {
  /** Explicit verdict per item id; unscripted gradable ids use defaultVerdict. */
  verdicts?: Record<string, ItemVerdict>;
  /** Fallback verdict for unscripted gradable items. Default 'correct'. */
  defaultVerdict?: 'correct' | 'incorrect';
  /** Feedback content returned for an item id (post-check). */
  feedback?: Record<string, SanitizedInlineNode[]>;
  /** Solution content revealed per BLOCK id after a section check. */
  solutions?: Record<string, SanitizedInlineNode[]>;
  /** Released teacher feedback for fetchReleasedFeedback. Default ungraded. */
  released?: ReleasedFeedbackResult;
  /** Reject every checkSection with this error (offline / server-down tests). */
  failWith?: Error;
}

export interface MockCheckService extends CheckService {
  /** Every request received, in order — assert the wire shape here. */
  readonly calls: CheckRequest[];
  /** Hold all subsequent checkSection resolutions until release() is called.
   * Returns the release function (idempotent). */
  gate(): () => void;
}

export function createMockCheckService(
  script: MockCheckScript = {},
): MockCheckService {
  const calls: CheckRequest[] = [];
  let gatePromise: Promise<void> | null = null;
  let releaseGate: (() => void) | null = null;

  const gradableItemIds = (request: CheckRequest): string[] => [
    ...Object.keys(request.responses.blanks),
    ...Object.keys(request.responses.choices),
    ...Object.keys(request.responses.matches),
    ...Object.keys(request.responses.orderings),
  ];

  return {
    calls,

    gate() {
      if (!gatePromise) {
        gatePromise = new Promise<void>((resolve) => {
          releaseGate = () => {
            resolve();
            gatePromise = null;
            releaseGate = null;
          };
        });
      }
      // Non-null: the promise executor above ran synchronously.
      return releaseGate!;
    },

    async checkSection(request: CheckRequest): Promise<SectionCheckResult> {
      calls.push(structuredClone(request));
      if (gatePromise) await gatePromise;
      if (script.failWith) throw script.failWith;

      const items: Record<string, CheckItemResult> = {};
      const fallback = script.defaultVerdict ?? 'correct';
      for (const id of gradableItemIds(request)) {
        items[id] = {
          verdict: script.verdicts?.[id] ?? fallback,
          ...(script.feedback?.[id] ? { feedback: script.feedback[id] } : {}),
        };
      }
      // The recorded family is never judged — scripted verdicts are ignored
      // on purpose (family spec: recorded, not graded).
      for (const id of Object.keys(request.responses.freeText)) {
        items[id] = { verdict: 'recorded' };
      }

      return {
        wireVersion: CHECK_WIRE_VERSION,
        sectionId: request.sectionId,
        items,
        solutions: structuredClone(script.solutions ?? {}),
      };
    },

    async fetchReleasedFeedback(): Promise<ReleasedFeedbackResult> {
      return structuredClone(script.released ?? { graded: false, blocks: {} });
    },
  };
}
