import express from 'express';
import {
  getAdminDashboard,
  getAdminStudents,
  toggleStudentStatus,
  getAdminTeamRequests,
  createCollegeAdmin,
  getCollegeAdmins,
  createCollegeAdminForCollege,
  demoteCollegeAdmin,
  toggleCollegeAdminStatus,
  getAuditLogs,
  getHackathonSyncStatus,
  triggerHackathonSync,
} from '../controllers/adminController.js';
import {
  getAdminVerifications,
  reviewVerification,
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect); // All admin routes require authentication
router.use(requireAdmin); // Requires superAdmin or collegeAdmin

router.get('/dashboard', getAdminDashboard);
router.get('/students', getAdminStudents);
router.patch('/students/:id/status', toggleStudentStatus);
router.get('/team-requests', getAdminTeamRequests);

// Experience Verifications for Admin (scoped to college for collegeAdmin)
router.get('/experience-verifications', getAdminVerifications);
router.patch('/experience-verifications/:id', reviewVerification);

// Super Admin Only - College Admin Management
router.get('/colleges/:collegeId/admins', requireSuperAdmin, getCollegeAdmins);
router.post('/colleges/:collegeId/admins', requireSuperAdmin, createCollegeAdminForCollege);
router.patch('/colleges/:collegeId/admins/:adminId/demote', requireSuperAdmin, demoteCollegeAdmin);
router.patch('/colleges/:collegeId/admins/:adminId/status', requireSuperAdmin, toggleCollegeAdminStatus);

// Super Admin Only - General
router.post('/college-admins', requireSuperAdmin, createCollegeAdmin);
router.get('/audit-logs', requireSuperAdmin, getAuditLogs);
router.get('/hackathons/sync-status', requireSuperAdmin, getHackathonSyncStatus);
router.post('/hackathons/sync', requireSuperAdmin, triggerHackathonSync);

export default router;
