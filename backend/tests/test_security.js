import dotenv from 'dotenv';
import http from 'http';
import assert from 'assert';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import College from '../src/models/College.js';
import Hackathon from '../src/models/Hackathon.js';
import TeamRequest from '../src/models/TeamRequest.js';
import { generateToken } from '../src/utils/generateToken.js';
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
  return { status: res.status, ok: res.ok, headers: res.headers, data };
};

export const runSecurityTests = async () => {
  console.log('\n==================================================');
  console.log('🛡️  RUNNING HACKMATCH PRODUCTION SECURITY TEST SUITE');
  console.log('==================================================\n');

  await connectDB();
  const { seedDatabase } = await import('../src/utils/seed.js');
  await seedDatabase();
  await startTestServer();

  let passedCount = 0;
  let totalCount = 0;

  const testAssert = (cond, msg) => {
    totalCount++;
    if (cond) {
      passedCount++;
      console.log(`  ✅ [PASS] ${msg}`);
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      throw new Error(`Security Test Assertion Failed: ${msg}`);
    }
  };

  try {
    // Retrieve seeded entities
    const colleges = await College.find();
    const collegeA = colleges[0];
    const collegeB = colleges[1];

    const studentA = await User.findOne({ email: 'alex@example.com', role: 'student' });
    const studentB = await User.findOne({ email: 'rahul@example.com', role: 'student' });
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    const collegeAAdmin = await User.findOne({ collegeId: collegeA._id, role: 'collegeAdmin' });

    const tokenStudentA = generateToken({ id: studentA._id, role: studentA.role, collegeId: studentA.collegeId });
    const tokenStudentB = generateToken({ id: studentB._id, role: studentB.role, collegeId: studentB.collegeId });
    const tokenSuperAdmin = generateToken({ id: superAdmin._id, role: superAdmin.role });
    const tokenCollegeAAdmin = generateToken({ id: collegeAAdmin._id, role: collegeAAdmin.role, collegeId: collegeAAdmin.collegeId });

    // =========================================================================
    // Security Test 1: Standard OWASP Security Headers & CORS Protection
    // =========================================================================
    console.log('\n[Security 1] Testing HTTP Security Headers and CORS Policy...');
    const healthRes = await fetchApi('/api/health');
    testAssert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff header is set');
    testAssert(healthRes.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options: DENY header is set');
    testAssert(healthRes.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy header is set');

    const corsRes = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Origin: 'https://malicious-phishing-site.com' },
    });
    testAssert(!corsRes.headers.get('access-control-allow-origin'), 'Disallowed foreign origin blocked by CORS');

    // =========================================================================
    // Security Test 2: ReDoS & Regex Injection Resistance across Search Queries
    // =========================================================================
    console.log('\n[Security 2] Testing ReDoS & Malformed Regex Injection Resistance...');
    const malformedRegexInputs = ['[unclosed', '(*+', '+', '((a+)+)+$'];

    for (const badPattern of malformedRegexInputs) {
      // 2a: Users query
      const userRes = await fetchApi(`/api/users?search=${encodeURIComponent(badPattern)}&skill=${encodeURIComponent(badPattern)}`, {
        headers: { Authorization: `Bearer ${tokenStudentA}` },
      });
      testAssert(userRes.status === 200, `GET /api/users safely handles regex "${badPattern}" (Status 200, no 500 crash)`);

      // 2b: Hackathons query
      const hackRes = await fetchApi(`/api/hackathons?search=${encodeURIComponent(badPattern)}&tag=${encodeURIComponent(badPattern)}`);
      testAssert(hackRes.status === 200, `GET /api/hackathons safely handles regex "${badPattern}" (Status 200, no 500 crash)`);

      // 2c: Team requests query
      const trRes = await fetchApi(`/api/team-requests?skill=${encodeURIComponent(badPattern)}`, {
        headers: { Authorization: `Bearer ${tokenStudentA}` },
      });
      testAssert(trRes.status === 200, `GET /api/team-requests safely handles regex "${badPattern}" (Status 200, no 500 crash)`);

      // 2d: Colleges query
      const colRes = await fetchApi(`/api/colleges?search=${encodeURIComponent(badPattern)}`);
      testAssert(colRes.status === 200, `GET /api/colleges safely handles regex "${badPattern}" (Status 200, no 500 crash)`);

      // 2e: Admin students query
      const adminStuRes = await fetchApi(`/api/admin/students?search=${encodeURIComponent(badPattern)}`, {
        headers: { Authorization: `Bearer ${tokenCollegeAAdmin}` },
      });
      testAssert(adminStuRes.status === 200, `GET /api/admin/students safely handles regex "${badPattern}" (Status 200, no 500 crash)`);
    }

    // =========================================================================
    // Security Test 3: Hackathon Mass Assignment & BOLA Protection
    // =========================================================================
    console.log('\n[Security 3] Testing Hackathon Update Mass-Assignment Protection...');
    // Create a hackathon authored by studentA
    const createHackRes = await fetchApi('/api/hackathons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudentA}` },
      body: JSON.stringify({
        title: 'Security Hackathon Alpha',
        description: 'Test event for security verification',
        organizer: 'KIET Student Chapter',
        mode: 'Online',
        visibility: 'Global', // Non-superAdmin attempt to make global!
      }),
    });
    testAssert(createHackRes.status === 201, 'Hackathon created by student');
    testAssert(createHackRes.data.hackathon.visibility === 'College', 'Non-superAdmin cannot force Global visibility (forced to College)');
    testAssert(createHackRes.data.hackathon.collegeId._id.toString() === collegeA._id.toString(), 'Hackathon collegeId strictly bound to student college');

    const createdHackId = createHackRes.data.hackathon._id;

    // Student A attempts mass assignment to overwrite protected fields
    const massAssignRes = await fetchApi(`/api/hackathons/${createdHackId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenStudentA}` },
      body: JSON.stringify({
        title: 'Security Hackathon Alpha (Legit Update)',
        collegeId: collegeB._id.toString(), // Attempted college tampering
        isExternal: true, // Attempted external sync impersonation
        source: 'curated',
        postedBy: studentB._id.toString(), // Attempted ownership transfer
        syncStatus: 'expired',
      }),
    });
    testAssert(massAssignRes.status === 200, 'Legitimate fields in hackathon update accepted');

    // Verify in database that protected fields were NOT modified
    const dbHack = await Hackathon.findById(createdHackId);
    testAssert(dbHack.title === 'Security Hackathon Alpha (Legit Update)', 'Allowed title field was updated');
    testAssert(dbHack.collegeId.toString() === collegeA._id.toString(), 'Mass-assignment attack on collegeId was blocked');
    testAssert(dbHack.isExternal === false, 'Mass-assignment attack on isExternal was blocked');
    testAssert(dbHack.postedBy.toString() === studentA._id.toString(), 'Mass-assignment attack on postedBy was blocked');

    // =========================================================================
    // Security Test 4: Cross-College Hackathon Linkage Prevention in Team Requests
    // =========================================================================
    console.log('\n[Security 4] Testing Cross-College Hackathon Linkage Prevention...');
    // Create College B-specific hackathon using SuperAdmin
    const collegeBHack = await Hackathon.create({
      title: 'College B Private Hackathon',
      visibility: 'College',
      collegeId: collegeB._id,
      postedBy: superAdmin._id,
      status: 'Active',
    });

    // Student A (from College A, verified) attempts to link College B's private hackathon
    // First make Student A verified to pass requireVerifiedStudent
    await User.findByIdAndUpdate(studentA._id, { experienceVerificationStatus: 'Verified' });

    const crossLinkRes = await fetchApi('/api/team-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudentA}` },
      body: JSON.stringify({
        hackathon: collegeBHack._id,
        title: 'Cross-College Infiltrator Team',
        skillsNeeded: ['React', 'Node.js'],
      }),
    });
    testAssert(crossLinkRes.status === 403, 'Cross-college hackathon linkage blocked with HTTP 403 Forbidden');

    // =========================================================================
    // Security Test 5: SuperAdmin Profile Lookup Crash & Leak Prevention
    // =========================================================================
    console.log('\n[Security 5] Testing SuperAdmin Profile Lookup by Student...');
    const superAdminProfileRes = await fetchApi(`/api/users/${superAdmin._id}`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` },
    });
    testAssert(superAdminProfileRes.status === 403, 'Student viewing SuperAdmin profile blocked with HTTP 403 (no 500 TypeError crash)');

    // =========================================================================
    // Security Test 6: Cloudinary Avatar Asset IDOR Prevention
    // =========================================================================
    console.log('\n[Security 6] Testing Cloudinary Avatar IDOR Tampering...');
    const idorAvatarRes = await fetchApi('/api/users/me/avatar', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenStudentA}` },
      body: JSON.stringify({
        avatarUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        avatarPublicId: `user_${studentB._id}_stolen_asset_12345`, // Attacker sets victim asset ID
      }),
    });
    testAssert(idorAvatarRes.status === 400, 'Tampered avatarPublicId for another user rejected with HTTP 400');

    // Valid own avatar ID succeeds
    const validAvatarRes = await fetchApi('/api/users/me/avatar', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenStudentA}` },
      body: JSON.stringify({
        avatarUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        avatarPublicId: `user_${studentA._id}_legit_asset_12345`,
      }),
    });
    testAssert(validAvatarRes.status === 200, 'Owned avatarPublicId accepted with HTTP 200');

    // =========================================================================
    // Security Test 7: NoSQL Injection / Type Confusion on Authentication
    // =========================================================================
    console.log('\n[Security 7] Testing NoSQL Type Confusion on Authentication...');
    // Object injected into email
    const nosqlLoginRes = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: { $ne: null },
        password: 'password123',
      }),
    });
    testAssert(nosqlLoginRes.status === 400, 'NoSQL object in email rejected with HTTP 400');

    // Object injected into password
    const nosqlLoginPwRes = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex@example.com',
        password: { $gt: '' },
      }),
    });
    testAssert(nosqlLoginPwRes.status === 400, 'NoSQL object in password rejected with HTTP 400');

    // Excessive password length rejection
    const longPassword = 'A'.repeat(200);
    const longPwLoginRes = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex@example.com',
        password: longPassword,
      }),
    });
    testAssert(longPwLoginRes.status === 400, 'Excessive password length (>128 chars) rejected with HTTP 400');

    // =========================================================================
    // Security Test 8: Timing-Safe Cron Authorization
    // =========================================================================
    console.log('\n[Security 8] Testing Timing-Safe CRON_SECRET Enforcement...');
    process.env.CRON_SECRET = 'hackmatch-prod-audit-secret-token-321';

    const cronInvalidRes = await fetchApi('/api/cron/sync-hackathons', {
      headers: { Authorization: 'Bearer invalid-token-attempt' },
    });
    testAssert(cronInvalidRes.status === 401, 'Invalid cron token rejected with HTTP 401');

    const cronValidRes = await fetchApi('/api/cron/sync-hackathons', {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    testAssert(cronValidRes.status === 200, 'Valid cron secret accepted with HTTP 200');

    // =========================================================================
    // Security Test 9: Student Status Enumeration Validation
    // =========================================================================
    console.log('\n[Security 9] Testing Admin Student Status Input Validation...');
    const invalidStatusRes = await fetchApi(`/api/admin/students/${studentA._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
      body: JSON.stringify({ status: 'BypassedStatus' }),
    });
    testAssert(invalidStatusRes.status === 400, 'Invalid student status rejected with HTTP 400');

    console.log(`\n=============================================================`);
    console.log(`🎉 ALL ${passedCount}/${totalCount} PRODUCTION SECURITY TESTS PASSED!`);
    console.log(`=============================================================\n`);
  } finally {
    await closeTestServer();
  }
};

// Auto-run if executed directly
if (process.argv[1]?.endsWith('test_security.js')) {
  runSecurityTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Security test failed:', err);
      process.exit(1);
    });
}
