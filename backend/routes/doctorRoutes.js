import express from 'express';
import { getAllDoctors, getDoctorsBySpecialization } from '../controllers/doctorController.js';
import { getDoctorAvailability } from '../controllers/availabilityController.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:doctor_id/availability', getDoctorAvailability);

export default router;
