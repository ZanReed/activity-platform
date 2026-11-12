// =============================================================================
// vite.playtest.ts — the dev-server half of record/replay (Tier 1 playtest)
// -----------------------------------------------------------------------------
// `apply: 'serve'` and active only in `--mode playtest` / `--mode replay`, so a
// production build never sees it. Endpoints, all under /__playtest/:
//
//   POST record/start            begin a recording (drops any unsaved one)
//   POST record/entry            append one request/response (RecordedEntry)
//   POST record/person           remember a signed-in person's session
//   GET  record/status           { recording, entries, people }
//   POST record/save {name}      write playtest-scenarios/<name>.json
//   GET  scenarios               the saved scenario names
//   GET  scenarios/<name>        one scenario
//
// The in-progress recording lives in this process's memory: page reloads (the
// bar reloads on every person switch) keep it; restarting the server drops it.
// Scenario names are [a-z0-9-] only, so a name can never escape the folder.
// =============================================================================

import type { Plugin } from 'vite';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { SCENARIO_NAME_RE, type RecordedEntry, type Scenario, type ScenarioPerson } from './src/dev/playtestScenario';

export const SCENARIO_DIR = path.resolve(__dirname, 'playtest-scenarios');

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

function send(res: ServerResponse, status: number, body: unknown) {
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(body));
}

export function playtestScenarios(): Plugin {
    let active = false;
    let recording = false;
    let entries: RecordedEntry[] = [];
    const people = new Map<string, ScenarioPerson>();

    return {
        name: 'activity:playtest-scenarios',
        apply: 'serve',
        configResolved(config) {
            active = config.mode === 'playtest' || config.mode === 'replay';
        },
        configureServer(server) {
            if (!active) return;
            server.middlewares.use('/__playtest', (req, res, next) => {
                void (async () => {
                    const url = new URL(req.url ?? '/', 'http://x');
                    const route = `${req.method} ${url.pathname}`;
                    // Same-origin JSON only: a page on another site could
                    // otherwise POST here without a preflight and write a
                    // scenario file of its choosing.
                    if (req.method !== 'GET') {
                        const site = req.headers['sec-fetch-site'];
                        const origin = req.headers.origin;
                        const host = req.headers.host;
                        const sameOrigin = site
                            ? site === 'same-origin'
                            : !origin || (host !== undefined && new URL(origin).host === host);
                        if (!sameOrigin || !String(req.headers['content-type'] ?? '').startsWith('application/json')) {
                            return send(res, 403, { message: 'playtest endpoints accept same-origin JSON only' });
                        }
                    }
                    try {
                        if (route === 'POST /record/start') {
                            recording = true;
                            entries = [];
                            people.clear();
                            return send(res, 200, { recording });
                        }
                        if (route === 'POST /record/stop') {
                            recording = false;
                            entries = [];
                            people.clear();
                            return send(res, 200, { recording });
                        }
                        if (route === 'GET /record/status') {
                            return send(res, 200, { recording, entries: entries.length, people: [...people.keys()] });
                        }
                        if (route === 'POST /record/entry') {
                            if (recording) entries.push(JSON.parse(await readBody(req)) as RecordedEntry);
                            return send(res, 200, { entries: entries.length });
                        }
                        if (route === 'POST /record/person') {
                            const p = JSON.parse(await readBody(req)) as ScenarioPerson;
                            // Replay needs the access token's email claim and the
                            // user object, never a way to mint new tokens.
                            if (p.session) p.session = { ...p.session, refresh_token: null, provider_refresh_token: null };
                            if (recording && p.email) people.set(p.email, p);
                            return send(res, 200, { people: people.size });
                        }
                        if (route === 'POST /record/save') {
                            const { name } = JSON.parse(await readBody(req)) as { name?: string };
                            if (!name || !SCENARIO_NAME_RE.test(name)) {
                                return send(res, 400, { message: 'Name: lowercase letters, digits and dashes.' });
                            }
                            if (entries.length === 0) return send(res, 400, { message: 'Nothing recorded yet.' });
                            const scenario: Scenario = {
                                name,
                                recordedAt: new Date().toISOString(),
                                people: [...people.values()],
                                entries,
                            };
                            mkdirSync(SCENARIO_DIR, { recursive: true });
                            writeFileSync(path.join(SCENARIO_DIR, `${name}.json`), `${JSON.stringify(scenario)}\n`);
                            recording = false;
                            const saved = { name, entries: entries.length, people: people.size };
                            entries = [];
                            people.clear();
                            return send(res, 200, saved);
                        }
                        if (route === 'GET /scenarios') {
                            let names: string[] = [];
                            try {
                                names = readdirSync(SCENARIO_DIR)
                                    .filter((f) => f.endsWith('.json'))
                                    .map((f) => f.slice(0, -5))
                                    .sort();
                            } catch {
                                /* no folder yet */
                            }
                            return send(res, 200, names);
                        }
                        const one = url.pathname.match(/^\/scenarios\/([^/]+)$/);
                        if (req.method === 'GET' && one) {
                            const name = decodeURIComponent(one[1]!);
                            if (!SCENARIO_NAME_RE.test(name)) return send(res, 400, { message: 'bad name' });
                            try {
                                res.setHeader('content-type', 'application/json');
                                res.end(readFileSync(path.join(SCENARIO_DIR, `${name}.json`)));
                            } catch {
                                send(res, 404, { message: `No scenario "${name}".` });
                            }
                            return;
                        }
                        next();
                    } catch (err) {
                        send(res, 500, { message: err instanceof Error ? err.message : String(err) });
                    }
                })();
            });
        },
    };
}
