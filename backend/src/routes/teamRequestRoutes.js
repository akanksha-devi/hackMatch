import express from 'express';
import {
  getTeamRequests,
  getTeamRequestById,
  createTeamRequest,
  updateTeamRequest,
  deleteTeamRequest,
  getTeamRequestMatches,
  previewMatches,
} from '../controllers/teamRequestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireVerifiedStudent } from '../middleware/verificationMiddleware.js';

const router = express.Router();

router.use(protect); // All team request routes require authentication

router.get('/', getTeamRequests);
router.post('/preview-matches', previewMatches);
router.get('/:id', getTeamRequestById);
router.post('/', requireVerifiedStudent, createTeamRequest);
router.put('/:id', updateTeamRequest);
router.delete('/:id', deleteTeamRequest);
router.get('/:id/matches', getTeamRequestMatches);

export default router;
