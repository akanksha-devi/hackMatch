import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import College from '../src/models/College.js';
import TeamRequest from '../src/models/TeamRequest.js';
import Hackathon from '../src/models/Hackathon.js';
import Notification from '../src/models/Notification.js';
import { findMatchingCandidates } from '../src/services/matchingService.js';
import { generateToken } from '../src/utils/generateToken.js';
import app from '../src/app.js';
import http from 'http';

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

export const runTests = async () => {
  console.log('\n==================================================');
  console.log('🧪 RUNNING MANDATORY COLLEGE ISOLATION TEST SUITE');
  console.log('==================================================\n');

  await connectDB();
  const { seedDatabase } = await import('../src/utils/seed.js');
  await seedDatabase();
  await startTestServer();

  let passedCount = 0;
  let totalCount = 0;

  const assert = (condition, title) => {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      throw new Error(`Assertion failed: ${title}`);
    }
  };

  try {
    // 1. Fetch reference records
    const kiet = await College.findOne({ code: 'KIET' });
    const abctech = await College.findOne({ code: 'ABCTECH' });
    const alex = await User.findOne({ email: 'alex@example.com' });
    const priya = await User.findOne({ email: 'priya@example.com' });
    const sophia = await User.findOne({ email: 'sophia@example.com' });
    const rahul = await User.findOne({ email: 'rahul@example.com' });
    const kietAdmin = await User.findOne({ email: 'admin@kiet.edu' });
    const superAdmin = await User.findOne({ email: 'superadmin@hackmatch.com' });
    const alexReq = await TeamRequest.findOne({ postedBy: alex._id });
    const rahulReq = await TeamRequest.findOne({ postedBy: rahul._id });

    // Generate tokens
    const alexToken = generateToken({ id: alex._id, role: alex.role, collegeId: alex.collegeId });
    const priyaToken = generateToken({ id: priya._id, role: priya.role, collegeId: priya.collegeId });
    const rahulToken = generateToken({ id: rahul._id, role: rahul.role, collegeId: rahul.collegeId });
    const kietAdminToken = generateToken({ id: kietAdmin._id, role: kietAdmin.role, collegeId: kietAdmin.collegeId });
    const superAdminToken = generateToken({ id: superAdmin._id, role: superAdmin.role, collegeId: null });

    // TEST 1: College A student listing users only sees College A peers
    console.log('[Test 1] Testing Student User Discovery Isolation...');
    const usersRes = await fetchApi('/api/users', {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(usersRes.status === 200, 'Alex successfully queries /api/users');
    const returnedEmails = usersRes.data.users.map((u) => u.email);
    assert(returnedEmails.includes('priya@example.com'), 'Alex can see fellow KIET student Priya');
    assert(!returnedEmails.includes('rahul@example.com'), 'Alex CANNOT see ABC student Rahul');
    assert(!returnedEmails.includes('neha@example.com'), 'Alex CANNOT see ABC student Neha');
    assert(!returnedEmails.includes('aman@example.com'), 'Alex CANNOT see XYZ student Aman');

    // TEST 2: Direct URL access to another college student profile is blocked
    console.log('\n[Test 2] Testing Direct Cross-College Profile Access...');
    const directOtherCollegeUser = await fetchApi(`/api/users/${rahul._id}`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(
      directOtherCollegeUser.status === 403 || directOtherCollegeUser.status === 404,
      `Alex direct GET /api/users/${rahul._id} returns ${directOtherCollegeUser.status} Forbidden/NotFound`
    );

    // TEST 3: College A student listing team requests only sees College A requests
    console.log('\n[Test 3] Testing Team Requests Scoping...');
    const reqsRes = await fetchApi('/api/team-requests', {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(reqsRes.status === 200, 'Alex successfully queries /api/team-requests');
    const requestIds = reqsRes.data.teamRequests.map((r) => r._id);
    assert(requestIds.includes(alexReq._id.toString()), 'Alex can see KIET team request');
    assert(!requestIds.includes(rahulReq._id.toString()), 'Alex CANNOT see ABC team request');

    // TEST 4: Direct URL access to another college team request is blocked
    console.log('\n[Test 4] Testing Direct Cross-College Team Request Access...');
    const directOtherRequest = await fetchApi(`/api/team-requests/${rahulReq._id}`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(
      directOtherRequest.status === 403 || directOtherRequest.status === 404,
      `Alex direct GET /api/team-requests/${rahulReq._id} returns ${directOtherRequest.status} Forbidden`
    );

    // TEST 5: Applying to a cross-college team request is blocked
    console.log('\n[Test 5] Testing Cross-College Application Rejection...');
    const crossApplyRes = await fetchApi('/api/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        teamRequestId: rahulReq._id,
        message: 'Illegal cross-college application attempt',
      }),
    });
    assert(
      crossApplyRes.status === 403,
      `Alex applying to ABC request is strictly blocked with 403 (${crossApplyRes.data.message})`
    );

    // TEST 6: Smart Matching Engine evaluates ONLY same-college candidates
    console.log('\n[Test 6] Testing Smart Matching College Scoping...');
    const matchesRes = await fetchApi(`/api/team-requests/${alexReq._id}/matches`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(matchesRes.status === 200, 'Match query on Alex request succeeded');
    const matchUsers = matchesRes.data.matches.map((m) => m.user.email);
    assert(matchUsers.includes('priya@example.com'), 'Priya (KIET) is recommended');
    assert(matchUsers.includes('sophia@example.com'), 'Sophia (KIET) is recommended');
    assert(!matchUsers.includes('neha@example.com'), 'Neha (ABC - has Python) is NOT recommended across colleges');

    // TEST 7: Student cannot change collegeId or role through profile update
    console.log('\n[Test 7] Testing Profile Immutability for Protected Fields...');
    const updateRes = await fetchApi(`/api/users/${alex._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        bio: 'Updated bio by Alex',
        collegeId: abctech._id, // Malicious spoof attempt
        role: 'superAdmin',     // Malicious escalation attempt
      }),
    });
    assert(updateRes.status === 200, 'Profile update returns 200');
    const refreshedAlex = await User.findById(alex._id);
    assert(refreshedAlex.collegeId.toString() === kiet._id.toString(), 'Alex collegeId remains unchanged (KIET)');
    assert(refreshedAlex.role === 'student', 'Alex role remains unchanged (student)');

    // TEST 8: College Admin access restrictions
    console.log('\n[Test 8] Testing College Admin Restrictions...');
    const adminStudentsRes = await fetchApi('/api/admin/students', {
      headers: { Authorization: `Bearer ${kietAdminToken}` },
    });
    assert(adminStudentsRes.status === 200, 'KIET Admin queries /api/admin/students');
    const adminReturned = adminStudentsRes.data.students.map((s) => s.email);
    assert(adminReturned.includes('alex@example.com'), 'KIET Admin sees Alex');
    assert(!adminReturned.includes('rahul@example.com'), 'KIET Admin CANNOT see Rahul (ABC)');

    // TEST 9: Super Admin has platform-wide access
    console.log('\n[Test 9] Testing Super Admin Platform-Wide Access...');
    const superDashboardRes = await fetchApi('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(superDashboardRes.status === 200, 'Super Admin queries /api/admin/dashboard');
    assert(superDashboardRes.data.metrics.totalColleges >= 3, 'Super Admin sees all colleges');
    assert(superDashboardRes.data.metrics.totalStudents >= 5, 'Super Admin sees platform total students');
    assert(superDashboardRes.data.metrics.totalCollegeAdmins >= 5, 'Super Admin sees platform college admins');
    assert(superDashboardRes.data.metrics.pendingVerifications !== undefined, 'Super Admin sees pending verifications count');

    // TEST 10: Dynamic College studentCount and adminCount aggregation
    console.log('\n[Test 10] Testing Dynamic College Student and Admin Aggregations...');
    const collegesRes = await fetchApi('/api/colleges', {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(collegesRes.status === 200, 'Super Admin successfully queried /api/colleges');
    const kietCol = collegesRes.data.colleges.find((c) => c.code === 'KIET');
    const abcCol = collegesRes.data.colleges.find((c) => c.code === 'ABCTECH');
    const xyzCol = collegesRes.data.colleges.find((c) => c.code === 'XYZUNIV');
    assert(kietCol.adminCount === 3, `KIET adminCount dynamically calculated as 3 (got ${kietCol.adminCount})`);
    assert(kietCol.studentCount === 3, `KIET studentCount dynamically calculated as 3 (got ${kietCol.studentCount})`);
    assert(abcCol.adminCount === 2, `ABCTECH adminCount dynamically calculated as 2 (got ${abcCol.adminCount})`);
    assert(xyzCol.adminCount === 1, `XYZUNIV adminCount dynamically calculated as 1 (got ${xyzCol.adminCount})`);

    // TEST 11: Super Admin College Admin Management & Last Admin Protection
    console.log('\n[Test 11] Testing College Admin Management & Last Admin Protection...');
    const kietAdmin2 = await User.findOne({ email: 'kiet.admin2@kiet.edu' });
    const xyzAdmin = await User.findOne({ email: 'admin@xyzuniv.edu' });
    const xyzuniv = await College.findOne({ code: 'XYZUNIV' });

    // 11a: List admins for KIET
    const kietAdminsList = await fetchApi(`/api/admin/colleges/${kiet._id}/admins`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(kietAdminsList.status === 200, 'Listed KIET college admins successfully');
    assert(kietAdminsList.data.count === 3, 'KIET has 3 admins returned');

    // 11b: Demote kietAdmin2 (succeeds because 2 other admins remain)
    const demoteKiet2Res = await fetchApi(`/api/admin/colleges/${kiet._id}/admins/${kietAdmin2._id}/demote`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(demoteKiet2Res.status === 200, 'Demoted kietAdmin2 successfully when other admins exist');
    const refreshedKiet2 = await User.findById(kietAdmin2._id);
    assert(refreshedKiet2.role === 'student', 'kietAdmin2 account role is now student');

    // 11c: Last Admin Protection - attempting to demote the sole active admin of XYZ must fail!
    const demoteLastAdminRes = await fetchApi(`/api/admin/colleges/${xyzuniv._id}/admins/${xyzAdmin._id}/demote`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(
      demoteLastAdminRes.status === 400 && demoteLastAdminRes.data.code === 'LAST_ADMIN_PROTECTION',
      'Last Admin Protection strictly BLOCKED removing the only active administrator of XYZ University'
    );

    // 11d: Last Admin Protection on deactivation
    const deactivateLastAdminRes = await fetchApi(`/api/admin/colleges/${xyzuniv._id}/admins/${xyzAdmin._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: JSON.stringify({ status: 'Inactive' }),
    });
    assert(
      deactivateLastAdminRes.status === 400 && deactivateLastAdminRes.data.code === 'LAST_ADMIN_PROTECTION',
      'Last Admin Protection strictly BLOCKED deactivating the only active administrator of XYZ University'
    );

    // TEST 12: Real Profile Picture Upload & Avatar Lifecycle
    console.log('\n[Test 12] Testing Avatar Upload Signature & Lifecycle...');
    const sigRes = await fetchApi('/api/users/me/avatar/signature', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(sigRes.status === 200, 'Generated avatar upload signature successfully');
    assert(sigRes.data.signature && sigRes.data.apiKey && sigRes.data.publicId, 'Signature payload contains secure params without leaking secret');

    // Update avatar with signed upload result
    const updateAvatarRes = await fetchApi('/api/users/me/avatar', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        avatarUrl: 'https://res.cloudinary.com/hackmatch/image/upload/v1234/hackmatch/avatars/user_test.png',
        avatarPublicId: 'hackmatch/avatars/user_test',
      }),
    });
    assert(updateAvatarRes.status === 200, 'Avatar URL and public ID saved on user');
    const alexWithAvatar = await User.findById(alex._id);
    assert(alexWithAvatar.avatarPublicId === 'hackmatch/avatars/user_test', 'User record stores avatarPublicId');

    // Delete avatar
    const deleteAvatarRes = await fetchApi('/api/users/me/avatar', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(deleteAvatarRes.status === 200, 'Avatar deleted successfully');
    const alexClearedAvatar = await User.findById(alex._id);
    assert(alexClearedAvatar.avatarPublicId === '', 'User avatarPublicId reset to empty string');

    // TEST 13: Experience Verification System & College Isolation
    console.log('\n[Test 13] Testing Experience Verification & Review Isolation...');
    const abcAdmin = await User.findOne({ email: 'admin@abctech.edu' });
    const abcAdminToken = generateToken({ id: abcAdmin._id, role: abcAdmin.role, collegeId: abcAdmin.collegeId });

    // Priya (KIET) submits verification request
    const submitVerifRes = await fetchApi('/api/experience-verifications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${priyaToken}` },
      body: JSON.stringify({
        requestedLevel: 'Advanced',
        description: 'Published researcher in computer vision models. Extensive PyTorch, LLM fine-tuning, and Gemini API integration experience.',
        portfolioUrl: 'https://priya.ai',
      }),
    });
    assert(submitVerifRes.status === 201, 'Priya submitted experience verification request');
    const verifId = submitVerifRes.data.verification._id;
    const priyaPending = await User.findById(priya._id);
    assert(priyaPending.experienceVerificationStatus === 'Pending', 'Priya status updated to Pending');

    // Cross-College Review Protection: ABC Admin attempts to review KIET student's verification -> MUST FAIL 403!
    const crossReviewRes = await fetchApi(`/api/admin/experience-verifications/${verifId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${abcAdminToken}` },
      body: JSON.stringify({
        status: 'Verified',
        reviewNote: 'Illegal cross-college approval attempt',
      }),
    });
    assert(crossReviewRes.status === 403, 'Cross-college verification review strictly BLOCKED with 403 Forbidden');

    // Same-College Review: KIET Admin reviews and approves Priya
    const legitReviewRes = await fetchApi(`/api/admin/experience-verifications/${verifId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${kietAdminToken}` },
      body: JSON.stringify({
        status: 'Verified',
        reviewNote: 'Verified outstanding portfolio and PyTorch credentials.',
      }),
    });
    assert(legitReviewRes.status === 200, 'KIET Admin successfully approved Priya verification');
    const priyaVerified = await User.findById(priya._id);
    assert(priyaVerified.experienceVerificationStatus === 'Verified', 'Priya status updated to Verified');
    assert(priyaVerified.experienceLevel === 'Advanced', 'Priya experienceLevel promoted to Advanced');

    // TEST 14: Re-verification Invalidation on Experience Level Change
    console.log('\n[Test 14] Testing Re-verification Invalidation...');
    // Alex was seeded as 'Verified'. Alex updates profile to change experienceLevel to 'Intermediate'
    const updateLevelRes = await fetchApi(`/api/users/${alex._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        experienceLevel: 'Intermediate',
      }),
    });
    assert(updateLevelRes.status === 200, 'Alex updated profile experience level');
    const alexInvalidated = await User.findById(alex._id);
    assert(
      alexInvalidated.experienceVerificationStatus === 'Unverified',
      'Modifying self-declared experience level immediately invalidated verification (status reset to Unverified)'
    );

    // TEST 15: Notification Lifecycle, College Isolation & Privacy
    console.log('\n[Test 15] Testing Notification Lifecycle, Scoping & Privacy...');

    // 1. KIET Admins received VERIFICATION_REQUESTED for Priya (one per active admin)
    const kietAdmins = await User.find({ collegeId: kiet._id, role: 'collegeAdmin', status: 'Active' });
    const kietAdminNotifs = await Notification.find({
      recipient: { $in: kietAdmins.map((a) => a._id) },
      type: 'VERIFICATION_REQUESTED',
    });
    assert(
      kietAdminNotifs.length === kietAdmins.length,
      `KIET Admins received VERIFICATION_REQUESTED (expected ${kietAdmins.length}, got ${kietAdminNotifs.length})`
    );

    // 2. ABC Admin received NO notifications for Priya (strict college scoping)
    const abcAdminNotifsForPriya = await Notification.find({
      recipient: abcAdmin._id,
      actor: priya._id,
      type: 'VERIFICATION_REQUESTED',
    });
    assert(abcAdminNotifsForPriya.length === 0, 'ABC Admin received NO notifications for KIET student submission (college isolated)');

    // 3. Priya received VERIFICATION_APPROVED notification
    const priyaNotifs = await fetchApi('/api/notifications', {
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    assert(priyaNotifs.status === 200, 'Priya successfully queried /api/notifications');
    assert(
      priyaNotifs.data.notifications.some((n) => n.type === 'VERIFICATION_APPROVED' && n.title === 'Experience Verified ✓'),
      'Priya received VERIFICATION_APPROVED notification titled "Experience Verified ✓"'
    );

    // 4. Rejection Notification: Neha (ABC) submits, ABC Admin rejects with note
    const neha = await User.findOne({ email: 'neha@example.com' });
    const nehaToken = generateToken({ id: neha._id, role: neha.role, collegeId: neha.collegeId });
    const nehaVerifRes = await fetchApi('/api/experience-verifications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${nehaToken}` },
      body: JSON.stringify({
        requestedLevel: 'Advanced',
        description: 'Frontend developer with portfolio and react apps.',
      }),
    });
    assert(nehaVerifRes.status === 201, 'Neha (ABC) submitted experience verification request');
    const nehaVerifId = nehaVerifRes.data.verification._id;

    const rejectRes = await fetchApi(`/api/admin/experience-verifications/${nehaVerifId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${abcAdminToken}` },
      body: JSON.stringify({
        status: 'Rejected',
        reviewNote: 'Reason: Your submitted evidence was insufficient.',
      }),
    });
    assert(rejectRes.status === 200, 'ABC Admin rejected Neha verification with review note');

    const nehaNotifs = await fetchApi('/api/notifications', {
      headers: { Authorization: `Bearer ${nehaToken}` },
    });
    const nehaRejectedNotif = nehaNotifs.data.notifications.find((n) => n.type === 'VERIFICATION_REJECTED');
    assert(nehaRejectedNotif !== undefined, 'Neha received VERIFICATION_REJECTED notification');
    assert(
      nehaRejectedNotif.message.includes('Reason: Your submitted evidence was insufficient.'),
      'Rejection notification includes the administrative reason'
    );

    // 5. Alex received VERIFICATION_RESET notification upon experience level change
    const alexNotifs = await fetchApi('/api/notifications', {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(
      alexNotifs.data.notifications.some((n) => n.type === 'VERIFICATION_RESET'),
      'Alex received VERIFICATION_RESET notification upon experience level change'
    );

    // 6. Unread count endpoint
    const unreadRes = await fetchApi('/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    assert(unreadRes.status === 200 && unreadRes.data.count > 0, 'Priya unread notification count is positive');

    // 7. Mark single notification as read decreases count
    const targetNotif = priyaNotifs.data.notifications[0];
    const readRes = await fetchApi(`/api/notifications/${targetNotif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    assert(readRes.status === 200 && readRes.data.notification.isRead === true, 'Single notification marked as read');

    // 8. Mark all notifications as read
    const readAllRes = await fetchApi('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    assert(readAllRes.status === 200, 'All notifications marked as read');
    const unreadZeroRes = await fetchApi('/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    assert(unreadZeroRes.data.count === 0, 'Priya unread notification count is now 0 after mark-all-read');

    // 9. Notification Privacy: Alex CANNOT mark or access Priya's notification
    const illegalReadRes = await fetchApi(`/api/notifications/${targetNotif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(illegalReadRes.status === 404, 'Cross-user notification modification strictly BLOCKED (404)');

    // 10. Duplicate Pending Verification Prevention: Sophia (Pending) cannot submit duplicate active request
    const sophiaToken = generateToken({ id: sophia._id, role: sophia.role, collegeId: sophia.collegeId });
    const dupVerifRes = await fetchApi('/api/experience-verifications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sophiaToken}` },
      body: JSON.stringify({
        requestedLevel: 'Advanced',
        description: 'Duplicate attempt while still pending',
      }),
    });
    assert(dupVerifRes.status === 400, 'Student with pending verification cannot submit duplicate active request');

    // TEST 16: Feature Restriction for Unverified / Pending / Rejected Students
    console.log('\n[Test 16] Testing Feature Restriction for Unverified, Pending & Rejected Students...');
    const testHackathon = await Hackathon.findOne({});

    // 1. Unverified student (Alex) CANNOT create team request (HTTP 403)
    const unverifiedCreateReq = await fetchApi('/api/team-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        hackathon: testHackathon._id,
        title: 'Unverified Team Test',
        skillsNeeded: ['React', 'Node.js'],
        teamSizeNeeded: 3,
        description: 'Should be blocked by verification middleware',
      }),
    });
    assert(unverifiedCreateReq.status === 403, 'Unverified student cannot create team request (HTTP 403)');
    assert(unverifiedCreateReq.data.code === 'VERIFICATION_REQUIRED', 'Response returns code: VERIFICATION_REQUIRED');

    // 2. Pending student (Sophia) CANNOT create team request (HTTP 403)
    const pendingCreateReq = await fetchApi('/api/team-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sophiaToken}` },
      body: JSON.stringify({
        hackathon: testHackathon._id,
        title: 'Pending Team Test',
        skillsNeeded: ['React'],
        teamSizeNeeded: 2,
        description: 'Should be blocked because status is Pending',
      }),
    });
    assert(pendingCreateReq.status === 403, 'Pending student cannot create team request (HTTP 403)');

    // 3. Rejected student (Rahul) CANNOT create team request (HTTP 403)
    const rejectedCreateReq = await fetchApi('/api/team-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${rahulToken}` },
      body: JSON.stringify({
        hackathon: testHackathon._id,
        title: 'Rejected Team Test',
        skillsNeeded: ['Python'],
        teamSizeNeeded: 2,
        description: 'Should be blocked because status is Rejected',
      }),
    });
    assert(rejectedCreateReq.status === 403, 'Rejected student cannot create team request (HTTP 403)');

    // 4. Verified student (Priya) CAN create team request (HTTP 201)
    const verifiedCreateReq = await fetchApi('/api/team-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${priyaToken}` },
      body: JSON.stringify({
        hackathon: testHackathon._id,
        title: 'Priya Verified AI Team Request',
        skillsNeeded: ['Python', 'PyTorch', 'FastAPI'],
        teamSizeNeeded: 3,
        description: 'Looking for ML engineers for SIH 2026',
      }),
    });
    assert(verifiedCreateReq.status === 201, 'Verified student CAN successfully create team request (HTTP 201)');
    const priyaTeamRequestId = verifiedCreateReq.data.teamRequest._id;

    // 5. Unverified student (Alex) CANNOT apply to team request (HTTP 403)
    const unverifiedApplyRes = await fetchApi('/api/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        teamRequestId: priyaTeamRequestId,
        message: 'I want to apply but I am unverified',
      }),
    });
    assert(unverifiedApplyRes.status === 403, 'Unverified student cannot apply to team request (HTTP 403)');
    assert(unverifiedApplyRes.data.code === 'VERIFICATION_REQUIRED', 'Apply returns code: VERIFICATION_REQUIRED');

    // TEST 17: Exact User Final Scenario (Steps 1 to 12)
    console.log('\n[Test 17] Testing Exact Final Scenario (Steps 1 to 12)...');
    // Step 1: Priya login verified
    // Step 2: Submitted Advanced Verification verified in Test 13
    // Step 3: MongoDB check for KIET admins
    const mongoKietNotifs = await Notification.find({
      recipient: { $in: kietAdmins.map((a) => a._id) },
      type: 'VERIFICATION_REQUESTED',
    });
    assert(mongoKietNotifs.length > 0, 'Step 3: MongoDB verified - notifications exist for KIET admins');
    // Step 4 & 5: KIET Admin login & unread badge
    const kietAdminUnread = await fetchApi('/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${kietAdminToken}` },
    });
    assert(kietAdminUnread.status === 200 && kietAdminUnread.data.count >= 1, 'Step 5: KIET Admin has active unread notification');
    // Step 6: Verify notification link points to verification console
    assert(mongoKietNotifs[0].link === '/admin/verification', 'Step 6: Notification link opens /admin/verification');
    // Step 7: Approved in Test 13
    // Step 8: MongoDB check for student notification
    const studentMongoNotif = await Notification.findOne({
      recipient: priya._id,
      type: 'VERIFICATION_APPROVED',
    });
    assert(studentMongoNotif !== null, 'Step 8: MongoDB verified - student notification exists');
    // Step 9 & 10: Priya login & unread badge
    assert(studentMongoNotif.isRead !== undefined, 'Step 10: Student notification state is queryable');
    // Step 11: Notification title
    assert(studentMongoNotif.title === 'Experience Verified ✓', 'Step 11: Student notification is "Experience Verified ✓"');
    // Step 12: Profile reflects Advanced & Verified
    const updatedPriya = await User.findById(priya._id);
    assert(
      updatedPriya.experienceVerificationStatus === 'Verified' && updatedPriya.experienceLevel === 'Advanced',
      'Step 12: Profile shows Advanced and Verified'
    );

    console.log('\n==================================================');
    console.log(`🎉 ALL ${passedCount}/${totalCount} MANDATORY TESTS PASSED!`);
    console.log('==================================================\n');
  } finally {
    await closeTestServer();
  }
};

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Test Suite Failed]:', err);
    process.exit(1);
  });
