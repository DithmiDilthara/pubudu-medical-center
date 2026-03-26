import express from 'express';
import { 
    createPayment, 
    getTransactionHistory,
    updatePatientDetails
} from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isPatient } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected and require patient role
router.use(protect);
router.use(isPatient);


// Profile management
router.patch('/update-details', updatePatientDetails);

router.post('/payment', createPayment);
router.get('/transactions', getTransactionHistory);

export default router;
