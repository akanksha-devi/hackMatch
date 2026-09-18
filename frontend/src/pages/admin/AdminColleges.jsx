import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  School,
  Globe,
  MapPin,
  Mail,
  UserPlus,
  Users,
  Shield,
  ShieldAlert,
  Trash2,
  AlertCircle,
  Loader2,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';

export const AdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCollegeForAdmin, setSelectedCollegeForAdmin] = useState(null);

  // Manage Admins Modal/Drawer
  const [showManageAdminsModal, setShowManageAdminsModal] = useState(false);
  const [managingCollege, setManagingCollege] = useState(null);
  const [collegeAdmins, setCollegeAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [manageAdminError, setManageAdminError] = useState('');
  const [manageAdminSuccess, setManageAdminSuccess] = useState('');

  // New College form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // New College Admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    try {
      const res = await apiService.getColleges();
      if (res.success && res.colleges) {
        setColleges(res.colleges);
      }
    } catch (err) {
      console.error('Error loading colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const openManageAdmins = async (college) => {
    setManagingCollege(college);
    setShowManageAdminsModal(true);
    setManageAdminError('');
    setManageAdminSuccess('');
    await loadAdminsForCollege(college._id || college.id);
  };

  const loadAdminsForCollege = async (collegeId) => {
    setLoadingAdmins(true);
    try {
      const res = await apiService.getCollegeAdmins(collegeId);
      if (res.success && res.admins) {
        setCollegeAdmins(res.admins);
      }
    } catch (err) {
      setManageAdminError(err.response?.data?.message || 'Failed to load college administrators');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleDemoteAdmin = async (adminId, adminName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove administrator privileges from ${adminName}? Their account will be converted to a student profile.`
      )
    ) {
      return;
    }

    setManageAdminError('');
    setManageAdminSuccess('');
    try {
      const res = await apiService.demoteCollegeAdmin(managingCollege._id || managingCollege.id, adminId);
      setManageAdminSuccess(res.message || 'Administrator removed successfully');
      await loadAdminsForCollege(managingCollege._id || managingCollege.id);
      await loadColleges();
    } catch (err) {
      const errorMsg =
        err.response?.data?.code === 'LAST_ADMIN_PROTECTION'
          ? err.response?.data?.message ||
            'This is the only active administrator for this college. Assign another administrator before removing this account.'
          : err.response?.data?.message || 'Failed to remove administrator';
      setManageAdminError(errorMsg);
    }
  };

  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setManageAdminError('');
    setManageAdminSuccess('');
    try {
      await apiService.toggleCollegeAdminStatus(
        managingCollege._id || managingCollege.id,
        adminId,
        newStatus
      );
      setManageAdminSuccess(`Administrator set to ${newStatus}`);
      await loadAdminsForCollege(managingCollege._id || managingCollege.id);
      await loadColleges();
    } catch (err) {
      const errorMsg =
        err.response?.data?.code === 'LAST_ADMIN_PROTECTION'
          ? err.response?.data?.message ||
            'This is the only active administrator for this college. Assign another administrator before removing this account.'
          : err.response?.data?.message || 'Failed to update administrator status';
      setManageAdminError(errorMsg);
    }
  };

  const handleToggleStatus = async (collegeId) => {
    try {
      await apiService.toggleCollegeStatus(collegeId);
      await loadColleges();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      await apiService.createCollege({
        name,
        code,
        emailDomain,
        location,
        description,
      });

      setModalSuccess('College institution added successfully!');
      setTimeout(() => {
        setShowCreateModal(false);
        setName('');
        setCode('');
        setEmailDomain('');
        setLocation('');
        setDescription('');
        setModalSuccess('');
      }, 1200);

      await loadColleges();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating college');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCollegeAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    const targetCollegeId = selectedCollegeForAdmin?._id || selectedCollegeForAdmin?.id;

    try {
      await apiService.createCollegeAdminForCollege(targetCollegeId, {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      });

      setModalSuccess(`Admin account created for ${selectedCollegeForAdmin.name}!`);
      setTimeout(() => {
        setShowAdminModal(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setSelectedCollegeForAdmin(null);
        setModalSuccess('');
      }, 1200);

      await loadColleges();
      if (managingCollege && (managingCollege._id === targetCollegeId || managingCollege.id === targetCollegeId)) {
        await loadAdminsForCollege(targetCollegeId);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating college admin');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.emailDomain && c.emailDomain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-purple-400" />
            College & Campus Institutions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Super Admin multi-tenant management: campuses, real-time student/admin metrics, and administrator governance.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Onboard College
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter campuses by name, institution code, or email domain..."
          className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-gray-600"
        />
      </div>

      {/* Colleges Table */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Loading campus institutions...</p>
          </div>
        ) : filteredColleges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/40 text-gray-400">
                  <th className="py-3.5 px-6 font-semibold">Campus Name</th>
                  <th className="py-3.5 px-4 font-semibold">Code</th>
                  <th className="py-3.5 px-4 font-semibold">Students</th>
                  <th className="py-3.5 px-4 font-semibold">Admins</th>
                  <th className="py-3.5 px-4 font-semibold">Email Domain</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredColleges.map((col) => {
                  const colId = col._id || col.id;
                  const isActive = col.status === 'Active';
                  return (
                    <tr key={colId} className="hover:bg-gray-900/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                        <School className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <span>{col.name}</span>
                          {col.description && (
                            <p className="text-[11px] text-gray-500 font-normal line-clamp-1 max-w-xs">
                              {col.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-indigo-300">
                        {col.code}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                          <Users className="w-3 h-3 text-cyan-400" />
                          {col.studentCount ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded-lg border border-purple-500/20">
                          <Shield className="w-3 h-3 text-purple-400" />
                          {col.adminCount ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {col.emailDomain ? (
                          <span className="font-mono text-cyan-300">@{col.emailDomain}</span>
                        ) : (
                          <span className="text-gray-500 italic">Any domain</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {col.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openManageAdmins(col)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" /> Manage Admins
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCollegeForAdmin(col);
                            setShowAdminModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all"
                        >
                          + Add Admin
                        </button>
                        <button
                          onClick={() => handleToggleStatus(colId)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isActive
                              ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                              : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Building2 className="w-10 h-10 text-gray-600 mx-auto" />
            <p>No campuses match your search filter.</p>
          </div>
        )}
      </div>

      {/* MANAGE ADMINS MODAL / DRAWER */}
      {showManageAdminsModal && managingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Manage Administrators
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Institution: <strong className="text-white">{managingCollege.name}</strong> ({managingCollege.code})
                </p>
              </div>
              <button
                onClick={() => setShowManageAdminsModal(false)}
                className="text-gray-400 hover:text-white font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {/* Alert / Notification banners */}
            {manageAdminError && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-200">Action Blocked: Last Admin Protection</h4>
                  <p className="mt-0.5 text-red-300/90">{manageAdminError}</p>
                </div>
              </div>
            )}

            {manageAdminSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{manageAdminSuccess}</span>
              </div>
            )}

            {/* Top stats & Quick Add */}
            <div className="flex items-center justify-between bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-extrabold">
                  {collegeAdmins.length}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Assigned Administrators</div>
                  <div className="text-sm font-bold text-white">
                    {collegeAdmins.filter((a) => a.status === 'Active').length} Active / {collegeAdmins.length} Total
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCollegeForAdmin(managingCollege);
                  setShowAdminModal(true);
                }}
                className="btn-glow px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" /> + Assign Admin
              </button>
            </div>

            {/* Admins Table */}
            <div className="border border-gray-800/80 rounded-2xl overflow-hidden bg-gray-950/30">
              {loadingAdmins ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Loading campus administrators...</span>
                </div>
              ) : collegeAdmins.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400">
                      <th className="py-3 px-4 font-semibold">Administrator</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Joined</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {collegeAdmins.map((adm) => {
                      const isActive = adm.status === 'Active';
                      return (
                        <tr key={adm._id} className="hover:bg-gray-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white flex items-center gap-3">
                            <img
                              src={
                                adm.avatarUrl ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                              }
                              alt={adm.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-700"
                            />
                            <div>
                              <div className="font-bold text-white">{adm.name}</div>
                              <div className="text-[11px] text-gray-400">{adm.email}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              {adm.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-400">
                            {new Date(adm.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleAdminStatus(adm._id, adm.status)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                                isActive
                                  ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                                  : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                              }`}
                              title={isActive ? 'Deactivate administrator' : 'Activate administrator'}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDemoteAdmin(adm._id, adm.name)}
                              className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/20 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                              title="Demote administrator to student profile"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500 space-y-1">
                  <ShieldAlert className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs">No administrators assigned to this campus yet.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowManageAdminsModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New College Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-gray-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Onboard New Campus Institution
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {modalSuccess}
              </div>
            )}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCollege} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Full Institution Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology Delhi"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Code / Abbr *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. IITD"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Email Domain</label>
                  <input
                    type="text"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    placeholder="iitd.ac.in"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New Delhi, India"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Premier engineering institute..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add College Admin Modal */}
      {showAdminModal && selectedCollegeForAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-gray-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Assign College Admin
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Create an administrator account scoped strictly to{' '}
              <strong className="text-white">{selectedCollegeForAdmin.name}</strong>.
            </p>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {modalSuccess}
              </div>
            )}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCollegeAdmin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Prof. Sharma"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Official Email *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder={`admin@${selectedCollegeForAdmin.emailDomain || 'college.edu'}`}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminColleges;
