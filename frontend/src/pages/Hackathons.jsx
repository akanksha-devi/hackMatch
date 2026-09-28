import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trophy, Filter, Plus, Globe, Sparkles, Clock, Calendar, CheckCircle2, History, Loader2 } from 'lucide-react';
import apiService from '../services/apiService';
import { HackathonCard } from '../components/HackathonCard';
import { useAuth } from '../hooks/useAuth';
import { SpatialPanel, SpatialDropdown, SpatialModal, SpatialDatePicker, SpatialButton } from '../components/spatial';

const TIMELINE_TABS = [
  { id: 'All', label: 'All Hackathons', icon: Trophy },
  { id: 'Upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'Closing Soon', label: 'Closing Soon', icon: Clock },
  { id: 'Active', label: 'Active', icon: CheckCircle2 },
  { id: 'Past', label: 'Past', icon: History },
  { id: 'Recently Added', label: 'Recently Added', icon: Sparkles },
];

const ALL_TAGS = ['All', 'AI', 'Web Dev', 'Web3', 'Blockchain', 'UI/UX', 'Solidity', 'Python', 'IoT', 'Mobile'];

export const Hackathons = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // New hackathon form state
  const [newTitle, setNewTitle] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newMode, setNewMode] = useState('Online');
  const [newLocation, setNewLocation] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newRegistrationDeadline, setNewRegistrationDeadline] = useState('');
  const [newRegistrationLink, setNewRegistrationLink] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('AI, Web Dev');
  const [newDescription, setNewDescription] = useState('');

  const loadHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedTimeline !== 'All') {
        params.timeline = selectedTimeline;
      } else {
        params.status = 'All'; // Allow showing both active and past when All tab is selected
      }

      if (selectedSource !== 'All') {
        params.source = selectedSource;
      }

      const res = await apiService.getHackathons(params);
      if (res.success && res.hackathons) {
        setHackathons(res.hackathons);
      }
    } catch (err) {
      console.error('Failed to load hackathons:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeline, selectedSource]);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      (h.title && h.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.organizer && h.organizer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.location && h.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = selectedMode === 'All' || h.mode === selectedMode;
    const matchesTag =
      selectedTag === 'All' || (h.tags && h.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

    return matchesSearch && matchesMode && matchesTag;
  });

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    const tagsArray = newTagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      await apiService.createHackathon({
        title: newTitle,
        organizer: newOrganizer,
        mode: newMode,
        location: newLocation,
        startDate: newStartDate,
        endDate: newEndDate,
        registrationDeadline: newRegistrationDeadline,
        registrationLink: newRegistrationLink,
        tags: tagsArray,
        description: newDescription,
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewOrganizer('');
      setNewDescription('');
      await loadHackathons();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating hackathon');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Real-Time External Sync
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-indigo-400" />
            Hackathons Directory
          </h1>
          <p className="text-sm text-gray-400">Discover top hackathons automatically synchronized from external sources & campus organizers.</p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            List a Hackathon
          </button>
        )}
      </div>

      {/* Timeline Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-800/80">
        {TIMELINE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTimeline === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTimeline(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter & Search Controls */}
      <SpatialPanel className="border border-gray-800 flex flex-col md:flex-row items-center gap-4 relative z-20">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hackathons by name, organizer, location, or topic..."
            className="w-full spatial-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Source Filter Dropdown */}
        <div className="w-full md:w-48">
          <SpatialDropdown
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            icon={Globe}
            options={[
              { value: 'All', label: 'All Sources' },
              { value: 'curated', label: 'Curated Feed' },
              { value: 'external', label: 'External Only' },
              { value: 'manual', label: 'Campus & Manual' },
            ]}
          />
        </div>

        {/* Mode Dropdown */}
        <div className="w-full md:w-40">
          <SpatialDropdown
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            icon={Filter}
            options={[
              { value: 'All', label: 'All Modes' },
              { value: 'Online', label: 'Online' },
              { value: 'Offline', label: 'Offline' },
              { value: 'Hybrid', label: 'Hybrid' },
            ]}
          />
        </div>
      </SpatialPanel>

      {/* Tag Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-gray-500 font-semibold shrink-0">Filter Tag:</span>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
              selectedTag === tag
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Loading hackathons...</p>
        </div>
      ) : filteredHackathons.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Showing <strong className="text-white">{filteredHackathons.length}</strong> event{filteredHackathons.length !== 1 ? 's' : ''}</span>
            {selectedTimeline !== 'All' && (
              <span className="text-indigo-400 font-medium">Category: {selectedTimeline}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((h) => (
              <HackathonCard key={h._id || h.id} hackathon={h} />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-4">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Hackathons Found</h3>
          <p className="text-sm text-gray-400">Try adjusting your category tab, source, or search keywords.</p>
        </div>
      )}

      {/* Create Hackathon Spatial Modal */}
      <SpatialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="List a New Hackathon"
        subtitle="Publish a hackathon for your campus and community."
        icon={Trophy}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <SpatialButton
              type="submit"
              form="create-hackathon-form"
              disabled={createSubmitting}
              loading={createSubmitting}
              variant="primary"
            >
              Publish Hackathon
            </SpatialButton>
          </>
        }
      >
        <form id="create-hackathon-form" onSubmit={handleCreateHackathon} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700">Hackathon Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AI Innovation Hackathon"
              className="w-full spatial-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700">Organizer *</label>
              <input
                type="text"
                required
                value={newOrganizer}
                onChange={(e) => setNewOrganizer(e.target.value)}
                placeholder="e.g. Google Developer Group"
                className="w-full spatial-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <SpatialDropdown
                label="Mode"
                value={newMode}
                onChange={(e) => setNewMode(e.target.value)}
                options={['Online', 'Offline', 'Hybrid']}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700">Location</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Campus Auditorium / Virtual"
              className="w-full spatial-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <SpatialDatePicker
                label="Start Date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-1">
              <SpatialDatePicker
                label="End Date"
                value={newEndDate}
                minDate={newStartDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <SpatialDatePicker
                label="Registration Deadline"
                value={newRegistrationDeadline}
                maxDate={newStartDate || undefined}
                onChange={(e) => setNewRegistrationDeadline(e.target.value)}
                placeholder="Select deadline"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700">Registration Link</label>
              <input
                type="url"
                value={newRegistrationLink}
                onChange={(e) => setNewRegistrationLink(e.target.value)}
                placeholder="https://..."
                className="w-full spatial-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700">Tags (comma-separated)</label>
            <input
              type="text"
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
              placeholder="AI, Web Dev, Python"
              className="w-full spatial-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 dark:text-gray-300 light:text-slate-700">Description</label>
            <textarea
              rows="3"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Tell students what this hackathon is about..."
              className="w-full spatial-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
            ></textarea>
          </div>
        </form>
      </SpatialModal>
    </div>
  );
};
