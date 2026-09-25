# @activity/grading-worker

The AI-grading pilot's pull worker (docs/design/ai-grading-assist.md, D1):
claims ungraded rubric responses from the platform as the signed-in TEACHER,
drafts rubric scores with a LOCAL model, and submits them as suggestions for
the grading queue to pre-fill. A suggestion is never a grade — the teacher's
confirm in the app is the only path into `check_grades`.

Every operator procedure below is one copy-paste block (W-5). Target: first
suggestion in **under 15 minutes** from a checked-out repo + a running
inference server (model download excluded).

## 0. Configure

```bash
cd packages/grading-worker && cp .env.example .env && open .env
```

Fill `SUPABASE_URL` + `SUPABASE_ANON_KEY` (the app's own values; never a
service key — D3).

## 1. Start vLLM (the pilot's named server, W-6)

```bash
vllm serve Qwen/Qwen3-32B-AWQ --served-model-name qwen3-32b --port 8000
```

Any OpenAI-compatible server works ONLY if `worker:check` proves it honors
`response_format: json_schema`. Ollama diverges on exactly that feature — it
must pass the preflight before you trust it.

## 2. Sign in (once)

```bash
pnpm worker:login
```

Opens a Google sign-in URL; sign in as the teacher. Writes a 0600 token file
(`~/.config/activity-grading-worker/session.json`). When a later command says
`session expired — re-run worker:login`, do exactly that.

## 3. Preflight

```bash
pnpm worker:check
```

Prints the config, the golden-log status for the current tuple, and proves
the inference server honors JSON-schema decoding.

## 4. Flip the provider (once, until a settings surface ships)

```bash
psql "$GRADING_DATABASE_URL" -c "insert into grading_settings (teacher_id, provider) values ('<teacher-uuid>', 'local_worker') on conflict (teacher_id) do update set provider = excluded.provider;"
```

Pausing later = stop the worker (W-9), or set provider back to `off`.

## 5. Hello world (no student role-play needed)

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f ../../scripts/seed-grading-check.sql
```

Seeds one pending rubric check on the local stack. Then:

```bash
pnpm worker:run --dry-run --once   # shows the exact prompt, submits nothing
pnpm worker:run --once             # one claim batch, real submits
```

The first real run will REFUSE until the tuple has a golden run (next
section) — that refusal is the W-7 gate working. For a quick local
experiment: `pnpm worker:run --once --allow-unvalidated` (loud, stamped).

## 6. E2b golden run (per tuple: prompt_rev × schema_rev × model)

The manual model-in-the-loop half of the eval pair (E2a is the CI snapshot
suite in `tests/`). Procedure:

1. `pnpm worker:run --dry-run --once` against the seeded fixtures and read
   the prompt once, whole.
2. Run the adversarial + happy fixtures (`tests/fixtures.ts` →
   `ADVERSARIAL_RESPONSES`, each with its expected outcome) through the live
   model: seed each as the check's response text, `worker:run --once
   --allow-unvalidated`, and compare the stored draft against the fixture's
   `expectedE2b`.
3. Record per-criterion results in your study notes, then append the tuple
   to `golden-log.json`:

```json
{ "promptRev": 1, "schemaRev": 1, "modelId": "qwen3-32b", "ranAt": "2026-09-25", "fixtures": 8, "notes": "adversarial set held; full-marks pleading graded 1/5" }
```

Commit the log entry — the worker now runs that tuple without the override.
Any model swap or rev bump repeats this procedure (that is the point).

## 7. The D7 study

```bash
psql "$GRADING_DATABASE_URL" -Atc "$(cat ../../scripts/grading-study-checks.sql)" > /tmp/study-checks.txt
pnpm study:run --checks /tmp/study-checks.txt
pnpm study:report
```

Study claims run with anchors OFF server-side, write rows marked
`source='study'` (invisible to the queue UI and edit-rate telemetry), and
every supplied id is ownership-checked — non-owned ids are dropped and
counted.

## 8. The standing quality signal

```bash
pnpm telemetry:edit-rates
```

Per (model, prompt_rev, schema_rev): confirmed-unchanged / edited / rejected
rates, chip strikes per misconception tag, reject reasons. Both report
commands run the committed SQL in `scripts/grading-*.sql` through psql when
`GRADING_DATABASE_URL` is set, and print it for manual use when not.

## Error taxonomy (W-4 — what each failure means)

| Symptom | Cause | Fix |
|---|---|---|
| `inference server unreachable` ×2 → run aborts | vLLM not running / wrong `INFERENCE_URL` | start the server (§1), `pnpm worker:check` |
| `model output failed to parse … raw captured at var/failed-outputs/…` | server ignored/mangled the schema | read the capture; if Ollama, see W-6; counted per-rev |
| `output failed local validation` / `server rejected` | draft referenced a foreign criterion/mis id or broke a range | counted per-rev; a rising rate is a prompt/schema quality signal |
| `lease_expired … skipped` | another worker took the row, or this one stalled past the lease | nothing — the row is re-claimable |
| `session expired — re-run worker:login` | refresh token lapsed | `pnpm worker:login` |
| `provider_off` | `grading_settings` missing or `off` | §4 flip |
| `quota_paused` | platform_api budget gate (never fires for `local_worker`) | wait for `resumes_at`, or raise the quota |
