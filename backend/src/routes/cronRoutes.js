import express from 'express';
import { runHackathonSync } from '../services/hackathonSync/index.js';
import { timingSafeEqualStr } from '../utils/sanitize.js';

const router = express.Router();

/**
 * @route   GET /api/cron/sync-hackathons
 * @desc    Trigger automated hackathon discovery and synchronization via Vercel Cron
 * @access  Protected by CRON_SECRET (Timing-safe Bearer authentication)
 */
router.get('/sync-hackathons', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (!cronSecret) {
    console.error('[Cron:Security] CRON_SECRET is not configured on the server');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: CRON_SECRET is not set',
    });
  }

  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (!isProd && req.query.secret) {
    token = String(req.query.secret).trim();
  }

  const isAuthorized = timingSafeEqualStr(token, cronSecret);

  if (!isAuthorized) {
    console.warn('[Cron:Security] Blocked unauthorized attempt to invoke /api/cron/sync-hackathons');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing CRON_SECRET',
    });
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
      ...(process.env.NODE_ENV === 'production' ? {} : { error: error.message }),
    });
  }
});

export default router;
