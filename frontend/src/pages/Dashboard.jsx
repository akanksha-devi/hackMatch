import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getTeamRequests, 
  getResponses, 
  getSuggestedMatches, 
  getHackathons 
} from '../services/storageService';
import { SkillTag } from '../components/SkillTag';
import { UserCard } from '../components/UserCard';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Trophy, 
  Users, 
  Inbox, 
  Zap, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Send
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [myRequestsCount, setMyRequestsCount] = useState(0);
  const [myResponsesCount, setMyResponsesCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [recentHackathons, setRecentHackathons] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Requests count
    const reqs = getTeamRequests();
    const myReqs = reqs.filter((r) => {
      const pId = typeof r.postedBy === 'object' ? r.postedBy?.id : r.postedBy;
      return pId === user.id;
    });
    setMyRequestsCount(myReqs.length);

    // Responses sent & accepted count
    const responses = getResponses();
    const mySent = responses.filter((res) => {
      const respId = typeof res.respondent === 'object' ? res.respondent?.id : res.respondentId;
      return respId === user.id;
    });
    setMyResponsesCount(mySent.length);
    setAcceptedCount(mySent.filter((s) => s.status === 'Accepted').length);

    // Compute recommended matches based on user's own skills
    if (user.skills && user.skills.length > 0) {
      const matches = getSuggestedMatches(user.skills, user.id);
      setRecommendedMatches(matches.slice(0, 3));
    }

    setRecentHackathons(getHackathons().slice(0, 2));
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Dashboard Overview
              </span>
              <span className="text-xs text-gray-400 font-medium">Welcome back!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Hello, {user?.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              You are listed as an <span className="text-cyan-400 font-semibold">{user?.experienceLevel}</span> developer with {user?.skills?.length || 0} skills active in your matching profile.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/post-request"
              className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Post Team Request
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Created Requests</span>
            <Inbox className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{myRequestsCount}</div>
          <p className="text-[11px] text-gray-500">Active team posts</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Applications Sent</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{myResponsesCount}</div>
          <p className="text-[11px] text-gray-500">Responses sent to others</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Matches Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{acceptedCount}</div>
          <p className="text-[11px] text-gray-500">Confirmed teams</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Profile Skills</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{user?.skills?.length || 0}</div>
          <p className="text-[11px] text-gray-500">Active matching tags</p>
        </div>
      </div>

      {/* Recommended Teammates Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Smart Matching Algorithm
            </div>
            <h2 className="text-2xl font-bold text-white">Recommended Developers for You</h2>
          </div>

          <Link
            to="/users"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedMatches.map((m) => (
              <UserCard
                key={m.user.id}
                user={m.user}
                matchScore={m.matchScore}
                overlappingSkills={m.overlappingSkills}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-gray-800 text-center space-y-2 text-xs text-gray-400">
            <Zap className="w-8 h-8 text-gray-600 mx-auto" />
            <p>Add more skills to your profile to get personalized teammate recommendations!</p>
          </div>
        )}
      </div>

      {/* Quick Links & Upcoming Hackathons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Quick Action Navigation (1 col) */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/post-request"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 flex items-center justify-between text-xs text-gray-200 font-semibold transition-all group"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" /> Post Team Request
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/hackathons"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 flex items-center justify-between text-xs text-gray-200 font-semibold transition-all group"
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Explore Hackathons
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/users"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 flex items-center justify-between text-xs text-gray-200 font-semibold transition-all group"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Discover Developers
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/my-requests"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 flex items-center justify-between text-xs text-gray-200 font-semibold transition-all group"
            >
              <span className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-400" /> View Received Applications
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Featured Hackathons Shortcut (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-400" /> Upcoming Hackathons
            </h3>
            <Link to="/hackathons" className="text-xs text-indigo-400 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentHackathons.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{h.title}</h4>
                  <p className="text-xs text-gray-400">{h.organizer} • {h.mode}</p>
                </div>
                <Link
                  to={`/hackathons/${h.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
