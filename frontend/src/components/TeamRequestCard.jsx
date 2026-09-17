import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { SkillTag } from './SkillTag';

export const TeamRequestCard = ({ request, onRespond = null }) => {
  const {
    id,
    title,
    description,
    skillsNeeded = [],
    teamSizeNeeded = 1,
    status = 'Open',
    createdAt,
    postedBy,
    hackathon
  } = request;

  const userObj = typeof postedBy === 'object' ? postedBy : {};
  const hackathonObj = typeof hackathon === 'object' ? hackathon : {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between border border-gray-800/80 relative">
      <div>
        {/* Top bar: Hackathon Tag & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Link
            to={`/hackathons/${hackathonObj.id}`}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1.5 truncate"
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{hackathonObj.title || 'Hackathon Listing'}</span>
          </Link>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              status === 'Open'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Skills Needed */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
            Skills Needed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skillsNeeded.map((skill) => (
              <SkillTag key={skill} name={skill} size="sm" isHighlight />
            ))}
          </div>
        </div>
      </div>

      {/* Footer: User, Team Size, Respond Action */}
      <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
        {/* User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={userObj.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt={userObj.name || 'User'}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/30 shrink-0"
          />
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-200 truncate">{userObj.name || 'Anonymous'}</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Action & Size */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-1 bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-800">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white">{teamSizeNeeded}</span> needed
          </div>

          {onRespond && status === 'Open' ? (
            <button
              onClick={() => onRespond(request)}
              className="btn-glow px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Respond
            </button>
          ) : (
            <Link
              to={`/hackathons/${hackathonObj.id}`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
