import User from '../models/User.js';
import College from '../models/College.js';
import Hackathon from '../models/Hackathon.js';
import TeamRequest from '../models/TeamRequest.js';
import Response from '../models/Response.js';
import AuditLog from '../models/AuditLog.js';
import ExperienceVerification from '../models/ExperienceVerification.js';
import HackathonSyncLog from '../models/HackathonSyncLog.js';
import { runHackathonSync, getSyncStatusSummary } from '../services/hackathonSync/index.js';
import { dispatchNotification } from './notificationController.js';
import { safeRegex } from '../utils/sanitize.js';

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard metrics (Platform-wide for superAdmin, College-scoped for collegeAdmin)
 * @access  Private (SuperAdmin / CollegeAdmin)
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superAdmin';
    const userCollegeId = req.user.collegeId?._id || req.user.collegeId;

    if (isSuperAdmin) {
      const now = new Date();
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      const [
        totalColleges,
        activeColleges,
        totalStudents,
        activeStudents,
        totalCollegeAdmins,
        totalHackathons,
        externalHackathons,
        manualHackathons,
        upcomingHackathons,
        closingSoonHackathons,
        latestSyncLog,
        totalTeamRequests,
        openTeamRequests,
        totalApplications,
        acceptedApplications,
        pendingApplications,
        pendingVerifications,
        verifiedExperiences,
        recentAudits,
      ] = await Promise.all([
        College.countDocuments(),
        College.countDocuments({ status: 'Active' }),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', status: 'Active' }),
        User.countDocuments({ role: 'collegeAdmin' }),
        Hackathon.countDocuments(),
        Hackathon.countDocuments({ isExternal: true }),
        Hackathon.countDocuments({ isExternal: { $ne: true } }),
        Hackathon.countDocuments({
          $or: [{ startDate: { $gt: now } }, { registrationDeadline: { $gt: now } }],
        }),
        Hackathon.countDocuments({
          registrationDeadline: { $gt: now, $lte: threeDaysLater },
        }),
        HackathonSyncLog.findOne().sort({ startedAt: -1 }),
        TeamRequest.countDocuments(),
        TeamRequest.countDocuments({ status: 'Open' }),
        Response.countDocuments(),
        Response.countDocuments({ status: 'Accepted' }),
        Response.countDocuments({ status: 'Pending' }),
        ExperienceVerification.countDocuments({ status: 'Pending' }),
        User.countDocuments({ experienceVerificationStatus: 'Verified' }),
        AuditLog.find().sort({ timestamp: -1 }).limit(8).populate('actor', 'name email'),
      ]);

      return res.json({
        success: true,
        scope: 'PLATFORM_WIDE',
        metrics: {
          totalColleges,
          activeColleges,
          totalStudents,
          activeStudents,
          totalCollegeAdmins,
          totalHackathons,
          externalHackathons,
          manualHackathons,
          upcomingHackathons,
          closingSoonHackathons,
          lastSync: latestSyncLog?.completedAt || latestSyncLog?.startedAt || null,
          lastSyncStatus: latestSyncLog?.status || 'IDLE',
          totalTeamRequests,
          openTeamRequests,
          totalApplications,
          acceptedApplications,
          pendingApplications,
          pendingVerifications,
          verifiedExperiences,
        },
        recentAudits,
      });
    }

    // College Admin: Scoped strictly to their own college
    const [
      college,
      totalStudents,
      activeStudents,
      pendingVerifications,
      verifiedStudents,
      totalTeamRequests,
      openTeamRequests,
      totalApplications,
      acceptedApplications,
      pendingApplications,
    ] = await Promise.all([
      College.findById(userCollegeId),
      User.countDocuments({ collegeId: userCollegeId, role: 'student' }),
      User.countDocuments({ collegeId: userCollegeId, role: 'student', status: 'Active' }),
      ExperienceVerification.countDocuments({ collegeId: userCollegeId, status: 'Pending' }),
      User.countDocuments({ collegeId: userCollegeId, experienceVerificationStatus: 'Verified' }),
      TeamRequest.countDocuments({ collegeId: userCollegeId }),
      TeamRequest.countDocuments({ collegeId: userCollegeId, status: 'Open' }),
      Response.countDocuments({ collegeId: userCollegeId }),
      Response.countDocuments({ collegeId: userCollegeId, status: 'Accepted' }),
      Response.countDocuments({ collegeId: userCollegeId, status: 'Pending' }),
    ]);

    res.json({
      success: true,
      scope: 'COLLEGE_RESTRICTED',
      college,
      metrics: {
        totalStudents,
        activeStudents,
        pendingVerifications,
        verifiedStudents,
        totalTeamRequests,
        openTeamRequests,
        totalApplications,
        acceptedApplications,
        pendingApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin dashboard metrics',
    });
  }
};

/**
 * @route   GET /api/admin/students
 * @desc    Get student list (all with filters for superAdmin, own college for collegeAdmin)
 * @access  Private (SuperAdmin / CollegeAdmin)
 */
export const getAdminStudents = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superAdmin';
    const filter = { role: 'student' };

    if (!isSuperAdmin) {
      filter.collegeId = req.user.collegeId?._id || req.user.collegeId;
    } else if (req.query.collegeId) {
      filter.collegeId = req.query.collegeId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const regex = safeRegex(String(req.query.search));
      if (regex) {
        filter.$or = [{ name: regex }, { email: regex }, { bio: regex }];
      }
    }

    const students = await User.find(filter)
      .select('-password')
      .populate('collegeId', 'name code location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching students for admin',
    });
  }
};

/**
 * @route   PATCH /api/admin/students/:id/status
 * @desc    Activate or deactivate student account
 * @access  Private (SuperAdmin / CollegeAdmin for own college)
 */
export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Verify college permission if collegeAdmin
    if (req.user.role !== 'superAdmin') {
      const adminColId = (req.user.collegeId?._id || req.user.collegeId).toString();
      const studentColId = (student.collegeId?._id || student.collegeId).toString();

      if (adminColId !== studentColId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot modify students of another college institution.',
        });
      }
    }

    const nextStatus = req.body.status || (student.status === 'Active' ? 'Inactive' : 'Active');
    if (!['Active', 'Inactive'].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "Active" or "Inactive".',
      });
    }
    student.status = nextStatus;
    await student.save();

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'TOGGLE_STUDENT_STATUS',
      targetType: 'User',
      targetId: student._id.toString(),
      collegeId: student.collegeId,
      details: { studentName: student.name, email: student.email, newStatus: nextStatus },
    });

    res.json({
      success: true,
      message: `Student account for ${student.name} is now ${nextStatus}.`,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating student status',
    });
  }
};

/**
 * @route   GET /api/admin/team-requests
 * @desc    View and moderate team requests
 * @access  Private (SuperAdmin / CollegeAdmin)
 */
export const getAdminTeamRequests = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superAdmin';
    const filter = {};

    if (!isSuperAdmin) {
      filter.collegeId = req.user.collegeId?._id || req.user.collegeId;
    } else if (req.query.collegeId) {
      filter.collegeId = req.query.collegeId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const teamRequests = await TeamRequest.find(filter)
      .populate('hackathon', 'title organizer mode')
      .populate('postedBy', 'name email avatarUrl')
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teamRequests.length,
      teamRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team requests for admin',
    });
  }
};

/**
 * @route   POST /api/admin/college-admins
 * @desc    Create a new College Administrator
 * @access  Super Admin only
 */
export const createCollegeAdmin = async (req, res) => {
  try {
    const { name, email, password, collegeId } = req.body;

    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and collegeId are required.',
      });
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be a valid string between 6 and 128 characters.',
      });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const adminUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      collegeId: college._id,
      role: 'collegeAdmin',
      status: 'Active',
    });

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'CREATE_COLLEGE_ADMIN',
      targetType: 'User',
      targetId: adminUser._id.toString(),
      collegeId: college._id,
      details: { email: cleanEmail, collegeName: college.name },
    });

    res.status(201).json({
      success: true,
      message: `College administrator created for ${college.name}`,
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        collegeId: college,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating college admin',
    });
  }
};

/**
 * @route   GET /api/admin/audit-logs
 * @desc    View platform audit logs
 * @access  Super Admin only
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .populate('collegeId', 'name code')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching audit logs',
    });
  }
};

/**
 * @route   GET /api/admin/colleges/:collegeId/admins
 * @desc    Get all administrators for a specific college
 * @access  Super Admin only
 */
export const getCollegeAdmins = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const admins = await User.find({ collegeId, role: 'collegeAdmin' })
      .select('name email role status avatarUrl createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      college: {
        _id: college._id,
        name: college.name,
        code: college.code,
        status: college.status,
      },
      count: admins.length,
      admins,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching college admins' });
  }
};

/**
 * @route   POST /api/admin/colleges/:collegeId/admins
 * @desc    Create or promote an administrator for a specific college
 * @access  Super Admin only
 */
export const createCollegeAdminForCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be a valid string between 6 and 128 characters.',
      });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let adminUser = await User.findOne({ email: cleanEmail });

    if (adminUser) {
      if (adminUser.role === 'collegeAdmin' && adminUser.collegeId?.toString() === collegeId) {
        return res.status(400).json({
          success: false,
          message: 'This user is already an administrator for this college.',
        });
      }
      // If student in same college, promote to collegeAdmin
      if (adminUser.collegeId && adminUser.collegeId.toString() === collegeId) {
        adminUser.role = 'collegeAdmin';
        adminUser.status = 'Active';
        if (password) adminUser.password = password;
        await adminUser.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'An account with this email exists under another institution or role.',
        });
      }
    } else {
      adminUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        collegeId: college._id,
        role: 'collegeAdmin',
        status: 'Active',
      });
    }

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'COLLEGE_ADMIN_CREATED',
      targetType: 'User',
      targetId: adminUser._id.toString(),
      collegeId: college._id,
      details: { email: cleanEmail, collegeName: college.name },
    });

    try {
      await dispatchNotification({
        recipient: adminUser._id,
        actor: req.user._id,
        collegeId: college._id,
        type: 'ADMIN_CREATED',
        title: 'College Admin Assigned',
        message: `You have been appointed as an administrator for ${college.name}.`,
        link: '/admin',
        metadata: { collegeId: college._id, collegeName: college.name },
      });
    } catch (notifErr) {
      console.error('[Admin Notification Error]:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Administrator added for ${college.name}`,
      admin: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status,
        createdAt: adminUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating college admin' });
  }
};

/**
 * @route   PATCH /api/admin/colleges/:collegeId/admins/:adminId/demote
 * @desc    Remove administrator privileges and demote to student (with Last Admin Protection)
 * @access  Super Admin only
 */
export const demoteCollegeAdmin = async (req, res) => {
  try {
    const { collegeId, adminId } = req.params;

    const targetAdmin = await User.findOne({ _id: adminId, collegeId, role: 'collegeAdmin' });
    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'College administrator not found' });
    }

    // LAST ADMIN PROTECTION:
    // If targetAdmin is Active, ensure there is at least one other Active administrator for this college
    if (targetAdmin.status === 'Active') {
      const otherActiveAdmins = await User.countDocuments({
        collegeId,
        role: 'collegeAdmin',
        status: 'Active',
        _id: { $ne: targetAdmin._id },
      });

      if (otherActiveAdmins === 0) {
        return res.status(400).json({
          success: false,
          code: 'LAST_ADMIN_PROTECTION',
          message:
            'This is the only active administrator for this college. Assign another administrator before removing this account.',
        });
      }
    }

    // Demote to student while preserving profile, skills, bio, etc.
    targetAdmin.role = 'student';
    await targetAdmin.save();

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'COLLEGE_ADMIN_REMOVED',
      targetType: 'User',
      targetId: targetAdmin._id.toString(),
      collegeId,
      details: { email: targetAdmin.email, demotedTo: 'student' },
    });

    try {
      await dispatchNotification({
        recipient: targetAdmin._id,
        actor: req.user._id,
        collegeId,
        type: 'ADMIN_REMOVED',
        title: 'Admin Role Updated',
        message: 'Your administrator privileges have been revoked and your account role was updated to student.',
        link: '/dashboard',
        metadata: { collegeId },
      });
    } catch (notifErr) {
      console.error('[Admin Demotion Notification Error]:', notifErr.message);
    }

    res.json({
      success: true,
      message: `${targetAdmin.name} has been removed as administrator and demoted to student.`,
      user: {
        _id: targetAdmin._id,
        name: targetAdmin.name,
        email: targetAdmin.email,
        role: targetAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error removing college admin' });
  }
};

/**
 * @route   PATCH /api/admin/colleges/:collegeId/admins/:adminId/status
 * @desc    Toggle college admin Active/Inactive (with Last Admin Protection)
 * @access  Super Admin only
 */
export const toggleCollegeAdminStatus = async (req, res) => {
  try {
    const { collegeId, adminId } = req.params;
    const { status } = req.body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Active or Inactive' });
    }

    const targetAdmin = await User.findOne({ _id: adminId, collegeId, role: 'collegeAdmin' });
    if (!targetAdmin) {
      return res.status(404).json({ success: false, message: 'College administrator not found' });
    }

    // LAST ADMIN PROTECTION:
    // If deactivating and targetAdmin is currently Active, check if another Active admin exists
    if (status === 'Inactive' && targetAdmin.status === 'Active') {
      const otherActiveAdmins = await User.countDocuments({
        collegeId,
        role: 'collegeAdmin',
        status: 'Active',
        _id: { $ne: targetAdmin._id },
      });

      if (otherActiveAdmins === 0) {
        return res.status(400).json({
          success: false,
          code: 'LAST_ADMIN_PROTECTION',
          message:
            'This is the only active administrator for this college. Assign another administrator before removing this account.',
        });
      }
    }

    targetAdmin.status = status;
    await targetAdmin.save();

    const auditAction = status === 'Active' ? 'COLLEGE_ADMIN_REACTIVATED' : 'COLLEGE_ADMIN_DEACTIVATED';
    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: auditAction,
      targetType: 'User',
      targetId: targetAdmin._id.toString(),
      collegeId,
      details: { email: targetAdmin.email, newStatus: status },
    });

    if (status === 'Inactive') {
      try {
        await dispatchNotification({
          recipient: targetAdmin._id,
          actor: req.user._id,
          collegeId,
          type: 'ADMIN_DEACTIVATED',
          title: 'Admin Account Deactivated',
          message: 'Your college administrator account has been deactivated by Super Admin.',
          link: '/admin/login',
          metadata: { collegeId },
        });
      } catch (notifErr) {
        console.error('[Admin Deactivation Notification Error]:', notifErr.message);
      }
    }

    res.json({
      success: true,
      message: `Administrator account ${status === 'Active' ? 'activated' : 'deactivated'}.`,
      admin: {
        _id: targetAdmin._id,
        name: targetAdmin.name,
        email: targetAdmin.email,
        status: targetAdmin.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating admin status' });
  }
};

/**
 * @route   GET /api/admin/hackathons/sync-status
 * @desc    Get status of hackathon discovery sync service, adapter health, and recent logs
 * @access  Private (SuperAdmin)
 */
export const getHackathonSyncStatus = async (req, res) => {
  try {
    const summary = await getSyncStatusSummary();
    const recentLogs = await HackathonSyncLog.find().sort({ startedAt: -1 }).limit(10);
    res.json({
      success: true,
      ...summary,
      recentLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching sync status' });
  }
};

/**
 * @route   POST /api/admin/hackathons/sync
 * @desc    Manually trigger hackathon discovery synchronization
 * @access  Private (SuperAdmin only)
 */
export const triggerHackathonSync = async (req, res) => {
  try {
    const { sourceId } = req.body || {};
    const result = await runHackathonSync({ sourceId });
    res.json({
      success: true,
      message: 'Hackathon synchronization completed',
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error executing manual sync' });
  }
};

