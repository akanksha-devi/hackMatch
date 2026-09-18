import User from '../models/User.js';
import { normalizeSkills } from '../services/matchingService.js';
import { generateAvatarUploadSignature, deleteCloudinaryAsset } from '../config/cloudinary.js';
import { createVerificationNotification } from '../services/notificationService.js';

/**
 * @route   GET /api/users
 * @desc    List/search students with strict college-wise data isolation
 * @access  Private
 */
export const getUsers = async (req, res) => {
  try {
    const filter = {
      status: 'Active',
      role: 'student',
    };

    // STRICT COLLEGE ISOLATION:
    // Students and College Admins can ONLY see users from their own college
    if (req.user.role !== 'superAdmin') {
      const userCollegeId = req.user.collegeId?._id || req.user.collegeId;
      filter.collegeId = userCollegeId;
    } else if (req.query.collegeId) {
      // Super Admin can optionally filter by college
      filter.collegeId = req.query.collegeId;
    }

    // Filter by skill
    if (req.query.skill && req.query.skill !== 'All') {
      filter.skills = { $regex: new RegExp(`^${req.query.skill.trim()}$`, 'i') };
    }

    // Filter by experience level
    if (req.query.experienceLevel && req.query.experienceLevel !== 'All') {
      filter.experienceLevel = req.query.experienceLevel;
    }

    // Text search by name or bio
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { bio: searchRegex }];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('collegeId', 'name code location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users',
    });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get single user profile (Strictly enforced: Same college only for students)
 * @access  Private
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('collegeId', 'name code location emailDomain logo');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // CROSS-COLLEGE SECURITY CHECK:
    // If requester is not superAdmin, verify user belongs to the SAME college
    if (req.user.role !== 'superAdmin') {
      const requesterCollegeId = (req.user.collegeId?._id || req.user.collegeId).toString();
      const targetCollegeId = (user.collegeId?._id || user.collegeId).toString();

      if (requesterCollegeId !== targetCollegeId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot view student profiles from another college.',
        });
      }
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile',
    });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile (Cannot change role, collegeId, or status)
 * @access  Private (Owner or SuperAdmin)
 */
export const updateUserProfile = async (req, res) => {
  try {
    const isOwner = req.user._id.toString() === req.params.id;
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own profile.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const {
      name,
      bio,
      skills,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      avatarUrl,
    } = req.body;

    // Allowed profile updates
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (skills) user.skills = normalizeSkills(skills);

    // Re-verification rule: Invalidate previous verification if experience level changes
    let experienceResetOccurred = false;
    if (experienceLevel && experienceLevel !== user.experienceLevel) {
      if (user.experienceVerificationStatus !== 'Unverified') {
        experienceResetOccurred = true;
      }
      user.experienceLevel = experienceLevel;
      user.experienceVerificationStatus = 'Unverified';
      user.experienceVerifiedAt = null;
      user.experienceVerifiedBy = null;
      user.experienceVerificationNote = 'Experience level modified by student; re-verification required.';
    }

    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();
    if (req.body.avatarPublicId !== undefined) user.avatarPublicId = req.body.avatarPublicId;

    // Students CANNOT change collegeId, role, or status
    // (req.body.collegeId, req.body.role, req.body.status are deliberately ignored here)

    await user.save();

    if (experienceResetOccurred) {
      try {
        await createVerificationNotification({
          recipient: user._id,
          actor: req.user._id,
          collegeId: user.collegeId,
          type: 'VERIFICATION_RESET',
        });
      } catch (notifErr) {
        console.error('[Verification Reset Notification Error]:', notifErr.message);
      }
    }

    const updated = await User.findById(user._id)
      .select('-password')
      .populate('collegeId');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

/**
 * @route   POST /api/users/me/avatar/signature
 * @desc    Generate signed Cloudinary upload params (server-side signing)
 * @access  Private
 */
export const getAvatarUploadSignature = async (req, res) => {
  try {
    const signatureData = generateAvatarUploadSignature(req.user._id);
    res.json({
      success: true,
      ...signatureData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating upload signature',
    });
  }
};

/**
 * @route   PATCH /api/users/me/avatar
 * @desc    Update avatar URL and public ID
 * @access  Private
 */
export const updateAvatar = async (req, res) => {
  try {
    const { avatarUrl, avatarPublicId } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: 'avatarUrl is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Clean up older Cloudinary asset if replaced
    if (user.avatarPublicId && avatarPublicId && user.avatarPublicId !== avatarPublicId) {
      await deleteCloudinaryAsset(user.avatarPublicId);
    }

    user.avatarUrl = avatarUrl;
    if (avatarPublicId !== undefined) {
      user.avatarPublicId = avatarPublicId;
    }
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('collegeId');

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatarUrl: user.avatarUrl,
      avatarPublicId: user.avatarPublicId,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating avatar',
    });
  }
};

/**
 * @route   DELETE /api/users/me/avatar
 * @desc    Remove avatar photo and restore default placeholder
 * @access  Private
 */
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.avatarPublicId) {
      await deleteCloudinaryAsset(user.avatarPublicId);
    }

    user.avatarUrl =
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';
    user.avatarPublicId = '';
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('collegeId');

    res.json({
      success: true,
      message: 'Avatar removed successfully',
      avatarUrl: user.avatarUrl,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing avatar',
    });
  }
};
