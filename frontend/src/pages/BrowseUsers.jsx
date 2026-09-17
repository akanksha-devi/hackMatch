import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, Filter, Code } from 'lucide-react';
import { getUsers } from '../services/storageService';
import { UserCard } from '../components/UserCard';

const SKILL_FILTERS = [
  'All', 'React', 'Python', 'Node.js', 'AI', 'PyTorch', 
  'UI/UX', 'Solidity', 'TypeScript', 'TailwindCSS', 'Figma'
];

export const BrowseUsers = () => {
  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || 'All';

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedExp, setSelectedExp] = useState('All');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.bio && u.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkill =
      selectedSkill === 'All' ||
      (u.skills && u.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()));

    const matchesExp = selectedExp === 'All' || u.experienceLevel === selectedExp;

    return matchesSearch && matchesSkill && matchesExp;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Users className="w-8 h-8 text-cyan-400" />
          Browse Developers & Hackers
        </h1>
        <p className="text-sm text-gray-400">
          Find teammates by skill expertise, experience level, and project history
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search developers by name, bio, or domain..."
            className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
          />
        </div>

        {/* Experience Level Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="w-full md:w-auto bg-gray-900/90 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Experience Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Skill Pills filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-gray-500 font-semibold shrink-0 flex items-center gap-1">
          <Code className="w-3.5 h-3.5 text-cyan-400" /> Skill Filter:
        </span>
        {SKILL_FILTERS.map((sk) => (
          <button
            key={sk}
            onClick={() => setSelectedSkill(sk)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
              selectedSkill === sk
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {sk}
          </button>
        ))}
      </div>

      {/* Developers Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-4">
          <Users className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Developers Found</h3>
          <p className="text-sm text-gray-400">Try choosing a different skill filter or search query.</p>
        </div>
      )}
    </div>
  );
};
