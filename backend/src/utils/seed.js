import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import College from '../models/College.js';
import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import TeamRequest from '../models/TeamRequest.js';
import Response from '../models/Response.js';
import AuditLog from '../models/AuditLog.js';
import ExperienceVerification from '../models/ExperienceVerification.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      College.deleteMany(),
      User.deleteMany(),
      Hackathon.deleteMany(),
      TeamRequest.deleteMany(),
      Response.deleteMany(),
      AuditLog.deleteMany(),
      ExperienceVerification.deleteMany(),
    ]);

    console.log('[Seed] Creating demo colleges...');
    const kiet = await College.create({
      name: 'KIET Deemed to be University',
      code: 'KIET',
      emailDomain: 'kiet.edu',
      location: 'Ghaziabad, Delhi-NCR, India',
      description: 'Premier technical institution focused on innovation, research, and hackathon culture.',
      status: 'Active',
    });

    const abctech = await College.create({
      name: 'ABC Institute of Technology',
      code: 'ABCTECH',
      emailDomain: 'abctech.edu',
      location: 'Bengaluru, Karnataka, India',
      description: 'Leading computer science and engineering campus.',
      status: 'Active',
    });

    const xyzuniv = await College.create({
      name: 'XYZ University',
      code: 'XYZUNIV',
      emailDomain: 'xyzuniv.edu',
      location: 'New Delhi, India',
      description: 'Multidisciplinary research university with active coding clubs.',
      status: 'Active',
    });

    console.log('[Seed] Creating administrators...');
    const superAdmin = await User.create({
      name: 'Super Administrator',
      email: process.env.ADMIN_EMAIL || 'superadmin@hackmatch.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'superAdmin',
      status: 'Active',
      bio: 'Platform root administrator overseeing multi-college operations.',
    });

    // KIET: 3 Admins
    const kietAdmin = await User.create({
      name: 'KIET Admin (Lead)',
      email: 'admin@kiet.edu',
      password: 'Admin@123',
      collegeId: kiet._id,
      role: 'collegeAdmin',
      status: 'Active',
      bio: 'Lead Administrator for KIET Deemed to be University.',
    });

    const kietAdmin2 = await User.create({
      name: 'Dr. R.K. Sharma',
      email: 'kiet.admin2@kiet.edu',
      password: 'Admin@123',
      collegeId: kiet._id,
      role: 'collegeAdmin',
      status: 'Active',
      bio: 'Faculty Coordinator & Innovation Admin at KIET.',
    });

    const kietAdmin3 = await User.create({
      name: 'Prof. Ananya Sen',
      email: 'kiet.admin3@kiet.edu',
      password: 'Admin@123',
      collegeId: kiet._id,
      role: 'collegeAdmin',
      status: 'Active',
      bio: 'Dean of Student Affairs & Hackathon Mentor at KIET.',
    });

    // ABC: 2 Admins
    const abcAdmin = await User.create({
      name: 'ABC Tech Admin',
      email: 'admin@abctech.edu',
      password: 'Admin@123',
      collegeId: abctech._id,
      role: 'collegeAdmin',
      status: 'Active',
      bio: 'Lead Administrator for ABC Institute of Technology.',
    });

    const abcAdmin2 = await User.create({
      name: 'Dr. Vikram Rao',
      email: 'abc.admin2@abctech.edu',
      password: 'Admin@123',
      collegeId: abctech._id,
      role: 'collegeAdmin',
      status: 'Active',
      bio: 'Co-curricular & Hackathon Incharge at ABC Tech.',
    });

    // XYZ: 1 Admin
    const xyzAdmin = await User.create({
      name: 'XYZ Univ Admin',
      email: 'admin@xyzuniv.edu',
      password: 'Admin@123',
      collegeId: xyzuniv._id,
      role: 'collegeAdmin',
      status: 'Active',
      bio: 'Campus Administrator for XYZ University.',
    });

    console.log('[Seed] Creating students under KIET (College A)...');
    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'password123',
      collegeId: kiet._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Advanced',
      experienceVerificationStatus: 'Verified',
      experienceVerifiedAt: new Date(),
      experienceVerifiedBy: kietAdmin._id,
      experienceVerificationNote: 'Outstanding portfolio, GitHub commits, and 3x hackathon wins verified.',
      bio: 'Full-Stack Developer passionate about React, Node.js, and cloud systems. 3x hackathon winner.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'TailwindCSS'],
      githubUrl: 'https://github.com/alexrivera',
      linkedinUrl: 'https://linkedin.com/in/alexrivera',
      portfolioUrl: 'https://alexrivera.dev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'password123',
      collegeId: kiet._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Intermediate',
      experienceVerificationStatus: 'Unverified',
      bio: 'AI Engineer & Data Scientist. Specialist in PyTorch, Computer Vision, and Gemini API.',
      skills: ['Python', 'PyTorch', 'AI', 'LLM', 'FastAPI', 'Machine Learning'],
      githubUrl: 'https://github.com/priyasharma',
      linkedinUrl: 'https://linkedin.com/in/priyasharma',
      portfolioUrl: 'https://priya.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    const sophia = await User.create({
      name: 'Sophia Martinez',
      email: 'sophia@example.com',
      password: 'password123',
      collegeId: kiet._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Intermediate',
      experienceVerificationStatus: 'Pending',
      bio: 'UI/UX Product Designer creating intuitive, accessible design systems in Figma.',
      skills: ['UI/UX', 'Figma', 'Design Systems', 'TailwindCSS', 'Prototyping'],
      githubUrl: 'https://github.com/sophiadesign',
      linkedinUrl: 'https://linkedin.com/in/sophiamartinez',
      portfolioUrl: 'https://sophiadesign.co',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    });

    console.log('[Seed] Creating students under ABC (College B)...');
    const rahul = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@example.com',
      password: 'password123',
      collegeId: abctech._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Intermediate',
      experienceVerificationStatus: 'Rejected',
      experienceVerificationNote: 'Please provide working GitHub repo links and verifiable credentials.',
      bio: 'Backend developer at ABC Tech building resilient REST APIs with Node & PostgreSQL.',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'React'],
      githubUrl: 'https://github.com/rahulkumar',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    });

    const neha = await User.create({
      name: 'Neha Sharma',
      email: 'neha@example.com',
      password: 'password123',
      collegeId: abctech._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Beginner',
      experienceVerificationStatus: 'Unverified',
      bio: 'Python and Machine Learning enthusiast participating in regional hackathons.',
      skills: ['Python', 'Machine Learning', 'Data Science', 'Django'],
      githubUrl: 'https://github.com/nehasharma',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    });

    console.log('[Seed] Creating students under XYZ (College C)...');
    const aman = await User.create({
      name: 'Aman Verma',
      email: 'aman@example.com',
      password: 'password123',
      collegeId: xyzuniv._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Advanced',
      experienceVerificationStatus: 'Unverified',
      bio: 'Web3 & Smart Contract Developer at XYZ University.',
      skills: ['Solidity', 'Blockchain', 'Web3', 'Rust', 'React'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    const riya = await User.create({
      name: 'Riya Singh',
      email: 'riya@example.com',
      password: 'password123',
      collegeId: xyzuniv._id,
      role: 'student',
      status: 'Active',
      experienceLevel: 'Intermediate',
      experienceVerificationStatus: 'Unverified',
      bio: 'Cross-platform app developer building sleek Flutter applications.',
      skills: ['Flutter', 'Dart', 'Firebase', 'UI/UX'],
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    });

    console.log('[Seed] Creating experience verification records...');
    // Seeded verifications (Verified, Pending, Rejected)
    await ExperienceVerification.create({
      user: alex._id,
      collegeId: kiet._id,
      requestedLevel: 'Advanced',
      status: 'Verified',
      githubUrl: 'https://github.com/alexrivera',
      portfolioUrl: 'https://alexrivera.dev',
      projectLinks: ['https://github.com/alexrivera/distributed-cache', 'https://alexrivera.dev/showcase'],
      description: 'Over 3 years of production full-stack engineering, 3x hackathon winner, and maintainer of popular React UI components.',
      reviewedBy: kietAdmin._id,
      reviewedAt: new Date(),
      reviewNote: 'Outstanding portfolio, GitHub commits, and 3x hackathon wins verified.',
    });

    await ExperienceVerification.create({
      user: sophia._id,
      collegeId: kiet._id,
      requestedLevel: 'Advanced',
      status: 'Pending',
      githubUrl: 'https://github.com/sophiadesign',
      portfolioUrl: 'https://sophiadesign.co',
      projectLinks: ['https://github.com/sophiadesign/figma-tokens'],
      description: 'UI/UX Product Designer creating intuitive, accessible design systems in Figma.',
    });

    await ExperienceVerification.create({
      user: rahul._id,
      collegeId: abctech._id,
      requestedLevel: 'Advanced',
      status: 'Rejected',
      githubUrl: 'https://github.com/rahulkumar',
      portfolioUrl: '',
      projectLinks: [],
      description: 'Built APIs with Node and PostgreSQL.',
      reviewedBy: abcAdmin._id,
      reviewedAt: new Date(),
      reviewNote: 'Please provide working GitHub repo links and verifiable credentials.',
    });

    console.log('[Seed] Creating hackathons...');
    const sih = await Hackathon.create({
      title: 'Smart India Hackathon 2026',
      organizer: 'Ministry of Education & AICTE',
      mode: 'Hybrid',
      location: 'New Delhi & Online',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-17'),
      registrationDeadline: new Date('2026-11-05'),
      registrationLink: 'https://sih.gov.in',
      tags: ['AI', 'Web Dev', 'IoT', 'GovTech'],
      visibility: 'Global',
      postedBy: superAdmin._id,
      status: 'Active',
      description: 'Nationwide initiative providing students a platform to solve pressing daily problems.',
    });

    const googleAi = await Hackathon.create({
      title: 'Google AI Agents Buildathon',
      organizer: 'Google Cloud & DeepMind',
      mode: 'Online',
      location: 'Global',
      startDate: new Date('2026-10-20'),
      endDate: new Date('2026-10-22'),
      registrationDeadline: new Date('2026-10-15'),
      registrationLink: 'https://ai.google.dev',
      tags: ['AI', 'LLM', 'Python', 'Gemini API'],
      visibility: 'Global',
      postedBy: superAdmin._id,
      status: 'Active',
      description: 'Build next-generation autonomous AI agents and multi-agent workflows.',
    });

    const kietInno = await Hackathon.create({
      title: 'KIET InnoHacks 2026',
      organizer: 'KIET E-Cell & CSI Student Chapter',
      mode: 'Offline',
      location: 'Auditorium Block, KIET Campus',
      startDate: new Date('2026-10-05'),
      endDate: new Date('2026-10-06'),
      registrationDeadline: new Date('2026-10-01'),
      registrationLink: 'https://innohacks.kiet.edu',
      tags: ['Innovation', 'Web Dev', 'AI'],
      visibility: 'College',
      collegeId: kiet._id,
      postedBy: kietAdmin._id,
      status: 'Active',
      description: 'Annual flagship 24-hour hackathon exclusively for KIET undergraduate developers.',
    });

    console.log('[Seed] Creating team requests...');
    const alexReq = await TeamRequest.create({
      hackathon: sih._id,
      postedBy: alex._id,
      collegeId: kiet._id,
      title: 'Looking for PyTorch AI Dev & UI Designer for Smart India Hackathon',
      description: 'Building an AI-powered traffic congestion prediction and routing model. Need an AI engineer for computer vision and a UI designer for the dashboard.',
      skillsNeeded: ['Python', 'PyTorch', 'UI/UX'],
      teamSizeNeeded: 2,
      status: 'Open',
    });

    const rahulReq = await TeamRequest.create({
      hackathon: sih._id,
      postedBy: rahul._id,
      collegeId: abctech._id,
      title: 'Need Machine Learning & Python specialist for ABC Tech SIH team',
      description: 'Working on rural water quality sensor pipeline. We have the backend built and need someone who knows Python and ML algorithms.',
      skillsNeeded: ['Python', 'Machine Learning'],
      teamSizeNeeded: 1,
      status: 'Open',
    });

    console.log('[Seed] Creating applications/responses...');
    await Response.create({
      teamRequest: alexReq._id,
      respondent: priya._id,
      collegeId: kiet._id,
      message: 'Hey Alex! I saw your post for SIH. I have 2 years of PyTorch experience and would love to build the computer vision module!',
      status: 'Pending',
    });

    console.log('\n========================================');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Credentials Summary:');
    console.log('- Super Admin: superadmin@hackmatch.com / Admin@123');
    console.log('- KIET Admins (3): admin@kiet.edu, kiet.admin2@kiet.edu, kiet.admin3@kiet.edu / Admin@123');
    console.log('- ABC Admins (2): admin@abctech.edu, abc.admin2@abctech.edu / Admin@123');
    console.log('- XYZ Admin (1): admin@xyzuniv.edu / Admin@123');
    console.log('- KIET Student: alex@example.com (Verified Advanced) / password123');
    console.log('- KIET Student: priya@example.com (Unverified Intermediate - ready to test verification) / password123');
    console.log('- KIET Student: sophia@example.com (Pending Intermediate) / password123');
    console.log('- ABC Student: rahul@example.com (Rejected Advanced) / password123');
    console.log('- ABC Student: neha@example.com / password123');
    console.log('- XYZ Student: aman@example.com / password123');
    console.log('- XYZ Student: riya@example.com / password123');
    console.log('========================================\n');

    return {
      colleges: { kiet, abctech, xyzuniv },
      users: {
        superAdmin,
        kietAdmin,
        kietAdmin2,
        kietAdmin3,
        abcAdmin,
        abcAdmin2,
        xyzAdmin,
        alex,
        priya,
        sophia,
        rahul,
        neha,
        aman,
        riya,
      },
      hackathons: { sih, googleAi, kietInno },
      teamRequests: { alexReq, rahulReq },
    };
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

// If run directly via node src/utils/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
