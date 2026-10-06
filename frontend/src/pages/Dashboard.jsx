import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/apiService';
import { UserCard } from '../components/UserCard';
import { HackathonCard } from '../components/HackathonCard';
import { StatusBadge } from '../components/StatusBadge';
import { SkillChip } from '../components/SkillChip';
import { SpatialButton, SpatialCard, SpatialPanel } from '../components/spatial';
import { 
  PlusCircle, 
  Trophy, 
  Users, 
  Inbox, 
  Zap, 
  Sparkles, 
  ArrowRight,
  CheckCircle2, 
  Send, 
  School, 
  ShieldCheck,
  TrendingUp,
  Compass,
  ArrowUpRight,
  Activity,
  UserCheck
} from 'lucide-react';

export const Dashboard = () => {
  const { user, collegeName } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [myRequestsCount, setMyRequestsCount] = useState(0);
  const [myResponsesCount, setMyResponsesCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [recentHackathons, setRecentHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [respRes, hackRes] = await Promise.all([
          apiService.getMyResponses().catch(() => ({ success: false })),
          apiService.getHackathons().catch(() => ({ success: false })),
        ]);

        if (respRes.success) {
          const myReqs = respRes.myRequests || [];
          const sent = respRes.sentApplications || [];
          setMyRequestsCount(myReqs.length);
          setMyResponsesCount(sent.length);
          setAcceptedCount(sent.filter((s) => s.status === 'Accepted').length);
        }

        if (hackRes.success && hackRes.hackathons) {
          setRecentHackathons(hackRes.hackathons.slice(0, 2));
        }

        // Live recommended teammate matches based on user's own skills
        if (user.skills && user.skills.length > 0) {
          try {
            const matchRes = await apiService.previewMatches(user.skills);
            if (matchRes.success && matchRes.matches) {
              setRecommendedMatches(matchRes.matches.slice(0, 3));
            }
          } catch (e) {
            console.warn('Recommendation load notice:', e.message);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* =====================================================================
          LAYER 2 & 5: PRIMARY DASHBOARD IDENTITY & DIRECT ACTION
          Airy spatial hero integrated into the WebGL environment
          ===================================================================== */}
      <section aria-label="Dashboard Header" className="relative pt-2">
        {/* Ambient radial color pool behind identity */}
        <div 
          className={`absolute -top-16 left-0 w-96 h-96 blur-3xl rounded-full pointer-events-none transition-opacity duration-700 ${
            isLight ? 'bg-indigo-300/25' : 'bg-indigo-600/15'
          }`} 
          aria-hidden="true" 
        />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            {/* Ambient status pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {collegeName && (
                <StatusBadge
                  status="campus"
                  label={collegeName}
                  size="sm"
                  icon={School}
                />
              )}
              {user?.experienceLevel && (
                <StatusBadge
                  status={user.experienceLevel.toLowerCase()}
                  label={`${user.experienceLevel} Developer`}
                  accent="cyan"
                  size="sm"
                  icon={ShieldCheck}
                />
              )}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isLight ? 'bg-emerald-100/80 text-emerald-800' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                Active Matching Profile
              </span>
            </div>

            {/* Main greeting */}
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Hello, {user?.name || 'Hacker'} <span className="inline-block hover:rotate-12 transition-transform duration-300 select-none">👋</span>
            </h1>

            {/* Subtitle / context */}
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
              Welcome to your spatial workspace. Your profile is indexed with{' '}
              <strong className={isLight ? 'text-indigo-600' : 'text-indigo-400 font-semibold'}>
                {user?.skills?.length || 0} active skills
              </strong>{' '}
              ready to match with campus hackathon squads.
            </p>
          </div>

          {/* Foreground Primary & Secondary Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <SpatialButton
              to="/post-request"
              variant="primary"
              size="md"
              icon={PlusCircle}
            >
              Post Team Request
            </SpatialButton>
            <SpatialButton
              to="/users"
              variant="secondary"
              size="md"
              icon={Users}
            >
              Browse Teammates
            </SpatialButton>
          </div>
        </div>
      </section>

      {/* =====================================================================
          LAYER 3 & 4: ASYMMETRIC SPATIAL METRIC SYSTEM & KEY ACTION INSIGHT
          Breaks the traditional 4-box grid with an insight focal hub + telemetry stack
          ===================================================================== */}
      <section aria-label="Key Action and Metrics Overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* FOCAL HUB: Team Matching Status & Velocity (7 Columns) */}
          <SpatialCard 
            elevation="raised" 
            hover={false} 
            className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group border-indigo-500/25"
          >
            {/* Specular internal corner glow */}
            <div 
              className={`absolute top-0 right-0 w-72 h-72 blur-3xl rounded-full pointer-events-none ${
                isLight ? 'bg-indigo-100/40' : 'bg-indigo-500/10'
              }`} 
              aria-hidden="true" 
            />

            <div className="relative z-10 space-y-6">
              {/* Category indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                    Matching Engine Status
                  </span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  acceptedCount > 0
                    ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30')
                    : (isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-gray-300')
                }`}>
                  {acceptedCount > 0 ? 'Squad Confirmed' : 'Forming Squad'}
                </span>
              </div>

              {/* Dynamic Insight Title & Copy */}
              <div className="space-y-2">
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {acceptedCount > 0 
                    ? `${acceptedCount} Teammate${acceptedCount > 1 ? 's' : ''} Confirmed & Ready` 
                    : myRequestsCount > 0 
                      ? `${myRequestsCount} Active Team Post${myRequestsCount > 1 ? 's' : ''} Awaiting Responses`
                      : 'Ready to Assemble Your Next Hackathon Squad'}
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                  {acceptedCount > 0
                    ? `Great progress! You have locked in ${acceptedCount} team member(s). Check your upcoming competitions or post another request to complete your lineup.`
                    : myRequestsCount > 0
                      ? `Your posts are actively being distributed to matching students across campus. Review incoming applications or invite recommended candidates.`
                      : 'You do not have any confirmed teammates yet. Create a team post to advertise open roles or reach out directly to recommended developers below.'}
                </p>
              </div>

              {/* Stat highlight pill row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-white/60 border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/[0.08]'
                }`}>
                  <span className={`text-[11px] font-semibold block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Matches Accepted
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-500 mt-0.5 flex items-baseline gap-1.5">
                    {acceptedCount}
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 inline" />
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-white/60 border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/[0.08]'
                }`}>
                  <span className={`text-[11px] font-semibold block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Open Requests
                  </span>
                  <div className={`text-2xl font-extrabold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {myRequestsCount}
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border col-span-2 sm:col-span-1 ${
                  isLight ? 'bg-white/60 border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-white/[0.08]'
                }`}>
                  <span className={`text-[11px] font-semibold block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Applications Sent
                  </span>
                  <div className={`text-2xl font-extrabold mt-0.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                    {myResponsesCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action triggers inside the focal hub */}
            <div className={`mt-8 pt-5 border-t flex flex-wrap items-center justify-between gap-4 relative z-10 ${
              isLight ? 'border-slate-200/80' : 'border-white/[0.08]'
            }`}>
              <div className="flex items-center gap-2">
                <SpatialButton
                  to="/my-requests"
                  variant="primary"
                  size="sm"
                  icon={Inbox}
                >
                  Manage Requests ({myRequestsCount})
                </SpatialButton>
                <SpatialButton
                  to="/hackathons"
                  variant="secondary"
                  size="sm"
                  icon={Trophy}
                >
                  Explore Hackathons
                </SpatialButton>
              </div>

              <Link
                to="/users"
                className={`text-xs font-semibold flex items-center gap-1 group ${
                  isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                Browse All Candidates
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </SpatialCard>

          {/* TELEMETRY STACK: 3 Supporting Asymmetric Glass Modules (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Supporting Module 1: Created Requests */}
            <SpatialCard
              as={Link}
              to="/my-requests"
              hover
              elevation="raised"
              className="p-5 flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400'
                }`}>
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-xs font-semibold block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Active Team Posts
                  </span>
                  <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {myRequestsCount}
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                    Recruiting candidates on campus
                  </p>
                </div>
              </div>
              <ArrowUpRight className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isLight ? 'text-slate-400 group-hover:text-indigo-600' : 'text-gray-500 group-hover:text-indigo-400'
              }`} />
            </SpatialCard>

            {/* Supporting Module 2: Applications Sent */}
            <SpatialCard
              as={Link}
              to="/my-requests"
              hover
              elevation="raised"
              className="p-5 flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-cyan-50 border border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400'
                }`}>
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-xs font-semibold block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Applications Sent
                  </span>
                  <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {myResponsesCount}
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                    Inquiries sent to other squads
                  </p>
                </div>
              </div>
              <ArrowUpRight className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isLight ? 'text-slate-400 group-hover:text-cyan-600' : 'text-gray-500 group-hover:text-cyan-400'
              }`} />
            </SpatialCard>

            {/* Supporting Module 3: Profile Skills Arsenal */}
            <SpatialCard
              as={Link}
              to="/profile"
              hover
              elevation="raised"
              className="p-5 flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-purple-50 border border-purple-200 text-purple-600' : 'bg-purple-500/10 border border-purple-500/25 text-purple-400'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-semibold block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Indexed Skills Arsenal
                  </span>
                  <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {user?.skills?.length || 0}
                  </div>
                  {/* Skill pill preview */}
                  <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                    {(user?.skills || []).slice(0, 3).map((sk) => (
                      <span 
                        key={sk} 
                        className={`text-[10px] px-2 py-0.5 rounded-md truncate ${
                          isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-500/15 text-purple-300'
                        }`}
                      >
                        {sk}
                      </span>
                    ))}
                    {(user?.skills?.length || 0) > 3 && (
                      <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        +{user.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowUpRight className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isLight ? 'text-slate-400 group-hover:text-purple-600' : 'text-gray-500 group-hover:text-purple-400'
              }`} />
            </SpatialCard>

          </div>
        </div>
      </section>

      {/* =====================================================================
          LAYER 3: FEATURED HACKATHONS AREA
          Floating spatial cards in the 3D environment with depth separation
          ===================================================================== */}
      <section aria-label="Featured Hackathons" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              Live Competitions
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Featured & Upcoming Hackathons
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Hand-picked and automatically synchronized events open for team formation.
            </p>
          </div>

          <Link
            to="/hackathons"
            className={`text-xs font-semibold flex items-center gap-1 group shrink-0 ${
              isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            Explore Directory ({recentHackathons.length > 0 ? 'Full Roster' : 'Browse'})
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {recentHackathons.map((hackathon) => (
              <HackathonCard 
                key={hackathon._id || hackathon.id} 
                hackathon={hackathon} 
              />
            ))}
          </div>
        ) : (
          <SpatialPanel className="p-8 text-center space-y-3">
            <Trophy className="w-8 h-8 text-amber-500/60 mx-auto" />
            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
              No live hackathons synchronized right now
            </h3>
            <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Check back shortly or visit the hackathons directory to discover student-submitted events.
            </p>
            <SpatialButton to="/hackathons" variant="secondary" size="sm">
              Visit Hackathons
            </SpatialButton>
          </SpatialPanel>
        )}
      </section>

      {/* =====================================================================
          LAYER 3: RECOMMENDED TEAMMATES SECTION
          Smart Matching Algorithm developer cards floating across the world
          ===================================================================== */}
      <section aria-label="Recommended Teammates" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Smart Matching Algorithm
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Recommended Developers for You
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Developers complementary to your stack across the campus network.
            </p>
          </div>

          <Link
            to="/users"
            className={`text-xs font-semibold flex items-center gap-1 group shrink-0 ${
              isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            Browse All Developers
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recommendedMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {recommendedMatches.map((m) => (
              <UserCard
                key={m.user?._id || m.user?.id}
                user={m.user}
                matchScore={m.matchScore}
                overlappingSkills={m.matchedSkills || m.overlappingSkills || []}
              />
            ))}
          </div>
        ) : (
          <SpatialPanel className="p-8 text-center space-y-3">
            <Users className="w-8 h-8 text-indigo-400/60 mx-auto" />
            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
              More skills needed for automated teammate matching
            </h3>
            <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Add more skills, domains, or framework tags to your developer profile so our algorithm can pair you with compatible hackers.
            </p>
            <SpatialButton to="/profile" variant="primary" size="sm">
              Update Profile Skills
            </SpatialButton>
          </SpatialPanel>
        )}
      </section>

      {/* =====================================================================
          LAYER 2 & 4: SPATIAL WORKFLOW DOCK (UTILITY NAVIGATION)
          Tier 1 glass substrate with rapid access to primary student routes
          ===================================================================== */}
      <section aria-label="Workflow Navigation" className="pt-2">
        <SpatialPanel className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b pb-4 border-inherit">
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Workspace Workflows
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Quick shortcuts to manage team posts, explore hackathons, and verify credentials.
              </p>
            </div>
            <Compass className={`w-5 h-5 shrink-0 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpatialCard
              as={Link}
              to="/post-request"
              hover
              padding="compact"
              elevation="raised"
              className="flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Post Team Request</span>
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </SpatialCard>

            <SpatialCard
              as={Link}
              to="/hackathons"
              hover
              padding="compact"
              elevation="raised"
              className="flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Explore Hackathons</span>
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </SpatialCard>

            <SpatialCard
              as={Link}
              to="/users"
              hover
              padding="compact"
              elevation="raised"
              className="flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Discover Developers</span>
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </SpatialCard>

            <SpatialCard
              as={Link}
              to="/my-requests"
              hover
              padding="compact"
              elevation="raised"
              className="flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Manage Squad Requests</span>
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </SpatialCard>
          </div>
        </SpatialPanel>
      </section>

    </div>
  );
};

export default Dashboard;
