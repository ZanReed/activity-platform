// =============================================================================
// SaveFailedNotice — the editor's "not saved" line (G-8; review C7)
// -----------------------------------------------------------------------------
// A save that can be retried says so and offers Retry now. A save that can
// never succeed as it stands (a PermanentSaveError) says why, in plain words
// that name the place when it knows one, with the technical words only under
// "Details", the split LoadStatus makes (review C5): a teacher can act on
// "Section 2, block 4", not on "sections.1.rows.0.columns.0.blocks.3".
// =============================================================================

export default function SaveFailedNotice({
    permanentError,
    permanentDetail,
    failedText,
    retryText,
    onRetry,
}: {
    permanentError: string | null;
    permanentDetail: string | null;
    failedText: string;
    retryText: string;
    onRetry: () => void;
}) {
    if (!permanentError) {
        return (
            <span className="text-xs text-danger" role="alert">
                {failedText}{' '}
                <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
                    {retryText}
                </button>
            </span>
        );
    }
    return (
        <div className="max-w-md text-right text-xs text-danger" data-save-failed="permanent">
            <p role="alert">{permanentError}</p>
            {permanentDetail && (
                <details className="mt-1 text-muted">
                    <summary className="cursor-pointer">Details</summary>
                    <code className="mt-1 block break-words text-left">{permanentDetail}</code>
                </details>
            )}
        </div>
    );
}
