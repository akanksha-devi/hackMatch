import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { SkillTag } from '../components/SkillTag';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { VerificationBadge } from '../components/VerificationBadge';
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
        <h2 className="text-2xl font-bold text-white">Campus Isolation Active</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          {forbiddenError}
        </p>
        <Link
          to="/users"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
        >
          Return to My Campus Developers
        </Link>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
        <Link to="/users" className="text-indigo-400 font-semibold hover:underline">
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
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Profile Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/users" className="hover:text-white transition-colors">
            Developers
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Developer Profile</span>
        </div>

        {/* Profile Action Buttons */}
        <div className="flex items-center gap-3">
          {isOwnProfile && (
            <>
              {/* Verification Request Action for Unverified or Rejected */}
              {(isUnverified || isRejected) && (
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="btn-glow px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs flex items-center gap-2 hover:brightness-110 transition-all"
                >
                  <BadgeCheck className="w-4 h-4" />
                  {isRejected ? 'Request Verification Again' : 'Request Verification'}
                </button>
              )}

              {/* Status Indicator for Pending */}
              {isPending && (
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Verification Pending
                </span>
              )}

              {/* Badge for Verified */}
              {isVerified && (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}

              {/* Edit Profile Button */}
              <Link
                to="/profile/edit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 1. Main Profile Card */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Profile Picture */}
          <div className="relative shrink-0">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-2xl"
            />
          </div>

          {/* Core Info */}
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {name}
              </h1>

              {/* Dynamic College Display */}
              <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium pt-0.5">
                <School className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>College: <strong className="text-white">{resolvedCollegeName}</strong></span>
              </div>
            </div>

            {/* Verification Status & Experience Level Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Experience Level: <span className="font-bold text-white">{experienceLevel}</span>
              </span>

              <VerificationBadge status={experienceVerificationStatus} size="lg" />
            </div>

            {email && (
              <p className="text-xs text-gray-400 pt-1">{email}</p>
            )}

            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Member since {new Date(createdAt || Date.now()).getFullYear()}
            </p>
          </div>
        </div>

        {/* About / Bio */}
        <div className="pt-4 border-t border-gray-800 space-y-1.5">
          <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">About</h3>
          <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
            {bio || 'No bio provided.'}
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-2.5 pt-4 border-t border-gray-800">
          <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-cyan-400" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <SkillTag key={skill} name={skill} size="md" isHighlight />
              ))
            ) : (
              <span className="text-xs text-gray-500">No skills listed</span>
            )}
          </div>
        </div>

        {/* Social Links (Render only if URLs exist) */}
        {(githubUrl || linkedinUrl || portfolioUrl) && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-800 text-xs flex-wrap">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-gray-900/80 hover:bg-gray-800 px-3.5 py-2 rounded-xl border border-gray-800"
              >
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-gray-900/80 hover:bg-gray-800 px-3.5 py-2 rounded-xl border border-gray-800"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            )}
            {portfolioUrl && (
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-gray-900/80 hover:bg-gray-800 px-3.5 py-2 rounded-xl border border-gray-800"
              >
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* 2. Dedicated Experience Display Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Experience & Verification
          </h2>
          <VerificationBadge status={experienceVerificationStatus} size="lg" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/60 pb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Experience Level</span>
            <span className="text-sm font-bold text-white bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
              {experienceLevel}
            </span>
          </div>

          <div className="space-y-2 border-b border-gray-800/60 pb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Status</span>
            
            {/* Status: Verified */}
            {isVerified && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Verified by College Administration
                </p>
                {experienceVerificationNote && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong>Campus Endorsement:</strong> {experienceVerificationNote}
                  </div>
                )}
              </div>
            )}

            {/* Status: Pending */}
            {isPending && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Pending Verification
                </p>
                <p className="text-xs text-gray-300 bg-amber-950/30 p-3 rounded-xl border border-amber-500/20">
                  Your verification request is currently under review by your college administration.
                </p>
              </div>
            )}

            {/* Status: Rejected */}
            {isRejected && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Verification Rejected
                </p>
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-300">
                  <strong>Reason:</strong> {experienceVerificationNote || 'Please provide valid GitHub repositories with commit history.'}
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="btn-glow px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs flex items-center gap-2 hover:brightness-110 transition-all"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Request Verification Again
                  </button>
                )}
              </div>
            )}

            {/* Status: Unverified */}
            {isUnverified && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Unverified
                </p>
                <p className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  Your experience level is self-declared. Submit proof of experience for college verification.
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="btn-glow px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs flex items-center gap-2 hover:brightness-110 transition-all"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Request Verification
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Skills under Experience Card */}
          <div className="space-y-2 pt-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Skills</span>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <SkillTag key={s} name={s} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Connected HackMatch Features: Team Requests */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              Team Requests
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isOwnProfile
                ? 'Active team formation requests you created'
                : `Active team requests created by ${name}`}
            </p>
          </div>

          {isOwnProfile && (
            <Link
              to="/my-requests"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
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
          <div className="py-8 text-center space-y-3 bg-gray-900/40 rounded-2xl border border-gray-800/80 p-6">
            <Inbox className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs text-gray-400">
              {isOwnProfile
                ? 'You have not created any team requests yet.'
                : 'No active team requests posted by this student.'}
            </p>
            {isOwnProfile && (
              <Link
                to="/post-request"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post Team Request
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 4. Connected HackMatch Features: Applications (Own Profile Only) */}
      {isOwnProfile && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                Applications
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Overview of applications you submitted and candidates who applied to your teams
              </p>
            </div>

            <Link
              to="/my-requests"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Applications I Sent
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">
                  {sentApplicationsCount}
                </span>
                <Link
                  to="/my-requests"
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Track status →
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Applicant Responses Received
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">
                  {receivedApplicationsCount}
                </span>
                <Link
                  to="/my-requests"
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Review applicants →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Verification History Section (Own Profile Only) */}
      {isOwnProfile && verificationHistory.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Verification History
            </h3>
            <span className="text-xs text-gray-400">
              {verificationHistory.length} record{verificationHistory.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="divide-y divide-gray-800/80">
            {verificationHistory.map((item) => (
              <div
                key={item._id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
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
        </div>
      )}

      {/* 6. Verification Submission Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" />
                  Request Experience Verification
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Your campus administration will inspect your evidence and verify your experience level.
                </p>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-400 hover:text-white font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {verifSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs">
                {verifSuccess}
              </div>
            )}
            {verifError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
                {verifError}
              </div>
            )}

            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Requested Level *</label>
                <select
                  value={requestedLevel}
                  onChange={(e) => setRequestedLevel(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner (Foundational projects)</option>
                  <option value="Intermediate">Intermediate (Multiple apps / hackathon experience)</option>
                  <option value="Advanced">Advanced (3+ hackathon wins, open-source / production systems)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">GitHub Profile URL</label>
                <input
                  type="url"
                  value={githubUrlInput}
                  onChange={(e) => setGithubUrlInput(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Portfolio / Personal Website</label>
                <input
                  type="url"
                  value={portfolioUrlInput}
                  onChange={(e) => setPortfolioUrlInput(e.target.value)}
                  placeholder="https://yourdomain.dev"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Key Project / Deployment Links (One per line)</label>
                <textarea
                  rows={2}
                  value={projectLinksInput}
                  onChange={(e) => setProjectLinksInput(e.target.value)}
                  placeholder="https://myproject.vercel.app&#10;https://github.com/myteam/hackathon-winner"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Description & Proof of Experience *</label>
                <textarea
                  rows={3}
                  required
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Summarize your technical contributions, hackathon awards, and production tech stack experience..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerif}
                  className="btn-glow px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {submittingVerif && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

