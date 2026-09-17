import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Users, 
  Trophy, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  Code2,
  Cpu,
  Boxes
} from 'lucide-react';
import { getHackathons, getTeamRequests, getUsers } from '../services/storageService';
import { HackathonCard } from '../components/HackathonCard';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { UserCard } from '../components/UserCard';
import { SkillTag } from '../components/SkillTag';

export const Home = () => {
  const [hackathons, setHackathons] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setHackathons(getHackathons().slice(0, 3));
    setTeamRequests(getTeamRequests().slice(0, 3));
    setUsers(getUsers().slice(0, 3));
  }, []);

  const POPULAR_SKILLS = ["React", "Python", "AI", "Solidity", "UI/UX", "Node.js", "PyTorch", "TypeScript"];

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Decorative background ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/10 blur-3xl rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 px-4">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold shadow-lg shadow-indigo-500/10 animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Smart Skill Matching Engine Powered for Hackathons</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Assemble Your Winning <br className="hidden sm:inline" />
            <span className="text-gradient">Hackathon Squad</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Have a brilliant hackathon project idea but missing a <span className="text-cyan-400 font-semibold">Backend Dev</span>, <span className="text-indigo-400 font-semibold">AI Specialist</span>, or <span className="text-purple-400 font-semibold">UI/UX Designer</span>? Match instantly with complementary developers by skills.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/post-request"
              className="btn-glow w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Post Team Request
            </Link>

            <Link
              to="/users"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-gray-800/80 text-white font-semibold text-base border border-gray-700/80 flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5 text-cyan-400" />
              Find Teammates
            </Link>
          </div>

          {/* Popular Skill Pills preview */}
          <div className="pt-6 flex items-center justify-center gap-2 flex-wrap text-xs text-gray-400">
            <span className="font-semibold text-gray-500 mr-2">Top Skills Needed:</span>
            {POPULAR_SKILLS.map((s) => (
              <Link key={s} to={`/users?skill=${s}`}>
                <SkillTag name={s} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">4+</div>
            <div className="text-xs text-gray-400 font-medium">Active Hackathons</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs text-gray-400 font-medium">Skill Match Overlap</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">25+</div>
            <div className="text-xs text-gray-400 font-medium">Developer Skills</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">Instant</div>
            <div className="text-xs text-gray-400 font-medium">Teammate Matching</div>
          </div>
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              Featured Opportunities
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ongoing & Upcoming Hackathons</h2>
          </div>
          <Link
            to="/hackathons"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
          >
            View All Hackathons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      </section>

      {/* Recent Team Requests */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              Open Team Requests
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Projects Seeking Teammates</h2>
          </div>
          <Link
            to="/post-request"
            className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            Post a Request <PlusCircle className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamRequests.map((req) => (
            <TeamRequestCard key={req.id} request={req} />
          ))}
        </div>
      </section>

      {/* Developers Spotlight */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Talent Discovery
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Available Hackers & Builders</h2>
          </div>
          <Link
            to="/users"
            className="text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
          >
            Browse All Developers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      </section>

      {/* How It Works Callout */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-gray-800 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              How HackMatch Solves Teammate Search
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">1</div>
                <h4 className="font-bold text-white text-base">Post Your Need</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Select a hackathon and specify exact skills required (e.g. React + PyTorch).</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">2</div>
                <h4 className="font-bold text-white text-base">Smart Skill Ranking</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Our algorithm ranks developers by skill overlap % and experience level.</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">3</div>
                <h4 className="font-bold text-white text-base">Match & Win</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Send responses, accept team requests, and build winning projects together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
