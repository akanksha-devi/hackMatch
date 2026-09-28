import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { SkillTag } from '../../components/SkillTag';
import { SpatialPanel, SpatialDropdown } from '../../components/spatial';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-cyan-400" />
            Student Verification & Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isSuperAdmin
              ? 'Platform-wide student directory with college filtering and activation controls.'
              : `Managing verified student accounts belonging to ${collegeName}.`}
          </p>
        </div>

        <div className="text-xs text-gray-400 font-semibold px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 shrink-0">
          Total Registered: <strong className="text-white">{students.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <SpatialPanel className="border border-gray-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, email, or skill..."
            className="w-full spatial-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-gray-500"
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
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Loading student directory...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/40 text-gray-400">
                  <th className="py-3.5 px-6 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold">Campus</th>
                  <th className="py-3.5 px-4 font-semibold">Experience</th>
                  <th className="py-3.5 px-4 font-semibold">Skills</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredStudents.map((s) => {
                  const sId = s._id || s.id;
                  const isActive = s.status === 'Active';
                  return (
                    <tr key={sId} className="hover:bg-gray-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                            alt={s.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-500/30 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-gray-300">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <School className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {s.collegeId?.name || s.collegeName || 'Unknown Campus'}
                          </span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-[10px] text-gray-300 font-semibold">
                          {s.experienceLevel || 'Intermediate'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.skills?.slice(0, 3).map((sk) => (
                            <SkillTag key={sk} name={sk} size="sm" />
                          ))}
                          {s.skills?.length > 3 && (
                            <span className="text-[10px] text-gray-500 self-center">
                              +{s.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(sId, s.status)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isActive
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
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
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <p>No student accounts match the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
