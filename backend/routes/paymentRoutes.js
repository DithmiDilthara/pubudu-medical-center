import express from 'express';
import { initiatePayment, handleNotify, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.post('/notify', handleNotify); // Webhook is public
router.post('/verify', protect, verifyPayment); // Frontend callback

export default router;
