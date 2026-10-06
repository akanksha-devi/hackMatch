import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { SkillChip } from '../../components/SkillChip';
import { StatusBadge } from '../../components/StatusBadge';
import { Avatar } from '../../components/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { SpatialPanel, SpatialDropdown, SpatialButton, SpatialInput } from '../../components/spatial';
import {
  GitPullRequest,
  Search,
  School,
  Trophy,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Users
} from 'lucide-react';

export const AdminTeamRequests = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const { isSuperAdmin, collegeName } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await apiService.getAdminTeamRequests(params);
      if (res.success && res.teamRequests) {
        setRequests(res.teamRequests);
      }
    } catch (err) {
      console.error('Error loading admin requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (requestId, currentStatus) => {
    const nextStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
      await apiService.updateTeamRequest(requestId, { status: nextStatus });
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const filtered = requests.filter((r) => {
    const titleMatch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const hackathonMatch = r.hackathon?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const posterMatch = r.postedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || hackathonMatch || posterMatch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
        isLight ? 'border-slate-200' : 'border-gray-800'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <GitPullRequest className="w-8 h-8 text-indigo-500" />
            Team Request Moderation
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            {isSuperAdmin
              ? 'Platform-wide team requests across all campus environments.'
              : `Moderating student team requests for ${collegeName}.`}
          </p>
        </div>

        <div className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shrink-0 ${
          isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-gray-900 border-gray-800 text-gray-400'
        }`}>
          Total Requests: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{requests.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <SpatialPanel padding="compact" className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SpatialInput
            size="sm"
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by request title, hackathon, or student name..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-56">
          <SpatialDropdown
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Requests' },
              { value: 'Open', label: 'Open Only' },
              { value: 'Closed', label: 'Closed Only' },
            ]}
            placeholder="Filter by Status..."
            icon={Filter}
          />
        </div>
      </SpatialPanel>

      {/* Table */}
      <SpatialPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading requests...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${
                  isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-gray-950/40 text-gray-400 border-gray-800'
                }`}>
                  <th className="py-3.5 px-6 font-semibold">Request Title & Hackathon</th>
                  <th className="py-3.5 px-4 font-semibold">Campus</th>
                  <th className="py-3.5 px-4 font-semibold">Posted By</th>
                  <th className="py-3.5 px-4 font-semibold">Skills Needed</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                {filtered.map((req) => {
                  const reqId = req._id || req.id;
                  const isOpen = req.status === 'Open';
                  return (
                    <tr key={reqId} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-gray-900/40'}`}>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5 max-w-sm">
                          <p className={`font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{req.title}</p>
                          <p className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-indigo-600 font-medium' : 'text-indigo-400'}`}>
                            <Trophy className="w-3 h-3" /> {req.hackathon?.title || 'Hackathon'}
                          </p>
                        </div>
                      </td>

                      <td className={`py-4 px-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <School className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {req.collegeId?.name || 'Campus'}
                          </span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={req.postedBy?.avatarUrl}
                            name={req.postedBy?.name}
                            size="sm"
                          />
                          <div>
                            <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{req.postedBy?.name || 'Student'}</p>
                            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{req.postedBy?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {req.skillsNeeded?.slice(0, 3).map((sk) => (
                            <SkillChip key={sk} skill={sk} variant="required" size="sm" />
                          ))}
                          {req.skillsNeeded?.length > 3 && (
                            <span className="text-[10px] text-gray-500 self-center">
                              +{req.skillsNeeded.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      <td className="py-4 px-6 text-right">
                        <SpatialButton
                          variant={isOpen ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(reqId, req.status)}
                        >
                          {isOpen ? 'Close Post' : 'Reopen'}
                        </SpatialButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <GitPullRequest className="w-10 h-10 text-gray-600 mx-auto" />
            <p>No team requests match your criteria.</p>
          </div>
        )}
      </SpatialPanel>
    </div>
  );
};

export default AdminTeamRequests;
