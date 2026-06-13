import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // Where this task came from: a human, an automation rule, or an AI suggestion.
    source: {
      type: String,
      enum: ['manual', 'automation', 'ai'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
