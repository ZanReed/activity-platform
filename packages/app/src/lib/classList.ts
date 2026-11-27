// =============================================================================
// lib/classList.ts — the teacher's class list, one copy for every screen
// -----------------------------------------------------------------------------
// Review C5 slice 2 (docs/design/shared-data-loading.md, decision 5). Seven
// screens show the teacher's classes (Classes, Present, Plan, Hooks, Practice,
// the publish panel's "Add to class", the Activities page's class doors); they
// used to read the list seven times. They now share CLASS_LIST_KEY: one read,
// remembered for the visit, and a change made on one screen (a rename, a new
// class, a delete) shows on every other through updateLoaded / reloadKey.
//
// Its own file, not lib/classes.ts: that file is also imported by the student
// Home, and useLoad must never enter the student shell (decision 3).
// =============================================================================

import { listClasses, type ClassInfo } from './classes';
import { useLoad, type LoadKey, type LoadState } from './useLoad';

export const CLASS_LIST_KEY: LoadKey = ['classes'];

/** The teacher's classes (newest first, as listClasses returns them). */
export function useClassList(enabled = true): LoadState<ClassInfo[]> {
    return useLoad(enabled ? CLASS_LIST_KEY : null, listClasses, { remember: true, refreshOnReturn: true });
}

/** One class from the shared list; null until it loads, or if absent. */
export function useClassInfo(classId: string, enabled = true): ClassInfo | null {
    return useClassList(enabled).data?.find((c) => c.id === classId) ?? null;
}
