// =============================================================================
// studentViewPrefs.ts — per-device conveniences on the student viewer
// (2026-11-15)
// -----------------------------------------------------------------------------
// Two small things a student's device remembers; neither is work, so neither
// goes to the server, and both fail quietly (private mode, blocked storage):
//   - TEXT SIZE: A− / A+ in the top bar, four steps, for every activity on
//     this device. Applied as --viewer-text-scale on <html>, which the
//     viewer's root font-size multiplies (viewer.css `.viewer`).
//   - WHERE THEY LEFT OFF: the section they last worked in, per student and
//     activity, so reopening scrolls back to it; and the activity they last
//     opened, which Home offers as "Continue". Keyed by the student's id, so
//     a shared Chromebook never takes one student to another's place.
//   - HOME'S "Hide done" choice.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';

export const TEXT_SCALES = [1, 1.15, 1.3, 1.5] as const;
// Per student, so on a shared Chromebook one student's A+ is not the next's.
const textKey = (userId: string | null) => `viewer-text-scale:${userId ?? ''}`;
/** Sign-out clears the keys that name an activity (lib/studentAuth.ts). */
export const STUDENT_PLACE_PREFIXES = ['viewer-resume:', 'student-last-opened:'] as const;

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}
function write(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // A convenience: storage that will not take it just forgets.
    }
}

function storedStep(userId: string | null): number {
    const i = Number(read(textKey(userId)));
    return Number.isInteger(i) && i >= 0 && i < TEXT_SCALES.length ? i : 0;
}

/** The text-size step (0 = normal) and a setter that remembers it. Sets the
 *  scale on <html> while mounted and takes it off on the way out, so no
 *  teacher page inherits a student's size. */
export function useTextScale(userId: string | null): [step: number, setStep: (n: number) => void] {
    const [step, setStepState] = useState(() => storedStep(userId));
    useEffect(() => setStepState(storedStep(userId)), [userId]);
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--viewer-text-scale', String(TEXT_SCALES[step] ?? 1));
        return () => {
            root.style.removeProperty('--viewer-text-scale');
        };
    }, [step]);
    const setStep = useCallback((n: number) => {
        const next = Math.max(0, Math.min(TEXT_SCALES.length - 1, n));
        write(textKey(userId), String(next));
        setStepState(next);
    }, [userId]);
    return [step, setStep];
}

/** Scroll `el` to just under the sticky top bar (scrollIntoView would put it
 *  behind the bar). */
export function scrollBelowTopbar(el: Element): void {
    const bar = document.querySelector<HTMLElement>('.viewer-topbar')?.offsetHeight ?? 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - bar - 8 });
}

const lastOpenedKey = (userId: string) => `student-last-opened:${userId}`;

/** The activity this student last opened on this device, or null. */
export function lastOpenedActivity(userId: string): string | null {
    return read(lastOpenedKey(userId)) || null;
}

const hideDoneKey = (userId: string) => `student-home-hide-done:${userId}`;
export const readHideDone = (userId: string): boolean => read(hideDoneKey(userId)) === '1';
export const writeHideDone = (userId: string, on: boolean): void => write(hideDoneKey(userId), on ? '1' : '');

const resumeKey = (userId: string, activityId: string) => `viewer-resume:${userId}:${activityId}`;

/**
 * Remember the section the student last worked in (focus or input inside it)
 * and, once the worksheet is on screen, scroll back to it — once per open,
 * and not if they have already scrolled. The first section is never stored:
 * the page opens there anyway.
 */
export function useResumePlace(userId: string | null, activityId: string | undefined, ready: boolean): void {
    useEffect(() => {
        if (!userId || !activityId || !ready) return;
        write(lastOpenedKey(userId), activityId);
        const key = resumeKey(userId, activityId);
        const target = read(key);
        if (target && window.scrollY === 0) {
            const el = Array.from(document.querySelectorAll<HTMLElement>('[data-section-id]')).find(
                (s) => s.dataset.sectionId === target,
            );
            if (el) requestAnimationFrame(() => scrollBelowTopbar(el));
        }
        const onFocus = (e: FocusEvent) => {
            const section = (e.target as Element | null)?.closest?.<HTMLElement>('[data-section-id]');
            const id = section?.dataset.sectionId;
            if (!id) return;
            const first = document.querySelector<HTMLElement>('[data-section-id]');
            write(key, first === section ? '' : id);
        };
        document.addEventListener('focusin', onFocus);
        return () => document.removeEventListener('focusin', onFocus);
    }, [userId, activityId, ready]);
}
