import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserProfile,
  getAvatarUploadSignature,
  updateAvatar,
  deleteAvatar,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All user endpoints require authentication

// Avatar endpoints (placed before /:id)
router.post('/me/avatar/signature', getAvatarUploadSignature);
router.patch('/me/avatar', updateAvatar);
router.delete('/me/avatar', deleteAvatar);

// Profile endpoints
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUserProfile);

export default router;
