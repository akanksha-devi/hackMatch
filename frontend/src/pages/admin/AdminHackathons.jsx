import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { SkillChip } from '../../components/SkillChip';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { SpatialPanel, SpatialModal, SpatialDatePicker, SpatialDropdown, SpatialButton, SpatialInput, SpatialTextarea } from '../../components/spatial';
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export const AdminHackathons = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { isSuperAdmin } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync state (Super Admin)
  const [syncStatusData, setSyncStatusData] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [mode, setMode] = useState('Online');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [tagsInput, setTagsInput] = useState('AI, Web Dev');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadHackathons();
    if (isSuperAdmin) {
      loadSyncStatus();
    }
  }, [isSuperAdmin]);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const res = await apiService.getHackathons({ status: 'All' });
      if (res.success && res.hackathons) {
        setHackathons(res.hackathons);
      }
    } catch (err) {
      console.error('Error loading hackathons:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const res = await apiService.getHackathonSyncStatus();
      if (res.success) {
        setSyncStatusData(res);
      }
    } catch (err) {
      console.error('Error loading sync status:', err);
    }
  };

  const handleSyncNow = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const res = await apiService.triggerHackathonSync();
      if (res.success && res.result) {
        const r = res.result;
        setSyncMessage({
          type: 'success',
          text: `Sync completed (${r.status}): Fetched ${r.fetchedCount}, Created ${r.createdCount}, Updated ${r.updatedCount}, Expired ${r.expiredCount}, Skipped ${r.skippedCount}, Errors ${r.errorCount}`,
        });
        await Promise.all([loadHackathons(), loadSyncStatus()]);
      }
    } catch (err) {
      setSyncMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to execute hackathon synchronization',
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const tagsArray = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      await apiService.createHackathon({
        title,
        organizer,
        mode,
        location,
        startDate,
        endDate,
        registrationDeadline,
        registrationLink,
        tags: tagsArray,
        description,
      });

      setShowModal(false);
      setTitle('');
      setOrganizer('');
      setDescription('');
      await loadHackathons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating hackathon');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = hackathons.filter(
    (h) =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.source && h.source.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSourceBadge = (source, isExternal) => {
    if (isExternal) {
      const s = (source || '').toLowerCase();
      return (
        <StatusBadge
          status={s}
          type="source"
          label={s === 'curated' ? 'Curated Feed' : (source || 'External')}
          size="sm"
        />
      );
    }
    return <StatusBadge status="internal" type="source" label="Manual" size="sm" />;
  };

  const latestLog = syncStatusData?.latestLog;
  const sources = syncStatusData?.sources || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? 'border-slate-200' : 'border-gray-800'} pb-6`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2.5`}>
            <Trophy className="w-8 h-8 text-amber-500" />
            Hackathons Directory Management
          </h1>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'} mt-1`}>
            Automated external discovery, campus synchronization, and institutional publishing.
          </p>
        </div>

        <SpatialButton
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={Plus}
        >
          Publish Hackathon
        </SpatialButton>
      </div>

      {/* Super Admin: Hackathon Data Sync Command Center */}
      {isSuperAdmin && (
        <SpatialPanel padding="normal" className="space-y-6">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? 'border-slate-200' : 'border-gray-800'} pb-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
                  Hackathon Data Sync Engine
                  <StatusBadge
                    status="cron"
                    label="Vercel Cron: 0 4 * * *"
                    size="sm"
                  />
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  Automated background discovery via scheduled Vercel Cron (`CRON_SECRET`) and manual Super Admin sync.
                </p>
              </div>
            </div>

            <SpatialButton
              variant="secondary"
              size="sm"
              onClick={handleSyncNow}
              disabled={syncLoading}
              isLoading={syncLoading}
              icon={RefreshCw}
            >
              Sync Now
            </SpatialButton>
          </div>

          {syncMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                syncMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {syncMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{syncMessage.text}</span>
            </div>
          )}

          {/* Sync KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Sync Status</span>
              <p className={`text-sm font-extrabold mt-0.5 ${
                latestLog?.status === 'SUCCESS' ? 'text-emerald-500' :
                latestLog?.status === 'PARTIAL' ? 'text-amber-500' :
                latestLog?.status === 'FAILED' ? 'text-rose-500' : isLight ? 'text-slate-500' : 'text-gray-400'
              }`}>
                {latestLog?.status || 'IDLE'}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Fetched</span>
              <p className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} mt-0.5`}>{latestLog?.fetchedCount || 0}</p>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Created</span>
              <p className="text-sm font-extrabold text-cyan-500 mt-0.5">{latestLog?.createdCount || 0}</p>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Updated</span>
              <p className="text-sm font-extrabold text-indigo-500 mt-0.5">{latestLog?.updatedCount || 0}</p>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Expired</span>
              <p className="text-sm font-extrabold text-amber-500 mt-0.5">{latestLog?.expiredCount || 0}</p>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Skipped</span>
              <p className={`text-sm font-extrabold ${isLight ? 'text-slate-600' : 'text-gray-400'} mt-0.5`}>{latestLog?.skippedCount || 0}</p>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200 shadow-xs' : 'bg-gray-900/60 border-gray-800'}`}>
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Errors</span>
              <p className={`text-sm font-extrabold mt-0.5 ${latestLog?.errorCount > 0 ? 'text-rose-500' : isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                {latestLog?.errorCount || 0}
              </p>
            </div>
          </div>

          {/* Sources Health Table */}
          <div className="space-y-2">
            <h4 className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-gray-300'} flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> External Source Adapters Health
            </h4>
            <div className={`overflow-x-auto rounded-xl border ${isLight ? 'border-slate-200 bg-white/70 shadow-xs' : 'border-gray-800 bg-gray-950/40'}`}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-600 bg-slate-50/70' : 'border-gray-800 text-gray-400'}`}>
                    <th className="py-2.5 px-4 font-semibold">Source</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Last Sync</th>
                    <th className="py-2.5 px-4 font-semibold">Records</th>
                    <th className="py-2.5 px-4 font-semibold">Status Notes</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                  {sources.map((src) => {
                    return (
                      <tr key={src.id} className={`hover:${isLight ? 'bg-slate-50/70' : 'bg-gray-900/30'} transition-colors`}>
                        <td className={`py-2.5 px-4 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {src.name}
                          <span className={`block text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'} font-mono font-normal`}>{src.id}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status={src.status} size="sm" />
                        </td>
                        <td className={`py-2.5 px-4 ${isLight ? 'text-slate-500' : 'text-gray-400'} text-[11px]`}>
                          {src.lastSync ? new Date(src.lastSync).toLocaleString() : 'Never'}
                        </td>
                        <td className={`py-2.5 px-4 ${isLight ? 'text-slate-700' : 'text-gray-300'} font-semibold`}>
                          {src.recordsCount || 0}
                        </td>
                        <td className={`py-2.5 px-4 text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'} max-w-xs truncate`}>
                          {src.error || src.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SpatialPanel>
      )}

      {/* Search Bar */}
      <div>
        <SpatialInput
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter hackathons by title, organizer, or source..."
        />
      </div>

      {/* Table */}
      <SpatialPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading hackathons...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50/70 text-slate-600' : 'border-gray-800 bg-gray-950/40 text-gray-400'}`}>
                  <th className="py-3.5 px-6 font-semibold">Hackathon</th>
                  <th className="py-3.5 px-4 font-semibold">Organizer</th>
                  <th className="py-3.5 px-4 font-semibold">Source</th>
                  <th className="py-3.5 px-4 font-semibold">Mode</th>
                  <th className="py-3.5 px-4 font-semibold">Dates</th>
                  <th className="py-3.5 px-4 font-semibold">Tags</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Links</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/60'}`}>
                {filtered.map((h) => {
                  const hId = h._id || h.id;
                  return (
                    <tr key={hId} className={`hover:${isLight ? 'bg-slate-50/70' : 'bg-gray-900/40'} transition-colors`}>
                      <td className={`py-4 px-6 font-bold ${isLight ? 'text-slate-900' : 'text-white'} max-w-xs`}>
                        <p className="line-clamp-1">{h.title}</p>
                        {h.description && (
                          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'} font-normal line-clamp-1`}>
                            {h.description}
                          </p>
                        )}
                      </td>

                      <td className={`py-4 px-4 ${isLight ? 'text-slate-700' : 'text-gray-300'} font-medium`}>
                        {h.organizer}
                      </td>

                      <td className="py-4 px-4">
                        {getSourceBadge(h.source, h.isExternal)}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={h.mode} type="mode" size="sm" />
                      </td>

                      <td className={`py-4 px-4 ${isLight ? 'text-slate-500' : 'text-gray-400'} text-[11px]`}>
                        {h.startDate ? new Date(h.startDate).toLocaleDateString() : 'TBA'}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {h.tags?.slice(0, 3).map((tag) => (
                            <SkillChip key={tag} skill={tag} variant="default" size="sm" />
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {h.registrationLink && (
                          <a
                            href={h.registrationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-semibold"
                          >
                            Official Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`py-16 text-center ${isLight ? 'text-slate-500' : 'text-gray-400'} text-xs`}>
            No hackathons matched your search.
          </div>
        )}
      </SpatialPanel>

      {/* Publish Spatial Modal */}
      <SpatialModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Publish Hackathon"
        subtitle="Create an official campus or external hackathon entry."
        icon={Trophy}
        maxWidth="max-w-2xl"
        footer={
          <>
            <SpatialButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </SpatialButton>
            <SpatialButton
              type="submit"
              form="admin-create-hackathon-form"
              disabled={submitting}
              loading={submitting}
              variant="primary"
            >
              Publish Hackathon
            </SpatialButton>
          </>
        }
      >
        <form id="admin-create-hackathon-form" onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Title *</label>
            <SpatialInput
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. National Smart Hackathon 2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Organizer *</label>
              <SpatialInput
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. IEEE Student Branch"
              />
            </div>
            <div className="space-y-1">
              <SpatialDropdown
                label="Mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                options={['Online', 'Offline', 'Hybrid']}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Location</label>
            <SpatialInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Campus Auditorium / Online"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <SpatialDatePicker
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-1">
              <SpatialDatePicker
                label="End Date"
                value={endDate}
                minDate={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <SpatialDatePicker
                label="Registration Deadline"
                value={registrationDeadline}
                maxDate={startDate || undefined}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                placeholder="Select deadline"
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Registration Link</label>
              <SpatialInput
                type="url"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Tags (comma-separated)</label>
            <SpatialInput
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, Web Dev, Mobile"
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Description</label>
            <SpatialTextarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about prize pool, problem statements..."
            />
          </div>
        </form>
      </SpatialModal>
    </div>
  );
};
