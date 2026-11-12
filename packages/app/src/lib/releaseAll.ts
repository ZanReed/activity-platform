// =============================================================================
// releaseAll.ts — "Release all graded" (UI review G-4)
// -----------------------------------------------------------------------------
// Its own module, not grading.ts: grading.ts is reached from the student
// shell, and this is teacher-only (shell-size review spend meter).
// =============================================================================

/** "Release all graded" (UI review G-4): one release per student, carrying on
 *  past a failure so one bad call doesn't stop the rest, and reporting who
 *  didn't go through by name. Releases already made stay made — there is no
 *  un-release (a student may have read it). */
export async function releaseEach<K>(
  students: readonly K[],
  release: (student: K) => Promise<unknown>,
): Promise<{ released: number; failed: K[] }> {
  let released = 0;
  const failed: K[] = [];
  for (const s of students) {
    try {
      await release(s);
      released += 1;
    } catch {
      failed.push(s);
    }
  }
  return { released, failed };
}

export const RELEASE_ALL_COPY = {
  title: (n: number) => `Release grades to ${n} student${n === 1 ? '' : 's'}?`,
  body: 'They’ll see their marks and your comments. You can’t take a release back.',
  confirm: 'Release grades',
  partial: (ok: number, total: number, names: string) =>
    `Released ${ok} of ${total}. These didn’t go through: ${names}.`,
  retry: 'Try again',
} as const;
