import crypto from 'crypto';

/**
 * Validates and normalizes raw hackathon objects from adapters into standard HackMatch schema.
 */
export const normalizeHackathon = (raw, sourceId) => {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, reason: 'Record is null or not an object' };
  }

  // 1. Mandatory field checks
  const title = (raw.title || raw.name || '').trim();
  const organizer = (raw.organizer || raw.host || raw.organization || 'Independent Organizer').trim();
  const externalUrl = (raw.externalUrl || raw.url || raw.website || '').trim();
  const registrationLink = (raw.registrationLink || raw.website || raw.url || externalUrl).trim();

  if (!title || title.length < 3) {
    return { valid: false, reason: 'Missing or too short title' };
  }

  if (!externalUrl && !registrationLink) {
    return { valid: false, reason: 'Missing externalUrl and registrationLink' };
  }

  // 2. Dates
  const now = new Date();
  let startDate = raw.startDate || raw.start ? new Date(raw.startDate || raw.start) : null;
  let endDate = raw.endDate || raw.end ? new Date(raw.endDate || raw.end) : null;

  if (startDate && isNaN(startDate.getTime())) startDate = null;
  if (endDate && isNaN(endDate.getTime())) endDate = null;

  // If endDate missing but startDate exists, assume 2 days duration
  if (startDate && !endDate) {
    endDate = new Date(startDate.getTime() + 48 * 60 * 60 * 1000);
  }

  // Registration deadline: if raw provides it, use it; else fallback to startDate or endDate
  let registrationDeadline = raw.registrationDeadline || raw.deadline
    ? new Date(raw.registrationDeadline || raw.deadline)
    : (startDate || endDate);

  if (registrationDeadline && isNaN(registrationDeadline.getTime())) {
    registrationDeadline = startDate || endDate || null;
  }

  // 3. Mode & Location
  let mode = 'Online';
  if (raw.mode) {
    const rawMode = String(raw.mode).toLowerCase();
    if (rawMode.includes('hybrid')) mode = 'Hybrid';
    else if (rawMode.includes('offline') || rawMode.includes('in-person')) mode = 'Offline';
    else mode = 'Online';
  } else if (raw.hybrid) {
    mode = 'Hybrid';
  } else if (raw.virtual === true || raw.isOnline === true) {
    mode = 'Online';
  } else if (raw.virtual === false || raw.city || raw.location) {
    mode = 'Offline';
  }

  const locationParts = [raw.city, raw.state, raw.country].filter(Boolean);
  const location = (raw.location || (locationParts.length > 0 ? locationParts.join(', ') : (mode === 'Online' ? 'Global Virtual' : ''))).trim();

  // 4. Description
  const description = (
    raw.description ||
    raw.notes ||
    `${title} organized by ${organizer}. Join this hackathon to build cutting-edge solutions, collaborate, and compete.`
  ).trim();

  // 5. Tags
  let tags = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof raw.tags === 'string') {
    tags = raw.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  // Auto-enrich default tags if empty
  if (tags.length === 0) {
    const textToScan = `${title} ${description}`.toLowerCase();
    if (textToScan.includes('ai') || textToScan.includes('machine learning')) tags.push('AI');
    if (textToScan.includes('web') || textToScan.includes('fullstack')) tags.push('Web Dev');
    if (textToScan.includes('web3') || textToScan.includes('blockchain') || textToScan.includes('crypto')) tags.push('Web3');
    if (textToScan.includes('mobile') || textToScan.includes('android') || textToScan.includes('ios')) tags.push('Mobile');
    if (textToScan.includes('cloud') || textToScan.includes('devops')) tags.push('Cloud');
    if (tags.length === 0) tags.push('Hackathon');
  }

  // 6. External ID & Source
  const externalId = String(raw.externalId || raw.id || '').trim();

  // 7. Status & Expiration
  const isExpired = registrationDeadline ? registrationDeadline < now : (endDate ? endDate < now : false);
  const status = isExpired ? 'Inactive' : 'Active';
  const syncStatus = isExpired ? 'expired' : 'active';

  // 8. Content Hash for change detection
  const hashPayload = JSON.stringify({
    title,
    description,
    organizer,
    mode,
    location,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    registrationDeadline: registrationDeadline?.toISOString(),
    registrationLink,
    tags: tags.sort(),
  });
  const contentHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

  return {
    valid: true,
    data: {
      title,
      description,
      organizer,
      mode,
      location,
      startDate,
      endDate,
      registrationDeadline,
      registrationLink,
      tags,
      visibility: 'Global',
      status,
      // External metadata
      source: sourceId,
      externalId,
      externalUrl: externalUrl || registrationLink,
      sourceUpdatedAt: raw.sourceUpdatedAt ? new Date(raw.sourceUpdatedAt) : (raw.createdAt ? new Date(raw.createdAt) : null),
      isExternal: true,
      syncStatus,
      contentHash,
    },
  };
};

export default normalizeHackathon;
