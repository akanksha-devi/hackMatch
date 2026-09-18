import express from 'express';
import {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  toggleCollegeStatus,
  deleteCollege,
} from '../controllers/collegeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireSuperAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Optional auth: allows superAdmins to see all, while unauthenticated/students see active
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getColleges);
router.get('/:id', optionalProtect, getCollegeById);

// Super Admin College Management
router.post('/', protect, requireSuperAdmin, createCollege);
router.put('/:id', protect, requireSuperAdmin, updateCollege);
router.patch('/:id/status', protect, requireSuperAdmin, toggleCollegeStatus);
router.delete('/:id', protect, requireSuperAdmin, deleteCollege);

export default router;
