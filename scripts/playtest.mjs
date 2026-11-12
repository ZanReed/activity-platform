#!/usr/bin/env node
// =============================================================================
// scripts/playtest.mjs — playtest the whole app against the LOCAL Supabase
// stack (Tier 2 of the no-sign-in playtest, 2026-11-12)
// -----------------------------------------------------------------------------
//   pnpm playtest              reset + seed the local stack, then serve the
//                              Edge Functions and the app (Ctrl-C stops both)
//   pnpm playtest --no-reset   keep what you did last time; serve only
//   pnpm playtest:seed         reset + seed, then exit
//
// What you get: a real database (every migration), real RLS, the real
// get-activity + check-activity functions, the real catalogue imported with
// every registry mirrored, published, shared to one class with six students
// in it. The app runs in `--mode playtest` (packages/app/.env.playtest points
// it at the local stack) and shows a "Playtest as" bar to switch between the
// teacher and the students — no Google sign-in.
//
// SAFETY, by construction:
//   * The Supabase URL is read from `supabase status` and REFUSED unless its
//     host is 127.0.0.1 or localhost. The live project can never be the
//     target, and this file never reads .env.supabase or .env.local.
//   * The importer child gets a scrubbed environment: every inherited
//     SUPABASE_* variable is dropped and the local pair set explicitly.
//   * Its manifests go to a temp dir (BATCH_IMPORT_OUTPUT_ROOT), so a playtest
//     never rewrites the repo's generated docs.
//   * Accounts come from packages/app/src/dev/playtestAccounts.json (the
//     RFC 2606 .example domain) — the same file the sign-in bar reads.
//
// Shares the local stack with the integration lane (`test:e2e:integration`),
// which resets it too: run one or the other, and re-seed after the lane.
// =============================================================================

import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const ACCOUNTS = JSON.parse(
    readFileSync(join(REPO_ROOT, 'packages/app/src/dev/playtestAccounts.json'), 'utf8'),
);

// ---- args -------------------------------------------------------------------

export function parseArgs(argv) {
    const out = {
        reset: true,
        seed: true,
        serve: true,
        replay: false,
        catalogue: process.env.PLAYTEST_CATALOGUE ?? join(homedir(), 'activity-catalogue-pilot'),
        curriculum: process.env.PLAYTEST_CURRICULUM ?? resolve(REPO_ROOT, '../curriculum-repo'),
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--no-reset') {
            out.reset = false;
            out.seed = false;
        } else if (a === '--seed-only') out.serve = false;
        else if (a === '--replay') {
            out.replay = true;
            out.reset = false;
            out.seed = false;
        }
        else if (a === '--catalogue') out.catalogue = resolve(argv[++i] ?? '');
        else if (a === '--curriculum') out.curriculum = resolve(argv[++i] ?? '');
        else throw new Error(`Unknown argument: ${a}`);
    }
    return out;
}

// ---- helpers ----------------------------------------------------------------

function fail(problem, fix) {
    console.error(`\n[playtest] ${problem}\n  FIX: ${fix}\n`);
    process.exit(1);
}

const log = (msg) => console.log(`[playtest] ${msg}`);

function supabaseCli(args, opts = {}) {
    try {
        return execFileSync('supabase', args, {
            cwd: REPO_ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            ...opts,
        });
    } catch (err) {
        if (err.code === 'ENOENT') fail('the `supabase` CLI is not on PATH.', 'brew install supabase/tap/supabase');
        const detail = [err.stdout, err.stderr].filter((s) => s && String(s).trim()).join('\n');
        throw new Error(`supabase ${args.join(' ')} failed:\n${detail || err.message}`);
    }
}

/** The ONLY hosts this script will ever talk to. */
export function isLocalUrl(url) {
    try {
        const { hostname } = new URL(url);
        return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]';
    } catch {
        return false;
    }
}

function readStack() {
    let status;
    try {
        status = supabaseCli(['status', '-o', 'env']);
    } catch {
        fail(
            'the local Supabase stack is not running.',
            'start Docker Desktop, then run `supabase start` in the repo root',
        );
    }
    const env = Object.fromEntries(
        status
            .split('\n')
            .map((l) => l.match(/^([A-Z_]+)="?([^"]*)"?$/))
            .filter(Boolean)
            .map((m) => [m[1], m[2]]),
    );
    const url = env.API_URL ?? '';
    if (!isLocalUrl(url)) {
        fail(`refusing a non-local Supabase URL (${url || '<none>'}).`, 'this script only ever targets `supabase start`');
    }
    if (!env.ANON_KEY || !env.SERVICE_ROLE_KEY) {
        fail('`supabase status` reported no ANON_KEY / SERVICE_ROLE_KEY.', 'run `supabase start`, then re-check');
    }
    const appEnv = readFileSync(join(REPO_ROOT, 'packages/app/.env.playtest'), 'utf8');
    if (!appEnv.includes(`VITE_SUPABASE_URL=${url}`) || !appEnv.includes(`VITE_SUPABASE_ANON_KEY=${env.ANON_KEY}`)) {
        fail(
            'packages/app/.env.playtest does not match `supabase status` (URL or anon key) — the app would 401.',
            `set VITE_SUPABASE_URL=${url} and VITE_SUPABASE_ANON_KEY to the ANON_KEY from \`supabase status -o env\``,
        );
    }
    return { url, anon: env.ANON_KEY, service: env.SERVICE_ROLE_KEY };
}

async function api(stack, path, { method = 'POST', token, body, headers = {} } = {}) {
    const res = await fetch(`${stack.url}${path}`, {
        method,
        headers: {
            apikey: stack.anon,
            Authorization: `Bearer ${token ?? stack.anon}`,
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
    return data;
}

async function waitForAuth(stack, timeoutMs = 90_000) {
    const started = Date.now();
    const deadline = started + timeoutMs;
    let kicked = false;
    while (Date.now() < deadline) {
        // Measured 2026-11-12 (CLI 2.109): after `db reset` restarts the auth
        // container, the API gateway (kong) can keep proxying to its OLD
        // address and answer 502 forever while auth itself reports healthy.
        // Restarting the gateway container once fixes it. Local Docker only.
        if (!kicked && Date.now() - started > 15_000) {
            kicked = true;
            const projectId = readFileSync(join(REPO_ROOT, 'supabase/config.toml'), 'utf8').match(/^project_id\s*=\s*"([^"]+)"/m)?.[1];
            if (projectId) {
                log('auth still unreachable after the reset — restarting the local API gateway once …');
                try {
                    execFileSync('docker', ['restart', `supabase_kong_${projectId}`], { stdio: 'ignore', timeout: 60_000 });
                } catch {
                    /* fall through to the timeout's named fix */
                }
            }
        }
        try {
            const res = await fetch(`${stack.url}/auth/v1/health`, { headers: { apikey: stack.anon } });
            if (res.ok) return;
        } catch {
            /* not up yet */
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
    fail('the local auth service did not come back after the reset.', 'run `supabase status`; if a container is unhealthy, `supabase stop && supabase start`');
}

const rpc = (stack, token, name, args = {}) => api(stack, `/rest/v1/rpc/${name}`, { token, body: args });

async function signUpAndIn(stack, person) {
    const creds = { email: person.email, password: ACCOUNTS.password };
    await api(stack, '/auth/v1/signup', { body: { ...creds, data: { full_name: person.name } } });
    const session = await api(stack, '/auth/v1/token?grant_type=password', { body: creds });
    return { ...person, id: session.user.id, token: session.access_token };
}

// ---- seed -------------------------------------------------------------------

function seedAdmission() {
    const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
    const sql = [
        'do $seed$ begin',
        `  insert into public.student_domain (domain) values (${q(ACCOUNTS.domain)}) on conflict (domain) do nothing;`,
        `  insert into public.allowlist (email) values (${q(ACCOUNTS.teacher.email)}) on conflict (email) do nothing;`,
        'end $seed$;',
    ].join('\n');
    supabaseCli(['db', 'query', '--local', sql], { timeout: 60_000 });
}

function registryFlags(curriculum) {
    const pairs = [
        ['--misconception-registry', 'misconception-registry.txt'],
        ['--skills-registry', 'skill-registry.txt'],
        ['--chain-registry', 'chain-registry.txt'],
        ['--glossary', 'glossary.md'],
        ['--fact-registry', 'fact-scope-registry.json'],
        ['--hook-registry', 'hook-registry.json'],
        ['--practice-registry', 'practice-registry.json'],
    ];
    const flags = [];
    const missing = [];
    for (const [flag, file] of pairs) {
        const p = join(curriculum, file);
        if (existsSync(p)) flags.push(flag, p);
        else missing.push(file);
    }
    return { flags, missing };
}

function importCatalogue(stack, args) {
    if (!existsSync(args.catalogue)) {
        log(`no catalogue at ${args.catalogue} — skipping the import (pass --catalogue <dir>).`);
        return false;
    }
    const { flags, missing } = registryFlags(args.curriculum);
    if (missing.length) log(`registries not found in ${args.curriculum}: ${missing.join(', ')} (imported without them)`);
    // Scrubbed env: nothing inherited can point the importer anywhere but here.
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('SUPABASE')));
    env.SUPABASE_URL = stack.url;
    env.SUPABASE_SERVICE_ROLE_KEY = stack.service;
    env.BATCH_IMPORT_OUTPUT_ROOT = mkdtempSync(join(tmpdir(), 'playtest-manifests-'));
    log(`importing ${args.catalogue} …`);
    const logFile = join(env.BATCH_IMPORT_OUTPUT_ROOT, 'import.log');
    try {
        // 2>&1 into one stream: the importer prints its mirror FAILURES with
        // console.warn, and a stdout-only capture once hid exactly that.
        const run = spawnSync(
            process.execPath,
            [join(REPO_ROOT, 'scripts/batch-import.mjs'), args.catalogue, '--owner', ACCOUNTS.teacher.email, ...flags],
            { cwd: REPO_ROOT, env, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', timeout: 600_000 },
        );
        const out = `${run.stdout ?? ''}\n${run.stderr ?? ''}`;
        if (run.status !== 0) throw Object.assign(new Error(`importer exited ${run.status}`), { stdout: out });
        writeFileSync(logFile, out);
        // The importer's mirrors fail SOFT (a printed ⚠, exit 0), so surface
        // every warning line and the mirror summaries rather than trusting the
        // exit code; the full report is in the log.
        const lines = out.split('\n');
        for (const l of lines) {
            if (/⚠|FAILED|REFUSED|^registry\s*:|^glossary\s*:|^hooks?\s*:|^skills?\s*:|^facts?\s*:|^practice\s*:/i.test(l.trim())) {
                log(`  import: ${l.trim()}`);
            }
        }
        log(`  full import report: ${logFile}`);
    } catch (err) {
        // The importer exits non-zero on catalogue WARNINGS it treats as
        // failures only under --strict; anything else is a real problem.
        const out = [err.stdout, err.stderr].filter(Boolean).join('\n');
        console.error(out.split('\n').slice(-40).join('\n'));
        fail('the catalogue import failed (last lines above).', 'run the same import with --dry-run against the local stack and read its report');
    }
    return true;
}

async function seed(stack, args) {
    if (args.reset) {
        log('resetting the local database (every migration, from scratch) …');
        supabaseCli(['db', 'reset', '--local'], { timeout: 300_000 });
    }
    // A reset restarts the containers: auth answers 502 for a few seconds
    // afterwards, so wait for its health endpoint rather than racing it.
    await waitForAuth(stack);
    seedAdmission();

    const teacher = await signUpAndIn(stack, ACCOUNTS.teacher);
    const students = [];
    for (const s of ACCOUNTS.students) students.push(await signUpAndIn(stack, s));
    log(`accounts: ${teacher.email} + ${students.length} students`);

    importCatalogue(stack, args);

    // Publish everything the teacher owns, oldest first, as the teacher.
    const activities = await api(
        stack,
        `/rest/v1/activities?select=id,title,source_path&owner_id=eq.${teacher.id}&deleted_at=is.null&order=source_path.asc.nullslast`,
        { method: 'GET', token: teacher.token },
    );
    for (const a of activities) await rpc(stack, teacher.token, 'publish_activity', { p_activity_id: a.id });
    log(`published ${activities.length} activities`);

    const cls = await rpc(stack, teacher.token, 'create_class', {
        p_name: ACCOUNTS.className,
        p_expected_domain: ACCOUNTS.domain,
        p_assertion_text_version: 'local-playtest',
        p_includes_under_13: false,
    });
    for (const s of students) await rpc(stack, s.token, 'join_class', { p_join_code: cls.join_code });
    for (const a of activities) {
        await rpc(stack, teacher.token, 'share_activity_to_class', { p_class_id: cls.id, p_activity_id: a.id });
    }
    log(`class "${cls.name}" (code ${cls.join_code}): ${students.length} students, ${activities.length} activities shared`);

    // Optional switches, so the student-side practice screens have something
    // to show on first open. Each is the teacher's own RPC; a refusal (a gate
    // the catalogue cannot meet yet, say) is printed and skipped, never fatal.
    // The daily facts sprint is deliberately NOT switched on: the database
    // refuses it until a number-facts check has CLOSED (no_closed_check), so
    // the seed opens the check and leaves the rest of that journey to you.
    const yearEnd = new Date(Date.now() + 200 * 86_400_000).toISOString().slice(0, 10);
    const extras = [
        [`school year ends ${yearEnd}`, 'set_class_year_end', { p_class_id: cls.id, p_ends_on: yearEnd }],
        ['mixed practice on', 'set_mixed_practice', { p_class_id: cls.id, p_on: true }],
        ['number-facts check open (Year 7)', 'open_fact_probe', { p_class_id: cls.id, p_year_level: 7 }],
        ...(activities[0]
            ? [[`Today: ${activities[0].title}`, 'set_class_today', { p_class_id: cls.id, p_activity_id: activities[0].id, p_on: true }]]
            : []),
    ];
    for (const [label, name, body] of extras) {
        try {
            await rpc(stack, teacher.token, name, body);
            log(`  ${label}`);
        } catch (err) {
            log(`  skipped "${label}": ${err.message.split('\n')[0].slice(0, 200)}`);
        }
    }
    return { cls, activities };
}

// ---- serve ------------------------------------------------------------------

function serve(stack) {
    // The app's Supabase pair is set EXPLICITLY from `supabase status`, never
    // left to file priority: a shell-exported VITE_SUPABASE_URL or a
    // .env.playtest.local would otherwise outrank .env.playtest and run the
    // app against whatever they name under a "playtest" command.
    const viteEnv = {
        ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('VITE_SUPABASE'))),
        VITE_SUPABASE_URL: stack.url,
        VITE_SUPABASE_ANON_KEY: stack.anon,
    };
    const children = [
        ['functions', spawn('supabase', ['functions', 'serve'], { cwd: REPO_ROOT, stdio: 'inherit' })],
        [
            'app',
            spawn('pnpm', ['--filter', '@activity/app', 'exec', 'vite', '--mode', 'playtest'], {
                cwd: REPO_ROOT,
                stdio: 'inherit',
                env: viteEnv,
            }),
        ],
    ];
    let stopping = false;
    const stop = (why) => {
        if (!stopping && why) {
            log(why);
            process.exitCode = 1;
        }
        stopping = true;
        for (const [, c] of children) if (c.exitCode === null && !c.killed) c.kill('SIGINT');
    };
    process.on('SIGINT', () => stop());
    process.on('SIGTERM', () => stop());
    for (const [name, c] of children) {
        c.on('error', (err) => stop(`the ${name} process could not start: ${err.message}`));
        c.on('exit', (code) => stop(stopping ? null : `the ${name} process exited (code ${code}) — stopping the other one.`));
    }
    log('serving — open the app URL above and use the "Playtest as" bar. Ctrl-C stops everything.');
}

/** Tier 1: no stack, no functions — the app against a dead address, answered
 *  from a saved scenario (packages/app/src/dev/playtestTraffic.ts). The pair
 *  is set explicitly, like serve(), so no shell variable can redirect it. */
export const REPLAY_SUPABASE_URL = 'http://127.0.0.1:54399';

function serveReplay() {
    const env = {
        ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('VITE_SUPABASE'))),
        VITE_SUPABASE_URL: REPLAY_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: 'replay-no-backend',
    };
    const child = spawn('pnpm', ['--filter', '@activity/app', 'exec', 'vite', '--mode', 'replay'], {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        env,
    });
    const stop = () => {
        if (child.exitCode === null && !child.killed) child.kill('SIGINT');
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    child.on('error', (err) => {
        log(`the app could not start: ${err.message}`);
        process.exitCode = 1;
    });
    log('replaying — no backend. Pick a scenario on the bar; record new ones with `pnpm playtest`.');
}

// ---- main -------------------------------------------------------------------

async function main() {
    let args;
    try {
        args = parseArgs(process.argv.slice(2));
    } catch (err) {
        fail(err.message, 'usage: pnpm playtest [--no-reset] [--seed-only] [--replay] [--catalogue <dir>] [--curriculum <dir>]');
    }
    if (args.replay) return serveReplay();
    const stack = readStack();
    if (args.seed) await seed(stack, args);
    if (args.serve) serve(stack);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((err) => fail(err.message, 'read the error above; `supabase status` shows the stack'));
}
