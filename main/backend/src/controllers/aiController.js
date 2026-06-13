import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { nlToRule, suggestTasks, summarizeLogs } from '../services/aiService.js';
import { Task } from '../models/Task.js';
import { Log } from '../models/Log.js';
import { Rule } from '../models/Rule.js';

// POST /api/ai/rule  { description }
// Returns a draft rule object. Does NOT save it; the client reviews then POSTs
// to /api/rules. Optionally persist immediately with { save: true }.
export const generateRule = asyncHandler(async (req, res) => {
  const { description, save } = req.body || {};
  const draft = await nlToRule(description);
  if (save) {
    const rule = await Rule.create({ owner: req.user._id, ...draft });
    return res.status(201).json({ rule, saved: true });
  }
  res.json({ rule: draft, saved: false });
});

// GET /api/ai/suggest-tasks
export const getTaskSuggestions = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const suggestions = await suggestTasks(tasks);
  res.json({ suggestions });
});

// POST /api/ai/summarize-logs  { limit? }
export const getLogSummary = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.body?.limit, 10) || 100, 300);
  const logs = await Log.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(limit);
  const summary = await summarizeLogs(logs);
  res.json({ summary, count: logs.length });
});
