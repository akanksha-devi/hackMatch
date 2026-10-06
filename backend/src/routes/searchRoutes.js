import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { universalSearch } from '../controllers/searchController.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Universal search across isolated campus entities & system pages
 * @access  Private
 */
router.get('/', protect, universalSearch);

export default router;
