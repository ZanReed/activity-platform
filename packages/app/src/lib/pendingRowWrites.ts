// =============================================================================
// pendingRowWrites.ts — writes to an activity row still in flight in this tab
// (UI review G-8, Fable review)
// -----------------------------------------------------------------------------
// The editor's conflict check compares the row's updated_at with the one it
// loaded. Print view writes the same row (meta.print) and saves on unmount, so
// "nudge a margin, go back" could let the editor load the row BEFORE that
// write landed — and its first save would then be taken for another tab's
// change. Writers in this tab register here; the editor waits for them before
// it reads. Same-tab only, by design: other tabs are real conflicts.
// =============================================================================

const pending = new Map<string, Set<Promise<unknown>>>();

/** Register a write to activity `id`; returns the same promise. */
export function trackRowWrite<T>(id: string, write: Promise<T>): Promise<T> {
    const set = pending.get(id) ?? new Set<Promise<unknown>>();
    pending.set(id, set);
    set.add(write);
    const done = () => {
        set.delete(write);
        if (set.size === 0) pending.delete(id);
    };
    write.then(done, done);
    return write;
}

/** Resolves once every write to `id` registered so far has settled. */
export async function rowWritesSettled(id: string): Promise<void> {
    const set = pending.get(id);
    if (!set) return;
    await Promise.allSettled([...set]);
}
