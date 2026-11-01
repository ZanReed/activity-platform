// The unit tracker's RPC names (migration 0074). A module of its own, with no
// imports, so the e2e route mocks can import the production constants instead
// of retyping them (policy P2) without pulling in the Supabase client.
export const UNIT_TRACKER_RPC = {
    mine: 'my_unit_tracker',
    teacher: 'class_unit_tracker',
    setWording: 'set_tracker_wording',
} as const;
