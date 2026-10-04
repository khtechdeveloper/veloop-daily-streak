/**
 * Central, backend-only streak configuration.
 * Nothing here is ever sent to the client as "the source of truth" for logic -
 * the client only ever receives *computed results* (status strings, ISO
 * timestamps, reward payloads), never these raw rule constants to interpret
 * itself.
 */
module.exports = {
  CYCLE_LENGTH: Number(process.env.STREAK_CYCLE_LENGTH || 7),
  CLAIM_INTERVAL_HOURS: Number(process.env.STREAK_CLAIM_INTERVAL_HOURS || 24),
  // Grace window AFTER a claim becomes due, before the streak is considered
  // missed and reset. Example: claim Day 2 due at T; if the user has not
  // claimed by T + MISSED_GRACE_HOURS, the streak resets on their next visit.
  MISSED_GRACE_HOURS: Number(process.env.STREAK_MISSED_GRACE_HOURS || 24),
};
