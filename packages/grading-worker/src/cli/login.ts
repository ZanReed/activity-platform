// worker:login — the one-time interactive teacher sign-in (W-1).
import { loadConfig } from '../config.ts';
import { login } from '../session.ts';

try {
  const config = loadConfig();
  const email = await login(config);
  console.log(`\nSigned in as ${email}.`);
  console.log(`Session written to ${config.sessionPath} (0600).`);
  console.log('Next: `pnpm worker:check`, then `pnpm worker:run --once`.');
} catch (err) {
  console.error(`\nworker:login failed: ${(err as Error).message}`);
  process.exit(1);
}
