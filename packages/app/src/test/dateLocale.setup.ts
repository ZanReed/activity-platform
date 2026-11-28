// Every unit test formats dates as en-NZ (review C10). lib/dates.ts uses the
// READER's browser locale, which in a test is the machine's: en-US on this
// Mac, whatever the CI image says. Pinning one makes the expected strings
// mean the same everywhere. A test about the US order sets en-US itself.
import { setDateLocaleForTests } from '../lib/dates';

setDateLocaleForTests('en-NZ');
