// "About N minutes" for a list of facts (their item 24: the student is told
// the expected time up front; the probe has no time cap). About ten seconds an
// item, rounded up to a minute. Its own module so the teacher's page can state
// the time without importing the runner.
export function aboutMinutes(itemCount: number): string {
    const minutes = Math.max(1, Math.ceil((itemCount * 10) / 60));
    return `About ${minutes} minute${minutes === 1 ? '' : 's'}`;
}
