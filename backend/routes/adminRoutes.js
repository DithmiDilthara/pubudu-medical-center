import express from 'express';
import {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  createReceptionist,
  getReceptionists,
  updateReceptionist,
  deleteReceptionist
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

export default router;
