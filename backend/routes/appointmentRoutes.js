import express from 'express';
import { createAppointment, cancelAppointment, getAppointments, updateStatus, getNextNumber, cancelDoctorSession, rescheduleAppointment, processRefund, dismissRefund } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/next-number', getNextNumber);
router.put('/cancel-session', cancelDoctorSession);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/status', updateStatus);
router.post('/:id/refund', processRefund);
router.post('/:id/dismiss-refund', dismissRefund);

export default router;
