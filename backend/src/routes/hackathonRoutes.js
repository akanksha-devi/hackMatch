import express from 'express';
import {
  getHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
} from '../controllers/hackathonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional authentication to view Global vs College hackathons
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getHackathons);
router.get('/:id', optionalProtect, getHackathonById);
router.post('/', protect, createHackathon);
router.put('/:id', protect, updateHackathon);
router.delete('/:id', protect, deleteHackathon);

export default router;
