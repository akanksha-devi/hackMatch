import Hackathon from '../../models/Hackathon.js';

/**
 * Finds an existing hackathon record using primary (source + externalId) or fallback identity.
 */
export const findExistingHackathon = async (normalizedData) => {
  const { source, externalId, title, organizer, registrationDeadline } = normalizedData;

  // 1. Primary match: source + externalId
  if (externalId) {
    const primaryMatch = await Hackathon.findOne({ source, externalId });
    if (primaryMatch) {
      return primaryMatch;
    }
  }

  // 2. Fallback match: source + normalized title + normalized organizer
  const cleanTitle = title.trim();
  const cleanOrg = organizer.trim();

  const query = {
    source,
    title: { $regex: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i') },
    organizer: { $regex: new RegExp(`^${escapeRegex(cleanOrg)}$`, 'i') },
  };

  const fallbackMatch = await Hackathon.findOne(query);
  if (fallbackMatch) {
    return fallbackMatch;
  }

  return null;
};

/**
 * Helper to escape regex special characters
 */
function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Idempotently creates or updates a hackathon record while preserving manual administration overrides.
 * @param {Object} normalizedData
 * @returns {Promise<{ action: 'CREATED' | 'UPDATED' | 'SKIPPED', hackathon: Object }>}
 */
export const upsertHackathon = async (normalizedData) => {
  const existing = await findExistingHackathon(normalizedData);
  const now = new Date();

  // 1. If not found -> Create new record
  if (!existing) {
    const created = await Hackathon.create({
      ...normalizedData,
      firstSeenAt: now,
      lastSyncedAt: now,
    });
    return { action: 'CREATED', hackathon: created };
  }

  // 2. If found -> check for changes
  const isContentIdentical = existing.contentHash === normalizedData.contentHash;
  const isStatusIdentical = existing.syncStatus === normalizedData.syncStatus && existing.status === normalizedData.status;

  if (isContentIdentical && isStatusIdentical) {
    // Just refresh lastSyncedAt timestamp without dirtying content
    existing.lastSyncedAt = now;
    await existing.save();
    return { action: 'SKIPPED', hackathon: existing };
  }

  // 3. Update changed fields (safely respecting manual overrides)
  existing.lastSyncedAt = now;
  if (normalizedData.sourceUpdatedAt) {
    existing.sourceUpdatedAt = normalizedData.sourceUpdatedAt;
  }

  // If manual override flag is true, do NOT overwrite title, description, tags or visibility
  if (!existing.manuallyOverridden) {
    existing.title = normalizedData.title;
    existing.description = normalizedData.description;
    existing.organizer = normalizedData.organizer;
    existing.mode = normalizedData.mode;
    existing.location = normalizedData.location;
    existing.startDate = normalizedData.startDate;
    existing.endDate = normalizedData.endDate;
    existing.registrationDeadline = normalizedData.registrationDeadline;
    existing.registrationLink = normalizedData.registrationLink;
    existing.tags = normalizedData.tags;
    existing.externalUrl = normalizedData.externalUrl;
  }

  // Status and syncStatus are always synced according to deadline/schedule
  existing.status = normalizedData.status;
  existing.syncStatus = normalizedData.syncStatus;
  existing.contentHash = normalizedData.contentHash;

  await existing.save();
  return { action: 'UPDATED', hackathon: existing };
};

export default {
  findExistingHackathon,
  upsertHackathon,
};
