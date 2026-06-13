import { Router } from 'express';
import {
  generateRule,
  getTaskSuggestions,
  getLogSummary,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.post('/rule', generateRule);
router.get('/suggest-tasks', getTaskSuggestions);
router.post('/summarize-logs', getLogSummary);

export default router;
