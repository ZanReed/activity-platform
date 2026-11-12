import { Suspense, lazy } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// ============================================================================
// VideoView — the video card's NodeView, as a LAZY boundary (the ChartView
// pattern): the form, the placement reasons and the serializer they call stay
// out of the editor chunk until a document actually has a clip.
// ============================================================================

const VideoViewBody = lazy(() => import('./VideoViewBody'));

export default function VideoView(props: NodeViewProps) {
    return (
        <Suspense
            fallback={
                <NodeViewWrapper className="block-video" data-block-type="video">
                    <p contentEditable={false} role="status">
                        Loading video…
                    </p>
                </NodeViewWrapper>
            }
        >
            <VideoViewBody {...props} />
        </Suspense>
    );
}
