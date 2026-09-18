import express from 'express';
import { runHackathonSync } from '../services/hackathonSync/index.js';

const router = express.Router();

/**
 * @route   GET /api/cron/sync-hackathons
 * @desc    Trigger automated hackathon discovery and synchronization via Vercel Cron
 * @access  Protected by CRON_SECRET
 */
router.get('/sync-hackathons', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  const isProd = process.env.NODE_ENV === 'production';

  // In production or whenever CRON_SECRET is configured, strictly enforce bearer authorization
  if (isProd || cronSecret) {
    const isAuthorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (!isProd && req.query.secret === cronSecret);

    if (!isAuthorized) {
      console.warn('[Cron:Security] Blocked unauthorized attempt to invoke /api/cron/sync-hackathons');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing CRON_SECRET',
      });
    }
  }

  try {
    console.log('[Cron] Authorized Vercel Cron invocation received. Starting sync...');
    const result = await runHackathonSync();

    return res.json({
      success: true,
      message: 'Hackathon synchronization completed successfully',
      result,
    });
  } catch (error) {
    console.error('[Cron] Unhandled error during scheduled hackathon sync:', error);
    return res.status(500).json({
      success: false,
      message: 'Error executing hackathon synchronization',
      error: error.message,
    });
  }
});

export default router;
