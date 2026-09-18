import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import {
  Users,
  Building2,
  GitPullRequest,
  Trophy,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  School,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Activity,
  Award,
  BadgeCheck,
  CheckCheck,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, isSuperAdmin, collegeName } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await apiService.getAdminDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
        setError(err.response?.data?.message || 'Failed to load administrative overview');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400">Loading admin control metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-500/30 text-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const isPlatformWide = data?.scope === 'PLATFORM_WIDE';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden bg-gradient-to-r from-gray-950 via-indigo-950/40 to-gray-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  isSuperAdmin
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}
              >
                {isSuperAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {isPlatformWide ? 'Platform-Wide Authority' : 'Campus-Scoped Console'}
              </span>

              {collegeName && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  {collegeName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isSuperAdmin ? 'Global Command Center' : `${collegeName || 'Campus'} Operations`}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              {isSuperAdmin
                ? 'Multi-college governance: campuses, administrators, experience verifications, and system audits.'
                : 'Moderating registered campus students, reviewing experience verification requests, and inspecting open team formation.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              to="/admin/verification"
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <BadgeCheck className="w-4 h-4" />
              Review Verifications
            </Link>
            {isSuperAdmin && (
              <Link
                to="/admin/colleges"
                className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
              >
                <Building2 className="w-4 h-4" />
                Manage Campuses
              </Link>
            )}
            <Link
              to="/admin/students"
              className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 hover:border-gray-700 transition-all"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Manage Students
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        {isPlatformWide ? (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Total Colleges</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalColleges || 0}</div>
            <p className="text-[11px] text-gray-500">
              <span className="text-emerald-400 font-bold">{metrics.activeColleges || 0}</span> active institutions
            </p>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Total Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalStudents || 0}</div>
            <p className="text-[11px] text-gray-500">
              <span className="text-emerald-400 font-bold">{metrics.activeStudents || 0}</span> active accounts
            </p>
          </div>
        )}

        {/* Metric 2 */}
        {isPlatformWide ? (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Total Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalStudents || 0}</div>
            <p className="text-[11px] text-gray-500">
              <span className="text-emerald-400 font-bold">{metrics.activeStudents || 0}</span> active accounts
            </p>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Active Students</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.activeStudents || 0}</div>
            <p className="text-[11px] text-gray-500">Verified & active</p>
          </div>
        )}

        {/* Metric 3 */}
        {isPlatformWide ? (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">College Admins</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalCollegeAdmins || 0}</div>
            <p className="text-[11px] text-gray-500">Managing campus tenants</p>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Pending Verifications</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{metrics.pendingVerifications || 0}</div>
            <p className="text-[11px] text-gray-500">Awaiting your approval</p>
          </div>
        )}

        {/* Metric 4 */}
        {isPlatformWide ? (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Total Hackathons</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{metrics.totalHackathons || 0}</div>
            <p className="text-[11px] text-gray-500">Global & campus events</p>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Verified Students</span>
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{metrics.verifiedStudents || 0}</div>
            <p className="text-[11px] text-gray-500">Skill credentials approved</p>
          </div>
        )}

        {/* Metric 5 */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Team Requests</span>
            <GitPullRequest className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalTeamRequests || 0}</div>
          <p className="text-[11px] text-gray-500">
            <span className="text-emerald-400 font-bold">{metrics.openTeamRequests || 0}</span> currently open
          </p>
        </div>

        {/* Metric 6 */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Applications</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalApplications || 0}</div>
          <p className="text-[11px] text-gray-500">
            <span className="text-emerald-400 font-bold">{metrics.acceptedApplications || 0}</span> accepted
          </p>
        </div>

        {/* Metric 7 (SuperAdmin: Pending Verifications) */}
        {isPlatformWide && (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Pending Verifications</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{metrics.pendingVerifications || 0}</div>
            <p className="text-[11px] text-gray-500">Across all institutions</p>
          </div>
        )}

        {/* Metric 8 (SuperAdmin: Verified Experiences) */}
        {isPlatformWide && (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Verified Experiences</span>
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{metrics.verifiedExperiences || 0}</div>
            <p className="text-[11px] text-gray-500">Platform-wide verified developers</p>
          </div>
        )}
      </div>

      {/* Super Admin: Automated Hackathon Discovery & Sync Overview */}
      {isPlatformWide && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Automated Hackathon Discovery & Sync</h3>
                <p className="text-[11px] text-gray-400">Continuous external sync and campus directory freshness</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">
                Last Sync: <strong className="text-cyan-400">{metrics.lastSync ? new Date(metrics.lastSync).toLocaleString() : 'Not yet run'}</strong>
              </span>
              <Link
                to="/admin/hackathons"
                className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                Sync Center <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-500">Total Hackathons</span>
              <div className="text-xl font-extrabold text-white mt-0.5">{metrics.totalHackathons || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-500">External Feeds</span>
              <div className="text-xl font-extrabold text-cyan-400 mt-0.5">{metrics.externalHackathons || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-500">Manual / Campus</span>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">{metrics.manualHackathons || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-500">Upcoming</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{metrics.upcomingHackathons || 0}</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-500">Closing Soon</span>
              <div className="text-xl font-extrabold text-rose-400 mt-0.5">{metrics.closingSoonHackathons || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Recent Audit Log Table */}
      {isPlatformWide && data?.recentAudits && (
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Recent Administrative Activity
            </h3>
            <span className="text-xs text-gray-500">Immutable Audit Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {data.recentAudits.slice(0, 5).map((log) => (
                  <tr key={log._id} className="hover:bg-gray-900/40">
                    <td className="py-3 px-4">
                      <span className="font-mono text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-medium">
                      {log.actor?.name || 'System'}
                      <span className="block text-[10px] text-gray-500">{log.role}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(log.createdAt || log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
