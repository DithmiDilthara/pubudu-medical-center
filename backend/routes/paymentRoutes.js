import express from 'express';
import { initiatePayment, handleNotify, verifyPayment, downloadReceipt } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.post('/notify', handleNotify); // Webhook is public
router.post('/verify', protect, verifyPayment); // Frontend callback
router.get('/:appointmentId/receipt', protect, downloadReceipt);

export default router;
