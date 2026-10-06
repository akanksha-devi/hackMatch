import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  PlusCircle, 
  Users, 
  ArrowLeft, 
  MessageSquare, 
  AlertCircle,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import apiService from '../services/apiService';
import { SkillChip } from '../components/SkillChip';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { SpatialCard, SpatialPanel, SpatialModal, SpatialButton, SpatialTextarea } from '../components/spatial';

export const HackathonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamRequests, setTeamRequests] = useState([]);
  const [selectedRequestToRespond, setSelectedRequestToRespond] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState('');
  const [responseError, setResponseError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hRes, trRes] = await Promise.all([
          apiService.getHackathonById(id),
          apiService.getTeamRequests({ hackathon: id }),
        ]);

        if (hRes.success && hRes.hackathon) {
          setHackathon(hRes.hackathon);
        }
        if (trRes.success && trRes.teamRequests) {
          setTeamRequests(trRes.teamRequests);
        }
      } catch (err) {
        console.error('Error fetching hackathon details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400">Loading hackathon details...</p>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Hackathon Not Found</h2>
        <Link to="/hackathons" className="text-indigo-400 font-semibold hover:underline">
          Return to Hackathons Directory
        </Link>
      </div>
    );
  }

  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    setResponseError('');
    setResponseSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!responseMessage.trim()) {
      setResponseError('Please enter a short message for the request creator.');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createResponse({
        teamRequestId: selectedRequestToRespond._id || selectedRequestToRespond.id,
        message: responseMessage,
      });

      setResponseSuccess('Your application/response has been sent successfully!');
      setTimeout(() => {
        setSelectedRequestToRespond(null);
        setResponseMessage('');
        setResponseSuccess('');
      }, 1500);
    } catch (err) {
      setResponseError(err.response?.data?.message || 'Failed to send response.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <Link
        to="/hackathons"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      {/* Hero Header Card */}
      <SpatialCard accentLine elevation="raised" padding="large" className="space-y-6">

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={hackathon.mode} type="mode" size="md" />
              <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} flex items-center gap-1`}>
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Organized by {hackathon.organizer}
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'} leading-tight`}>
              {hackathon.title}
            </h1>
          </div>

          {hackathon.registrationLink && (
            <SpatialButton
              href={hackathon.registrationLink}
              target="_blank"
              rel="noreferrer"
              variant="primary"
              size="lg"
              icon={ExternalLink}
              iconPosition="right"
              className="shrink-0 self-start"
            >
              Official Registration
            </SpatialButton>
          )}
        </div>

        {/* Metadata Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border text-xs ${
          isLight ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-gray-900/60 border-gray-800/80 text-gray-300'
        }`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'} uppercase font-semibold`}>Hackathon Dates</p>
              <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{hackathon.startDate} to {hackathon.endDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
            <div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'} uppercase font-semibold`}>Location / Mode</p>
              <p className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{hackathon.location || hackathon.mode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-500'} uppercase font-semibold`}>Apply Deadline</p>
              <p className="font-semibold text-amber-500">{hackathon.registrationDeadline || 'Open'}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>About this Hackathon</h3>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'} leading-relaxed`}>
            {hackathon.description}
          </p>
        </div>

        {/* Tags */}
        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            {hackathon.tags.map((tag) => (
              <SkillChip key={tag} skill={tag} variant="default" size="md" />
            ))}
          </div>
        )}
      </SpatialCard>

      {/* Team Requests Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
              <Users className="w-6 h-6 text-cyan-500" />
              Team Requests for {hackathon.title}
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Looking for specific skills? Join an open team or post your own request.</p>
          </div>

          <SpatialButton
            to={`/post-request?hackathonId=${hackathon.id || hackathon._id}`}
            variant="primary"
            size="sm"
            icon={PlusCircle}
            className="shrink-0"
          >
            Post Team Request
          </SpatialButton>
        </div>

        {teamRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamRequests.map((req) => (
              <TeamRequestCard
                key={req._id || req.id}
                request={req}
                onRespond={(targetReq) => setSelectedRequestToRespond(targetReq)}
              />
            ))}
          </div>
        ) : (
          <SpatialPanel padding="loose" className="text-center space-y-3">
            <Users className="w-10 h-10 text-gray-500 mx-auto" />
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>No Team Requests Posted Yet</h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Be the first to post a team request for this hackathon!</p>
            <SpatialButton
              to={`/post-request?hackathonId=${hackathon.id || hackathon._id}`}
              variant="primary"
              size="sm"
              icon={PlusCircle}
            >
              Post First Team Request
            </SpatialButton>
          </SpatialPanel>
        )}
      </div>

      {/* Respond Modal */}
      <SpatialModal
        isOpen={Boolean(selectedRequestToRespond)}
        onClose={() => setSelectedRequestToRespond(null)}
        title="Respond to Team Request"
        icon={MessageSquare}
        maxWidth="max-w-lg"
      >
        {selectedRequestToRespond && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-gray-900/80 border-gray-800'} border space-y-2 text-xs`}>
              <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedRequestToRespond.title}</p>
              <p className={`${isLight ? 'text-slate-600' : 'text-gray-400'} line-clamp-2`}>{selectedRequestToRespond.description}</p>
            </div>

            {responseSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs">
                {responseSuccess}
              </div>
            )}

            {responseError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{responseError}</span>
              </div>
            )}

            {user?.role === 'student' && user?.experienceVerificationStatus !== 'Verified' ? (
              <div className="text-center py-4 space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400'} border flex items-center justify-center mx-auto`}>
                  <Lock className="w-7 h-7 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>🔒 Application Locked</h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} max-w-sm mx-auto mt-1 leading-relaxed`}>
                    Your profile needs verified experience before you can apply to teams. Verification builds trust between hackathon participants.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <SpatialButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedRequestToRespond(null)}
                  >
                    Close
                  </SpatialButton>
                  <SpatialButton
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={ShieldCheck}
                    onClick={() => navigate('/profile')}
                  >
                    Verify My Experience
                  </SpatialButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRespondSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="hackathon-response-msg" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                    Introductory Message for Team Leader *
                  </label>
                  <SpatialTextarea
                    id="hackathon-response-msg"
                    rows={4}
                    required
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Introduce yourself, mention your relevant skills, past hackathon projects, and availability..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <SpatialButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setSelectedRequestToRespond(null)}
                  >
                    Cancel
                  </SpatialButton>
                  <SpatialButton
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={submitting}
                  >
                    Send Application
                  </SpatialButton>
                </div>
              </form>
            )}
          </div>
        )}
      </SpatialModal>
    </div>
  );
};
