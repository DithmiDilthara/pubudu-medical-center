import express from 'express';
import { 
  register, 
  registerPatient, 
  addStaff, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  logout, 
  forgotPassword, 
  resetPassword, 
  getTokens 
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (general - legacy endpoint)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/register-patient
 * @desc    Public patient registration endpoint
 * @access  Public
 */
router.post('/register-patient', registerPatient);

/**
 * @route   POST /api/auth/add-staff
 * @desc    Admin-only endpoint to create Doctor or Receptionist accounts
 * @access  Private (Admin only)
 */
router.post('/add-staff', verifyToken, authorizeRole('Admin'), addStaff);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.post('/logout', verifyToken, logout);
router.get('/tokens', verifyToken, getTokens); // Admin only ideal, but keeping protected for now

export default router;
