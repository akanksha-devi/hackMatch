import express from 'express';
import {
  submitVerification,
  getMyVerifications,
  getAdminVerifications,
  reviewVerification,
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Student endpoints
router.post('/', submitVerification);
router.get('/my', getMyVerifications);

// Admin review endpoints
router.get('/admin', requireAdmin, getAdminVerifications);
router.patch('/admin/:id', requireAdmin, reviewVerification);

export default router;
