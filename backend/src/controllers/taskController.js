import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// All task operations are scoped to req.user so users only see their own data.

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority } = req.body || {};
  if (!title) {
    throw new ApiError(400, 'title is required');
  }
  const task = await Task.create({
    owner: req.user._id,
    title,
    description,
    status,
    priority,
    source: 'manual',
  });
  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const allowed = ['title', 'description', 'status', 'priority'];
  const updates = {};
  for (const key of allowed) {
    if (key in (req.body || {})) updates[key] = req.body[key];
  }
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true }
  );
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ ok: true });
});
