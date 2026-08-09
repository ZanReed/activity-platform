import { useEffect, useState } from 'react';

/**
 * How long before an in-flight load admits it's slow (ruling 1.2A, shared by
 * the StudentViewer skeleton and the identity slice's role gate / join call —
 * design OV#8 named the constant shared so school-wifi hangs escalate the
 * same way everywhere: "taking longer than usual" + a retry, never an
 * indefinite spinner).
 */
export const SLOW_LOAD_MS = 8000;

/** True once `active` has been continuously true for SLOW_LOAD_MS. */
export function useSlowFlag(active: boolean): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => clearTimeout(timer);
  }, [active]);
  return slow;
}
