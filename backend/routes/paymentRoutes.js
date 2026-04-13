import express from 'express';
import { initiatePayment, handleNotify, verifyPayment, downloadReceipt, getTransactionHistory } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.post('/notify', handleNotify); // Webhook is public
router.post('/verify', protect, verifyPayment); // Frontend callback
router.get('/:appointmentId/receipt', protect, downloadReceipt);
router.get('/history', protect, getTransactionHistory);

export default router;
