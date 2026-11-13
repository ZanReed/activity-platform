// =============================================================================
// analyticsLabels.ts — census keys in a teacher's words (UI review C-6,
// docs/design/ui-review-group-c.md). A census key is a block's registry
// `analyticsKey`, plus `.interaction` for the graph family
// (packages/viewer/src/registry/registry.ts). The raw key stays in the table
// cell's title for anyone matching it against the database.
// =============================================================================

/** The bucket for a check item no census row explains — a check recorded
 * against a version whose census hasn't been written yet. Never silently
 * dropped: an invisible gap would read as "nothing to see here". */
export const UNATTRIBUTED = '_unattributed';

/** C-6: a census key in a teacher's words — "Graph · plot a point",
 *  "Multiple choice". The raw key stays in the cell's title for anyone
 *  matching it against the database. */
export const BLOCK_NAMES: Record<string, string> = {
    fill_in_blank: 'Fill in the blank',
    multiple_choice: 'Multiple choice',
    matching: 'Matching',
    correspondence: 'Correspondence',
    ordering: 'Ordering',
    short_answer: 'Short answer',
    essay: 'Essay',
    self_explanation: 'Self-explanation',
    math_block: 'Equation',
    number_line: 'Number line',
    interactive_graph: 'Graph',
    data_plot: 'Data plot',
    table: 'Table',
    faded_worked_example: 'Faded worked example',
    worked_example: 'Worked example',
    video: 'Video',
    paragraph: 'Text',
    heading: 'Heading',
    image: 'Image',
    callout: 'Callout',
    problem: 'Problem',
    bullet_list: 'Bulleted list',
    ordered_list: 'Numbered list',
    learning_objectives: 'Learning objectives',
    graph_figure: 'Graph figure',
    chart: 'Chart',
};
/** Census keys that are never questions — text, pictures, containers. Counted
 *  by the census (it counts every block) but not shown under "Question type"
 *  unless a check ever scored one. analyticsLabels.test.ts pins that every
 *  registry key has a name. */
export const NOT_QUESTIONS: ReadonlySet<string> = new Set([
    'paragraph',
    'heading',
    'image',
    'callout',
    'problem',
    'bullet_list',
    'ordered_list',
    'learning_objectives',
    'graph_figure',
    'chart',
    'worked_example',
]);
export const INTERACTION_NAMES: Record<string, string> = {
    plot_point: 'plot a point',
    plot_interval: 'graph an interval',
    plot_ray: 'draw a ray',
    plot_segment: 'draw a segment',
    plot_vector: 'draw a vector',
    plot_function: 'graph a function',
    graph_inequality: 'graph an inequality',
    shade_region: 'shade a region',
    transform_curve: 'transform a curve',
    build_histogram: 'build a histogram',
    build_boxplot: 'build a box plot',
    build_dotplot: 'build a dot plot',
    display: 'display only',
};
export function labelFor(key: string): string {
    if (key === UNATTRIBUTED) return 'Not yet attributed';
    if (key.startsWith('_')) return 'Other';
    const [block = '', interaction] = key.split('.');
    const name = BLOCK_NAMES[block] ?? block.replace(/_/g, ' ');
    if (!interaction) return name;
    return `${name} · ${INTERACTION_NAMES[interaction] ?? interaction.replace(/_/g, ' ')}`;
}

