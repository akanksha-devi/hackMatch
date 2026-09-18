import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
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

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition-all"
        >
          Refresh Logs
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor name, or target..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full md:w-auto bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Actions' : a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Loading audit history...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/40 text-gray-400">
                  <th className="py-3.5 px-6 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Actor</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Target</th>
                  <th className="py-3.5 px-6 font-semibold">Metadata / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {filtered.map((log) => {
                  const logId = log._id || log.id;
                  return (
                    <tr key={logId} className="hover:bg-gray-900/40 transition-colors font-sans">
                      <td className="py-4 px-6 text-gray-400 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-purple-300">
                        {log.action}
                      </td>

                      <td className="py-4 px-4 text-white font-medium">
                        {log.actor?.name || log.actor?.email || 'System'}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-900 border border-gray-800 text-gray-400">
                          {log.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-gray-300">
                        {log.targetType || 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-gray-400 text-[11px] max-w-xs truncate">
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
      </div>
    </div>
  );
};

export default AdminAuditLogs;
