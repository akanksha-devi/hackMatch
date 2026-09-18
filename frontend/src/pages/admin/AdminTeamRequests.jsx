import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { SkillTag } from '../../components/SkillTag';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <GitPullRequest className="w-8 h-8 text-indigo-400" />
            Team Request Moderation
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isSuperAdmin
              ? 'Platform-wide team requests across all campus environments.'
              : `Moderating student team requests for ${collegeName}.`}
          </p>
        </div>

        <div className="text-xs text-gray-400 font-semibold px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 shrink-0">
          Total Requests: <strong className="text-white">{requests.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by request title, hackathon, or student name..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Requests</option>
            <option value="Open">Open Only</option>
            <option value="Closed">Closed Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Loading requests...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/40 text-gray-400">
                  <th className="py-3.5 px-6 font-semibold">Request Title & Hackathon</th>
                  <th className="py-3.5 px-4 font-semibold">Campus</th>
                  <th className="py-3.5 px-4 font-semibold">Posted By</th>
                  <th className="py-3.5 px-4 font-semibold">Skills Needed</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filtered.map((req) => {
                  const reqId = req._id || req.id;
                  const isOpen = req.status === 'Open';
                  return (
                    <tr key={reqId} className="hover:bg-gray-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="space-y-0.5 max-w-sm">
                          <p className="font-bold text-white line-clamp-1">{req.title}</p>
                          <p className="text-[11px] text-indigo-400 flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> {req.hackathon?.title || 'Hackathon'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-gray-300">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <School className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {req.collegeId?.name || 'Campus'}
                          </span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-gray-300">
                        <p className="font-semibold text-white">{req.postedBy?.name || 'Student'}</p>
                        <p className="text-[10px] text-gray-500">{req.postedBy?.email}</p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {req.skillsNeeded?.slice(0, 3).map((sk) => (
                            <SkillTag key={sk} name={sk} size="sm" />
                          ))}
                          {req.skillsNeeded?.length > 3 && (
                            <span className="text-[10px] text-gray-500 self-center">
                              +{req.skillsNeeded.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            isOpen
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(reqId, req.status)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isOpen
                              ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                              : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                          }`}
                        >
                          {isOpen ? 'Close Post' : 'Reopen'}
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
            <GitPullRequest className="w-10 h-10 text-gray-600 mx-auto" />
            <p>No team requests match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeamRequests;
