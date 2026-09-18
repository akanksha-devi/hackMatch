import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import { VerificationBadge } from '../../components/VerificationBadge';
import {
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Code2,
  Globe,
  School,
  User,
  Filter,
  Search,
  AlertCircle,
  Loader2,
  FileCheck,
  MessageSquare,
} from 'lucide-react';

export const AdminVerification = () => {
  const { isSuperAdmin, collegeName } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Review Modal State
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadVerifications();
  }, [statusFilter]);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await apiService.getAdminExperienceVerifications(params);
      if (res.success && res.verifications) {
        setVerifications(res.verifications);
      }
    } catch (err) {
      console.error('Error fetching verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (verif) => {
    setSelectedVerification(verif);
    setReviewNote(verif.reviewNote || '');
    setActionError('');
    setActionSuccess('');
  };

  const handleReviewAction = async (decisionStatus) => {
    if (!selectedVerification) return;
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await apiService.reviewExperienceVerification(selectedVerification._id, {
        status: decisionStatus,
        reviewNote: reviewNote.trim(),
      });

      setActionSuccess(res.message || `Verification ${decisionStatus.toLowerCase()} successfully!`);
      window.dispatchEvent(new CustomEvent('notification-refresh'));
      setTimeout(() => {
        setSelectedVerification(null);
        setReviewNote('');
        setActionSuccess('');
      }, 1200);

      await loadVerifications();
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to submit review`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    const studentName = v.user?.name?.toLowerCase() || '';
    const studentEmail = v.user?.email?.toLowerCase() || '';
    const campus = v.collegeId?.name?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return studentName.includes(term) || studentEmail.includes(term) || campus.includes(term);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BadgeCheck className="w-8 h-8 text-emerald-400" />
            Experience & Skill Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isSuperAdmin
              ? 'Platform-wide review console: verify self-declared student skills with project proof and GitHub evidence.'
              : `Campus verification console for ${collegeName || 'your institution'}. Approve or reject student applications.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Verified', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'glass-panel text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by student name, email, or campus institution..."
          className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-gray-600"
        />
      </div>

      {/* Verifications List */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Loading experience verification requests...</p>
          </div>
        ) : filteredVerifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/40 text-gray-400">
                  <th className="py-3.5 px-6 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold">Campus</th>
                  <th className="py-3.5 px-4 font-semibold">Requested Level</th>
                  <th className="py-3.5 px-4 font-semibold">Evidence Links</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredVerifications.map((verif) => {
                  const isPending = verif.status === 'Pending';
                  const isVerified = verif.status === 'Verified';
                  const isRejected = verif.status === 'Rejected';

                  return (
                    <tr key={verif._id} className="hover:bg-gray-900/40 transition-colors">
                      {/* Student Info */}
                      <td className="py-4 px-6 font-medium text-white flex items-center gap-3">
                        <img
                          src={
                            verif.user?.avatarUrl ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={verif.user?.name || 'Student'}
                          className="w-8 h-8 rounded-full object-cover border border-gray-700"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                            {verif.user?.name || 'Unknown Student'}
                            <VerificationBadge status={verif.user?.experienceVerificationStatus} size="sm" />
                          </div>
                          <div className="text-[11px] text-gray-400">{verif.user?.email}</div>
                        </div>
                      </td>

                      {/* Campus */}
                      <td className="py-4 px-4 text-gray-300">
                        <div className="flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-semibold">{verif.collegeId?.code || 'Campus'}</span>
                        </div>
                      </td>

                      {/* Requested Level */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 font-bold">
                          {verif.requestedLevel}
                        </span>
                      </td>

                      {/* Evidence Links */}
                      <td className="py-4 px-4 space-x-2">
                        {verif.githubUrl && (
                          <a
                            href={verif.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                            title="GitHub"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {verif.portfolioUrl && (
                          <a
                            href={verif.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Portfolio"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {verif.projectLinks?.length > 0 && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            +{verif.projectLinks.length} links
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 w-fit ${
                            isVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isRejected
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isVerified && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {verif.status}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(verif.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenReview(verif)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all"
                        >
                          {isPending ? 'Review Proof' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500 space-y-2">
            <BadgeCheck className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-400">No verification requests found</p>
            <p className="text-xs text-gray-500">
              There are no submissions currently under "{statusFilter}".
            </p>
          </div>
        )}
      </div>

      {/* REVIEW / AUDIT MODAL */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedVerification.user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                  }
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedVerification.user?.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedVerification.user?.email} • {selectedVerification.collegeId?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-gray-400 hover:text-white font-bold text-2xl"
              >
                ×
              </button>
            </div>

            {/* Notification alert banners */}
            {actionSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Requested Level Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Requested Verification Level:</span>
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs">
                {selectedVerification.requestedLevel}
              </span>
            </div>

            {/* Evidence Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Submitted Experience Proof</label>
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedVerification.description}
              </div>
            </div>

            {/* External Portfolios & Links */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Verified Project & Profile Links</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedVerification.githubUrl && (
                  <a
                    href={selectedVerification.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Code2 className="w-4 h-4 text-purple-400 shrink-0" />
                      GitHub Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  </a>
                )}

                {selectedVerification.portfolioUrl && (
                  <a
                    href={selectedVerification.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      Portfolio / Website
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  </a>
                )}

                {selectedVerification.projectLinks?.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-gray-300 hover:text-white flex items-center justify-between transition-colors col-span-1 sm:col-span-2 truncate"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {link}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Review Note Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Administrative Note / Feedback (Optional on approval, recommended on rejection)
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. Verified 3x hackathon wins and GitHub commit history. Excellent work!"
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none placeholder:text-gray-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800 gap-3">
              <button
                type="button"
                onClick={() => setSelectedVerification(null)}
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReviewAction('Rejected')}
                  className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Request
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReviewAction('Verified')}
                  className="btn-glow px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <BadgeCheck className="w-4 h-4" />
                  )}
                  Approve Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
