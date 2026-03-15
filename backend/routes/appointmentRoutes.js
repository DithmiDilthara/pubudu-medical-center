import express from 'express';
import { createAppointment, cancelAppointment, getAppointments, updateStatus, getNextNumber } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/next-number', getNextNumber);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/status', updateStatus);

export default router;
