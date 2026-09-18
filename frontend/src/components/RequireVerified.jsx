import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Clock, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * RequireVerified UI Guard
 * Renders children only if user is a Verified student (or an administrator).
 * Otherwise renders an informative locked state card with direct action to verify.
 */
export const RequireVerified = ({
  children,
  actionName = 'Team Formation',
  description = 'Verification builds trust between hackathon participants and ensures teammates have proven technical experience before joining or leading teams.',
}) => {
  const { user, isSuperAdmin, isCollegeAdmin } = useAuth();

  // Admins bypass verification requirements
  if (isSuperAdmin || isCollegeAdmin) {
    return <>{children}</>;
  }

  const status = user?.experienceVerificationStatus || 'Unverified';

  // If verified, allow access to restricted feature
  if (status === 'Verified') {
    return <>{children}</>;
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            ⏳ Verification Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            ✕ Verification Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            ⚠ Unverified
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-indigo-500/30 p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
      {/* Icon Lock Circle */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5 text-indigo-400 shadow-inner">
        <Lock className="w-8 h-8 stroke-[1.8]" />
      </div>

      <div className="mb-4">
        {getStatusBadge()}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        🔒 {actionName} Locked
      </h3>

      <p className="text-sm text-slate-300 mt-2.5 max-w-lg mx-auto leading-relaxed">
        {description}
      </p>

      {status === 'Pending' ? (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-left flex items-start gap-3">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-semibold">Review in Progress</p>
            <p className="text-amber-300/80 mt-0.5">
              Your college administrator has been notified and is currently reviewing your submitted projects and evidence.
            </p>
          </div>
        </div>
      ) : status === 'Rejected' ? (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-left flex items-start gap-3">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Action Required</p>
            <p className="text-rose-300/80 mt-0.5">
              {user?.experienceVerificationNote
                ? `Note: ${user.experienceVerificationNote}`
                : 'Your previous verification request was rejected. You can submit updated repository links and project proofs.'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Primary Action Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/profile"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{status === 'Rejected' ? 'Request Verification Again' : status === 'Pending' ? 'View My Verification' : 'Verify My Experience'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RequireVerified;
