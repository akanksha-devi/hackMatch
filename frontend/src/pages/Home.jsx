import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import apiService from '../services/apiService';
import { HackathonCard } from '../components/HackathonCard';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { UserCard } from '../components/UserCard';
import { SkillChip } from '../components/SkillChip';
import { SpatialButton, SpatialCard, SpatialPanel } from '../components/spatial';
import { useTheme } from '../context/ThemeContext';
import { GlobeHero } from '../components/home/GlobeHero';

export const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [hackathons, setHackathons] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [hRes, trRes, uRes] = await Promise.all([
          apiService.getHackathons().catch(() => ({ hackathons: [] })),
          apiService.getTeamRequests().catch(() => ({ teamRequests: [] })),
          apiService.getUsers().catch(() => ({ users: [] })),
        ]);

        if (hRes.hackathons) setHackathons(hRes.hackathons.slice(0, 3));
        if (trRes.teamRequests) setTeamRequests(trRes.teamRequests.slice(0, 3));
        if (uRes.users) setUsers(uRes.users.slice(0, 3));
      } catch (err) {
        console.error('Home data load notice:', err);
      }
    };
    fetchHomeData();
  }, []);

  const POPULAR_SKILLS = ["React", "Python", "AI", "Solidity", "UI/UX", "Node.js", "PyTorch", "TypeScript"];

  return (
    <div className="space-y-20 pb-12">
      {/* Living Energy Field Hero */}
      <GlobeHero
        onFindTeam={() => navigate('/post-request')}
        onExplore={() => navigate('/hackathons')}
        onSkill={(skill) => navigate(`/users?skill=${encodeURIComponent(skill)}`)}
      />

      {/* Popular Skill Pills preview */}
      <div className={`pt-2 pb-2 flex items-center justify-center gap-2 flex-wrap text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
        <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-gray-500'} mr-2`}>Top Skills Needed:</span>
        {POPULAR_SKILLS.map((s) => (
          <Link key={s} to={`/users?skill=${s}`}>
            <SkillChip skill={s} variant="default" size="sm" />
          </Link>
        ))}
      </div>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <SpatialCard hover elevation="raised" className="p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>4+</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'} font-medium`}>Active Hackathons</div>
          </SpatialCard>

          <SpatialCard hover elevation="raised" className="p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>100%</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'} font-medium`}>Skill Match Overlap</div>
          </SpatialCard>

          <SpatialCard hover elevation="raised" className="p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mx-auto mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <div className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>25+</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'} font-medium`}>Developer Skills</div>
          </SpatialCard>

          <SpatialCard hover elevation="raised" className="p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Instant</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'} font-medium`}>Teammate Matching</div>
          </SpatialCard>
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              Featured Opportunities
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Ongoing & Upcoming Hackathons</h2>
          </div>
          <Link
            to="/hackathons"
            className="text-xs sm:text-sm font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5"
          >
            View All Hackathons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard key={h._id || h.id} hackathon={h} />
          ))}
        </div>
      </section>

      {/* Recent Team Requests */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              Open Team Requests
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Projects Seeking Teammates</h2>
          </div>
          <Link
            to="/post-request"
            className="text-xs sm:text-sm font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1.5"
          >
            Post a Request <PlusCircle className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamRequests.map((req) => (
            <TeamRequestCard key={req._id || req.id} request={req} />
          ))}
        </div>
      </section>

      {/* Developers Spotlight */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Talent Discovery
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Available Hackers & Builders</h2>
          </div>
          <Link
            to="/users"
            className="text-xs sm:text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
          >
            Browse All Developers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.map((u) => (
            <UserCard key={u._id || u.id} user={u} />
          ))}
        </div>
      </section>

      {/* How It Works Callout */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <SpatialPanel className={`p-8 sm:p-12 relative overflow-hidden ${
          isLight
            ? 'bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-white/95 border border-slate-200 shadow-sm'
            : 'border border-gray-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900'
        }`}>
          <div className="max-w-3xl space-y-6">
            <h2 className={`text-2xl sm:text-4xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              How HackMatch Solves Teammate Search
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center text-sm border border-indigo-500/30">1</div>
                <h4 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-base`}>Post Your Need</h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} leading-relaxed`}>Select a hackathon and specify exact skills required (e.g. React + PyTorch).</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-500 font-bold flex items-center justify-center text-sm border border-cyan-500/30">2</div>
                <h4 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-base`}>Smart Skill Ranking</h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} leading-relaxed`}>Our algorithm ranks developers by skill overlap % and experience level.</p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-sm border border-emerald-500/30">3</div>
                <h4 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-base`}>Match & Win</h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} leading-relaxed`}>Send responses, accept team requests, and build winning projects together.</p>
              </div>
            </div>
          </div>
        </SpatialPanel>
      </section>
    </div>
  );
};
