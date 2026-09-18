import College from '../models/College.js';
import User from '../models/User.js';
import TeamRequest from '../models/TeamRequest.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @route   GET /api/colleges
 * @desc    Get list of colleges (public active colleges or all for superAdmin)
 * @access  Public / SuperAdmin
 */
export const getColleges = async (req, res) => {
  try {
    const isSuperAdmin = req.user && req.user.role === 'superAdmin';

    // Normal students / unauthenticated users only see Active colleges
    const filter = isSuperAdmin ? {} : { status: 'Active' };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { code: searchRegex }, { location: searchRegex }];
    }

    const colleges = await College.find(filter).sort({ name: 1 });

    // Aggregate real-time student and admin counts per college
    const collegeIds = colleges.map((c) => c._id);
    const counts = await User.aggregate([
      {
        $match: {
          collegeId: { $in: collegeIds },
          role: { $in: ['student', 'collegeAdmin'] },
        },
      },
      {
        $group: {
          _id: { collegeId: '$collegeId', role: '$role' },
          count: { $sum: 1 },
        },
      },
    ]);

    const countsMap = {};
    counts.forEach((item) => {
      if (item._id && item._id.collegeId) {
        const cId = item._id.collegeId.toString();
        if (!countsMap[cId]) countsMap[cId] = { studentCount: 0, adminCount: 0 };
        if (item._id.role === 'student') countsMap[cId].studentCount = item.count;
        if (item._id.role === 'collegeAdmin') countsMap[cId].adminCount = item.count;
      }
    });

    const collegesWithCounts = colleges.map((college) => {
      const cObj = college.toObject ? college.toObject() : { ...college };
      const stats = countsMap[cObj._id.toString()] || { studentCount: 0, adminCount: 0 };
      return {
        ...cObj,
        studentCount: stats.studentCount,
        adminCount: stats.adminCount,
      };
    });

    res.json({
      success: true,
      count: collegesWithCounts.length,
      colleges: collegesWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching colleges',
    });
  }
};

/**
 * @route   GET /api/colleges/:id
 * @desc    Get single college details & statistics
 * @access  Public / Private
 */
export const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    const studentCount = await User.countDocuments({ collegeId: college._id, role: 'student' });
    const activeStudentCount = await User.countDocuments({ collegeId: college._id, role: 'student', status: 'Active' });
    const requestCount = await TeamRequest.countDocuments({ collegeId: college._id });

    res.json({
      success: true,
      college,
      stats: {
        totalStudents: studentCount,
        activeStudents: activeStudentCount,
        totalTeamRequests: requestCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching college',
    });
  }
};

/**
 * @route   POST /api/colleges
 * @desc    Create new college
 * @access  Super Admin only
 */
export const createCollege = async (req, res) => {
  try {
    const { name, code, emailDomain, logo, location, description, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'College name and uppercase code are required.',
      });
    }

    const cleanCode = code.toUpperCase().trim();

    const existingCode = await College.findOne({ code: cleanCode });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `A college with code "${cleanCode}" already exists.`,
      });
    }

    const college = await College.create({
      name: name.trim(),
      code: cleanCode,
      emailDomain: emailDomain ? emailDomain.toLowerCase().trim() : '',
      logo: logo || '',
      location: location || '',
      description: description || '',
      status: status || 'Active',
    });

    // Record Audit Log
    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'CREATE_COLLEGE',
      targetType: 'College',
      targetId: college._id.toString(),
      collegeId: college._id,
      details: { name: college.name, code: college.code },
    });

    res.status(201).json({
      success: true,
      message: `College "${college.name}" created successfully.`,
      college,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating college',
    });
  }
};

/**
 * @route   PUT /api/colleges/:id
 * @desc    Update college details
 * @access  Super Admin only
 */
export const updateCollege = async (req, res) => {
  try {
    const { name, code, emailDomain, logo, location, description, status } = req.body;

    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    if (name) college.name = name.trim();
    if (code) college.code = code.toUpperCase().trim();
    if (emailDomain !== undefined) college.emailDomain = emailDomain.toLowerCase().trim();
    if (logo !== undefined) college.logo = logo;
    if (location !== undefined) college.location = location.trim();
    if (description !== undefined) college.description = description.trim();
    if (status) college.status = status;

    await college.save();

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'UPDATE_COLLEGE',
      targetType: 'College',
      targetId: college._id.toString(),
      collegeId: college._id,
      details: { name: college.name, code: college.code, status: college.status },
    });

    res.json({
      success: true,
      message: 'College updated successfully',
      college,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating college',
    });
  }
};

/**
 * @route   PATCH /api/colleges/:id/status
 * @desc    Toggle or set college status (Active/Inactive)
 * @access  Super Admin only
 */
export const toggleCollegeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    const nextStatus = status || (college.status === 'Active' ? 'Inactive' : 'Active');
    college.status = nextStatus;
    await college.save();

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'TOGGLE_COLLEGE_STATUS',
      targetType: 'College',
      targetId: college._id.toString(),
      collegeId: college._id,
      details: { newStatus: nextStatus },
    });

    res.json({
      success: true,
      message: `College "${college.name}" is now ${nextStatus}`,
      college,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing college status',
    });
  }
};

/**
 * @route   DELETE /api/colleges/:id
 * @desc    Delete or deactivate college
 * @access  Super Admin only
 */
export const deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    const studentCount = await User.countDocuments({ collegeId: college._id });
    if (studentCount > 0) {
      // Soft-delete by setting status to Inactive if students exist
      college.status = 'Inactive';
      await college.save();
      return res.json({
        success: true,
        message: `College has ${studentCount} registered user(s). It has been deactivated instead of permanently deleted.`,
        college,
      });
    }

    await College.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      actor: req.user._id,
      role: req.user.role,
      action: 'DELETE_COLLEGE',
      targetType: 'College',
      targetId: req.params.id,
      details: { name: college.name, code: college.code },
    });

    res.json({
      success: true,
      message: 'College deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting college',
    });
  }
};
