// =============================================================================
// server/video-pause-handler.ts — one clip's pause check (D64 VP-3, slice 3)
// -----------------------------------------------------------------------------
// Grades one faded block and says right or wrong, with its mistake feedback and
// never its answers. It writes no section check.
//
// The order is the design, as in check-activity-handler:
//
//   chain (as caller) ─► raw doc ─► the block is a placed clip's pause ─►
//   video_source (as caller) ─► grade ─► record ─► respond
//
// video_source is D73's gate: a student it won't give the clip to gets no verdict
// either. Without that, this mode would answer "is this right?" on any faded block
// with a clip in its section, before the section's check, for anyone signed in.
// The verdict leaves only after the try is recorded, so a retry can't change a
// first answer it never saw.
// =============================================================================

import { UpgradeError, clipIsPlaced, upgradeActivityDocument, videoPauseTargets, type VideoBlock } from '@activity/schema';
import {
  CHECK_WIRE_VERSION,
  type SectionCheckResult,
  type SectionResponses,
  type VideoPauseResult,
} from '../check/wire.js';
import type { SanitizedInlineNode } from '../sanitize/sanitized-types.js';
import { gradeSection } from './grading/index.js';
import type { CorsKit, DbResult } from './get-activity-handler.js';
import { autoGradedIds, seedContextFor } from './dol.js';
import { jwtSub } from './jwt.js';
import { UUID_RE } from './uuid.js';

export interface VideoPauseDb {
  versionForCheck(authHeader: string, activityId: string, versionId: string): Promise<DbResult<unknown>>;
  readVersion(versionId: string): Promise<DbResult<{ content: unknown }>>;
  /** `video_source` (0078) AS THE CALLER: any row means the clip is theirs to use. */
  videoSource(authHeader: string, activityId: string, versionId: string, videoId: string): Promise<DbResult<unknown[]>>;
  /** `record_video_pause_try` (0079), SERVICE ROLE. */
  recordPauseTry(args: {
    studentId: string;
    activityId: string;
    versionId: string;
    sectionId: string;
    blockId: string;
    correct: boolean;
  }): Promise<DbResult<{ recorded: boolean; already_checked?: boolean }>>;
}

export interface VideoPauseDeps {
  db: VideoPauseDb;
  cors: CorsKit;
  servedOrderings?: (args: {
    document: unknown;
    versionId: string;
    studentId: string;
    sectionId: string;
  }) => Record<string, string[]>;
}

type ValidateResponses = (
  r: unknown,
) => { ok: true; responses: SectionResponses } | { ok: false; failure: { message: string; code: string } };

interface SectionShape {
  id: string;
  rows: { columns: { blocks: { id: string; type: string }[] }[] }[];
}

/** The section and block this request names, if the block is a clip's pause. The
 * same placement rule as a save: no pause in a DoL, a quiz, an exam or a locked
 * file, whatever a stored `stale` says, because a pause gives a verdict. */
function findPauseTarget(doc: { sections: SectionShape[]; meta?: object }, blockId: string) {
  for (const section of doc.sections) {
    const blocks = section.rows.flatMap((row) => row.columns.flatMap((column) => column.blocks));
    for (const video of blocks.filter((block) => block.type === 'video') as unknown as VideoBlock[]) {
      if (!clipIsPlaced(section as never, video, (doc.meta ?? {}) as never)) continue;
      const index = videoPauseTargets(section as never, video).findIndex((block) => block.id === blockId);
      if (index >= 0 && index < video.pauses.length) return { sectionId: section.id, videoId: video.id };
    }
  }
  return null;
}

function blockIn(doc: unknown, sectionId: string, blockId: string): unknown {
  const section = (doc as { sections: SectionShape[] }).sections.find((s) => s.id === sectionId);
  return section?.rows
    .flatMap((row) => row.columns.flatMap((column) => column.blocks))
    .find((block) => block.id === blockId);
}

export function createVideoPauseHandler(deps: VideoPauseDeps) {
  const { db, cors } = deps;

  return async function handleVideoPause(
    req: Request,
    authHeader: string,
    body: unknown,
    validateResponses: ValidateResponses,
  ): Promise<Response> {
    const b = body as Record<string, unknown>;
    if (b.wireVersion !== CHECK_WIRE_VERSION) {
      return cors.errorResponse(req, 400, 'Unsupported wire version', { code: 'wire_version_mismatch' });
    }
    for (const key of ['activityId', 'versionId', 'blockId']) {
      if (typeof b[key] !== 'string' || !UUID_RE.test(b[key] as string)) {
        return cors.errorResponse(req, 400, `${key} must be a UUID`, { code: 'bad_request' });
      }
    }
    const [activityId, versionId, blockId] = [b.activityId, b.versionId, b.blockId] as string[];
    const checked = validateResponses(b.responses);
    if (!checked.ok) {
      return cors.errorResponse(req, 400, checked.failure.message, { code: checked.failure.code });
    }

    const { data: version, error: authError } = await db.versionForCheck(authHeader, activityId!, versionId!);
    if (authError || !version) {
      const message = authError?.message ?? '';
      if (/JWT|token|auth/i.test(message) && !message.includes('Not available')) {
        return cors.errorResponse(req, 401, message);
      }
      if (authError && !message.includes('Not available')) {
        console.error('[check-activity] pause authorization RPC error:', authError);
        return cors.errorResponse(req, 500, 'Could not check that');
      }
      return cors.errorResponse(req, 404, 'Not available');
    }
    const studentId = jwtSub(authHeader);
    if (!studentId) return cors.errorResponse(req, 500, 'Could not identify the student');

    const { data: row, error: readError } = await db.readVersion(versionId!);
    if (readError || !row) {
      console.error('[check-activity] pause version read failed:', readError);
      return cors.errorResponse(req, 500, 'Could not load the activity');
    }
    let doc;
    try {
      doc = upgradeActivityDocument(row.content).doc;
    } catch (err) {
      if (err instanceof UpgradeError) return cors.errorResponse(req, 500, 'Could not load the activity');
      throw err;
    }

    const target = findPauseTarget(doc as never, blockId!);
    if (!target) return cors.errorResponse(req, 404, 'Not available');

    // Fails closed: a failed read of the gate is a no.
    const { data: source, error: sourceError } = await db.videoSource(authHeader, activityId!, versionId!, target.videoId);
    if (sourceError || !source || source.length === 0) {
      if (sourceError) console.error('[check-activity] pause gate error:', sourceError);
      return cors.errorResponse(req, 404, 'Not available');
    }

    const ctx = seedContextFor(doc, versionId!, studentId, target.sectionId, 1);
    const block = blockIn(ctx.doc, target.sectionId, blockId!);
    const alone = {
      ...(ctx.doc as object),
      sections: [{ id: target.sectionId, rows: [{ columns: [{ blocks: [block] }] }] }],
    };
    const graded: SectionCheckResult = gradeSection({
      document: alone as never,
      sectionId: target.sectionId,
      responses: checked.responses,
      seedValues: ctx.seedValues,
      servedOrderings: deps.servedOrderings?.({
        document: ctx.doc,
        versionId: versionId!,
        studentId,
        sectionId: target.sectionId,
      }),
    });

    const respond = (result: Omit<VideoPauseResult, 'wireVersion'>) =>
      cors.jsonResponse(req, { wireVersion: CHECK_WIRE_VERSION, ...result });

    // Nothing answered in this block is not a try, and carries no verdict.
    if (Object.keys(graded.items).length === 0) return respond({ state: 'empty' });

    // A blank left empty inside an answered block counts as wrong. A block with
    // only free text has nothing to judge, so it can't hold anyone at the pause.
    const correct = autoGradedIds(block).every((id) => graded.items[id]?.verdict === 'correct');

    const { data: recorded, error: recordError } = await db.recordPauseTry({
      studentId,
      activityId: activityId!,
      versionId: versionId!,
      sectionId: target.sectionId,
      blockId: blockId!,
      correct,
    });
    if (recordError || !recorded) {
      if (recordError?.message?.includes('rate_limited')) {
        return cors.errorResponse(req, 429, 'Too many tries', { code: 'rate_limited' });
      }
      console.error('[check-activity] pause record failed:', recordError);
      return cors.errorResponse(req, 500, 'Could not check that');
    }
    if (recorded.already_checked) return respond({ state: 'already_checked' });
    if (correct) return respond({ state: 'right' });

    const feedback = Object.values(graded.items).flatMap((item) =>
      item.verdict === 'incorrect' && item.feedback ? [item.feedback as SanitizedInlineNode[]] : [],
    );
    return respond({ state: 'wrong', feedback });
  };
}
