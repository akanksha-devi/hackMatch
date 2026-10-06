import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import College from '../src/models/College.js';
import TeamRequest from '../src/models/TeamRequest.js';
import Hackathon from '../src/models/Hackathon.js';
import Notification from '../src/models/Notification.js';
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

export const runSearchTests = async () => {
  console.log('\n==================================================');
  console.log('🔍 RUNNING UNIVERSAL SEARCH & TENANT ISOLATION TESTS');
  console.log('==================================================\n');

  await connectDB();
  const { seedDatabase } = await import('../src/utils/seed.js');
  await seedDatabase();
  await startTestServer();

  let passed = 0;
  let total = 0;

  const assert = (condition, message) => {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  };

  try {
    // 1. Unauthenticated search request must be rejected
    const unauthRes = await fetchApi('/api/search?q=test');
    assert(unauthRes.status === 401, 'Unauthenticated search rejected with 401');

    // Retrieve seed users from College 1 (KIET) and College 2 (ABCTECH)
    const college1 = await College.findOne({ code: 'KIET' });
    const college2 = await College.findOne({ code: 'ABCTECH' });

    assert(college1 && college2, 'Found test colleges KIET and ABCTECH');

    const studentCol1 = await User.findOne({ email: 'alex@example.com' });
    const studentCol2 = await User.findOne({ email: 'rahul@example.com' });
    const superAdmin = await User.findOne({ email: 'superadmin@hackmatch.com' });

    assert(studentCol1 && studentCol2, 'Found students in College 1 (Alex) and College 2 (Rahul)');

    const tokenCol1 = generateToken({ id: studentCol1._id });
    const tokenCol2 = generateToken({ id: studentCol2._id });
    const tokenSuper = generateToken({ id: superAdmin._id });

    // 2. Empty query returns safe empty structure
    const emptyRes = await fetchApi('/api/search?q=', {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    assert(emptyRes.status === 200, 'Empty query returns 200 OK');
    assert(emptyRes.data.counts.total === 0, 'Empty query returns total count 0');
    assert(Array.isArray(emptyRes.data.results.pages), 'Results contain pages array');
    assert(Array.isArray(emptyRes.data.results.hackathons), 'Results contain hackathons array');

    // 3. College isolation: Student 1 searching for Student 2's name must NOT return Student 2
    const col2StudentName = studentCol2.name.split(' ')[0];
    const searchCol2Student = await fetchApi(`/api/search?q=${encodeURIComponent(col2StudentName)}`, {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    const col2TeammatesFound = searchCol2Student.data.results.teammates || [];
    const leakedCol2Student = col2TeammatesFound.some((t) => t.id === studentCol2._id.toString());
    assert(!leakedCol2Student, `Student from Col1 cannot see Col2 student (${col2StudentName}) in teammates search`);

    // 4. College 1 student searching for Col1 peers can find them
    const peerCol1 = await User.findOne({
      collegeId: college1._id,
      _id: { $ne: studentCol1._id },
      status: 'Active',
    });
    if (peerCol1) {
      const peerCol1Name = peerCol1.name.split(' ')[0];
      const searchPeer = await fetchApi(`/api/search?q=${encodeURIComponent(peerCol1Name)}`, {
        headers: { Authorization: `Bearer ${tokenCol1}` },
      });
      const peerFound = (searchPeer.data.results.teammates || []).some((t) => t.id === peerCol1._id.toString());
      assert(peerFound, `Student from Col1 can search and find peer from same college (${peerCol1Name})`);
    }

    // 5. Team request isolation: Col2 team request cannot be seen by Col1 student
    // Ensure Col2 has a team request with unique keyword
    const uniqueReqKeyword = `SecretCol2Req_${Date.now()}`;
    const col2Hackathon = await Hackathon.findOne();
    const col2Request = await TeamRequest.create({
      hackathon: col2Hackathon._id,
      postedBy: studentCol2._id,
      collegeId: college2._id,
      title: `${uniqueReqKeyword} Looking for Rust Expert`,
      description: 'Exclusive to college 2',
      skillsNeeded: ['Rust', 'Wasm'],
      teamSizeNeeded: 2,
    });

    const searchCol1ForCol2Req = await fetchApi(`/api/search?q=${uniqueReqKeyword}`, {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    const col1ReqResults = searchCol1ForCol2Req.data.results.teamRequests || [];
    assert(col1ReqResults.length === 0, 'Col1 student cannot see Col2 team request in search results');

    const searchCol2ForCol2Req = await fetchApi(`/api/search?q=${uniqueReqKeyword}`, {
      headers: { Authorization: `Bearer ${tokenCol2}` },
    });
    const col2ReqResults = searchCol2ForCol2Req.data.results.teamRequests || [];
    assert(col2ReqResults.length > 0, 'Col2 student CAN see Col2 team request in search results');

    // Clean up test request
    await TeamRequest.findByIdAndDelete(col2Request._id);

    // 6. Hackathon visibility: Col1 student sees Global hackathons
    const searchHackathons = await fetchApi('/api/search?q=hack', {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    assert(searchHackathons.status === 200, 'Search for hackathons returns 200 OK');
    assert(searchHackathons.data.results.hackathons.length > 0, 'Global hackathons returned to student');

    // 7. Pages category navigation
    const searchPages = await fetchApi('/api/search?q=dashboard', {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    const hasDashboardPage = (searchPages.data.results.pages || []).some((p) => p.path === '/dashboard');
    assert(hasDashboardPage, 'Search query "dashboard" returns Student Dashboard page');

    // 8. ReDoS and regex special characters safety
    const specialCharsRes = await fetchApi('/api/search?q=' + encodeURIComponent('.*+?^${}()|[]\\'), {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    assert(specialCharsRes.status === 200, 'Regex special characters handled safely without crashing');

    // 9. SuperAdmin can view system administrative pages in search
    const searchAdminSuper = await fetchApi('/api/search?q=colleges', {
      headers: { Authorization: `Bearer ${tokenSuper}` },
    });
    const hasAdminCollegesPage = (searchAdminSuper.data.results.pages || []).some((p) => p.path === '/admin/colleges');
    assert(hasAdminCollegesPage, 'SuperAdmin can find Admin Colleges management page via search');

    // 10. Student CANNOT see SuperAdmin pages in search
    const searchAdminStudent = await fetchApi('/api/search?q=colleges', {
      headers: { Authorization: `Bearer ${tokenCol1}` },
    });
    const studentSawAdminColleges = (searchAdminStudent.data.results.pages || []).some((p) => p.path === '/admin/colleges');
    assert(!studentSawAdminColleges, 'Student CANNOT see SuperAdmin pages in search');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await closeTestServer();
  }

  console.log(`\n==================================================`);
  console.log(`SEARCH TEST RESULTS: ${passed}/${total} PASSED`);
  console.log(`==================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
};

runSearchTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
