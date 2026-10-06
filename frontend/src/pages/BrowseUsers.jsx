import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, Filter, Code, School, ShieldCheck } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { UserCard } from '../components/UserCard';
import { SpatialPanel, SpatialDropdown, FilterChip, SpatialInput } from '../components/spatial';

const SKILL_FILTERS = [
  'All', 'React', 'Python', 'Node.js', 'AI', 'PyTorch', 
  'UI/UX', 'Solidity', 'TypeScript', 'TailwindCSS', 'Figma'
];

export const BrowseUsers = () => {
  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || 'All';
  const { user, collegeName } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedExp, setSelectedExp] = useState('All');
  const [selectedVerif, setSelectedVerif] = useState('All');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getUsers();
        if (res.success && res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.response?.data?.message || 'Failed to load campus students');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.bio && u.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkill =
      selectedSkill === 'All' ||
      (u.skills && u.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()));

    const matchesExp = selectedExp === 'All' || u.experienceLevel === selectedExp;

    const matchesVerif =
      selectedVerif === 'All' ||
      (selectedVerif === 'Unverified'
        ? !u.experienceVerificationStatus || u.experienceVerificationStatus === 'Unverified'
        : u.experienceVerificationStatus === selectedVerif);

    return matchesSearch && matchesSkill && matchesExp && matchesVerif;
  });

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      
      {/* =====================================================================
          LAYER 2 & 5: SPATIAL DEVELOPER DISCOVERY IDENTITY
          ===================================================================== */}
      <section aria-label="Browse Developers Header" className="relative pt-2">
        <div 
          className={`absolute -top-16 left-0 w-96 h-96 blur-3xl rounded-full pointer-events-none transition-opacity duration-700 ${
            isLight ? 'bg-cyan-200/30' : 'bg-cyan-600/15'
          }`} 
          aria-hidden="true" 
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              {collegeName && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                  isLight ? 'bg-cyan-50 border border-cyan-200 text-cyan-800' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                }`}>
                  <School className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Campus: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{collegeName}</strong></span>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 ml-1" />
                </div>
              )}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
              }`}>
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                {users.length} Hackers Registered
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-3`}>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500 shrink-0" />
              <span>Campus Developer Constellation</span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              Explore verified hacker profiles, discover complementary skill stacks, and recruit teammates for upcoming hackathon squads.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          LAYER 4: SEARCH, ATTRIBUTE FILTERS & SKILL CLUSTERS
          ===================================================================== */}
      <section aria-label="Developer Filters" className="space-y-4">
        {/* Filter Toolbar */}
        <SpatialPanel className="flex flex-col md:flex-row items-center gap-4 relative z-20">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <SpatialInput
              id="browse-users-search"
              icon={Search}
              placeholder="Search developers by name, bio, or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              clearable
              onClear={() => setSearchTerm('')}
            />
          </div>

          {/* Experience Level Dropdown */}
          <div className="w-full md:w-56">
            <SpatialDropdown
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              icon={Filter}
              options={[
                { value: 'All', label: 'All Experience Levels' },
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
          </div>

          {/* Verification Status Filter */}
          <div className="w-full md:w-52">
            <SpatialDropdown
              value={selectedVerif}
              onChange={(e) => setSelectedVerif(e.target.value)}
              icon={ShieldCheck}
              options={[
                { value: 'All', label: 'All Trust States' },
                { value: 'Verified', label: '✓ Verified Only' },
                { value: 'Pending', label: '⏳ Pending' },
                { value: 'Unverified', label: '⚠ Unverified' },
                { value: 'Rejected', label: '✕ Rejected' },
              ]}
            />
          </div>
        </SpatialPanel>

        {/* Skill Pills Filter Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className={`${isLight ? 'text-slate-500' : 'text-gray-400'} font-semibold shrink-0 flex items-center gap-1.5`}>
            <Code className="w-3.5 h-3.5 text-cyan-500" /> Skill Filter:
          </span>
          {SKILL_FILTERS.map((sk) => (
            <FilterChip
              key={sk}
              label={sk}
              active={selectedSkill === sk}
              onClick={() => setSelectedSkill(sk)}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
          LAYER 3: DEVELOPER CARDS CONSTELLATION (TERTIARY)
          ===================================================================== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading campus developers...</p>
        </div>
      ) : error ? (
        <SpatialPanel padding="normal" className="border-red-500/30 text-center text-red-500 text-sm">
          {error}
        </SpatialPanel>
      ) : filteredUsers.length > 0 ? (
        <section aria-label="Developers Grid" className="space-y-4">
          <div className={`flex items-center justify-between text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} px-1`}>
            <span>Showing <strong className={isLight ? 'text-slate-900' : 'text-white'}>{filteredUsers.length}</strong> developer{filteredUsers.length !== 1 ? 's' : ''}</span>
            {selectedSkill !== 'All' && (
              <span className="text-cyan-500 font-medium">Filtered by: {selectedSkill}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredUsers.map((u) => (
              <UserCard key={u._id || u.id} user={u} />
            ))}
          </div>
        </section>
      ) : (
        <SpatialPanel padding="loose" className="text-center space-y-4">
          <Users className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>No Campus Developers Found</h3>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Try choosing a different skill filter or search query.</p>
        </SpatialPanel>
      )}
    </div>
  );
};
