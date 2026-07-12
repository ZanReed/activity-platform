import { useEffect, useMemo, useRef, useState } from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import {
    mountNumberLineAuthor,
    type NumberLineAuthorHandle,
    type StudentInterval,
} from '@activity/graph-kit';
import InlineRichTextEditor from '../components/InlineRichTextEditor';
import type { InlineNodes } from '../../lib/serialize';
import { problemNumberAt } from '../problemNumbering';
import {
    defaultNumberLinePointInteraction,
    defaultNumberLineIntervalInteraction,
    type NumberLineConfigAttr,
    type NumberLineInteractionAttr,
    type NumberLineIntervalAttr,
} from '../extensions/NumberLine';

// ============================================================================
// NumberLineView — NodeView for the graded number_line block (1-D). The lean
// sibling of InteractiveGraphView: "what the teacher sees is what the student
// gets" — the author board is the SAME kit board students use (mountNumber-
// LineAuthor). plot_point: drag the handle(s) → correctPoints. plot_interval:
// drag the two ends + the open/closed pills → correctInterval. Numeric fields
// give precise entry; a drag updates them live (and vice versa, via an epoch
// bump that remounts the board only on a typed edit, never mid-drag).
// ============================================================================

type InteractionType = NumberLineInteractionAttr['type'];

const num = (v: string, d: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};

// Resize a correctPoints array to `count`, spreading new points across the line.
function resizePoints(points: number[], count: number, cfg: NumberLineConfigAttr): number[] {
    if (count <= points.length) return points.slice(0, count);
    const out = points.slice();
    while (out.length < count) {
        // Seed a new point at a tick not already used, else the midpoint.
        const mid = Math.round((cfg.min + cfg.max) / 2);
        out.push(out.includes(mid) ? mid + out.length : mid);
    }
    return out;
}

// The author board — a thin host that mounts mountNumberLineAuthor and reports
// drags back up. Remounts only on config / type / point-count / epoch (a typed
// edit), never on a drag (which would yank the board from the pointer).
function NumberLineAuthorBoard({
    config,
    interaction,
    epoch,
    onPointsChange,
    onIntervalChange,
}: {
    config: NumberLineConfigAttr;
    interaction: NumberLineInteractionAttr;
    epoch: number;
    onPointsChange: (points: number[]) => void;
    onIntervalChange: (interval: StudentInterval) => void;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const pointsCb = useRef(onPointsChange);
    pointsCb.current = onPointsChange;
    const intervalCb = useRef(onIntervalChange);
    intervalCb.current = onIntervalChange;

    const count =
        interaction.type === 'plot_point' ? interaction.correctPoints.length : 2;

    // Snapshot the current key values so the mount reads them without becoming a
    // remount trigger on every drag.
    const startRef = useRef(interaction);
    startRef.current = interaction;

    const key = useMemo(
        () => JSON.stringify([config, interaction.type, count, epoch]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [config.min, config.max, config.tickStep, config.minorTicksPerStep, config.snapToTick, interaction.type, count, epoch],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0;';
        host.appendChild(el);
        let handle: NumberLineAuthorHandle | null = null;
        let disposed = false;
        const cur = startRef.current;
        void mountNumberLineAuthor(
            el,
            {
                interactionType: cur.type,
                config,
                correctPoints:
                    cur.type === 'plot_point' ? cur.correctPoints : undefined,
                correctInterval:
                    cur.type === 'plot_interval' ? cur.correctInterval : undefined,
            },
            {
                onChange: (pts) => pointsCb.current(pts),
                onIntervalChange: (iv) => intervalCb.current(iv),
            },
        ).then((h) => {
            if (disposed) {
                h.destroy();
                return;
            }
            handle = h;
        });
        return () => {
            disposed = true;
            handle?.destroy();
            host.removeChild(el);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <div
            ref={hostRef}
            contentEditable={false}
            style={{ position: 'relative', height: '6rem', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff' }}
        />
    );
}

const labelStyle = { fontSize: '0.8rem', color: '#475569' } as const;

export default function NumberLineView({
    node,
    editor,
    getPos,
    updateAttributes,
    selected,
}: NodeViewProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    // Bumped only on a typed edit (numeric field / count / type switch) to
    // remount the board so the handles jump to the typed answer; a drag never
    // bumps it.
    const [epoch, setEpoch] = useState(0);
    const bump = (): void => setEpoch((e) => e + 1);

    const config = node.attrs.config as NumberLineConfigAttr;
    const interaction = node.attrs.interaction as NumberLineInteractionAttr;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isEditable = editor.isEditable;

    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );

    const setConfig = (patch: Partial<NumberLineConfigAttr>): void => {
        updateAttributes({ config: { ...config, ...patch } });
        bump();
    };

    // A drag on the board reports the new key — update WITHOUT bumping epoch.
    const onPointsChange = (points: number[]): void => {
        if (interaction.type !== 'plot_point') return;
        updateAttributes({ interaction: { ...interaction, correctPoints: points } });
    };
    const onIntervalChange = (iv: StudentInterval): void => {
        if (interaction.type !== 'plot_interval') return;
        // Guard the schema invariant: at least one bound present. An all-unbounded
        // drag result is ignored (the board can't actually produce it via pills
        // without both ends unbounded, which authors won't do).
        if (iv.min === undefined && iv.max === undefined) return;
        updateAttributes({ interaction: { ...interaction, correctInterval: iv } });
    };

    const switchType = (type: InteractionType): void => {
        if (type === interaction.type) return;
        updateAttributes({
            interaction:
                type === 'plot_interval'
                    ? defaultNumberLineIntervalInteraction()
                    : defaultNumberLinePointInteraction(),
        });
        bump();
    };

    const setPointCount = (n: number): void => {
        if (interaction.type !== 'plot_point') return;
        const count = Math.max(1, Math.min(6, n));
        updateAttributes({
            interaction: {
                ...interaction,
                correctPoints: resizePoints(interaction.correctPoints, count, config),
            },
        });
        bump();
    };
    const setPointValue = (i: number, v: number): void => {
        if (interaction.type !== 'plot_point') return;
        const next = interaction.correctPoints.slice();
        next[i] = v;
        updateAttributes({ interaction: { ...interaction, correctPoints: next } });
        bump();
    };

    // plot_interval numeric editing. Each side may be bounded (value + style) or
    // unbounded (a ray). At least one side must stay bounded.
    const iv: NumberLineIntervalAttr =
        interaction.type === 'plot_interval' ? interaction.correctInterval : {};
    const setInterval = (next: NumberLineIntervalAttr): void => {
        if (interaction.type !== 'plot_interval') return;
        if (next.min === undefined && next.max === undefined) return; // keep 1+ bound
        updateAttributes({ interaction: { ...interaction, correctInterval: next } });
        bump();
    };

    return (
        <NodeViewWrapper
            className={`number-line-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {problemNumber}. Number line
                    </strong>
                    <label style={labelStyle}>
                        {' '}Type:{' '}
                        <select
                            value={interaction.type}
                            disabled={!isEditable}
                            onChange={(e) => switchType(e.target.value as InteractionType)}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <option value="plot_point">Plot a point</option>
                            <option value="plot_interval">Graph an interval</option>
                        </select>
                    </label>
                </div>

                <NumberLineAuthorBoard
                    config={config}
                    interaction={interaction}
                    epoch={epoch}
                    onPointsChange={onPointsChange}
                    onIntervalChange={onIntervalChange}
                />

                <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {interaction.type === 'plot_point'
                        ? `Drag the ${interaction.correctPoints.length > 1 ? 'points' : 'point'} — or type the ${interaction.correctPoints.length > 1 ? 'values' : 'value'} below.`
                        : 'Drag the two ends and use the pills to set open/closed or unbounded — exactly what students do. Or type the bounds below.'}
                </p>

                {interaction.type === 'plot_point' && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={labelStyle}>
                            Points students plot:{' '}
                            <input
                                type="number"
                                min={1}
                                max={6}
                                value={interaction.correctPoints.length}
                                disabled={!isEditable}
                                style={{ width: '3rem' }}
                                onChange={(e) => setPointCount(Math.trunc(num(e.target.value, 1)))}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </label>
                        {interaction.correctPoints.map((p, i) => (
                            <label key={i} style={labelStyle}>
                                {interaction.correctPoints.length > 1 ? `#${i + 1}: ` : 'Value: '}
                                <input
                                    type="number"
                                    value={p}
                                    disabled={!isEditable}
                                    step="any"
                                    style={{ width: '4rem' }}
                                    onChange={(e) => setPointValue(i, num(e.target.value, p))}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </label>
                        ))}
                    </div>
                )}

                {interaction.type === 'plot_interval' && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                        {(['min', 'max'] as const).map((side) => {
                            const styleKey = side === 'min' ? 'minStyle' : 'maxStyle';
                            const bounded = iv[side] !== undefined;
                            const otherBounded = iv[side === 'min' ? 'max' : 'min'] !== undefined;
                            return (
                                <span key={side} style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center', ...labelStyle }}>
                                    {side === 'min' ? 'Left' : 'Right'}:
                                    <label style={{ display: 'inline-flex', gap: '0.2rem', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={!bounded}
                                            // Can't make BOTH ends unbounded.
                                            disabled={!isEditable || (!bounded && !otherBounded)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const next = { ...iv };
                                                    delete next[side];
                                                    delete next[styleKey];
                                                    setInterval(next);
                                                } else {
                                                    setInterval({
                                                        ...iv,
                                                        [side]: side === 'min' ? config.min : config.max,
                                                        [styleKey]: 'closed',
                                                    });
                                                }
                                            }}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        unbounded
                                    </label>
                                    {bounded && (
                                        <>
                                            <input
                                                type="number"
                                                value={iv[side]}
                                                disabled={!isEditable}
                                                step="any"
                                                style={{ width: '4rem' }}
                                                onChange={(e) => setInterval({ ...iv, [side]: num(e.target.value, iv[side]!) })}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                            <select
                                                value={iv[styleKey] ?? 'closed'}
                                                disabled={!isEditable}
                                                onChange={(e) => setInterval({ ...iv, [styleKey]: e.target.value as 'open' | 'closed' })}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            >
                                                <option value="closed">● closed</option>
                                                <option value="open">○ open</option>
                                            </select>
                                        </>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
                <span
                    contentEditable={false}
                    style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#94a3b8' }}
                >
                    Question prompt
                </span>
                <NodeViewContent className="number-line-block__prompt" />
            </div>

            {(isEditable || solution.length > 0 || hasConfidenceRating) && (
                <div contentEditable={false} style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                    <button
                        type="button"
                        onClick={() => setSettingsOpen((o) => !o)}
                        style={{ fontSize: '0.8rem', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <span aria-hidden="true">⚙</span> Advanced settings
                    </button>
                    {settingsOpen && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Min:
                                    <input
                                        type="number"
                                        value={config.min}
                                        disabled={!isEditable}
                                        step="any"
                                        style={{ width: '4rem' }}
                                        onChange={(e) => setConfig({ min: num(e.target.value, config.min) })}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Max:
                                    <input
                                        type="number"
                                        value={config.max}
                                        disabled={!isEditable}
                                        step="any"
                                        style={{ width: '4rem' }}
                                        onChange={(e) => setConfig({ max: num(e.target.value, config.max) })}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Tick step:
                                    <input
                                        type="number"
                                        value={config.tickStep}
                                        min={0}
                                        disabled={!isEditable}
                                        step="any"
                                        style={{ width: '4rem' }}
                                        onChange={(e) => setConfig({ tickStep: Math.max(0.0001, num(e.target.value, config.tickStep)) })}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    Tolerance:
                                    <input
                                        type="number"
                                        value={interaction.tolerance}
                                        min={0}
                                        disabled={!isEditable}
                                        step="any"
                                        style={{ width: '4rem' }}
                                        onChange={(e) => updateAttributes({ interaction: { ...interaction, tolerance: Math.max(0, num(e.target.value, interaction.tolerance)) } })}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </label>
                                <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.snapToTick}
                                        disabled={!isEditable}
                                        onChange={(e) => setConfig({ snapToTick: e.target.checked })}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    Snap to tick
                                </label>
                            </div>

                            <div>
                                <span style={{ display: 'block', marginBottom: '0.2rem' }}>Worked solution</span>
                                <InlineRichTextEditor
                                    value={solution}
                                    onChange={(nodes) => updateAttributes({ solution: nodes.length > 0 ? nodes : null })}
                                    ariaLabel="Worked solution"
                                />
                            </div>

                            <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={hasConfidenceRating}
                                    disabled={!isEditable}
                                    onChange={(e) => updateAttributes({ hasConfidenceRating: e.target.checked })}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                Ask for a confidence rating
                            </label>
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
