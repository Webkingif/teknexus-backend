import { Router } from 'express';
import { handleSMS } from '../controllers/smsController.js';

const router = Router();

// POST endpoint for Africa's Talking incoming SMS webhook
router.post('/', handleSMS);

export default router;
