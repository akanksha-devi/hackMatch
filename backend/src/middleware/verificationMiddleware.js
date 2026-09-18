/**
 * Verification Middleware
 * Restricts team creation, responses/applications, and team formation features
 * to students whose experience has been verified by their college admin.
 */
export const requireVerifiedStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no user session found',
    });
  }

  // Super Admin and College Admin bypass student verification requirement for administrative functions
  if (req.user.role === 'superAdmin' || req.user.role === 'collegeAdmin') {
    return next();
  }

  // If user is a student, their experience must be strictly 'Verified'
  if (req.user.role === 'student' && req.user.experienceVerificationStatus !== 'Verified') {
    return res.status(403).json({
      success: false,
      code: 'VERIFICATION_REQUIRED',
      message: 'Verified experience is required to perform this action.',
      currentStatus: req.user.experienceVerificationStatus || 'Unverified',
    });
  }

  next();
};
