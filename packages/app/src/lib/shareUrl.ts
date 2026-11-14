/** The canonical share URL for an activity: the viewer route on this origin.
 * This is what teachers hand to students — never a storage or backend URL.
 * ONE definition: the editor's publish panel and the library row menu both
 * copy this string. */
export function viewerShareUrl(activityId: string): string {
    return `${window.location.origin}/a/${activityId}`;
}
