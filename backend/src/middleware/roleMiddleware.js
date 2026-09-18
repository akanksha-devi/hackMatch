export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s). Your role is [${req.user.role}].`,
      });
    }

    next();
  };
};

export const requireSuperAdmin = requireRole('superAdmin');
export const requireCollegeAdmin = requireRole('collegeAdmin');
export const requireAdmin = requireRole('superAdmin', 'collegeAdmin');
