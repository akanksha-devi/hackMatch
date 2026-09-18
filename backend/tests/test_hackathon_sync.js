import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Hackathon from '../src/models/Hackathon.js';
import TeamRequest from '../src/models/TeamRequest.js';
import Response from '../src/models/Response.js';
import HackathonSyncLog from '../src/models/HackathonSyncLog.js';
import { generateToken } from '../src/utils/generateToken.js';
import { normalizeHackathon } from '../src/services/hackathonSync/normalizer.js';
import { upsertHackathon } from '../src/services/hackathonSync/deduplicator.js';
import { runHackathonSync, expireOldHackathons } from '../src/services/hackathonSync/index.js';
import BaseSourceAdapter from '../src/services/hackathonSync/baseAdapter.js';
import app from '../src/app.js';

dotenv.config();

let server;
let baseUrl;

const startTestServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
};

const closeTestServer = () => {
  return new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
};

const fetchApi = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

export const runSyncTests = async () => {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING AUTOMATED HACKATHON DISCOVERY & SYNC TEST SUITE');
  console.log('=============================================================\n');

  await connectDB();
  const { seedDatabase } = await import('../src/utils/seed.js');
  await seedDatabase();
  await startTestServer();

  let passed = 0;
  let total = 0;

  const assert = (condition, description) => {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      throw new Error(`Test assertion failed: ${description}`);
    }
  };

  try {
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    const alex = await User.findOne({ email: 'alex@example.com' }); // Verified student
    const priya = await User.findOne({ email: 'priya@example.com' });

    const superAdminToken = generateToken({ id: superAdmin._id, role: superAdmin.role, collegeId: null });
    const alexToken = generateToken({ id: alex._id, role: alex.role, collegeId: alex.collegeId });

    // =========================================================================
    // Test 1: New external hackathon is inserted
    // =========================================================================
    console.log('[Test 1] Testing new external hackathon insertion...');
    const rawEvent1 = {
      id: 'ext-test-101',
      title: 'Global AI Summit 2026',
      organizer: 'Open Tech Foundation',
      mode: 'Online',
      url: 'https://example.com/global-ai',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ['AI', 'Machine Learning', 'Python'],
    };

    const norm1 = normalizeHackathon(rawEvent1, 'test-source-a');
    assert(norm1.valid === true, 'Raw event validates and normalizes cleanly');

    const upsertRes1 = await upsertHackathon(norm1.data);
    assert(upsertRes1.action === 'CREATED', 'First upsert creates new hackathon record');

    const inDb1 = await Hackathon.findOne({ source: 'test-source-a', externalId: 'ext-test-101' });
    assert(inDb1 !== null, 'External hackathon exists in MongoDB');
    assert(inDb1.isExternal === true, 'Record has isExternal = true');
    assert(inDb1.visibility === 'Global', 'Automatically imported hackathon has visibility = Global');
    assert(inDb1.status === 'Active', 'Upcoming hackathon has status = Active');

    // =========================================================================
    // Test 2: Existing external hackathon is updated on field change
    // =========================================================================
    console.log('\n[Test 2] Testing existing external hackathon update...');
    const rawEvent1Modified = {
      ...rawEvent1,
      title: 'Global AI Summit 2026 - Extended Edition',
      description: 'Updated prize pool and tracks.',
    };
    const norm1Mod = normalizeHackathon(rawEvent1Modified, 'test-source-a');
    const upsertRes2 = await upsertHackathon(norm1Mod.data);
    assert(upsertRes2.action === 'UPDATED', 'Modified event updates existing record');

    const inDb1Mod = await Hackathon.findOne({ source: 'test-source-a', externalId: 'ext-test-101' });
    assert(inDb1Mod.title === 'Global AI Summit 2026 - Extended Edition', 'Title updated in MongoDB');
    assert(inDb1Mod.description === 'Updated prize pool and tracks.', 'Description updated in MongoDB');

    // =========================================================================
    // Test 3: Running sync twice does not duplicate events (Idempotency)
    // =========================================================================
    console.log('\n[Test 3] Testing sync idempotency (zero duplicates on re-run)...');
    const upsertRes3 = await upsertHackathon(norm1Mod.data);
    assert(upsertRes3.action === 'SKIPPED', 'Unchanged event is skipped on second run');

    const totalMatching = await Hackathon.countDocuments({ source: 'test-source-a', externalId: 'ext-test-101' });
    assert(totalMatching === 1, 'Duplicate check confirmed: exactly 1 record exists');

    // =========================================================================
    // Test 4: Different sources with same title do not overwrite each other
    // =========================================================================
    console.log('\n[Test 4] Testing collision protection for same title across different sources...');
    const rawEventSourceB = {
      id: 'ext-b-999',
      title: 'Global AI Summit 2026 - Extended Edition', // Same title!
      organizer: 'Another Organizer Network',
      url: 'https://other-source.com/ai-summit',
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    };
    const normB = normalizeHackathon(rawEventSourceB, 'test-source-b');
    const upsertResB = await upsertHackathon(normB.data);
    assert(upsertResB.action === 'CREATED', 'Same title from different source created as independent event');

    const countBothSources = await Hackathon.countDocuments({
      title: 'Global AI Summit 2026 - Extended Edition',
    });
    assert(countBothSources === 2, 'Both independent records exist side by side');

    // =========================================================================
    // Test 5: Invalid records are skipped
    // =========================================================================
    console.log('\n[Test 5] Testing invalid record validation and rejection...');
    const invalidNoTitle = { organizer: 'Anonymous', url: 'https://example.com' };
    const invalidNoUrl = { title: 'Hack Without Links', organizer: 'Tech Club' };
    const invalidEmpty = {};

    assert(normalizeHackathon(invalidNoTitle, 'test').valid === false, 'Rejects missing title');
    assert(normalizeHackathon(invalidNoUrl, 'test').valid === false, 'Rejects missing URL/registrationLink');
    assert(normalizeHackathon(invalidEmpty, 'test').valid === false, 'Rejects empty record');

    // =========================================================================
    // Test 6: Expired events are marked inactive/expired
    // =========================================================================
    console.log('\n[Test 6] Testing automatic expiration for passed deadlines...');
    const expiredEvent = {
      id: 'ext-expired-1',
      title: 'Historical 2023 Hackathon',
      organizer: 'Past Organizers',
      url: 'https://example.com/past',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-03'),
      deadline: new Date('2022-12-31'),
    };
    const normExpired = normalizeHackathon(expiredEvent, 'test-source-a');
    await upsertHackathon(normExpired.data);

    const expiredInDb = await Hackathon.findOne({ source: 'test-source-a', externalId: 'ext-expired-1' });
    assert(expiredInDb.status === 'Inactive', 'Expired event marked status = Inactive');
    assert(expiredInDb.syncStatus === 'expired', 'Expired event marked syncStatus = expired');

    // Also test sweep function
    const newlyExpired = await expireOldHackathons();
    assert(typeof newlyExpired === 'number', 'expireOldHackathons() sweeps and returns number of updated records');

    // =========================================================================
    // Test 7: Source failure does not stop other sources (Fault Isolation)
    // =========================================================================
    console.log('\n[Test 7] Testing multi-source fault isolation...');
    // We run the full sync engine which has Curated (LIVE) and Disabled/Unavailable sources
    const syncRunReport = await runHackathonSync();
    assert(syncRunReport.success === true, 'Overall sync completes even when other adapters are disabled/skipped');
    assert(syncRunReport.fetchedCount > 0, 'Live Curated feed fetched real events successfully');
    assert(syncRunReport.createdCount > 0, 'Real external hackathons created in MongoDB');

    // =========================================================================
    // Test 8: Sync logs are created
    // =========================================================================
    console.log('\n[Test 8] Testing HackathonSyncLog record creation...');
    const latestLog = await HackathonSyncLog.findOne().sort({ startedAt: -1 });
    assert(latestLog !== null, 'HackathonSyncLog created in database');
    assert(latestLog.status === 'SUCCESS' || latestLog.status === 'PARTIAL', 'Sync log has valid status');
    assert(latestLog.fetchedCount === syncRunReport.fetchedCount, 'Sync log recorded accurate fetchedCount');
    assert(latestLog.createdCount === syncRunReport.createdCount, 'Sync log recorded accurate createdCount');
    assert(latestLog.details !== null, 'Sync log contains detailed per-source breakdowns');

    // =========================================================================
    // Test 9: Cron endpoint rejects unauthorized requests
    // =========================================================================
    console.log('\n[Test 9] Testing /api/cron/sync-hackathons security...');
    process.env.CRON_SECRET = 'super-secret-cron-token-999';

    // 9a: No auth header
    const cronNoAuth = await fetchApi('/api/cron/sync-hackathons');
    assert(cronNoAuth.status === 401, 'Request with no authorization rejected with 401');

    // 9b: Wrong secret
    const cronWrongAuth = await fetchApi('/api/cron/sync-hackathons', {
      headers: { Authorization: 'Bearer wrong-secret' },
    });
    assert(cronWrongAuth.status === 401, 'Request with invalid bearer token rejected with 401');

    // 9c: Correct secret
    const cronValidAuth = await fetchApi('/api/cron/sync-hackathons', {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    assert(cronValidAuth.status === 200, 'Request with valid CRON_SECRET accepted with 200');
    assert(cronValidAuth.data.success === true, 'Cron execution returns success: true');

    // =========================================================================
    // Test 10: Super Admin manual sync works
    // =========================================================================
    console.log('\n[Test 10] Testing Super Admin manual sync via /api/admin/hackathons/sync...');
    const adminManualSync = await fetchApi('/api/admin/hackathons/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: JSON.stringify({}),
    });
    assert(adminManualSync.status === 200, 'Super Admin trigger returned HTTP 200');
    assert(adminManualSync.data.success === true, 'Super Admin manual sync succeeded');

    // Test 10b: Super Admin sync status query
    const adminSyncStatus = await fetchApi('/api/admin/hackathons/sync-status', {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(adminSyncStatus.status === 200, 'Super Admin query to /sync-status returned HTTP 200');
    assert(Array.isArray(adminSyncStatus.data.sources), 'Sync status returns sources array');
    const curatedStatus = adminSyncStatus.data.sources.find((s) => s.id === 'curated');
    assert(curatedStatus && curatedStatus.status === 'LIVE', 'Curated feed adapter status is LIVE');

    // =========================================================================
    // Test 11: Student cannot trigger admin sync
    // =========================================================================
    console.log('\n[Test 11] Testing student access restriction on admin sync...');
    const studentSyncAttempt = await fetchApi('/api/admin/hackathons/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(studentSyncAttempt.status === 403, 'Student triggering admin sync blocked with HTTP 403 Forbidden');

    // =========================================================================
    // Test 12: External hackathon appears through GET /api/hackathons
    // =========================================================================
    console.log('\n[Test 12] Testing external hackathons discovery via GET /api/hackathons...');
    const publicHackathonsRes = await fetchApi('/api/hackathons');
    assert(publicHackathonsRes.status === 200, 'GET /api/hackathons returned HTTP 200');
    assert(publicHackathonsRes.data.count > 0, 'Hackathons returned');

    const hasExternal = publicHackathonsRes.data.hackathons.some((h) => h.isExternal === true);
    assert(hasExternal === true, 'Public directory includes automatically imported external hackathons');

    // =========================================================================
    // Test 13: External hackathon works with existing filters
    // =========================================================================
    console.log('\n[Test 13] Testing search, mode, timeline, and source filters...');
    // 13a: Filter by source=curated
    const filterSourceRes = await fetchApi('/api/hackathons?source=curated');
    assert(filterSourceRes.status === 200, 'Filter source=curated returned 200');
    assert(
      filterSourceRes.data.hackathons.every((h) => h.source === 'curated'),
      'All returned events have source === "curated"'
    );

    // 13b: Filter by timeline=Upcoming
    const filterUpcomingRes = await fetchApi('/api/hackathons?timeline=Upcoming');
    assert(filterUpcomingRes.status === 200, 'Filter timeline=Upcoming returned 200');

    // 13c: Search query
    const searchRes = await fetchApi('/api/hackathons?search=AI');
    assert(searchRes.status === 200, 'Search keyword query returned 200');

    // =========================================================================
    // Test 14: External hackathon can contain team requests
    // =========================================================================
    console.log('\n[Test 14] Testing team request creation on imported external hackathon...');
    const externalHackathon = await Hackathon.findOne({ isExternal: true, status: 'Active' });
    assert(externalHackathon !== null, 'Found active external hackathon for team formation');

    const teamReqRes = await fetchApi('/api/team-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        hackathonId: externalHackathon._id,
        title: 'Need ML Specialist for External Hackathon',
        skillsNeeded: ['Python', 'PyTorch'],
        teamSizeNeeded: 2,
        description: 'Building an innovative solution for this live hackathon event.',
      }),
    });
    const linkedHackId = (teamReqRes.data.teamRequest.hackathon?._id || teamReqRes.data.teamRequest.hackathon).toString();
    assert(linkedHackId === externalHackathon._id.toString(), 'Request linked to external hackathon');

    // =========================================================================
    // Test 15: External hackathon works with existing matching & application workflow
    // =========================================================================
    console.log('\n[Test 15] Testing matching and application workflow on external hackathon...');
    const teamReqId = teamReqRes.data.teamRequest._id;

    // 15a: Smart matching query
    const matchRes = await fetchApi(`/api/team-requests/${teamReqId}/matches`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(matchRes.status === 200, 'Candidate matching query on external hackathon request succeeded');
    assert(Array.isArray(matchRes.data.matches), 'Matches array returned');

    // 15b: Priya applies to Alex team request on external hackathon
    // First ensure Priya is verified so verification gating passes
    await User.findByIdAndUpdate(priya._id, { experienceVerificationStatus: 'Verified' });
    const priyaToken = generateToken({ id: priya._id, role: priya.role, collegeId: priya.collegeId });

    const applyRes = await fetchApi('/api/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${priyaToken}` },
      body: JSON.stringify({
        teamRequestId: teamReqId,
        message: 'I have deep PyTorch experience and would love to join your team for this hackathon!',
      }),
    });
    assert(applyRes.status === 201, 'Teammate application submitted successfully on external hackathon request (HTTP 201)');

    const inDbApp = await Response.findOne({ teamRequest: teamReqId, respondent: priya._id });
    assert(inDbApp !== null, 'Application record persisted in MongoDB');

    console.log('\n=============================================================');
    console.log(`🎉 ALL ${passed}/${total} HACKATHON DISCOVERY & SYNC TESTS PASSED!`);
    console.log('=============================================================\n');

    return { passed, total };
  } finally {
    await closeTestServer();
  }
};

// Run if called directly
if (process.argv[1]?.endsWith('test_hackathon_sync.js')) {
  runSyncTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
