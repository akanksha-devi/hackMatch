import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getHackathons, 
  createTeamRequest, 
  getSuggestedMatches 
} from '../services/storageService';
import { SkillTag } from '../components/SkillTag';
import { UserCard } from '../components/UserCard';
import { 
  PlusCircle, 
  Trophy, 
  Code, 
  Users, 
  Zap, 
  Check, 
  Plus, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

const COMMON_SKILLS = [
  "React", "Python", "Node.js", "AI", "PyTorch", "UI/UX", 
  "Solidity", "TypeScript", "TailwindCSS", "Figma", "MongoDB", "Express", "Docker"
];

export const PostTeamRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultHackathonId = searchParams.get('hackathonId') || '';

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState(defaultHackathonId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState(["React", "Python"]);
  const [customSkill, setCustomSkill] = useState('');
  const [teamSizeNeeded, setTeamSizeNeeded] = useState(2);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Suggested matches state calculated dynamically
  const [suggestedMatches, setSuggestedMatches] = useState([]);

  useEffect(() => {
    const list = getHackathons();
    setHackathons(list);
    if (!selectedHackathonId && list.length > 0) {
      setSelectedHackathonId(list[0].id);
    }
  }, []);

  // Recalculate skill match score in real-time as skillsNeeded change
  useEffect(() => {
    if (skillsNeeded.length > 0 && user) {
      const matches = getSuggestedMatches(skillsNeeded, user.id);
      setSuggestedMatches(matches);
    } else {
      setSuggestedMatches([]);
    }
  }, [skillsNeeded, user]);

  const toggleSkill = (skill) => {
    if (skillsNeeded.includes(skill)) {
      setSkillsNeeded(skillsNeeded.filter((s) => s !== skill));
    } else {
      setSkillsNeeded([...skillsNeeded, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skillsNeeded.includes(customSkill.trim())) {
      setSkillsNeeded([...skillsNeeded, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedHackathonId) {
      setError('Please select a target hackathon.');
      return;
    }

    if (skillsNeeded.length === 0) {
      setError('Please select at least one skill needed for your team.');
      return;
    }

    setLoading(true);

    try {
      createTeamRequest({
        hackathonId: selectedHackathonId,
        postedById: user.id,
        title,
        description,
        skillsNeeded,
        teamSizeNeeded
      });

      navigate('/my-requests');
    } catch (err) {
      setError('Failed to post team request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <PlusCircle className="w-8 h-8 text-indigo-400" />
          Post a Team Request
        </h1>
        <p className="text-sm text-gray-400">
          Specify what skills you need and our matching engine will suggest compatible builders automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Hackathon */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-indigo-400" />
                Select Target Hackathon *
              </label>
              <select
                required
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title} ({h.mode})
                  </option>
                ))}
              </select>
            </div>

            {/* Request Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Request Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need PyTorch ML dev & UI designer for Smart India Hackathon"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Project & Role Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea, what you've built so far, responsibilities, and team expectations..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Required Skills Multi-select */}
            <div className="space-y-3 pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-cyan-400" />
                  Skills Needed for Your Team *
                </label>
                <span className="text-xs text-gray-400">{skillsNeeded.length} selected</span>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map((sk) => {
                  const isSelected = skillsNeeded.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      {sk}
                    </button>
                  );
                })}
              </div>

              {/* Add custom skill */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add custom skill..."
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-semibold text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Display tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skillsNeeded.map((s) => (
                  <SkillTag
                    key={s}
                    name={s}
                    size="sm"
                    onRemove={(rem) => setSkillsNeeded(skillsNeeded.filter((k) => k !== rem))}
                  />
                ))}
              </div>
            </div>

            {/* Team Size Needed */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                Number of Teammates Needed
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTeamSizeNeeded(num)}
                    className={`w-12 h-10 rounded-xl font-bold text-sm transition-all ${
                      teamSizeNeeded === num
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20'
                        : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" /> Publish Team Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Suggested Matches Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Suggested Matches</h3>
              </div>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                {suggestedMatches.length} Found
              </span>
            </div>

            <p className="text-xs text-gray-400">
              Live preview of registered developers ranked by skill overlap with your selected requirements:
            </p>

            {suggestedMatches.length > 0 ? (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                {suggestedMatches.map((m) => (
                  <UserCard
                    key={m.user.id}
                    user={m.user}
                    matchScore={m.matchScore}
                    overlappingSkills={m.overlappingSkills}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 space-y-2 border border-dashed border-gray-800 rounded-2xl">
                <Zap className="w-8 h-8 text-gray-600 mx-auto" />
                <p>Select required skills on the left to see live teammate match suggestions.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
