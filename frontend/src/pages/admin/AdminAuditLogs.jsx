import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { useTheme } from '../../context/ThemeContext';
import { SpatialPanel, SpatialDropdown, SpatialButton, SpatialInput } from '../../components/spatial';
import { StatusBadge } from '../../components/StatusBadge';
import { Avatar } from '../../components/Avatar';
import {
  History,
  Search,
  Shield,
  Activity,
  Calendar,
  School,
  User,
  Filter,
  Loader2
} from 'lucide-react';

export const AdminAuditLogs = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAuditLogs();
      if (res.success && res.auditLogs) {
        setLogs(res.auditLogs);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    const actionMatch = actionFilter === 'All' || l.action === actionFilter;
    const searchMatch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.actor?.name && l.actor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.actor?.email && l.actor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.targetType && l.targetType.toLowerCase().includes(searchTerm.toLowerCase()));

    return actionMatch && searchMatch;
  });

  const uniqueActions = ['All', ...new Set(logs.map((l) => l.action).filter(Boolean))];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-8 h-8 text-purple-400" />
            Security & Administration Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Immutable log of administrative events, privilege assignments, college onboarding, and moderation actions.
          </p>
        </div>

        <SpatialButton
          variant="outline"
          size="sm"
          onClick={loadLogs}
          loading={loading}
        >
          Refresh Logs
        </SpatialButton>
      </div>

      {/* Filter Toolbar */}
      <SpatialPanel padding="compact" className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SpatialInput
            size="sm"
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor name, or target..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-64">
          <SpatialDropdown
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            options={uniqueActions.map((a) => ({
              value: a,
              label: a === 'All' ? 'All Actions' : a,
            }))}
            placeholder="Filter by Action..."
            icon={Filter}
          />
        </div>
      </SpatialPanel>

      {/* Table */}
      <SpatialPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading audit history...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${
                  isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-gray-950/40 text-gray-400 border-gray-800'
                }`}>
                  <th className="py-3.5 px-6 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Actor</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Target</th>
                  <th className="py-3.5 px-6 font-semibold">Metadata / Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                {filtered.map((log) => {
                  const logId = log._id || log.id;
                  return (
                    <tr key={logId} className={`transition-colors font-sans ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-gray-900/40'
                    }`}>
                      <td className={`py-4 px-6 text-[11px] whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        {new Date(log.timestamp).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </td>

                      <td className={`py-4 px-4 font-mono font-bold ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                        {log.action}
                      </td>

                      <td className={`py-4 px-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={log.actor?.name || log.actor?.email || 'System'}
                            size="xs"
                          />
                          <span>{log.actor?.name || log.actor?.email || 'System'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge
                          status={log.role}
                          size="sm"
                          accent={log.role === 'superAdmin' ? 'purple' : 'indigo'}
                        />
                      </td>

                      <td className={`py-4 px-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                        {log.targetType || 'N/A'}
                      </td>

                      <td className={`py-4 px-6 text-[11px] max-w-xs truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details)
                          : String(log.details || '-')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Activity className="w-10 h-10 text-gray-600 mx-auto" />
            <p>No audit trail events found.</p>
          </div>
        )}
      </SpatialPanel>
    </div>
  );
};

export default AdminAuditLogs;
