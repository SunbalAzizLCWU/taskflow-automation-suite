import { Router } from 'express';
import {
  listRules,
  createRule,
  getRule,
  updateRule,
  deleteRule,
} from '../controllers/ruleController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.route('/').get(listRules).post(createRule);
router.route('/:id').get(getRule).patch(updateRule).delete(deleteRule);

export default router;
