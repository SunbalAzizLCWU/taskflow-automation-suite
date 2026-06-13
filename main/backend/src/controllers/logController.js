import { Log } from '../models/Log.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Returns the most recent logs for the user, newest first. Supports ?limit and
// ?level filtering.
export const listLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const query = { owner: req.user._id };
  if (req.query.level) query.level = req.query.level;
  const logs = await Log.find(query).sort({ createdAt: -1 }).limit(limit);
  res.json({ logs });
});
