import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/apiService';
import { SkillChip } from '../components/SkillChip';
import { UserCard } from '../components/UserCard';
import { RequireVerified } from '../components/RequireVerified';
import { StatusBadge } from '../components/StatusBadge';
import { SpatialPanel, SpatialDropdown, SpatialButton, SpatialInput, SpatialTextarea } from '../components/spatial';
import { 
  PlusCircle, 
  Trophy, 
  Code, 
  Users, 
  Zap, 
  Check, 
  Plus, 
  AlertCircle,
  Sparkles,
  School
} from 'lucide-react';

const COMMON_SKILLS = [
  "React", "Python", "Node.js", "AI", "PyTorch", "UI/UX", 
  "Solidity", "TypeScript", "TailwindCSS", "Figma", "MongoDB", "Express", "Docker"
];

export const PostTeamRequest = () => {
  const { user, collegeName } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
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

  // Suggested matches state calculated dynamically from the Smart Matching backend
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await apiService.getHackathons();
        if (res.success && res.hackathons) {
          setHackathons(res.hackathons);
          if (!selectedHackathonId && res.hackathons.length > 0) {
            setSelectedHackathonId(res.hackathons[0]._id || res.hackathons[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching hackathons:', err);
      }
    };
    fetchHackathons();
  }, []);

  // Recalculate skill match score in real-time from backend matching service
  useEffect(() => {
    if (skillsNeeded.length > 0 && user) {
      setIsMatching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await apiService.previewMatches(skillsNeeded);
          if (res.success && res.matches) {
            setSuggestedMatches(res.matches);
          }
        } catch (err) {
          console.warn('Match preview error:', err.message);
        } finally {
          setIsMatching(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestedMatches([]);
      setIsMatching(false);
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

  const handleSubmit = async (e) => {
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
      await apiService.createTeamRequest({
        hackathon: selectedHackathonId,
        title,
        description,
        skillsNeeded,
        teamSizeNeeded
      });

      navigate('/my-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post team request.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'student';
  const isVerified = user?.experienceVerificationStatus === 'Verified';

  return (
    <div className="relative space-y-8 pb-16">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[520px] max-w-full h-[320px] bg-gradient-to-tr from-indigo-500/12 via-purple-500/10 to-transparent blur-3xl rounded-full" 
        />
      </div>

      {/* Header */}
      <div className={`relative space-y-2 border-b ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} pb-6`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TEAM ASSEMBLY WORKSPACE</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-3`}>
          <PlusCircle className="w-8 h-8 text-indigo-500 shrink-0" />
          Post a Team Request
        </h1>
        <p className={`text-sm max-w-2xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Specify required technical capabilities for your hackathon squad. Our real-time matching engine connects you with verified campus builders.
        </p>
      </div>

      {isStudent && !isVerified ? (
        <RequireVerified
          actionName="Team Request Creation"
          description="Creating team requests requires college-verified experience. This builds trust between hackathon participants and ensures teams are led with authentic technical credentials."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7">
            <SpatialPanel as="form" onSubmit={handleSubmit} elevation="raised" className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Section 1: Event Context */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-500">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px]">1</span>
                  Target Hackathon
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'} flex items-center gap-1.5`}>
                    <Trophy className="w-4 h-4 text-indigo-500" />
                    Select Hackathon Target *
                  </label>
                  <SpatialDropdown
                    required
                    value={selectedHackathonId}
                    onChange={(e) => setSelectedHackathonId(e.target.value)}
                    options={hackathons.map((h) => ({
                      value: h._id || h.id,
                      label: `${h.title} (${h.mode || 'Virtual'})`,
                    }))}
                    placeholder="Select target hackathon..."
                  />
                </div>
              </div>

              {/* Section 2: Team Pitch & Mission */}
              <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'}`}>
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-500">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px]">2</span>
                  Team Mission & Scope
                </div>

                {/* Request Title */}
                <div className="space-y-1.5">
                  <label htmlFor="team-req-title" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                    Headline / Role Summary *
                  </label>
                  <SpatialInput
                    id="team-req-title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Need PyTorch ML engineer & UI designer for Smart India Hackathon"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="team-req-desc" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                    Project Pitch & Expectations *
                  </label>
                  <SpatialTextarea
                    id="team-req-desc"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your idea, what you have built so far, responsibilities, and team expectations..."
                  />
                </div>
              </div>

              {/* Section 3: Tech Arsenal & Skill Requirements */}
              <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-500">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px]">3</span>
                    Required Skills
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-300'}`}>
                    {skillsNeeded.length} selected
                  </span>
                </div>

                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Select required stack components to trigger real-time candidate matchmaking:
                </p>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SKILLS.map((sk) => {
                    const isSelected = skillsNeeded.includes(sk);
                    return (
                      <SkillChip
                        key={sk}
                        skill={sk}
                        variant="interactive"
                        selected={isSelected}
                        onToggle={() => toggleSkill(sk)}
                      />
                    );
                  })}
                </div>

                {/* Add custom skill */}
                <div className="flex items-center gap-2 pt-1">
                  <SpatialInput
                    id="team-req-custom-skill"
                    aria-label="Add custom skill"
                    size="sm"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill (e.g. Rust, WebGL)..."
                  />
                  <SpatialButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomSkill}
                    icon={Plus}
                  >
                    Add
                  </SpatialButton>
                </div>

                {/* Display tags */}
                {skillsNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {skillsNeeded.map((s) => (
                      <SkillChip
                        key={s}
                        skill={s}
                        size="md"
                        variant="removable"
                        onRemove={() => setSkillsNeeded(skillsNeeded.filter((k) => k !== s))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Team Capacity */}
              <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'}`}>
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-500">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px]">4</span>
                  Roster Allocation
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'} flex items-center gap-1.5`}>
                    <Users className="w-4 h-4 text-purple-500" />
                    Number of Teammates Needed
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4].map((num) => (
                      <SpatialButton
                        key={num}
                        type="button"
                        variant={teamSizeNeeded === num ? 'primary' : 'outline'}
                        size="md"
                        onClick={() => setTeamSizeNeeded(num)}
                        className="w-12 h-10 font-bold"
                      >
                        {num}
                      </SpatialButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <SpatialButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  icon={PlusCircle}
                >
                  Publish Team Request
                </SpatialButton>
              </div>
            </SpatialPanel>
          </div>

          {/* Right Column: Live Suggested Matches Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <SpatialPanel padding="normal" elevation="raised" className="space-y-4 sticky top-24">
              <div className={`flex items-center justify-between border-b ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} pb-3`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Smart Candidate Radar</h3>
                </div>
                <StatusBadge
                  status="active"
                  accent="indigo"
                  label={isMatching ? 'Matching...' : `${suggestedMatches.length} Found`}
                  size="sm"
                  showIcon={false}
                />
              </div>

              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                Live preview of verified developers ranked by skill overlap with your selected requirements:
              </p>

              {suggestedMatches.length > 0 ? (
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {suggestedMatches.map((m) => (
                    <UserCard
                      key={m.user?._id || m.user?.id}
                      user={m.user}
                      matchScore={m.matchScore}
                      overlappingSkills={m.matchedSkills || m.overlappingSkills || []}
                    />
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center text-xs ${isLight ? 'text-slate-500 border-slate-300/80' : 'text-gray-500 border-gray-800/80'} space-y-2 border border-dashed rounded-2xl`}>
                  <Zap className={`w-8 h-8 ${isLight ? 'text-slate-400' : 'text-gray-600'} mx-auto`} />
                  <p>
                    {isMatching
                      ? 'Finding compatible campus teammates...'
                      : 'Select required skills on the left to see live teammate match suggestions.'}
                  </p>
                </div>
              )}
            </SpatialPanel>
          </div>
        </div>
      )}
    </div>
  );
};
