/**
 * Deliberately minimal. The claim endpoint accepts an optional `day` in the
 * body purely as a client hint/no-op for analytics - it is NEVER read for
 * business decisions (see streak.service.js claimDay). Any `reward`,
 * `amount`, `currency`, `streak`, or `userId` fields in the body are
 * silently ignored, not validated, because acknowledging them at all would
 * invite spoofing attempts to keep trying variations.
 */
function sanitizeClaimBody(req, res, next) {
  req.body = {}; // hard-drop everything the client sent for this route
  next();
}

module.exports = { sanitizeClaimBody };
