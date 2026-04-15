import express from 'express';
import { 
    getAllStaff, 
    createStaff, 
    updateStaff, 
    deleteStaff 
} from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isSuperAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply global protection
router.use(protect);
router.use(isSuperAdmin);

router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
