// =============================================================================
// PublishStatus.tsx — the one published-status line under the editor header
// -----------------------------------------------------------------------------
// Renders whenever the activity is live: a "Live" dot + Open + Copy link,
// upgrading to "Published v{N}" for the session that just published (version
// is only known then). Since S9 Drop 1 the "published link" IS the viewer
// route — `${origin}/a/${activityId}` — so the line no longer depends on any
// published-URL env and always renders for a published activity. The viewer
// URL is stable across republishes, so Open/Copy work whether or not this
// session did the publish.
//
// Extracted from ActivityEditor (where it replaced the old standalone
// PublishedLink AND PublishControl's green success pill — two copy-link
// affordances for the same URL).
// =============================================================================

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

/** The canonical share URL for an activity: the viewer route on this origin.
 * This is what teachers hand to students — never a storage or backend URL. */
export function viewerShareUrl(activityId: string): string {
    return `${window.location.origin}/a/${activityId}`;
}

export default function PublishStatus({
    activityId,
    version,
}: {
    activityId: string;
    version: number | null;
}) {
    const url = viewerShareUrl(activityId);
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard write can fail in unsupported contexts; non-fatal */
        }
    };
    return (
        <span className="flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted">
        <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-success-accent"
        />
        {version != null ? `Published v${version}` : 'Live'}
        </span>
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
        >
        Open
        <ExternalLink size={12} aria-hidden="true" />
        </a>
        <button
        type="button"
        onClick={copy}
        className="font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
        >
        {copied ? 'Copied!' : 'Copy link'}
        </button>
        </span>
    );
}
