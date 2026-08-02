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

/**
 * Per-device data the viewer scopes by (user, activity, version). `buffer` is
 * the student's work; `doc` is the served document their work belongs to
 * (documentCache.ts). Both share one key grammar so ONE sweep covers them —
 * a second store with its own naming would need its own guard, and the guard
 * that gets forgotten is the one that leaks.
 */
export type ScopedKind = 'buffer' | 'doc';

export function scopedKey(kind: ScopedKind, parts: BufferKeyParts): string {
  return `${VIEWER_STORAGE_PREFIX}${kind}:${parts.userId}:${parts.activityId}:${parts.versionId}`;
}

export interface ScopedKeyParts extends BufferKeyParts {
  kind: ScopedKind;
}

/** null when the key is not viewer-scoped data OR is malformed. Malformed is
 * unattributable rather than guessed at: the sweeps delete what they cannot
 * attribute, which is the safe direction for keys holding student work. */
export function parseScopedKey(key: string): ScopedKeyParts | null {
  if (!key.startsWith(VIEWER_STORAGE_PREFIX)) return null;
  const segments = key.slice(VIEWER_STORAGE_PREFIX.length).split(':');
  if (segments.length !== 4) return null;
  const [kind, userId, activityId, versionId] = segments;
  if (kind !== 'buffer' && kind !== 'doc') return null;
  if (!userId || !activityId || !versionId) return null;
  return { kind, userId, activityId, versionId };
}

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
  return scopedKey('buffer', parts);
}

/** As `parseScopedKey`, narrowed to buffers. */
export function parseBufferKey(key: string): BufferKeyParts | null {
  const parts = parseScopedKey(key);
  if (parts?.kind !== 'buffer') return null;
  return {
    userId: parts.userId,
    activityId: parts.activityId,
    versionId: parts.versionId,
  };
}

/** Every viewer-scoped key currently in storage. Collected before any removal —
 * removing while iterating shifts `key(i)` indices. */
function scopedKeys(storage: StorageLike): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key === null) continue;
    // Anything under the prefix, including malformed keys — the sweeps decide
    // what to do with those, and they must be able to SEE them first.
    if (key.startsWith(VIEWER_STORAGE_PREFIX)) keys.push(key);
  }
  return keys;
}

/**
 * Does this buffer hold anything the student has not yet had graded? Drives
 * the one exception in the orphan GC (ruling S6-9): a buffer for a superseded
 * version is disposable UNLESS it still carries work or a queued check.
 */
export function bufferHasUnsentWork(raw: string | null): boolean {
  if (!raw) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (typeof parsed !== 'object' || parsed === null) return false;
  const blob = parsed as {
    responses?: Record<string, Record<string, unknown>>;
    pending?: Record<string, unknown>;
  };
  if (blob.pending && Object.keys(blob.pending).length > 0) return true;
  for (const category of Object.values(blob.responses ?? {})) {
    if (category && Object.keys(category).length > 0) return true;
  }
  return false;
}

/**
 * BOOT SWEEP (ruling S6-6). Remove every piece of viewer-scoped data that is
 * not the signed-in user's — buffers and cached documents alike — plus
 * anything under the prefix too malformed to attribute to anyone. Sign-out
 * already deletes the whole prefix, so sparing an unattributable key here
 * would be the one inconsistency between the two paths that clean a device.
 *
 * Sign-out is not the only way a student leaves a shared Chromebook — lids
 * close, tabs crash, batteries die. Without this, the only thing standing
 * between student B and student A's answers is that B's key lookup misses;
 * A's work would still be sitting on the disk. Returns the removed keys so the
 * caller can log or assert on them.
 */
export function sweepForeignStorage(
  storage: StorageLike,
  currentUserId: string,
): string[] {
  const removed: string[] = [];
  try {
    for (const key of scopedKeys(storage)) {
      const parts = parseScopedKey(key);
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
    for (const key of scopedKeys(storage)) {
      const parts = parseScopedKey(key);
      if (parts === null) continue; // sweepForeignStorage owns malformed keys
      if (
        parts.userId !== keep.userId ||
        parts.activityId !== keep.activityId ||
        parts.versionId === keep.versionId
      ) {
        continue;
      }
      // THE ONE EXCEPTION (ruling S6-9). A superseded version's buffer is
      // disposable only if it is spent. If the student still has answers there
      // or a check waiting to fire, this GC would be silent data loss — a
      // teacher republishing overnight would delete the work of every student
      // who left something unsent, and nobody would ever know it had existed.
      // The boot path decides what to do with it; the GC just must not eat it.
      if (parts.kind === 'buffer' && bufferHasUnsentWork(storage.getItem(key))) {
        continue;
      }
      storage.removeItem(key);
      removed.push(key);
    }
  } catch {
    // Storage unavailable — nothing to collect.
  }
  return removed;
}

/**
 * The superseded version this student still has unsent work on, if any
 * (ruling S6-9). Returns the version id and its raw blob so the boot path can
 * decide between rendering it pinned and preserving it with a notice.
 */
export function findUnsentWork(
  storage: StorageLike,
  current: BufferKeyParts,
): { versionId: string; raw: string } | null {
  try {
    for (const key of scopedKeys(storage)) {
      const parts = parseScopedKey(key);
      if (
        parts?.kind !== 'buffer' ||
        parts.userId !== current.userId ||
        parts.activityId !== current.activityId ||
        parts.versionId === current.versionId
      ) {
        continue;
      }
      const raw = storage.getItem(key);
      if (bufferHasUnsentWork(raw) && raw !== null) {
        return { versionId: parts.versionId, raw };
      }
    }
  } catch {
    // Storage unavailable.
  }
  return null;
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
