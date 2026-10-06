import User from '../models/User.js';
import College from '../models/College.js';
import { generateToken } from '../utils/generateToken.js';
import { normalizeSkills } from '../services/matchingService.js';

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new student under a verified active college
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      collegeId,
      bio,
      skills,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      avatarUrl,
    } = req.body;

    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and select your college.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Validate college
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'Selected college institution not found.',
      });
    }

    if (college.status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: 'Registrations are currently disabled because this college is inactive. Please contact your college administrator.',
      });
    }

    // Optional domain verification check if college specifies domain
    if (college.emailDomain) {
      const userDomain = cleanEmail.split('@')[1];
      if (userDomain && !userDomain.toLowerCase().endsWith(college.emailDomain.toLowerCase())) {
        console.log(`[Signup Notice] Email domain (${userDomain}) differs from college domain (${college.emailDomain})`);
      }
    }

    // Create user (Strictly force student role and Active status)
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      collegeId: college._id,
      bio: bio ? bio.trim() : '',
      skills: normalizeSkills(skills || []),
      experienceLevel: experienceLevel || 'Intermediate',
      githubUrl: githubUrl || '',
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      role: 'student',
      status: 'Active',
    });

    const token = generateToken({
      id: user._id,
      role: user.role,
      collegeId: user.collegeId,
    });

    const populatedUser = await User.findById(user._id).populate('collegeId');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to HackMatch.',
      token,
      user: {
        _id: populatedUser._id,
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        bio: populatedUser.bio,
        skills: populatedUser.skills,
        experienceLevel: populatedUser.experienceLevel,
        experienceVerificationStatus: populatedUser.experienceVerificationStatus || 'Unverified',
        experienceVerifiedAt: populatedUser.experienceVerifiedAt,
        experienceVerifiedBy: populatedUser.experienceVerifiedBy,
        experienceVerificationNote: populatedUser.experienceVerificationNote,
        avatarPublicId: populatedUser.avatarPublicId || '',
        githubUrl: populatedUser.githubUrl,
        linkedinUrl: populatedUser.linkedinUrl,
        portfolioUrl: populatedUser.portfolioUrl,
        avatarUrl: populatedUser.avatarUrl,
        collegeId: populatedUser.collegeId,
        college: populatedUser.collegeId,
        role: populatedUser.role,
        status: populatedUser.status,
      },
    });
  } catch (error) {
    console.error('[Signup Error]:', error);
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0]?.message || 'Validation error during registration.';
      return res.status(400).json({
        success: false,
        message: firstError,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during signup',
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Select password field explicitly
    const user = await User.findOne({ email: cleanEmail }).select('+password').populate('collegeId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your college administrator.',
      });
    }

    // Check college status if user is student or collegeAdmin
    if (user.role !== 'superAdmin' && user.collegeId && user.collegeId.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your college institution account is currently inactive.',
      });
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
      collegeId: user.collegeId?._id || user.collegeId,
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        experienceVerificationStatus: user.experienceVerificationStatus || 'Unverified',
        experienceVerifiedAt: user.experienceVerifiedAt,
        experienceVerifiedBy: user.experienceVerifiedBy,
        experienceVerificationNote: user.experienceVerificationNote,
        avatarPublicId: user.avatarPublicId || '',
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        avatarUrl: user.avatarUrl,
        collegeId: user.collegeId,
        college: user.collegeId,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('collegeId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        experienceVerificationStatus: user.experienceVerificationStatus || 'Unverified',
        experienceVerifiedAt: user.experienceVerifiedAt,
        experienceVerifiedBy: user.experienceVerifiedBy,
        experienceVerificationNote: user.experienceVerificationNote,
        avatarPublicId: user.avatarPublicId || '',
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        avatarUrl: user.avatarUrl,
        collegeId: user.collegeId,
        college: user.collegeId,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile',
    });
  }
};
