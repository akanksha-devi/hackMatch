import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useTheme } from '../../context/ThemeContext';
import { SpatialPanel, SpatialModal, SpatialButton, SpatialInput, SpatialTextarea } from '../../components/spatial';
import { StatusBadge } from '../../components/StatusBadge';
import { Avatar } from '../../components/Avatar';
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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
        isLight ? 'border-slate-200' : 'border-gray-800'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Building2 className="w-8 h-8 text-purple-500" />
            College & Campus Institutions
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Super Admin multi-tenant management: campuses, real-time student/admin metrics, and administrator governance.
          </p>
        </div>

        <SpatialButton
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
          icon={Plus}
        >
          Onboard College
        </SpatialButton>
      </div>

      {/* Search Bar */}
      <div>
        <SpatialInput
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter campuses by name, institution code, or email domain..."
        />
      </div>

      {/* Colleges Table */}
      <SpatialPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading campus institutions...</p>
          </div>
        ) : filteredColleges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-gray-800 bg-gray-950/40 text-gray-400'}`}>
                  <th className="py-3.5 px-6 font-semibold">Campus Name</th>
                  <th className="py-3.5 px-4 font-semibold">Code</th>
                  <th className="py-3.5 px-4 font-semibold">Students</th>
                  <th className="py-3.5 px-4 font-semibold">Admins</th>
                  <th className="py-3.5 px-4 font-semibold">Email Domain</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                {filteredColleges.map((col) => {
                  const colId = col._id || col.id;
                  const isActive = col.status === 'Active';
                  return (
                    <tr key={colId} className={`transition-colors ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-gray-900/40'}`}>
                      <td className={`py-4 px-6 font-bold flex items-center gap-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <School className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span>{col.name}</span>
                          {col.description && (
                            <p className={`text-[11px] font-normal line-clamp-1 max-w-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                              {col.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className={`py-4 px-4 font-mono font-bold ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                        {col.code}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg border ${
                          isLight
                            ? 'text-cyan-800 bg-cyan-50 border-cyan-200'
                            : 'text-cyan-300 bg-cyan-950/50 border-cyan-500/20'
                        }`}>
                          <Users className="w-3 h-3 text-cyan-500" />
                          {col.studentCount ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg border ${
                          isLight
                            ? 'text-purple-800 bg-purple-50 border-purple-200'
                            : 'text-purple-300 bg-purple-950/50 border-purple-500/20'
                        }`}>
                          <Shield className="w-3 h-3 text-purple-500" />
                          {col.adminCount ?? 0}
                        </span>
                      </td>
                      <td className={`py-4 px-4 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                        {col.emailDomain ? (
                          <span className={`font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>@{col.emailDomain}</span>
                        ) : (
                          <span className={`${isLight ? 'text-slate-400' : 'text-gray-500'} italic`}>Any domain</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={col.status} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <SpatialButton
                          variant="secondary"
                          size="sm"
                          onClick={() => openManageAdmins(col)}
                          icon={Shield}
                        >
                          Manage Admins
                        </SpatialButton>
                        <SpatialButton
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedCollegeForAdmin(col);
                            setShowAdminModal(true);
                          }}
                          icon={Plus}
                        >
                          Add Admin
                        </SpatialButton>
                        <SpatialButton
                          variant={isActive ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(colId)}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </SpatialButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`p-12 text-center space-y-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
            <Building2 className={`w-10 h-10 mx-auto ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
            <p>No campuses match your search filter.</p>
          </div>
        )}
      </SpatialPanel>

      {/* MANAGE ADMINS MODAL / DRAWER */}
      <SpatialModal
        isOpen={showManageAdminsModal && !!managingCollege}
        onClose={() => setShowManageAdminsModal(false)}
        title="Manage Administrators"
        subtitle={managingCollege ? `Institution: ${managingCollege.name} (${managingCollege.code})` : ''}
        icon={Shield}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Alert / Notification banners */}
          {manageAdminError && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}>
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-bold ${isLight ? 'text-red-900' : 'text-red-200'}`}>Action Blocked: Last Admin Protection</h4>
                <p className="mt-0.5">{manageAdminError}</p>
              </div>
            </div>
          )}

          {manageAdminSuccess && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{manageAdminSuccess}</span>
            </div>
          )}

          {/* Top stats & Quick Add */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/60 border-gray-800/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 font-extrabold">
                {collegeAdmins.length}
              </div>
              <div>
                <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Assigned Administrators</div>
                <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {collegeAdmins.filter((a) => a.status === 'Active').length} Active / {collegeAdmins.length} Total
                </div>
              </div>
            </div>

            <SpatialButton
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => {
                setSelectedCollegeForAdmin(managingCollege);
                setShowAdminModal(true);
              }}
            >
              Assign Admin
            </SpatialButton>
          </div>

          {/* Admins Table */}
          <div className={`border rounded-2xl overflow-hidden ${
            isLight ? 'border-slate-200 bg-white' : 'border-gray-800/80 bg-gray-950/30'
          }`}>
            {loadingAdmins ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Loading campus administrators...</span>
              </div>
            ) : collegeAdmins.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-gray-800 bg-gray-900/50 text-gray-400'}`}>
                    <th className="py-3 px-4 font-semibold">Administrator</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Joined</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                  {collegeAdmins.map((adm) => {
                    const isActive = adm.status === 'Active';
                    return (
                      <tr key={adm._id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-gray-900/40'}`}>
                        <td className="py-3.5 px-4 font-medium flex items-center gap-3">
                          <Avatar
                            src={adm.avatarUrl}
                            name={adm.name}
                            size="sm"
                          />
                          <div>
                            <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{adm.name}</div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{adm.email}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={adm.status} size="sm" />
                        </td>
                        <td className={`py-3.5 px-4 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          {new Date(adm.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <SpatialButton
                            variant={isActive ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleAdminStatus(adm._id, adm.status)}
                            title={isActive ? 'Deactivate administrator' : 'Activate administrator'}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </SpatialButton>
                          <SpatialButton
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDemoteAdmin(adm._id, adm.name)}
                            title="Demote administrator to student profile"
                          >
                            Remove
                          </SpatialButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className={`p-8 text-center space-y-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                <ShieldAlert className="w-8 h-8 mx-auto" />
                <p className="text-xs">No administrators assigned to this campus yet.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <SpatialButton
              variant="secondary"
              size="sm"
              onClick={() => setShowManageAdminsModal(false)}
            >
              Done
            </SpatialButton>
          </div>
        </div>
      </SpatialModal>

      {/* Onboard New College Modal */}
      <SpatialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Onboard New Campus Institution"
        icon={Building2}
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          {modalSuccess && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{modalSuccess}</span>
            </div>
          )}
          {modalError && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCollege} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Full Institution Name *</label>
              <SpatialInput
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Indian Institute of Technology Delhi"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Code / Abbr *</label>
                <SpatialInput
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. IITD"
                  className="uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Email Domain</label>
                <SpatialInput
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="iitd.ac.in"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Location</label>
              <SpatialInput
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New Delhi, India"
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Description</label>
              <SpatialTextarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Premier engineering institute..."
              />
            </div>

            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
              <SpatialButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </SpatialButton>
              <SpatialButton
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
              >
                Save Institution
              </SpatialButton>
            </div>
          </form>
        </div>
      </SpatialModal>

      {/* Add College Admin Modal */}
      <SpatialModal
        isOpen={showAdminModal && !!selectedCollegeForAdmin}
        onClose={() => setShowAdminModal(false)}
        title="Assign College Admin"
        icon={UserPlus}
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Create an administrator account scoped strictly to{' '}
            <strong className={isLight ? 'text-slate-900' : 'text-white'}>{selectedCollegeForAdmin?.name}</strong>.
          </p>

          {modalSuccess && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{modalSuccess}</span>
            </div>
          )}
          {modalError && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCollegeAdmin} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Admin Full Name *</label>
              <SpatialInput
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Prof. Sharma"
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Official Email *</label>
              <SpatialInput
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={`admin@${selectedCollegeForAdmin?.emailDomain || 'college.edu'}`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Temporary Password *</label>
              <SpatialInput
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
              <SpatialButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </SpatialButton>
              <SpatialButton
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
              >
                Create Admin
              </SpatialButton>
            </div>
          </form>
        </div>
      </SpatialModal>
    </div>
  );
};

export default AdminColleges;
