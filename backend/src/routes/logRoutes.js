import { Router } from 'express';
import { listLogs } from '../controllers/logController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', listLogs);

export default router;
