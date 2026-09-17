import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getTeamRequests, 
  getResponses, 
  updateResponseStatus, 
  updateTeamRequestStatus 
} from '../services/storageService';
import { SkillTag } from '../components/SkillTag';
import { 
  Inbox, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare, 
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const MyRequests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-requests'); // 'my-requests' | 'sent-responses'

  const [myRequests, setMyRequests] = useState([]);
  const [sentResponses, setSentResponses] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user) return;

    // Requests created by logged-in user
    const reqs = getTeamRequests();
    const createdByMe = reqs.filter((r) => {
      const posterId = typeof r.postedBy === 'object' ? r.postedBy?.id : r.postedBy;
      return posterId === user.id;
    });
    setMyRequests(createdByMe);

    // Responses
    const responses = getResponses();
    setAllResponses(responses);

    // Sent responses
    const sentByMe = responses.filter((res) => {
      const respId = typeof res.respondent === 'object' ? res.respondent?.id : res.respondentId;
      return respId === user.id;
    });
    setSentResponses(sentByMe);
  };

  const handleStatusChange = (responseId, newStatus) => {
    updateResponseStatus(responseId, newStatus);
    loadData();
  };

  const handleToggleRequestStatus = (requestId, currentStatus) => {
    const nextStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    updateTeamRequestStatus(requestId, nextStatus);
    loadData();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Inbox className="w-8 h-8 text-indigo-400" />
          Requests & Application Management
        </h1>
        <p className="text-sm text-gray-400">
          Track responses to your team requests and manage applications you sent to others
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'my-requests'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Requests I Created ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('sent-responses')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'sent-responses'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          Applications I Sent ({sentResponses.length})
        </button>
      </div>

      {/* Tab 1: Requests I Created */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          {myRequests.length > 0 ? (
            myRequests.map((req) => {
              const responsesForThisReq = allResponses.filter(
                (res) => res.teamRequestId === req.id || res.teamRequest?.id === req.id
              );
              const isExpanded = expandedRequestId === req.id;

              return (
                <div key={req.id} className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                          {req.hackathon?.title || 'Hackathon'}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            req.status === 'Open'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{req.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleRequestStatus(req.id, req.status)}
                        className="px-3 py-1.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Mark as {req.status === 'Open' ? 'Closed' : 'Open'}
                      </button>

                      <button
                        onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {responsesForThisReq.length} Applicant(s)
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Skills Needed */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-gray-500 font-semibold">Skills Needed:</span>
                    {req.skillsNeeded?.map((s) => (
                      <SkillTag key={s} name={s} size="sm" />
                    ))}
                  </div>

                  {/* Applicants Accordion */}
                  {(isExpanded || responsesForThisReq.length > 0) && (
                    <div className="pt-4 border-t border-gray-800/80 space-y-3">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Applicant Responses ({responsesForThisReq.length})
                      </h4>

                      {responsesForThisReq.length > 0 ? (
                        <div className="space-y-3">
                          {responsesForThisReq.map((res) => {
                            const respondentObj = typeof res.respondent === 'object' ? res.respondent : {};
                            return (
                              <div
                                key={res.id}
                                className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="flex items-start gap-3">
                                  <img
                                    src={respondentObj.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                                    alt={respondentObj.name}
                                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/30 shrink-0"
                                  />
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-white">{respondentObj.name || 'Developer'}</p>
                                      <span className="text-[10px] text-gray-400">
                                        ({respondentObj.experienceLevel} Dev)
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">{res.message}</p>

                                    {respondentObj.skills && (
                                      <div className="flex flex-wrap gap-1 pt-1">
                                        {respondentObj.skills.slice(0, 4).map((sk) => (
                                          <SkillTag key={sk} name={sk} size="sm" />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(res.status)}`}>
                                    {res.status}
                                  </span>

                                  {res.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(res.id, 'Accepted')}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(res.id, 'Rejected')}
                                        className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
                                      >
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No responses received yet for this team request.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-3">
              <Inbox className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Team Requests Created Yet</h3>
              <p className="text-xs text-gray-400">Post a request when you need skills for an upcoming hackathon.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Applications */}
      {activeTab === 'sent-responses' && (
        <div className="space-y-4">
          {sentResponses.length > 0 ? (
            sentResponses.map((res) => {
              const reqObj = typeof res.teamRequest === 'object' ? res.teamRequest : {};
              return (
                <div key={res.id} className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-800 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400">
                        Request: {reqObj.title || 'Hackathon Team Request'}
                      </span>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Sent on {new Date(res.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(res.status)}`}>
                      Status: {res.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    <span className="font-semibold text-gray-400">Your message:</span> "{res.message}"
                  </p>
                </div>
              );
            })
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-gray-800 text-center space-y-3">
              <Send className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Sent Applications</h3>
              <p className="text-xs text-gray-400">Browse hackathons and team requests to apply!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
