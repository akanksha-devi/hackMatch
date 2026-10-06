import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trophy, Filter, Plus, Globe, Sparkles, Clock, Calendar, CheckCircle2, History, Loader2, School, ArrowRight } from 'lucide-react';
import apiService from '../services/apiService';
import { HackathonCard } from '../components/HackathonCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { SpatialPanel, SpatialCard, SpatialDropdown, SpatialModal, SpatialDatePicker, SpatialButton, FilterChip, SpatialTabs, SpatialInput, SpatialTextarea } from '../components/spatial';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
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
    <div className="space-y-10 sm:space-y-12 pb-16">
      
      {/* =====================================================================
          LAYER 2 & 5: SPATIAL EVENT DISCOVERY IDENTITY
          ===================================================================== */}
      <section aria-label="Hackathons Directory Header" className="relative pt-2">
        <div 
          className={`absolute -top-16 left-0 w-96 h-96 blur-3xl rounded-full pointer-events-none transition-opacity duration-700 ${
            isLight ? 'bg-indigo-300/25' : 'bg-indigo-600/15'
          }`} 
          aria-hidden="true" 
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                status="sync"
                accent="cyan"
                icon={Globe}
                label="Real-Time External Sync"
                size="sm"
              />
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
              }`}>
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                {hackathons.length} Competitions Indexed
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-3`}>
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 shrink-0" />
              <span>Hackathons Directory</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              Discover, track, and form squads for top collegiate hackathons synchronized from verified global feeds and campus organizers.
            </p>
          </div>

          {user && (
            <div className="shrink-0">
              <SpatialButton
                variant="primary"
                size="md"
                onClick={() => setShowCreateModal(true)}
                icon={Plus}
              >
                List a Hackathon
              </SpatialButton>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          LAYER 3 & 4: FEATURED OPPORTUNITY SPOTLIGHT (PRIMARY FOCAL)
          Presents the highest-priority active hackathon with spatial depth
          ===================================================================== */}
      {filteredHackathons.length > 0 && selectedTimeline === 'All' && !searchTerm && (
        <section aria-label="Featured Hackathon Spotlight" className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
              Spotlight Opportunity
            </span>
          </div>

          <SpatialCard
            accentLine
            elevation="raised"
            hover={false}
            className="p-6 sm:p-8 relative overflow-hidden group border-indigo-500/30"
          >
            <div 
              className={`absolute top-0 right-0 w-80 h-80 blur-3xl rounded-full pointer-events-none ${
                isLight ? 'bg-cyan-100/40' : 'bg-cyan-500/10'
              }`} 
              aria-hidden="true" 
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={filteredHackathons[0].mode} type="mode" size="sm" />
                  <StatusBadge
                    status={filteredHackathons[0].isExternal ? (filteredHackathons[0].source || 'curated') : 'campus'}
                    label={filteredHackathons[0].isExternal ? `Feed: ${filteredHackathons[0].source || 'Curated'}` : 'Campus Official'}
                    size="sm"
                  />
                  {filteredHackathons[0].registrationDeadline && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                    }`}>
                      Register Soon
                    </span>
                  )}
                </div>

                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {filteredHackathons[0].title}
                </h2>

                <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                  {filteredHackathons[0].description || 'Join hackathon developers from across colleges to build innovative projects.'}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium pt-1 flex-wrap">
                  <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                    <School className="w-4 h-4 text-indigo-400 shrink-0" />
                    {filteredHackathons[0].organizer}
                  </span>
                  {filteredHackathons[0].location && (
                    <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      {filteredHackathons[0].location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <SpatialButton
                  to={`/hackathons/${filteredHackathons[0]._id || filteredHackathons[0].id}`}
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                >
                  View Details & Apply
                </SpatialButton>
                <SpatialButton
                  to={`/post-request?hackathonId=${filteredHackathons[0]._id || filteredHackathons[0].id}`}
                  variant="secondary"
                  size="md"
                  icon={Plus}
                >
                  Find Teammates
                </SpatialButton>
              </div>
            </div>
          </SpatialCard>
        </section>
      )}

      {/* =====================================================================
          LAYER 4: TIMELINE CONTROLS & SEARCH TOOLBAR
          ===================================================================== */}
      <section aria-label="Filter Controls" className="space-y-4">
        {/* Timeline Tabs */}
        <div className="pb-1 max-w-full overflow-x-auto scrollbar-none">
          <SpatialTabs
            tabs={TIMELINE_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              icon: tab.icon,
            }))}
            activeTab={selectedTimeline}
            onChange={setSelectedTimeline}
          />
        </div>

        {/* Filter & Search Controls */}
        <SpatialPanel className="flex flex-col md:flex-row items-center gap-4 relative z-20">
          {/* Search Bar */}
          <div className="flex-1 w-full">
            <SpatialInput
              id="hackathons-search"
              icon={Search}
              placeholder="Search hackathons by name, organizer, location, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              clearable
              onClear={() => setSearchTerm('')}
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs max-w-full">
          <span className={`${isLight ? 'text-slate-500' : 'text-gray-400'} font-semibold shrink-0`}>Filter Tag:</span>
          {ALL_TAGS.map((tag) => (
            <FilterChip
              key={tag}
              label={tag}
              active={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
          LAYER 3: EVENT CARDS GRID (TERTIARY)
          ===================================================================== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading hackathons...</p>
        </div>
      ) : filteredHackathons.length > 0 ? (
        <section aria-label="Hackathons List" className="space-y-4">
          <div className={`flex items-center justify-between text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} px-1`}>
            <span>Showing <strong className={isLight ? 'text-slate-900' : 'text-white'}>{filteredHackathons.length}</strong> event{filteredHackathons.length !== 1 ? 's' : ''}</span>
            {selectedTimeline !== 'All' && (
              <span className="text-indigo-500 font-medium">Category: {selectedTimeline}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredHackathons.map((h) => (
              <HackathonCard key={h._id || h.id} hackathon={h} />
            ))}
          </div>
        </section>
      ) : (
        <SpatialPanel padding="loose" className="text-center space-y-4">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>No Hackathons Found</h3>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Try adjusting your category tab, source, or search keywords.</p>
        </SpatialPanel>
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
            <SpatialButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </SpatialButton>
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
            <SpatialInput
              id="create-hackathon-title"
              label="Hackathon Title"
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. AI Innovation Hackathon"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <SpatialInput
                id="create-hackathon-organizer"
                label="Organizer"
                type="text"
                required
                value={newOrganizer}
                onChange={(e) => setNewOrganizer(e.target.value)}
                placeholder="e.g. Google Developer Group"
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
            <SpatialInput
              id="create-hackathon-location"
              label="Location"
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Campus Auditorium / Virtual"
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
              <SpatialInput
                id="create-hackathon-link"
                label="Registration Link"
                type="url"
                value={newRegistrationLink}
                onChange={(e) => setNewRegistrationLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <SpatialInput
              id="create-hackathon-tags"
              label="Tags (comma-separated)"
              type="text"
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
              placeholder="AI, Web Dev, Python"
            />
          </div>

          <div className="space-y-1">
            <SpatialTextarea
              id="create-hackathon-desc"
              label="Description"
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Tell students what this hackathon is about..."
            />
          </div>
        </form>
      </SpatialModal>
    </div>
  );
};
