import express from 'express';
import { searchPatient, getDashboardStats, registerPatient } from '../controllers/receptionistController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isReceptionist } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected and require receptionist role
router.use(protect);
router.use(isReceptionist);

// Patient management routes
router.get('/search-patient', searchPatient);
router.post('/register-patient', registerPatient);

// Dashboard routes
router.get('/stats', getDashboardStats);

export default router;
