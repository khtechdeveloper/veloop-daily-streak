/**
 * Pure display math only. The frontend never decides eligibility from this -
 * it's a visual representation computed from a server-issued nextClaimAt
 * timestamp. When it visually reaches zero, the caller must re-fetch
 * /daily-streak/status and let the backend confirm (see DailyStreakPage).
 * Because this subtracts two absolute timestamps, changing the device clock
 * does not change the *actual* unlock time - it only skews what the user
 * sees locally until the next server refresh corrects it.
 */
export function getRemainingMs(nextClaimAtIso) {
  if (!nextClaimAtIso) return 0;
  const target = new Date(nextClaimAtIso).getTime();
  const now = Date.now();
  return Math.max(0, target - now);
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
