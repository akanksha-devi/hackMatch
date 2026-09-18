import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ExternalLink, ArrowRight, Clock, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { SkillTag } from './SkillTag';

export const HackathonCard = ({ hackathon }) => {
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Offline':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  // Source Badge mapping
  const getSourceBadge = () => {
    if (isExternal) {
      const s = (source || '').toLowerCase();
      if (s === 'curated') {
        return { label: 'Curated Feed', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      }
      if (s === 'unstop') {
        return { label: 'Unstop', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
      }
      if (s === 'devpost') {
        return { label: 'Devpost', color: 'bg-teal-500/10 text-teal-300 border-teal-500/30' };
      }
      if (s === 'mlh') {
        return { label: 'MLH', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      }
      return { label: `Source: ${source}`, color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    }
    if (hackathon.collegeId) {
      return { label: 'Campus Event', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
    }
    return { label: 'HackMatch Official', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
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
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between border border-gray-800/80 relative overflow-hidden group">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

      <div>
        {/* Header: Mode, Source & Organizer */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getModeBadge(mode)}`}>
              {mode}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${sourceBadge.color}`}>
              {isExternal ? <Globe className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
              {sourceBadge.label}
            </span>
          </div>

          <span className="text-xs text-gray-400 truncate flex items-center gap-1 max-w-[150px]">
            <Trophy className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{organizer}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/hackathons/${hackathonId}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>
        </Link>

        {/* Description preview */}
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Info Grid */}
        <div className="space-y-2 mb-4 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400/90 shrink-0" />
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
                <RefreshCw className="w-2.5 h-2.5 text-gray-400" />
                {freshness}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {tags.map((tag) => (
              <SkillTag key={tag} name={tag} size="sm" />
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
            Official Registration <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <div></div>
        )}

        <Link
          to={`/hackathons/${hackathonId}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          View Team Requests <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
