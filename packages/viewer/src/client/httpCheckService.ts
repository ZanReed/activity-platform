// =============================================================================
// client/httpCheckService.ts — the real CheckService (S3 route → S4 server)
// -----------------------------------------------------------------------------
// Implements the frozen port from check/wire.ts against the grading endpoint.
// Written NOW, before S4's RPC exists, on purpose: the wire module is the
// contract-freeze artifact, so building the client from it proves the contract
// is implementable and gives S4 a concrete consumer to satisfy rather than a
// prose description.
//
// Until that endpoint is deployed, checking fails — and that failure is the
// DESIGNED path, not a broken one: the store catches it, keeps every response
// intact, and the section shows "Couldn't check — try again" (ruling 2.1A).
// The route is fully usable meanwhile; students can read and answer, they just
// cannot check yet. That is a truthful state to ship to a staging environment,
// and much better than a viewer that pretends to grade.
//
// The mock (check/mock.ts) remains the test and /dev/viewer implementation;
// both satisfy the same interface, which is the point of the port.
// =============================================================================

import type {
  CheckRequest,
  CheckService,
  ReleasedFeedbackResult,
  SectionCheckResult,
} from '../check/wire.js';
import { CHECK_WIRE_VERSION } from '../check/wire.js';

export interface HttpCheckServiceOptions {
  /** Full URL of the grading function. */
  checkUrl: string;
  /** Full URL of the released-feedback function (the get-feedback precedent). */
  feedbackUrl: string;
  getAccessToken: () => Promise<string | null> | string | null;
  fetchImpl?: typeof fetch;
}

export function createHttpCheckService(
  options: HttpCheckServiceOptions,
): CheckService {
  const doFetch = options.fetchImpl ?? fetch;

  async function post(url: string, body: unknown): Promise<unknown> {
    const token = await options.getAccessToken();
    if (!token) throw new Error('Not signed in');
    const response = await doFetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      // Deliberately a plain Error with a short message: the store surfaces it
      // as the non-blaming "Couldn't check — try again", and a student should
      // never read a status code.
      throw new Error(`Check failed (${response.status})`);
    }
    return await response.json();
  }

  return {
    async checkSection(request: CheckRequest): Promise<SectionCheckResult> {
      const data = (await post(options.checkUrl, request)) as SectionCheckResult;
      // A server on a different wire version is a deploy-order mistake
      // (CLAUDE.md's standing rule about redeploying before republishing).
      // Fail loudly rather than rendering verdicts from a shape we do not know.
      if (data.wireVersion !== CHECK_WIRE_VERSION) {
        throw new Error(
          `Grader speaks wire v${data.wireVersion}, viewer speaks v${CHECK_WIRE_VERSION}`,
        );
      }
      return data;
    },

    async fetchReleasedFeedback(activityId: string): Promise<ReleasedFeedbackResult> {
      const data = (await post(options.feedbackUrl, {
        activity_id: activityId,
      })) as ReleasedFeedbackResult;
      return {
        graded: data.graded === true,
        blocks: data.blocks ?? {},
      };
    },
  };
}
