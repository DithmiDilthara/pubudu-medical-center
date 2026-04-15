import express from 'express';
import { setAvailability, getDoctorAvailability, deleteAvailability, updateAvailability, cancelSingleInstance } from '../controllers/availabilityController.js';
import { addMedicalRecord, getMedicalHistory, updateMedicalRecord, deleteMedicalRecord } from '../controllers/clinicalController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Availability (Some public for booking)
router.get('/availability/:doctor_id', getDoctorAvailability);
router.post('/availability', protect, authorizeRoles(1, 3), setAvailability);
router.put('/availability/:id', protect, authorizeRoles(1, 3), updateAvailability);
router.delete('/availability/:id', protect, authorizeRoles(1, 3), deleteAvailability);
router.post('/availability/cancel-instance', protect, authorizeRoles(1, 3), cancelSingleInstance);

// Clinical
router.post('/record', protect, addMedicalRecord);
router.get('/history/:patient_id', protect, getMedicalHistory);
router.put('/record/:id', protect, updateMedicalRecord);
router.delete('/record/:id', protect, deleteMedicalRecord);

export default router;
