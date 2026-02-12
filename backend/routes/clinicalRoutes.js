import express from 'express';
import { setAvailability, getDoctorAvailability } from '../controllers/availabilityController.js';
import { addPrescription, getMedicalHistory } from '../controllers/clinicalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Availability (Some public for booking)
router.get('/availability/:doctor_id', getDoctorAvailability);
router.post('/availability', protect, setAvailability);

// Clinical
router.post('/clinical/prescription', protect, addPrescription);
router.get('/clinical/history/:patient_id', protect, getMedicalHistory);

export default router;
