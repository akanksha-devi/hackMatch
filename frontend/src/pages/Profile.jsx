import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { SkillChip } from '../components/SkillChip';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { VerificationBadge } from '../components/VerificationBadge';
import { ExperienceBadge } from '../components/ExperienceBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { useTheme } from '../context/ThemeContext';
import { SpatialCard, SpatialPanel, SpatialModal, SpatialDropdown, SpatialButton, SpatialInput, SpatialTextarea } from '../components/spatial';
import { 
  User as UserIcon, 
  Code2, 
  Share2, 
  Globe, 
  Edit3, 
  Calendar, 
  Trophy, 
  Inbox, 
  Code, 
  School, 
  ShieldAlert, 
  ShieldCheck,
  Loader2, 
  BadgeCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  ExternalLink, 
  History,
  Send,
  ArrowRight,
  PlusCircle
} from 'lucide-react';

export const Profile = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState('');
  const [userRequests, setUserRequests] = useState([]);
  const [sentApplicationsCount, setSentApplicationsCount] = useState(0);
  const [receivedApplicationsCount, setReceivedApplicationsCount] = useState(0);
  const [verificationHistory, setVerificationHistory] = useState([]);

  // Verification Request Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [requestedLevel, setRequestedLevel] = useState('Advanced');
  const [githubUrlInput, setGithubUrlInput] = useState('');
  const [portfolioUrlInput, setPortfolioUrlInput] = useState('');
  const [projectLinksInput, setProjectLinksInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [submittingVerif, setSubmittingVerif] = useState(false);
  const [verifError, setVerifError] = useState('');
  const [verifSuccess, setVerifSuccess] = useState('');

  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = !id || id === currentUserId;

  const loadVerificationHistory = async () => {
    try {
      const vRes = await apiService.getMyExperienceVerifications();
      if (vRes.success && vRes.verifications) {
        setVerificationHistory(vRes.verifications);
      }
    } catch (vErr) {
      console.error('Failed to load verification history:', vErr);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setForbiddenError('');
      const targetId = id || currentUserId;

      if (!targetId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch User Profile
        const res = await apiService.getUserById(targetId);
        if (res.success && res.user) {
          setProfileUser(res.user);
          setGithubUrlInput(res.user.githubUrl || '');
          setPortfolioUrlInput(res.user.portfolioUrl || '');
          setRequestedLevel(res.user.experienceLevel || 'Advanced');
        }

        // 2. Fetch Team Requests posted by this user
        try {
          const reqRes = await apiService.getTeamRequests({ postedBy: targetId });
          if (reqRes.success && reqRes.teamRequests) {
            setUserRequests(reqRes.teamRequests);
          }
        } catch (reqErr) {
          console.error('Failed to load user team requests:', reqErr);
        }

        // 3. If viewing own profile, fetch applications & verification history
        if (!id || id === currentUserId) {
          await loadVerificationHistory();

          try {
            const respData = await apiService.getMyResponses();
            if (respData.success) {
              setSentApplicationsCount((respData.sentApplications || []).length);
              setReceivedApplicationsCount((respData.receivedApplications || []).length);
            }
          } catch (respErr) {
            console.error('Failed to load responses count:', respErr);
          }
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setForbiddenError(err.response.data?.message || 'Access Denied: Cross-college profile viewing is restricted.');
        } else {
          setProfileUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUserId]);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setSubmittingVerif(true);
    setVerifError('');
    setVerifSuccess('');

    try {
      const projectLinks = projectLinksInput
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await apiService.submitExperienceVerification({
        requestedLevel,
        githubUrl: githubUrlInput.trim(),
        portfolioUrl: portfolioUrlInput.trim(),
        projectLinks,
        description: descriptionInput.trim(),
      });

      setVerifSuccess(res.message || 'Verification submitted for campus admin review!');
      setProfileUser((prev) => ({
        ...prev,
        experienceVerificationStatus: 'Pending',
        experienceVerificationNote: '',
      }));
      if (refreshUser) await refreshUser();
      window.dispatchEvent(new CustomEvent('notification-refresh'));
      await loadVerificationHistory();

      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifSuccess('');
        setDescriptionInput('');
      }, 1500);
    } catch (err) {
      setVerifError(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmittingVerif(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400">Loading developer profile...</p>
      </div>
    );
  }

  if (forbiddenError) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center space-y-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Campus Isolation Active</h2>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          {forbiddenError}
        </p>
        <SpatialButton
          to="/users"
          variant="primary"
          size="md"
        >
          Return to My Campus Developers
        </SpatialButton>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Profile Not Found</h2>
        <Link to="/users" className="text-indigo-500 font-semibold hover:underline">
          Browse Developers
        </Link>
      </div>
    );
  }

  const {
    name,
    email,
    bio,
    skills = [],
    experienceLevel = 'Intermediate',
    experienceVerificationStatus = 'Unverified',
    experienceVerificationNote = '',
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    avatarUrl,
    createdAt
  } = profileUser;

  const resolvedCollegeName =
    profileUser.collegeId?.name || profileUser.college?.name || profileUser.college || 'Institution';

  const isVerified = experienceVerificationStatus === 'Verified';
  const isPending = experienceVerificationStatus === 'Pending';
  const isRejected = experienceVerificationStatus === 'Rejected';
  const isUnverified = !isVerified && !isPending && !isRejected;

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      
      {/* =====================================================================
          LAYER 2 & 5: SPATIAL PERSONAL IDENTITY SURFACE
          ===================================================================== */}
      <section aria-label="Personal Identity Header" className="relative pt-2">
        <div 
          className={`absolute -top-16 left-0 w-96 h-96 blur-3xl rounded-full pointer-events-none transition-opacity duration-700 ${
            isLight ? 'bg-indigo-200/30' : 'bg-indigo-600/15'
          }`} 
          aria-hidden="true" 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-inherit relative z-10">
          <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            <Link to="/users" className={`transition-colors ${isLight ? 'hover:text-slate-900' : 'hover:text-white'}`}>
              Developers
            </Link>
            <span>/</span>
            <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Developer Profile</span>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3 flex-wrap">
            {isOwnProfile && (
              <>
                {(isUnverified || isRejected) && (
                  <SpatialButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowVerifyModal(true)}
                    icon={BadgeCheck}
                  >
                    {isRejected ? 'Request Verification Again' : 'Request Verification'}
                  </SpatialButton>
                )}

                <SpatialButton
                  to="/profile/edit"
                  variant="primary"
                  size="sm"
                  icon={Edit3}
                >
                  Edit Profile
                </SpatialButton>
              </>
            )}
          </div>
        </div>

        {/* Main Identity Surface */}
        <div className="mt-6 relative z-10">
          <SpatialCard accentLine elevation="raised" padding="large" className="space-y-6 border-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Focal Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  src={avatarUrl}
                  name={name}
                  size="2xl"
                  verified={isVerified}
                />
              </div>

              {/* Identity & Badges */}
              <div className="space-y-2 flex-1">
                <div className="space-y-1">
                  <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {name}
                  </h1>

                  <div className="flex items-center gap-1.5 text-xs font-medium pt-0.5">
                    <School className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Campus: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{resolvedCollegeName}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <ExperienceBadge level={experienceLevel} size="md" />
                  <VerificationBadge status={experienceVerificationStatus} size="lg" />
                </div>

                {email && (
                  <p className={`text-xs pt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{email}</p>
                )}

                <p className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Member since {new Date(createdAt || Date.now()).getFullYear()}
                </p>
              </div>
            </div>

            {/* About / Bio */}
            <div className={`pt-4 border-t space-y-1.5 ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
              <h2 className={`text-xs uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>About Developer</h2>
              <p className={`text-sm leading-relaxed max-w-3xl ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                {bio || 'No bio provided yet.'}
              </p>
            </div>

            {/* Social Links */}
            {(githubUrl || linkedinUrl || portfolioUrl) && (
              <div className={`flex items-center gap-3 pt-4 border-t text-xs flex-wrap ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
                {githubUrl && (
                  <SpatialButton
                    as="a"
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    size="sm"
                    icon={Code2}
                  >
                    GitHub
                  </SpatialButton>
                )}
                {linkedinUrl && (
                  <SpatialButton
                    as="a"
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    size="sm"
                    icon={Share2}
                  >
                    LinkedIn
                  </SpatialButton>
                )}
                {portfolioUrl && (
                  <SpatialButton
                    as="a"
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    size="sm"
                    icon={Globe}
                  >
                    Portfolio
                  </SpatialButton>
                )}
              </div>
            )}
          </SpatialCard>
        </div>
      </section>

      {/* =====================================================================
          LAYER 3 & 4: SKILLS ARSENAL & VERIFICATION TRUST CENTER (SECONDARY)
          ===================================================================== */}
      <section aria-label="Skills and Verification Details">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Skills Arsenal (7 cols) */}
          <SpatialCard elevation="raised" hover={false} className="lg:col-span-7 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Code className="w-5 h-5 text-cyan-500" />
                Indexed Skills Arsenal
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isLight ? 'bg-cyan-50 text-cyan-800' : 'bg-cyan-500/15 text-cyan-300'
              }`}>
                {skills.length} Stack Tags
              </span>
            </div>

            <div className="space-y-3">
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                These skills are evaluated in real-time by the HackMatch Smart Matching algorithm to score squad compatibility.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <SkillChip key={skill} skill={skill} variant="default" size="md" />
                  ))
                ) : (
                  <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No skills listed yet</span>
                )}
              </div>
            </div>
          </SpatialCard>

          {/* Verification & Trust Center (5 cols) */}
          <SpatialCard elevation="raised" hover={false} className="lg:col-span-5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Trust & Verification
              </h2>
              <VerificationBadge status={experienceVerificationStatus} size="md" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-gray-400'}>Claimed Experience:</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{experienceLevel} Level</span>
              </div>

              {isVerified && (
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                }`}>
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified by Campus Administration
                  </p>
                  {experienceVerificationNote && (
                    <p className="text-[11px] leading-relaxed opacity-90">
                      <strong>Endorsement:</strong> {experienceVerificationNote}
                    </p>
                  )}
                </div>
              )}

              {isPending && (
                <div className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-500/20 text-amber-300'
                }`}>
                  <p className="font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" /> Review In Progress
                  </p>
                  <p className="text-[11px] opacity-90">
                    Your verification request is currently being inspected by campus administrators.
                  </p>
                </div>
              )}

              {isRejected && (
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                }`}>
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> Verification Rejected
                  </p>
                  <p className="text-[11px] opacity-90">
                    {experienceVerificationNote || 'Please provide updated project evidence.'}
                  </p>
                  {isOwnProfile && (
                    <SpatialButton
                      variant="primary"
                      size="sm"
                      onClick={() => setShowVerifyModal(true)}
                      icon={BadgeCheck}
                    >
                      Re-submit Evidence
                    </SpatialButton>
                  )}
                </div>
              )}

              {isUnverified && (
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-white/[0.08] text-gray-300'
                }`}>
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Self-Declared Profile
                  </p>
                  <p className="text-[11px] opacity-90">
                    Experience level is unverified. Submit GitHub or portfolio evidence for campus badge verification.
                  </p>
                  {isOwnProfile && (
                    <SpatialButton
                      variant="primary"
                      size="sm"
                      onClick={() => setShowVerifyModal(true)}
                      icon={BadgeCheck}
                    >
                      Request Verification
                    </SpatialButton>
                  )}
                </div>
              )}
            </div>
          </SpatialCard>

        </div>
      </section>

      {/* 3. Connected HackMatch Features: Team Requests */}
      <SpatialPanel padding="loose" className="space-y-6">
        <div className={`flex items-center justify-between border-b pb-4 ${
          isLight ? 'border-slate-200' : 'border-gray-800'
        }`}>
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Trophy className="w-5 h-5 text-cyan-500" />
              Team Requests
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {isOwnProfile
                ? 'Active team formation requests you created'
                : `Active team requests created by ${name}`}
            </p>
          </div>

          {isOwnProfile && (
            <Link
              to="/my-requests"
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              Manage Requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {userRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRequests.map((req) => (
              <TeamRequestCard key={req._id || req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className={`py-8 text-center space-y-3 rounded-2xl border p-6 ${
            isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-gray-900/40 border-gray-800/80'
          }`}>
            <Inbox className={`w-8 h-8 mx-auto ${isLight ? 'text-slate-400' : 'text-gray-600'}`} />
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {isOwnProfile
                ? 'You have not created any team requests yet.'
                : 'No active team requests posted by this student.'}
            </p>
            {isOwnProfile && (
              <SpatialButton
                to="/post-request"
                variant="primary"
                size="sm"
                icon={PlusCircle}
              >
                Post Team Request
              </SpatialButton>
            )}
          </div>
        )}
      </SpatialPanel>

      {/* 4. Connected HackMatch Features: Applications (Own Profile Only) */}
      {isOwnProfile && (
        <SpatialPanel padding="loose" className="space-y-6">
          <div className={`flex items-center justify-between border-b pb-4 ${
            isLight ? 'border-slate-200' : 'border-gray-800'
          }`}>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Send className="w-5 h-5 text-indigo-500" />
                Applications
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Overview of applications you submitted and candidates who applied to your teams
              </p>
            </div>

            <Link
              to="/my-requests"
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              View Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-gray-900/60 border-gray-800'
            }`}>
              <span className={`text-xs uppercase tracking-wider font-semibold ${
                isLight ? 'text-slate-500' : 'text-gray-400'
              }`}>
                Applications I Sent
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {sentApplicationsCount}
                </span>
                <Link
                  to="/my-requests"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Track status →
                </Link>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-gray-900/60 border-gray-800'
            }`}>
              <span className={`text-xs uppercase tracking-wider font-semibold ${
                isLight ? 'text-slate-500' : 'text-gray-400'
              }`}>
                Applicant Responses Received
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {receivedApplicationsCount}
                </span>
                <Link
                  to="/my-requests"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Review applicants →
                </Link>
              </div>
            </div>
          </div>
        </SpatialPanel>
      )}

      {/* 5. Verification History Section (Own Profile Only) */}
      {isOwnProfile && verificationHistory.length > 0 && (
        <SpatialPanel padding="loose" className="space-y-4">
          <div className={`flex items-center justify-between pb-3 border-b ${
            isLight ? 'border-slate-200' : 'border-gray-800'
          }`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-700' : 'text-gray-300'
            }`}>
              <History className="w-4 h-4 text-indigo-500" />
              Verification History
            </h3>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {verificationHistory.length} record{verificationHistory.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-gray-800/80'}`}>
            {verificationHistory.map((item) => (
              <div
                key={item._id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Requested: {item.requestedLevel} Experience
                    </span>
                    <VerificationBadge status={item.status} />
                    <span className="text-xs text-gray-500">
                      • Submitted on {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {item.reviewedBy && (
                    <p className="text-xs text-gray-400">
                      Reviewed by {item.reviewedBy?.name || 'Campus Administrator'} on {new Date(item.reviewedAt || item.updatedAt).toLocaleDateString()}
                    </p>
                  )}

                  {item.reviewNote && (
                    <p className={`text-xs mt-1 ${item.status === 'Verified' ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
                      <strong>Review Note:</strong> {item.reviewNote}
                    </p>
                  )}
                </div>

                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors self-start sm:self-auto"
                  >
                    <span>Proof Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </SpatialPanel>
      )}

      {/* 6. Verification Submission Modal */}
      <SpatialModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Request Experience Verification"
        subtitle="Your campus administration will inspect your evidence and verify your experience level."
        icon={BadgeCheck}
        maxWidth="max-w-lg"
      >
        {verifSuccess && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{verifSuccess}</span>
          </div>
        )}
        {verifError && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{verifError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitVerification} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              Requested Level *
            </label>
            <SpatialDropdown
              value={requestedLevel}
              onChange={(e) => setRequestedLevel(e.target.value)}
              options={[
                { value: 'Beginner', label: 'Beginner (Foundational projects)' },
                { value: 'Intermediate', label: 'Intermediate (Multiple apps / hackathon experience)' },
                { value: 'Advanced', label: 'Advanced (3+ hackathon wins, open-source / production systems)' },
              ]}
              placeholder="Select Level..."
            />
          </div>

          <div className="space-y-1.5">
            <SpatialInput
              id="verification-github-url"
              label="GitHub Profile URL"
              type="url"
              value={githubUrlInput}
              onChange={(e) => setGithubUrlInput(e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-1.5">
            <SpatialInput
              id="verification-portfolio-url"
              label="Portfolio / Personal Website"
              type="url"
              value={portfolioUrlInput}
              onChange={(e) => setPortfolioUrlInput(e.target.value)}
              placeholder="https://yourdomain.dev"
            />
          </div>

          <div className="space-y-1.5">
            <SpatialTextarea
              id="verification-project-links"
              label="Key Project / Deployment Links (One per line)"
              rows={2}
              value={projectLinksInput}
              onChange={(e) => setProjectLinksInput(e.target.value)}
              placeholder="https://myproject.vercel.app&#10;https://github.com/myteam/hackathon-winner"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <SpatialTextarea
              id="verification-description"
              label="Description & Proof of Experience"
              required
              rows={3}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Summarize your technical contributions, hackathon awards, and production tech stack experience..."
            />
          </div>

          <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            <SpatialButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowVerifyModal(false)}
            >
              Cancel
            </SpatialButton>
            <SpatialButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={submittingVerif}
              icon={CheckCircle2}
            >
              Submit Evidence
            </SpatialButton>
          </div>
        </form>
      </SpatialModal>
    </div>
  );
};

export default Profile;

