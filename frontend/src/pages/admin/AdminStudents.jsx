import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { SkillChip } from '../../components/SkillChip';
import { SpatialPanel, SpatialDropdown, SpatialButton, SpatialInput } from '../../components/spatial';
import { StatusBadge } from '../../components/StatusBadge';
import { ExperienceBadge } from '../../components/ExperienceBadge';
import { Avatar } from '../../components/Avatar';
import { useTheme } from '../../context/ThemeContext';
import {
  Users,
  Search,
  School,
  CheckCircle2,
  XCircle,
  Filter,
  Shield,
  Loader2,
  Mail,
  ExternalLink
} from 'lucide-react';

export const AdminStudents = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { isSuperAdmin, collegeName } = useAuth();
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCollegeFilter, selectedStatusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCollegeFilter) params.collegeId = selectedCollegeFilter;
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const [stuRes, colRes] = await Promise.all([
        apiService.getAdminStudents(params),
        isSuperAdmin ? apiService.getColleges() : Promise.resolve({ colleges: [] }),
      ]);

      if (stuRes.success && stuRes.students) {
        setStudents(stuRes.students);
      }
      if (colRes.success && colRes.colleges) {
        setColleges(colRes.colleges);
      }
    } catch (err) {
      console.error('Error loading admin students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiService.toggleStudentStatus(studentId, newStatus);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating student status');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? 'border-slate-200' : 'border-gray-800'} pb-6`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2.5`}>
            <Users className="w-8 h-8 text-cyan-500" />
            Student Verification & Management
          </h1>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'} mt-1`}>
            {isSuperAdmin
              ? 'Platform-wide student directory with college filtering and activation controls.'
              : `Managing verified student accounts belonging to ${collegeName}.`}
          </p>
        </div>

        <div className={`text-xs ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-gray-900 border-gray-800 text-gray-400'} font-semibold px-3 py-1.5 rounded-xl border shrink-0`}>
          Total Registered: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{students.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <SpatialPanel className={`border ${isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'border-gray-800'} flex flex-col md:flex-row items-center gap-3 relative z-20`}>
        {/* Search */}
        <div className="flex-1 w-full">
          <SpatialInput
            size="sm"
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, email, or skill..."
          />
        </div>

        {/* SuperAdmin College Filter Dropdown */}
        {isSuperAdmin && (
          <div className="w-full md:w-56">
            <SpatialDropdown
              value={selectedCollegeFilter}
              onChange={(e) => setSelectedCollegeFilter(e.target.value)}
              icon={School}
              options={[
                { value: '', label: 'All Campuses' },
                ...colleges.map((c) => ({
                  value: c._id || c.id,
                  label: `${c.name} (${c.code})`,
                })),
              ]}
            />
          </div>
        )}

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <SpatialDropdown
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            icon={Filter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' },
            ]}
          />
        </div>
      </SpatialPanel>

      {/* Students Table */}
      <SpatialPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading student directory...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50/70 text-slate-600' : 'border-gray-800 bg-gray-950/40 text-gray-400'}`}>
                  <th className="py-3.5 px-6 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold">Campus</th>
                  <th className="py-3.5 px-4 font-semibold">Experience</th>
                  <th className="py-3.5 px-4 font-semibold">Skills</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                {filteredStudents.map((s) => {
                  const sId = s._id || s.id;
                  const isActive = s.status === 'Active';
                  return (
                    <tr key={sId} className={`hover:${isLight ? 'bg-slate-50/70' : 'bg-gray-900/40'} transition-colors`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={s.avatarUrl}
                            name={s.name}
                            size="sm"
                            verified={s.experienceVerificationStatus === 'Verified'}
                          />
                          <div>
                            <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.name}</p>
                            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{s.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className={`py-4 px-4 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <School className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {s.collegeId?.name || s.collegeName || 'Unknown Campus'}
                          </span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <ExperienceBadge
                          level={s.experienceLevel || 'Intermediate'}
                          size="sm"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.skills?.slice(0, 3).map((sk) => (
                            <SkillChip key={sk} skill={sk} variant="default" size="sm" />
                          ))}
                          {s.skills?.length > 3 && (
                            <span className="text-[10px] text-gray-500 self-center">
                              +{s.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={s.status} size="sm" />
                      </td>

                      <td className="py-4 px-6 text-right">
                        <SpatialButton
                          variant={isActive ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(sId, s.status)}
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
          <div className={`p-12 text-center ${isLight ? 'text-slate-500' : 'text-gray-500'} space-y-2`}>
            <Users className={`w-10 h-10 ${isLight ? 'text-slate-400' : 'text-gray-600'} mx-auto`} />
            <p>No student accounts match the selected criteria.</p>
          </div>
        )}
      </SpatialPanel>
    </div>
  );
};

export default AdminStudents;
