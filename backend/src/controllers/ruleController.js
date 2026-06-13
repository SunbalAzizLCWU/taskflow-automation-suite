import { Rule } from '../models/Rule.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listRules = asyncHandler(async (req, res) => {
  const rules = await Rule.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ rules });
});

export const createRule = asyncHandler(async (req, res) => {
  const { name, conditions, actions, enabled } = req.body || {};
  if (!name) throw new ApiError(400, 'name is required');
  if (!Array.isArray(actions) || actions.length === 0) {
    throw new ApiError(400, 'at least one action is required');
  }
  const rule = await Rule.create({
    owner: req.user._id,
    name,
    conditions: conditions || [],
    actions,
    enabled: enabled !== false,
  });
  res.status(201).json({ rule });
});

export const getRule = asyncHandler(async (req, res) => {
  const rule = await Rule.findOne({ _id: req.params.id, owner: req.user._id });
  if (!rule) throw new ApiError(404, 'Rule not found');
  res.json({ rule });
});

export const updateRule = asyncHandler(async (req, res) => {
  const allowed = ['name', 'conditions', 'actions', 'enabled'];
  const updates = {};
  for (const key of allowed) {
    if (key in (req.body || {})) updates[key] = req.body[key];
  }
  const rule = await Rule.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true }
  );
  if (!rule) throw new ApiError(404, 'Rule not found');
  res.json({ rule });
});

export const deleteRule = asyncHandler(async (req, res) => {
  const rule = await Rule.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!rule) throw new ApiError(404, 'Rule not found');
  res.json({ ok: true });
});
