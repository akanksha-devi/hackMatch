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
import { SkillTag } from '../components/SkillTag';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { useAuth } from '../hooks/useAuth';

export const HackathonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

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
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {hackathon.mode}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Organized by {hackathon.organizer}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {hackathon.title}
            </h1>
          </div>

          {hackathon.registrationLink && (
            <a
              href={hackathon.registrationLink}
              target="_blank"
              rel="noreferrer"
              className="btn-glow px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shrink-0 self-start"
            >
              Official Registration <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Hackathon Dates</p>
              <p className="font-semibold text-white">{hackathon.startDate} to {hackathon.endDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Location / Mode</p>
              <p className="font-semibold text-white">{hackathon.location || hackathon.mode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Apply Deadline</p>
              <p className="font-semibold text-amber-400">{hackathon.registrationDeadline || 'Open'}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-200">About this Hackathon</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {hackathon.description}
          </p>
        </div>

        {/* Tags */}
        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
            {hackathon.tags.map((tag) => (
              <SkillTag key={tag} name={tag} size="md" />
            ))}
          </div>
        )}
      </div>

      {/* Team Requests Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Team Requests for {hackathon.title}
            </h2>
            <p className="text-xs text-gray-400">Looking for specific skills? Join an open team or post your own request.</p>
          </div>

          <Link
            to={`/post-request?hackathonId=${hackathon.id}`}
            className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Post Team Request
          </Link>
        </div>

        {teamRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamRequests.map((req) => (
              <TeamRequestCard
                key={req.id}
                request={req}
                onRespond={(targetReq) => setSelectedRequestToRespond(targetReq)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 rounded-3xl border border-gray-800 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Team Requests Posted Yet</h3>
            <p className="text-xs text-gray-400">Be the first to post a team request for this hackathon!</p>
            <Link
              to={`/post-request?hackathonId=${hackathon.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Post First Team Request
            </Link>
          </div>
        )}
      </div>

      {/* Respond Modal */}
      {selectedRequestToRespond && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Respond to Team Request
              </h3>
              <button
                onClick={() => setSelectedRequestToRespond(null)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 text-xs">
              <p className="font-bold text-white">{selectedRequestToRespond.title}</p>
              <p className="text-gray-400 line-clamp-2">{selectedRequestToRespond.description}</p>
            </div>

            {responseSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {responseSuccess}
              </div>
            )}

            {responseError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{responseError}</span>
              </div>
            )}

            {user?.role === 'student' && user?.experienceVerificationStatus !== 'Verified' ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                  <Lock className="w-7 h-7 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">🔒 Application Locked</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                    Your profile needs verified experience before you can apply to teams. Verification builds trust between hackathon participants.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequestToRespond(null)}
                    className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:brightness-110 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify My Experience
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRespondSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Introductory Message for Team Leader *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Introduce yourself, mention your relevant skills, past hackathon projects, and availability..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none placeholder:text-gray-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequestToRespond(null)}
                    className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-glow px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold"
                  >
                    Send Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
