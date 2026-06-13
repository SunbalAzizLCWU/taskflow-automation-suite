import mongoose from 'mongoose';
import crypto from 'crypto';

// A condition compares a field from the incoming payload against a value.
// Example: { field: 'priority', op: 'eq', value: 'high' }
const conditionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    op: {
      type: String,
      enum: ['eq', 'ne', 'contains', 'gt', 'lt', 'exists'],
      required: true,
    },
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

// An action is something the rule does when it fires.
// type 'create_task' uses params { title, priority }.
// Slack/Sheets/Email action types are wired up in a later increment.
const actionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['create_task', 'slack', 'sheets', 'email'],
      required: true,
    },
    params: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const ruleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    // Only 'webhook' for now; cron/schedule could be added later.
    trigger: { type: String, enum: ['webhook'], default: 'webhook' },
    // Unique token used in the inbound webhook URL: /api/hooks/:webhookToken
    webhookToken: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    conditions: { type: [conditionSchema], default: [] },
    actions: { type: [actionSchema], default: [] },
  },
  { timestamps: true }
);

export const Rule = mongoose.model('Rule', ruleSchema);
