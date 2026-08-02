// =============================================================================
// store/buffer.ts — the local-first buffer (S6 rulings S6-1 / S6-10)
// -----------------------------------------------------------------------------
// Student work survives a dead network, a closed lid, and a reload. This is the
// module that makes that true, and the one that must never hand one student
// another student's work.
//
// KEY SCHEME (the shared-device contract):
//
//   activity-viewer:buffer:<userId>:<activityId>:<versionId>
//   └──────┬───────┘└──┬──┘└──┬───┘
//          │           │      └─ scopes work to a person. The boot sweep
//          │           │         removes every buffer key that is not the
//          │           │         signed-in user's, so a crash-without-signout
//          │           │         still leaves the next student a clean machine.
//          │           └─ sub-namespace: the sweep only ever touches buffers,
//          │              never other viewer-namespaced keys.
//          └─ the prefix `signOutEverything` purges. Writing outside it means
//             sign-out silently misses the work — so this constant is the
//             contract, and the app imports it rather than restating it.
//
// WRITE POLICY (S6-10): trailing debounce + an unconditional flush when the
// page goes away. Writing on every keystroke serializes the whole state
// synchronously on the floor device (a Chromebook) and shows up as typing
// jank; debouncing alone loses the last few hundred milliseconds exactly when
// a lid closes, which is the single most common way these sessions end. Doing
// both costs one listener and closes the window.
//
//   setBlank ──► save() ──┐
//   setChoices ─► save() ─┼─► [debounce ~300ms] ──► write ──► localStorage
//   setOrdering ─► save() ┘                          ▲
//                                                    │
//   visibilitychange→hidden / pagehide ──► flush() ──┘  (synchronous, now)
//
// Storage failure is DEGRADED, never fatal: a locked-down profile or a full
// quota must not take down the viewer. The status is surfaced so the UI can be
// honest that work is not being saved locally, rather than pretending.
// =============================================================================

import type { Clock, HideSignal, TimerHandle } from './ports.js';
import { createDocumentHideSignal, systemClock } from './ports.js';

/**
 * Namespace for everything the viewer persists on-device. `signOutEverything`
 * purges by this prefix — it is the contract that makes the shared-device
 * purge complete, so it lives HERE (with the code that writes the keys) and is
 * imported by the app rather than duplicated as a second literal.
 */
export const VIEWER_STORAGE_PREFIX = 'activity-viewer:';

/** Buffers get their own sub-namespace so sweeps can't collateral-damage
 * other viewer-namespaced keys. */
export const BUFFER_KEY_PREFIX = `${VIEWER_STORAGE_PREFIX}buffer:`;

export const DEFAULT_BUFFER_DEBOUNCE_MS = 300;

/** The subset of `Storage` this module uses — injectable so suites run in node
 * and so a caller can pass sessionStorage or a probe. */
export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface BufferKeyParts {
  userId: string;
  activityId: string;
  versionId: string;
}

export function bufferKey(parts: BufferKeyParts): string {
  return `${BUFFER_KEY_PREFIX}${parts.userId}:${parts.activityId}:${parts.versionId}`;
}

/**
 * null when `key` is not a buffer key OR is malformed. Malformed is treated as
 * unattributable rather than guessed at: the sweeps delete what they cannot
 * attribute, which is the safe direction for a key holding student work.
 */
export function parseBufferKey(key: string): BufferKeyParts | null {
  if (!key.startsWith(BUFFER_KEY_PREFIX)) return null;
  const segments = key.slice(BUFFER_KEY_PREFIX.length).split(':');
  if (segments.length !== 3) return null;
  const [userId, activityId, versionId] = segments;
  if (!userId || !activityId || !versionId) return null;
  return { userId, activityId, versionId };
}

/** Every buffer key currently in storage. Collected before any removal —
 * removing while iterating shifts `key(i)` indices. */
function bufferKeys(storage: StorageLike): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key !== null && key.startsWith(BUFFER_KEY_PREFIX)) keys.push(key);
  }
  return keys;
}

/**
 * BOOT SWEEP (ruling S6-6). Remove every buffer that is not the signed-in
 * user's, plus any buffer key too malformed to attribute.
 *
 * Sign-out is not the only way a student leaves a shared Chromebook — lids
 * close, tabs crash, batteries die. Without this, the only thing standing
 * between student B and student A's answers is that B's key lookup misses;
 * A's work would still be sitting on the disk. Returns the removed keys so the
 * caller can log or assert on them.
 */
export function sweepForeignBuffers(
  storage: StorageLike,
  currentUserId: string,
): string[] {
  const removed: string[] = [];
  try {
    for (const key of bufferKeys(storage)) {
      const parts = parseBufferKey(key);
      if (parts === null || parts.userId !== currentUserId) {
        storage.removeItem(key);
        removed.push(key);
      }
    }
  } catch {
    // Storage unavailable — nothing is buffered there to sweep.
  }
  return removed;
}

/**
 * ORPHAN GC (ruling S6-10). Drop this user's buffers for OTHER versions of the
 * same activity once the current version has loaded.
 *
 * Every republish mints a new versionId, and a version-keyed buffer for a
 * version the student can no longer be served is dead weight. On a shared
 * machine used by many students across many republishes that is a slow march
 * toward the quota ceiling, whose failure mode is "work silently stops
 * saving" — so this is a data-loss prevention, not tidiness.
 *
 * Deliberately scoped to (this user, this activity): other activities may
 * legitimately have work in progress.
 */
export function sweepOrphanVersions(
  storage: StorageLike,
  keep: BufferKeyParts,
): string[] {
  const removed: string[] = [];
  try {
    for (const key of bufferKeys(storage)) {
      const parts = parseBufferKey(key);
      if (parts === null) continue; // sweepForeignBuffers owns malformed keys
      if (
        parts.userId === keep.userId &&
        parts.activityId === keep.activityId &&
        parts.versionId !== keep.versionId
      ) {
        storage.removeItem(key);
        removed.push(key);
      }
    }
  } catch {
    // Storage unavailable — nothing to collect.
  }
  return removed;
}

export type BufferStatus =
  | 'ok'
  /** Storage refused the write: the device is full. Work is still in memory
   * and still submittable; it just won't survive a reload. */
  | 'quota-exceeded'
  /** Storage threw or is absent (private mode, locked-down profile). */
  | 'unavailable';

export interface ViewerBufferOptions extends BufferKeyParts {
  storage: StorageLike;
  /** Produces the blob to persist — the store's `serialize`. */
  serialize: () => string;
  clock?: Clock;
  hideSignal?: HideSignal;
  debounceMs?: number;
  /**
   * Gate for every write, including the hide flush (ruling S6-4 / outside
   * voice #7). A tab that lost the edit lock must stop WRITING, not merely
   * stop accepting input — otherwise closing that stale tab hours later
   * flushes its old state over the active tab's newer work.
   */
  canWrite?: () => boolean;
  onStatusChange?: (status: BufferStatus) => void;
}

export interface ViewerBuffer {
  /** Raw persisted blob for this (user, activity, version), or null. */
  load(): string | null;
  /** Schedule a debounced write. */
  save(): void;
  /** Write now if anything is pending. Idempotent. */
  flush(): void;
  /** Remove this buffer's key. */
  clear(): void;
  status(): BufferStatus;
  /** Stop listening and flush what's pending. */
  dispose(): void;
}

function isQuotaError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const { name, code } = err as { name?: unknown; code?: unknown };
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    code === 22 ||
    code === 1014
  );
}

export function createViewerBuffer(
  options: ViewerBufferOptions,
): ViewerBuffer {
  const {
    storage,
    serialize,
    clock = systemClock,
    hideSignal = createDocumentHideSignal(),
    debounceMs = DEFAULT_BUFFER_DEBOUNCE_MS,
    canWrite = () => true,
    onStatusChange,
  } = options;

  const key = bufferKey(options);
  let timer: TimerHandle | undefined;
  let dirty = false;
  let status: BufferStatus = 'ok';

  function setStatus(next: BufferStatus): void {
    if (status === next) return;
    status = next;
    onStatusChange?.(next);
  }

  function write(): void {
    if (!dirty) return;
    if (!canWrite()) return; // stale tab: stay dirty, never clobber
    try {
      storage.setItem(key, serialize());
      dirty = false;
      setStatus('ok');
    } catch (err) {
      // Never rethrow: a full or hostile storage must not break the viewer.
      // `dirty` stays true so a later flush (with more room, or after the
      // student clears space) still lands.
      setStatus(isQuotaError(err) ? 'quota-exceeded' : 'unavailable');
    }
  }

  function cancelTimer(): void {
    if (timer !== undefined) {
      clock.clearTimer(timer);
      timer = undefined;
    }
  }

  const unsubscribeHide = hideSignal.subscribe(() => {
    cancelTimer();
    write();
  });

  return {
    load() {
      try {
        return storage.getItem(key);
      } catch {
        setStatus('unavailable');
        return null;
      }
    },

    save() {
      dirty = true;
      cancelTimer();
      timer = clock.setTimer(() => {
        timer = undefined;
        write();
      }, debounceMs);
    },

    flush() {
      cancelTimer();
      write();
    },

    clear() {
      cancelTimer();
      dirty = false;
      try {
        storage.removeItem(key);
      } catch {
        setStatus('unavailable');
      }
    },

    status: () => status,

    dispose() {
      unsubscribeHide();
      cancelTimer();
      write();
    },
  };
}
