import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ExternalLink, ArrowRight, Clock, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { SkillChip } from './SkillChip';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { SpatialCard, SpatialAnimatedIcon } from './spatial';

export const HackathonCard = ({ hackathon }) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const {
    id,
    title,
    organizer,
    mode,
    location,
    startDate,
    endDate,
    registrationDeadline,
    registrationLink,
    tags,
    description,
    source,
    isExternal,
    lastSyncedAt,
    status,
  } = hackathon;

  const hackathonId = hackathon._id || hackathon.id;

  // Format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getModeBadge = (m) => {
    switch (m) {
      case 'Online':
        return isLight
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Offline':
        return isLight
          ? 'bg-purple-50 text-purple-800 border-purple-300'
          : 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return isLight
          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  // Source Badge mapping
  const getSourceBadge = () => {
    if (isExternal) {
      const s = (source || '').toLowerCase();
      if (s === 'curated') {
        return {
          label: 'Curated Feed',
          color: isLight
            ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        };
      }
      if (s === 'unstop') {
        return {
          label: 'Unstop',
          color: isLight
            ? 'bg-blue-50 text-blue-800 border-blue-300'
            : 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        };
      }
      if (s === 'devpost') {
        return {
          label: 'Devpost',
          color: isLight
            ? 'bg-teal-50 text-teal-800 border-teal-300'
            : 'bg-teal-500/10 text-teal-300 border-teal-500/30',
        };
      }
      if (s === 'mlh') {
        return {
          label: 'MLH',
          color: isLight
            ? 'bg-rose-50 text-rose-800 border-rose-300'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        };
      }
      return {
        label: `Source: ${source}`,
        color: isLight
          ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      };
    }
    if (hackathon.collegeId) {
      return {
        label: 'Campus Event',
        color: isLight
          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      };
    }
    return {
      label: 'HackMatch Official',
      color: isLight
        ? 'bg-amber-50 text-amber-900 border-amber-300'
        : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    };
  };

  const sourceBadge = getSourceBadge();

  // Freshness calculation
  const getFreshness = () => {
    if (!lastSyncedAt) return null;
    const diffHours = Math.floor((Date.now() - new Date(lastSyncedAt).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Synced just now';
    if (diffHours < 24) return `Synced ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Synced ${diffDays}d ago`;
  };

  const freshness = getFreshness();

  // Deadline calculation
  const now = new Date();
  const deadlineDate = registrationDeadline ? new Date(registrationDeadline) : null;
  const isExpired = deadlineDate ? deadlineDate < now : status === 'Inactive';
  const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <SpatialCard
      accentLine
      hover
      elevation="raised"
      className="p-6 flex flex-col justify-between group card-choreography"
    >
      <div>
        {/* Header: Mode, Source & Organizer */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap card-meta">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={mode} type="mode" size="sm" />
            <StatusBadge
              status={isExternal ? (source || 'devpost') : (hackathon.collegeId ? 'campus' : 'curated')}
              label={sourceBadge.label}
              type="source"
              size="sm"
            />
          </div>

          <span className="text-xs text-gray-400 flex items-center gap-1 max-w-[150px] min-w-0 overflow-visible">
            <SpatialAnimatedIcon
              icon={Trophy}
              animation="lift"
              trigger="parent-hover"
              choreography="primary"
              className="w-3.5 h-3.5 text-indigo-400 shrink-0"
            />
            <span className="truncate">{organizer}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/hackathons/${hackathonId}`}>
          <h3 className="card-title text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>
        </Link>

        {/* Description preview */}
        <p className="card-desc text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Info Grid */}
        <div className="space-y-2 mb-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <SpatialAnimatedIcon
              icon={Calendar}
              animation="calendar-tick"
              trigger="parent-hover"
              choreography="primary"
              className="w-4 h-4 text-indigo-400 shrink-0"
            />
            <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2">
              <SpatialAnimatedIcon
                icon={MapPin}
                animation="bounce"
                trigger="parent-hover"
                choreography="primary"
                className="w-4 h-4 text-cyan-400 shrink-0"
              />
              <span className="truncate">{location}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SpatialAnimatedIcon
                icon={Clock}
                animation="tick"
                trigger="parent-hover"
                choreography="primary"
                className="w-4 h-4 text-amber-400/90 shrink-0"
              />
              {isExpired ? (
                <span className="text-red-400 font-semibold">Registration Closed</span>
              ) : daysLeft !== null && daysLeft <= 3 ? (
                <span className="text-amber-300 font-bold">
                  Registration closes: {daysLeft <= 0 ? 'Today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                </span>
              ) : (
                <span className="text-gray-300">
                  Apply by: {formatDate(registrationDeadline)}
                </span>
              )}
            </div>

            {freshness && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <SpatialAnimatedIcon
                  icon={RefreshCw}
                  animation="spin-once"
                  trigger="parent-hover"
                  className="w-2.5 h-2.5 text-gray-400"
                />
                {freshness}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {tags.map((tag) => (
              <div key={tag} className="card-chip">
                <SkillChip skill={tag} variant="default" size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Card Actions */}
      <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
        {registrationLink ? (
          <a
            href={registrationLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors"
          >
            Official Registration <SpatialAnimatedIcon icon={ExternalLink} animation="outward" trigger="parent-hover" choreography="action" className="w-3 h-3" />
          </a>
        ) : (
          <div></div>
        )}

        <Link
          to={`/hackathons/${hackathonId}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View Team Requests <SpatialAnimatedIcon icon={ArrowRight} animation="pointing" trigger="parent-hover" choreography="action" className="w-3.5 h-3.5 card-action-icon" />
        </Link>
      </div>
    </SpatialCard>
  );
};
