// The function names for today's picks (0082). Their own file, like
// mixedPracticeRpc.ts: edgeFunctions.ts is in the eager shell and only lazy
// routes call these, and e2e stubs can import this without the Supabase client.
// edgeFunctions.test.ts pins them to the migration.
export const CLASS_TODAY_RPC = 'class_today';
export const SET_CLASS_TODAY_RPC = 'set_class_today';
