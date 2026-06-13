import { Router } from 'express';
import { ingestWebhook } from '../controllers/webhookController.js';

// Public: secured by the unguessable token in the path, not by JWT.
const router = Router();
router.post('/:token', ingestWebhook);

export default router;
