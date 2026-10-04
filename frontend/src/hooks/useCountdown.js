import { useEffect, useRef, useState } from "react";
import { getRemainingMs, formatDuration } from "../utils/countdown";

/**
 * Ticks a visual countdown toward nextClaimAt. When it hits zero it calls
 * onComplete exactly once so the page can re-fetch server status - it never
 * flips the UI to "claimable" on its own.
 */
export function useCountdown(nextClaimAtIso, onComplete) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(nextClaimAtIso));
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    setRemainingMs(getRemainingMs(nextClaimAtIso));

    if (!nextClaimAtIso) return undefined;

    const interval = setInterval(() => {
      const ms = getRemainingMs(nextClaimAtIso);
      setRemainingMs(ms);
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(interval);
        onComplete && onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextClaimAtIso]); // eslint-disable-line react-hooks/exhaustive-deps

  return { remainingMs, formatted: formatDuration(remainingMs) };
}
