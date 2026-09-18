import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, XCircle } from 'lucide-react';

/**
 * VerificationBadge renders one of the 4 verified states:
 * - ✓ Verified (Emerald)
 * - ⏳ Verification Pending (Amber)
 * - ⚠ Unverified (Slate / Yellow icon)
 * - ✕ Verification Rejected (Rose)
 */
export const VerificationBadge = ({ status, size = 'sm' }) => {
  const normalized = status || 'Unverified';

  if (normalized === 'Verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-tight shrink-0 ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
        }`}
        title="Experience verified by college administration"
      >
        <ShieldCheck className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        ✓ Verified
      </span>
    );
  }

  if (normalized === 'Pending') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
        }`}
        title="Verification request is currently pending campus administrator review"
      >
        <Clock className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        ⏳ Verification Pending
      </span>
    );
  }

  if (normalized === 'Rejected') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0 ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
        }`}
        title="Verification request was rejected by campus administration"
      >
        <XCircle className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        ✕ Verification Rejected
      </span>
    );
  }

  // Default: Unverified
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium bg-slate-800/80 text-slate-400 border border-slate-700 shrink-0 ${
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
      }`}
      title="Experience level has not been verified by college administration"
    >
      <AlertTriangle
        className={size === 'lg' ? 'w-3.5 h-3.5 text-yellow-500/80' : 'w-3 h-3 text-yellow-500/80'}
      />
      ⚠ Unverified
    </span>
  );
};

export default VerificationBadge;
