import Hackathon from '../../models/Hackathon.js';
import HackathonSyncLog from '../../models/HackathonSyncLog.js';
import { normalizeHackathon } from './normalizer.js';
import { upsertHackathon } from './deduplicator.js';

// Adapters
import CuratedFeedAdapter from './sources/curatedFeedAdapter.js';
import UnstopAdapter from './sources/unstopAdapter.js';
import DevpostAdapter from './sources/devpostAdapter.js';
import MLHAdapter from './sources/mlhAdapter.js';

// Initialize adapters registry
const adapters = [
  new CuratedFeedAdapter(),
  new UnstopAdapter(),
  new DevpostAdapter(),
  new MLHAdapter(),
];

/**
 * Returns current health status of all registered source adapters
 */
export const getSourceStatuses = () => {
  return adapters.map((adapter) => adapter.getDetails());
};

/**
 * Sweeps for hackathons whose registration deadline has passed and marks them Inactive / expired
 * @returns {Promise<number>} count of expired hackathons updated
 */
export const expireOldHackathons = async () => {
  const now = new Date();
  const result = await Hackathon.updateMany(
    {
      status: 'Active',
      $or: [
        { registrationDeadline: { $exists: true, $ne: null, $lt: now } },
        {
          $and: [
            { $or: [{ registrationDeadline: null }, { registrationDeadline: { $exists: false } }] },
            { endDate: { $exists: true, $ne: null, $lt: now } },
          ],
        },
      ],
    },
    {
      $set: {
        status: 'Inactive',
        syncStatus: 'expired',
      },
    }
  );

  return result.modifiedCount || 0;
};

/**
 * Main Hackathon Synchronization Orchestrator
 * Fetches, normalizes, deduplicates, and synchronizes all active external sources.
 *
 * @param {Object} options
 * @param {string} [options.sourceId] Optional source identifier to sync only a specific source
 * @returns {Promise<Object>} Execution report summary
 */
export const runHackathonSync = async (options = {}) => {
  const startedAt = new Date();
  console.log(`[HackathonSync] Starting synchronization cycle at ${startedAt.toISOString()}...`);

  let totalFetched = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const sourceBreakdowns = {};
  const errorMessages = [];

  const targetAdapters = options.sourceId
    ? adapters.filter((a) => a.getId() === options.sourceId)
    : adapters;

  for (const adapter of targetAdapters) {
    const sId = adapter.getId();
    sourceBreakdowns[sId] = {
      name: adapter.getName(),
      status: adapter.getStatus(),
      fetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorMessage: null,
    };

    if (!adapter.isEnabled()) {
      console.log(`[HackathonSync] Source '${adapter.getName()}' is disabled. Skipping.`);
      continue;
    }

    try {
      const rawEvents = await adapter.fetchHackathons();
      sourceBreakdowns[sId].fetched = rawEvents.length;
      totalFetched += rawEvents.length;

      for (const raw of rawEvents) {
        try {
          const normalized = normalizeHackathon(raw, sId);
          if (!normalized.valid) {
            sourceBreakdowns[sId].skipped++;
            totalSkipped++;
            continue;
          }

          const result = await upsertHackathon(normalized.data);
          if (result.action === 'CREATED') {
            sourceBreakdowns[sId].created++;
            totalCreated++;
          } else if (result.action === 'UPDATED') {
            sourceBreakdowns[sId].updated++;
            totalUpdated++;
          } else {
            sourceBreakdowns[sId].skipped++;
            totalSkipped++;
          }
        } catch (itemErr) {
          sourceBreakdowns[sId].errors++;
          totalErrors++;
          console.error(`[HackathonSync] Error processing event in ${sId}: ${itemErr.message}`);
        }
      }

      sourceBreakdowns[sId].status = adapter.getStatus();
    } catch (sourceErr) {
      sourceBreakdowns[sId].errors++;
      sourceBreakdowns[sId].status = adapter.getStatus();
      sourceBreakdowns[sId].errorMessage = sourceErr.message;
      totalErrors++;
      errorMessages.push(`${adapter.getName()}: ${sourceErr.message}`);
      console.error(`[HackathonSync] Failure in source '${adapter.getName()}': ${sourceErr.message}`);
    }
  }

  // Check and mark expired events
  const expiredCount = await expireOldHackathons();
  const completedAt = new Date();

  // Determine overall status
  let overallStatus = 'SUCCESS';
  if (totalErrors > 0 && totalCreated === 0 && totalUpdated === 0 && totalFetched === 0) {
    overallStatus = 'FAILED';
  } else if (totalErrors > 0) {
    overallStatus = 'PARTIAL';
  }

  // Create audit log record
  const syncLog = await HackathonSyncLog.create({
    startedAt,
    completedAt,
    status: overallStatus,
    source: options.sourceId || 'ALL',
    fetchedCount: totalFetched,
    createdCount: totalCreated,
    updatedCount: totalUpdated,
    expiredCount,
    skippedCount: totalSkipped,
    errorCount: totalErrors,
    errorMessage: errorMessages.join(' | '),
    details: sourceBreakdowns,
  });

  console.log(
    `[HackathonSync] Sync completed in ${completedAt - startedAt}ms with status: ${overallStatus}. ` +
    `Fetched: ${totalFetched}, Created: ${totalCreated}, Updated: ${totalUpdated}, Expired: ${expiredCount}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`
  );

  return {
    success: overallStatus !== 'FAILED',
    status: overallStatus,
    startedAt,
    completedAt,
    durationMs: completedAt - startedAt,
    fetchedCount: totalFetched,
    createdCount: totalCreated,
    updatedCount: totalUpdated,
    expiredCount,
    skippedCount: totalSkipped,
    errorCount: totalErrors,
    sourceBreakdowns,
    logId: syncLog._id,
  };
};

/**
 * Gets the latest sync log and summary statistics
 */
export const getSyncStatusSummary = async () => {
  const latestLog = await HackathonSyncLog.findOne().sort({ startedAt: -1 });
  const sources = getSourceStatuses();

  const [totalHackathons, externalHackathons, manualHackathons, upcomingCount, activeCount] = await Promise.all([
    Hackathon.countDocuments(),
    Hackathon.countDocuments({ isExternal: true }),
    Hackathon.countDocuments({ isExternal: { $ne: true } }),
    Hackathon.countDocuments({ startDate: { $gt: new Date() } }),
    Hackathon.countDocuments({ status: 'Active' }),
  ]);

  return {
    latestLog,
    sources,
    metrics: {
      totalHackathons,
      externalHackathons,
      manualHackathons,
      upcomingCount,
      activeCount,
    },
  };
};

export default {
  runHackathonSync,
  getSourceStatuses,
  getSyncStatusSummary,
  expireOldHackathons,
};
