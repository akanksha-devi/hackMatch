import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trophy, Filter, Plus, Calendar, MapPin } from 'lucide-react';
import { getHackathons, createHackathon } from '../services/storageService';
import { HackathonCard } from '../components/HackathonCard';
import { useAuth } from '../hooks/useAuth';

export const Hackathons = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = () => {
    setHackathons(getHackathons());
  };

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = selectedMode === 'All' || h.mode === selectedMode;
    const matchesTag =
      selectedTag === 'All' || (h.tags && h.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

    return matchesSearch && matchesMode && matchesTag;
  });

  const ALL_TAGS = ['All', 'AI', 'Web Dev', 'Web3', 'Blockchain', 'UI/UX', 'Solidity', 'Python', 'IoT'];

  const handleCreateHackathon = (e) => {
    e.preventDefault();
    const tagsArray = newTagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    createHackathon({
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
      postedBy: user?.id || 'u1'
    });

    setShowCreateModal(false);
    // Reset form
    setNewTitle('');
    setNewOrganizer('');
    setNewDescription('');
    loadHackathons();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-indigo-400" />
            Hackathons Directory
          </h1>
          <p className="text-sm text-gray-400">Discover top hackathons and match with teammates</p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            List a Hackathon
          </button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hackathons by name, organizer, or topic..."
            className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
          />
        </div>

        {/* Mode Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full md:w-auto bg-gray-900/90 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

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
      {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-4">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Hackathons Found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      {/* Create Hackathon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white">List a New Hackathon</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateHackathon} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Smart India Hackathon 2026"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Organizer *</label>
                  <input
                    type="text"
                    required
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="e.g. AICTE / ETHGlobal"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Location / Venue</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Bengaluru / Online Worldwide"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">End Date</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Deadline</label>
                  <input
                    type="date"
                    value={newRegistrationDeadline}
                    onChange={(e) => setNewRegistrationDeadline(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Registration Link</label>
                <input
                  type="url"
                  value={newRegistrationLink}
                  onChange={(e) => setNewRegistrationLink(e.target.value)}
                  placeholder="https://hackathon-website.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTagsInput}
                  onChange={(e) => setNewTagsInput(e.target.value)}
                  placeholder="AI, Web3, Python"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details about tracks, prizes, and rules..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
