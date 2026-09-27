// =============================================================================
// glossary/service.ts — the course glossary's read seam and per-page cache
// -----------------------------------------------------------------------------
// The viewer has no Supabase client and must not grow one: the student route
// injects a GlossaryService exactly as it injects the check service (EN-9), so
// this package stays drivable in tests with a fake and the RPC name lives in
// one exported constant on the app side (P2).
//
// The read's contract (docs/design/glossary.md R1, R6, EN-1, W-10):
//
//   - ONE read per activity per page load. Every caller of `read` while one is
//     in flight JOINS it; nothing ever fires a second concurrent request.
//   - A failure is not cached forever and never hammered: the first failure
//     allows exactly ONE retry, on the next `read` (in practice the next time
//     the student opens the glossary); a second failure is final for the page.
//   - A failed or empty read is SILENT to the student (the worksheet and the
//     activity's own definitions are untouched) and LOUD to a developer: one
//     console.warn naming its cause class and the activity id, never any
//     student data.
//
// The payload is what `glossary_for_activity` returns (migration 0043): null
// when the activity is not a published one this user can open, else ONE jsonb
// object — never a row set, because PostgREST's default 1,000-row cap would
// truncate a row set silently (EN-1).
// =============================================================================

import { GLOSSARY_MAX_ENTRIES, type GlossarySourceEntry } from '@activity/schema';

// Validation (and with it zod) is loaded only when a read actually happens —
// never on the student shell's critical path (perf budget, ruling D16).
const loadParser = () => import('./parsePayload.js');

export interface GlossaryService {
  /** The raw RPC payload for an activity. Throws on transport failure. */
  load(activityId: string): Promise<unknown>;
}

export type GlossaryReadStatus = 'idle' | 'loading' | 'ready' | 'failed';

/** Why a read came back with nothing useful — the developer signal (W-10). */
export type GlossaryReadCause =
  | 'rpc-error'
  | 'not-published'
  | 'no-rows'
  | 'all-retired'
  | 'capped';

export interface GlossaryCache {
  /** Entries for the activity, or null when the read failed. Joins any read
   * already in flight. */
  read(activityId: string): Promise<GlossarySourceEntry[] | null>;
  status(activityId: string): GlossaryReadStatus;
}

interface Slot {
  status: GlossaryReadStatus;
  promise?: Promise<GlossarySourceEntry[] | null>;
  entries?: GlossarySourceEntry[];
  failures: number;
}

export interface GlossaryCacheOptions {
  /** Injected for tests; defaults to console.warn. */
  readonly warn?: (message: string) => void;
}

export function createGlossaryCache(
  service: GlossaryService,
  options: GlossaryCacheOptions = {},
): GlossaryCache {
  const warn = options.warn ?? ((message: string) => console.warn(message));
  const slots = new Map<string, Slot>();

  const signal = (cause: GlossaryReadCause, activityId: string, detail = ''): void => {
    warn(`[glossary] ${cause} for activity ${activityId}${detail ? ` (${detail})` : ''}`);
  };

  const fetchInto = (activityId: string, slot: Slot): Promise<GlossarySourceEntry[] | null> => {
    slot.status = 'loading';
    const promise = Promise.all([service.load(activityId), loadParser()]).then(
      ([raw, { parseGlossaryPayload }]) => {
        const parsed = parseGlossaryPayload(raw);
        slot.status = 'ready';
        slot.entries = parsed.entries;
        if (!parsed.published) signal('not-published', activityId);
        else if (parsed.entries.length === 0) signal('no-rows', activityId);
        else if (parsed.entries.every((e) => e.retired)) signal('all-retired', activityId);
        if (parsed.capped) signal('capped', activityId, `${GLOSSARY_MAX_ENTRIES} entries`);
        if (parsed.dropped > 0) {
          signal('rpc-error', activityId, `${parsed.dropped} invalid rows dropped`);
        }
        return parsed.entries;
      },
      (error: unknown) => {
        slot.failures += 1;
        slot.status = 'failed';
        slot.promise = undefined;
        signal('rpc-error', activityId, error instanceof Error ? error.message : 'unknown');
        return null;
      },
    );
    slot.promise = promise;
    return promise;
  };

  return {
    read(activityId) {
      let slot = slots.get(activityId);
      if (!slot) {
        slot = { status: 'idle', failures: 0 };
        slots.set(activityId, slot);
      }
      if (slot.status === 'ready') return Promise.resolve(slot.entries ?? []);
      if (slot.promise) return slot.promise;
      if (slot.status === 'failed' && slot.failures >= 2) return Promise.resolve(null);
      return fetchInto(activityId, slot);
    },
    status(activityId) {
      return slots.get(activityId)?.status ?? 'idle';
    },
  };
}
