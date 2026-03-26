import express from 'express';
import {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  createReceptionist,
  getReceptionists,
  updateReceptionist,
  deleteReceptionist,
  getSystemStats,
  getRevenueReport,
  getPatientRegistrationReport,
  getAppointmentReport,
  exportReport,
  getDashboardData,
  getPatientRegistrationStats
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(isAdmin);

// Doctor management routes
router.post('/doctors', createDoctor);
router.get('/doctors', getDoctors);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Receptionist management routes
router.post('/receptionists', createReceptionist);
router.get('/receptionists', getReceptionists);
router.put('/receptionists/:id', updateReceptionist);
router.delete('/receptionists/:id', deleteReceptionist);

// System statistics and reports
router.get('/stats', getSystemStats);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/patients', getPatientRegistrationReport);
router.get('/reports/appointments', getAppointmentReport);
router.get('/reports/export/:type', exportReport);
router.get('/dashboard-data', getDashboardData);
router.get('/patient-registration-stats', getPatientRegistrationStats);

export default router;
