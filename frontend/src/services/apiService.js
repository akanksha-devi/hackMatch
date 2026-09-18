import axiosInstance from '../api/axiosInstance';

export const apiService = {
  // === Colleges ===
  getColleges: async () => {
    const res = await axiosInstance.get('/colleges');
    return res.data;
  },
  getCollegeById: async (id) => {
    const res = await axiosInstance.get(`/colleges/${id}`);
    return res.data;
  },
  createCollege: async (data) => {
    const res = await axiosInstance.post('/colleges', data);
    return res.data;
  },
  updateCollege: async (id, data) => {
    const res = await axiosInstance.put(`/colleges/${id}`, data);
    return res.data;
  },
  toggleCollegeStatus: async (id) => {
    const res = await axiosInstance.patch(`/colleges/${id}/status`);
    return res.data;
  },

  // === Users / Students ===
  getUsers: async (params = {}) => {
    const res = await axiosInstance.get('/users', { params });
    return res.data;
  },
  getUserById: async (id) => {
    const res = await axiosInstance.get(`/users/${id}`);
    return res.data;
  },
  updateUserProfile: async (id, data) => {
    const res = await axiosInstance.put(`/users/${id}`, data);
    return res.data;
  },

  // === Hackathons ===
  getHackathons: async (params = {}) => {
    const res = await axiosInstance.get('/hackathons', { params });
    return res.data;
  },
  getHackathonById: async (id) => {
    const res = await axiosInstance.get(`/hackathons/${id}`);
    return res.data;
  },
  createHackathon: async (data) => {
    const res = await axiosInstance.post('/hackathons', data);
    return res.data;
  },

  // === Team Requests & Smart Matching ===
  getTeamRequests: async (params = {}) => {
    const res = await axiosInstance.get('/team-requests', { params });
    return res.data;
  },
  getTeamRequestById: async (id) => {
    const res = await axiosInstance.get(`/team-requests/${id}`);
    return res.data;
  },
  createTeamRequest: async (data) => {
    const res = await axiosInstance.post('/team-requests', data);
    return res.data;
  },
  updateTeamRequest: async (id, data) => {
    const res = await axiosInstance.put(`/team-requests/${id}`, data);
    return res.data;
  },
  deleteTeamRequest: async (id) => {
    const res = await axiosInstance.delete(`/team-requests/${id}`);
    return res.data;
  },
  getTeamRequestMatches: async (id) => {
    const res = await axiosInstance.get(`/team-requests/${id}/matches`);
    return res.data;
  },
  previewMatches: async (skillsNeeded) => {
    const res = await axiosInstance.post('/team-requests/preview-matches', { skillsNeeded });
    return res.data;
  },

  // === Applications / Responses ===
  createResponse: async (data) => {
    const res = await axiosInstance.post('/responses', data);
    return res.data;
  },
  getMyResponses: async () => {
    const res = await axiosInstance.get('/responses/my');
    return res.data;
  },
  updateResponseStatus: async (id, status) => {
    const res = await axiosInstance.put(`/responses/${id}`, { status });
    return res.data;
  },

  // === Avatar & Profile Photo Upload ===
  getAvatarUploadSignature: async () => {
    const res = await axiosInstance.post('/users/me/avatar/signature');
    return res.data;
  },
  updateAvatar: async (data) => {
    const res = await axiosInstance.patch('/users/me/avatar', data);
    return res.data;
  },
  deleteAvatar: async () => {
    const res = await axiosInstance.delete('/users/me/avatar');
    return res.data;
  },
  uploadAvatarToCloudinary: async (file, signatureData) => {
    // If Cloudinary keys are configured, perform direct signed multipart upload
    if (
      signatureData.cloudName &&
      signatureData.apiKey &&
      signatureData.cloudName !== 'hackmatch-demo' &&
      !signatureData.cloudName.includes('demo')
    ) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);
      formData.append('public_id', signatureData.publicId);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!uploadRes.ok) {
        throw new Error('Cloudinary upload failed');
      }
      const cloudData = await uploadRes.json();
      return {
        avatarUrl: cloudData.secure_url,
        avatarPublicId: cloudData.public_id,
      };
    } else {
      // Fallback: convert file to localized base64 data URL for demo & offline reliability
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            avatarUrl: reader.result,
            avatarPublicId: signatureData.publicId || `local_${Date.now()}`,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  },

  // === College Admin Management (Super Admin) ===
  getCollegeAdmins: async (collegeId) => {
    const res = await axiosInstance.get(`/admin/colleges/${collegeId}/admins`);
    return res.data;
  },
  createCollegeAdminForCollege: async (collegeId, data) => {
    const res = await axiosInstance.post(`/admin/colleges/${collegeId}/admins`, data);
    return res.data;
  },
  demoteCollegeAdmin: async (collegeId, adminId) => {
    const res = await axiosInstance.patch(`/admin/colleges/${collegeId}/admins/${adminId}/demote`);
    return res.data;
  },
  toggleCollegeAdminStatus: async (collegeId, adminId, status) => {
    const res = await axiosInstance.patch(`/admin/colleges/${collegeId}/admins/${adminId}/status`, { status });
    return res.data;
  },

  // === Experience Verification System ===
  submitExperienceVerification: async (data) => {
    const res = await axiosInstance.post('/experience-verifications', data);
    return res.data;
  },
  getMyExperienceVerifications: async () => {
    const res = await axiosInstance.get('/experience-verifications/my');
    return res.data;
  },
  getAdminExperienceVerifications: async (params = {}) => {
    const res = await axiosInstance.get('/admin/experience-verifications', { params });
    return res.data;
  },
  reviewExperienceVerification: async (id, data) => {
    const res = await axiosInstance.patch(`/admin/experience-verifications/${id}`, data);
    return res.data;
  },

  // === Admin Portal ===
  getAdminDashboard: async () => {
    const res = await axiosInstance.get('/admin/dashboard');
    return res.data;
  },
  getAdminStudents: async (params = {}) => {
    const res = await axiosInstance.get('/admin/students', { params });
    return res.data;
  },
  toggleStudentStatus: async (id, status) => {
    const res = await axiosInstance.patch(`/admin/students/${id}/status`, { status });
    return res.data;
  },
  getAdminTeamRequests: async (params = {}) => {
    const res = await axiosInstance.get('/admin/team-requests', { params });
    return res.data;
  },
  createCollegeAdmin: async (data) => {
    const res = await axiosInstance.post('/admin/college-admins', data);
    return res.data;
  },
  // === Notifications System ===
  getNotifications: async (params = {}) => {
    const res = await axiosInstance.get('/notifications', { params });
    return res.data;
  },
  getUnreadNotificationCount: async () => {
    const res = await axiosInstance.get('/notifications/unread-count');
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await axiosInstance.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await axiosInstance.patch('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
  },

  // === Hackathon Discovery & Sync ===
  getHackathonSyncStatus: async () => {
    const res = await axiosInstance.get('/admin/hackathons/sync-status');
    return res.data;
  },
  triggerHackathonSync: async (data = {}) => {
    const res = await axiosInstance.post('/admin/hackathons/sync', data);
    return res.data;
  },
};

export default apiService;
