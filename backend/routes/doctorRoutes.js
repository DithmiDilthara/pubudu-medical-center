import express from 'express';
import { getAllDoctors, getDoctorsBySpecialization, getDoctorById, getMyPatients, getPatientDetails } from '../controllers/doctorController.js';
import { getDoctorAvailability } from '../controllers/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isDoctor } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);

// Protected doctor-only routes — MUST be before /:doctor_id to avoid shadowing
router.get('/my-patients', protect, isDoctor, getMyPatients);
router.get('/patient/:patient_id', protect, isDoctor, getPatientDetails);

// Dynamic routes last — so they don't catch /my-patients or /patient/:id first
router.get('/:doctor_id', getDoctorById);
router.get('/:doctor_id/availability', getDoctorAvailability);

export default router;
