import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'hackmatch_super_secret_jwt_key_multi_college_2026';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id).populate('collegeId');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      if (user.status === 'Inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact your college administrator.',
        });
      }

      // Check if user's college is inactive (for non-superAdmin users)
      if (user.role !== 'superAdmin' && user.collegeId && user.collegeId.status === 'Inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your college institution account is currently inactive.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};
