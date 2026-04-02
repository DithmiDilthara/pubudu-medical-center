import express from 'express';
import { getAllDoctors, getDoctorsBySpecialization, getDoctorById, getMyPatients, getPatientDetails } from '../controllers/doctorController.js';
import { getDoctorAvailability } from '../controllers/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isDoctor } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:doctor_id', getDoctorById);
router.get('/:doctor_id/availability', getDoctorAvailability);

// Protected routes (Doctor only)
router.use(protect);
router.use(isDoctor);
router.get('/my-patients', getMyPatients);
router.get('/patient/:patient_id', getPatientDetails);

export default router;
