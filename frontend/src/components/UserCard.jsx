import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Code2, Share2, Globe, ExternalLink, Mail } from 'lucide-react';
import { SkillChip } from './SkillChip';
import { MatchScoreBadge } from './MatchScoreBadge';
import { VerificationBadge } from './VerificationBadge';
import { ExperienceBadge } from './ExperienceBadge';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { SpatialButton, SpatialCard, SpatialAnimatedIcon } from './spatial';

export const UserCard = ({ user, matchScore = 0, overlappingSkills = [], onInvite = null }) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const {
    id,
    name,
    bio,
    skills = [],
    experienceLevel = 'Intermediate',
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    avatarUrl
  } = user;

  const userId = user._id || user.id;
  const userCollege = user.collegeId?.name || user.college?.name || user.collegeName;

  return (
    <SpatialCard
      hover
      elevation="raised"
      className="p-6 flex flex-col justify-between group card-choreography"
    >
      <div>
        {/* Header: Avatar, Name, Exp Level & Match Score */}
        <div className="flex items-start justify-between gap-3 mb-4 card-meta">
          <div className="flex items-center gap-3">
            <div className="card-avatar-bezel">
              <Avatar
                src={avatarUrl}
                name={name}
                size="lg"
                verified={user.experienceVerificationStatus === 'Verified'}
              />
            </div>
            <div>
              <Link to={`/profile/${userId}`}>
                <h4 className={`card-title font-bold ${isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'} transition-colors text-base`}>
                  {name}
                </h4>
              </Link>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <ExperienceBadge level={experienceLevel} size="sm" />
                <VerificationBadge status={user.experienceVerificationStatus} />
                {userCollege && (
                  <StatusBadge
                    status="campus"
                    label={userCollege}
                    size="sm"
                    className="max-w-[120px]"
                  />
                )}
              </div>
            </div>
          </div>

          {matchScore > 0 && (
            <MatchScoreBadge score={matchScore} matchCount={overlappingSkills.length} />
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className={`card-desc text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'} line-clamp-2 mb-4 leading-relaxed`}>
            {bio}
          </p>
        )}

        {/* Skills */}
        <div className="mb-4">
          <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'} font-semibold mb-2`}>Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => {
              const isMatch = overlappingSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <div key={skill} className="card-chip">
                  <SkillChip
                    skill={skill}
                    size="sm"
                    variant={isMatch ? 'matched' : 'default'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Social Links & Action */}
      <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-gray-800/80'} flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'} transition-colors`}
              title="GitHub Profile"
            >
              <SpatialAnimatedIcon icon={Code2} animation="bracket" trigger="parent-hover" choreography="primary" className="w-4 h-4" />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className={`${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'} transition-colors`}
              title="LinkedIn Profile"
            >
              <SpatialAnimatedIcon icon={Share2} animation="bloom" trigger="parent-hover" choreography="primary" className="w-4 h-4" />
            </a>
          )}
          {portfolioUrl && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className={`${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'} transition-colors`}
              title="Portfolio Website"
            >
              <SpatialAnimatedIcon icon={Globe} animation="orbit" trigger="parent-hover" choreography="primary" className="w-4 h-4" />
            </a>
          )}
        </div>

        {onInvite ? (
          <SpatialButton
            variant="secondary"
            size="sm"
            onClick={() => onInvite(user)}
            icon={Mail}
          >
            Invite Teammate
          </SpatialButton>
        ) : (
          <Link
            to={`/profile/${userId}`}
            className={`text-xs font-semibold ${isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-400 hover:text-white'} flex items-center gap-1 transition-colors`}
          >
            View Profile <SpatialAnimatedIcon icon={ExternalLink} animation="outward" trigger="parent-hover" choreography="action" className="w-3.5 h-3.5 card-action-icon" />
          </Link>
        )}
      </div>
    </SpatialCard>
  );
};
