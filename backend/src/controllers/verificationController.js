import ExperienceVerification from '../models/ExperienceVerification.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { createVerificationNotification } from '../services/notificationService.js';

/**
 * @route   POST /api/experience-verifications
 * @desc    Submit evidence for experience level verification
 * @access  Private (Student)
 */
export const submitVerification = async (req, res) => {
  try {
    const {
      requestedLevel,
      githubUrl,
      portfolioUrl,
      projectLinks,
      certificationLinks,
      description,
    } = req.body;

    if (!requestedLevel || !['Beginner', 'Intermediate', 'Advanced'].includes(requestedLevel)) {
      return res.status(400).json({
        success: false,
        message: 'A valid requested experience level (Beginner, Intermediate, Advanced) is required.',
      });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed description of your experience (at least 10 characters).',
      });
    }

    const collegeId = req.user.collegeId?._id || req.user.collegeId;
    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'User must belong to a college institution to request verification.',
      });
    }

    // Check if user already has an active pending verification
    const existingPending = await ExperienceVerification.findOne({
      user: req.user._id,
      status: 'Pending',
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a verification request pending review by your college administration.',
        existingVerification: existingPending,
      });
    }

    const verification = await ExperienceVerification.create({
      user: req.user._id,
      collegeId,
      requestedLevel,
      githubUrl: (githubUrl || '').trim(),
      portfolioUrl: (portfolioUrl || '').trim(),
      projectLinks: Array.isArray(projectLinks) ? projectLinks.filter(Boolean) : [],
      certificationLinks: Array.isArray(certificationLinks) ? certificationLinks.filter(Boolean) : [],
      description: description.trim(),
      status: 'Pending',
    });

    // Update user's verification status
    await User.findByIdAndUpdate(req.user._id, {
      experienceVerificationStatus: 'Pending',
      experienceVerificationNote: '',
    });

    // Notify all active College Admins for this campus
    try {
      const collegeAdmins = await User.find({
        collegeId,
        role: 'collegeAdmin',
        status: 'Active',
      });

      for (const admin of collegeAdmins) {
        await createVerificationNotification({
          recipient: admin._id,
          actor: req.user._id,
          collegeId,
          type: 'VERIFICATION_REQUESTED',
          requestedLevel,
          studentName: req.user.name,
          verificationId: verification._id,
        });
      }
    } catch (notifErr) {
      console.error('[Verification Notification Error]:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully. Your campus admin will review it.',
      verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting experience verification',
    });
  }
};

/**
 * @route   GET /api/experience-verifications/my
 * @desc    Get student's own verification request history
 * @access  Private (Student)
 */
export const getMyVerifications = async (req, res) => {
  try {
    const verifications = await ExperienceVerification.find({ user: req.user._id })
      .populate('reviewedBy', 'name email')
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: verifications.length,
      verifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your verifications',
    });
  }
};

/**
 * @route   GET /api/admin/experience-verifications
 * @desc    List verification requests for review (Scoped to college for collegeAdmin)
 * @access  Private (SuperAdmin / CollegeAdmin)
 */
export const getAdminVerifications = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superAdmin';
    const filter = {};

    // STRICT COLLEGE ISOLATION:
    if (!isSuperAdmin) {
      filter.collegeId = req.user.collegeId?._id || req.user.collegeId;
    } else if (req.query.collegeId) {
      filter.collegeId = req.query.collegeId;
    }

    if (req.query.status && ['Pending', 'Verified', 'Rejected'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const verifications = await ExperienceVerification.find(filter)
      .populate('user', 'name email skills experienceLevel avatarUrl experienceVerificationStatus')
      .populate('collegeId', 'name code')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: verifications.length,
      verifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching verification requests',
    });
  }
};

/**
 * @route   PATCH /api/admin/experience-verifications/:id
 * @desc    Approve or reject experience verification
 * @access  Private (SuperAdmin / CollegeAdmin)
 */
export const reviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!status || !['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Verified" or "Rejected".',
      });
    }

    const verification = await ExperienceVerification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found.',
      });
    }

    // STRICT COLLEGE ISOLATION CHECK:
    // If College Admin, ensure target verification belongs to their college
    if (req.user.role !== 'superAdmin') {
      const adminCollegeId = (req.user.collegeId?._id || req.user.collegeId).toString();
      const targetCollegeId = verification.collegeId.toString();

      if (adminCollegeId !== targetCollegeId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot review verifications for another college institution.',
        });
      }
    }

    // Update verification record
    verification.status = status;
    verification.reviewNote = (reviewNote || '').trim();
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    await verification.save();

    // Update User record
    const userUpdate = {
      experienceVerificationStatus: status,
      experienceVerificationNote: (reviewNote || '').trim(),
    };

    if (status === 'Verified') {
      userUpdate.experienceLevel = verification.requestedLevel;
      userUpdate.experienceVerifiedAt = new Date();
      userUpdate.experienceVerifiedBy = req.user._id;
    }

    const updatedStudent = await User.findByIdAndUpdate(verification.user, userUpdate, {
      new: true,
    }).select('-password');

    // Create Audit Log
    const auditAction =
      status === 'Verified'
        ? 'EXPERIENCE_VERIFICATION_APPROVED'
        : 'EXPERIENCE_VERIFICATION_REJECTED';

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: auditAction,
      targetType: 'ExperienceVerification',
      targetId: verification._id.toString(),
      collegeId: verification.collegeId,
      details: {
        studentId: verification.user,
        requestedLevel: verification.requestedLevel,
        status,
        reviewNote: reviewNote || '',
      },
    });

    // Notify the student about review outcome
    try {
      await createVerificationNotification({
        recipient: verification.user,
        actor: req.user._id,
        collegeId: verification.collegeId,
        type: status === 'Verified' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
        requestedLevel: verification.requestedLevel,
        reviewNote: reviewNote || '',
        verificationId: verification._id,
      });
    } catch (notifErr) {
      console.error('[Verification Review Notification Error]:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Experience verification ${status.toLowerCase()} successfully.`,
      verification,
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error reviewing experience verification',
    });
  }
};
