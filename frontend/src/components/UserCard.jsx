import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Share2, Globe, ExternalLink, Mail } from 'lucide-react';
import { SkillTag } from './SkillTag';
import { MatchScoreBadge } from './MatchScoreBadge';

export const UserCard = ({ user, matchScore = 0, overlappingSkills = [], onInvite = null }) => {
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

  const getExpBadge = (level) => {
    switch (level) {
      case 'Advanced':
        return 'badge-purple';
      case 'Intermediate':
        return 'badge-indigo';
      default:
        return 'badge-emerald';
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between border border-gray-800/80 relative group">
      <div>
        {/* Header: Avatar, Name, Exp Level & Match Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500/70 transition-all"
            />
            <div>
              <Link to={`/users/${id}`}>
                <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors text-base">
                  {name}
                </h4>
              </Link>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getExpBadge(experienceLevel)}`}>
                {experienceLevel}
              </span>
            </div>
          </div>

          {matchScore > 0 && (
            <MatchScoreBadge score={matchScore} matchCount={overlappingSkills.length} />
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Skills */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => {
              const isMatch = overlappingSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <SkillTag
                  key={skill}
                  name={skill}
                  size="sm"
                  isHighlight={isMatch}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Social Links & Action */}
      <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="GitHub Profile"
            >
              <Code2 className="w-4 h-4" />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="LinkedIn Profile"
            >
              <Share2 className="w-4 h-4" />
            </a>
          )}
          {portfolioUrl && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="Portfolio Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>

        {onInvite ? (
          <button
            onClick={() => onInvite(user)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            Invite Teammate
          </button>
        ) : (
          <Link
            to={`/users/${id}`}
            className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            View Profile <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
