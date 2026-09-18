import express from 'express';
import {
  createResponse,
  getMyResponses,
  updateResponseStatus,
} from '../controllers/responseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireVerifiedStudent } from '../middleware/verificationMiddleware.js';

const router = express.Router();

router.use(protect); // All application/response routes require authentication

router.post('/', requireVerifiedStudent, createResponse);
router.get('/my', getMyResponses);
router.put('/:id', updateResponseStatus);

export default router;
