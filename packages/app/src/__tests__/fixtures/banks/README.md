# Practice-bank cross-check fixtures (BE-12)

Copied BY COMMIT from the curriculum repo (ZanReed/curriculum), merge
`df65b40` (PR #69; first copied at `85ca61a`, PR #68), `tests/fixtures/tools/`.
`bankImport.test.ts` asserts each is accepted or refused for the SAME reason
check_bank gives. A divergence goes to the curriculum side as a letter, never
a local patch to these files. Re-copy (and re-stamp this line) only when they
change upstream.

- `rate.unit-rate.md` (their `banks/rate.unit-rate.md`): passes; t2 20/24, t3 11/12, t4 4/4 (uses `\*`).
- `bad-bank-unused.md` is a PROBLEM on their side and a WARNING here that fails `--strict`; every import runs `--strict`, so the outcome is the same.
- `bad-bank-*.md`: each fails for one reason. `bad-bank-retired` fails on THEIR
  side through their ledger (`bank-retired-fixture.txt`); on ours the parser
  accepts it and the store refuses a returning retired id (verify-0058).

Note: the older `bad-bank-*` files carry no `status:`, which this side requires
(PB-10), so they also fail for that; the tests assert the shared reason.
