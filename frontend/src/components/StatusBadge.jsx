import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  CheckCircle2, 
  Wifi, 
  MapPin, 
  Globe, 
  Building2, 
  Sparkles,
  Shield,
  School,
  GraduationCap,
  Trophy,
  User
} from 'lucide-react';
import { RADIUS, ACCENTS } from '../design-system/tokens';

/**
 * StatusBadge - Canonical badge for verification, request status, hackathon modes, roles, and system states.
 */
export const StatusBadge = React.forwardRef(({
  status = '',
  type = 'status', // 'status' | 'verification' | 'experience' | 'mode' | 'source' | 'role' | 'score' | 'custom'
  size = 'sm',     // 'sm' | 'md'
  label = null,
  icon: CustomIcon = null,
  showIcon = true,
  accent = null,   // 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'purple' | 'slate'
  className = '',
  title = null,
  ...props
}, ref) => {
  const normStatus = (status || '').toString().trim();
  const lowerStatus = normStatus.toLowerCase();

  // Resolve config based on semantic status
  let resolvedAccent = accent || 'slate';
  let Icon = CustomIcon;
  let displayLabel = label || normStatus;

  switch (lowerStatus) {
    // Verification states
    case 'verified':
      resolvedAccent = 'emerald';
      Icon = Icon || ShieldCheck;
      displayLabel = label || 'Verified';
      break;
    case 'pending':
      resolvedAccent = 'amber';
      Icon = Icon || Clock;
      displayLabel = label || 'Pending';
      break;
    case 'rejected':
      resolvedAccent = 'rose';
      Icon = Icon || XCircle;
      displayLabel = label || 'Rejected';
      break;
    case 'unverified':
      resolvedAccent = 'slate';
      Icon = Icon || AlertTriangle;
      displayLabel = label || 'Unverified';
      break;

    // Request & Hackathon status
    case 'open':
    case 'active':
    case 'accepted':
    case 'live':
      resolvedAccent = 'emerald';
      Icon = Icon || CheckCircle2;
      displayLabel = label || (lowerStatus === 'live' ? 'LIVE' : normStatus);
      break;
    case 'closed':
    case 'inactive':
    case 'expired':
    case 'error':
      resolvedAccent = 'rose';
      Icon = Icon || XCircle;
      displayLabel = label || (lowerStatus === 'error' ? 'ERROR' : normStatus);
      break;
    case 'unavailable':
    case 'warning':
      resolvedAccent = 'amber';
      Icon = Icon || AlertTriangle;
      displayLabel = label || (lowerStatus === 'unavailable' ? 'UNAVAILABLE' : normStatus);
      break;
    case 'draft':
      resolvedAccent = 'slate';
      Icon = Icon || Clock;
      displayLabel = label || 'Draft';
      break;
    case 'new':
      resolvedAccent = 'indigo';
      Icon = Icon || Sparkles;
      displayLabel = label || 'New';
      break;

    // Experience levels
    case 'advanced':
      resolvedAccent = 'purple';
      Icon = Icon || Trophy;
      displayLabel = label || 'Advanced';
      break;
    case 'intermediate':
      resolvedAccent = 'indigo';
      Icon = Icon || Zap;
      displayLabel = label || 'Intermediate';
      break;
    case 'beginner':
      resolvedAccent = 'emerald';
      Icon = Icon || Sparkles;
      displayLabel = label || 'Beginner';
      break;

    // Mode
    case 'online':
    case 'virtual':
      resolvedAccent = 'cyan';
      Icon = Icon || Wifi;
      displayLabel = label || normStatus;
      break;
    case 'in-person':
    case 'in person':
    case 'offline':
      resolvedAccent = 'indigo';
      Icon = Icon || MapPin;
      displayLabel = label || normStatus;
      break;
    case 'hybrid':
      resolvedAccent = 'purple';
      Icon = Icon || Globe;
      displayLabel = label || normStatus;
      break;

    // Sources
    case 'curated':
      resolvedAccent = 'emerald';
      Icon = Icon || Sparkles;
      displayLabel = label || 'Curated';
      break;
    case 'devpost':
      resolvedAccent = 'cyan';
      Icon = Icon || Globe;
      displayLabel = label || 'Devpost';
      break;
    case 'unstop':
      resolvedAccent = 'cyan';
      Icon = Icon || Globe;
      displayLabel = label || 'Unstop';
      break;
    case 'mlh':
      resolvedAccent = 'rose';
      Icon = Icon || Globe;
      displayLabel = label || 'MLH';
      break;
    case 'internal':
    case 'campus':
      resolvedAccent = 'indigo';
      Icon = Icon || Building2;
      displayLabel = label || (lowerStatus === 'internal' ? 'Campus' : normStatus);
      break;

    // Roles & Authorities
    case 'superadmin':
    case 'super admin':
      resolvedAccent = 'purple';
      Icon = Icon || ShieldCheck;
      displayLabel = label || 'Super Admin';
      break;
    case 'collegeadmin':
    case 'college admin':
      resolvedAccent = 'indigo';
      Icon = Icon || Shield;
      displayLabel = label || 'College Admin';
      break;
    case 'student':
      resolvedAccent = 'indigo';
      Icon = Icon || GraduationCap;
      displayLabel = label || 'Student';
      break;
    case 'platform-wide authority':
    case 'platform authority':
      resolvedAccent = 'purple';
      Icon = Icon || ShieldCheck;
      displayLabel = label || 'Platform-Wide Authority';
      break;
    case 'campus-scoped console':
    case 'campus console':
      resolvedAccent = 'indigo';
      Icon = Icon || Shield;
      displayLabel = label || 'Campus-Scoped Console';
      break;

    // Cron / Automation
    case 'cron':
    case 'vercel cron':
      resolvedAccent = 'indigo';
      Icon = Icon || Clock;
      displayLabel = label || 'Vercel Cron';
      break;

    default:
      if (!accent) resolvedAccent = 'slate';
      break;
  }

  // If accent prop was explicitly passed, override resolvedAccent
  if (accent) {
    resolvedAccent = accent;
  }

  const accentConfig = ACCENTS[resolvedAccent] || ACCENTS.slate;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 min-h-[20px] font-semibold gap-1',
    md: 'text-xs px-2.5 py-0.5 min-h-[24px] font-semibold gap-1.5',
  }[size] || 'text-[10px] px-2 py-0.5 min-h-[20px] font-semibold gap-1';

  const iconSizeClass = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const renderIcon = showIcon && Icon;

  return (
    <span
      ref={ref}
      title={title || displayLabel}
      className={`inline-flex items-center shrink-0 ${RADIUS.pill} border ${accentConfig.bg} ${accentConfig.text} ${accentConfig.border} ${sizeClasses} select-none backdrop-blur-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
      {...props}
    >

      {renderIcon && <Icon className={`${iconSizeClass} shrink-0`} aria-hidden="true" />}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
