import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ExternalLink, ArrowRight, Clock } from 'lucide-react';
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
    description
  } = hackathon;

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

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between border border-gray-800/80 relative overflow-hidden group">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

      <div>
        {/* Header: Mode & Organizer */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getModeBadge(mode)}`}>
            {mode}
          </span>
          <span className="text-xs text-gray-400 truncate flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            {organizer}
          </span>
        </div>

        {/* Title */}
        <Link to={`/hackathons/${id}`}>
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
          <div className="flex items-center gap-2 text-amber-400/90 font-medium">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Apply by: {formatDate(registrationDeadline)}</span>
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
            className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Official Link <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <div></div>
        )}

        <Link
          to={`/hackathons/${id}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          View Team Requests <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
