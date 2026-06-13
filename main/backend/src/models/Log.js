import mongoose from 'mongoose';

// Append-only record of automation activity. Used by the logs viewer and by
// the AI log-summarization feature.
const logSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rule: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule' },
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
    message: { type: String, required: true },
    // Arbitrary structured context (payload snapshot, action result, etc.)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Index for fast "recent logs for this user" queries.
logSchema.index({ owner: 1, createdAt: -1 });

export const Log = mongoose.model('Log', logSchema);
