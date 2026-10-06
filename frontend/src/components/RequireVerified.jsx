import React from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { VerificationBadge } from './VerificationBadge';
import { SpatialButton } from './spatial';

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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  // Admins bypass verification requirements
  if (isSuperAdmin || isCollegeAdmin) {
    return <>{children}</>;
  }

  const status = user?.experienceVerificationStatus || 'Unverified';

  // If verified, allow access to restricted feature
  if (status === 'Verified') {
    return <>{children}</>;
  }

  return (
    <div className={`rounded-3xl border p-6 sm:p-8 text-center max-w-2xl mx-auto backdrop-blur-xl transition-all duration-200 ${
      isLight
        ? 'bg-white/95 border-indigo-200 text-slate-900 shadow-xl shadow-slate-200/50'
        : 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-indigo-500/30 text-white shadow-2xl shadow-indigo-950/20'
    }`}>
      {/* Icon Lock Circle */}
      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-5 shadow-inner ${
        isLight
          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
          : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400'
      }`}>
        <Lock className="w-8 h-8 stroke-[1.8]" />
      </div>

      <div className="mb-4">
        <VerificationBadge status={status} size="md" />
      </div>

      <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}>
        {actionName} Locked
      </h3>

      <p className={`text-sm mt-2.5 max-w-lg mx-auto leading-relaxed ${
        isLight ? 'text-slate-600' : 'text-slate-300'
      }`}>
        {description}
      </p>

      {status === 'Pending' ? (
        <div className={`mt-6 p-4 rounded-xl border text-xs text-left flex items-start gap-3 ${
          isLight
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
          <div>
            <p className="font-semibold">Review in Progress</p>
            <p className={`mt-0.5 ${isLight ? 'text-amber-800' : 'text-amber-300/80'}`}>
              Your college administrator has been notified and is currently reviewing your submitted projects and evidence.
            </p>
          </div>
        </div>
      ) : status === 'Rejected' ? (
        <div className={`mt-6 p-4 rounded-xl border text-xs text-left flex items-start gap-3 ${
          isLight
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}>
          <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
          <div>
            <p className="font-semibold">Action Required</p>
            <p className={`mt-0.5 ${isLight ? 'text-rose-800' : 'text-rose-300/80'}`}>
              {user?.experienceVerificationNote
                ? `Note: ${user.experienceVerificationNote}`
                : 'Your previous verification request was rejected. You can submit updated repository links and project proofs.'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Primary Action Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <SpatialButton
          to="/profile"
          variant="primary"
          size="lg"
          icon={ShieldCheck}
        >
          {status === 'Rejected' ? 'Request Verification Again' : status === 'Pending' ? 'View My Verification' : 'Verify My Experience'}
        </SpatialButton>
      </div>
    </div>
  );
};

export default RequireVerified;
