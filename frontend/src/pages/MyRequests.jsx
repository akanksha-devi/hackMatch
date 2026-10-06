import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/apiService';
import { SkillChip } from '../components/SkillChip';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { SpatialButton, SpatialTabs, SpatialCard, SpatialPanel } from '../components/spatial';
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
  ChevronUp,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const MyRequests = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState('my-requests'); // 'my-requests' | 'sent-responses'

  const [myRequests, setMyRequests] = useState([]);
  const [sentResponses, setSentResponses] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiService.getMyResponses();
      if (res.success) {
        setMyRequests(res.myRequests || []);
        setSentResponses(res.sentApplications || []);
        setReceivedApplications(res.receivedApplications || []);
      }
    } catch (err) {
      console.error('Error fetching responses data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (responseId, newStatus) => {
    try {
      await apiService.updateResponseStatus(responseId, newStatus);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleToggleRequestStatus = async (requestId, currentStatus) => {
    const nextStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
      await apiService.updateTeamRequest(requestId, { status: nextStatus });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating request');
    }
  };

  return (
    <div className="relative space-y-8 pb-16">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[560px] max-w-full h-[340px] bg-gradient-to-tr from-purple-500/12 via-indigo-500/10 to-transparent blur-3xl rounded-full" 
        />
      </div>

      {/* Header */}
      <div className={`relative space-y-2 border-b ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} pb-6`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-1">
          <Inbox className="w-3.5 h-3.5" />
          <span>ROSTER ORCHESTRATION</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-3`}>
          <Inbox className="w-8 h-8 text-indigo-500 shrink-0" />
          Requests & Applications
        </h1>
        <p className={`text-sm max-w-2xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Orchestrate applicants to your posted team squads and track status updates on applications you submitted across the network.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className={`relative border-b ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} pb-4`}>
        <SpatialTabs
          tabs={[
            { id: 'my-requests', label: 'Requests I Created', icon: Inbox, badge: myRequests.length },
            { id: 'sent-responses', label: 'Applications I Sent', icon: Send, badge: sentResponses.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab 1: Requests I Created */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Loading requests & applications...</p>
        </div>
      ) : activeTab === 'my-requests' ? (
        <div className="space-y-6">
          {myRequests.length > 0 ? (
            myRequests.map((req) => {
              const reqId = req._id || req.id;
              const responsesForThisReq = receivedApplications.filter(
                (res) => {
                  const tReqId = res.teamRequest?._id || res.teamRequest?.id || res.teamRequest;
                  return tReqId?.toString() === reqId?.toString();
                }
              );
              const isExpanded = expandedRequestId === reqId;

              return (
                <SpatialCard key={reqId} hover={false} elevation="raised" className="p-6 space-y-5">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} pb-4`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge
                          status="hackathon"
                          accent="indigo"
                          icon={Trophy}
                          label={req.hackathon?.title || 'Hackathon Target'}
                          size="sm"
                        />
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{req.title}</h3>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <SpatialButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleRequestStatus(reqId, req.status)}
                      >
                        Mark as {req.status === 'Open' ? 'Closed' : 'Open'}
                      </SpatialButton>

                      <SpatialButton
                        variant={isExpanded ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setExpandedRequestId(isExpanded ? null : reqId)}
                        icon={MessageSquare}
                      >
                        {responsesForThisReq.length} Applicant(s)
                      </SpatialButton>
                    </div>
                  </div>

                  {/* Skills Needed */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={`${isLight ? 'text-slate-500' : 'text-gray-400'} font-semibold`}>Skills Needed:</span>
                    {req.skillsNeeded?.map((s) => (
                      <SkillChip key={s} skill={s} variant="required" size="sm" />
                    ))}
                  </div>

                  {/* Applicants Accordion */}
                  {(isExpanded || responsesForThisReq.length > 0) && (
                    <div className={`pt-4 border-t ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'} uppercase tracking-wider`}>
                          Applicant Responses ({responsesForThisReq.length})
                        </h4>
                      </div>

                      {responsesForThisReq.length > 0 ? (
                        <div className="space-y-3">
                          {responsesForThisReq.map((res) => {
                            const resId = res._id || res.id;
                            const respondentObj = typeof res.respondent === 'object' ? res.respondent : {};
                            return (
                              <div
                                key={resId}
                                className={`p-4 sm:p-5 rounded-2xl ${
                                  isLight 
                                    ? 'bg-slate-50/90 border-slate-200/80 shadow-xs' 
                                    : 'bg-gray-900/60 border-white/5 backdrop-blur-md'
                                } border flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <Avatar
                                    src={respondentObj.avatarUrl}
                                    name={respondentObj.name}
                                    size="md"
                                  />
                                  <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{respondentObj.name || 'Developer'}</p>
                                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                        ({respondentObj.experienceLevel || 'Intermediate'} Dev)
                                      </span>
                                      <VerificationBadge status={respondentObj.experienceVerificationStatus} />
                                      {res.matchMetrics && res.matchMetrics.matchScore > 0 && (
                                        <MatchScoreBadge
                                          score={res.matchMetrics.matchScore}
                                          matchCount={res.matchMetrics.matchedSkills?.length || 0}
                                        />
                                      )}
                                    </div>
                                    <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'} leading-relaxed`}>{res.message}</p>

                                    {respondentObj.skills && (
                                      <div className="flex flex-wrap gap-1 pt-0.5">
                                        {respondentObj.skills.slice(0, 5).map((sk) => (
                                          <SkillChip key={sk} skill={sk} variant="default" size="sm" />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <StatusBadge status={res.status} size="sm" />

                                  {res.status === 'Pending' && (
                                    <>
                                      <SpatialButton
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleStatusChange(resId, 'Accepted')}
                                        icon={CheckCircle2}
                                      >
                                        Accept
                                      </SpatialButton>
                                      <SpatialButton
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleStatusChange(resId, 'Rejected')}
                                        icon={XCircle}
                                      >
                                        Reject
                                      </SpatialButton>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'} italic`}>No responses received yet for this team request.</p>
                      )}
                    </div>
                  )}
                </SpatialCard>
              );
            })
          ) : (
            <SpatialPanel elevation="flat" className="p-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-indigo-400/60 mx-auto" />
              <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>No Team Requests Created Yet</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Post a request when you need specific skills for an upcoming hackathon roster.</p>
            </SpatialPanel>
          )}
        </div>
      ) : (
        /* Tab 2: Sent Applications */
        <div className="space-y-4">
          {sentResponses.length > 0 ? (
            sentResponses.map((res) => {
              const resId = res._id || res.id;
              const reqObj = typeof res.teamRequest === 'object' ? res.teamRequest : {};
              return (
                <SpatialCard key={resId} hover elevation="raised" className="p-6 space-y-3.5">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${isLight ? 'border-slate-200/80' : 'border-gray-800/80'} pb-3`}>
                    <div className="space-y-1">
                      <span className={`text-sm font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                        Target Request: {reqObj.title || 'Hackathon Team Request'}
                      </span>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'} flex items-center gap-1.5`}>
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Sent on {new Date(res.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <StatusBadge status={res.status} size="sm" />
                  </div>

                  <div className={`text-xs ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-gray-900/60 border-white/5 text-gray-300'} leading-relaxed p-3.5 rounded-xl border`}>
                    <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Your pitch message:</span> "{res.message}"
                  </div>
                </SpatialCard>
              );
            })
          ) : (
            <SpatialPanel elevation="flat" className="p-12 text-center space-y-3">
              <Send className="w-12 h-12 text-indigo-400/60 mx-auto" />
              <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>No Sent Applications</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Browse hackathons and team requests across the platform to apply!</p>
            </SpatialPanel>
          )}
        </div>
      )}
    </div>
  );
};
