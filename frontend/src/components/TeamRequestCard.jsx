import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { SkillChip } from './SkillChip';
import { VerificationBadge } from './VerificationBadge';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { useTheme } from '../context/ThemeContext';
import { SpatialButton, SpatialCard, SpatialAnimatedIcon } from './spatial';

export const TeamRequestCard = ({ request, onRespond = null }) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

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
    <SpatialCard
      hover
      elevation="raised"
      className="p-6 flex flex-col justify-between group card-choreography"
    >
      <div>
        {/* Top bar: Hackathon Tag & Status */}
        <div className="flex items-center justify-between gap-2 mb-3 card-meta">
          <Link
            to={`/hackathons/${hackathonObj._id || hackathonObj.id}`}
            className={`text-xs font-semibold hover:underline flex items-center gap-1.5 min-w-0 overflow-visible ${
              isLight ? 'text-indigo-600' : 'text-indigo-400'
            }`}
          >
            <SpatialAnimatedIcon icon={Trophy} animation="lift" trigger="parent-hover" choreography="primary" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{hackathonObj.title || 'Hackathon Listing'}</span>
          </Link>

          <StatusBadge status={status} size="sm" />
        </div>

        {/* Title */}
        <h3 className={`card-title text-base font-bold mb-2 leading-snug group-hover:text-indigo-400 transition-colors ${isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white'}`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`card-desc text-xs line-clamp-3 mb-4 leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          {description}
        </p>

        {/* Skills Needed */}
        <div className="mb-4">
          <p className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            Skills Needed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skillsNeeded.map((skill) => (
              <div key={skill} className="card-chip">
                <SkillChip skill={skill} variant="required" size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: User, Team Size, Respond Action */}
      <div className={`pt-4 border-t flex items-center justify-between gap-3 ${isLight ? 'border-slate-200' : 'border-gray-800/80'}`}>
        {/* User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={userObj.avatarUrl}
            name={userObj.name}
            size="sm"
            verified={userObj.experienceVerificationStatus === 'Verified'}
          />
          <div className="truncate">
            <div className="flex items-center gap-1.5 truncate">
              <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-gray-200'}`}>
                {userObj.name || 'Anonymous'}
              </p>
              <VerificationBadge status={userObj.experienceVerificationStatus} />
            </div>
            <p className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              <SpatialAnimatedIcon icon={Clock} animation="tick" trigger="parent-hover" choreography="primary" className="w-3.5 h-3.5" /> {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Action & Size */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-gray-900/80 border-gray-800 text-gray-400'
          }`}>
            <SpatialAnimatedIcon icon={Users} animation="group" trigger="parent-hover" choreography="primary" className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{teamSizeNeeded}</span> needed
          </div>

          {onRespond && status === 'Open' ? (
            <SpatialButton
              variant="primary"
              size="sm"
              onClick={() => onRespond(request)}
              icon={MessageSquare}
            >
              Respond
            </SpatialButton>
          ) : (
            <Link
              to={`/hackathons/${hackathonObj._id || hackathonObj.id}`}
              className={`text-xs font-semibold flex items-center gap-1 ${
                isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              Details <SpatialAnimatedIcon icon={ArrowRight} animation="pointing" trigger="parent-hover" choreography="action" className="w-3.5 h-3.5 card-action-icon" />
            </Link>
          )}
        </div>
      </div>
    </SpatialCard>
  );
};

export default TeamRequestCard;
