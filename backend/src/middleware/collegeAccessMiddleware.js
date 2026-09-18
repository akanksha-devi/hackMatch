export const enforceCollegeIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Super Admin has platform-wide access
  if (req.user.role === 'superAdmin') {
    return next();
  }

  // For students and collegeAdmins, extract the authoritative collegeId
  const userCollegeId = req.user.collegeId?._id
    ? req.user.collegeId._id.toString()
    : req.user.collegeId?.toString();

  if (!userCollegeId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: User is not affiliated with any college institution.',
    });
  }

  // Attach strictly verified collegeId to req
  req.authCollegeId = userCollegeId;

  // Disregard any client-spoofed collegeId in query or body
  delete req.query.collegeId;
  if (req.body && typeof req.body === 'object') {
    delete req.body.collegeId;
  }

  next();
};

export const verifyCollegeMatch = (resourceCollegeId, user) => {
  if (!resourceCollegeId || !user) return false;
  if (user.role === 'superAdmin') return true;

  const resColId = resourceCollegeId._id ? resourceCollegeId._id.toString() : resourceCollegeId.toString();
  const userColId = user.collegeId?._id ? user.collegeId._id.toString() : user.collegeId?.toString();

  return resColId === userColId;
};
