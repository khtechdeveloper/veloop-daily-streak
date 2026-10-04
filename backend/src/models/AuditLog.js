const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    event: {
      type: String,
      enum: [
        "STREAK_CLAIM_REQUEST",
        "STREAK_CLAIM_SUCCESS",
        "STREAK_CLAIM_REJECTED",
        "STREAK_RESET",
        "DUPLICATE_CLAIM",
        "INVALID_CLAIM",
        "AUTH_LOGIN",
        "AUTH_REGISTER",
      ],
      required: true,
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
