import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
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
import { SpatialCard, SpatialPanel, SpatialButton } from '../../components/spatial';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboard = () => {
  const { user, isSuperAdmin, collegeName } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
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
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading admin control metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <SpatialPanel padding="normal" className="border-red-500/30 text-center text-red-400 text-sm">
        {error}
      </SpatialPanel>
    );
  }

  const metrics = data?.metrics || {};
  const isPlatformWide = data?.scope === 'PLATFORM_WIDE';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <SpatialPanel padding="loose" className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                status={isSuperAdmin ? 'superadmin' : 'collegeadmin'}
                label={isPlatformWide ? 'Platform-Wide Authority' : 'Campus-Scoped Console'}
                size="sm"
              />

              {collegeName && (
                <StatusBadge
                  status="campus"
                  label={collegeName}
                  size="sm"
                />
              )}
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isSuperAdmin ? 'Global Command Center' : `${collegeName || 'Campus'} Operations`}
            </h1>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'} max-w-xl`}>
              {isSuperAdmin
                ? 'Multi-college governance: campuses, administrators, experience verifications, and system audits.'
                : 'Moderating registered campus students, reviewing experience verification requests, and inspecting open team formation.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <SpatialButton
              to="/admin/verification"
              variant="outline"
              size="sm"
              icon={BadgeCheck}
            >
              Review Verifications
            </SpatialButton>
            {isSuperAdmin && (
              <SpatialButton
                to="/admin/colleges"
                variant="primary"
                size="sm"
                icon={Building2}
              >
                Manage Campuses
              </SpatialButton>
            )}
            <SpatialButton
              to="/admin/students"
              variant="secondary"
              size="sm"
              icon={Users}
            >
              Manage Students
            </SpatialButton>
          </div>
        </div>
      </SpatialPanel>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        {isPlatformWide ? (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Total Colleges</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalColleges || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              <span className="text-emerald-500 font-bold">{metrics.activeColleges || 0}</span> active institutions
            </p>
          </SpatialCard>
        ) : (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Total Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalStudents || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              <span className="text-emerald-500 font-bold">{metrics.activeStudents || 0}</span> active accounts
            </p>
          </SpatialCard>
        )}

        {/* Metric 2 */}
        {isPlatformWide ? (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Total Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalStudents || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              <span className="text-emerald-500 font-bold">{metrics.activeStudents || 0}</span> active accounts
            </p>
          </SpatialCard>
        ) : (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Active Students</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.activeStudents || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Verified & active</p>
          </SpatialCard>
        )}

        {/* Metric 3 */}
        {isPlatformWide ? (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>College Admins</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalCollegeAdmins || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Managing campus tenants</p>
          </SpatialCard>
        ) : (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Pending Verifications</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-500">{metrics.pendingVerifications || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Awaiting your approval</p>
          </SpatialCard>
        )}

        {/* Metric 4 */}
        {isPlatformWide ? (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Total Hackathons</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalHackathons || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Global & campus events</p>
          </SpatialCard>
        ) : (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Verified Students</span>
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-500">{metrics.verifiedStudents || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Skill credentials approved</p>
          </SpatialCard>
        )}

        {/* Metric 5 */}
        <SpatialCard elevation="raised" padding="normal" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Team Requests</span>
            <GitPullRequest className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalTeamRequests || 0}</div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            <span className="text-emerald-500 font-bold">{metrics.openTeamRequests || 0}</span> currently open
          </p>
        </SpatialCard>

        {/* Metric 6 */}
        <SpatialCard elevation="raised" padding="normal" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Applications</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{metrics.totalApplications || 0}</div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            <span className="text-emerald-500 font-bold">{metrics.acceptedApplications || 0}</span> accepted
          </p>
        </SpatialCard>

        {/* Metric 7 (SuperAdmin: Pending Verifications) */}
        {isPlatformWide && (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Pending Verifications</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-500">{metrics.pendingVerifications || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Across all institutions</p>
          </SpatialCard>
        )}

        {/* Metric 8 (SuperAdmin: Verified Experiences) */}
        {isPlatformWide && (
          <SpatialCard elevation="raised" padding="normal" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} font-medium`}>Verified Experiences</span>
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-500">{metrics.verifiedExperiences || 0}</div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Platform-wide verified developers</p>
          </SpatialCard>
        )}
      </div>

      {/* Super Admin: Automated Hackathon Discovery & Sync Overview */}
      {isPlatformWide && (
        <SpatialPanel padding="normal" className="space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${isLight ? 'border-slate-200' : 'border-gray-800'} pb-3`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Automated Hackathon Discovery & Sync</h3>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Continuous external sync and campus directory freshness</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Last Sync: <strong className="text-cyan-500 font-semibold">{metrics.lastSync ? new Date(metrics.lastSync).toLocaleString() : 'Not yet run'}</strong>
              </span>
              <SpatialButton
                to="/admin/hackathons"
                variant="secondary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
              >
                Sync Center
              </SpatialButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/50 border-gray-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Total Hackathons</span>
              <div className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} mt-0.5`}>{metrics.totalHackathons || 0}</div>
            </div>
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/50 border-gray-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>External Feeds</span>
              <div className="text-xl font-extrabold text-cyan-500 mt-0.5">{metrics.externalHackathons || 0}</div>
            </div>
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/50 border-gray-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Manual / Campus</span>
              <div className="text-xl font-extrabold text-amber-500 mt-0.5">{metrics.manualHackathons || 0}</div>
            </div>
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/50 border-gray-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Upcoming</span>
              <div className="text-xl font-extrabold text-emerald-500 mt-0.5">{metrics.upcomingHackathons || 0}</div>
            </div>
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/50 border-gray-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Closing Soon</span>
              <div className="text-xl font-extrabold text-rose-500 mt-0.5">{metrics.closingSoonHackathons || 0}</div>
            </div>
          </div>
        </SpatialPanel>
      )}

      {/* Super Admin: Recent Audit Log Table */}
      {isPlatformWide && data?.recentAudits && (
        <SpatialPanel padding="normal" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
              <Activity className="w-4 h-4 text-purple-400" />
              Recent Administrative Activity
            </h3>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Immutable Audit Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-600' : 'border-gray-800 text-gray-400'}`}>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                {data.recentAudits.slice(0, 5).map((log) => (
                  <tr key={log._id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-gray-900/40'}>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                        isLight
                          ? 'text-purple-700 bg-purple-50 border-purple-200'
                          : 'text-purple-300 bg-purple-950/40 border-purple-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${isLight ? 'text-slate-800' : 'text-gray-300'} font-medium`}>
                      {log.actor?.name || 'System'}
                      <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{log.role}</span>
                    </td>
                    <td className={`py-3 px-4 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                      {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                    </td>
                    <td className={`py-3 px-4 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
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
        </SpatialPanel>
      )}
    </div>
  );
};

export default AdminDashboard;
