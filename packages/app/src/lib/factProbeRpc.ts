// The number-facts check's RPC names (migration 0045). A module of its own, with
// no imports, so the e2e route mocks can import the production constants
// instead of retyping them (policy P2) without pulling in the Supabase client.
export const FACT_PROBE_RPC = {
    entry: 'fact_probe_entry',
    save: 'save_fact_attempts',
    open: 'open_fact_probe',
    close: 'close_fact_probe',
    results: 'fact_probe_results',
    overview: 'fact_probe_overview',
    yearEnd: 'set_class_year_end',
    // The daily practice (migration 0050).
    sprintEntry: 'fact_sprint_entry',
    sprintSave: 'save_sprint_attempts',
    sprintSwitch: 'set_fact_sprint',
    sprintOverview: 'fact_sprint_overview',
} as const;
